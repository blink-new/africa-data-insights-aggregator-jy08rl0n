export interface SurveyQuestion {
  id: string
  question: string
  options: string[]
}

export interface Survey {
  id: string
  title: string
  description: string
  questions: SurveyQuestion[]
  isActive: boolean
  createdAt: string
  userId: string
}

export interface SurveyResponse {
  id: string
  surveyId: string
  userId: string
  questionIndex: number
  answer: string
  responseYear: number
  firstName?: string
  lastName?: string
  phoneNumber?: string
  country?: string
  isVerified?: boolean
  createdAt: string
}

export interface SurveyInsight {
  surveyId: string
  surveyTitle: string
  questionInsights: {
    questionId: string
    question: string
    results: {
      option: string
      count: number
      percentage: number
    }[]
    totalResponses: number
  }[]
}