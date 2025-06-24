import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import '../assets/styles/SearchBox.css';

const SearchBox = ({ mobile = false }) => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();
  const [keyword, setKeyword] = useState(urlKeyword || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setKeyword(urlKeyword || '');
  }, [urlKeyword]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword.trim()}`);
    } else {
      navigate('/');
    }
  };

  const clearSearch = () => {
    setKeyword('');
    if (mobile) {
      navigate('/');
    }
  };

  return (
    <Form
      onSubmit={submitHandler}
      className={`search-form ${mobile ? 'mobile-search' : 'desktop-search'}`}
    >
      <InputGroup
        className={`search-input-group ${isFocused ? 'focused' : ''}`}
      >
        <Form.Control
          type='text'
          name='q'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder='Search products...'
          className='search-input'
          aria-label='Search products'
        />
        {keyword && (
          <Button
            variant='link'
            className='clear-button'
            onClick={clearSearch}
            aria-label='Clear search'
          >
            <FaTimes />
          </Button>
        )}
        <Button
          type='submit'
          variant='primary'
          className='search-button'
          aria-label='Submit search'
        >
          <FaSearch />
          {!mobile && <span className='search-text'>Search</span>}
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBox;
