import request from '@/config/axios'

/** 告警信息 VO — matches AlertRespVO on the backend */
export interface AlertVO {
  id?: number
  farmId?: number
  fieldId?: number
  fieldName?: string
  irrigationPlanId?: number
  alertType?: number   // 1=SENSOR_ABNORMAL  2=EXTREME_WEATHER  3=IRRIGATION_ABNORMAL
  level?: number       // 1=INFO  2=WARN  3=CRITICAL
  context?: string
  status?: number      // 0=UNHANDLED  1=HANDLING  2=RESOLVED  3=IGNORED
  triggeredAt?: string
  handledAt?: string
  createTime?: string
}

// 告警信息 API
export const AlertApi = {
  getAlertPage: async (params: any) => {
    return await request.get({ url: `/agri/alert/page`, params })
  },

  getAlert: async (id: number) => {
    return await request.get({ url: `/agri/alert/get?id=` + id })
  },

  createAlert: async (data: AlertVO) => {
    return await request.post({ url: `/agri/alert/create`, data })
  },

  updateAlert: async (data: AlertVO) => {
    return await request.put({ url: `/agri/alert/update`, data })
  },

  deleteAlert: async (id: number) => {
    return await request.delete({ url: `/agri/alert/delete?id=` + id })
  },

  exportAlert: async (params: any) => {
    return await request.download({ url: `/agri/alert/export-excel`, params })
  },

  handleAlert: async (id: number, status: number) => {
    return await request.put({ url: `/agri/alert/handle`, data: { id, status } })
  },

  triggerTestAlert: async (type: string, farmId?: number) => {
    return await request.post({ url: `/agri/alert/trigger-test`, params: { type, farmId } })
  },

  injectWeather: async (scenario: string, farmId?: number) => {
    return await request.post({ url: `/agri/alert/inject-weather`, params: { scenario, farmId } })
  },
}
