import request from '@/config/axios'

export interface SensorReportingStatusVO {
  running: boolean
  intervalSeconds?: number
  startedAt?: string
  lastRunAt?: string
  lastSuccessCount?: number
  lastFailureCount?: number
}

export interface SensorReportingManualReqVO {
  fieldId: number
  sensorId: number
  dataType: string
  value: number
  collectedAt?: string
}

export const SensorReportingApi = {
  getStatus: async () => {
    return await request.get({ url: `/agri/sensor-reporting/status` })
  },

  start: async (intervalSeconds: number) => {
    return await request.post({ url: `/agri/sensor-reporting/start`, data: { intervalSeconds } })
  },

  stop: async () => {
    return await request.post({ url: `/agri/sensor-reporting/stop` })
  },

  reportManual: async (data: SensorReportingManualReqVO) => {
    return await request.post({ url: `/agri/sensor-reporting/manual-report`, data })
  }
}
