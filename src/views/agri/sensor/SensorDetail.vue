<template>
  <Dialog title="Sensor Detail" v-model="dialogVisible" width="700px">
    <el-descriptions :column="2" border v-if="sensor">
      <el-descriptions-item label="Sensor Code">{{ sensor.sensorCode }}</el-descriptions-item>
      <el-descriptions-item label="Type">Soil Moisture</el-descriptions-item>
      <el-descriptions-item label="Model">{{ sensor.model || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Status">
        <dict-tag :type="DICT_TYPE.AGRI_SENSOR_STATUS" :value="sensor.status" />
      </el-descriptions-item>
      <el-descriptions-item label="Location" :span="2">
        {{ sensor.fieldName || sensor.farmName || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="mt-15px">
      <div class="mb-10px font-bold">Recent Readings</div>
      <el-table v-loading="dataLoading" :data="dataList" :stripe="true" size="small" max-height="240">
        <el-table-column label="Collected At" prop="collectedAt" :formatter="dateFormatter" width="170" />
        <el-table-column label="Sensor Code" prop="sensorCode" width="130" />
        <el-table-column label="Field" prop="fieldName" width="130" />
        <el-table-column label="Data Type" prop="dataType" width="130" />
        <el-table-column label="Value" prop="value">
          <template #default="scope">
            {{ scope.row.value }}
            <span v-if="scope.row.dataType === 'SOIL_MOISTURE' || scope.row.dataType === 'HUMIDITY'">%</span>
            <span v-else-if="scope.row.dataType === 'TEMPERATURE'">°C</span>
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
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </div>

    <!-- <template #footer>
      <el-button @click="dialogVisible = false">Close</el-button>
    </template> -->
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { SensorApi, SensorVO } from '@/api/agri/sensor'

defineOptions({ name: 'SensorDetail' })

const dialogVisible = ref(false)
const sensor = ref<SensorVO | null>(null)
const dataList = ref<any[]>([])
const dataLoading = ref(false)
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(5)

const open = async (row: SensorVO) => {
  dialogVisible.value = true
  sensor.value = row
  pageNo.value = 1
  await loadData()
}
defineExpose({ open })

const loadData = async () => {
  if (!sensor.value?.id) return
  dataLoading.value = true
  try {
    const result = await SensorApi.getSensorDataPage({
      sensorId: sensor.value.id!,
      pageNo: pageNo.value,
      pageSize: pageSize.value
    })
    dataList.value = result.list
    total.value = result.total
  } finally {
    dataLoading.value = false
  }
}
</script>
