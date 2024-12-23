// filepath: /home/inyourash/Han/attendance-fe/src/components/Navbar.tsx
import React from 'react'
import { useCookies } from 'react-cookie'
import { Link, useNavigate } from 'react-router-dom'

const Navbar: React.FC = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['token', 'user'])
  const navigate = useNavigate()

  const handleLogout = async () => {
    const token = cookies.token

    if (token) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Logout failed')
        }

        removeCookie('token')
        removeCookie('user')
        navigate('/login')
      } catch (error) {
        console.error('Error logging out:', error)
      }
    }
  }

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">
          <Link to="/">Attendance App</Link>
        </div>
        <div className="flex space-x-4">
          <Link className="bg-white text-blue-500 px-4 py-2 rounded" to="/edit-profile">
            Edit Profile
          </Link>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
