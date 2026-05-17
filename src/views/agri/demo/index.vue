<template>
  <div class="demo-panel p-20px">
    <el-page-header title="Back" @back="router.back()">
      <template #content>
        <span class="text-lg font-semibold">Demo Task Trigger Panel</span>
        <span class="ml-10px text-sm text-gray-400">Manually trigger scheduled tasks for demonstration</span>
      </template>
    </el-page-header>

    <el-row :gutter="16" class="mt-20px">
      <!-- AI Irrigation Decision -->
      <el-col :xs="24" :sm="12" :md="8" :lg="6" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <span class="font-semibold">AI Irrigation Decision</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Run Bedrock decision engine; create irrigation plans.
          </div>
          <div class="flex items-center gap-8px text-xs text-gray-400 mb-16px">
            <el-icon><Clock /></el-icon>
            <span>Cron: every 30 min</span>
          </div>
          <el-button
            type="success"
            :loading="loading.aiIrrigation"
            @click="runTask('aiIrrigation', DemoApi.triggerAiIrrigation)"
            class="w-full"
          >
            <el-icon class="mr-4px"><MagicStick /></el-icon>
            Trigger AI Irrigation Decision
          </el-button>
        </el-card>
      </el-col>

      <!-- Irrigation Plan Execution -->
      <el-col :xs="24" :sm="12" :md="8" :lg="6" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <span class="font-semibold">Irrigation Plan Execution</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Dispatch PENDING plans, finish EXECUTING ones, flag faults.
          </div>
          <div class="flex items-center gap-8px text-xs text-gray-400 mb-16px">
            <el-icon><Clock /></el-icon>
            <span>Cron: every minute</span>
          </div>
          <el-button
            type="warning"
            :loading="loading.irrigationExecution"
            @click="runTask('irrigationExecution', DemoApi.triggerIrrigationExecution)"
            class="w-full"
          >
            <el-icon class="mr-4px"><Odometer /></el-icon>
            Trigger Plan Execution
          </el-button>
        </el-card>
      </el-col>

      <!-- Test Alerts -->
      <el-col :xs="24" :sm="12" :md="8" :lg="6" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <span class="font-semibold">Inject Test Alert</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Insert a test alert record (for UI demo).
          </div>
          <div class="flex flex-col gap-8px">
            <el-button
              plain
              type="warning"
              size="small"
              :loading="loading['testAlert_SENSOR_ABNORMAL']"
              @click="runTestAlert('SENSOR_ABNORMAL')"
            >
              Sensor Abnormal
            </el-button>
            <el-button
              plain
              type="danger"
              size="small"
              :loading="loading['testAlert_IRRIGATION_ABNORMAL']"
              @click="runTestAlert('IRRIGATION_ABNORMAL')"
            >
              Irrigation Fault
            </el-button>
            <el-button
              plain
              type="info"
              size="small"
              :loading="loading['testAlert_EXTREME_WEATHER']"
              @click="runTestAlert('EXTREME_WEATHER')"
            >
              Extreme Weather
            </el-button>
          </div>
        </el-card>
      </el-col>

    </el-row>

    <el-row :gutter="16" class="mt-4px">
      <el-col :xs="24" :lg="12" class="mb-16px">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">Periodic Random Reporting</span>
              <el-tag :type="reportingStatus.running ? 'success' : 'info'">
                {{ reportingStatus.running ? 'Running' : 'Stopped' }}
              </el-tag>
            </div>
          </template>

          <el-form :model="scheduleForm" label-width="130px">
            <el-form-item label="Interval">
              <el-input-number
                v-model="scheduleForm.intervalSeconds"
                :min="5"
                :step="5"
                controls-position="right"
                class="!w-220px"
              />
              <span class="ml-8px text-gray-500">seconds</span>
            </el-form-item>
            <el-form-item label="Started At">
              <span>{{ formatValue(reportingStatus.startedAt) }}</span>
            </el-form-item>
            <el-form-item label="Last Run">
              <span>{{ formatValue(reportingStatus.lastRunAt) }}</span>
            </el-form-item>
            <el-form-item label="Last Result">
              <span>
                {{ reportingStatus.lastSuccessCount ?? 0 }} succeeded,
                {{ reportingStatus.lastFailureCount ?? 0 }} failed
              </span>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :disabled="reportingStatus.running"
                :loading="reportingLoading.start"
                @click="handleReportingStart"
                v-hasPermi="['agri:sensor:query']"
              >
                <el-icon class="mr-4px"><VideoPlay /></el-icon>
                Start
              </el-button>
              <el-button
                type="danger"
                plain
                :disabled="!reportingStatus.running"
                :loading="reportingLoading.stop"
                @click="handleReportingStop"
                v-hasPermi="['agri:sensor:query']"
              >
                <el-icon class="mr-4px"><VideoPause /></el-icon>
                Stop
              </el-button>
              <el-button :loading="reportingLoading.status" @click="loadReportingStatus">
                <el-icon class="mr-4px"><Refresh /></el-icon>
                Refresh
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12" class="mb-16px">
        <el-card shadow="never">
          <template #header>
            <span class="font-semibold">Manual Single Report</span>
          </template>

          <el-form ref="manualFormRef" :model="manualForm" :rules="manualRules" label-width="90px">
            <el-form-item label="Field" prop="fieldId">
              <el-select
                v-model="manualForm.fieldId"
                filterable
                clearable
                class="!w-100%"
                placeholder="Select field"
                @change="handleFieldChange"
              >
                <el-option
                  v-for="field in fieldOptions"
                  :key="field.id"
                  :label="field.fieldName"
                  :value="field.id!"
                />
              </el-select>
            </el-form-item>
            <el-table
              v-loading="reportingLoading.sensors"
              :data="manualSensorRows"
              border
              class="mb-16px"
              empty-text="Select a field to load sensors"
            >
              <el-table-column label="Sensor" min-width="140">
                <template #default="{ row }">
                  <div class="font-medium">{{ row.sensorCode }}</div>
                  <div class="text-12px text-gray-400">{{ row.model || '-' }}</div>
                </template>
              </el-table-column>
              <el-table-column label="Data Type" min-width="150">
                <template #default>
                  <span>Soil Moisture</span>
                </template>
              </el-table-column>
              <el-table-column label="Value" min-width="150">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.value"
                    :min="0"
                    :precision="2"
                    :step="1"
                    controls-position="right"
                    size="small"
                    class="!w-130px"
                  />
                </template>
              </el-table-column>
            </el-table>
            <el-form-item>
              <el-button
                type="primary"
                :loading="reportingLoading.manual"
                @click="handleManualReport"
                v-hasPermi="['agri:sensor:create']"
              >
                <el-icon class="mr-4px"><Upload /></el-icon>
                Send Filled Reports
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- Execution log -->
    <el-card class="mt-16px" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">Execution Log</span>
          <el-button text size="small" @click="logs = []">Clear</el-button>
        </div>
      </template>
      <div class="log-box font-mono text-sm" style="min-height: 120px; max-height: 320px; overflow-y: auto;">
        <div v-if="logs.length === 0" class="text-gray-400 text-center py-20px">
          No tasks triggered yet. Click a button above to start.
        </div>
        <div
          v-for="(entry, i) in logs"
          :key="i"
          :class="['log-line py-2px px-4px rounded', entry.success ? 'text-green-700' : 'text-red-600']"
        >
          <span class="text-gray-400 mr-8px">{{ entry.time }}</span>
          <el-tag :type="entry.success ? 'success' : 'danger'" size="small" effect="plain" class="mr-8px">
            {{ entry.success ? 'OK' : 'ERR' }}
          </el-tag>
          <span>{{ entry.message }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  Bell,
  Clock,
  MagicStick,
  Odometer,
  Refresh,
  Upload,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import { DemoApi } from '@/api/agri/demo'
import { FieldApi, FieldVO } from '@/api/agri/field'
import { SensorApi, SensorVO } from '@/api/agri/sensor'
import {
  SensorReportingApi,
  SensorReportingStatusVO
} from '@/api/agri/sensorReporting'

defineOptions({ name: 'AgriDemo' })

const router = useRouter()

const loading = reactive<Record<string, boolean>>({})

interface LogEntry {
  time: string
  success: boolean
  message: string
}
const logs = ref<LogEntry[]>([])

const now = () => new Date().toLocaleTimeString()

const runTask = async (key: string, apiFn: () => Promise<any>) => {
  loading[key] = true
  try {
    const result = await apiFn()
    const msg = typeof result === 'string' ? result : JSON.stringify(result)
    logs.value.unshift({ time: now(), success: true, message: msg })
    ElMessage.success(msg)
  } catch (e: any) {
    const msg = e?.message ?? String(e)
    logs.value.unshift({ time: now(), success: false, message: msg })
    ElMessage.error(msg)
  } finally {
    loading[key] = false
  }
}

const runTestAlert = (type: string) => {
  const key = `testAlert_${type}`
  runTask(key, () => DemoApi.triggerTestAlert(type))
}

const reportingStatus = reactive<SensorReportingStatusVO>({
  running: false,
  lastSuccessCount: 0,
  lastFailureCount: 0
})
const reportingLoading = reactive({
  status: false,
  start: false,
  stop: false,
  manual: false,
  sensors: false
})
const scheduleForm = reactive({
  intervalSeconds: 60
})
const fieldOptions = ref<FieldVO[]>([])
const manualFormRef = ref<FormInstance>()
const manualForm = reactive({
  fieldId: undefined as number | undefined
})
const manualRules = reactive<FormRules>({
  fieldId: [{ required: true, message: 'Please select a field', trigger: 'change' }]
})

interface ManualSensorRow {
  sensorId: number
  sensorCode?: string
  model?: string
  value?: number
}
const manualSensorRows = ref<ManualSensorRow[]>([])

const applyReportingStatus = (data: SensorReportingStatusVO) => {
  Object.assign(reportingStatus, data || { running: false })
  if (reportingStatus.intervalSeconds) {
    scheduleForm.intervalSeconds = reportingStatus.intervalSeconds
  }
}

const loadReportingStatus = async () => {
  reportingLoading.status = true
  try {
    applyReportingStatus(await SensorReportingApi.getStatus())
  } finally {
    reportingLoading.status = false
  }
}

const loadFields = async () => {
  const data = await FieldApi.getFieldPage({ pageNo: 1, pageSize: 200 })
  fieldOptions.value = data.list || []
}

const loadSensors = async () => {
  if (!manualForm.fieldId) {
    manualSensorRows.value = []
    return
  }
  reportingLoading.sensors = true
  try {
    const data = await SensorApi.getSensorPage({
      pageNo: 1,
      pageSize: 200,
      fieldId: manualForm.fieldId,
      status: 1
    })
    manualSensorRows.value = (data.list || []).map((sensor: SensorVO) => ({
      sensorId: sensor.id!,
      sensorCode: sensor.sensorCode,
      model: sensor.model,
      value: undefined
    }))
  } finally {
    reportingLoading.sensors = false
  }
}

const handleFieldChange = async () => {
  await loadSensors()
}

const handleReportingStart = async () => {
  if (reportingStatus.running) {
    ElMessage.warning('Please stop the current task before starting it again')
    return
  }
  reportingLoading.start = true
  try {
    applyReportingStatus(await SensorReportingApi.start(scheduleForm.intervalSeconds))
    ElMessage.success('Sensor reporting started')
  } finally {
    reportingLoading.start = false
  }
}

const handleReportingStop = async () => {
  reportingLoading.stop = true
  try {
    applyReportingStatus(await SensorReportingApi.stop())
    ElMessage.success('Sensor reporting stopped')
  } finally {
    reportingLoading.stop = false
  }
}

const handleManualReport = async () => {
  await manualFormRef.value?.validate()
  const filledRows = manualSensorRows.value.filter(row => row.value !== undefined && row.value !== null)
  if (filledRows.length === 0) {
    ElMessage.warning('Please enter at least one sensor value')
    return
  }
  reportingLoading.manual = true
  try {
    await Promise.all(filledRows.map(row => SensorReportingApi.reportManual({
      fieldId: manualForm.fieldId!,
      sensorId: row.sensorId,
      dataType: 'SOIL_MOISTURE',
      value: row.value!
    })))
    ElMessage.success(`${filledRows.length} sensor reading(s) sent`)
  } finally {
    reportingLoading.manual = false
  }
}

const formatValue = (value?: string) => {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

onMounted(async () => {
  await Promise.all([loadReportingStatus(), loadFields()])
})
</script>

<style scoped>
.task-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: #fafafa;
}

/* Pin the action button(s) to the bottom of every task card */
.task-card {
  display: flex;
  flex-direction: column;
}
.task-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.task-card :deep(.el-card__body) > :last-child {
  margin-top: auto;
}

.log-line:hover {
  background: #f5f5f5;
}
</style>
