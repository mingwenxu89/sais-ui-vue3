import request from '@/config/axios'

export interface TenantPackageVO {
  id: number
  name: string
  status: number
  remark: string
  creator: string
  updater: string
  updateTime: string
  menuIds: number[]
  createTime: Date
}

// Query tenant package list
export const getTenantPackagePage = (params: PageParam) => {
  return request.get({ url: '/system/tenant-package/page', params })
}

// Get tenant package
export const getTenantPackage = (id: number) => {
  return request.get({ url: '/system/tenant-package/get?id=' + id })
}

// Create tenant package
export const createTenantPackage = (data: TenantPackageVO) => {
  return request.post({ url: '/system/tenant-package/create', data })
}

// Update tenant package
export const updateTenantPackage = (data: TenantPackageVO) => {
  return request.put({ url: '/system/tenant-package/update', data })
}

// Delete tenant package
export const deleteTenantPackage = (id: number) => {
  return request.delete({ url: '/system/tenant-package/delete?id=' + id })
}

// Batch delete tenant packages
export const deleteTenantPackageList = (ids: number[]) => {
  return request.delete({ url: '/system/tenant-package/delete-list', params: { ids: ids.join(',') } })
}

// Get simplified tenant package list
export const getTenantPackageList = () => {
  return request.get({ url: '/system/tenant-package/simple-list' })
}
