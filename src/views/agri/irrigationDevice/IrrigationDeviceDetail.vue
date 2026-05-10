<template>
  <Dialog title="Device Detail" v-model="dialogVisible" width="720px">
    <el-descriptions :column="2" border v-if="device">
      <el-descriptions-item label="Device Code">{{ device.deviceCode }}</el-descriptions-item>
      <el-descriptions-item label="Status">
        <dict-tag :type="DICT_TYPE.AGRI_IRRIGATION_DEVICE_STATUS" :value="device.status" />
      </el-descriptions-item>
      <el-descriptions-item label="Field">{{ device.fieldName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Flow Rate">
        {{ device.flowRate != null ? device.flowRate + ' L/min' : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Watering" :span="2">
        <span v-if="device.isWatering" class="text-blue-600 font-semibold">
          ● Active · started at {{ formatDateTime(device.wateringStartedAt) }}
        </span>
        <span v-else class="text-gray-400">Idle</span>
      </el-descriptions-item>
    </el-descriptions>

    <div class="mt-15px">
      <div class="mb-10px font-bold">Irrigation Plans</div>
      <el-table v-loading="planLoading" :data="planList" :stripe="true" size="small" max-height="280">
        <!-- <el-table-column label="Planned Start" prop="plannedStartTime" :formatter="dateFormatter" width="160" /> -->
        <el-table-column label="Duration (min)" prop="plannedDuration" width="110">
          <template #default="scope">{{ scope.row.plannedDuration ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="Water (L)" prop="waterQuantity" width="90">
          <template #default="scope">
            {{ scope.row.waterQuantity != null ? scope.row.waterQuantity.toFixed(1) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Source" prop="decisionSource" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.decisionSource === 'AI' ? 'warning' : ''" size="small">
              {{ scope.row.decisionSource }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status" prop="status" width="110">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end mt-10px">
        <el-pagination
          v-model:current-page="pageNo"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 20]"
          layout="total, prev, pager, next"
          small
          @current-change="loadPlans"
          @size-change="loadPlans"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { IrrigationDeviceVO } from '@/api/agri/irrigationDevice'
import { IrrigationPlanApi } from '@/api/agri/irrigationPlan'

defineOptions({ name: 'IrrigationDeviceDetail' })

const dialogVisible = ref(false)
const device = ref<IrrigationDeviceVO | null>(null)
const planList = ref<any[]>([])
const planLoading = ref(false)
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(5)

const formatDateTime = (val?: string) => {
  if (!val) return '-'
  return val.replace('T', ' ').slice(0, 16)
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

const open = async (row: IrrigationDeviceVO) => {
  dialogVisible.value = true
  device.value = row
  pageNo.value = 1
  await loadPlans()
}
defineExpose({ open })

const loadPlans = async () => {
  if (!device.value?.id) return
  planLoading.value = true
  try {
    const result = await IrrigationPlanApi.getIrrigationPlanPage({
      deviceId: device.value.id,
      pageNo: pageNo.value,
      pageSize: pageSize.value
    })
    planList.value = result.list
    total.value = result.total
  } finally {
    planLoading.value = false
  }
}
</script>
