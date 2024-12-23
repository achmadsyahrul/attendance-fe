import React from 'react'
import { useCookies } from 'react-cookie'
import { Navigate } from 'react-router-dom'

interface PrivateRouteProps {
  children: React.ReactElement
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [cookies] = useCookies(['token'])
  const isAuthenticated = !!cookies.token

  return isAuthenticated ? children : <Navigate to="/login" />
}

export default PrivateRoute
