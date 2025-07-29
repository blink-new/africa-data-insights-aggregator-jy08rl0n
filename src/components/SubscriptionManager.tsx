import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Crown, Zap, Rocket, Check, X, 
  BarChart3, Database, Download, 
  Smartphone, Globe, Users, TrendingUp,
  CreditCard, Calendar, AlertCircle
} from 'lucide-react'
import { blink } from '../blink/client'

interface SubscriptionTier {
  id: string
  name: string
  price: number
  features: string[]
  limits: {
    dashboards: number
    apiCalls: number
    dataRetention: number
    customReports: number
  }
  popular?: boolean
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic dashboard access',
      'Limited to 100 survey responses',
      'Standard visualizations',
      'Community support',
      'Public data only'
    ],
    limits: {
      dashboards: 1,
      apiCalls: 100,
      dataRetention: 30,
      customReports: 0
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    features: [
      'Advanced dashboards & filters',
      'Up to 1,000 survey responses',
      'Custom visualizations',
      'Priority support',
      'Historical data access',
      'Export capabilities',
      'Mobile optimization'
    ],
    limits: {
      dashboards: 5,
      apiCalls: 5000,
      dataRetention: 365,
      customReports: 10
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2000,
    features: [
      'Unlimited dashboards',
      'Unlimited survey responses',
      'AI-powered insights',
      'White-label options',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Real-time data streams'
    ],
    limits: {
      dashboards: -1, // unlimited
      apiCalls: 50000,
      dataRetention: -1, // unlimited
      customReports: -1 // unlimited
    }
  }
]

interface APIEndpoint {
  name: string
  description: string
  price: number
  tier: string
}

const apiEndpoints: APIEndpoint[] = [
  {
    name: 'Survey Responses API',
    description: 'Access to all survey response data with filtering',
    price: 200,
    tier: 'premium'
  },
  {
    name: 'Country Analytics API',
    description: 'Country-specific demographic and behavioral insights',
    price: 300,
    tier: 'premium'
  },
  {
    name: 'Real-time Data Stream',
    description: 'Live data updates via WebSocket connection',
    price: 500,
    tier: 'enterprise'
  },
  {
    name: 'AI Insights API',
    description: 'AI-generated market predictions and trend analysis',
    price: 800,
    tier: 'enterprise'
  }
]

export default function SubscriptionManager() {
  const [currentTier, setCurrentTier] = useState<string>('free')
  const [usage, setUsage] = useState({
    dashboards: 0,
    apiCalls: 0,
    dataRetention: 30,
    customReports: 0
  })
  const [loading, setLoading] = useState(false)

  const loadUserSubscription = async () => {
    try {
      const user = await blink.auth.me()
      const subscription = await blink.db.subscriptionTiers.list({
        where: { user_id: user.id, is_active: true },
        limit: 1
      })
      
      if (subscription.length > 0) {
        setCurrentTier(subscription[0].tier_name)
      }
    } catch (error) {
      console.error('Failed to load subscription:', error)
    }
  }

  const loadUsageStats = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load dashboard count
      const dashboards = await blink.db.customDashboards.list({
        where: { user_id: user.id }
      })
      
      // Load API usage for current month
      const currentMonth = new Date().toISOString().slice(0, 7)
      const apiUsage = await blink.db.apiUsage.list({
        where: { user_id: user.id, date: { startsWith: currentMonth } }
      })
      
      const totalApiCalls = apiUsage.reduce((sum, usage) => sum + usage.calls_count, 0)
      
      setUsage({
        dashboards: dashboards.length,
        apiCalls: totalApiCalls,
        dataRetention: 30, // This would be calculated based on subscription
        customReports: 0 // This would be loaded from reports table
      })
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    }
  }

  useEffect(() => {
    loadUserSubscription()
    loadUsageStats()
  }, [])

  const upgradeTier = async (tierId: string) => {
    setLoading(true)
    try {
      const user = await blink.auth.me()
      const tier = subscriptionTiers.find(t => t.id === tierId)
      
      if (tier) {
        await blink.db.subscriptionTiers.create({
          id: `sub_${Date.now()}`,
          user_id: user.id,
          tier_name: tier.name.toLowerCase(),
          price: tier.price,
          features: JSON.stringify(tier.features),
          limits: JSON.stringify(tier.limits),
          is_active: true,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        
        setCurrentTier(tierId)
      }
    } catch (error) {
      console.error('Failed to upgrade tier:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free': return <Users className="h-6 w-6" />
      case 'premium': return <Crown className="h-6 w-6" />
      case 'enterprise': return <Rocket className="h-6 w-6" />
      default: return <Users className="h-6 w-6" />
    }
  }

  const getCurrentTierLimits = () => {
    return subscriptionTiers.find(t => t.id === currentTier)?.limits || subscriptionTiers[0].limits
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // unlimited
    return Math.min((used / limit) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
            Subscription & API Access
          </h1>
          <p className="text-gray-600">
            Unlock the full potential of African market insights with our premium plans
          </p>
        </div>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
            <TabsTrigger value="api">API Access</TabsTrigger>
            <TabsTrigger value="white-label">White Label</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {subscriptionTiers.map((tier) => (
                <Card 
                  key={tier.id} 
                  className={`relative ${tier.popular ? 'ring-2 ring-orange-500 shadow-lg' : ''} ${
                    currentTier === tier.id ? 'bg-gradient-to-br from-orange-50 to-green-50' : 'bg-white'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-green-500 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${
                        tier.id === 'free' ? 'bg-gray-100' :
                        tier.id === 'premium' ? 'bg-orange-100' : 'bg-green-100'
                      }`}>
                        {getTierIcon(tier.id)}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900">
                      ${tier.price}
                      <span className="text-sm font-normal text-gray-500">/month</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-4">
                      {currentTier === tier.id ? (
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => upgradeTier(tier.id)}
                          disabled={loading}
                          className={`w-full ${
                            tier.id === 'premium' 
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                              : tier.id === 'enterprise'
                              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                              : ''
                          }`}
                        >
                          {tier.price === 0 ? 'Downgrade' : 'Upgrade'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-500" />
                    Dashboard Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Dashboards Created</span>
                      <span>{usage.dashboards} / {getCurrentTierLimits().dashboards === -1 ? '∞' : getCurrentTierLimits().dashboards}</span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.dashboards, getCurrentTierLimits().dashboards)} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-500" />
                    API Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>API Calls This Month</span>
                      <span>{usage.apiCalls} / {getCurrentTierLimits().apiCalls === -1 ? '∞' : getCurrentTierLimits().apiCalls.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.apiCalls, getCurrentTierLimits().apiCalls)} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Data Retention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Historical Data Access</span>
                      <span>{getCurrentTierLimits().dataRetention === -1 ? 'Unlimited' : `${getCurrentTierLimits().dataRetention} days`}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-purple-500" />
                    Custom Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Reports Generated</span>
                      <span>{usage.customReports} / {getCurrentTierLimits().customReports === -1 ? '∞' : getCurrentTierLimits().customReports}</span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.customReports, getCurrentTierLimits().customReports)} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {apiEndpoints.map((endpoint, index) => (
                <Card key={index} className="bg-white">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                      <Badge variant="outline" className={
                        endpoint.tier === 'premium' ? 'border-orange-200 text-orange-700' : 'border-green-200 text-green-700'
                      }>
                        {endpoint.tier}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{endpoint.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">${endpoint.price}/month</span>
                      <Button 
                        variant="outline" 
                        className="border-orange-200 hover:bg-orange-50"
                        disabled={currentTier === 'free' && endpoint.tier !== 'free'}
                      >
                        {currentTier === 'free' && endpoint.tier !== 'free' ? 'Upgrade Required' : 'Subscribe'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-orange-50 to-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  API Documentation & SLA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">99.9% Uptime SLA</h4>
                    <p className="text-sm text-gray-600">Guaranteed service availability with automatic failover</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rate Limiting</h4>
                    <p className="text-sm text-gray-600">Fair usage policies with burst capacity for peak loads</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Real-time Support</h4>
                    <p className="text-sm text-gray-600">Dedicated API support for Enterprise customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="white-label" className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-50 to-green-50">
              <CardHeader>
                <CardTitle className="text-2xl">White Label Solutions</CardTitle>
                <p className="text-gray-600">
                  Offer Africa Data Insights under your own brand to consulting firms, government agencies, and NGOs
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Features Included</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Custom branding & logo</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Custom domain support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">White-labeled reports</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">API access with your branding</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Revenue sharing model</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">$5,000</div>
                        <div className="text-sm text-gray-500">Setup fee</div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">30%</div>
                        <div className="text-sm text-gray-500">Revenue share</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600">
                    Contact Sales for White Label
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}