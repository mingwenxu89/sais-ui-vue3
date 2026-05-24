<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="Dict Type" prop="name">
        <el-input v-model="formData.name" placeholder="Enter Dict Name" />
      </el-form-item>
      <el-form-item label="Dict Type" prop="type">
        <el-input
          v-model="formData.type"
          :disabled="typeof formData.id !== 'undefined'"
          placeholder="Enter Parameter Name"
        />
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Remark" prop="remark">
        <el-input v-model="formData.remark" placeholder="Enter Remark" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as DictTypeApi from '@/api/system/dict/dict.type'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'SystemDictTypeForm' })

const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const dialogTitle = ref('') // Dialog title
const formLoading = ref(false) // Form loading state: 1) data loading during update; 2) submit button disabled
const formType = ref('') // Form type: create - add; update - modify
const formData = ref({
  id: undefined,
  name: '',
  type: '',
  status: CommonStatusEnum.ENABLE,
  remark: ''
})
const formRules = reactive({
  name: [{ required: true, message: 'Dict Name cannot be empty', trigger: 'blur' }],
  type: [{ required: true, message: 'Dict Type cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'change' }]
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
      formData.value = await DictTypeApi.getDictType(id)
    } finally {
      formLoading.value = false
    }
  }
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
    const data = formData.value as DictTypeApi.DictTypeVO
    if (formType.value === 'create') {
      await DictTypeApi.createDictType(data)
      message.success(t('common.createSuccess'))
    } else {
      await DictTypeApi.updateDictType(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // Emit the operation success event
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** Reset form */
const resetForm = () => {
  formData.value = {
    id: undefined,
    type: '',
    name: '',
    status: CommonStatusEnum.ENABLE,
    remark: ''
  }
  formRef.value?.resetFields()
}
</script>
