import request from '@/config/axios'

export const DemoApi = {
  triggerAiIrrigation: async () => {
    return await request.post({ url: `/agri/demo/trigger-ai-irrigation` })
  },

  triggerIrrigationExecution: async () => {
    return await request.post({ url: `/agri/demo/trigger-irrigation-execution` })
  },

  triggerTestAlert: async (type: string, farmId?: number) => {
    return await request.post({ url: `/agri/demo/trigger-test-alert`, params: { type, farmId } })
  }
}
