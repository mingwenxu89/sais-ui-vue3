<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="900px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="180px"
      v-loading="formLoading"
    >
      <!-- Basic Information -->
      <el-divider content-position="left">Basic Information</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Crop Name" prop="cropName">
            <el-input v-model="formData.cropName" placeholder="Enter crop name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Crop Type" prop="cropType">
            <el-select v-model="formData.cropType" placeholder="Select crop type" class="w-full">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_CROP_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Variety" prop="variety">
            <el-input v-model="formData.variety" placeholder="Enter variety" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Growth Period (days)" prop="growthPeriod">
            <el-input-number v-model="formData.growthPeriod" :min="1" placeholder="Enter growth period" class="w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- <el-form-item label="Description" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="Enter description" />
      </el-form-item> -->

      <!-- Attributes -->
      <!-- <el-divider content-position="left">Attributes</el-divider> -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Soil pH Range" required>
            <div class="flex items-center justify-between w-full">
              <el-form-item prop="soilPhMin" class="mb-0 !w-[47%]">
                <el-input-number 
                  v-model="formData.soilPhMin" 
                  :min="0" 
                  :max="14" 
                  :precision="1" 
                  :step="0.1" 
                  placeholder="Min" 
                  class="!w-full" 
                />
              </el-form-item>
              <span class="text-gray-500">-</span>
              <el-form-item prop="soilPhMax" class="mb-0 !w-[47%]">
                <el-input-number 
                  v-model="formData.soilPhMax" 
                  :min="0" 
                  :max="14" 
                  :precision="1" 
                  :step="0.1" 
                  placeholder="Max" 
                  class="!w-full" 
                />
              </el-form-item>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Irrigation Method" prop="irrigationMethod">
            <el-select v-model="formData.irrigationMethod" placeholder="Select irrigation method" clearable class="w-full">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_IRRIGATION_METHOD)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Drought Resistance" prop="droughtResistance">
            <el-select v-model="formData.droughtResistance" placeholder="Select resistance level" clearable class="w-full">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_DROUGHT_RESISTANCE_LEVEL)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Waterlogging Tolerance" prop="waterloggingTolerance">
            <el-select v-model="formData.waterloggingTolerance" placeholder="Select tolerance level" clearable class="w-full">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_WATERLOGGING_TOLERANCE_LEVEL)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Images -->
      <!-- <el-divider content-position="left">Images</el-divider> -->
      <el-form-item label="Image URL" prop="imageUrl">
        <UploadImg v-model="formData.imageUrl" :limit="1" />
      </el-form-item>

      <!-- Growth Stages -->
      <el-divider content-position="left">Growth Stages</el-divider>
      
      <el-button
        type="primary"
        plain
        @click="handleAddStage"
        class="mb-15px"
      >
        <Icon icon="ep:plus" class="mr-5px" /> Add Stage
      </el-button>

      <el-table :data="growthStageList" :stripe="true" border>
        <el-table-column label="Order" align="center" width="80">
          <template #default="scope">
             {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="Stage Name" align="center" min-width="150">
          <template #default="scope">
            <el-input v-model="scope.row.stageName" placeholder="Stage Name" />
          </template>
        </el-table-column>
        <el-table-column label="Duration (days)" align="center" width="110">
          <template #default="scope">
            <el-input-number v-model="scope.row.durationDays" :min="1" controls-position="right" class="!w-full" />
          </template>
        </el-table-column>
        <el-table-column label="Moisture Range (%)" align="center" width="220">
          <template #default="scope">
            <div class="flex items-center justify-between w-full">
              <el-input-number 
                v-model="scope.row.soilMoistureMin" 
                :min="0" 
                :max="100" 
                controls-position="right" 
                placeholder="Min" 
                class="!w-[45%]" 
              />
              <span class="text-gray-500">-</span>
              <el-input-number 
                v-model="scope.row.soilMoistureMax" 
                :min="0" 
                :max="100" 
                controls-position="right" 
                placeholder="Max" 
                class="!w-[45%]" 
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Optimal (%)" align="center" width="110">
          <template #default="scope">
             <el-input-number v-model="scope.row.soilMoistureOptimal" :min="0" :max="100" controls-position="right" class="!w-full" />
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" width="80">
          <template #default="scope">
            <el-button
              link
              type="danger"
              @click="handleDeleteStage(scope.$index)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { CropApi, CropVO, CropGrowthStageApi, CropGrowthStageVO } from '@/api/agri/crop'
import { UploadImg } from '@/components/UploadFile'

/** Crop Library form */
defineOptions({ name: 'CropForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')

const formData = ref({
  id: undefined,
  cropName: undefined,
  cropType: undefined,
  variety: undefined,
  growthPeriod: undefined,
  // Attributes
  soilPhMin: undefined,
  soilPhMax: undefined,
  irrigationMethod: undefined,
  droughtResistance: undefined,
  waterloggingTolerance: undefined,
  // Images
  imageUrl: undefined,
})

const formRules = reactive({
  cropName: [{ required: true, message: 'Crop name is required', trigger: 'blur' }],
  cropType: [{ required: true, message: 'Crop type is required', trigger: 'change' }],
  variety: [{ required: true, message: 'Variety is required', trigger: 'blur' }],
  growthPeriod: [{ required: true, message: 'Growth period is required', trigger: 'blur' }],
  soilPhMin: [{ required: true, message: 'Min pH is required', trigger: 'blur' }],
  soilPhMax: [{ required: true, message: 'Max pH is required', trigger: 'blur' }],
  irrigationMethod: [{ required: true, message: 'Irrigation method is required', trigger: 'change' }],
  droughtResistance: [{ required: true, message: 'Drought resistance is required', trigger: 'change' }],
  waterloggingTolerance: [{ required: true, message: 'Waterlogging tolerance is required', trigger: 'change' }],
  imageUrl: [{ required: true, message: 'Image URL is required', trigger: 'blur' }],
})

const formRef = ref()

// ==================== Growth Stage Logic ====================
const growthStageList = ref<CropGrowthStageVO[]>([])
const stageLoading = ref(false)

/** Open dialog */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CropApi.getCrop(id)
      await loadGrowthStages(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const loadGrowthStages = async (cropId: number) => {
  stageLoading.value = true
  try {
    growthStageList.value = await CropGrowthStageApi.getCropGrowthStageListByCropId(cropId)
  } catch (e) {
  } finally {
    stageLoading.value = false
  }
}

/** Submit form */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    // Ensure stage order is sequential
    growthStageList.value.forEach((stage, index) => {
      stage.stageOrder = index + 1
    })
    const data = { ...formData.value, growthStages: growthStageList.value } as unknown as CropVO
    if (formType.value === 'create') {
      await CropApi.createCrop(data)
      message.success(t('common.createSuccess'))
    } else {
      await CropApi.updateCrop(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** Reset form */
const resetForm = () => {
  formData.value = {
    id: undefined,
    cropName: undefined,
    cropType: undefined,
    variety: undefined,
    growthPeriod: undefined,
    soilPhMin: undefined,
    soilPhMax: undefined,
    irrigationMethod: undefined,
    droughtResistance: undefined,
    waterloggingTolerance: undefined,
    imageUrl: undefined,
  }
  formRef.value?.resetFields()
  growthStageList.value = []
}

/** Add new stage row */
const handleAddStage = () => {
  growthStageList.value.push({
    stageName: '',
    stageOrder: growthStageList.value.length + 1,
    durationDays: 0,
    soilMoistureMin: 0,
    soilMoistureOptimal: 0,
    soilMoistureMax: 0
  } as CropGrowthStageVO)
}

/** Delete stage row */
const handleDeleteStage = (index: number) => {
  growthStageList.value.splice(index, 1)
}

</script>
