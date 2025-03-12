import React, { Profiler, useEffect, useState} from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import RideListing from './pages/RideListing'
import Settings from './pages/Settings'
import Notfications from './pages/Notifications'
import Navigationbar from './components/Navigationbar'


function App() {
  return(
    <header>
      {/* "Handles all the page routing" */}
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/signup' element={<Signup />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/profile' element={<Profile />}/>
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path='/ridelistings' element={<RideListing />}/>
        <Route path='/settings' element={<Settings />}/>
        <Route path='/notifications' element={<Notfications />}/>
      </Routes>
      <Navigationbar></Navigationbar>
    </header>
  );
}

export default App
