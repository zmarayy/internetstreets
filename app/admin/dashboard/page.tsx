'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  ShoppingCart, 
  Download, 
  Calendar,
  TrendingUp,
  LogOut,
  RefreshCw
} from 'lucide-react'

interface SalesData {
  slug: string
  count: number
  revenue: number
  lastSale: string
}

interface DashboardData {
  sales: SalesData[]
  totals: {
    totalSales: number
    totalRevenue: number
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const router = useRouter()

  const dateFilters = [
    { key: 'today', label: 'Today' },
    { key: '7days', label: 'Last 7 days' },
    { key: '30days', label: 'Last 30 days' },
    { key: 'all', label: 'All Time' }
  ]

  const fetchSalesData = async (filter: string = dateFilter) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/sales?filter=${filter}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        if (result.message) {
          setWarning(result.message)
          setError('')
        }
      } else {
        setError(result.error || 'Failed to fetch sales data')
        setWarning('')
      }
    } catch (error) {
      setError('Failed to fetch sales data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSalesData()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleExportCSV = () => {
    if (!data) return

    const csvContent = [
      ['Service', 'Sales Count', 'Revenue (£)', 'Last Sale Date'],
      ...data.sales.map(sale => [
        sale.slug,
        sale.count.toString(),
        (sale.revenue / 100).toFixed(2),
        new Date(sale.lastSale).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `internet-streets-sales-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getServiceDisplayName = (slug: string) => {
    const serviceNames: Record<string, string> = {
      'fbi-file': 'FBI File Generator',
      'nsa-surveillance': 'NSA Surveillance Log',
      'criminal-record': 'Government Criminal Record',
      'universal-credit': 'Universal Credit Assessment',
      'credit-score': 'Trap Credit Score Report',
      'payslip': 'Fake Payslip Generator',
      'job-rejection': 'Job Application Rejection Letter',
      'rent-reference': 'Rent Reference Letter',
      'school-behaviour': 'School Behaviour Record',
      'college-degree': 'Fake College Degree'
    }
    return serviceNames[slug] || slug
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white">
        <div className="text-center">
          <RefreshCw className="animate-spin text-neon-green mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold text-neon-green mb-2">Loading Dashboard...</h1>
          <p className="text-gray-400">Fetching sales data from Stripe</p>
        </div>
      </div>
    )
  }

  // Remove the error blocking return - let the page render normally

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neon-green">Sales Dashboard</h1>
              <p className="text-gray-400 mt-1">Internet Streets Admin Panel</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {warning && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <p className="text-yellow-400 text-sm">{warning}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => fetchSalesData()}
              className="text-red-400 hover:text-red-300 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center">
              <ShoppingCart className="text-neon-blue" size={32} />
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-white">{data?.totals.totalSales || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center">
              <DollarSign className="text-neon-green" size={32} />
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-neon-green">
                  £{data ? (data.totals.totalRevenue / 100).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              {dateFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    setDateFilter(filter.key)
                    fetchSalesData(filter.key)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === filter.key
                      ? 'bg-neon-green text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 bg-neon-blue hover:bg-neon-blue/80 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={20} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border">
            <h2 className="text-xl font-bold text-white">Sales by Service</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sales Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Sale
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data?.sales.map((sale, index) => (
                  <tr key={sale.slug} className={index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-900/50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {getServiceDisplayName(sale.slug)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {sale.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-neon-green">
                      £{(sale.revenue / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(sale.lastSale).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data?.sales.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No sales data found</h3>
            <p className="text-gray-400">Try adjusting your date filter or check back later.</p>
          </div>
        )}
      </div>
    </div>
  )
}
