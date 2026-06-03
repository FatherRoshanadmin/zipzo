import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import BookDetail from './pages/BookDetail';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;