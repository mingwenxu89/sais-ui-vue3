<template>
  <el-table :data="socialUsers" :show-header="false">
    <el-table-column fixed="left" title="No." type="seq" width="60" />
    <el-table-column align="left" label="Social Platform" width="120">
      <template #default="{ row }">
        <img :src="row.img" alt="" class="h-5 align-middle" />
        <p class="mr-5">{{ row.title }}</p>
      </template>
    </el-table-column>
    <el-table-column align="center" label="Actions">
      <template #default="{ row }">
        <template v-if="row.openid">
          Bound
          <XTextButton class="mr-5" title="(Unbind)" type="primary" @click="unbind(row)" />
        </template>
        <template v-else>
          Not bound
          <XTextButton class="mr-5" title="(Bind)" type="primary" @click="bind(row)" />
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>
<script lang="ts" setup>
import { SystemUserSocialTypeEnum } from '@/utils/constants'
import { getBindSocialUserList } from '@/api/system/social/user'
import { socialAuthRedirect, socialBind, socialUnbind } from '@/api/system/user/socialUser'

defineOptions({ name: 'UserSocial' })
defineProps<{
  activeName: string
}>()
const message = useMessage()
const socialUsers = ref<any[]>([])

const initSocial = async () => {
  socialUsers.value = [] // Reset to avoid infinite growth
  // Get bound social user list
  const bindSocialUserList = await getBindSocialUserList()
  // Check whether each social platform is bound
  for (const i in SystemUserSocialTypeEnum) {
    const socialUser = { ...SystemUserSocialTypeEnum[i] }
    socialUsers.value.push(socialUser)
    if (bindSocialUserList && bindSocialUserList.length > 0) {
      for (const bindUser of bindSocialUserList) {
        if (socialUser.type === bindUser.type) {
          socialUser.openid = bindUser.openid
          break
        }
      }
    }
  }
}
const route = useRoute()
const emit = defineEmits<{
  (e: 'update:activeName', v: string): void
}>()
const bindSocial = () => {
  // Social binding
  const type = getUrlValue('type')
  const code = route.query.code
  const state = route.query.state
  if (!code) {
    return
  }
  socialBind(type, code, state).then(() => {
    message.success('Binding successful')
    emit('update:activeName', 'userSocial')
  })
}

// Double encoding must be decoded after callback
function getUrlValue(key: string): string {
  const url = new URL(decodeURIComponent(location.href))
  return url.searchParams.get(key) ?? ''
}

const bind = (row) => {
  // Double encoding fixes the missing DingTalk callback type parameter
  const redirectUri = location.origin + '/user/profile?' + encodeURIComponent(`type=${row.type}`)
  // Redirect
  socialAuthRedirect(row.type, encodeURIComponent(redirectUri)).then((res) => {
    window.location.href = res
  })
}
const unbind = async (row) => {
  const res = await socialUnbind(row.type, row.openid)
  if (res) {
    row.openid = undefined
  }
  message.success('Unbound successfully')
}

onMounted(async () => {
  await initSocial()
})

watch(
  () => route,
  () => {
    bindSocial()
  },
  {
    immediate: true
  }
)
</script>
