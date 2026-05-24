<template>
  <Dialog v-model="dialogVisible" title="Assign Roles">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="Username">
        <el-input v-model="formData.username" :disabled="true" />
      </el-form-item>
      <el-form-item label="Nickname">
        <el-input v-model="formData.nickname" :disabled="true" />
      </el-form-item>
      <el-form-item label="Roles">
        <el-select v-model="formData.roleIds" multiple placeholder="Select roles">
          <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as PermissionApi from '@/api/system/permission'
import * as UserApi from '@/api/system/user'
import * as RoleApi from '@/api/system/role'

defineOptions({ name: 'SystemUserAssignRoleForm' })

const { t } = useI18n() // I18n
const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const formLoading = ref(false) // Form loading state: 1) loading update data; 2) disabling submit button
const formData = ref({
  id: -1,
  nickname: '',
  username: '',
  roleIds: []
})
const formRef = ref() // Form ref
const roleList = ref([] as RoleApi.RoleVO[]) // Role list

/** Open dialog */
const open = async (row: UserApi.UserVO) => {
  dialogVisible.value = true
  resetForm()
  // Set data
  formData.value.id = row.id
  formData.value.username = row.username
  formData.value.nickname = row.nickname
  // Get the role list assigned to the user
  formLoading.value = true
  try {
    formData.value.roleIds = await PermissionApi.getUserRoleList(row.id)
  } finally {
    formLoading.value = false
  }
  // Get role list
  roleList.value = await RoleApi.getSimpleRoleList()
}
defineExpose({ open }) // Expose open method for opening the dialog

/** Submit form */
const emit = defineEmits(['success']) // Define success event for operation success callback
const submitForm = async () => {
  // Validate form
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // Submit request
  formLoading.value = true
  try {
    await PermissionApi.assignUserRole({
      userId: formData.value.id,
      roleIds: formData.value.roleIds
    })
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // Emit operation success event
    emit('success', true)
  } finally {
    formLoading.value = false
  }
}

/** Reset form */
const resetForm = () => {
  formData.value = {
    id: -1,
    nickname: '',
    username: '',
    roleIds: []
  }
  formRef.value?.resetFields()
}
</script>
