import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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
  const [longitude, setLongitude] = useState<number | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('PRESENT')
  const [photo, setPhoto] = useState<File | null>(null)
  const [startDate, setStartDate] = useState('2024-01-01')
  const [endDate, setEndDate] = useState('2024-12-31')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [limit, setLimit] = useState(5)
  const [offset, setOffset] = useState(0)
  const [cookies] = useCookies(['token', 'user'])
  const token = cookies.token
  const user = cookies.user
  const baseUrl = process.env.REACT_APP_API_BASE_URL
  const apiGeoUrl = process.env.REACT_APP_API_GEO_URL
  const key = process.env.REACT_APP_API_GEO_KEY

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (longitude === null || latitude === null) {
      alert('Please allow location access to mark attendance')
      return
    }

    const formData = new FormData()
    formData.append('longitude', longitude.toString())
    formData.append('latitude', latitude.toString())
    formData.append('location', location)
    formData.append('status', status)
    if (photo) {
      formData.append('photo', photo)
    }

    mutation.mutate(formData)
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPhoto(event.target.files[0])
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLongitude(longitude)
          setLatitude(latitude)

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
              setLocation(`${data[0].name}, ${data[0].state}, ${data[0].country}.`)
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
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <button type="button" onClick={getLocation} className="bg-blue-500 text-white px-4 py-2 rounded">
              Get Location
            </button>
            {longitude && latitude && (
              <p>
                Longitude: {longitude}, Latitude: {latitude}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              //   disabled={longitude !== null && latitude !== null}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
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
              <label className="block text-gray-700">Timezone</label>
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
