import {Navigate, Outlet} from 'react-router-dom'
import {useSelector} from 'react-redux'
import React from 'react'

const PrivateRoute = () => {
    const {adminInfo} = useSelector((state) => state.auth);


  return adminInfo ? <Outlet/> : <Navigate to ="/admin/login"/>;
}

export default PrivateRoute
