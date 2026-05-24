<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="Dict Type" prop="type">
        <el-input
          v-model="formData.dictType"
          :disabled="typeof formData.id !== 'undefined'"
          placeholder="Enter Parameter Name"
        />
      </el-form-item>
      <el-form-item label="Data Label" prop="label">
        <el-input v-model="formData.label" placeholder="Enter Data Label" />
      </el-form-item>
      <el-form-item label="Data Value" prop="value">
        <el-input v-model="formData.value" placeholder="Enter Data Value" />
      </el-form-item>
      <el-form-item label="Display Sort" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
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
      <el-form-item label="Color Type" prop="colorType">
        <el-select v-model="formData.colorType">
          <el-option
            v-for="item in colorTypeOptions"
            :key="item.value"
            :label="item.label + '(' + item.value + ')'"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="CSS Class" prop="cssClass">
        <el-input v-model="formData.cssClass" placeholder="Enter CSS Class" />
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
import * as DictDataApi from '@/api/system/dict/dict.data'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'SystemDictDataForm' })

const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const dialogTitle = ref('') // Dialog title
const formLoading = ref(false) // Form loading state: 1) data loading during update; 2) submit button disabled
const formType = ref('') // Form type: create - add; update - modify
const formData = ref({
  id: undefined,
  sort: undefined,
  label: '',
  value: '',
  dictType: '',
  status: CommonStatusEnum.ENABLE,
  colorType: '',
  cssClass: '',
  remark: ''
})
const formRules = reactive({
  label: [{ required: true, message: 'Dict label cannot be empty', trigger: 'blur' }],
  value: [{ required: true, message: 'Dict value cannot be empty', trigger: 'blur' }],
  sort: [{ required: true, message: 'Data sort cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'change' }]
})
const formRef = ref() // Form ref

// Data label display style
const colorTypeOptions = readonly([
  {
    value: 'default',
    label: 'Default'
  },
  {
    value: 'primary',
    label: 'Primary'
  },
  {
    value: 'success',
    label: 'Success'
  },
  {
    value: 'info',
    label: 'Info'
  },
  {
    value: 'warning',
    label: 'Warning'
  },
  {
    value: 'danger',
    label: 'Danger'
  }
])

/** Open dialog */
const open = async (type: string, id?: number, dictType?: string) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (dictType) {
    formData.value.dictType = dictType
  }
  // Set data during update
  if (id) {
    formLoading.value = true
    try {
      formData.value = await DictDataApi.getDictData(id)
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
    const data = formData.value as DictDataApi.DictDataVO
    if (formType.value === 'create') {
      await DictDataApi.createDictData(data)
      message.success(t('common.createSuccess'))
    } else {
      await DictDataApi.updateDictData(data)
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
    sort: undefined,
    label: '',
    value: '',
    dictType: '',
    status: CommonStatusEnum.ENABLE,
    colorType: '',
    cssClass: '',
    remark: ''
  }
  formRef.value?.resetFields()
}
</script>
