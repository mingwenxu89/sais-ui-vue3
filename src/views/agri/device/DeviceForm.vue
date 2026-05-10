<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-form-item label="Device Name" prop="name">
        <el-input v-model="formData.name" placeholder="Enter device name" />
      </el-form-item>
      <el-form-item label="Device Code" prop="deviceCode">
        <el-input v-model="formData.deviceCode" placeholder="Enter device code" />
      </el-form-item>
      <el-form-item label="Device Type" prop="deviceType">
        <el-select v-model="formData.deviceType" placeholder="Select device type">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_DEVICE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="IP Address" prop="ipAddress">
        <el-input v-model="formData.ipAddress" placeholder="Enter IP address" />
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_DEVICE_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="Enter description" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { DeviceApi, DeviceVO } from '@/api/agri/device'

/** IoT device form */
defineOptions({ name: 'DeviceForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref({
  id: undefined,
  name: undefined,
  deviceCode: undefined,
  deviceType: undefined,
  fieldId: undefined,
  ipAddress: undefined,
  status: undefined,
  description: undefined,
})
const formRules = reactive({
  name: [{ required: true, message: 'Device Name is required', trigger: 'blur' }],
  deviceCode: [{ required: true, message: 'Device Code is required', trigger: 'blur' }],
  deviceType: [{ required: true, message: 'Device Type is required', trigger: 'change' }],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await DeviceApi.getDevice(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as DeviceVO
    if (formType.value === 'create') {
      await DeviceApi.createDevice(data)
      message.success(t('common.createSuccess'))
    } else {
      await DeviceApi.updateDevice(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    deviceCode: undefined,
    deviceType: undefined,
    fieldId: undefined,
    ipAddress: undefined,
    status: undefined,
    description: undefined,
  }
  formRef.value?.resetFields()
}
</script>
