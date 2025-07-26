import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, ArrowRight, ArrowLeft, Clock, AlertCircle } from 'lucide-react'
import { Survey, SurveyQuestion } from '@/types/survey'
import { blink } from '@/blink/client'
import { toast } from 'sonner'

interface SurveyCardProps {
  survey: Survey
  onComplete: () => void
}

export function SurveyCard({ survey, onComplete }: SurveyCardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasCompletedThisYear, setHasCompletedThisYear] = useState(false)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true)
  const [lastCompletedYear, setLastCompletedYear] = useState<number | null>(null)

  const currentYear = new Date().getFullYear()
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100
  const currentQ = survey.questions[currentQuestion]

  // Check if user has already completed this survey this year
  useEffect(() => {
    const checkSurveyEligibility = async () => {
      try {
        const user = await blink.auth.me()
        
        // Check if user has completed this survey in the current year
        const existingResponses = await blink.db.surveyResponses.list({
          where: { 
            user_id: user.id, 
            survey_id: survey.id,
            response_year: currentYear
          },
          limit: 1
        })

        if (existingResponses.length > 0) {
          setHasCompletedThisYear(true)
          
          // Get the year they last completed it
          const allResponses = await blink.db.surveyResponses.list({
            where: { 
              user_id: user.id, 
              survey_id: survey.id
            },
            orderBy: { response_year: 'desc' },
            limit: 1
          })
          
          if (allResponses.length > 0) {
            setLastCompletedYear(allResponses[0].response_year)
          }
        }
      } catch (error) {
        console.error('Error checking survey eligibility:', error)
      } finally {
        setIsCheckingEligibility(false)
      }
    }

    checkSurveyEligibility()
  }, [survey.id, currentYear])

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setResponses(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const user = await blink.auth.me()
      
      // Double-check eligibility before submitting
      const existingResponses = await blink.db.surveyResponses.list({
        where: { 
          user_id: user.id, 
          survey_id: survey.id,
          response_year: currentYear
        },
        limit: 1
      })

      if (existingResponses.length > 0) {
        toast.error('You have already completed this survey this year. Please try again next year.')
        setHasCompletedThisYear(true)
        setIsSubmitting(false)
        return
      }
      
      // Get user verification data
      const verifications = await blink.db.userVerifications.list({
        where: { userId: user.id, isVerified: "1" },
        orderBy: { createdAt: 'desc' },
        limit: 1
      })
      
      const verification = verifications[0]

      // Submit each question response separately with the current year
      for (let i = 0; i < survey.questions.length; i++) {
        const question = survey.questions[i]
        const answer = responses[question.id]
        
        if (answer) {
          await blink.db.surveyResponses.create({
            id: `response_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            survey_id: survey.id,
            user_id: user.id,
            question_index: i,
            answer: answer,
            response_year: currentYear, // Add the current year
            first_name: verification?.first_name,
            last_name: verification?.last_name,
            phone_number: verification?.phone_number,
            country: verification?.country,
            is_verified: verification?.is_verified || false,
            created_at: new Date().toISOString()
          })
        }
      }

      setIsCompleted(true)
      toast.success('Thank you for your response! Your voice matters.')
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (error) {
      console.error('Error submitting survey:', error)
      toast.error('Failed to submit survey. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = responses[currentQ?.id]
  const isLastQuestion = currentQuestion === survey.questions.length - 1
  const allQuestionsAnswered = survey.questions.every(q => responses[q.id])

  // Loading state while checking eligibility
  if (isCheckingEligibility) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking survey eligibility...</p>
        </CardContent>
      </Card>
    )
  }

  // Show restriction message if user has already completed this year
  if (hasCompletedThisYear) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6">
            <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Survey Already Completed</h3>
            <p className="text-gray-600 mb-4">
              You have already completed this survey in {lastCompletedYear || currentYear}.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                <p className="text-sm font-medium text-orange-800">
                  Annual Survey Limit
                </p>
              </div>
              <p className="text-sm text-orange-700">
                To ensure data quality and prevent duplicate responses, each survey can only be completed once per year. 
                You'll be able to participate in this survey again starting January {currentYear + 1}.
              </p>
            </div>
          </div>
          <Button 
            onClick={onComplete}
            variant="outline"
            className="mt-4"
          >
            Back to Surveys
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Completion state
  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">
              Your response has been recorded for {currentYear} and will contribute to our community insights.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              Your voice helps us understand African perspectives better. 
              Check out the insights dashboard to see how your community feels about these topics.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              You can participate in this survey again starting January {currentYear + 1}.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <div>
            <CardTitle className="text-xl text-gray-900">{survey.title}</CardTitle>
            <CardDescription className="mt-1">{survey.description}</CardDescription>
            <div className="mt-2 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-md inline-block">
              Survey Year: {currentYear} • Can retake in {currentYear + 1}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">
              Question {currentQuestion + 1} of {survey.questions.length}
            </div>
            <Progress value={progress} className="w-24" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentQ.question}
          </h3>
          
          <RadioGroup
            value={responses[currentQ.id] || ''}
            onValueChange={(value) => handleAnswerSelect(currentQ.id, value)}
            className="space-y-3"
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={option} id={`${currentQ.id}-${index}`} />
                <Label 
                  htmlFor={`${currentQ.id}-${index}`} 
                  className="flex-1 cursor-pointer text-gray-700"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Survey'}</span>
              <CheckCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}