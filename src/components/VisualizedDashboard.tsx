import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Globe, Users, TrendingUp, MapPin, Smartphone, DollarSign, Heart, GraduationCap, Zap, Building, Calendar, Clock } from 'lucide-react';
import { blink } from '../blink/client';
import { AFRICAN_COUNTRIES } from '../types/user';

interface InsightData {
  surveyTitle: string;
  question: string;
  responses: { [key: string]: number };
  totalResponses: number;
  country?: string;
  category: string;
  year: number;
  month: number;
}

const COLORS = ['#E97B47', '#2ECC71', '#3498DB', '#9B59B6', '#F39C12', '#E74C3C', '#1ABC9C', '#34495E'];

const CATEGORY_ICONS = {
  'Economic & Financial': DollarSign,
  'Technology & Digital': Smartphone,
  'Health & Healthcare': Heart,
  'Education & Skills': GraduationCap,
  'Transportation & Energy': Zap,
  'Government & Politics': Building,
  'Family & Social': Users,
  'Culture & Religion': Globe,
  'Lifestyle & Personal': TrendingUp
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function VisualizedDashboard() {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = all months
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [countriesData, setCountriesData] = useState<{ [key: string]: number }>({});
  const [yearlyTrends, setYearlyTrends] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build where clause for filtering
      const whereClause: any = {};
      if (selectedCountry !== 'all') {
        whereClause.country = selectedCountry;
      }
      if (selectedYear !== 0) {
        whereClause.response_year = selectedYear;
      }

      // Get all survey responses with filters
      const responses = await blink.db.surveyResponses.list({
        where: whereClause,
        orderBy: { created_at: 'desc' }
      });

      // Get all responses to determine available years
      const allResponses = await blink.db.surveyResponses.list({
        orderBy: { response_year: 'desc' }
      });

      // Extract available years
      const years = [...new Set(allResponses.map(r => r.response_year || new Date().getFullYear()))].sort((a, b) => b - a);
      setAvailableYears(years);

      // Get all surveys
      const surveys = await blink.db.surveys.list();

      // Count unique participants for the selected filters
      const uniqueParticipants = new Set(responses.map(r => r.user_id)).size;
      setTotalParticipants(uniqueParticipants);

      // Count participants by country for the selected year
      const countryCount: { [key: string]: number } = {};
      responses.forEach(response => {
        if (response.country) {
          countryCount[response.country] = (countryCount[response.country] || 0) + 1;
        }
      });
      setCountriesData(countryCount);

      // Calculate yearly trends (for all countries or selected country)
      const yearlyData: { [key: number]: number } = {};
      const yearlyResponses = selectedCountry !== 'all' 
        ? allResponses.filter(r => r.country === selectedCountry)
        : allResponses;
      
      yearlyResponses.forEach(response => {
        const year = response.response_year || new Date().getFullYear();
        yearlyData[year] = (yearlyData[year] || 0) + 1;
      });

      const trendsData = Object.entries(yearlyData)
        .map(([year, count]) => ({ year: parseInt(year), responses: count }))
        .sort((a, b) => a.year - b.year);
      setYearlyTrends(trendsData);

      // Calculate monthly trends for the selected year
      const monthlyData: { [key: number]: number } = {};
      const monthlyResponses = responses.filter(r => {
        if (selectedYear === 0) return true;
        return r.response_year === selectedYear;
      });

      monthlyResponses.forEach(response => {
        const date = new Date(response.created_at);
        const month = date.getMonth() + 1; // 1-12
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });

      const monthlyTrendsData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        monthName: MONTH_NAMES[i],
        responses: monthlyData[i + 1] || 0
      }));
      setMonthlyTrends(monthlyTrendsData);

      // Process insights with month filtering
      const insightMap: { [key: string]: InsightData } = {};

      const filteredResponses = selectedMonth === 0 
        ? responses 
        : responses.filter(r => {
            const date = new Date(r.created_at);
            return date.getMonth() + 1 === selectedMonth;
          });

      filteredResponses.forEach(response => {
        const survey = surveys.find(s => s.id === response.survey_id);
        if (!survey) return;

        const key = `${response.survey_id}_${response.question_index}`;
        
        if (!insightMap[key]) {
          const questions = JSON.parse(survey.questions);
          const date = new Date(response.created_at);
          insightMap[key] = {
            surveyTitle: survey.title,
            question: questions[response.question_index]?.question || '',
            responses: {},
            totalResponses: 0,
            category: survey.category || 'General',
            year: response.response_year || new Date().getFullYear(),
            month: date.getMonth() + 1
          };
        }

        insightMap[key].responses[response.answer] = (insightMap[key].responses[response.answer] || 0) + 1;
        insightMap[key].totalResponses++;
      });

      setInsights(Object.values(insightMap).filter(insight => insight.totalResponses > 0));
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedYear, selectedMonth]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const getTopCountries = () => {
    return Object.entries(countriesData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));
  };

  const getCategoryInsights = () => {
    const categoryData: { [key: string]: { total: number, surveys: number } } = {};
    
    insights.forEach(insight => {
      if (!categoryData[insight.category]) {
        categoryData[insight.category] = { total: 0, surveys: 0 };
      }
      categoryData[insight.category].total += insight.totalResponses;
      categoryData[insight.category].surveys++;
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      responses: data.total,
      surveys: data.surveys
    }));
  };

  const formatPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center relative overflow-hidden">
        {/* Beautiful African landscape background */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1664309993809-f48d749d5bcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwbGFuZHNjYXBlJTIwc3Vuc2V0JTIwbW91bnRhaW5zfGVufDB8MHx8fDE3NTM0ODk5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/60 to-green-100/60"></div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-orange-800 mb-2">Loading African Insights</h2>
          <p className="text-orange-700">Gathering community data from across the continent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 relative overflow-hidden">
      {/* Enhanced African-inspired background collage */}
      <div className="absolute inset-0 opacity-15">
        <div 
          className="absolute top-0 left-0 w-1/3 h-1/2 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1664309993809-f48d749d5bcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwbGFuZHNjYXBlJTIwc3Vuc2V0JTIwbW91bnRhaW5zfGVufDB8MHx8fDE3NTM0ODk5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080')`
          }}
        />
        <div 
          className="absolute top-0 right-0 w-1/3 h-1/2 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1572106293012-82465414818d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwYmVhY2glMjBvY2VhbiUyMGNvYXN0bGluZXxlbnwwfDB8fHwxNzUzNDg5OTkwfDA&ixlib=rb-4.1.0&q=80&w=1080')`
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1670090664576-3b9993c4263e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwyfHxBZnJpY2FuJTIwbGFuZHNjYXBlJTIwc3Vuc2V0JTIwbW91bnRhaW5zfGVufDB8MHx8fDE3NTM0ODk5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080')`
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-1/2 h-1/3 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1640932955967-8c3ee7ef07ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwyfHxBZnJpY2FuJTIwYmVhY2glMjBvY2VhbiUyMGNvYXN0bGluZXxlbnwwfDB8fHwxNzUzNDg5OTkwfDA&ixlib=rb-4.1.0&q=80&w=1080')`
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-green-50/80"></div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-orange-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                Africa Data Insights
              </h1>
              <p className="text-gray-700 mt-2 text-lg">Understanding African behaviors and preferences over time</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32 bg-white/80 border-orange-200">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-36 bg-white/80 border-orange-200">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Months</SelectItem>
                  {MONTH_NAMES.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-48 bg-white/80 border-orange-200">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {AFRICAN_COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Badge variant="secondary" className="text-sm bg-orange-100 text-orange-800 border-orange-200">
                {totalParticipants} Participants
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border border-orange-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Detailed Insights</TabsTrigger>
            <TabsTrigger value="countries" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">By Country</TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Categories</TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Yearly Trends</TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Monthly Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Participants</p>
                      <p className="text-3xl font-bold text-gray-900">{totalParticipants.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {selectedYear === 0 ? 'All years' : `Year ${selectedYear}`}
                        {selectedMonth !== 0 && ` • ${MONTH_NAMES[selectedMonth - 1]}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Globe className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Countries</p>
                      <p className="text-3xl font-bold text-gray-900">{Object.keys(countriesData).length}</p>
                      <p className="text-xs text-gray-500">
                        {selectedCountry === 'all' ? 'All countries' : selectedCountry}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Responses</p>
                      <p className="text-3xl font-bold text-gray-900">{insights.reduce((sum, i) => sum + i.totalResponses, 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Filtered data
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Data Years</p>
                      <p className="text-3xl font-bold text-gray-900">{availableYears.length}</p>
                      <p className="text-xs text-gray-500">
                        {availableYears.length > 0 ? `${Math.min(...availableYears)}-${Math.max(...availableYears)}` : 'No data'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends Chart for Current Year */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-orange-800">Monthly Response Trends</CardTitle>
                <CardDescription>
                  Survey participation by month {selectedYear === 0 ? 'across all years' : `in ${selectedYear}`}
                  {selectedCountry !== 'all' && ` for ${selectedCountry}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="monthName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="responses" fill="#E97B47" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Countries Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Top Participating Countries</CardTitle>
                <CardDescription>
                  Countries with the most survey responses {selectedYear === 0 ? 'across all years' : `in ${selectedYear}`}
                  {selectedMonth !== 0 && ` during ${MONTH_NAMES[selectedMonth - 1]}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTopCountries()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="country" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-blue-800">Survey Categories Distribution</CardTitle>
                <CardDescription>Response distribution across different topic categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCategoryInsights()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, responses }) => `${category}: ${responses}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="responses"
                    >
                      {getCategoryInsights().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-orange-800">Monthly Participation Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of survey participation by month
                  {selectedYear !== 0 && ` for ${selectedYear}`}
                  {selectedCountry !== 'all' && ` in ${selectedCountry}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="monthName" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="responses" 
                      stroke="#E97B47" 
                      strokeWidth={3}
                      dot={{ fill: '#E97B47', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: '#E97B47' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthlyTrends.map((monthData) => (
                <Card key={monthData.month} className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{monthData.monthName}</h3>
                        <p className="text-gray-600">Month {monthData.month}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Responses</span>
                        <span className="font-semibold">{monthData.responses.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(monthData.responses / Math.max(...monthlyTrends.map(m => m.responses))) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      {monthData.responses === 0 ? 'No responses this month' :
                       monthData.responses === Math.max(...monthlyTrends.map(m => m.responses)) ? 'Peak month' :
                       'Active participation'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other existing tabs remain the same but with enhanced styling */}
          <TabsContent value="insights" className="space-y-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  Showing insights for {selectedYear === 0 ? 'all years' : selectedYear}
                  {selectedMonth !== 0 && ` • ${MONTH_NAMES[selectedMonth - 1]}`}
                  {selectedCountry !== 'all' && ` in ${selectedCountry}`}
                </span>
              </div>
            </div>
            <div className="grid gap-6">
              {insights.slice(0, 20).map((insight, index) => {
                const responseData = Object.entries(insight.responses).map(([answer, count]) => ({
                  answer: answer.length > 30 ? answer.substring(0, 30) + '...' : answer,
                  count,
                  percentage: formatPercentage(count, insight.totalResponses)
                })).sort((a, b) => b.count - a.count);

                return (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-900">{insight.surveyTitle}</CardTitle>
                          <CardDescription className="mt-2 text-gray-700">{insight.question}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="border-orange-200 text-orange-800">{insight.category}</Badge>
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                            {insight.year} • {MONTH_NAMES[insight.month - 1]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {insight.totalResponses} responses
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {responseData.map((item, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-800">{item.answer}</span>
                              <span className="text-sm text-orange-600 font-semibold">{item.percentage}%</span>
                            </div>
                            <Progress value={parseFloat(item.percentage)} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Continue with other tabs with enhanced styling... */}
          <TabsContent value="countries" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getTopCountries().map((country, index) => (
                <Card key={country.country} className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{country.country}</h3>
                        <p className="text-gray-600">{country.count} responses</p>
                        <p className="text-xs text-gray-500">
                          {selectedYear === 0 ? 'All years' : `Year ${selectedYear}`}
                          {selectedMonth !== 0 && ` • ${MONTH_NAMES[selectedMonth - 1]}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">#{index + 1}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress 
                        value={(country.count / Math.max(...Object.values(countriesData))) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCategoryInsights().map((category, index) => {
                const IconComponent = CATEGORY_ICONS[category.category as keyof typeof CATEGORY_ICONS] || TrendingUp;
                return (
                  <Card key={category.category} className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                          <IconComponent className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.category}</h3>
                          <p className="text-sm text-gray-600">{category.surveys} surveys</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Responses</span>
                          <span className="font-semibold">{category.responses}</span>
                        </div>
                        <Progress 
                          value={(category.responses / Math.max(...getCategoryInsights().map(c => c.responses))) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-800">Year-over-Year Analysis</CardTitle>
                <CardDescription>
                  Compare survey participation and responses across different years
                  {selectedCountry !== 'all' && ` in ${selectedCountry}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={yearlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="responses" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {yearlyTrends.map((yearData) => (
                <Card key={yearData.year} className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{yearData.year}</h3>
                        <p className="text-gray-600">Survey Year</p>
                      </div>
                      <Calendar className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Responses</span>
                        <span className="font-semibold">{yearData.responses.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(yearData.responses / Math.max(...yearlyTrends.map(y => y.responses))) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      {yearData.year === new Date().getFullYear() ? 'Current year' : 
                       yearData.year === new Date().getFullYear() - 1 ? 'Last year' : 
                       `${new Date().getFullYear() - yearData.year} years ago`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}