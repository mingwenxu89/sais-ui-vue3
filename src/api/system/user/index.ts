import request from '@/config/axios'

export interface UserVO {
  id: number
  username: string
  nickname: string
  deptId: number
  postIds: string[]
  email: string
  mobile: string
  sex: number
  avatar: string
  loginIp: string
  status: number
  remark: string
  loginDate: Date
  createTime: Date
}

// Query user management list
export const getUserPage = (params: PageParam) => {
  return request.get({ url: '/system/user/page', params })
}

// Query user details
export const getUser = (id: number) => {
  return request.get({ url: '/system/user/get?id=' + id })
}

// Create user
export const createUser = (data: UserVO) => {
  return request.post({ url: '/system/user/create', data })
}

// Update user
export const updateUser = (data: UserVO) => {
  return request.put({ url: '/system/user/update', data })
}

// Delete user
export const deleteUser = (id: number) => {
  return request.delete({ url: '/system/user/delete?id=' + id })
}

// Batch delete users
export const deleteUserList = (ids: number[]) => {
  return request.delete({ url: '/system/user/delete-list', params: { ids: ids.join(',') } })
}

// Export users
export const exportUser = (params: any) => {
  return request.download({ url: '/system/user/export-excel', params })
}

// Download user import template
export const importUserTemplate = () => {
  return request.download({ url: '/system/user/get-import-template' })
}

// Reset user password
export const resetUserPassword = (id: number, password: string) => {
  const data = {
    id,
    password
  }
  return request.put({ url: '/system/user/update-password', data: data })
}

// Update user status
export const updateUserStatus = (id: number, status: number) => {
  const data = {
    id,
    status
  }
  return request.put({ url: '/system/user/update-status', data: data })
}

// Get simplified user list
export const getSimpleUserList = (): Promise<UserVO[]> => {
  return request.get({ url: '/system/user/simple-list' })
}
