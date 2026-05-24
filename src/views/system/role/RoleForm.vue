<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="Role Name" prop="name">
        <el-input v-model="formData.name" placeholder="Enter Role Name" />
      </el-form-item>
      <el-form-item label="Role Key" prop="code">
        <el-input v-model="formData.code" placeholder="Enter Role Key" />
      </el-form-item>
      <el-form-item label="Sort" prop="sort">
        <el-input v-model="formData.sort" placeholder="Enter Sort" />
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select v-model="formData.status" clearable placeholder="Select Status">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Remark" prop="remark">
        <el-input v-model="formData.remark" placeholder="Enter Remark" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as RoleApi from '@/api/system/role'

defineOptions({ name: 'SystemRoleForm' })

const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const dialogTitle = ref('') // Dialog title
const formLoading = ref(false) // Form loading state: 1) data loading during update; 2) submit button disabled
const formType = ref('') // Form type: create - add; update - modify
const formData = ref({
  id: undefined,
  name: '',
  code: '',
  sort: undefined,
  status: CommonStatusEnum.ENABLE,
  remark: ''
})
const formRules = reactive({
  name: [{ required: true, message: 'Role Name cannot be empty', trigger: 'blur' }],
  code: [{ required: true, message: 'Role Key cannot be empty', trigger: 'change' }],
  sort: [{ required: true, message: 'Sort cannot be empty', trigger: 'change' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'change' }],
  remark: [{ required: false, message: 'Remark cannot be empty', trigger: 'blur' }]
})
const formRef = ref() // Form ref

/** Open dialog */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // Set data during update
  if (id) {
    formLoading.value = true
    try {
      formData.value = await RoleApi.getRole(id)
    } finally {
      formLoading.value = false
    }
  }
}

/** Reset form */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    code: '',
    sort: undefined,
    status: CommonStatusEnum.ENABLE,
    remark: ''
  }
  formRef.value?.resetFields()
}
defineExpose({ open }) // Provide the open method for opening the dialog

/** Submit form */
const emit = defineEmits(['success']) // Define the success event for callbacks after successful operations
const submitForm = async () => {
  // Validate form
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // Submit request
  formLoading.value = true
  try {
    const data = formData.value as unknown as RoleApi.RoleVO
    if (formType.value === 'create') {
      await RoleApi.createRole(data)
      message.success(t('common.createSuccess'))
    } else {
      await RoleApi.updateRole(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // Emit the operation success event
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
