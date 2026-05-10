<template>
  <ContentWrap>
    <!-- Search toolbar -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="Source" prop="decisionSource" label-width="60px">
        <el-select
          v-model="queryParams.decisionSource"
          placeholder="All sources"
          clearable
          class="!w-180px"
        >
          <el-option label="MANUAL" value="MANUAL" />
          <el-option label="AI" value="AI" />
        </el-select>
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select v-model="queryParams.status" placeholder="All statuses" clearable class="!w-180px">
          <el-option label="Pending" value="PENDING" />
          <el-option label="Executing" value="EXECUTING" />
          <el-option label="Completed" value="COMPLETED" />
          <el-option label="Cancelled" value="CANCELLED" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['agri:irrigation-plan:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> Add Plan
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['agri:irrigation-plan:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> Export
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- Plan list -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="Field" align="center" prop="fieldName" width="130" />
      <el-table-column label="Source" align="center" prop="decisionSource">
        <template #default="scope">
          <el-tag :type="scope.row.decisionSource === 'AI' ? 'warning' : ''" size="small">
            {{ scope.row.decisionSource }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="Planned Start" align="center" prop="plannedStartTime" :formatter="dateFormatter" width="160" /> -->
      <el-table-column label="Duration (min)" align="center" prop="plannedDuration" width="110" />
      <el-table-column label="Status" align="center" prop="status" >
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="small">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actual Start" align="center" prop="actualStartTime" :formatter="dateFormatter" width="160" />
      <el-table-column label="Water (L)" align="center" prop="waterQuantity" width="90">
        <template #default="scope">
          <span v-if="scope.row.waterQuantity != null">{{ scope.row.waterQuantity.toFixed(1) }}</span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="Reason" align="left" prop="decisionReason" min-width="180">
        <template #default="scope">
          <span v-if="scope.row.decisionReason" class="text-xs text-gray-500">{{ scope.row.decisionReason }}</span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="160" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === 'PENDING'"
            link
            type="primary"
            size="small"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['agri:irrigation-plan:update']"
          >
            Edit
          </el-button>
          <el-button
            v-if="scope.row.status === 'PENDING' || scope.row.status === 'EXECUTING'"
            link
            type="warning"
            size="small"
            @click="handleCancel(scope.row.id)"
            v-hasPermi="['agri:irrigation-plan:update']"
          >
            Cancel
          </el-button>
          <el-button
            link
            type="danger"
            size="small"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['agri:irrigation-plan:delete']"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Pagination -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- Add / Edit dialog -->
  <IrrigationPlanForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { IrrigationPlanApi, IrrigationPlanVO } from '@/api/agri/irrigationPlan'
import IrrigationPlanForm from './IrrigationPlanForm.vue'

defineOptions({ name: 'AgriIrrigationPlan' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<IrrigationPlanVO[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  decisionSource: undefined,
  status: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)

const getList = async () => {
  loading.value = true
  try {
    const data = await IrrigationPlanApi.getIrrigationPlanPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
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

const handleCancel = async (id: number) => {
  try {
    await message.confirm('Cancel this irrigation plan?')
    await IrrigationPlanApi.cancelIrrigationPlan(id)
    message.success('Plan cancelled')
    await getList()
  } catch {}
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await IrrigationPlanApi.deleteIrrigationPlan(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await IrrigationPlanApi.exportIrrigationPlan(queryParams)
    download.excel(data, 'Irrigation Plans.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const statusTagType = (status?: string) => {
  switch (status) {
    case 'PENDING': return 'info'
    case 'EXECUTING': return 'warning'
    case 'COMPLETED': return 'success'
    case 'CANCELLED': return 'danger'
    default: return 'info'
  }
}

onMounted(() => {
  getList()
})
</script>
