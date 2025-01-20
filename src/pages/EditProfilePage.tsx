import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast, ToastContainer } from 'react-toastify'
import Navbar from '../components/Navbar'

interface UpdateUserFormInputs {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
}

interface UpdateUserResponse {
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

const fetchUserInfo = async (token: string) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/user/info`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info')
  }

  return response.json()
}

const updateUser = async (data: UpdateUserFormInputs, token: string): Promise<UpdateUserResponse> => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/user/update`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Update failed')
  }

  return response.json()
}

const EditProfilePage: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateUserFormInputs>()
  const [cookies] = useCookies(['token'])
  const token = cookies.token

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: () => fetchUserInfo(token),
  })

  useEffect(() => {
    if (userInfo) {
      setValue('firstName', userInfo.data.profile.firstName)
      setValue('lastName', userInfo.data.profile.lastName)
      setValue('email', userInfo.data.email)
      setValue('phone', userInfo.data.profile.phone)
      setValue('address', userInfo.data.profile.address)
    }
  }, [userInfo, setValue])

  const mutation = useMutation<UpdateUserResponse, Error, UpdateUserFormInputs>({
    mutationFn: (data) => updateUser(data, token),
    onSuccess: () => {
      toast.success('Profile updated successfully!')
    },
    onError: (error) => {
      toast.error('Failed to update profile')
    },
  })

  const onSubmit: SubmitHandler<UpdateUserFormInputs> = (data) => {
    mutation.mutate(data)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading user info</div>
  }

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center mx-auto mt-8">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-xl">Edit Profile</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              {...register('firstName', { required: 'First name is required' })}
              className="w-full p-2 mt-4 border border-gray-300 rounded"
              placeholder="First Name"
            />
            {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
            <input
              type="text"
              {...register('lastName', { required: 'Last name is required' })}
              className="w-full p-2 mt-4 border border-gray-300 rounded"
              placeholder="Last Name"
            />
            {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full p-2 mt-4 border border-gray-300 rounded"
              placeholder="Email"
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            <input
              type="text"
              {...register('phone')}
              className="w-full p-2 mt-4 border border-gray-300 rounded"
              placeholder="Phone"
            />
            <input
              type="text"
              {...register('address')}
              className="w-full p-2 mt-4 border border-gray-300 rounded"
              placeholder="Address"
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 mt-4 rounded">
              Save
            </button>
            {mutation.isError && <p className="text-red-500">Error: {mutation.error.message}</p>}
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default EditProfilePage
