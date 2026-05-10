<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" v-loading="formLoading">

      <el-form-item label="Alert Type" prop="alertType">
        <el-select v-model="formData.alertType" placeholder="Select alert type" class="w-full">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_ALERT_TYPE)"
            :key="dict.value" :label="dict.label" :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Alert Level" prop="level">
        <el-select v-model="formData.level" placeholder="Select alert level" class="w-full">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_ALERT_LEVEL)"
            :key="dict.value" :label="dict.label" :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Field ID" prop="fieldId">
        <el-input-number v-model="formData.fieldId" :min="1" placeholder="Optional" style="width:100%" />
      </el-form-item>

      <el-form-item label="Description" prop="context">
        <el-input v-model="formData.context" type="textarea" :rows="3" placeholder="Enter alert description" />
      </el-form-item>

      <el-form-item label="Status" prop="status">
        <el-select v-model="formData.status" placeholder="Select status" class="w-full">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_ALERT_STATUS)"
            :key="dict.value" :label="dict.label" :value="dict.value"
          />
        </el-select>
      </el-form-item>

    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitForm" :disabled="formLoading">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { AlertApi, AlertVO } from '@/api/agri/alert'

defineOptions({ name: 'AlertForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')

const formData = ref<AlertVO>({
  id: undefined,
  farmId: undefined,
  fieldId: undefined,
  alertType: undefined,
  level: undefined,
  context: undefined,
  status: undefined,
})

const formRules = reactive({
  alertType: [{ required: true, message: 'Alert Type is required', trigger: 'change' }],
  level:     [{ required: true, message: 'Alert Level is required', trigger: 'change' }],
  context:   [{ required: true, message: 'Description is required', trigger: 'blur' }],
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
      formData.value = await AlertApi.getAlert(id)
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
    if (formType.value === 'create') {
      await AlertApi.createAlert(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await AlertApi.updateAlert(formData.value)
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
    farmId: undefined,
    fieldId: undefined,
    alertType: undefined,
    level: undefined,
    context: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}
</script>
