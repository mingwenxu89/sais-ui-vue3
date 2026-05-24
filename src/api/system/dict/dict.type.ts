import request from '@/config/axios'

export interface DictTypeVO {
  id: number
  name: string
  type: string
  status: number
  remark: string
  createTime: Date
}

// Query simplified dict type list
export const getSimpleDictTypeList = (): Promise<DictTypeVO[]> => {
  return request.get({ url: '/system/dict-type/simple-list' })
}

// Query dict type list
export const getDictTypePage = (params: PageParam) => {
  return request.get({ url: '/system/dict-type/page', params })
}

// Query dict type details
export const getDictType = (id: number) => {
  return request.get({ url: '/system/dict-type/get?id=' + id })
}

// Create dict type
export const createDictType = (data: DictTypeVO) => {
  return request.post({ url: '/system/dict-type/create', data })
}

// Update dict type
export const updateDictType = (data: DictTypeVO) => {
  return request.put({ url: '/system/dict-type/update', data })
}

// Delete dict type
export const deleteDictType = (id: number) => {
  return request.delete({ url: '/system/dict-type/delete?id=' + id })
}

// Batch delete dict types
export const deleteDictTypeList = (ids: number[]) => {
  return request.delete({ url: '/system/dict-type/delete-list', params: { ids: ids.join(',') } })
}

// Export dict types
export const exportDictType = (params) => {
  return request.download({
    url: '/system/dict-type/export-excel',
    params
  })
}
