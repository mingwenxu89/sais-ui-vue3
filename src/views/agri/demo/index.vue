<template>
  <div class="demo-panel p-20px">
    <el-page-header title="Back" @back="router.back()">
      <template #content>
        <span class="text-lg font-semibold">Demo Task Trigger Panel</span>
        <span class="ml-10px text-sm text-gray-400">Manually trigger scheduled tasks for demonstration</span>
      </template>
    </el-page-header>

    <el-alert
      class="mt-16px"
      title="Demo Mode"
      type="info"
      description="This panel lets you manually fire background scheduled jobs that normally run on a timer. Each button calls the same logic the scheduler uses — results appear in the relevant management pages."
      show-icon
      :closable="false"
    />

    <el-row :gutter="16" class="mt-20px">
      <!-- Sensor Data Report -->
      <el-col :xs="24" :sm="12" :md="8" :lg="6" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <span class="font-semibold">Sensor Data Report</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Publish mock readings to AWS IoT for all active sensors.
          </div>
          <div class="flex items-center gap-8px text-xs text-gray-400 mb-16px">
            <el-icon><Clock /></el-icon>
            <span>Cron: every 10 min</span>
          </div>
          <el-button
            type="primary"
            :loading="loading.sensorReport"
            @click="runTask('sensorReport', DemoApi.triggerSensorReport)"
            class="w-full"
          >
            <el-icon class="mr-4px"><Upload /></el-icon>
            Trigger Sensor Report
          </el-button>
        </el-card>
      </el-col>

      <!-- Weather Fetch -->
      <el-col :xs="24" :sm="12" :md="8" :lg="6" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <span class="font-semibold">Weather Data Fetch</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Fetch and save forecasts for all farms.
          </div>
          <div class="flex items-center gap-8px text-xs text-gray-400 mb-16px">
            <el-icon><Clock /></el-icon>
            <span>Cron: every 10 min</span>
          </div>
          <el-button
            type="info"
            :loading="loading.weatherFetch"
            @click="runTask('weatherFetch', DemoApi.triggerWeatherFetch)"
            class="w-full"
          >
            <el-icon class="mr-4px"><Cloudy /></el-icon>
            Trigger Weather Fetch
          </el-button>
        </el-card>
      </el-col>

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

      <!-- Alert Check (Weather) -->
      <el-col :xs="24" :sm="12" :md="8" :lg="6" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <span class="font-semibold">Weather Alert Detection</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Raise alerts on extreme weather (3-day window).
          </div>
          <el-button
            type="danger"
            :loading="loading.alertCheck"
            @click="runTask('alertCheck', () => DemoApi.triggerAlertCheck())"
            class="w-full"
          >
            <el-icon class="mr-4px"><Bell /></el-icon>
            Trigger Alert Detection
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

      <!-- Inject Test Data (sensor + weather) -->
      <el-col :xs="24" :sm="12" :md="8" :lg="6" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <span class="font-semibold">Inject Test Data</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Push fixed sensor or weather values to drive scenarios.
          </div>
          <div class="flex flex-col gap-8px">
            <el-select v-model="injectType" size="small" placeholder="Select data type">
              <el-option
                v-for="opt in injectTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <el-input-number
              v-model="injectValue"
              size="small"
              :precision="1"
              :step="1"
              placeholder="Value"
              class="w-full"
              controls-position="right"
            />
            <el-button
              type="primary"
              :loading="loading[`inject_${injectType}`]"
              @click="runInject"
              class="w-full"
            >
              <el-icon class="mr-4px"><Upload /></el-icon>
              Inject
            </el-button>
          </div>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Clock, Upload, Cloudy, MagicStick, Odometer, Bell } from '@element-plus/icons-vue'
import { DemoApi } from '@/api/agri/demo'

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

// ── Inject test data (sensor + weather) ────────────────────────────────────
type InjectKind = 'sensor' | 'weather'
interface InjectOption {
  label: string
  value: string
  kind: InjectKind
}
const injectTypeOptions: InjectOption[] = [
  { label: 'Soil Moisture (%)', value: 'SOIL_MOISTURE', kind: 'sensor' },
  { label: 'Air Temperature (°C)', value: 'TEMPERATURE', kind: 'sensor' },
  { label: 'Tomorrow Rainfall (mm)', value: 'rainfall', kind: 'weather' },
  { label: 'Tomorrow Min Temp (°C)', value: 'tempMin', kind: 'weather' },
  { label: 'Tomorrow Max Temp (°C)', value: 'tempMax', kind: 'weather' }
]
const injectType = ref<string>('SOIL_MOISTURE')
const injectValue = ref<number | undefined>(undefined)

const runInject = () => {
  if (injectValue.value === undefined || injectValue.value === null) {
    ElMessage.warning('Please enter a value')
    return
  }
  const opt = injectTypeOptions.find(o => o.value === injectType.value)
  if (!opt) return
  const value = injectValue.value
  const fn = opt.kind === 'sensor'
    ? () => DemoApi.injectSensorData(opt.value, value)
    : () => DemoApi.injectWeatherForecast(opt.value, value)
  runTask(`inject_${opt.value}`, fn)
}
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
