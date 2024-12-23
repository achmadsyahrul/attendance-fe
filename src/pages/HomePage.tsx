import React from 'react'
import Navbar from '../components/Navbar'

const HomePage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-4">
        <h1 className="text-2xl font-bold">Welcome to the Home Page!</h1>
      </div>
    </div>
  )
}

export default HomePage
