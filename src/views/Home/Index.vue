<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ farmName || 'Smart Agriculture Irrigation System' }}</p>
      </div>

      <!-- Weather Widget -->
      <div class="flex items-center gap-2">
        <div
          v-if="weatherList.length > 0"
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-50 to-white border border-sky-100"
        >
          <Icon :icon="getWeatherIcon(weatherList[0].weatherDesc)" class="text-sky-400 text-2xl flex-shrink-0" />
          <div class="mr-1">
            <div class="flex items-baseline gap-1.5">
              <span class="text-lg font-bold text-gray-800 leading-none">
                {{ weatherList[0].temperature != null ? weatherList[0].temperature.toFixed(1) + '°C' : '--°C' }}
              </span>
              <span class="text-xs text-gray-500 capitalize hidden sm:inline">{{ weatherList[0].weatherDesc }}</span>
            </div>
            <div class="flex gap-2 text-xs text-gray-400 mt-0.5">
              <span v-if="weatherList[0].humidity != null">{{ weatherList[0].humidity.toFixed(0) }}% hum</span>
              <span v-if="weatherList[0].rainfall != null" class="text-blue-400">{{ weatherList[0].rainfall.toFixed(1) }}mm</span>
            </div>
          </div>
          <!-- Forecast strip -->
          <div
            v-if="weatherList[0].forecast && weatherList[0].forecast.length > 0"
            class="hidden lg:flex items-center gap-1 border-l border-sky-100 pl-3"
          >
            <div
              v-for="(day, i) in weatherList[0].forecast.slice(0, 4)"
              :key="i"
              class="flex flex-col items-center text-xs px-2 py-1 rounded hover:bg-sky-50 transition-colors"
            >
              <span class="text-gray-400 mb-0.5">{{ i === 0 ? 'Today' : i === 1 ? 'Tmr' : formatDayShort(day.forecastDate) }}</span>
              <Icon :icon="getWeatherIcon(day.weatherDesc)" class="text-sky-400 text-sm mb-0.5" />
              <span class="text-blue-500">{{ day.tempMin?.toFixed(0) }}°</span>
              <span class="text-red-400">{{ day.tempMax?.toFixed(0) }}°</span>
            </div>
          </div>
        </div>
        <div v-else-if="weatherLoading" class="text-sm text-gray-400 px-2">Loading weather…</div>
      </div>
    </div>

    <!-- Metric Cards -->
    <el-row :gutter="16">
      <el-col :xs="12" :sm="12" :md="6" class="mb-4">
        <SummaryCard
          title="Total Fields"
          icon="ep:location"
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          :value="totalFields"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" class="mb-4">
        <SummaryCard
          title="Active Irrigation"
          icon="mdi:sprinkler"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          :value="activeWatering"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" class="mb-4">
        <SummaryCard
          title="Online Sensors"
          icon="ep:monitor"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          :value="onlineSensors"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" class="mb-4">
        <SummaryCard
          title="Executing Plans"
          icon="ep:calendar"
          iconColor="text-orange-500"
          iconBgColor="bg-orange-50"
          :value="executingPlanCount"
        />
      </el-col>
    </el-row>

    <!-- Field Status + Recent Irrigation -->
    <el-row :gutter="16">
      <!-- Field Status -->
      <el-col :xs="24" :lg="15" class="mb-4">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex items-center gap-2">
              <Icon icon="ep:grid" class="text-green-500" />
              <span class="font-semibold">Field Status</span>
            </div>
          </template>
          <div v-loading="loading" class="grid grid-cols-2 gap-3">
            <div
              v-for="field in fields"
              :key="field.id"
              class="p-3 rounded-lg border transition-colors"
              :class="fieldWateringMap[field.id!]
                ? 'bg-blue-50 border-blue-100'
                : 'bg-gray-50 border-gray-100 hover:bg-gray-100'"
            >
              <div class="font-medium text-sm truncate mb-1" :title="field.fieldName">
                {{ field.fieldName }}
              </div>
              <div v-if="cropPlanMap[field.id!]" class="text-xs text-green-600 mb-1.5 truncate">
                🌾 {{ cropPlanMap[field.id!].cropName }}
                <span class="text-gray-400 ml-1">→ {{ cropPlanMap[field.id!].endDate }}</span>
              </div>
              <div v-else class="text-xs text-gray-400 mb-1.5">No crop plan</div>
              <div class="flex items-center">
                <span v-if="fieldWateringMap[field.id!]"
                  class="text-xs text-blue-600 font-semibold animate-pulse">
                  💧 Watering
                </span>
                <span v-else class="text-xs text-gray-400">Idle</span>
                <span class="text-xs text-gray-300 ml-auto">
                  {{ fieldDeviceCountMap[field.id!] || 0 }} device{{ (fieldDeviceCountMap[field.id!] || 0) !== 1 ? 's' : '' }}
                </span>
              </div>
            </div>
            <el-empty
              v-if="!loading && fields.length === 0"
              description="No fields configured"
              class="col-span-2 py-8"
            />
          </div>
        </el-card>
      </el-col>

      <!-- Recent Irrigation Plans -->
      <el-col :xs="24" :lg="9" class="mb-4">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex items-center gap-2">
              <Icon icon="ep:list" class="text-blue-500" />
              <span class="font-semibold">Recent Irrigation</span>
            </div>
          </template>
          <div v-loading="loading">
            <div
              v-for="plan in recentPlans"
              :key="plan.id"
              class="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
            >
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium truncate">
                  {{ plan.fieldName || 'Field #' + plan.fieldId }}
                </div>
                <div class="text-xs text-gray-400 mt-0.5">
                  {{ formatTime(plan.actualStartTime || plan.plannedStartTime) }}
                  <span v-if="plan.waterQuantity" class="ml-2 text-blue-500">
                    {{ Number(plan.waterQuantity).toFixed(0) }} L
                  </span>
                </div>
              </div>
              <el-tag :type="planTagType(plan.status)" size="small" class="ml-2 flex-shrink-0">
                {{ plan.status }}
              </el-tag>
            </div>
            <el-empty
              v-if="!loading && recentPlans.length === 0"
              description="No records yet"
              class="py-6"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FieldApi, FieldVO } from '@/api/agri/field'
import { IrrigationDeviceApi, IrrigationDeviceVO } from '@/api/agri/irrigationDevice'
import { SensorApi } from '@/api/agri/sensor'
import { IrrigationPlanApi, IrrigationPlanVO } from '@/api/agri/irrigationPlan'
import { CropPlanApi, CropPlanVO } from '@/api/agri/cropPlan'
import { FarmApi } from '@/api/agri/farm'
import { WeatherDataApi, WeatherDataVO } from '@/api/agri/weather'

defineOptions({ name: 'HomeDashboard' })

// --- State ---
const loading = ref(false)
const farmName = ref('')

const totalFields = ref(0)
const activeWatering = ref(0)
const onlineSensors = ref(0)
const executingPlanCount = ref(0)

const fields = ref<FieldVO[]>([])
const cropPlanMap = ref<Record<number, CropPlanVO>>({})
const fieldWateringMap = ref<Record<number, boolean>>({})
const fieldDeviceCountMap = ref<Record<number, number>>({})
const recentPlans = ref<IrrigationPlanVO[]>([])

const weatherLoading = ref(false)
const weatherList = ref<WeatherDataVO[]>([])

// --- Data loading ---
const loadAll = async () => {
  loading.value = true
  try {
    const [farmRes, fieldRes, deviceRes, sensorRes, planRes, execRes, cropRes] = await Promise.all([
      FarmApi.getCurrentFarm().catch(() => null),
      FieldApi.getFieldPage({ pageNo: 1, pageSize: 100 }),
      IrrigationDeviceApi.getIrrigationDevicePage({ pageNo: 1, pageSize: 100 }),
      SensorApi.getSensorPage({ pageNo: 1, pageSize: 100 }),
      IrrigationPlanApi.getIrrigationPlanPage({ pageNo: 1, pageSize: 8 }),
      IrrigationPlanApi.getIrrigationPlanPage({ status: 'EXECUTING', pageNo: 1, pageSize: 1 }),
      CropPlanApi.getCropPlanPage({ pageNo: 1, pageSize: 100 }),
    ])

    farmName.value = farmRes?.farmName || ''

    fields.value = fieldRes.list
    totalFields.value = fieldRes.total

    const devices: IrrigationDeviceVO[] = deviceRes.list
    activeWatering.value = devices.filter(d => d.isWatering).length
    const wateringMap: Record<number, boolean> = {}
    const countMap: Record<number, number> = {}
    devices.forEach(d => {
      if (d.fieldId) {
        if (d.isWatering) wateringMap[d.fieldId] = true
        countMap[d.fieldId] = (countMap[d.fieldId] || 0) + 1
      }
    })
    fieldWateringMap.value = wateringMap
    fieldDeviceCountMap.value = countMap

    onlineSensors.value = sensorRes.list.filter((s: any) => s.status === 1).length

    recentPlans.value = planRes.list
    executingPlanCount.value = execRes.total

    // Active crop plans: endDate >= today, keyed by fieldId (keep latest)
    const today = new Date().toISOString().slice(0, 10)
    const cpMap: Record<number, CropPlanVO> = {}
    ;(cropRes.list as CropPlanVO[]).forEach(cp => {
      if (cp.fieldId && cp.endDate && cp.endDate >= today) {
        if (!cpMap[cp.fieldId] || (cp.startDate || '') > (cpMap[cp.fieldId].startDate || '')) {
          cpMap[cp.fieldId] = cp
        }
      }
    })
    cropPlanMap.value = cpMap
  } finally {
    loading.value = false
  }
}

const loadWeather = async () => {
  weatherLoading.value = true
  try {
    weatherList.value = (await WeatherDataApi.getLatestWeatherList()) || []
  } catch {
    weatherList.value = []
  } finally {
    weatherLoading.value = false
  }
}


// --- Helpers ---
const formatTime = (dt?: string) => {
  if (!dt) return ''
  return new Date(dt).toLocaleString('en-NZ', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const formatDayShort = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-NZ', { weekday: 'short' })
}

const planTagType = (status?: string): '' | 'success' | 'warning' | 'danger' | 'info' => {
  if (status === 'EXECUTING') return 'success'
  if (status === 'COMPLETED') return ''
  if (status === 'CANCELLED') return 'danger'
  if (status === 'PENDING') return 'warning'
  return 'info'
}

const getWeatherIcon = (desc?: string) => {
  if (!desc) return 'ep:cloudy'
  const d = desc.toLowerCase()
  if (d.includes('clear') || d.includes('sunny')) return 'ep:sunny'
  if (d.includes('rain') || d.includes('drizzle')) return 'ep:rainy'
  if (d.includes('thunder') || d.includes('storm')) return 'ep:lightning'
  if (d.includes('snow')) return 'ep:snow'
  return 'ep:cloudy'
}

onMounted(() => {
  loadAll()
  loadWeather()
})
</script>
