<template>
  <ContentWrap class="h-[calc(100vh-120px)]" :body-style="{ height: '100%', padding: '10px' }">
    <div class="flex flex-1 h-full gap-4">
      <!-- Left Panel: Field List -->
      <div class="w-[280px] min-w-[280px] bg-white border border-gray-200 rounded-lg flex flex-col">
        <!-- Header with Search -->
        <div class="p-4 border-b border-gray-200">
          <div class="text-lg font-bold mb-3">Fields</div>
          <el-input
            v-model="searchKeyword"
            placeholder="Search field name..."
            clearable
            @input="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <Icon icon="ep:search" />
            </template>
          </el-input>
        </div>

        <!-- Scrollable Field List -->
        <div class="flex-1 overflow-y-auto p-1 flex flex-col gap-[3px]">
          <div
            v-for="field in filteredFields"
            :key="field.id"
            class="p-4 rounded bg-gray-50 cursor-pointer transition-colors hover:bg-gray-100"
            :class="{ '!bg-blue-50 border-l-4 border-l-blue-500': selectedFieldId === field.id }"
            @click="selectField(field)"
          >
            <div class="flex items-center justify-between">
              <div class="font-medium text-gray-800">{{ field.fieldName }}</div>
            </div>
            <div class="text-sm text-gray-500 mt-1 flex items-center justify-between gap-2">
              <span>{{ field.area ? field.area + ' acres' : 'No area' }}</span>
              <span
                v-if="getFieldCurrentCrop(field.id)"
                class="inline-flex items-center min-w-0 max-w-[130px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium"
                :title="getFieldCurrentCrop(field.id)?.cropName"
              >
                <span class="truncate">{{ getFieldCurrentCrop(field.id)?.cropName }}</span>
              </span>
              <span v-else class="text-xs text-gray-300">No crop</span>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="filteredFields.length === 0 && !loading"
            class="p-8 text-center text-gray-400"
          >
            <Icon icon="ep:document" class="text-4xl mb-2" />
            <div>No fields found</div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="p-8 text-center">
            <el-icon class="is-loading text-2xl text-gray-400">
              <Loading />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- Right Panel: Map + Overview -->
      <div class="flex-1 relative h-full bg-gray-100 rounded-lg overflow-hidden">
          <!-- Map Toolbar -->
          <div class="absolute top-3 right-3 z-10 flex gap-2">
            <el-button type="primary" @click="addNewField">
              <Icon icon="ep:plus" class="mr-1" /> Add Field
            </el-button>
            <el-button
              type="danger"
              :disabled="!selectedFieldId"
              @click="removeField"
            >
              <Icon icon="ep:delete" class="mr-1" /> Remove Field
            </el-button>
          </div>

          <!-- Address Search -->
          <input
            v-if="!isDrawingMode"
            id="field-address-search"
            type="text"
            placeholder="Search address..."
            class="absolute top-3 left-3 z-10 w-64 px-3 py-1.5 text-sm border border-gray-300 rounded shadow-md bg-white focus:outline-none focus:border-blue-400"
          />

          <!-- Drawing Mode Hint -->
          <div
            v-if="isDrawingMode"
            class="absolute top-3 left-3 z-10 bg-blue-600 text-white px-4 py-2 rounded shadow-md flex items-center gap-2"
          >
            <Icon icon="ep:edit" />
            <span>Click on the map to draw field boundary</span>
            <el-button size="small" text bg class="text-white" @click="cancelDrawing">Cancel</el-button>
          </div>

          <!-- Map Container -->
          <div ref="mapRef" class="absolute inset-0"></div>

          <!-- Loading Overlay -->
          <div
            v-if="!mapReady"
            class="absolute inset-0 bg-gray-100 flex items-center justify-center z-20"
          >
            <div class="text-center">
              <el-icon class="is-loading text-3xl text-gray-400 mb-2">
                <Loading />
              </el-icon>
              <div class="text-gray-500">Loading Google Maps...</div>
            </div>
          </div>

          <!-- Field Overview Panel (overlays bottom of map) -->
          <Transition name="slide-up">
            <div
              v-if="overviewVisible"
              class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 max-h-[400px] flex flex-col"
            >
            <!-- Panel Header -->
            <div class="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-700">{{ selectedField?.fieldName }}</span>
                <span class="text-xs text-gray-400">{{ selectedField?.area }} acres</span>
                <span v-if="currentCropPlan" class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  🌾 {{ currentCropPlan.cropName }}
                  <span class="text-green-500 font-normal ml-1">{{ currentCropPlan.startDate }} ~ {{ currentCropPlan.endDate }}</span>
                </span>
                <el-button
                  v-if="!currentCropPlan"
                  size="small"
                  type="primary"
                  plain
                  @click="openCropPlanForm"
                >
                  <Icon icon="ep:plus" class="mr-1" />Set Crop Plan
                </el-button>
              </div>
              <div class="flex items-center gap-2">
                <el-button size="small" circle text @click="refreshOverview" :loading="overviewLoading">
                  <Icon icon="ep:refresh" />
                </el-button>
                <el-button size="small" circle text @click="openEditDialog">
                  <Icon icon="ep:edit" />
                </el-button>
                <el-button size="small" circle text @click="overviewVisible = false">
                  <Icon icon="ep:close" />
                </el-button>
              </div>
            </div>

            <!-- Panel Content -->
            <div class="flex flex-col flex-1 overflow-hidden">
              <!-- Irrigation Devices Section -->
              <div class="flex flex-col flex-1 overflow-hidden">
                <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 flex items-center justify-between gap-1 flex-shrink-0">
                  <div class="flex items-center gap-1">
                    <Icon icon="ep:water-cup" class="text-sm" />
                    Irrigation Devices
                  </div>
                  <div class="flex items-center gap-1">
                    <el-button size="small" type="primary" text @click="openAddSensorForm">
                      <Icon icon="ep:plus" />Sensor
                    </el-button>
                    <el-button size="small" type="primary" text @click="openAddDeviceForm">
                      <Icon icon="ep:plus" />Device
                    </el-button>
                  </div>
                </div>
                <div class="overflow-y-auto px-3 py-3">
                  <div v-if="overviewLoading" class="flex items-center justify-center py-6 text-gray-400">
                    <el-icon class="is-loading mr-2"><Loading /></el-icon> Loading...
                  </div>
                  <div v-else-if="fieldIrrigationDevices.length === 0" class="flex flex-col items-center justify-center py-6 text-gray-300">
                    <Icon icon="ep:water-cup" class="text-3xl mb-1" />
                    <span class="text-xs">No devices</span>
                  </div>
                  <div v-else class="grid grid-cols-4 gap-3">
                    <div
                      v-for="device in fieldIrrigationDevices"
                      :key="device.id"
                      class="flex flex-col p-2.5 rounded-lg transition-colors"
                      :class="device.isWatering ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 hover:bg-gray-100'"
                    >
                      <!-- Icon + Code + Start/Stop in top-right -->
                      <div class="relative flex items-center gap-2 mb-1.5">
                        <div class="relative flex-shrink-0 w-7 h-7 flex items-center justify-center">
                          <template v-if="device.isWatering">
                            <span class="watering-ring ring-1"></span>
                            <span class="watering-ring ring-2"></span>
                          </template>
                          <div
                            class="w-7 h-7 rounded-full flex items-center justify-center text-base z-10"
                            :class="device.isWatering ? 'bg-blue-500' : (device.status === 1 ? 'bg-gray-200' : 'bg-red-100')"
                          >
                            💧
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-xs font-medium text-gray-700 truncate" :title="device.deviceCode">{{ device.deviceCode }}</div>
                          <span v-if="device.isWatering" class="text-xs text-blue-600 font-semibold animate-pulse">Watering</span>
                          <span v-else class="text-xs" :class="device.status === 1 ? 'text-green-500' : 'text-gray-400'">
                            {{ device.status === 1 ? 'Online' : 'Offline' }}
                          </span>
                        </div>
                        <!-- Start/Stop at top-right -->
                        <div class="flex-shrink-0" @click.stop>
                          <el-button
                            v-if="!device.isWatering"
                            size="small"
                            type="primary"
                            :disabled="device.status !== 1"
                            :loading="wateringLoading[device.id!]"
                            @click="startWatering(device)"
                          >Start</el-button>
                          <el-button
                            v-else
                            size="small"
                            type="danger"
                            :loading="wateringLoading[device.id!]"
                            @click="stopWatering(device)"
                          >Stop</el-button>
                        </div>
                      </div>
                      <!-- Sensor Reading -->
                      <div v-if="device.sensorId && latestSensorData[device.sensorId]" class="text-xs text-green-600 mb-1.5 truncate">
                        🌱 {{ latestSensorData[device.sensorId].value }}% · {{ device.sensorCode }}
                      </div>
                      <div v-else-if="device.sensorId" class="text-xs text-gray-300 mb-1.5">🌱 No data</div>
                      <!-- Flow Rate -->
                      <div v-if="device.flowRate" class="text-xs text-gray-400 mb-1.5">{{ device.flowRate }} L/min</div>
                      <!-- Edit / Delete -->
                      <div class="flex justify-end gap-1 mt-1.5 pt-1.5 border-t border-gray-100" @click.stop>
                        <el-button link type="primary" size="small"
                          @click="irrigationDeviceFormRef.open('update', device.id)"
                          v-hasPermi="['agri:irrigation-device:update']"
                        >Edit</el-button>
                        <el-button link type="danger" size="small"
                          @click="handleDeviceDelete(device.id!)"
                          v-hasPermi="['agri:irrigation-device:delete']"
                        >Delete</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Crop Plan Form Dialog -->
    <CropPlanForm ref="cropPlanFormRef" @success="onCropPlanSuccess" />

    <!-- Irrigation Device Form Dialog -->
    <IrrigationDeviceForm ref="irrigationDeviceFormRef" @success="onDeviceSuccess" />

    <!-- Sensor Form Dialog -->
    <SensorForm ref="sensorFormRef" @success="onSensorSuccess" />

    <!-- Field Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit Field' : 'Field Information'"
      width="500px"
      append-to-body
      @closed="handleDialogClosed"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
        <el-form-item label="Area (acres)">
          <el-input :model-value="formData.area ? formData.area + ' acres' : 'N/A'" disabled />
        </el-form-item>
        <el-form-item label="Longitude">
          <el-input :model-value="formData.longitude ?? 'N/A'" disabled />
        </el-form-item>
        <el-form-item label="Latitude">
          <el-input :model-value="formData.latitude ?? 'N/A'" disabled />
        </el-form-item>
        <el-divider />
        <el-form-item label="Field Name" prop="fieldName">
          <el-input
            ref="fieldNameInputRef"
            v-model="formData.fieldName"
            placeholder="Enter field name"
          />
        </el-form-item>
        <el-form-item label="Boundary">
          <el-input :value="formData.boundary ? formData.boundary.split(';').length + ' points' : 'N/A'" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogCancel">Cancel</el-button>
        <el-button type="primary" @click="submitForm" :loading="formLoading">Save</el-button>
      </template>
    </el-dialog>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { FieldApi, FieldVO } from '@/api/agri/field'
import { FarmApi } from '@/api/agri/farm'
import { CropPlanApi, CropPlanVO } from '@/api/agri/cropPlan'
import { SensorApi } from '@/api/agri/sensor'
import { IrrigationDeviceApi, IrrigationDeviceVO } from '@/api/agri/irrigationDevice'
import { Loading } from '@element-plus/icons-vue'
import CropPlanForm from '@/views/agri/cropPlan/CropPlanForm.vue'
import IrrigationDeviceForm from '@/views/agri/irrigationDevice/IrrigationDeviceForm.vue'
import SensorForm from '@/views/agri/sensor/SensorForm.vue'

defineOptions({ name: 'AgriField' })

const message = useMessage()
const { t } = useI18n()

// --- State ---
const loading = ref(false)
const mapReady = ref(false)
const mapRef = ref<HTMLElement>()
const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref()
const fieldNameInputRef = ref()
const cropPlanFormRef = ref()
const irrigationDeviceFormRef = ref()
const sensorFormRef = ref()
const isDrawingMode = ref(false)
const farmLocation = ref({ latitude: 0, longitude: 0 })

const fields = ref<FieldVO[]>([])
const selectedFieldId = ref<number | null>(null)
const selectedField = ref<FieldVO | null>(null)
const currentCropPlan = ref<CropPlanVO | null>(null)
const fieldCurrentCropPlans = ref<Record<number, CropPlanVO | null>>({})
const searchKeyword = ref('')

// Overview panel state
const overviewVisible = ref(false)
const overviewLoading = ref(false)
const fieldIrrigationDevices = ref<IrrigationDeviceVO[]>([])
const latestSensorData = ref<Record<number, any>>({})
const wateringLoading = ref<Record<number, boolean>>({})

let refreshTimer: ReturnType<typeof setInterval> | null = null

const formData = ref<FieldVO>({
  id: undefined,
  fieldName: '',
  area: undefined,
  longitude: undefined,
  latitude: undefined,
  boundary: undefined
})

const isEdit = computed(() => !!formData.value.id)

const formRules = reactive({
  fieldName: [{ required: true, message: 'Field Name is required', trigger: 'blur' }]
})

const filteredFields = computed(() => {
  if (!searchKeyword.value) return fields.value
  const kw = searchKeyword.value.toLowerCase()
  return fields.value.filter(f => f.fieldName?.toLowerCase().includes(kw))
})

const getFieldCurrentCrop = (fieldId?: number) => {
  if (!fieldId) return null
  return fieldCurrentCropPlans.value[fieldId] ?? null
}

const formatRelativeTime = (dt?: string) => {
  if (!dt) return ''
  const now = new Date().getTime()
  const past = new Date(dt).getTime()
  const diff = Math.floor((now - past) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// --- Overview panel ---
const loadOverview = async (fieldId: number) => {
  overviewLoading.value = true
  try {
    const [devicesResult, latestResult] = await Promise.all([
      IrrigationDeviceApi.getIrrigationDevicePage({ fieldId, pageNo: 1, pageSize: 100 }),
      SensorApi.getLatestSensorDataByField(fieldId)
    ])
    fieldIrrigationDevices.value = devicesResult.list ?? []
    latestSensorData.value = latestResult ?? {}
    // Update map polygon color based on watering status
    updatePolygonWateringState(fieldId)
  } catch (e) {
    console.error('Failed to load field overview', e)
  } finally {
    overviewLoading.value = false
  }
}

const refreshOverview = async () => {
  if (selectedFieldId.value) {
    await loadOverview(selectedFieldId.value)
  }
}

const updatePolygonWateringState = (fieldId: number) => {
  const polygon = fieldPolygons.get(fieldId)
  if (!polygon) return
  const anyWatering = fieldIrrigationDevices.value.some(d => d.isWatering)
  if (anyWatering) {
    polygon.setOptions({ fillColor: '#3B82F6', fillOpacity: 0.35, strokeColor: '#1D4ED8' })
  } else {
    polygon.setOptions({ fillColor: '#FF0000', fillOpacity: 0.35, strokeColor: '#CC0000' })
  }
}

// --- Watering controls ---
const startWatering = async (device: IrrigationDeviceVO) => {
  if (!device.id) return
  wateringLoading.value[device.id] = true
  try {
    await IrrigationDeviceApi.startWatering(device.id)
    device.isWatering = true
    updatePolygonWateringState(selectedFieldId.value!)
    message.success(`${device.deviceCode} started watering`)
  } catch {
    message.error('Failed to start watering')
  } finally {
    wateringLoading.value[device.id] = false
  }
}

const stopWatering = async (device: IrrigationDeviceVO) => {
  if (!device.id) return
  wateringLoading.value[device.id] = true
  try {
    await IrrigationDeviceApi.stopWatering(device.id)
    device.isWatering = false
    updatePolygonWateringState(selectedFieldId.value!)
    message.success(`${device.deviceCode} stopped watering`)
  } catch {
    message.error('Failed to stop watering')
  } finally {
    wateringLoading.value[device.id] = false
  }
}

// --- Google Maps ---
let map: google.maps.Map | null = null
let drawingManager: google.maps.drawing.DrawingManager | null = null
let fieldPolygons: Map<number, google.maps.Polygon> = new Map()
let fieldLabels: Map<number, google.maps.Marker> = new Map()
let selectedPolygon: google.maps.Polygon | null = null
onMounted(async () => {
  await loadFields()
  await syncFarmLocation()  // resolve coordinates before map init
  await loadGoogleMaps()    // initMap uses farmLocation as center + places marker
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})

const loadFields = async () => {
  loading.value = true
  try {
    const data = await FieldApi.getFieldPage({ pageNo: 1, pageSize: 100 })
    fields.value = data.list
    await loadFieldCurrentCropPlans(fields.value)
  } catch (e) {
    console.error('Failed to load fields', e)
  } finally {
    loading.value = false
  }
}

const loadFieldCurrentCropPlans = async (fieldList: FieldVO[]) => {
  const entries = await Promise.all(
    fieldList
      .filter((field) => field.id)
      .map(async (field) => [
        field.id!,
        await CropPlanApi.getCurrentCropPlan(field.id!).catch(() => null)
      ] as const)
  )
  fieldCurrentCropPlans.value = Object.fromEntries(entries)
}

const loadGoogleMaps = () => {
  return new Promise<void>((resolve) => {
    if (window.google && window.google.maps) {
      nextTick(() => { initMap(); resolve() })
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBu3DJQBu-oyNX9TGlwQ4-2ybTXAqjPWaw&libraries=places,drawing,geometry&callback=initMapCallback`
    script.async = true
    script.defer = true
    window.initMapCallback = () => { initMap(); resolve() }
    document.head.appendChild(script)
  })
}

const initMap = () => {
  if (!mapRef.value) return

  const defaultCenter = farmLocation.value.latitude !== 0
    ? { lat: farmLocation.value.latitude, lng: farmLocation.value.longitude }
    : { lat: -37.7870, lng: 175.2793 }

  map = new google.maps.Map(mapRef.value, {
    center: defaultCenter,
    zoom: 15,
    mapTypeId: 'hybrid',
    streetViewControl: false,
    mapTypeControl: false
  })


  // Address search box - use nextTick to ensure the v-if element is in the DOM
  nextTick(() => {
    const input = document.getElementById('field-address-search') as HTMLInputElement | null
    if (!input) return
    const autocomplete = new google.maps.places.Autocomplete(input)
    autocomplete.bindTo('bounds', map)
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return
      if (place.geometry.viewport) {
        map!.fitBounds(place.geometry.viewport)
      } else {
        map!.setCenter(place.geometry.location)
        map!.setZoom(17)
      }
    })
  })

  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: null,
    drawingControl: false,
    polygonOptions: {
      fillColor: '#FFEB3B',
      fillOpacity: 0.4,
      strokeWeight: 4,
      strokeColor: '#F9A825',
      editable: true,
      draggable: true
    }
  })
  drawingManager.setMap(map)

  google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
    if (event.type === google.maps.drawing.OverlayType.POLYGON) {
      isDrawingMode.value = false
      drawingManager?.setDrawingMode(null)

      if (selectedPolygon) selectedPolygon.setMap(null)
      selectedPolygon = event.overlay

      formData.value.boundary = selectedPolygon!.getPath().getArray().map(p => `${p.lat()},${p.lng()}`).join(';')
      updateAreaAndCenter(selectedPolygon!)

      google.maps.event.addListener(selectedPolygon!.getPath(), 'set_at', () => {
        formData.value.boundary = selectedPolygon!.getPath().getArray().map(p => `${p.lat()},${p.lng()}`).join(';')
        updateAreaAndCenter(selectedPolygon!)
      })
      google.maps.event.addListener(selectedPolygon!.getPath(), 'insert_at', () => {
        formData.value.boundary = selectedPolygon!.getPath().getArray().map(p => `${p.lat()},${p.lng()}`).join(';')
        updateAreaAndCenter(selectedPolygon!)
      })

      dialogVisible.value = true
      nextTick(() => {
        fieldNameInputRef.value?.focus()
      })
    }
  })

  drawAllFields()
  fitBoundsToFields()
  mapReady.value = true
}


const syncFarmLocation = async () => {
  try {
    const farm = await FarmApi.getCurrentFarm()
    if (farm?.latitude && farm.latitude !== 0) {
      farmLocation.value = { latitude: farm.latitude, longitude: farm.longitude }
    } else if (fields.value.length > 0) {
      // Auto-init: use the last modified field's center
      const lastModified = [...fields.value].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
      if (lastModified?.latitude && lastModified?.longitude) {
        await FarmApi.saveCurrentFarm({ latitude: lastModified.latitude, longitude: lastModified.longitude })
        farmLocation.value = { latitude: lastModified.latitude, longitude: lastModified.longitude }
      }
    }
  } catch (e) {
    console.error('Failed to sync farm location', e)
  }
}

const fitBoundsToFields = () => {
  if (!map || fields.value.length === 0) return
  const bounds = new google.maps.LatLngBounds()
  let hasPoints = false
  fields.value.forEach(field => {
    if (!field.boundary) return
    try {
      field.boundary.split(';').forEach(pair => {
        const [lat, lng] = pair.split(',').map(Number)
        if (!isNaN(lat) && !isNaN(lng)) { bounds.extend({ lat, lng }); hasPoints = true }
      })
    } catch {}
  })
  if (hasPoints) map!.fitBounds(bounds)
}

const updateAreaAndCenter = (polygon: google.maps.Polygon) => {
  const areaSqMeters = google.maps.geometry.spherical.computeArea(polygon.getPath())
  formData.value.area = parseFloat((areaSqMeters * 0.000247105).toFixed(2))
  const bounds = new google.maps.LatLngBounds()
  polygon.getPath().forEach(p => bounds.extend(p))
  const c = bounds.getCenter()
  formData.value.latitude = parseFloat(c.lat().toFixed(6))
  formData.value.longitude = parseFloat(c.lng().toFixed(6))
}

const drawAllFields = () => {
  if (!map) return
  fieldPolygons.forEach(p => p.setMap(null))
  fieldPolygons.clear()
  fieldLabels.forEach(m => m.setMap(null))
  fieldLabels.clear()

  fields.value.forEach(field => {
    if (field.boundary) {
      try {
        const points = field.boundary.split(';').map(pair => {
          const [lat, lng] = pair.split(',').map(Number)
          return { lat, lng }
        })
        if (points.length < 3) return

        const isSelected = selectedFieldId.value === field.id
        const polygon = new google.maps.Polygon({
          paths: points,
          fillColor: isSelected ? '#FF0000' : '#FFEB3B',
          fillOpacity: isSelected ? 0.35 : 0.3,
          strokeWeight: isSelected ? 5 : 3,
          strokeColor: isSelected ? '#CC0000' : '#F9A825',
          map
        })

        polygon.addListener('click', () => selectField(field))

        const bounds = new google.maps.LatLngBounds()
        points.forEach(p => bounds.extend(p))
        const centroid = bounds.getCenter()

        const label = new google.maps.Marker({
          position: centroid,
          map,
          title: field.fieldName,
          label: {
            text: field.fieldName ?? '',
            color: isSelected ? '#CC0000' : '#333333',
            fontSize: isSelected ? '14px' : '12px',
            fontWeight: 'bold'
          }
        })

        if (isSelected) {
          map!.panTo(centroid)
        }

        fieldPolygons.set(field.id!, polygon)
        fieldLabels.set(field.id!, label)
      } catch (e) {
        console.warn('Failed to draw field', field.id, e)
      }
    }
  })
  // Re-apply watering state after redraw
  if (selectedFieldId.value) {
    updatePolygonWateringState(selectedFieldId.value)
  }
}

// --- Actions ---
const handleSearch = () => {}

const selectField = async (field: FieldVO) => {
  selectedFieldId.value = field.id ?? null
  selectedField.value = field
  formData.value = { ...field }
  currentCropPlan.value = null
  if (field.id) {
    currentCropPlan.value = await CropPlanApi.getCurrentCropPlan(field.id).catch(() => null)
    fieldCurrentCropPlans.value[field.id] = currentCropPlan.value
  }
  drawAllFields()
  overviewVisible.value = true
  loadOverview(field.id!)
  // Auto-refresh every 30s while panel is open
  if (refreshTimer) clearInterval(refreshTimer)
  refreshTimer = setInterval(() => {
    if (selectedFieldId.value) loadOverview(selectedFieldId.value)
  }, 30000)
}

const openEditDialog = () => {
  dialogVisible.value = true
}

const openCropPlanForm = () => {
  cropPlanFormRef.value.open('create', undefined, selectedFieldId.value)
}

const onCropPlanSuccess = async () => {
  if (selectedFieldId.value) {
    currentCropPlan.value = await CropPlanApi.getCurrentCropPlan(selectedFieldId.value).catch(() => null)
    fieldCurrentCropPlans.value[selectedFieldId.value] = currentCropPlan.value
  }
}

const openAddDeviceForm = () => {
  irrigationDeviceFormRef.value.open('create', undefined, selectedFieldId.value)
}

const openAddSensorForm = () => {
  sensorFormRef.value.open('create', undefined, selectedFieldId.value)
}

const onSensorSuccess = () => {
  if (selectedFieldId.value) loadOverview(selectedFieldId.value)
}

const onDeviceSuccess = () => {
  if (selectedFieldId.value) loadOverview(selectedFieldId.value)
}

const handleDeviceDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await IrrigationDeviceApi.deleteIrrigationDevice(id)
    message.success(t('common.delSuccess'))
    await loadOverview(selectedFieldId.value!)
  } catch {}
}

const addNewField = () => {
  if (selectedPolygon) {
    selectedPolygon.setMap(null)
    selectedPolygon = null
  }
  formData.value = {
    id: undefined,
    fieldName: '',
    area: undefined,
    longitude: undefined,
    latitude: undefined,
    growStatus: 'UNSTARTED',
    boundary: undefined
  }
  isDrawingMode.value = true
  if (drawingManager) {
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON)
  }
}

const removeField = async () => {
  if (!selectedFieldId.value) return
  try {
    await message.delConfirm()
    await FieldApi.deleteField(selectedFieldId.value)
    message.success(t('common.delSuccess'))
    selectedFieldId.value = null
    selectedField.value = null
    overviewVisible.value = false
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
    if (selectedPolygon) {
      selectedPolygon.setMap(null)
      selectedPolygon = null
    }
    await loadFields()
    drawAllFields()
    // Update farm location to last created remaining field
    if (fields.value.length > 0) {
      const lastCreated = [...fields.value].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
      if (lastCreated?.latitude && lastCreated?.longitude) {
        await FarmApi.saveCurrentFarm({ latitude: lastCreated.latitude, longitude: lastCreated.longitude })
        farmLocation.value = { latitude: lastCreated.latitude, longitude: lastCreated.longitude }
      }
    }
  } catch {}
}

const cancelDrawing = () => {
  isDrawingMode.value = false
  drawingManager?.setDrawingMode(null)
  if (selectedPolygon) {
    selectedPolygon.setMap(null)
    selectedPolygon = null
  }
}

const handleDialogCancel = () => {
  dialogVisible.value = false
  if (!isEdit.value && selectedPolygon) {
    selectedPolygon.setMap(null)
    selectedPolygon = null
  }
}

const handleDialogClosed = () => {
  if (!isEdit.value && selectedPolygon) {
    selectedPolygon.setMap(null)
    selectedPolygon = null
  }
}

const submitForm = async () => {
  const form = formRef.value
  if (!form) return
  await form.validate()

  formLoading.value = true
  try {
    if (isEdit.value) {
      await FieldApi.updateField(formData.value)
      message.success(t('common.updateSuccess'))
      // update selectedField display name
      if (selectedField.value) {
        selectedField.value.fieldName = formData.value.fieldName
      }
    } else {
      await FieldApi.createField(formData.value)
      message.success(t('common.createSuccess'))
      if (formData.value.latitude && formData.value.longitude) {
        await FarmApi.saveCurrentFarm({ latitude: formData.value.latitude, longitude: formData.value.longitude })
        farmLocation.value = { latitude: formData.value.latitude, longitude: formData.value.longitude }
      }
    }
    dialogVisible.value = false
    if (selectedPolygon) {
      selectedPolygon.setMap(null)
      selectedPolygon = null
    }
    await loadFields()
    drawAllFields()
  } catch {
  } finally {
    formLoading.value = false
  }
}

// --- Google Maps Types ---
declare global {
  interface Window {
    google: any
    initMapCallback: () => void
  }
}
</script>

<style scoped>
/* Watering pulse animation */
.watering-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid #3B82F6;
  opacity: 0;
  animation: watering-pulse 2s ease-out infinite;
}
.watering-ring.ring-1 { width: 36px; height: 36px; animation-delay: 0s; }
.watering-ring.ring-2 { width: 52px; height: 52px; animation-delay: 0.5s; }
.watering-ring.ring-3 { width: 68px; height: 68px; animation-delay: 1s; }

@keyframes watering-pulse {
  0%   { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(1.2); opacity: 0; }
}

/* Slide-up transition for overview panel */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
