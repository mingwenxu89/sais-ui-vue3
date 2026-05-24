import request from '@/config/axios'

export interface DictDataVO {
  id: number
  sort: number
  label: string
  value: string
  dictType: string
  status: number
  colorType: string
  cssClass: string
  remark: string
  createTime: Date
}

// Query simplified dict data list
export const getSimpleDictDataList = () => {
  return request.get({ url: '/system/dict-data/simple-list' })
}

// Query dict data list
export const getDictDataPage = (params: PageParam) => {
  return request.get({ url: '/system/dict-data/page', params })
}

// Query dict data details
export const getDictData = (id: number) => {
  return request.get({ url: '/system/dict-data/get?id=' + id })
}

// Query dict data by dict type
export const getDictDataByType = (dictType: string) => {
  return request.get({ url: '/system/dict-data/type?type=' + dictType })
}

// Create dict data
export const createDictData = (data: DictDataVO) => {
  return request.post({ url: '/system/dict-data/create', data })
}

// Update dict data
export const updateDictData = (data: DictDataVO) => {
  return request.put({ url: '/system/dict-data/update', data })
}

// Delete dict data
export const deleteDictData = (id: number) => {
  return request.delete({ url: '/system/dict-data/delete?id=' + id })
}

// Batch delete dict data
export const deleteDictDataList = (ids: number[]) => {
  return request.delete({ url: '/system/dict-data/delete-list', params: { ids: ids.join(',') } })
}

// Export dict data
export const exportDictData = (params: any) => {
  return request.download({ url: '/system/dict-data/export-excel', params })
}
