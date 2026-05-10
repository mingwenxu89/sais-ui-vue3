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
      <el-col :xs="24" :sm="12" :lg="8" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <el-tag type="primary" effect="plain" size="small">IoT</el-tag>
              <span class="font-semibold">Sensor Data Report</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Publishes simulated soil moisture readings for all active sensors to AWS IoT Core.
            Scheduled every 10 minutes. Requires AWS IoT to be configured.
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
      <el-col :xs="24" :sm="12" :lg="8" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <el-tag type="info" effect="plain" size="small">Weather</el-tag>
              <span class="font-semibold">Weather Data Fetch</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Fetches and saves weather forecast data for all registered farms from the weather API.
            Scheduled every 10 minutes.
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
      <el-col :xs="24" :sm="12" :lg="8" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <el-tag type="success" effect="plain" size="small">AI</el-tag>
              <span class="font-semibold">AI Irrigation Decision</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Runs the AI irrigation decision engine (AWS Bedrock) for all active fields.
            Evaluates soil moisture, weather, and crop growth stage to generate irrigation plans.
            Scheduled every 30 minutes.
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
              <el-tag type="warning" effect="plain" size="small">Execution</el-tag>
              <span class="font-semibold">Irrigation Plan Execution</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Scans pending irrigation plans and dispatches MQTT commands to devices.
            Starts PENDING plans due now, completes EXECUTING plans whose duration elapsed,
            and checks for device faults. Scheduled every minute.
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
      <el-col :xs="24" :sm="12" :lg="8" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <el-tag type="danger" effect="plain" size="small">Alert</el-tag>
              <span class="font-semibold">Weather Alert Detection</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Evaluates the 3-day weather forecast for all farms and raises alerts for extreme
            conditions (frost, heavy rain, heatwave). Triggered after every weather fetch.
          </div>
          <div class="flex items-center gap-8px text-xs text-gray-400 mb-16px">
            <el-icon><Location /></el-icon>
            <span>Farm ID (optional):</span>
            <el-input-number
              v-model="alertFarmId"
              :min="1"
              size="small"
              placeholder="All farms"
              class="w-120px"
              controls-position="right"
            />
          </div>
          <el-button
            type="danger"
            :loading="loading.alertCheck"
            @click="runTask('alertCheck', () => DemoApi.triggerAlertCheck(alertFarmId))"
            class="w-full"
          >
            <el-icon class="mr-4px"><Bell /></el-icon>
            Trigger Alert Detection
          </el-button>
        </el-card>
      </el-col>

      <!-- Test Alerts -->
      <el-col :xs="24" :sm="12" :lg="8" class="mb-16px">
        <el-card shadow="hover" class="task-card h-full">
          <template #header>
            <div class="flex items-center gap-10px">
              <el-tag type="danger" effect="dark" size="small">Test</el-tag>
              <span class="font-semibold">Inject Test Alert</span>
            </div>
          </template>
          <div class="task-desc text-sm text-gray-500 mb-16px">
            Directly inserts a test alert record into the system for UI demonstration.
            Useful for showing the alert management workflow without real sensor data.
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
import { Clock, Upload, Cloudy, MagicStick, Odometer, Bell, Location } from '@element-plus/icons-vue'
import { DemoApi } from '@/api/agri/demo'

defineOptions({ name: 'AgriDemo' })

const router = useRouter()

const alertFarmId = ref<number | undefined>(undefined)

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
</script>

<style scoped>
.task-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: #fafafa;
}

.log-line:hover {
  background: #f5f5f5;
}
</style>
