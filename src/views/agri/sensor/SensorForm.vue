<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px" v-loading="formLoading">
      <el-form-item label="Sensor Code" prop="sensorCode">
        <el-input v-model="formData.sensorCode" placeholder="Enter sensor code" />
      </el-form-item>

      <el-form-item label="Model" prop="model">
        <el-input v-model="formData.model" placeholder="Enter model" />
      </el-form-item>

      <el-form-item label="Field" prop="fieldId">
        <el-select v-model="formData.fieldId" placeholder="Select field" class="w-full" clearable>
          <el-option
            v-for="field in fieldList"
            :key="field.id"
            :label="field.fieldName"
            :value="field.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Status" prop="status">
        <el-select v-model="formData.status" placeholder="Select status" class="w-full">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_SENSOR_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
import { SensorApi, SensorVO } from '@/api/agri/sensor'
import { FieldApi, FieldVO } from '@/api/agri/field'

defineOptions({ name: 'SensorForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const fieldList = ref<FieldVO[]>([])

const formData = ref({
  id: undefined as number | undefined,
  sensorType: 1, // always Soil Moisture
  sensorCode: undefined as string | undefined,
  model: undefined as string | undefined,
  fieldId: undefined as number | undefined,
  farmId: undefined as number | undefined,
  status: undefined as number | undefined,
})

const formRules = reactive({
  status: [{ required: true, message: 'Status is required', trigger: 'change' }],
})

const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  const data = await FieldApi.getFieldPage({ pageNo: 1, pageSize: 100 })
  fieldList.value = data.list
  if (id) {
    formLoading.value = true
    try {
      formData.value = { ...(await SensorApi.getSensor(id)), sensorType: 1 }
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
    const data = formData.value as unknown as SensorVO
    if (formType.value === 'create') {
      await SensorApi.createSensor(data)
      message.success(t('common.createSuccess'))
    } else {
      await SensorApi.updateSensor(data)
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
    sensorType: 1,
    sensorCode: undefined,
    model: undefined,
    fieldId: undefined,
    farmId: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}
</script>
