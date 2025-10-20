import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string | null
  email: string
  currency: string
}

export const useCurrency = () => {
  const [currency, setCurrency] = useState<string>('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserCurrency = async () => {
      try {
        // For now, using a hardcoded userId - in a real app, this would come from auth
        const userId = 'user-1' // This should be replaced with actual user ID from auth
        const response = await fetch(`/api/settings?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setCurrency(data.user.currency || 'USD')
        }
      } catch (error) {
        console.error('Error fetching user currency:', error)
        // Fallback to USD if there's an error
        setCurrency('USD')
      } finally {
        setLoading(false)
      }
    }

    fetchUserCurrency()
  }, [])

  return { currency, loading }
}


