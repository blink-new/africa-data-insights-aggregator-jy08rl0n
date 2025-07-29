export interface TrendAnalysis {
  id: string
  metric: string
  trend: 'increasing' | 'decreasing' | 'stable'
  changePercentage: number
  timeframe: string
  significance: 'high' | 'medium' | 'low'
  interpretation: string
  businessImplication: string
}

export interface Forecast {
  id: string
  metric: string
  currentValue: number
  predictedValue: number
  timeframe: string
  confidence: number
  methodology: string
  factors: string[]
}

export interface Benchmark {
  id: string
  metric: string
  value: number
  benchmark: number
  performance: 'above' | 'below' | 'at'
  percentile: number
  comparison: string
}

export interface MarketOpportunity {
  id: string
  title: string
  description: string
  marketSize: string
  growthRate: number
  difficulty: 'low' | 'medium' | 'high'
  timeToMarket: string
  keyInsights: string[]
  recommendedActions: string[]
}

export interface AudienceType {
  id: string
  name: string
  description: string
  keyMetrics: string[]
  dashboardConfig: {
    primaryCharts: string[]
    secondaryMetrics: string[]
    actionableInsights: string[]
  }
}

export interface ProprietaryDataset {
  id: string
  name: string
  description: string
  source: string
  lastUpdated: string
  recordCount: number
  uniqueValue: string
  accessLevel: 'premium' | 'enterprise' | 'public'
}

export interface ActionableInsight {
  id: string
  title: string
  category: 'opportunity' | 'risk' | 'trend' | 'benchmark'
  priority: 'high' | 'medium' | 'low'
  description: string
  dataPoints: string[]
  recommendedActions: string[]
  expectedImpact: string
  timeframe: string
  audience: string[]
}