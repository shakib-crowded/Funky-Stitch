import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [discount, setDisount] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState([]);
  const [specifications, setSpecifications] = useState([]);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({
        productId,
        name,
        price,
        discount,
        image,
        brand,
        category,
        description,
        countInStock,
        features, // Add this
        specifications, // Add this
      }).unwrap();
      toast.success('Product updated');
      refetch();
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setDisount(product.discount);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setDescription(product.description);
      setFeatures(product.features || []);
      setSpecifications(product.specifications || [{ label: '', value: '' }]);
    }
  }, [product]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to='/admin/productlist' className='btn btn-light my-3'>
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit Product</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error.data.message}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='name'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='price'>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='disount'>
              <Form.Label>Discount</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter discount'
                value={discount}
                onChange={(e) => setDisount(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='image'>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter image url'
                value={image}
                onChange={(e) => setImage(e.target.value)}
              ></Form.Control>
              <Form.Control
                label='Choose File'
                onChange={uploadFileHandler}
                type='file'
              ></Form.Control>
              {loadingUpload && <Loader />}
            </Form.Group>

            <Form.Group controlId='brand'>
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter brand'
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='countInStock'>
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter countInStock'
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='category'>
              <Form.Label>Category</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter category'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='description'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <Form.Group controlId='features'>
              <Form.Label>Features (one per line)</Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                placeholder='Enter one feature per line'
                value={features.join('\n')}
                onChange={(e) =>
                  setFeatures(
                    e.target.value
                      .split('\n')
                      // Only trim the line if it's completely empty
                      .map((f) => (f.trim() === '' ? '' : f))
                      // Remove completely empty lines (but preserve lines with just spaces)
                      .filter(
                        (f, i, arr) =>
                          f !== '' ||
                          // Keep the last line if it's empty (for better UX while typing)
                          i === arr.length - 1
                      )
                  )
                }
              />
            </Form.Group>

            <Form.Group controlId='specifications'>
              <Form.Label>Specifications</Form.Label>
              {specifications.map((spec, index) => (
                <div key={index} className='d-flex gap-2 mb-2'>
                  <Form.Control
                    type='text'
                    placeholder='Label'
                    value={spec.label}
                    onChange={(e) => {
                      const updatedSpecs = [...specifications];
                      updatedSpecs[index].label = e.target.value;
                      setSpecifications(updatedSpecs);
                    }}
                  />
                  <Form.Control
                    type='text'
                    placeholder='Value'
                    value={spec.value}
                    onChange={(e) => {
                      const updatedSpecs = [...specifications];
                      updatedSpecs[index].value = e.target.value;
                      setSpecifications(updatedSpecs);
                    }}
                  />
                  <Button
                    variant='danger'
                    onClick={() => {
                      setSpecifications(
                        specifications.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <Button
                type='button'
                className='mt-2'
                onClick={() =>
                  setSpecifications([
                    ...specifications,
                    { label: '', value: '' },
                  ])
                }
              >
                Add Specification
              </Button>
            </Form.Group>

            <Button
              type='submit'
              variant='primary'
              style={{ marginTop: '1rem' }}
            >
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
