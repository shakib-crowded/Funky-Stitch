import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Button,
  Row,
  Col,
  Table,
  Image,
  ListGroup,
} from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
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
  const [basePrice, setBasePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [variants, setVariants] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');

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
        basePrice,
        discount,
        image,
        images,
        brand,
        category,
        description,
        features,
        specifications,
        variants,
        availableSizes,
        availableColors,
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
      setBasePrice(product.basePrice);
      setDiscount(product.discount);
      setImage(product.image);
      setImages(product.images || []);
      setBrand(product.brand);
      setCategory(product.category);
      setDescription(product.description);
      setFeatures(product.features || []);
      setSpecifications(product.specifications || []);
      setVariants(product.variants || []);
      setAvailableSizes(product.availableSizes || []);
      setAvailableColors(product.availableColors || []);
    }
  }, [product]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    // Add color to formData if selected
    if (selectedColor) {
      formData.append('color', selectedColor);
    }

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);

      if (selectedColor) {
        // Add to images array with color info
        setImages([...images, { url: res.image, color: selectedColor }]);
      } else {
        // Set as main image if no color selected
        setImage(res.image);
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const uploadMultipleFilesHandler = async (e) => {
    if (!selectedColor) {
      toast.error('Please select a color first');
      return;
    }

    const files = Array.from(e.target.files);
    const newImages = [...images];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('color', selectedColor);

        const res = await uploadProductImage(formData).unwrap();
        newImages.push({ url: res.image, color: selectedColor });
      }

      setImages(newImages);
      toast.success('Images uploaded successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const removeImageHandler = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const setMainImageHandler = (url) => {
    setImage(url);
  };

  const addVariantHandler = () => {
    setVariants([
      ...variants,
      {
        size: availableSizes[0] || 's',
        color: availableColors[0] || 'black',
        stock: 0,
        price: basePrice,
      },
    ]);
  };

  const removeVariantHandler = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantHandler = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const addColorHandler = () => {
    const color = prompt('Enter a new color:');
    if (color && !availableColors.includes(color)) {
      setAvailableColors([...availableColors, color]);
    }
  };

  const removeColorHandler = (color) => {
    setAvailableColors(availableColors.filter((c) => c !== color));
    // Also remove images associated with this color
    setImages(images.filter((img) => img.color !== color));
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
            {/* Basic Product Info */}
            <Row>
              <Col md={8}>
                <Form.Group controlId='name' className='mb-3'>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId='price' className='mb-3'>
                  <Form.Label>Base Price</Form.Label>
                  <Form.Control
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='Enter base price'
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                  />
                </Form.Group>

                <Form.Group controlId='discount' className='mb-3'>
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control
                    type='number'
                    step='1'
                    min='0'
                    max='100'
                    placeholder='Enter discount percentage'
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </Form.Group>

                <Form.Group controlId='description' className='mb-3'>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={3}
                    placeholder='Enter description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId='mainImage' className='mb-3'>
                  <Form.Label>Main Product Image</Form.Label>
                  {image && (
                    <Image src={image} alt={name} fluid className='mb-2' />
                  )}
                  <Form.Control type='file' onChange={uploadFileHandler} />
                  {loadingUpload && <Loader />}
                </Form.Group>
              </Col>
            </Row>

            {/* Variant Images Section */}
            <Row className='mb-4'>
              <Col>
                <Form.Group controlId='variantImages'>
                  <Form.Label>Variant Images</Form.Label>

                  <div className='d-flex align-items-center mb-3'>
                    <Form.Select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      style={{ width: '200px' }}
                    >
                      <option value=''>Select a color</option>
                      {availableColors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </Form.Select>
                    <Button
                      variant='light'
                      onClick={addColorHandler}
                      className='ms-2'
                    >
                      + Add Color
                    </Button>
                  </div>

                  {selectedColor && (
                    <>
                      <Form.Control
                        type='file'
                        multiple
                        onChange={uploadMultipleFilesHandler}
                        className='mb-3'
                      />
                      <ListGroup>
                        {images
                          .filter((img) => img.color === selectedColor)
                          .map((img, index) => (
                            <ListGroup.Item key={index}>
                              <Row className='align-items-center'>
                                <Col xs={2}>
                                  <Image src={img.url} thumbnail />
                                </Col>
                                <Col>{img.color}</Col>
                                <Col xs={3}>
                                  <Button
                                    variant={
                                      image === img.url ? 'success' : 'light'
                                    }
                                    onClick={() => setMainImageHandler(img.url)}
                                    disabled={image === img.url}
                                  >
                                    {image === img.url
                                      ? 'Main Image'
                                      : 'Set as Main'}
                                  </Button>
                                </Col>
                                <Col xs={1}>
                                  <Button
                                    variant='danger'
                                    onClick={() =>
                                      removeImageHandler(
                                        images.findIndex(
                                          (i) => i.url === img.url
                                        )
                                      )
                                    }
                                  >
                                    <FaTrash />
                                  </Button>
                                </Col>
                              </Row>
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    </>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Brand and Category */}
            <Row className='mb-3'>
              <Col md={6}>
                <Form.Group controlId='brand'>
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter brand'
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='category'>
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter category'
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Features and Specifications */}
            <Form.Group controlId='features' className='mb-3'>
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
                      .map((f) => (f.trim() === '' ? '' : f))
                      .filter((f, i, arr) => f !== '' || i === arr.length - 1)
                  )
                }
              />
            </Form.Group>

            <Form.Group controlId='specifications' className='mb-3'>
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
                    <FaTrash />
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

            {/* Available Sizes and Colors */}
            <Row className='mb-3'>
              <Col md={6}>
                <Form.Group controlId='availableSizes'>
                  <Form.Label>Available Sizes</Form.Label>
                  <div className='d-flex flex-wrap gap-2'>
                    {['s', 'm', 'l', 'xl'].map((size) => (
                      <Form.Check
                        key={size}
                        type='checkbox'
                        id={`size-${size}`}
                        label={size.toUpperCase()}
                        checked={availableSizes.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAvailableSizes([...availableSizes, size]);
                          } else {
                            setAvailableSizes(
                              availableSizes.filter((s) => s !== size)
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='availableColors'>
                  <Form.Label>Available Colors</Form.Label>
                  <div className='d-flex flex-wrap gap-2'>
                    {availableColors.map((color) => (
                      <div
                        key={color}
                        className='d-flex align-items-center bg-light p-2 rounded'
                      >
                        <span>{color}</span>
                        <Button
                          variant='danger'
                          size='sm'
                          onClick={() => removeColorHandler(color)}
                          className='ms-2'
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* Variants Management */}
            <Form.Group controlId='variants' className='mb-4'>
              <Form.Label>Product Variants</Form.Label>
              <Button
                variant='secondary'
                onClick={addVariantHandler}
                className='mb-3'
                disabled={
                  availableSizes.length === 0 || availableColors.length === 0
                }
              >
                Add Variant
              </Button>

              {variants.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Color</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Select
                            value={variant.size}
                            onChange={(e) =>
                              updateVariantHandler(
                                index,
                                'size',
                                e.target.value
                              )
                            }
                          >
                            {availableSizes.map((size) => (
                              <option key={size} value={size}>
                                {size.toUpperCase()}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Select
                            value={variant.color}
                            onChange={(e) =>
                              updateVariantHandler(
                                index,
                                'color',
                                e.target.value
                              )
                            }
                          >
                            {availableColors.map((color) => (
                              <option key={color} value={color}>
                                {color.charAt(0).toUpperCase() + color.slice(1)}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            type='number'
                            step='0.01'
                            min='0'
                            value={variant.price}
                            onChange={(e) =>
                              updateVariantHandler(
                                index,
                                'price',
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type='number'
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariantHandler(
                                index,
                                'stock',
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td>
                          <Button
                            variant='danger'
                            onClick={() => removeVariantHandler(index)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Message variant='info'>No variants added yet</Message>
              )}
            </Form.Group>

            <Button type='submit' variant='primary' className='mt-3'>
              Update Product
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
