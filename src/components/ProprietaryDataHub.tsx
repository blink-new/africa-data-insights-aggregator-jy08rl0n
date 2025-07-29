import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { Database, Shield, TrendingUp, Users, Globe, Clock, Download, Star, Lock } from 'lucide-react'
import type { ProprietaryDataset } from '../types/insights'

const PROPRIETARY_DATASETS: ProprietaryDataset[] = [
  {
    id: 'african_consumer_behavior_2024',
    name: 'African Consumer Behavior Index 2024',
    description: 'Comprehensive analysis of purchasing patterns, brand preferences, and decision-making factors across 15 African countries. Includes mobile money usage, e-commerce adoption, and brand loyalty metrics.',
    source: 'Africa Data Insights Exclusive Survey',
    lastUpdated: '2024-01-15',
    recordCount: 45000,
    uniqueValue: 'Only dataset combining mobile money usage with brand preferences across Africa',
    accessLevel: 'premium'
  },
  {
    id: 'fintech_adoption_tracker',
    name: 'African FinTech Adoption Tracker',
    description: 'Real-time tracking of digital financial services adoption, including mobile banking, digital lending, and cryptocurrency usage. Updated monthly with sentiment analysis.',
    source: 'Partnership with African Mobile Money Providers',
    lastUpdated: '2024-01-20',
    recordCount: 78000,
    uniqueValue: 'Real-time data from actual mobile money transactions (anonymized)',
    accessLevel: 'enterprise'
  },
  {
    id: 'youth_employment_insights',
    name: 'African Youth Employment & Skills Gap Analysis',
    description: 'Detailed analysis of employment challenges, skills gaps, and career aspirations among African youth aged 18-35. Includes salary expectations and preferred work arrangements.',
    source: 'Partnership with African Universities & NGOs',
    lastUpdated: '2024-01-10',
    recordCount: 32000,
    uniqueValue: 'Direct access to university career centers and employment agencies',
    accessLevel: 'premium'
  },
  {
    id: 'healthcare_access_study',
    name: 'African Healthcare Access & Digital Health Readiness',
    description: 'Comprehensive study on healthcare accessibility, telemedicine adoption, and health insurance coverage across rural and urban areas.',
    source: 'Partnership with African Health Organizations',
    lastUpdated: '2024-01-18',
    recordCount: 28000,
    uniqueValue: 'Includes rural healthcare data often missing from other studies',
    accessLevel: 'enterprise'
  },
  {
    id: 'infrastructure_sentiment',
    name: 'Infrastructure Development Sentiment Index',
    description: 'Public opinion on infrastructure projects, government spending priorities, and quality of public services. Includes transportation, electricity, and internet access satisfaction.',
    source: 'Africa Data Insights Exclusive Survey',
    lastUpdated: '2024-01-22',
    recordCount: 52000,
    uniqueValue: 'Combines infrastructure quality ratings with public spending preferences',
    accessLevel: 'premium'
  },
  {
    id: 'agricultural_innovation',
    name: 'Agricultural Innovation & Climate Adaptation Study',
    description: 'Farmer adoption of new technologies, climate change impact assessment, and agricultural productivity metrics across different regions and crop types.',
    source: 'Partnership with Agricultural Extension Services',
    lastUpdated: '2024-01-12',
    recordCount: 19000,
    uniqueValue: 'Direct farmer interviews combined with satellite crop yield data',
    accessLevel: 'enterprise'
  }
]

const MARKET_INTELLIGENCE_REPORTS = [
  {
    id: 'mobile_money_forecast_2024',
    title: 'Mobile Money Market Forecast 2024-2027',
    description: 'Predictive analysis of mobile money growth across African markets with country-specific forecasts and regulatory impact assessment.',
    price: '$2,500',
    pages: 85,
    lastUpdated: '2024-01-15',
    keyInsights: [
      'Nigeria mobile money market to grow 340% by 2027',
      'Rural adoption driving 60% of new user growth',
      'Cross-border payments emerging as key revenue driver'
    ]
  },
  {
    id: 'ecommerce_readiness_index',
    title: 'African E-commerce Readiness Index 2024',
    description: 'Comprehensive ranking of African countries by e-commerce potential, including infrastructure, consumer behavior, and regulatory environment.',
    price: '$1,800',
    pages: 62,
    lastUpdated: '2024-01-20',
    keyInsights: [
      'Kenya leads e-commerce readiness in East Africa',
      'Payment method preferences vary significantly by country',
      'Mobile-first platforms show 3x higher conversion rates'
    ]
  },
  {
    id: 'youth_market_opportunity',
    title: 'African Youth Market Opportunity Analysis',
    description: 'Deep dive into the $2.3T African youth market, including spending patterns, brand preferences, and digital engagement strategies.',
    price: '$3,200',
    pages: 120,
    lastUpdated: '2024-01-18',
    keyInsights: [
      'Youth represent 65% of African population by 2030',
      'Social media influences 78% of purchase decisions',
      'Sustainability increasingly important in brand choice'
    ]
  }
]

export default function ProprietaryDataHub() {
  const [selectedTab, setSelectedTab] = useState('datasets')
  const [accessLevel, setAccessLevel] = useState<'public' | 'premium' | 'enterprise'>('public')

  const filteredDatasets = PROPRIETARY_DATASETS.filter(dataset => {
    if (accessLevel === 'public') return true
    if (accessLevel === 'premium') return dataset.accessLevel === 'premium' || dataset.accessLevel === 'public'
    return true // enterprise sees all
  })

  const getAccessBadgeColor = (level: string) => {
    switch (level) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'premium': return 'bg-orange-100 text-orange-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
            Proprietary Data Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Exclusive datasets and market intelligence reports for African market insights
          </p>
        </div>

        {/* Access Level Selector */}
        <Card className="backdrop-blur-sm bg-white/80 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Access Level
            </CardTitle>
            <CardDescription>
              Choose your access level to see available datasets and reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                variant={accessLevel === 'public' ? 'default' : 'outline'}
                onClick={() => setAccessLevel('public')}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Public Access
              </Button>
              <Button 
                variant={accessLevel === 'premium' ? 'default' : 'outline'}
                onClick={() => setAccessLevel('premium')}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Premium ($500/month)
              </Button>
              <Button 
                variant={accessLevel === 'enterprise' ? 'default' : 'outline'}
                onClick={() => setAccessLevel('enterprise')}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Enterprise ($2,000/month)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="datasets">Proprietary Datasets</TabsTrigger>
            <TabsTrigger value="reports">Market Intelligence</TabsTrigger>
            <TabsTrigger value="api">Data API Access</TabsTrigger>
          </TabsList>

          {/* Proprietary Datasets */}
          <TabsContent value="datasets" className="space-y-6">
            <div className="grid gap-6">
              {filteredDatasets.map(dataset => (
                <Card key={dataset.id} className="backdrop-blur-sm bg-white/80">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getAccessBadgeColor(dataset.accessLevel)}>
                            {dataset.accessLevel}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {dataset.recordCount.toLocaleString()} records
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{dataset.name}</CardTitle>
                        <CardDescription className="mt-2">{dataset.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {dataset.lastUpdated}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Unique Value Proposition
                        </h4>
                        <p className="text-sm text-gray-600">{dataset.uniqueValue}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Data Source</h4>
                        <p className="text-sm text-gray-600">{dataset.source}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Data Quality Score: <span className="font-medium text-green-600">98%</span>
                          </span>
                          <Progress value={98} className="w-20" />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Sample Data
                          </Button>
                          <Button size="sm" disabled={dataset.accessLevel === 'enterprise' && accessLevel !== 'enterprise'}>
                            Access Dataset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Market Intelligence Reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6">
              {MARKET_INTELLIGENCE_REPORTS.map(report => (
                <Card key={report.id} className="backdrop-blur-sm bg-white/80">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{report.title}</CardTitle>
                        <CardDescription className="mt-2">{report.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{report.price}</p>
                        <p className="text-sm text-gray-600">{report.pages} pages</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Insights Preview</h4>
                        <ul className="space-y-1">
                          {report.keyInsights.map((insight, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Updated {report.lastUpdated}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Preview Report
                          </Button>
                          <Button size="sm">
                            Purchase Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Data API Access */}
          <TabsContent value="api" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Real-Time Data API
                </CardTitle>
                <CardDescription>
                  Programmatic access to our proprietary datasets with real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="font-medium mb-2">API Endpoints</h3>
                    <p className="text-3xl font-bold text-orange-600">15+</p>
                    <p className="text-sm text-gray-600">Specialized endpoints</p>
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium mb-2">Response Time</h3>
                    <p className="text-3xl font-bold text-green-600">&lt;200ms</p>
                    <p className="text-sm text-gray-600">Average response</p>
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium mb-2">Uptime</h3>
                    <p className="text-3xl font-bold text-blue-600">99.9%</p>
                    <p className="text-sm text-gray-600">SLA guarantee</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Sample API Call</h4>
                  <code className="text-sm text-gray-700 block">
                    GET /api/v1/consumer-behavior?country=Nigeria&timeframe=6months
                  </code>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-4">API Pricing Tiers</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Starter</CardTitle>
                        <p className="text-2xl font-bold">$200<span className="text-sm font-normal">/month</span></p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li>• 10,000 API calls/month</li>
                          <li>• Basic datasets access</li>
                          <li>• Email support</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-orange-200 bg-orange-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Professional</CardTitle>
                        <p className="text-2xl font-bold">$800<span className="text-sm font-normal">/month</span></p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li>• 100,000 API calls/month</li>
                          <li>• All proprietary datasets</li>
                          <li>• Real-time data streams</li>
                          <li>• Priority support</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Enterprise</CardTitle>
                        <p className="text-2xl font-bold">Custom</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li>• Unlimited API calls</li>
                          <li>• Custom data endpoints</li>
                          <li>• Dedicated support</li>
                          <li>• SLA guarantees</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button>
                    Get API Key
                  </Button>
                  <Button variant="outline">
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Value Proposition */}
        <Card className="backdrop-blur-sm bg-white/80 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Why Our Data is Different
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  Exclusive Access
                </h3>
                <p className="text-sm text-gray-600">
                  Direct partnerships with African mobile money providers, universities, and NGOs give us access to data unavailable elsewhere.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  Local Context
                </h3>
                <p className="text-sm text-gray-600">
                  Our surveys are designed by Africans for African markets, capturing nuances that global research firms miss.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Real-Time Updates
                </h3>
                <p className="text-sm text-gray-600">
                  Unlike static reports, our datasets are continuously updated with fresh insights from ongoing surveys and partnerships.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}