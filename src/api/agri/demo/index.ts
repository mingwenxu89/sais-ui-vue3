import request from '@/config/axios'

export const DemoApi = {
  triggerSensorReport: async () => {
    return await request.post({ url: `/agri/demo/trigger-sensor-report` })
  },

  triggerAiIrrigation: async () => {
    return await request.post({ url: `/agri/demo/trigger-ai-irrigation` })
  },

  triggerIrrigationExecution: async () => {
    return await request.post({ url: `/agri/demo/trigger-irrigation-execution` })
  },

  triggerWeatherFetch: async () => {
    return await request.post({ url: `/agri/demo/trigger-weather-fetch` })
  },

  triggerAlertCheck: async (farmId?: number) => {
    return await request.post({ url: `/agri/demo/trigger-alert-check`, params: { farmId } })
  },

  triggerTestAlert: async (type: string, farmId?: number) => {
    return await request.post({ url: `/agri/demo/trigger-test-alert`, params: { type, farmId } })
  },

  injectSensorData: async (dataType: string, value: number) => {
    return await request.post({ url: `/agri/demo/inject-sensor-data`, params: { dataType, value } })
  },

  injectWeatherForecast: async (field: string, value: number) => {
    return await request.post({ url: `/agri/demo/inject-weather-forecast`, params: { field, value } })
  }
}
