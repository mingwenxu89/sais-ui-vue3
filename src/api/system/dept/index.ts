import request from '@/config/axios'

export interface DeptVO {
  id: number
  name: string
  parentId: number
  status: number
  sort: number
  leaderUserId: number
  phone: string
  email: string
  createTime: Date
}

// Query simplified department list
export const getSimpleDeptList = (): Promise<DeptVO[]> => {
  return request.get({ url: '/system/dept/simple-list' })
}

// Query department list
export const getDeptList = (params: any) => {
  return request.get({ url: '/system/dept/list', params })
}

// Query department page
export const getDeptPage = async (params: PageParam) => {
  return await request.get({ url: '/system/dept/list', params })
}

// Query department details
export const getDept = (id: number) => {
  return request.get({ url: '/system/dept/get?id=' + id })
}

// Create department
export const createDept = (data: DeptVO) => {
  return request.post({ url: '/system/dept/create', data })
}

// Update department
export const updateDept = (data: DeptVO) => {
  return request.put({ url: '/system/dept/update', data })
}

// Delete department
export const deleteDept = async (id: number) => {
  return await request.delete({ url: '/system/dept/delete?id=' + id })
}

// Batch delete departments
export const deleteDeptList = async (ids: number[]) => {
  return await request.delete({ url: '/system/dept/delete-list', params: { ids: ids.join(',') } })
}
