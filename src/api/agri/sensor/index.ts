import request from '@/config/axios'

export interface SensorVO {
  id?: number
  sensorCode?: string
  sensorType?: number
  sensorTypeName?: string
  model?: string
  farmId?: number
  farmName?: string
  fieldId?: number
  fieldName?: string
  isMock?: boolean
  status?: number
  statusName?: string
  createTime?: any
}

export const SensorApi = {
  getSensorPage: async (params: any) => {
    return await request.get({ url: `/agri/sensor/page`, params })
  },

  getSensor: async (id: number) => {
    return await request.get({ url: `/agri/sensor/get?id=` + id })
  },

  createSensor: async (data: SensorVO) => {
    return await request.post({ url: `/agri/sensor/create`, data })
  },

  updateSensor: async (data: SensorVO) => {
    return await request.put({ url: `/agri/sensor/update`, data })
  },

  deleteSensor: async (id: number) => {
    return await request.delete({ url: `/agri/sensor/delete?id=` + id })
  },

  exportSensor: async (params: any) => {
    return await request.download({ url: `/agri/sensor/export-excel`, params })
  },

  getSensorDataPage: async (params: { sensorId: number; pageNo: number; pageSize: number }) => {
    return await request.get({ url: `/agri/sensor-data/page`, params })
  },

  getLatestSensorDataByField: async (fieldId: number) => {
    return await request.get({ url: `/agri/sensor-data/latest-by-field`, params: { fieldId } })
  }
}
