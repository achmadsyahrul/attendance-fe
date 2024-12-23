import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { useCookies } from 'react-cookie'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'

interface LoginFormInputs {
  email: string
  password: string
}

interface LoginResponse {
  message: string
  user: {
    id: string
    email: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    profile: {
      id: string
      userId: string
      firstName: string
      lastName: string
      phone: string | null
      address: string | null
      photoUrl: string | null
      createdAt: string
      updatedAt: string
      deletedAt: string | null
    }
  }
  token: string
}

const login = async ({ email, password }: LoginFormInputs): Promise<LoginResponse> => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [_cookie, setCookie] = useCookies()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>()
  const mutation = useMutation<LoginResponse, Error, LoginFormInputs>({
    mutationFn: login,
    onSuccess: (data) => {
      setCookie('token', data.token, { maxAge: 3600 })
      setCookie('user', JSON.stringify(data.user), { maxAge: 3600 })
      toast.success('Login successful!')
      setTimeout(() => {
        navigate('/')
      }, 2000)
    },
    onError: () => {
      toast.error('Login failed')
    },
  })

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    mutation.mutate(data)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl mb-4">Login</h2>
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
          Login
        </button>
        <div className="mt-4">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500">
              Register here
            </Link>
          </p>
        </div>
      </form>
      <ToastContainer />
    </div>
  )
}

export default LoginPage
