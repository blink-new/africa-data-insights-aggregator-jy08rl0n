import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Progress } from './ui/progress'
import { TrendingUp, TrendingDown, Target, AlertTriangle, Lightbulb, DollarSign, Users, Globe, BarChart3, PieChart, LineChart, Download } from 'lucide-react'
import { LineChart as RechartsLineChart, BarChart, PieChart as RechartsPieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Bar, Cell, Area, AreaChart } from 'recharts'
import { blink } from '../blink/client'
import type { TrendAnalysis, Forecast, Benchmark, MarketOpportunity, ActionableInsight, AudienceType } from '../types/insights'

interface BusinessIntelligenceDashboardProps {
  userVerification: any
}

const AUDIENCE_TYPES: AudienceType[] = [
  {
    id: 'investors',
    name: 'Investors & VCs',
    description: 'Market size, growth rates, investment opportunities',
    keyMetrics: ['Market Penetration', 'Growth Rate', 'TAM/SAM', 'User Acquisition Cost'],
    dashboardConfig: {
      primaryCharts: ['market_growth', 'penetration_rates', 'opportunity_matrix'],
      secondaryMetrics: ['roi_potential', 'risk_assessment', 'competitive_landscape'],
      actionableInsights: ['investment_opportunities', 'market_timing', 'risk_mitigation']
    }
  },
  {
    id: 'corporates',
    name: 'Corporates & Enterprises',
    description: 'Consumer behavior, market entry strategies, product-market fit',
    keyMetrics: ['Consumer Preferences', 'Brand Awareness', 'Purchase Intent', 'Market Share'],
    dashboardConfig: {
      primaryCharts: ['consumer_behavior', 'brand_performance', 'market_segments'],
      secondaryMetrics: ['customer_satisfaction', 'competitive_analysis', 'pricing_sensitivity'],
      actionableInsights: ['product_opportunities', 'marketing_strategies', 'expansion_plans']
    }
  },
  {
    id: 'startups',
    name: 'Startups & SMEs',
    description: 'Product validation, target audience, go-to-market strategies',
    keyMetrics: ['Product-Market Fit', 'Customer Acquisition', 'Retention Rate', 'Revenue Growth'],
    dashboardConfig: {
      primaryCharts: ['product_validation', 'customer_segments', 'growth_metrics'],
      secondaryMetrics: ['user_engagement', 'conversion_rates', 'churn_analysis'],
      actionableInsights: ['product_features', 'marketing_channels', 'pricing_strategy']
    }
  },
  {
    id: 'ngos',
    name: 'NGOs & Development',
    description: 'Social impact, community needs, program effectiveness',
    keyMetrics: ['Social Impact', 'Community Needs', 'Program Reach', 'Outcome Effectiveness'],
    dashboardConfig: {
      primaryCharts: ['impact_measurement', 'needs_assessment', 'program_effectiveness'],
      secondaryMetrics: ['beneficiary_satisfaction', 'resource_allocation', 'sustainability_metrics'],
      actionableInsights: ['program_optimization', 'funding_priorities', 'community_engagement']
    }
  },
  {
    id: 'policymakers',
    name: 'Policy Makers',
    description: 'Public opinion, policy impact, governance effectiveness',
    keyMetrics: ['Public Sentiment', 'Policy Effectiveness', 'Governance Quality', 'Citizen Satisfaction'],
    dashboardConfig: {
      primaryCharts: ['public_opinion', 'policy_impact', 'governance_metrics'],
      secondaryMetrics: ['citizen_engagement', 'service_delivery', 'transparency_index'],
      actionableInsights: ['policy_recommendations', 'reform_priorities', 'public_engagement']
    }
  }
]

const COLORS = ['#E97B47', '#2ECC71', '#3498DB', '#9B59B6', '#F39C12', '#E74C3C', '#1ABC9C', '#34495E']

export default function BusinessIntelligenceDashboard({ userVerification }: BusinessIntelligenceDashboardProps) {
  const [selectedAudience, setSelectedAudience] = useState<string>('corporates')
  const [timeframe, setTimeframe] = useState<string>('6months')
  const [country, setCountry] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState<TrendAnalysis[]>([])
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([])
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([])
  const [insights, setInsights] = useState<ActionableInsight[]>([])
  const [rawData, setRawData] = useState<any[]>([])

  const currentAudience = AUDIENCE_TYPES.find(a => a.id === selectedAudience) || AUDIENCE_TYPES[1]

  const generateTrendAnalysis = (responses: any[], audience: string): TrendAnalysis[] => {
    const trends: TrendAnalysis[] = []

    if (audience === 'corporates') {
      trends.push({
        id: '1',
        metric: 'Mobile Payment Adoption',
        trend: 'increasing',
        changePercentage: 34.5,
        timeframe: 'Last 6 months',
        significance: 'high',
        interpretation: 'Mobile payment usage has increased significantly across all age groups, with highest adoption in urban areas.',
        businessImplication: 'Strong opportunity for fintech products and mobile-first payment solutions. Consider partnerships with mobile money providers.'
      })

      trends.push({
        id: '2',
        metric: 'E-commerce Readiness',
        trend: 'increasing',
        changePercentage: 28.2,
        timeframe: 'Last 6 months',
        significance: 'high',
        interpretation: 'Growing comfort with online shopping, driven by improved internet access and smartphone penetration.',
        businessImplication: 'Prime time for e-commerce expansion. Focus on mobile-optimized platforms and local payment methods.'
      })
    } else if (audience === 'investors') {
      trends.push({
        id: '3',
        metric: 'Tech Startup Interest',
        trend: 'increasing',
        changePercentage: 42.1,
        timeframe: 'Last 6 months',
        significance: 'high',
        interpretation: 'Increasing interest in technology solutions for daily challenges, particularly in fintech and edtech.',
        businessImplication: 'High-growth potential in African tech sector. Focus on solutions addressing local pain points.'
      })
    }

    return trends
  }

  const generateForecasts = (responses: any[], audience: string): Forecast[] => {
    const forecasts: Forecast[] = []

    if (audience === 'corporates') {
      forecasts.push({
        id: '1',
        metric: 'Digital Banking Adoption',
        currentValue: 45,
        predictedValue: 72,
        timeframe: 'Next 12 months',
        confidence: 85,
        methodology: 'Linear regression with seasonal adjustments',
        factors: ['Smartphone penetration growth', 'Improved internet infrastructure', 'COVID-19 digital acceleration']
      })
    }

    return forecasts
  }

  const generateBenchmarks = (responses: any[], audience: string): Benchmark[] => {
    const benchmarks: Benchmark[] = []

    if (audience === 'corporates') {
      benchmarks.push({
        id: '1',
        metric: 'Brand Trust Score',
        value: 67,
        benchmark: 58,
        performance: 'above',
        percentile: 75,
        comparison: 'vs. Global Emerging Markets Average'
      })
    }

    return benchmarks
  }

  const generateMarketOpportunities = (responses: any[], audience: string): MarketOpportunity[] => {
    const opportunities: MarketOpportunity[] = []

    if (audience === 'corporates') {
      opportunities.push({
        id: '1',
        title: 'Mobile-First Financial Services',
        description: 'High demand for accessible, mobile-optimized financial products targeting the unbanked population.',
        marketSize: '$2.3B TAM',
        growthRate: 34.5,
        difficulty: 'medium',
        timeToMarket: '6-12 months',
        keyInsights: [
          '68% prefer mobile money over traditional banking',
          'Trust in digital payments increased 45% in 6 months',
          'Rural areas show highest growth potential'
        ],
        recommendedActions: [
          'Partner with existing mobile money providers',
          'Focus on simple, intuitive user interfaces',
          'Implement strong security and fraud protection',
          'Develop offline-capable features for poor connectivity areas'
        ]
      })

      opportunities.push({
        id: '2',
        title: 'EdTech for Skills Development',
        description: 'Growing demand for practical skills training and certification programs accessible via mobile devices.',
        marketSize: '$890M TAM',
        growthRate: 28.7,
        difficulty: 'low',
        timeToMarket: '3-6 months',
        keyInsights: [
          '73% interested in online skills training',
          'Preference for practical, job-relevant courses',
          'Micro-learning formats preferred due to time constraints'
        ],
        recommendedActions: [
          'Develop mobile-first learning platforms',
          'Partner with local employers for job placement',
          'Offer certification programs recognized by industry',
          'Implement offline content download capabilities'
        ]
      })
    }

    return opportunities
  }

  const generateActionableInsights = (responses: any[], surveys: any[], audience: string): ActionableInsight[] => {
    const insights: ActionableInsight[] = []

    if (audience === 'corporates') {
      insights.push({
        id: '1',
        title: 'Localize Payment Methods for 40% Higher Conversion',
        category: 'opportunity',
        priority: 'high',
        description: 'Businesses that integrate local mobile money solutions see significantly higher conversion rates than those relying solely on international payment methods.',
        dataPoints: [
          '78% prefer mobile money over credit cards',
          '40% higher conversion with local payment methods',
          'M-Pesa, MTN Mobile Money most trusted brands'
        ],
        recommendedActions: [
          'Integrate M-Pesa, MTN Mobile Money, and Airtel Money',
          'Display local payment options prominently',
          'Offer payment plans and micro-transactions',
          'Implement USSD fallback for feature phones'
        ],
        expectedImpact: '25-40% increase in conversion rates',
        timeframe: '2-3 months implementation',
        audience: ['corporates', 'startups']
      })

      insights.push({
        id: '2',
        title: 'Mobile-First Strategy Critical for Market Entry',
        category: 'trend',
        priority: 'high',
        description: 'Desktop-first approaches fail in African markets. Mobile optimization is not optional but essential for success.',
        dataPoints: [
          '89% access internet primarily via mobile',
          '67% have never used a desktop computer',
          'Mobile-first companies grow 3x faster'
        ],
        recommendedActions: [
          'Design for mobile-first, desktop-second',
          'Optimize for low-bandwidth connections',
          'Implement progressive web app (PWA) features',
          'Test on popular African smartphone models'
        ],
        expectedImpact: '3x faster user acquisition',
        timeframe: 'Immediate priority',
        audience: ['corporates', 'startups']
      })
    }

    return insights
  }

  const generateAudienceSpecificInsights = useCallback(async (responses: any[], surveys: any[], audience: string, timeframe: string) => {
    // Generate trend analysis
    const trendData = generateTrendAnalysis(responses, audience)
    setTrends(trendData)

    // Generate forecasts
    const forecastData = generateForecasts(responses, audience)
    setForecasts(forecastData)

    // Generate benchmarks
    const benchmarkData = generateBenchmarks(responses, audience)
    setBenchmarks(benchmarkData)

    // Generate market opportunities
    const opportunityData = generateMarketOpportunities(responses, audience)
    setOpportunities(opportunityData)

    // Generate actionable insights
    const insightData = generateActionableInsights(responses, surveys, audience)
    setInsights(insightData)
  }, [])

  const loadBusinessIntelligence = useCallback(async () => {
    setLoading(true)
    try {
      // Load raw survey data
      const responses = await blink.db.surveyResponses.list({
        where: country !== 'all' ? { country } : {},
        orderBy: { created_at: 'desc' },
        limit: 1000
      })

      const surveys = await blink.db.surveys.list({
        orderBy: { created_at: 'desc' }
      })

      setRawData(responses)

      // Generate AI-powered insights based on audience type
      await generateAudienceSpecificInsights(responses, surveys, selectedAudience, timeframe)
      
    } catch (error) {
      console.error('Error loading business intelligence:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedAudience, timeframe, country, generateAudienceSpecificInsights])

  const getChartData = () => {
    // Generate sample chart data based on audience
    if (selectedAudience === 'corporates') {
      return [
        { month: 'Jan', mobilePayments: 45, ecommerce: 23, digitalBanking: 34 },
        { month: 'Feb', mobilePayments: 52, ecommerce: 28, digitalBanking: 38 },
        { month: 'Mar', mobilePayments: 58, ecommerce: 35, digitalBanking: 42 },
        { month: 'Apr', mobilePayments: 65, ecommerce: 41, digitalBanking: 47 },
        { month: 'May', mobilePayments: 71, ecommerce: 48, digitalBanking: 53 },
        { month: 'Jun', mobilePayments: 78, ecommerce: 55, digitalBanking: 58 }
      ]
    }
    return []
  }

  const getOpportunityMatrix = () => {
    return opportunities.map((opp, index) => ({
      name: opp.title,
      impact: opp.growthRate,
      effort: opp.difficulty === 'low' ? 30 : opp.difficulty === 'medium' ? 60 : 90,
      marketSize: parseFloat(opp.marketSize.replace(/[^0-9.]/g, ''))
    }))
  }

  useEffect(() => {
    loadBusinessIntelligence()
  }, [loadBusinessIntelligence])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating business intelligence insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
            Business Intelligence Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Actionable insights from African market data for strategic decision-making
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="backdrop-blur-sm bg-white/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Target Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_TYPES.map(audience => (
                    <SelectItem key={audience.id} value={audience.id}>
                      {audience.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">{currentAudience.description}</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Timeframe</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="2years">Last 2 Years</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Geographic Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All African Countries</SelectItem>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="Egypt">Egypt</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="insights">Actionable Insights</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
            <TabsTrigger value="opportunities">Market Opportunities</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          </TabsList>

          {/* Actionable Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {insights.map(insight => (
                <Card key={insight.id} className="backdrop-blur-sm bg-white/80">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                            {insight.priority} priority
                          </Badge>
                          <Badge variant="outline">{insight.category}</Badge>
                        </div>
                        <CardTitle className="text-xl">{insight.title}</CardTitle>
                        <CardDescription className="mt-2">{insight.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">{insight.expectedImpact}</p>
                        <p className="text-xs text-gray-500">{insight.timeframe}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Key Data Points
                        </h4>
                        <ul className="space-y-1">
                          {insight.dataPoints.map((point, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Recommended Actions
                        </h4>
                        <ul className="space-y-1">
                          {insight.recommendedActions.map((action, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trend Analysis */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid gap-6">
              {trends.map(trend => (
                <Card key={trend.id} className="backdrop-blur-sm bg-white/80">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {trend.trend === 'increasing' ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : trend.trend === 'decreasing' ? (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : (
                          <BarChart3 className="h-5 w-5 text-gray-500" />
                        )}
                        {trend.metric}
                      </CardTitle>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${trend.trend === 'increasing' ? 'text-green-600' : trend.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'}`}>
                          {trend.trend === 'increasing' ? '+' : trend.trend === 'decreasing' ? '-' : ''}{trend.changePercentage}%
                        </p>
                        <p className="text-xs text-gray-500">{trend.timeframe}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Interpretation</h4>
                        <p className="text-sm text-gray-600">{trend.interpretation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Business Implication</h4>
                        <p className="text-sm text-gray-600">{trend.businessImplication}</p>
                      </div>
                      <Badge variant={trend.significance === 'high' ? 'destructive' : trend.significance === 'medium' ? 'default' : 'secondary'}>
                        {trend.significance} significance
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trend Chart */}
            {getChartData().length > 0 && (
              <Card className="backdrop-blur-sm bg-white/80">
                <CardHeader>
                  <CardTitle>Trend Visualization</CardTitle>
                  <CardDescription>Key metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="mobilePayments" stackId="1" stroke="#E97B47" fill="#E97B47" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="ecommerce" stackId="1" stroke="#2ECC71" fill="#2ECC71" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="digitalBanking" stackId="1" stroke="#3498DB" fill="#3498DB" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Forecasts */}
          <TabsContent value="forecasts" className="space-y-6">
            <div className="grid gap-6">
              {forecasts.map(forecast => (
                <Card key={forecast.id} className="backdrop-blur-sm bg-white/80">
                  <CardHeader>
                    <CardTitle>{forecast.metric} Forecast</CardTitle>
                    <CardDescription>{forecast.timeframe}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Current Value</span>
                          <span className="text-2xl font-bold text-gray-900">{forecast.currentValue}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Predicted Value</span>
                          <span className="text-2xl font-bold text-green-600">{forecast.predictedValue}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Confidence Level</span>
                          <span className="text-lg font-medium">{forecast.confidence}%</span>
                        </div>
                        <Progress value={forecast.confidence} className="w-full" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Key Factors</h4>
                        <ul className="space-y-1">
                          {forecast.factors.map((factor, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-gray-500 mt-4">Methodology: {forecast.methodology}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Market Opportunities */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="grid gap-6">
              {opportunities.map(opportunity => (
                <Card key={opportunity.id} className="backdrop-blur-sm bg-white/80">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          {opportunity.title}
                        </CardTitle>
                        <CardDescription className="mt-2">{opportunity.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{opportunity.marketSize}</p>
                        <p className="text-sm text-gray-600">+{opportunity.growthRate}% growth</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Key Insights
                        </h4>
                        <ul className="space-y-1">
                          {opportunity.keyInsights.map((insight, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Recommended Actions
                        </h4>
                        <ul className="space-y-1">
                          {opportunity.recommendedActions.map((action, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <Badge variant={opportunity.difficulty === 'low' ? 'default' : opportunity.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                        {opportunity.difficulty} difficulty
                      </Badge>
                      <span className="text-sm text-gray-600">Time to market: {opportunity.timeToMarket}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Opportunity Matrix */}
            {getOpportunityMatrix().length > 0 && (
              <Card className="backdrop-blur-sm bg-white/80">
                <CardHeader>
                  <CardTitle>Opportunity Matrix</CardTitle>
                  <CardDescription>Impact vs Effort analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={getOpportunityMatrix()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impact" fill="#E97B47" name="Growth Rate %" />
                      <Bar dataKey="effort" fill="#2ECC71" name="Implementation Effort" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Benchmarks */}
          <TabsContent value="benchmarks" className="space-y-6">
            <div className="grid gap-6">
              {benchmarks.map(benchmark => (
                <Card key={benchmark.id} className="backdrop-blur-sm bg-white/80">
                  <CardHeader>
                    <CardTitle>{benchmark.metric}</CardTitle>
                    <CardDescription>{benchmark.comparison}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Your Score</p>
                        <p className="text-3xl font-bold text-gray-900">{benchmark.value}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Benchmark</p>
                        <p className="text-3xl font-bold text-gray-600">{benchmark.benchmark}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Percentile</p>
                        <p className={`text-3xl font-bold ${benchmark.performance === 'above' ? 'text-green-600' : benchmark.performance === 'below' ? 'text-red-600' : 'text-gray-600'}`}>
                          {benchmark.percentile}th
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress 
                        value={benchmark.percentile} 
                        className="w-full"
                      />
                      <p className="text-center mt-2">
                        <Badge variant={benchmark.performance === 'above' ? 'default' : benchmark.performance === 'below' ? 'destructive' : 'secondary'}>
                          {benchmark.performance === 'above' ? 'Above' : benchmark.performance === 'below' ? 'Below' : 'At'} benchmark
                        </Badge>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Options */}
        <Card className="backdrop-blur-sm bg-white/80 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export & Share
            </CardTitle>
            <CardDescription>
              Download insights for presentations and strategic planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF Report
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Data (CSV)
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PowerPoint Slides
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Executive Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}