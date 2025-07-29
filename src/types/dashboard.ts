export interface CustomDashboard {
  id: string
  user_id: string
  name: string
  description?: string
  config: DashboardConfig
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface DashboardConfig {
  layout: DashboardWidget[]
  filters: DashboardFilter[]
  theme: 'light' | 'dark' | 'african'
  refreshInterval: number
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'map' | 'text'
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: WidgetConfig
}

export interface WidgetConfig {
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  dataSource: string
  filters: Record<string, any>
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  groupBy?: string[]
  timeRange?: string
}

export interface DashboardFilter {
  id: string
  type: 'select' | 'multiselect' | 'date' | 'range' | 'search'
  field: string
  label: string
  options?: FilterOption[]
  defaultValue?: any
}

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface SubscriptionTier {
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
}

export interface APIUsage {
  user_id: string
  endpoint: string
  calls_count: number
  date: string
  tier: string
}

export interface WhiteLabelConfig {
  organization_id: string
  branding: {
    logo: string
    primaryColor: string
    secondaryColor: string
    companyName: string
  }
  features: string[]
  customDomain?: string
}