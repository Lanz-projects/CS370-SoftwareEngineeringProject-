import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navigationbar from './components/Navigationbar'; 
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import RideListing from './pages/RideListing';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

function App() {
  return (
    <>
      <Navigationbar /> {/* Ensure the navbar is always visible */}
      <Routes>
        <Route path = '/' element={<Home />} />
        <Route path = '/signup' element={<Signup />} />
        <Route path = '/login' element={<Login />} />
        <Route path = '/profile' element={<Profile />} />
        <Route path = '/dashboard' element={<Dashboard />} />
        <Route path = '/ridelistings' element={<RideListing />} />
        <Route path = '/settings' element={<Settings />} />
        <Route path = '/notifications' element={<Notifications />} />
      </Routes>
    </>
  );
}

export default App;