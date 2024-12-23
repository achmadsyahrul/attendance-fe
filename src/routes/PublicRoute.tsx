import React from 'react'
import { useCookies } from 'react-cookie'
import { Navigate } from 'react-router-dom'

interface PublicRouteProps {
  children: React.ReactElement
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const [cookies] = useCookies(['token'])
  const isAuthenticated = !!cookies.token

  return isAuthenticated ? <Navigate to="/" /> : children
}

export default PublicRoute
