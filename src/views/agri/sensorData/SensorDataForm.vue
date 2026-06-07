<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="160px"
      v-loading="formLoading"
    >
      <el-form-item label="Device ID" prop="deviceId">
        <el-input-number v-model="formData.deviceId" :min="1" placeholder="Enter device ID" />
      </el-form-item>
      <el-form-item label="Field ID" prop="fieldId">
        <el-input-number v-model="formData.fieldId" :min="1" placeholder="Enter field ID" />
      </el-form-item>
      <el-form-item label="Record Time" prop="recordTime">
        <el-date-picker
          v-model="formData.recordTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="Select record time"
        />
      </el-form-item>
      <el-form-item label="Soil Moisture (%)" prop="soilMoisture">
        <el-input-number v-model="formData.soilMoisture" :precision="2" placeholder="Enter soil moisture" />
      </el-form-item>
      <el-form-item label="Soil Temp (°C)" prop="soilTemperature">
        <el-input-number v-model="formData.soilTemperature" :precision="2" placeholder="Enter soil temperature" />
      </el-form-item>
      <el-form-item label="Soil pH" prop="soilPh">
        <el-input-number v-model="formData.soilPh" :precision="2" placeholder="Enter soil pH" />
      </el-form-item>
      <el-form-item label="Air Temp (°C)" prop="airTemperature">
        <el-input-number v-model="formData.airTemperature" :precision="2" placeholder="Enter air temperature" />
      </el-form-item>
      <el-form-item label="Air Humidity (%)" prop="airHumidity">
        <el-input-number v-model="formData.airHumidity" :precision="2" placeholder="Enter air humidity" />
      </el-form-item>
      <el-form-item label="Light Intensity (lux)" prop="lightIntensity">
        <el-input-number v-model="formData.lightIntensity" :precision="2" placeholder="Enter light intensity" />
      </el-form-item>
      <el-form-item label="Rainfall (mm)" prop="rainfall">
        <el-input-number v-model="formData.rainfall" :precision="2" placeholder="Enter rainfall" />
      </el-form-item>
      <el-form-item label="Wind Speed" prop="windSpeed">
        <el-input-number v-model="formData.windSpeed" :precision="2" placeholder="Enter wind speed" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { SensorDataApi, SensorDataVO } from '@/api/agri/sensorData'

/** Sensor data form */
defineOptions({ name: 'SensorDataForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref({
  id: undefined,
  deviceId: undefined,
  fieldId: undefined,
  recordTime: undefined,
  soilMoisture: undefined,
  soilTemperature: undefined,
  soilPh: undefined,
  soilNitrogen: undefined,
  airTemperature: undefined,
  airHumidity: undefined,
  lightIntensity: undefined,
  rainfall: undefined,
  windSpeed: undefined,
})
const formRules = reactive({
  deviceId: [{ required: true, message: 'Device ID is required', trigger: 'blur' }],
  recordTime: [{ required: true, message: 'Record Time is required', trigger: 'change' }],
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
      formData.value = await SensorDataApi.getSensorData(id)
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
    const data = formData.value as unknown as SensorDataVO
    if (formType.value === 'create') {
      await SensorDataApi.createSensorData(data)
      message.success(t('common.createSuccess'))
    } else {
      await SensorDataApi.updateSensorData(data)
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
    deviceId: undefined,
    fieldId: undefined,
    recordTime: undefined,
    soilMoisture: undefined,
    soilTemperature: undefined,
    soilPh: undefined,
    soilNitrogen: undefined,
    airTemperature: undefined,
    airHumidity: undefined,
    lightIntensity: undefined,
    rainfall: undefined,
    windSpeed: undefined,
  }
  formRef.value?.resetFields()
}
</script>
