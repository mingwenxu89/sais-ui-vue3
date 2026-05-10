import request from '@/config/axios'

export interface DecisionComparisonVO {
  fieldId?: number
  fieldName?: string
  cropName?: string
  stageName?: string
  currentMoisture?: number
  moistureMin?: number
  moistureOptimal?: number
  tomorrowRainfall?: number
  ruleDecision?: string
  ruleReason?: string
  aiDecision?: string
  aiReason?: string
  aiDurationMinutes?: number
  aligned?: boolean
  aiAvailable?: boolean
}

export const EvaluationApi = {
  compareDecision: async (): Promise<DecisionComparisonVO[]> => {
    return await request.get({ url: `/agri/evaluation/decision-comparison` })
  }
}
