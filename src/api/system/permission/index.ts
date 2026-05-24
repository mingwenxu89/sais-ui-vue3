import request from '@/config/axios'

export interface PermissionAssignUserRoleReqVO {
  userId: number
  roleIds: number[]
}

export interface PermissionAssignRoleMenuReqVO {
  roleId: number
  menuIds: number[]
}

export interface PermissionAssignRoleDataScopeReqVO {
  roleId: number
  dataScope: number
  dataScopeDeptIds: number[]
}

// Query menu permissions owned by a role
export const getRoleMenuList = async (roleId: number) => {
  return await request.get({ url: '/system/permission/list-role-menus?roleId=' + roleId })
}

// Assign menu permissions to a role
export const assignRoleMenu = async (data: PermissionAssignRoleMenuReqVO) => {
  return await request.post({ url: '/system/permission/assign-role-menu', data })
}

// Assign data permissions to a role
export const assignRoleDataScope = async (data: PermissionAssignRoleDataScopeReqVO) => {
  return await request.post({ url: '/system/permission/assign-role-data-scope', data })
}

// Query roles owned by a user
export const getUserRoleList = async (userId: number) => {
  return await request.get({ url: '/system/permission/list-user-roles?userId=' + userId })
}

// Assign roles to a user
export const assignUserRole = async (data: PermissionAssignUserRoleReqVO) => {
  return await request.post({ url: '/system/permission/assign-user-role', data })
}
