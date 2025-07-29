import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Users, TrendingUp, Globe } from 'lucide-react'
import { SurveyInsight } from '@/types/survey'
import { blink } from '@/blink/client'

export function InsightsDashboard() {
  const [insights, setInsights] = useState<SurveyInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [totalResponses, setTotalResponses] = useState(0)

  const loadInsights = useCallback(async () => {
    try {
      // Get all surveys
      const surveys = await blink.db.surveys.list({
        where: { isActive: "1" },
        orderBy: { createdAt: 'desc' }
      })

      // Get all responses
      const responses = await blink.db.surveyResponses.list({
        orderBy: { createdAt: 'desc' }
      })

      setTotalResponses(responses.length)

      // Process insights
      const processedInsights: SurveyInsight[] = surveys.map(survey => {
        const surveyResponses = responses.filter(r => r.surveyId === survey.id)
        const questions = JSON.parse(survey.questions)
        
        const questionInsights = questions.map((question: any) => {
          const questionResponses = surveyResponses
            .map(r => JSON.parse(r.responses))
            .flat()
            .filter(r => r.questionId === question.id)

          const optionCounts: Record<string, number> = {}
          question.options.forEach((option: string) => {
            optionCounts[option] = 0
          })

          questionResponses.forEach(response => {
            if (Object.prototype.hasOwnProperty.call(optionCounts, response.answer)) {
              optionCounts[response.answer]++
            }
          })

          const totalQuestionResponses = questionResponses.length
          const results = Object.entries(optionCounts).map(([option, count]) => ({
            option,
            count,
            percentage: totalQuestionResponses > 0 ? Math.round((count / totalQuestionResponses) * 100) : 0
          }))

          return {
            questionId: question.id,
            question: question.question,
            results: results.sort((a, b) => b.count - a.count),
            totalResponses: totalQuestionResponses
          }
        })

        return {
          surveyId: survey.id,
          surveyTitle: survey.title,
          questionInsights
        }
      })

      setInsights(processedInsights)
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInsights()
  }, [loadInsights])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900">{totalResponses}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Surveys</p>
                <p className="text-3xl font-bold text-gray-900">{insights.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Community Reach</p>
                <p className="text-3xl font-bold text-gray-900">Africa</p>
              </div>
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Insights</h2>
          <p className="text-lg text-gray-600">
            Real-time data from African voices sharing their perspectives
          </p>
        </div>

        {insights.map((insight) => (
          <Card key={insight.surveyId} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>{insight.surveyTitle}</span>
              </CardTitle>
              <CardDescription>
                Based on responses from the African community
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-8">
                {insight.questionInsights.map((questionInsight) => (
                  <div key={questionInsight.questionId}>
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {questionInsight.question}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {questionInsight.totalResponses} responses
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {questionInsight.results.map((result, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {result.option}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {result.count} responses
                              </span>
                              <Badge 
                                variant={index === 0 ? "default" : "secondary"}
                                className={index === 0 ? "bg-primary" : ""}
                              >
                                {result.percentage}%
                              </Badge>
                            </div>
                          </div>
                          <Progress 
                            value={result.percentage} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>

                    {questionInsight.results.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>{questionInsight.results[0].percentage}% of Africans</strong> responded with "{questionInsight.results[0].option}" 
                          {questionInsight.totalResponses > 0 && (
                            <span> (based on {questionInsight.totalResponses} responses)</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {insights.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No insights yet</h3>
              <p className="text-gray-600">
                Be the first to participate in our surveys and help build community insights!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}