import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { 
  Filter, Download, Share2, Settings, Plus, 
  TrendingUp, Users, Globe, Smartphone, 
  RefreshCw, Maximize2, Layout
} from 'lucide-react'
import { blink } from '../blink/client'
import type { CustomDashboard, DashboardWidget, DashboardFilter } from '../types/dashboard'

interface ProfessionalDashboardProps {
  userTier: 'free' | 'premium' | 'enterprise'
}

// Data processing functions (defined first)
const processParticipationByCountry = (responses: any[]) => {
  const countryData = responses.reduce((acc, response) => {
    const country = response.country || 'Unknown'
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {})

  return Object.entries(countryData)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10)
}

const processTrendsOverTime = (responses: any[]) => {
  const dailyData = responses.reduce((acc, response) => {
    const date = new Date(response.created_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  return Object.entries(dailyData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

const processCategoryBreakdown = (responses: any[]) => {
  return [
    { category: 'Economic', count: Math.floor(responses.length * 0.3), color: '#E97B47' },
    { category: 'Technology', count: Math.floor(responses.length * 0.25), color: '#2ECC71' },
    { category: 'Health', count: Math.floor(responses.length * 0.2), color: '#3498DB' },
    { category: 'Education', count: Math.floor(responses.length * 0.15), color: '#9B59B6' },
    { category: 'Social', count: Math.floor(responses.length * 0.1), color: '#F39C12' }
  ]
}

const processDemographicInsights = (responses: any[]) => {
  return {
    totalParticipants: responses.length,
    uniqueCountries: new Set(responses.map(r => r.country)).size,
    avgResponsesPerUser: responses.length / new Set(responses.map(r => r.user_id)).size,
    completionRate: 0.87
  }
}

const processRealTimeMetrics = (responses: any[]) => {
  const today = new Date().toISOString().split('T')[0]
  const todayResponses = responses.filter(r => r.created_at.startsWith(today))
  
  return {
    todayResponses: todayResponses.length,
    weeklyGrowth: 0.15,
    monthlyGrowth: 0.32,
    activeCountries: new Set(todayResponses.map(r => r.country)).size
  }
}

const getDefaultLayout = (): DashboardWidget[] => [
  {
    id: 'metrics',
    type: 'metric',
    title: 'Key Metrics',
    position: { x: 0, y: 0, w: 12, h: 2 },
    config: { dataSource: 'realTimeMetrics', filters: {} }
  },
  {
    id: 'participation',
    type: 'chart',
    title: 'Participation by Country',
    position: { x: 0, y: 2, w: 6, h: 4 },
    config: { chartType: 'bar', dataSource: 'participationByCountry', filters: {} }
  },
  {
    id: 'trends',
    type: 'chart',
    title: 'Trends Over Time',
    position: { x: 6, y: 2, w: 6, h: 4 },
    config: { chartType: 'line', dataSource: 'trendsOverTime', filters: {} }
  },
  {
    id: 'categories',
    type: 'chart',
    title: 'Category Breakdown',
    position: { x: 0, y: 6, w: 6, h: 4 },
    config: { chartType: 'pie', dataSource: 'categoryBreakdown', filters: {} }
  }
]

const getDefaultFilters = (): DashboardFilter[] => [
  {
    id: 'timeRange',
    type: 'select',
    field: 'timeRange',
    label: 'Time Range',
    options: [
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
      { value: '90d', label: 'Last 90 days' },
      { value: 'all', label: 'All time' }
    ],
    defaultValue: '30d'
  }
]

export default function ProfessionalDashboard({ userTier }: ProfessionalDashboardProps) {
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([])
  const [activeDashboard, setActiveDashboard] = useState<CustomDashboard | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [timeRange, setTimeRange] = useState('30d')
  const [dashboardData, setDashboardData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load dashboards
  const loadDashboards = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      const result = await blink.db.customDashboards.list({
        where: { user_id: user.id },
        orderBy: { updated_at: 'desc' }
      })
      setDashboards(result)
      if (result.length > 0 && !activeDashboard) {
        setActiveDashboard(result[0])
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error)
    }
  }, [activeDashboard])

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const responses = await blink.db.surveyResponses.list({
        where: {
          ...(timeRange !== 'all' && { 
            created_at: { 
              gte: new Date(Date.now() - parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000).toISOString() 
            } 
          })
        },
        limit: userTier === 'free' ? 100 : userTier === 'premium' ? 1000 : 10000
      })

      const processedData = {
        participationByCountry: processParticipationByCountry(responses),
        trendsOverTime: processTrendsOverTime(responses),
        categoryBreakdown: processCategoryBreakdown(responses),
        demographicInsights: processDemographicInsights(responses),
        realTimeMetrics: processRealTimeMetrics(responses)
      }

      setDashboardData(processedData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [timeRange, userTier])

  useEffect(() => {
    loadDashboards()
  }, [loadDashboards])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Create new dashboard
  const createDashboard = async (name: string, description: string) => {
    try {
      const user = await blink.auth.me()
      const newDashboard: CustomDashboard = {
        id: `dash_${Date.now()}`,
        user_id: user.id,
        name,
        description,
        config: {
          layout: getDefaultLayout(),
          filters: getDefaultFilters(),
          theme: 'african',
          refreshInterval: 300000
        },
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await blink.db.customDashboards.create({
        id: newDashboard.id,
        user_id: newDashboard.user_id,
        name: newDashboard.name,
        description: newDashboard.description,
        config: JSON.stringify(newDashboard.config),
        is_public: newDashboard.is_public,
        created_at: newDashboard.created_at,
        updated_at: newDashboard.updated_at
      })

      setDashboards(prev => [newDashboard, ...prev])
      setActiveDashboard(newDashboard)
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create dashboard:', error)
    }
  }

  const renderWidget = (widget: DashboardWidget) => {
    const data = dashboardData[widget.config.dataSource] || []

    switch (widget.type) {
      case 'metric':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Today's Responses</p>
                    <p className="text-2xl font-bold text-orange-700">{dashboardData.realTimeMetrics?.todayResponses || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Participants</p>
                    <p className="text-2xl font-bold text-green-700">{dashboardData.demographicInsights?.totalParticipants || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Active Countries</p>
                    <p className="text-2xl font-bold text-blue-700">{dashboardData.realTimeMetrics?.activeCountries || 0}</p>
                  </div>
                  <Globe className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Monthly Growth</p>
                    <p className="text-2xl font-bold text-purple-700">+{((dashboardData.realTimeMetrics?.monthlyGrowth || 0) * 100).toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'chart':
        if (widget.config.chartType === 'bar') {
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#E97B47" />
              </BarChart>
            </ResponsiveContainer>
          )
        } else if (widget.config.chartType === 'line') {
          return (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2ECC71" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )
        } else if (widget.config.chartType === 'pie') {
          return (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ category, count }) => `${category}: ${count}`}
                >
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )
        }
        break

      default:
        return <div>Widget type not supported</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                Professional Dashboard
              </h1>
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDashboardData()}
                disabled={loading}
                className="border-orange-200 hover:bg-orange-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Dashboard
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Dashboard</DialogTitle>
                  </DialogHeader>
                  <CreateDashboardForm onSubmit={createDashboard} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Filters:</span>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeDashboard ? (
          <div className="space-y-6">
            {activeDashboard.config.layout.map((widget) => (
              <Card key={widget.id} className="bg-white/80 backdrop-blur-sm border-orange-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {widget.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderWidget(widget)}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Layout className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Dashboard Selected</h3>
            <p className="text-gray-500 mb-4">Create your first dashboard to get started</p>
            <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-orange-500 to-green-500">
              <Plus className="h-4 w-4 mr-2" />
              Create Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Optimization Notice */}
      {isMobile && (
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white p-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm font-medium">Mobile Optimized</span>
          </div>
          <p className="text-xs mt-1 opacity-90">
            Dashboard optimized for African executives on mobile
          </p>
        </div>
      )}
    </div>
  )
}

// Create Dashboard Form Component
function CreateDashboardForm({ onSubmit }: { onSubmit: (name: string, description: string) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim(), description.trim())
      setName('')
      setDescription('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Dashboard Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Executive Overview"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this dashboard"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-orange-500 to-green-500">
          Create Dashboard
        </Button>
      </div>
    </form>
  )
}