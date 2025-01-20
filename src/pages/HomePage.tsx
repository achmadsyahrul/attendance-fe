import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useForm } from 'react-hook-form'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Webcam from 'react-webcam'
import Navbar from '../components/Navbar'

const timezones = [
  { label: 'GMT-12:00', value: 'Etc/GMT+12' },
  { label: 'GMT-11:00', value: 'Etc/GMT+11' },
  { label: 'GMT-10:00', value: 'Etc/GMT+10' },
  { label: 'GMT-09:00', value: 'Etc/GMT+9' },
  { label: 'GMT-08:00', value: 'Etc/GMT+8' },
  { label: 'GMT-07:00', value: 'Etc/GMT+7' },
  { label: 'GMT-06:00', value: 'Etc/GMT+6' },
  { label: 'GMT-05:00', value: 'Etc/GMT+5' },
  { label: 'GMT-04:00', value: 'Etc/GMT+4' },
  { label: 'GMT-03:00', value: 'Etc/GMT+3' },
  { label: 'GMT-02:00', value: 'Etc/GMT+2' },
  { label: 'GMT-01:00', value: 'Etc/GMT+1' },
  { label: 'GMT+00:00', value: 'Etc/GMT' },
  { label: 'GMT+01:00', value: 'Etc/GMT-1' },
  { label: 'GMT+02:00', value: 'Etc/GMT-2' },
  { label: 'GMT+03:00', value: 'Etc/GMT-3' },
  { label: 'GMT+04:00', value: 'Etc/GMT-4' },
  { label: 'GMT+05:00', value: 'Etc/GMT-5' },
  { label: 'GMT+06:00', value: 'Etc/GMT-6' },
  { label: 'GMT+07:00', value: 'Etc/GMT-7' },
  { label: 'GMT+08:00', value: 'Etc/GMT-8' },
  { label: 'GMT+09:00', value: 'Etc/GMT-9' },
  { label: 'GMT+10:00', value: 'Etc/GMT-10' },
  { label: 'GMT+11:00', value: 'Etc/GMT-11' },
  { label: 'GMT+12:00', value: 'Etc/GMT-12' },
]

const HomePage: React.FC = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const [startDate, setStartDate] = useState(formatDate(thirtyDaysAgo))
  const [endDate, setEndDate] = useState(formatDate(today))
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [limit, setLimit] = useState(5)
  const [offset, setOffset] = useState(0)
  const [isOpenCam, setIsOpenCam] = useState(false)
  const [cookies] = useCookies(['token', 'user'])
  const token = cookies.token
  const user = cookies.user
  const baseUrl = process.env.REACT_APP_API_BASE_URL
  const apiGeoUrl = process.env.REACT_APP_API_GEO_URL
  const key = process.env.REACT_APP_API_GEO_KEY

  const webcamRef = useRef<Webcam>(null)
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(null)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    setImgSrc(imageSrc)
    if (imageSrc) {
      const imageBlob = b64toBlob(imageSrc, 'image/webp')
      console.log(imageBlob)
      setValue('photo', imageBlob)
    }
  }, [webcamRef])

  const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    const [header, base64Data] = b64Data.split(',')
    const byteCharacters = atob(base64Data)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize)

      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    const blob = new Blob(byteArrays, { type: contentType })
    return blob
  }
  type FormValues = {
    location: string
    longitude: string | number
    latitude: string | number
    photo: Blob
    status: string
  }
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormValues>()

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to mark attendance')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Attendance marked successfully!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to mark attendance')
    },
  })

  const handleSubmitForm = async (data: any) => {
    if (!data.longitude || !data.latitude) {
      toast.error('Please click get location for set your location')
      return
    }

    const formData = new FormData()
    formData.append('longitude', data.longitude.toString())
    formData.append('latitude', data.latitude.toString())
    formData.append('location', data.location)
    formData.append('status', data.status)
    if (data.photo) {
      formData.append('photo', data.photo)
    }

    mutation.mutate(formData)
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setValue('longitude', longitude)
          setValue('latitude', latitude)

          if (!key) {
            alert('API key is missing')
            return
          }

          try {
            const params = new URLSearchParams({
              lat: latitude.toString(),
              lon: longitude.toString(),
              limit: '1',
              appId: key,
            })

            const response = await fetch(`${apiGeoUrl}?${params.toString()}`)
            const data = await response.json()

            if (data.length > 0) {
              setValue('location', `${data[0].name}, ${data[0].state}, ${data[0].country}.`)
            } else {
              alert('Location not found')
            }
          } catch (error) {
            console.error('Error fetching location:', error)
            alert('Error fetching location. Please try again.')
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Error getting location. Please try again.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  const {
    data: attendanceData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['attendanceReport', startDate, endDate, timezone],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate,
        endDate,
        timezone,
        limit: limit.toString(),
        offset: offset.toString(),
      })

      const response = await fetch(`${process.env.REACT_APP_API_URL}/attendance/report?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch attendance report')
      }

      return response.json()
    },
  })

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setOffset(0)
    refetch()
  }

  useEffect(() => {
    refetch()
  }, [offset, refetch])

  const handleNextPage = () => {
    setOffset((prevOffset) => prevOffset + limit)
  }

  const handlePreviousPage = () => {
    setOffset((prevOffset) => Math.max(prevOffset - limit, 0))
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-4">
        <h1 className="text-2xl font-bold">Hello, {user.profile?.firstName ?? user.profile.lastName}</h1>
        <form onSubmit={handleSubmit(handleSubmitForm)} className="mt-4">
          <div className="mb-4">
            <button type="button" onClick={getLocation} className="bg-blue-500 text-white px-4 py-2 rounded">
              Get Location
            </button>
            {watch('longitude') && watch('latitude') && (
              <p>
                Longitude: {watch('longitude')}, Latitude: {watch('latitude')}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Location</label>
            <input
              type="text"
              defaultValue={watch('location')}
              {...register('location', { required: 'Location is required' })}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {errors.location && <p className="mt-2 text-sm text-red-500">{errors.location.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Status</label>
            <select
              defaultValue={'PRESENT'}
              {...register('status', { required: 'Status is required' })}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
              <option value="SICK">SICK</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Photo</label>
            {isOpenCam ? (
              imgSrc ? (
                <img src={imgSrc} alt="webcam" />
              ) : (
                <>
                  <Webcam height={600} width={600} ref={webcamRef} />
                  <div className="btn-container">
                    <button type="button" className="bg-gray-600 text-white px-4 py-2 rounded my-2" onClick={capture}>
                      Capture photo
                    </button>
                  </div>
                </>
              )
            ) : (
              <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={() => setIsOpenCam(true)}>
                Open Camera
              </button>
            )}
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Mark Attendance
          </button>
        </form>
        <div className="mt-12">
          <h2 className="text-xl font-bold">Attendance Report</h2>
          <form onSubmit={handleFilterSubmit} className="mb-4">
            <div className="mb-4">
              <label className="block text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Set Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Filter
            </button>
          </form>
          {attendanceData && (
            <>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">Date</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Location</th>
                    <th className="py-2">Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.attendance.map((record: any) => (
                    <tr key={record.id}>
                      <td className="border px-4 py-2">{record.timestamp}</td>
                      <td className="border px-4 py-2">{record.status}</td>
                      <td className="border px-4 py-2">{record.location}</td>
                      <td className="border px-4 py-2">
                        <img
                          src={`${baseUrl}/storage/file/${record.photoUrl.split('/').pop()}`}
                          alt="Attendance"
                          className="h-16 w-16 object-cover"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <button
                  onClick={handlePreviousPage}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={offset === 0}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={attendanceData.attendance.length < limit}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default HomePage
