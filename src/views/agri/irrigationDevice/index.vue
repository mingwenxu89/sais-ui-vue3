<template>
  <ContentWrap>
    <!-- Search toolbar -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
      <el-form-item label="Field" prop="fieldId">
        <el-select v-model="queryParams.fieldId" placeholder="Select field" clearable class="!w-200px">
          <el-option v-for="field in fieldList" :key="field.id" :label="field.fieldName" :value="field.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select v-model="queryParams.status" placeholder="Select status" clearable class="!w-200px">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_IRRIGATION_DEVICE_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Watering" prop="isWatering">
        <el-select v-model="queryParams.isWatering" placeholder="Select watering" clearable class="!w-160px">
          <el-option label="Watering" :value="true" />
          <el-option label="Idle" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['agri:irrigation-device:create']">
          <Icon icon="ep:plus" class="mr-5px" /> Add
        </el-button>
        <el-button type="success" plain @click="handleExport" :loading="exportLoading" v-hasPermi="['agri:irrigation-device:export']">
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
          <el-card
            shadow="hover"
            class="h-full transition-all duration-300 cursor-pointer"
            :class="item.isWatering ? 'border-blue-300' : ''"
            :body-style="item.isWatering ? { background: 'linear-gradient(135deg,#eff6ff 0%,#fff 60%)' } : {}"
            @click="openDetail(item)"
          >
            <!-- Card Header: watering animation + device code -->
            <div class="flex items-center gap-3 mb-12px">
              <div class="relative flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <template v-if="item.isWatering">
                  <span class="watering-ring ring-1"></span>
                  <span class="watering-ring ring-2"></span>
                </template>
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl z-10"
                  :class="item.isWatering ? 'bg-blue-500' : (item.status === 1 ? 'bg-gray-100' : 'bg-red-50')"
                >
                  💧
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-base truncate" :title="item.deviceCode">{{ item.deviceCode }}</div>
                <span v-if="item.isWatering" class="text-xs text-blue-600 font-semibold animate-pulse">
                  ● Watering · {{ getElapsedMinutes(item) }} min
                </span>
                <span v-else class="text-xs" :class="item.status === 1 ? 'text-green-500' : 'text-gray-400'">
                  {{ item.status === 1 ? '● Online' : '● Offline' }}
                </span>
              </div>
            </div>

            <!-- Info rows -->
            <div class="space-y-6px text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <Icon icon="ep:location" class="text-gray-400 flex-shrink-0" />
                <span class="text-gray-400">Field:</span>
                <span class="truncate">{{ item.fieldName || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon icon="ep:monitor" class="text-gray-400 flex-shrink-0" />
                <span class="text-gray-400">Sensor:</span>
                <span class="truncate text-green-600" v-if="item.sensorCode">{{ item.sensorCode }}</span>
                <span class="text-gray-300" v-else>-</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon icon="ep:odometer" class="text-gray-400 flex-shrink-0" />
                <span class="text-gray-400">Flow Rate:</span>
                <span>{{ item.flowRate != null ? item.flowRate + ' L/min' : '-' }}</span>
              </div>
            </div>

            <!-- Status + Actions -->
            <div class="flex items-center justify-between mt-14px pt-12px border-t border-gray-100" @click.stop>
              <dict-tag :type="DICT_TYPE.AGRI_IRRIGATION_DEVICE_STATUS" :value="item.status" />
              <div class="flex gap-1">
                <!-- <template v-if="item.status === 1">
                  <el-button
                    v-if="!item.isWatering"
                    link type="success" size="small"
                    :loading="item.actionLoading"
                    @click="handleStartWatering(item)"
                    v-hasPermi="['agri:irrigation-device:update']"
                  >Start</el-button>
                  <el-button
                    v-else
                    link type="danger" size="small"
                    :loading="item.actionLoading"
                    @click="handleStopWatering(item)"
                    v-hasPermi="['agri:irrigation-device:update']"
                  >Stop</el-button>
                </template> -->
                <el-button link type="primary" size="small" @click="openForm('update', item.id)" v-hasPermi="['agri:irrigation-device:update']">
                  Edit
                </el-button>
                <el-button link type="danger" size="small" @click="handleDelete(item.id!)" v-hasPermi="['agri:irrigation-device:delete']">
                  Delete
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="list.length === 0 && !loading" description="No irrigation devices found" />
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

  <IrrigationDeviceForm ref="formRef" @success="getList" />
  <IrrigationDeviceDetail ref="detailRef" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import download from '@/utils/download'
import { IrrigationDeviceApi, IrrigationDeviceVO } from '@/api/agri/irrigationDevice'
import { FieldApi, FieldVO } from '@/api/agri/field'
import IrrigationDeviceForm from './IrrigationDeviceForm.vue'
import IrrigationDeviceDetail from './IrrigationDeviceDetail.vue'

defineOptions({ name: 'AgriIrrigationDevice' })

const { t } = useI18n()
const message = useMessage()

const loading = ref(true)
const list = ref<IrrigationDeviceVO[]>([])
const total = ref(0)
const fieldList = ref<FieldVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 12,
  fieldId: undefined,
  status: undefined,
  isWatering: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)

// Ticking clock for elapsed time display (updates every 30 s)
const now = ref(Date.now())
let timerHandle: ReturnType<typeof setInterval> | null = null

const getElapsedMinutes = (item: IrrigationDeviceVO): number => {
  if (!item.wateringStartedAt) return 0
  const startMs = new Date(item.wateringStartedAt).getTime()
  return Math.max(0, Math.floor((now.value - startMs) / 60000))
}

const loadFieldOptions = async () => {
  const data = await FieldApi.getFieldPage({ pageNo: 1, pageSize: 100 })
  fieldList.value = data.list
}

const getList = async () => {
  loading.value = true
  try {
    const data = await IrrigationDeviceApi.getIrrigationDevicePage(queryParams)
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
const openDetail = (item: IrrigationDeviceVO) => detailRef.value.open(item)

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await IrrigationDeviceApi.deleteIrrigationDevice(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleStartWatering = async (row: IrrigationDeviceVO) => {
  try {
    await message.confirm('Start watering for this device?')
    row.actionLoading = true
    await IrrigationDeviceApi.startWatering(row.id!)
    message.success('Watering started')
    await getList()
  } catch {
  } finally {
    row.actionLoading = false
  }
}

const handleStopWatering = async (row: IrrigationDeviceVO) => {
  try {
    await message.confirm('Stop watering for this device?')
    row.actionLoading = true
    await IrrigationDeviceApi.stopWatering(row.id!)
    message.success('Watering stopped')
    await getList()
  } catch {
  } finally {
    row.actionLoading = false
  }
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await IrrigationDeviceApi.exportIrrigationDevice(queryParams)
    download.excel(data, 'Irrigation Devices.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
  loadFieldOptions()
  timerHandle = setInterval(() => { now.value = Date.now() }, 30000)
})

onUnmounted(() => {
  if (timerHandle) clearInterval(timerHandle)
})
</script>

<style scoped>
.watering-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid #3B82F6;
  opacity: 0;
  animation: watering-pulse 2s ease-out infinite;
}
.watering-ring.ring-1 { width: 44px; height: 44px; animation-delay: 0s; }
.watering-ring.ring-2 { width: 60px; height: 60px; animation-delay: 0.6s; }

@keyframes watering-pulse {
  0%   { transform: scale(0.6); opacity: 0.7; }
  100% { transform: scale(1.2); opacity: 0; }
}
</style>
