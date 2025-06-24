import { apiSlice } from './apiSlice';
import { ORDERS_URL, PAYPAL_URL } from '../constants';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order'],
    }),
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
      keepUnusedDataFor: 5,
    }),
    trackOrder: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/track/${orderId}`,
      }),
      providesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
      ],
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
      ],
    }),
    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      providesTags: ['Orders'],
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      providesTags: ['Orders'],
      keepUnusedDataFor: 5,
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
      query: ({ orderId, trackingData }) => ({
        url: `${ORDERS_URL}/${orderId}/ship`,
        method: 'PUT',
        body: trackingData,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Orders',
      ],
    }),
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
        'Orders',
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useTrackOrderQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
} = orderApiSlice;
