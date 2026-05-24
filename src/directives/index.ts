import type { App } from 'vue'
import { hasRole } from './permission/hasRole'
import { hasPermi } from './permission/hasPermi'

/**
 * Export directives: v-xxx
 * @methods hasRole User permission, usage: v-hasRole
 * @methods hasPermi Button permission, usage: v-hasPermi
 */
export const setupAuth = (app: App<Element>) => {
  hasRole(app)
  hasPermi(app)
}

/**
 * Export directive: v-mountedFocus
 */
export const setupMountedFocus = (app: App<Element>) => {
  app.directive('mountedFocus', {
    mounted(el) {
      el.focus()
    }
  })
}
