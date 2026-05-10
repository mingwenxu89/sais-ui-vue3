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
      <!-- <el-form-item label="Planned Start Time" prop="plannedStartTime">
        <el-date-picker
          v-model="formData.plannedStartTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="Select planned start time"
          style="width: 100%"
        />
      </el-form-item> -->
      <el-form-item label="Duration (min)" prop="plannedDuration">
        <el-input-number
          v-model="formData.plannedDuration"
          :min="1"
          :max="480"
          placeholder="Enter planned duration in minutes"
        />
      </el-form-item>
      <el-form-item label="Reason / Notes" prop="decisionReason">
        <el-input
          v-model="formData.decisionReason"
          type="textarea"
          :rows="3"
          placeholder="Enter reason or notes for this plan"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { IrrigationPlanApi, IrrigationPlanVO } from '@/api/agri/irrigationPlan'

defineOptions({ name: 'IrrigationPlanForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref<IrrigationPlanVO>({
  id: undefined,
  deviceId: undefined,
  fieldId: undefined,
  plannedStartTime: undefined,
  plannedDuration: 30,
  decisionSource: 'MANUAL',
  decisionReason: undefined,
})
const formRules = reactive({
  deviceId: [{ required: true, message: 'Device ID is required', trigger: 'blur' }],
  fieldId: [{ required: true, message: 'Field ID is required', trigger: 'blur' }],
  plannedStartTime: [{ required: true, message: 'Planned start time is required', trigger: 'change' }],
  plannedDuration: [{ required: true, message: 'Duration is required', trigger: 'blur' }],
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
      formData.value = await IrrigationPlanApi.getIrrigationPlan(id)
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
    const data = { ...formData.value, decisionSource: 'MANUAL' }
    if (formType.value === 'create') {
      await IrrigationPlanApi.createIrrigationPlan(data)
      message.success(t('common.createSuccess'))
    } else {
      await IrrigationPlanApi.updateIrrigationPlan(data)
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
    plannedStartTime: undefined,
    plannedDuration: 30,
    decisionSource: 'MANUAL',
    decisionReason: undefined,
  }
  formRef.value?.resetFields()
}
</script>
