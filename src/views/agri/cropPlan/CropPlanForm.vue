<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      v-loading="formLoading"
    >
      <el-form-item label="Crop" prop="cropId">
        <el-select v-model="formData.cropId" placeholder="Select crop" class="w-full">
          <el-option
            v-for="crop in cropList"
            :key="crop.id"
            :label="crop.cropName"
            :value="crop.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Field" prop="fieldId">
        <el-select v-model="formData.fieldId" placeholder="Select field" class="w-full">
          <el-option
            v-for="field in fieldList"
            :key="field.id"
            :label="field.fieldName"
            :value="field.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Start Date" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          placeholder="Select start date"
          value-format="YYYY-MM-DD"
          class="!w-full"
          @change="onStartDateChange"
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
import { CropApi, CropVO } from '@/api/agri/crop'
import { FieldApi, FieldVO } from '@/api/agri/field'
import { CropPlanApi, CropPlanVO } from '@/api/agri/cropPlan'

defineOptions({ name: 'CropPlanForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')

const cropList = ref<CropVO[]>([])
const fieldList = ref<FieldVO[]>([])

const formData = ref({
  id: undefined,
  cropId: undefined,
  fieldId: undefined,
  startDate: undefined,
})

const formRules = reactive({
  cropId: [{ required: true, message: 'Crop is required', trigger: 'change' }],
  fieldId: [{ required: true, message: 'Field is required', trigger: 'change' }],
  startDate: [{ required: true, message: 'Start date is required', trigger: 'change' }],
})

const formRef = ref()

const loadCropOptions = async () => {
  const data = await CropApi.getCropPage({ pageNo: 1, pageSize: 100 })
  cropList.value = data.list
}

const loadFieldOptions = async () => {
  const data = await FieldApi.getFieldPage({ pageNo: 1, pageSize: 100 })
  fieldList.value = data.list
}

const calcDates = () => {
  if (!formData.value.startDate || !formData.value.cropId) {
    return
  }
  const crop = cropList.value.find((c) => c.id === formData.value.cropId)
  if (crop?.growthPeriod) {
    const start = new Date(formData.value.startDate)
    start.setDate(start.getDate() + crop.growthPeriod)
    const year = start.getFullYear()
    const month = String(start.getMonth() + 1).padStart(2, '0')
    const day = String(start.getDate()).padStart(2, '0')
    formData.value.endDate = `${year}-${month}-${day}`
  }
}

const onStartDateChange = () => {
  calcDates()
}

watch(
  () => formData.value.cropId,
  () => {
    if (formData.value.startDate) {
      calcDates()
    }
  }
)

const open = async (type: string, id?: number, defaultFieldId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  await Promise.all([loadCropOptions(), loadFieldOptions()])
  if (defaultFieldId) formData.value.fieldId = defaultFieldId
  if (id) {
    formLoading.value = true
    try {
      const data = await CropPlanApi.getCropPlan(id)
      formData.value = {
        id: data.id,
        cropId: data.cropId,
        fieldId: data.fieldId,
        startDate: data.startDate,
      }
      formData.value.endDate = data.endDate
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
    calcDates()
    const data = { ...formData.value } as CropPlanVO
    if (formType.value === 'create') {
      await CropPlanApi.createCropPlan(data)
      message.success(t('common.createSuccess'))
    } else {
      await CropPlanApi.updateCropPlan(data)
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
    cropId: undefined,
    fieldId: undefined,
    startDate: undefined,
  }
  formRef.value?.resetFields()
}
</script>
