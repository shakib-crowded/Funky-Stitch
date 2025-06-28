import { apiSlice } from './apiSlice';
import { ORDERS_URL, PAYPAL_URL } from '../constants';
import { clearCartItems } from './cartSlice';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearCartItems());
        } catch (error) {
          console.error('Order creation failed:', error);
        }
      },
    }),
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
      keepUnusedDataFor: 60,
      transformResponse: (response) => ({
        ...response,
        orderItems: response.orderItems.map((item) => ({
          ...item,
          variant: item.variant || undefined,
          totalPrice: (
            item.price *
            item.qty *
            (1 - item.discount / 100)
          ).toFixed(2),
        })),
      }),
    }),
    getAdminOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}/admin`,
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
      keepUnusedDataFor: 60,
      transformResponse: (response) => ({
        ...response,
        orderItems: response.orderItems.map((item) => ({
          ...item,
          variant: item.variant || undefined,
          totalPrice: (
            item.price *
            item.qty *
            (1 - item.discount / 100)
          ).toFixed(2),
        })),
      }),
    }),
    trackOrder: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/track`,
      }),
      providesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
      ],
      transformResponse: (response) => ({
        ...response,
        orderItems: response.orderItems.map((item) => ({
          ...item,
          image: item.image || '/images/default-product.png',
          variant: item.variant || null,
        })),
        statusHistory: [
          { status: 'Processing', date: response.createdAt },
          ...(response.shippedAt
            ? [{ status: 'Shipped', date: response.shippedAt }]
            : []),
          ...(response.deliveredAt
            ? [{ status: 'Delivered', date: response.deliveredAt }]
            : []),
        ],
      }),
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Orders',
      ],
      async onQueryStarted({ orderId }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedOrder } = await queryFulfilled;
          if (updatedOrder.isPaid) {
            // Stock update logic if needed
          }
        } catch (error) {
          console.error('Payment failed:', error);
        }
      },
    }),
    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
      keepUnusedDataFor: 60,
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
        headers: { 'Cache-Control': 'no-cache' },
      }),
      providesTags: ['Orders'],
      transformResponse: (response) => {
        const ordersArray = response.orders || response || [];
        return ordersArray.map((order) => ({
          ...order,
          orderItems:
            order.orderItems?.map((item) => ({
              ...item,
              product: item.product || null,
              variant: item.variant || null,
              totalPrice: (
                item.price *
                item.qty *
                (1 - item.discount / 100)
              ).toFixed(2),
            })) || [],
        }));
      },
      transformErrorResponse: (response) => ({
        status: response.status,
        data: response.data,
        message: response.data?.message || 'Failed to fetch orders',
      }),
      keepUnusedDataFor: 0,
    }),
    getOrders: builder.query({
      query: ({ page = 1, pageSize = 10, status, sort, keyword } = {}) => ({
        url: ORDERS_URL,
        params: { page, pageSize, status, sort, keyword },
      }),
      providesTags: ['Orders'],
      keepUnusedDataFor: 30,
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
        'Orders',
      ],
    }),
    shipOrder: builder.mutation({
      query: ({ orderId, trackingNumber, carrier }) => ({
        url: `${ORDERS_URL}/${orderId}/ship`,
        method: 'PUT',
        body: { trackingNumber, carrier },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Orders',
      ],
    }),
    cancelOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `${ORDERS_URL}/${orderId}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
        'Orders',
      ],
      async onQueryStarted({ orderId }, { dispatch, queryFulfilled }) {
        try {
          const { data: cancelledOrder } = await queryFulfilled;
          // Stock restoration logic if needed
        } catch (error) {
          console.error('Order cancellation failed:', error);
        }
      },
    }),
    returnOrder: builder.mutation({
      query: ({ orderId, reason, items }) => ({
        url: `${ORDERS_URL}/${orderId}/return`,
        method: 'PUT',
        body: { reason, items },
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
        'Orders',
      ],
    }),
    createOrderFromCart: builder.mutation({
      query: (cart) => {
        const orderItems = cart.cartItems.map((item) => ({
          product: item.productId,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          discount: item.discount,
          variant: item.variant,
          basePrice: item.variant ? item.variant.price : item.price,
          brand: item.brand,
          category: item.category,
        }));

        return {
          url: ORDERS_URL,
          method: 'POST',
          body: {
            orderItems,
            shippingAddress: cart.shippingAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            taxPrice: cart.taxPrice,
            shippingPrice: cart.shippingPrice,
            totalPrice: cart.totalPrice,
            discountAmount: cart.discountAmount,
          },
        };
      },
      invalidatesTags: ['Order'],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders'],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `${ORDERS_URL}/${orderId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Orders',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useGetAdminOrderDetailsQuery,
  useTrackOrderQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useReturnOrderMutation,
  useCreateOrderFromCartMutation,
  useDeleteOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApiSlice;
