<template>
  <ContentWrap>
    <!-- Search toolbar -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="Crop" prop="cropId">
        <el-select
          v-model="queryParams.cropId"
          placeholder="Select crop"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="crop in cropList"
            :key="crop.id"
            :label="crop.cropName"
            :value="crop.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Field" prop="fieldId">
        <el-select
          v-model="queryParams.fieldId"
          placeholder="Select field"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="field in fieldList"
            :key="field.id"
            :label="field.fieldName"
            :value="field.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Status" prop="growStatus">
        <el-select v-model="queryParams.growStatus" placeholder="Select status" clearable class="!w-240px">
          <el-option label="Unstarted" :value="1" />
          <el-option label="Ongoing" :value="2" />
          <el-option label="Finished" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" /> Search
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> Reset
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['agri:crop-plan:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> Add
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['agri:crop-plan:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> Export
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- List -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="Crop" align="center" prop="cropName" min-width="150" />
      <el-table-column label="Field" align="center" prop="fieldName" min-width="150" />
      <el-table-column label="Status" align="center" prop="growStatus" width="120">
        <template #default="scope">
          <el-tag
            :type="scope.row.growStatus === 1 ? 'info' : scope.row.growStatus === 2 ? 'success' : ''"
            size="small"
          >
            {{ scope.row.growStatus === 1 ? 'Unstarted' : scope.row.growStatus === 2 ? 'Ongoing' : 'Finished' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Start Date" align="center" prop="startDate" width="140" />
      <el-table-column label="End Date" align="center" prop="endDate" width="140" />
      <el-table-column label="Actions" align="center" width="160">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-if="scope.row.growStatus === 1"
            v-hasPermi="['agri:crop-plan:update']"
          >
            <Icon icon="ep:edit" class="mr-1" /> Edit
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-if="scope.row.growStatus === 1"
            v-hasPermi="['agri:crop-plan:delete']"
          >
            <Icon icon="ep:delete" class="mr-1" /> Delete
          </el-button>
          <span v-else class="text-gray-400 text-12px">-</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- Empty state -->
    <el-empty v-if="list.length === 0 && !loading" description="No crop plans found" />

    <!-- Pagination -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- Form dialog -->
  <CropPlanForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { CropApi, CropVO } from '@/api/agri/crop'
import { FieldApi, FieldVO } from '@/api/agri/field'
import { CropPlanApi, CropPlanVO } from '@/api/agri/cropPlan'
import CropPlanForm from './CropPlanForm.vue'

defineOptions({ name: 'AgriCropPlan' })

const { t } = useI18n()

const loading = ref(true)
const list = ref<CropPlanVO[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  cropId: undefined,
  fieldId: undefined,
  growStatus: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)

const cropList = ref<CropVO[]>([])
const fieldList = ref<FieldVO[]>([])

const getList = async () => {
  loading.value = true
  try {
    const data = await CropPlanApi.getCropPlanPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const loadCropOptions = async () => {
  const data = await CropApi.getCropPage({ pageNo: 1, pageSize: 100 })
  cropList.value = data.list
}

const loadFieldOptions = async () => {
  const data = await FieldApi.getFieldPage({ pageNo: 1, pageSize: 100 })
  fieldList.value = data.list
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await CropPlanApi.deleteCropPlan(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await CropPlanApi.exportCropPlan(queryParams)
    download.excel(data, 'crop-plan.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
  loadCropOptions()
  loadFieldOptions()
})
</script>
