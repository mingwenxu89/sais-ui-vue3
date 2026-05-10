import request from '@/config/axios'

/** 灌溉计划 VO */
export interface IrrigationPlanVO {
  id?: number
  farmId?: number
  fieldId?: number
  fieldName?: string
  deviceId?: number
  cropPlanId?: number
  decisionSource?: string   // MANUAL / AI
  decisionReason?: string
  plannedStartTime?: string
  plannedDuration?: number  // minutes
  status?: string           // PENDING / EXECUTING / COMPLETED / CANCELLED
  actualStartTime?: string
  actualEndTime?: string
  waterQuantity?: number
  createTime?: string
}

export const IrrigationPlanApi = {
  getIrrigationPlanPage: async (params: any) => {
    return await request.get({ url: `/agri/irrigation-plan/page`, params })
  },

  getIrrigationPlan: async (id: number) => {
    return await request.get({ url: `/agri/irrigation-plan/get?id=` + id })
  },

  createIrrigationPlan: async (data: IrrigationPlanVO) => {
    return await request.post({ url: `/agri/irrigation-plan/create`, data })
  },

  updateIrrigationPlan: async (data: IrrigationPlanVO) => {
    return await request.put({ url: `/agri/irrigation-plan/update`, data })
  },

  deleteIrrigationPlan: async (id: number) => {
    return await request.delete({ url: `/agri/irrigation-plan/delete?id=` + id })
  },

  cancelIrrigationPlan: async (id: number) => {
    return await request.post({ url: `/agri/irrigation-plan/cancel?id=` + id })
  },

  exportIrrigationPlan: async (params: any) => {
    return await request.download({ url: `/agri/irrigation-plan/export-excel`, params })
  }
}
