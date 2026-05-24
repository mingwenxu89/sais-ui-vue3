import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import {hasPermission} from "@/directives/permission/hasPermi";


const { t } = useI18n() // Internationalization

/**
 * String permission check
 * @param {Array} value Check value
 * @returns {Boolean}
 */
export function checkPermi(permission: string[]) {
  return hasPermission(permission)
}

/**
 * Role permission check
 * @param {string[]} value Check value
 * @returns {Boolean}
 */
export function checkRole(value: string[]) {
  if (value && value instanceof Array && value.length > 0) {
    const { wsCache } = useCache()
    const permissionRoles = value
    const super_admin = 'super_admin'
    const userInfo = wsCache.get(CACHE_KEY.USER)
    const roles = userInfo?.roles || []
    const hasRole = roles.some((role: string) => {
      return super_admin === role || permissionRoles.includes(role)
    })
    return !!hasRole
  } else {
    console.error(t('permission.hasRole'))
    return false
  }
}
