import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import SearchBox from './SearchBox';
import logo from '../assets/logo.jpg';
import { resetCart } from '../slices/cartSlice';
import '../assets/styles/Header.css'; // Create this CSS file for custom styles

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const cartItemCount = cartItems.reduce((a, c) => a + c.qty, 0);

  return (
    <header className='sticky-top'>
      <Navbar
        bg='white'
        variant='light'
        expand='lg'
        collapseOnSelect
        className='modern-navbar'
      >
        <Container>
          <Navbar.Brand as={Link} to='/' className='d-flex align-items-center'>
            <img src={logo} alt='Funky Stitch' className='navbar-logo' />
          </Navbar.Brand>

          <div className='d-lg-none mobile-search'>
            <SearchBox mobile />
          </div>

          <Navbar.Toggle aria-controls='basic-navbar-nav' className='border-0'>
            <span className='navbar-toggler-icon'></span>
          </Navbar.Toggle>

          <Navbar.Collapse id='basic-navbar-nav'>
            <div className='desktop-search w-100 my-2 my-lg-0'>
              <SearchBox />
            </div>

            <Nav className='ms-auto align-items-lg-center'>
              <Nav.Link
                as={Link}
                to='/cart'
                className='position-relative mx-2 px-3 py-2 cart-link'
              >
                <FaShoppingCart className='me-1' />
                <span className=' d-lg-inline'>Cart</span>
                {cartItemCount > 0 && (
                  <Badge
                    pill
                    bg='danger'
                    className='position-absolute top-0 start-100 translate-middle'
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Nav.Link>

              {userInfo ? (
                <NavDropdown
                  title={
                    <div className='d-inline-flex align-items-center'>
                      <span className='user-avatar me-1'>
                        {userInfo.name.charAt(0).toUpperCase()}
                      </span>
                      <span className=' d-lg-inline'>{userInfo.name}</span>
                    </div>
                  }
                  id='username'
                  align='end'
                  className='mx-2 user-dropdown'
                >
                  <NavDropdown.Item
                    as={Link}
                    to='/profile'
                    className='dropdown-item'
                  >
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    onClick={logoutHandler}
                    className='dropdown-item'
                  >
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link} to='/login' className='mx-2 px-3 py-2'>
                  <FaUser className='me-1' />
                  <span className=' d-lg-inline'>Sign In</span>
                </Nav.Link>
              )}

              {userInfo && userInfo.isAdmin && (
                <NavDropdown
                  title='Admin'
                  id='adminmenu'
                  align='end'
                  className='mx-2 admin-dropdown'
                >
                  <NavDropdown.Item
                    as={Link}
                    to='/admin/productlist'
                    className='dropdown-item'
                  >
                    Products
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to='/admin/orderlist'
                    className='dropdown-item'
                  >
                    Orders
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to='/admin/userlist'
                    className='dropdown-item'
                  >
                    Users
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
