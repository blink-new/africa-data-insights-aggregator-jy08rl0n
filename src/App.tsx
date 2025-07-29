import { useState, useEffect, useCallback } from 'react'
import { Toaster } from 'sonner'
import { Header } from '@/components/Header'
import { SurveyCard } from '@/components/SurveyCard'
import { InsightsDashboard } from '@/components/InsightsDashboard'
import { VisualizedDashboard } from '@/components/VisualizedDashboard'
import { UserVerification } from '@/components/UserVerification'
import BusinessIntelligenceDashboard from '@/components/BusinessIntelligenceDashboard'
import ProprietaryDataHub from '@/components/ProprietaryDataHub'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Survey } from '@/types/survey'
import { blink } from '@/blink/client'
import { BarChart3, Users, MessageSquare, TrendingUp, Shield, Brain, Database } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null)
  const [activeTab, setActiveTab] = useState('insights')
  const [userVerification, setUserVerification] = useState(null)
  const [showVerification, setShowVerification] = useState(false)

  const loadSurveys = useCallback(async () => {
    try {
      const surveyData = await blink.db.surveys.list({
        where: { is_active: "1" },
        orderBy: { created_at: 'desc' }
      })
      
      const parsedSurveys = surveyData.map(survey => ({
        ...survey,
        questions: JSON.parse(survey.questions),
        isActive: Number(survey.is_active) > 0
      }))
      
      setSurveys(parsedSurveys)
    } catch (error) {
      console.error('Error loading surveys:', error)
    }
  }, [])

  const checkUserVerification = useCallback(async () => {
    try {
      const verifications = await blink.db.userVerifications.list({
        where: { user_id: user.id, is_verified: "1" },
        orderBy: { created_at: 'desc' },
        limit: 1
      })
      
      if (verifications.length > 0) {
        setUserVerification(verifications[0])
      }
    } catch (error) {
      console.error('Error checking verification:', error)
    }
  }, [user])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadSurveys()
      checkUserVerification()
    }
  }, [user, loadSurveys, checkUserVerification])

  const handleVerificationComplete = (verificationData: any) => {
    setUserVerification(verificationData)
    setShowVerification(false)
  }

  const handleStartSurvey = (survey: Survey) => {
    if (!userVerification) {
      setShowVerification(true)
      return
    }
    setCurrentSurvey(survey)
  }

  const handleSurveyComplete = () => {
    setCurrentSurvey(null)
    setActiveTab('insights')
    // Refresh insights by switching tabs
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-green-100 flex items-center justify-center relative overflow-hidden">
        {/* African-inspired background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-400 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-green-400 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-orange-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-40 right-10 w-28 h-28 bg-green-300 rounded-full blur-lg"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-orange-800 mb-2">Africa Data Insights</h2>
          <p className="text-orange-700">Loading your community dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-green-100 flex items-center justify-center relative overflow-hidden">
        {/* African-inspired background imagery */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-200/30 to-green-200/30"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-orange-300 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-green-300 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20"></div>
        </div>
        
        <Card className="max-w-md mx-auto relative z-10 bg-white/90 backdrop-blur-sm border-orange-200 shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mb-6">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-4 w-20 h-20 mx-auto mb-6 shadow-lg">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Africa Data Insights</h2>
              <p className="text-gray-700 leading-relaxed">
                Share your voice and see what the African community thinks about important topics. 
                Your perspective shapes our understanding of the continent.
              </p>
            </div>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Sign In to Participate
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showVerification) {
    return <UserVerification onVerificationComplete={handleVerificationComplete} />
  }

  if (currentSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
        <Header />
        <main className="py-8">
          <SurveyCard 
            survey={currentSurvey} 
            onComplete={handleSurveyComplete}
            userVerification={userVerification}
          />
        </main>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-green-50 relative overflow-hidden">
      {/* Enhanced African-inspired background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-100/50 to-green-100/50"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-40 right-20 w-56 h-56 bg-green-200 rounded-full blur-2xl opacity-40"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-orange-150 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-green-150 rounded-full blur-2xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
      </div>
      
      <Header />
      
      <main className="py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-6">
              Understanding Africa Through Data
            </h1>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-10 leading-relaxed">
              Join thousands of Africans sharing their perspectives on important topics. 
              Your voice matters in building a comprehensive understanding of our continent's 
              challenges, opportunities, and aspirations.
            </p>
            
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
              <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                <div className="text-sm text-gray-700 font-medium">Questions per survey</div>
                <div className="text-xs text-gray-500 mt-1">Quick & easy participation</div>
              </div>
              <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-100">
                <div className="text-3xl font-bold text-green-600 mb-2">2 min</div>
                <div className="text-sm text-gray-700 font-medium">Average completion time</div>
                <div className="text-xs text-gray-500 mt-1">Respect for your time</div>
              </div>
              <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
                <div className="text-sm text-gray-700 font-medium">Anonymous responses</div>
                <div className="text-xs text-gray-500 mt-1">Your privacy protected</div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto mb-8 bg-white/80 backdrop-blur-sm border border-orange-200">
              <TabsTrigger value="insights" className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="detailed" className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Brain className="h-4 w-4" />
                <span>Business Intel</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Database className="h-4 w-4" />
                <span>Data Hub</span>
              </TabsTrigger>
              <TabsTrigger value="participate" className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4" />
                <span>Take Survey</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="insights">
              <VisualizedDashboard />
            </TabsContent>

            <TabsContent value="detailed">
              <InsightsDashboard />
            </TabsContent>

            <TabsContent value="business">
              <BusinessIntelligenceDashboard userVerification={userVerification} />
            </TabsContent>

            <TabsContent value="data">
              <ProprietaryDataHub />
            </TabsContent>

            <TabsContent value="participate">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Available Surveys</h2>
                  <p className="text-gray-700 text-lg">
                    Choose a survey to share your perspective and contribute to community insights
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {surveys.map((survey) => (
                    <Card key={survey.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border-orange-100 hover:border-orange-200 transform hover:scale-105">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-gray-900">
                          <Users className="h-5 w-5 text-orange-600" />
                          <span>{survey.title}</span>
                        </CardTitle>
                        <CardDescription className="text-gray-600">{survey.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            {survey.questions.length} questions • ~2 minutes
                          </div>
                          <Button 
                            onClick={() => handleStartSurvey(survey)}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg transform transition hover:scale-105"
                          >
                            {userVerification ? 'Start Survey' : 'Verify & Start'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {surveys.length === 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-16 w-16 text-orange-400 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">No surveys available</h3>
                      <p className="text-gray-600">
                        Check back soon for new surveys to participate in!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Toaster />
    </div>
  )
}

export default App