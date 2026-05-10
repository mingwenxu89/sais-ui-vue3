<template>
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="100px">
      <el-form-item label="Record Time" prop="collectedAt">
        <el-date-picker
          v-model="queryParams.collectedAt"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="Start Time"
          end-placeholder="End Time"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-280px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="Sensor Code" align="center" prop="sensorCode" />
      <el-table-column label="Field Name" align="center" prop="fieldName" />
      <el-table-column label="Record Time" align="center" prop="collectedAt" :formatter="dateFormatter" width="180" />
      <el-table-column label="Soil Moisture (%)" align="center" prop="value">
        <template #default="scope">
          {{ scope.row.value != null ? scope.row.value + ' %' : '-' }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="Actions" align="center" width="100">
        <template #default="scope">
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['agri:sensor:delete']">
            Delete
          </el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { SensorDataApi, SensorDataVO } from '@/api/agri/sensorData'

defineOptions({ name: 'AgriSensorData' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<SensorDataVO[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  collectedAt: [],
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await SensorDataApi.getSensorDataPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.pageNo = 1; getList() }
const resetQuery = () => { queryFormRef.value.resetFields(); handleQuery() }

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await SensorDataApi.deleteSensorData(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => getList())
</script>
