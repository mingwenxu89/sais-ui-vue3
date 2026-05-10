import request from '@/config/axios'

export interface CropPlanVO {
  id?: number
  cropId?: number
  cropName?: string
  fieldId?: number
  fieldName?: string
  growStatus?: number
  startDate?: string
  endDate?: string
  createTime?: any
}

export const CropPlanApi = {
  getCropPlanPage: async (params: any) => {
    return await request.get({ url: `/agri/crop-plan/page`, params })
  },

  getCurrentCropPlan: async (fieldId: number): Promise<CropPlanVO | null> => {
    return await request.get({ url: `/agri/crop-plan/current?fieldId=` + fieldId })
  },

  getCropPlan: async (id: number) => {
    return await request.get({ url: `/agri/crop-plan/get?id=` + id })
  },

  createCropPlan: async (data: CropPlanVO) => {
    return await request.post({ url: `/agri/crop-plan/create`, data })
  },

  updateCropPlan: async (data: CropPlanVO) => {
    return await request.put({ url: `/agri/crop-plan/update`, data })
  },

  deleteCropPlan: async (id: number) => {
    return await request.delete({ url: `/agri/crop-plan/delete?id=` + id })
  },

  exportCropPlan: async (params: any) => {
    return await request.download({ url: `/agri/crop-plan/export-excel`, params })
  }
}
