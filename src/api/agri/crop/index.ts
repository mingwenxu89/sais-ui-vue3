import request from '@/config/axios'

/** 作物信息 VO */
export interface CropVO {
  id?: number // 编号
  cropName: string // 作物名称
  cropType: number // 作物类型
  variety?: string // 品种
  growthPeriod?: number // 生长周期(天)
  soilPhMin?: number // 土壤pH最小值
  soilPhMax?: number // 土壤pH最大值
  irrigationMethod?: number // 灌溉方式
  droughtResistance?: number // 抗旱性
  waterloggingTolerance?: number // 耐涝性
  imageUrl?: string // 作物图片URL
  createTime?: any // 创建时间
  growthStages?: CropGrowthStageVO[] // 生长阶段列表
}

/** 作物生长阶段 VO */
export interface CropGrowthStageVO {
  id?: number // 编号
  cropId: number // 作物ID
  stageName: string // 阶段名称
  stageOrder: number // 阶段序号
  durationDays: number // 阶段持续天数
  soilMoistureMin?: number // 土壤湿度最小阈值(%)
  soilMoistureMax?: number // 土壤湿度最大阈值(%)
  soilMoistureOptimal?: number // 土壤湿度最佳阈值(%)
}

// 作物信息 API
export const CropApi = {
  // 查询作物信息分页
  getCropPage: async (params: any) => {
    return await request.get({ url: `/agri/crop/page`, params })
  },

  // 查询作物信息详情
  getCrop: async (id: number) => {
    return await request.get({ url: `/agri/crop/get?id=` + id })
  },

  // 新增作物信息
  createCrop: async (data: CropVO) => {
    return await request.post({ url: `/agri/crop/create`, data })
  },

  // 修改作物信息
  updateCrop: async (data: CropVO) => {
    return await request.put({ url: `/agri/crop/update`, data })
  },

  // 删除作物信息
  deleteCrop: async (id: number) => {
    return await request.delete({ url: `/agri/crop/delete?id=` + id })
  },

  // 导出作物信息 Excel
  exportCrop: async (params: any) => {
    return await request.download({ url: `/agri/crop/export-excel`, params })
  }
}

// 作物生长阶段 API
export const CropGrowthStageApi = {
  // 查询作物生长阶段分页
  getCropGrowthStagePage: async (params: any) => {
    return await request.get({ url: `/agri/crop-growth-stage/page`, params })
  },

  // 查询作物生长阶段详情
  getCropGrowthStage: async (id: number) => {
    return await request.get({ url: `/agri/crop-growth-stage/get?id=` + id })
  },

  // 根据作物ID查询生长阶段列表
  getCropGrowthStageListByCropId: async (cropId: number) => {
    return await request.get({ url: `/agri/crop-growth-stage/list-by-crop-id?cropId=` + cropId })
  },

  // 新增作物生长阶段
  createCropGrowthStage: async (data: CropGrowthStageVO) => {
    return await request.post({ url: `/agri/crop-growth-stage/create`, data })
  },

  // 修改作物生长阶段
  updateCropGrowthStage: async (data: CropGrowthStageVO) => {
    return await request.put({ url: `/agri/crop-growth-stage/update`, data })
  },

  // 删除作物生长阶段
  deleteCropGrowthStage: async (id: number) => {
    return await request.delete({ url: `/agri/crop-growth-stage/delete?id=` + id })
  },

  // 导出作物生长阶段 Excel
  exportCropGrowthStage: async (params: any) => {
    return await request.download({ url: `/agri/crop-growth-stage/export-excel`, params })
  }
}
