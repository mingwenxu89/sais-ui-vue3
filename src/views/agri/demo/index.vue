<template>
  <div class="demo-panel p-20px">
    <div class="demo-page-title">
      <span class="text-lg font-semibold">Demo Task Trigger Panel</span>
      <span class="ml-10px text-sm text-gray-400">
        Manually trigger scheduled tasks for demonstration
      </span>
    </div>

    <el-row :gutter="16" class="sensor-report-row mt-20px">
      <el-col :xs="24" :lg="12" class="mb-16px">
        <el-card shadow="never" class="report-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">Periodic Sensor Data Report</span>
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
        <el-card shadow="never" class="report-card">
          <template #header>
            <span class="font-semibold">Mannual Single Sensor Data Report</span>
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
              class="manual-sensor-table mb-16px"
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

    <el-row :gutter="16" class="mt-4px">
      <!-- AI Irrigation Decision -->
      <el-col :xs="24" :sm="12" :lg="8" class="mb-16px">
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
      <el-col :xs="24" :sm="12" :lg="8" class="mb-16px">
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

      <!-- Irrigation Device Fault Simulation -->
      <el-col :xs="24" :sm="12" :lg="8" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <span class="font-semibold">Device Fault Simulation</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Withhold device ACK to trigger an irrigation abnormal alert.
          </div>
          <el-form :model="faultForm" label-width="120px" class="fault-form">
            <el-form-item label="Field">
              <el-select
                v-model="faultForm.fieldId"
                filterable
                clearable
                class="!w-100%"
                placeholder="Select field"
                @change="handleFaultFieldChange"
              >
                <el-option
                  v-for="field in fieldOptions"
                  :key="field.id"
                  :label="field.fieldName"
                  :value="field.id!"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Device">
              <el-select
                v-model="faultForm.deviceId"
                filterable
                clearable
                class="!w-100%"
                placeholder="Select device"
                :loading="faultLoading.devices"
                @change="handleFaultDeviceChange"
              >
                <el-option
                  v-for="device in faultDeviceOptions"
                  :key="device.id"
                  :label="device.deviceCode"
                  :value="device.id!"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Simulate Fault">
              <el-switch v-model="faultForm.simulateFault" />
            </el-form-item>
          </el-form>
          <el-button
            type="danger"
            plain
            :loading="faultLoading.save"
            :disabled="!faultForm.deviceId"
            @click="handleFaultSave"
            class="w-full"
          >
            <el-icon class="mr-4px"><Warning /></el-icon>
            Save Fault Simulation
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  Clock,
  MagicStick,
  Odometer,
  Refresh,
  Upload,
  VideoPause,
  VideoPlay,
  Warning
} from '@element-plus/icons-vue'
import { DemoApi } from '@/api/agri/demo'
import { FieldApi, FieldVO } from '@/api/agri/field'
import { IrrigationDeviceApi, IrrigationDeviceVO } from '@/api/agri/irrigationDevice'
import { SensorApi, SensorVO } from '@/api/agri/sensor'
import { SensorReportingApi, SensorReportingStatusVO } from '@/api/agri/sensorReporting'

defineOptions({ name: 'AgriDemo' })

const loading = reactive<Record<string, boolean>>({})

const runTask = async (key: string, apiFn: () => Promise<any>) => {
  loading[key] = true
  try {
    const result = await apiFn()
    const msg = typeof result === 'string' ? result : JSON.stringify(result)
    ElMessage.success(msg)
  } catch (e: any) {
    const msg = e?.message ?? String(e)
    ElMessage.error(msg)
  } finally {
    loading[key] = false
  }
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
const faultDeviceOptions = ref<IrrigationDeviceVO[]>([])
const faultLoading = reactive({
  devices: false,
  save: false
})
const faultForm = reactive({
  fieldId: undefined as number | undefined,
  deviceId: undefined as number | undefined,
  simulateFault: false
})

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

const loadFaultDevices = async () => {
  if (!faultForm.fieldId) {
    faultDeviceOptions.value = []
    return
  }
  faultLoading.devices = true
  try {
    const data = await IrrigationDeviceApi.getIrrigationDevicePage({
      pageNo: 1,
      pageSize: 200,
      fieldId: faultForm.fieldId
    })
    faultDeviceOptions.value = data.list || []
  } finally {
    faultLoading.devices = false
  }
}

const handleFaultFieldChange = async () => {
  faultForm.deviceId = undefined
  faultForm.simulateFault = false
  await loadFaultDevices()
}

const handleFaultDeviceChange = () => {
  const device = faultDeviceOptions.value.find((item) => item.id === faultForm.deviceId)
  faultForm.simulateFault = device?.simulateFault ?? false
}

const handleFaultSave = async () => {
  if (!faultForm.deviceId) {
    ElMessage.warning('Please select a device')
    return
  }
  faultLoading.save = true
  try {
    const device = await IrrigationDeviceApi.getIrrigationDevice(faultForm.deviceId)
    await IrrigationDeviceApi.updateIrrigationDevice({
      id: device.id,
      fieldId: device.fieldId,
      sensorId: device.sensorId,
      flowRate: device.flowRate,
      status: device.status,
      simulateFault: faultForm.simulateFault
    })
    await loadFaultDevices()
    ElMessage.success('Fault simulation updated')
  } finally {
    faultLoading.save = false
  }
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
  const filledRows = manualSensorRows.value.filter(
    (row) => row.value !== undefined && row.value !== null
  )
  if (filledRows.length === 0) {
    ElMessage.warning('Please enter at least one sensor value')
    return
  }
  reportingLoading.manual = true
  try {
    await Promise.all(
      filledRows.map((row) =>
        SensorReportingApi.reportManual({
          fieldId: manualForm.fieldId!,
          sensorId: row.sensorId,
          dataType: 'SOIL_MOISTURE',
          value: row.value!
        })
      )
    )
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

.report-card {
  height: 380px;
}
.report-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: #fafafa;
}
.report-card :deep(.el-card__body) {
  height: calc(100% - 49px);
  overflow: auto;
}
.manual-sensor-table {
  max-height: 170px;
  overflow: auto;
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
</style>
