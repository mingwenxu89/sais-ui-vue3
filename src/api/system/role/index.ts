import request from '@/config/axios'

export interface RoleVO {
  id: number
  name: string
  code: string
  sort: number
  status: number
  type: number
  dataScope: number
  dataScopeDeptIds: number[]
  createTime: Date
}

// Query role list
export const getRolePage = async (params: PageParam) => {
  return await request.get({ url: '/system/role/page', params })
}

// Query simplified role list
export const getSimpleRoleList = async (): Promise<RoleVO[]> => {
  return await request.get({ url: '/system/role/simple-list' })
}

// Query role details
export const getRole = async (id: number) => {
  return await request.get({ url: '/system/role/get?id=' + id })
}

// Create role
export const createRole = async (data: RoleVO) => {
  return await request.post({ url: '/system/role/create', data })
}

// Update role
export const updateRole = async (data: RoleVO) => {
  return await request.put({ url: '/system/role/update', data })
}

// Delete role
export const deleteRole = async (id: number) => {
  return await request.delete({ url: '/system/role/delete?id=' + id })
}

// Batch delete roles
export const deleteRoleList = async (ids: number[]) => {
  return await request.delete({ url: '/system/role/delete-list', params: { ids: ids.join(',') } })
}

// Export roles
export const exportRole = (params: any) => {
  return request.download({
    url: '/system/role/export-excel',
    params
  })
}
