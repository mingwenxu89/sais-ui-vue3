import request from '@/config/axios'

export interface IrrigationDeviceVO {
  id?: number
  deviceCode?: string
  farmId?: number
  farmName?: string
  fieldId?: number
  fieldName?: string
  sensorId?: number
  sensorCode?: string
  flowRate?: number
  isWatering?: boolean
  status?: number
  statusName?: string
  wateringStartedAt?: string
  simulateFault?: boolean
  createTime?: any
  actionLoading?: boolean
}

export const IrrigationDeviceApi = {
  getIrrigationDevicePage: async (params: any) => {
    return await request.get({ url: `/agri/irrigation-device/page`, params })
  },

  getIrrigationDevice: async (id: number) => {
    return await request.get({ url: `/agri/irrigation-device/get?id=` + id })
  },

  createIrrigationDevice: async (data: IrrigationDeviceVO) => {
    return await request.post({ url: `/agri/irrigation-device/create`, data })
  },

  updateIrrigationDevice: async (data: IrrigationDeviceVO) => {
    return await request.put({ url: `/agri/irrigation-device/update`, data })
  },

  deleteIrrigationDevice: async (id: number) => {
    return await request.delete({ url: `/agri/irrigation-device/delete?id=` + id })
  },

  exportIrrigationDevice: async (params: any) => {
    return await request.download({ url: `/agri/irrigation-device/export-excel`, params })
  },

  startWatering: async (id: number) => {
    return await request.post({ url: `/agri/irrigation-device/start-watering/` + id })
  },

  stopWatering: async (id: number) => {
    return await request.post({ url: `/agri/irrigation-device/stop-watering/` + id })
  }
}
