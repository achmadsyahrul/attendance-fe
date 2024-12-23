import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'

interface RegisterFormInputs {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface RegisterResponse {
  message: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  token: string
}

const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
}: RegisterFormInputs): Promise<RegisterResponse> => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}

const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>()
  const navigate = useNavigate()
  const mutation = useMutation<RegisterResponse, Error, RegisterFormInputs>({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Registration successful!')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    },
    onError: () => {
      toast.error('Registration failed')
    },
  })

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    mutation.mutate(data)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl mb-4">Register</h2>
        <input
          type="text"
          {...register('firstName', { required: 'First name is required' })}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          placeholder="First Name"
        />
        {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
        <input
          type="text"
          {...register('lastName', { required: 'Last name is required' })}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          placeholder="Last Name"
        />
        {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
        <input
          type="email"
          {...register('email', { required: 'Email is required' })}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          placeholder="Email"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        <input
          type="password"
          {...register('password', { required: 'Password is required' })}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          placeholder="Password"
        />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Register
        </button>
        <div className="mt-4">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500">
              Login here
            </Link>
          </p>
        </div>
      </form>
      <ToastContainer />
    </div>
  )
}

export default RegisterPage
