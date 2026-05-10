import request from '@/config/axios'

export interface FarmVO {
  id?: number
  farmName?: string
  longitude?: number
  latitude?: number
  address?: string
}

export const FarmApi = {
  getCurrentFarm: async () => {
    return await request.get({ url: `/agri/farm/current` })
  },

  saveCurrentFarm: async (data: FarmVO) => {
    return await request.put({ url: `/agri/farm/current`, data })
  },

  getFarmPage: async (params: any) => {
    return await request.get({ url: `/agri/farm/page`, params })
  }
}
