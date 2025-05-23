import React, { Profiler, useEffect, useState} from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import RideListing from './pages/RideListing'
import TermsAndService from './pages/termsAndService'
import UserExtraInfoForm from './pages/UserExtraInfoForm'
import VehicleForm from './pages/VehicleForm'
import UpdateUserProfile from './pages/UpdateUserProfile'
import VehicleUpdateForm from './pages/VehicleUpdateForm'


function App() {
  return (
    <>
    { /*Handles All Page Routing */ }
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/signup' element={<Signup />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/profile' element={<Profile />}/>
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path='/ridelistings' element={<RideListing />}/>
        <Route path='/terms-and-conditions' element={<TermsAndService />}/>
        <Route path='/extra-userinfo-form' element={<UserExtraInfoForm />}/>
        <Route path='/vehicleform' element={<VehicleForm />}/>
        <Route path='/updateprofile' element={<UpdateUserProfile />}/>
        <Route path='/updatevehicle' element={<VehicleUpdateForm />}/>
      </Routes>
    </>
  );
}

export default App;