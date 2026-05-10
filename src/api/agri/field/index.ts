import request from '@/config/axios'

export interface FieldVO {
  id?: number
  farmId?: number
  fieldName: string
  area?: number
  longitude?: number
  latitude?: number
  growStatus: string
  boundary?: string
}

export const FieldApi = {
  getFieldPage: async (params: any) => {
    return await request.get({ url: `/agri/field/page`, params })
  },

  getField: async (id: number) => {
    return await request.get({ url: `/agri/field/get?id=` + id })
  },

  createField: async (data: FieldVO) => {
    return await request.post({ url: `/agri/field/create`, data })
  },

  updateField: async (data: FieldVO) => {
    return await request.put({ url: `/agri/field/update`, data })
  },

  deleteField: async (id: number) => {
    return await request.delete({ url: `/agri/field/delete?id=` + id })
  },

  exportField: async (params: any) => {
    return await request.download({ url: `/agri/field/export-excel`, params })
  }
}
