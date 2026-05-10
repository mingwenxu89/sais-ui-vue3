<template>
  <ContentWrap>
    <!-- Search toolbar -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
      <el-form-item label="Code" prop="sensorCode">
        <el-input v-model="queryParams.sensorCode" placeholder="Enter sensor code" clearable class="!w-240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select v-model="queryParams.status" placeholder="Select status" clearable class="!w-200px">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_SENSOR_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['agri:sensor:create']">
          <Icon icon="ep:plus" class="mr-5px" /> Add
        </el-button>
        <el-button type="success" plain @click="handleExport" :loading="exportLoading" v-hasPermi="['agri:sensor:export']">
          <Icon icon="ep:download" class="mr-5px" /> Export
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- Card Grid -->
  <ContentWrap>
    <div v-loading="loading">
      <el-row :gutter="20" v-if="list.length > 0">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in list" :key="item.id" class="mb-20px">
          <el-card shadow="hover" class="h-full cursor-pointer" @click="openDetail(item)">
            <!-- Card Header: icon + code -->
            <div class="flex items-center gap-3 mb-12px">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-green-100">
                🌱
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-base truncate" :title="item.sensorCode">{{ item.sensorCode }}</div>
                <span class="text-xs text-green-600">Soil Moisture</span>
              </div>
            </div>

            <!-- Info rows -->
            <div class="space-y-6px text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <Icon icon="ep:cpu" class="text-gray-400 flex-shrink-0" />
                <span class="text-gray-400">Model:</span>
                <span class="truncate">{{ item.model || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon icon="ep:location" class="text-gray-400 flex-shrink-0" />
                <span class="text-gray-400">Field:</span>
                <span class="truncate">{{ item.fieldName || item.farmName || '-' }}</span>
              </div>
            </div>

            <!-- Status + Actions -->
            <div class="flex items-center justify-between mt-14px pt-12px border-t border-gray-100">
              <dict-tag :type="DICT_TYPE.AGRI_SENSOR_STATUS" :value="item.status" />
              <div class="flex gap-1" @click.stop>
                <el-button link type="primary" size="small" @click="openForm('update', item.id)" v-hasPermi="['agri:sensor:update']">
                  Edit
                </el-button>
                <el-button link type="danger" size="small" @click="handleDelete(item.id!)" v-hasPermi="['agri:sensor:delete']">
                  Delete
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="list.length === 0 && !loading" description="No sensors found" />
    </div>

    <Pagination
      v-if="list.length > 0"
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :page-sizes="[12, 24, 48]"
      @pagination="getList"
    />
  </ContentWrap>

  <SensorForm ref="formRef" @success="getList" />
  <SensorDetail ref="detailRef" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import download from '@/utils/download'
import { SensorApi, SensorVO } from '@/api/agri/sensor'
import SensorForm from './SensorForm.vue'
import SensorDetail from './SensorDetail.vue'

defineOptions({ name: 'AgriSensors' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<SensorVO[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 12,
  sensorCode: undefined,
  status: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)

const getList = async () => {
  loading.value = true
  try {
    const data = await SensorApi.getSensorPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.pageNo = 1; getList() }
const resetQuery = () => { queryFormRef.value.resetFields(); handleQuery() }

const formRef = ref()
const openForm = (type: string, id?: number) => formRef.value.open(type, id)

const detailRef = ref()
const openDetail = (row: SensorVO) => detailRef.value.open(row)

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await SensorApi.deleteSensor(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await SensorApi.exportSensor(queryParams)
    download.excel(data, 'Sensors.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => getList())
</script>
