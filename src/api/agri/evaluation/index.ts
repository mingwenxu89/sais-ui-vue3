import request from '@/config/axios'

export interface DecisionComparisonVO {
  id?: number
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
  ruleDurationMinutes?: number
  aiDecision?: string
  aiReason?: string
  aiDurationMinutes?: number
  aligned?: boolean
  aiAvailable?: boolean
  evaluatedAt?: string
  createTime?: string
}

export const EvaluationApi = {
  compareDecision: async (): Promise<DecisionComparisonVO[]> => {
    return await request.get({ url: `/agri/evaluation/decision-comparison` })
  },

  getRecordPage: async (params: any) => {
    return await request.get({ url: `/agri/evaluation/record-page`, params })
  }
}
