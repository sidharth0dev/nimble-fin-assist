'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Save } from 'lucide-react'

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
]

interface User {
  id: string
  name: string | null
  email: string
  currency: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch user settings
  const fetchUserSettings = async () => {
    try {
      // For now, using a hardcoded userId - in a real app, this would come from auth
      const userId = 'user-1' // This should be replaced with actual user ID from auth
      const response = await fetch(`/api/settings?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSelectedCurrency(data.user.currency || 'USD')
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserSettings()
  }, [])

  const handleSaveSettings = async () => {
    if (!user) return

    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: selectedCurrency,
          userId: user.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        alert('Settings saved successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const getCurrencyInfo = (code: string) => {
    return currencies.find(c => c.code === code) || currencies[0]
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading settings...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-gray-400">Manage your application preferences.</p>
          </div>
        </div>

        {/* Settings Form */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">General Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Configure your application preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Currency Selection */}
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-white">
                Default Currency
              </Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{currency.symbol}</span>
                        <span>{currency.name}</span>
                        <span className="text-gray-400">({currency.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-400">
                This will be used to format all monetary values throughout the application.
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-medium mb-2">Preview</h4>
              <div className="space-y-1 text-sm">
                <div className="text-gray-300">
                  Sample amount: {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: selectedCurrency,
                  }).format(1234.56)}
                </div>
                <div className="text-gray-400">
                  Currency: {getCurrencyInfo(selectedCurrency).name} ({selectedCurrency})
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveSettings}
                disabled={saving || selectedCurrency === user?.currency}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        {user && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-400">Name</Label>
                  <p className="text-white">{user.name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Current Currency</Label>
                  <p className="text-white">
                    {getCurrencyInfo(user.currency).name} ({user.currency})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


