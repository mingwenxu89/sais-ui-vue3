import request from '@/config/axios'

/** IoT 设备 VO */
export interface DeviceVO {
  id?: number // 编号
  name: string // 设备名称
  deviceCode: string // 设备编码
  deviceType: number // 设备类型
  fieldId?: number // 所属地块ID
  ipAddress?: string // IP地址
  status: number // 状态
  lastOnline?: string // 最后在线时间
  description?: string // 描述
}

// IoT 设备 API
export const DeviceApi = {
  // 查询IoT设备分页
  getDevicePage: async (params: any) => {
    return await request.get({ url: `/agri/device/page`, params })
  },

  // 查询IoT设备详情
  getDevice: async (id: number) => {
    return await request.get({ url: `/agri/device/get?id=` + id })
  },

  // 新增IoT设备
  createDevice: async (data: DeviceVO) => {
    return await request.post({ url: `/agri/device/create`, data })
  },

  // 修改IoT设备
  updateDevice: async (data: DeviceVO) => {
    return await request.put({ url: `/agri/device/update`, data })
  },

  // 删除IoT设备
  deleteDevice: async (id: number) => {
    return await request.delete({ url: `/agri/device/delete?id=` + id })
  },

  // 导出IoT设备 Excel
  exportDevice: async (params: any) => {
    return await request.download({ url: `/agri/device/export-excel`, params })
  }
}
