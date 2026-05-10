<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px" v-loading="formLoading">
      <el-form-item label="Field" prop="fieldId">
        <el-select v-model="formData.fieldId" placeholder="Select field" class="w-full" clearable @change="onFieldChange">
          <el-option
            v-for="field in fieldList"
            :key="field.id"
            :label="field.fieldName"
            :value="field.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Sensor (optional)">
        <el-select v-model="formData.sensorId" placeholder="Select sensor" clearable class="w-full">
          <el-option
            v-for="s in sensorList"
            :key="s.id"
            :label="s.sensorCode"
            :value="s.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Flow Rate" prop="flowRate">
        <el-input-number
          v-model="formData.flowRate"
          :min="0"
          :precision="2"
          placeholder="Enter flow rate"
          class="w-full"
        />
      </el-form-item>

      <el-form-item label="Status" prop="status">
        <el-select v-model="formData.status" placeholder="Select status" class="w-full">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_IRRIGATION_DEVICE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Simulate Fault">
        <el-switch v-model="formData.simulateFault" />
        <span class="ml-2 text-xs text-gray-400">Withhold device ACK to trigger IRRIGATION_ABNORMAL alert</span>
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
import { IrrigationDeviceApi, IrrigationDeviceVO } from '@/api/agri/irrigationDevice'
import { FieldApi, FieldVO } from '@/api/agri/field'
import { SensorApi, SensorVO } from '@/api/agri/sensor'

defineOptions({ name: 'IrrigationDeviceForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')

const fieldList = ref<FieldVO[]>([])
const sensorList = ref<SensorVO[]>([])

const formData = ref({
  id: undefined,
  fieldId: undefined,
  sensorId: undefined,
  flowRate: undefined,
  status: undefined,
  simulateFault: false,
})

const formRules = reactive({
  fieldId: [{ required: true, message: 'Field is required', trigger: 'change' }],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
})

const formRef = ref()

const loadFieldOptions = async () => {
  const data = await FieldApi.getFieldPage({ pageNo: 1, pageSize: 100 })
  fieldList.value = data.list
}

const loadSensorOptions = async (fieldId?: number) => {
  if (!fieldId) { sensorList.value = []; return }
  // excludeDeviceId: current device ID in edit mode, 0 in create mode (excludes all bound sensors)
  const data = await SensorApi.getSensorPage({
    fieldId, pageNo: 1, pageSize: 100,
    excludeDeviceId: formData.value.id ?? 0,
  })
  sensorList.value = data.list
}

const onFieldChange = (fieldId?: number) => {
  formData.value.sensorId = undefined
  loadSensorOptions(fieldId)
}

const open = async (type: string, id?: number, defaultFieldId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  await loadFieldOptions()
  if (id) {
    formLoading.value = true
    try {
      const data = await IrrigationDeviceApi.getIrrigationDevice(id)
      formData.value = {
        id: data.id,
        fieldId: data.fieldId,
        sensorId: data.sensorId,
        flowRate: data.flowRate,
        status: data.status,
        simulateFault: data.simulateFault ?? false,
      }
      await loadSensorOptions(data.fieldId)
    } finally {
      formLoading.value = false
    }
  } else if (defaultFieldId) {
    formData.value.fieldId = defaultFieldId
    await loadSensorOptions(defaultFieldId)
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as IrrigationDeviceVO
    if (formType.value === 'create') {
      await IrrigationDeviceApi.createIrrigationDevice(data)
      message.success(t('common.createSuccess'))
    } else {
      await IrrigationDeviceApi.updateIrrigationDevice(data)
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
    fieldId: undefined,
    sensorId: undefined,
    flowRate: undefined,
    status: undefined,
    simulateFault: false,
  }
  sensorList.value = []
  formRef.value?.resetFields()
}
</script>
