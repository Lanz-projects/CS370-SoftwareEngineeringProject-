import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import RideListing from './pages/RideListing';
import Settings from './pages/Settings';
import Notfications from './pages/Notifications';
import Navigationbar from './modules/Navigationbar';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navigationbar at the top */}
      <Navigationbar />

      {/* Main content area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/ridelistings' element={<RideListing />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/notifications' element={<Notfications />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;