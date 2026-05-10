import request from '@/config/axios'

export interface SensorDataVO {
  id?: number
  sensorCode?: string
  fieldName?: string
  dataType?: string
  value?: number
  collectedAt?: string
}

export const SensorDataApi = {
  getSensorDataPage: async (params: any) => {
    return await request.get({ url: `/agri/sensor-data/page`, params })
  },

  deleteSensorData: async (id: number) => {
    return await request.delete({ url: `/agri/sensor-data/delete?id=` + id })
  },

  injectSensorData: async (params: { dataType: string; value: number; sensorId?: number; farmId?: number; fieldId?: number }) => {
    return await request.post({ url: `/agri/sensor-data/inject`, params })
  },
}
