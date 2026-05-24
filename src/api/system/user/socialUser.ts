import request from '@/config/axios'

// Bind social account using code authorization
export const socialBind = (type, code, state) => {
  return request.post({
    url: '/system/social-user/bind',
    data: {
      type,
      code,
      state
    }
  })
}

// Unbind social account
export const socialUnbind = (type, openid) => {
  return request.delete({
    url: '/system/social-user/unbind',
    data: {
      type,
      openid
    }
  })
}

// Social authorization redirect
export const socialAuthRedirect = (type, redirectUri) => {
  return request.get({
    url: '/system/auth/social-auth-redirect?type=' + type + '&redirectUri=' + redirectUri
  })
}
