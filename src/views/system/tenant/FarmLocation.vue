<template>
  <ContentWrap class="h-[calc(100vh-200px)]" :body-style="{ height: '100%', padding: '0' }">
    <div class="relative w-full h-full">
      <!-- Search Box -->
      <input
        id="pac-input"
        class="absolute top-[10px] left-[50%] transform -translate-x-1/2 z-10 w-[300px] p-2 text-sm border border-gray-300 rounded shadow-md focus:outline-none"
        type="text"
        placeholder="Search for your farm location"
      />

      <!-- Map Container -->
      <div ref="mapRef" class="w-full h-full"></div>

      <!-- Save Button -->
      <div class="absolute bottom-[20px] left-[50%] transform -translate-x-1/2 z-10">
        <el-button type="primary" size="large" @click="saveLocation" :loading="loading">
          Save Farm Location
        </el-button>
      </div>

      <!-- Loading Overlay -->
      <div
        v-if="!mapReady"
        class="absolute inset-0 bg-gray-100 flex items-center justify-center z-20"
      >
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-600">Loading Map...</div>
        </div>
      </div>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FarmApi } from '@/api/agri/farm'
import { useMessage } from '@/hooks/web/useMessage'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'FarmLocation' })

const message = useMessage()
const { t } = useI18n()

const mapRef = ref<HTMLElement>()
const mapReady = ref(false)
const loading = ref(false)

const farmLocation = ref({ latitude: 0, longitude: 0 })

let map: google.maps.Map | null = null
let marker: google.maps.Marker | null = null

onMounted(async () => {
  try {
    const data = await FarmApi.getCurrentFarm()
    if (data) {
      farmLocation.value.latitude = data.latitude || 0
      farmLocation.value.longitude = data.longitude || 0
    }
    await loadGoogleMaps()
  } catch (error) {
    console.error(error)
  }
})

const loadGoogleMaps = () => {
  return new Promise<void>((resolve) => {
    if (window.google && window.google.maps) {
      initMap()
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBu3DJQBu-oyNX9TGlwQ4-2ybTXAqjPWaw&libraries=places&callback=initFarmLocationCallback`
    script.async = true
    script.defer = true
    window.initFarmLocationCallback = () => { initMap(); resolve() }
    document.head.appendChild(script)
  })
}

const initMap = () => {
  if (!mapRef.value) return
  const savedLat = farmLocation.value.latitude
  const savedLng = farmLocation.value.longitude
  const hasSavedLocation = savedLat !== 0 && savedLng !== 0

  const center = hasSavedLocation
    ? { lat: savedLat, lng: savedLng }
    : { lat: -37.7870, lng: 175.2793 }

  map = new google.maps.Map(mapRef.value, {
    center,
    zoom: hasSavedLocation ? 15 : 12,
    mapTypeId: 'hybrid',
    streetViewControl: false
  })

  const input = document.getElementById('pac-input') as HTMLInputElement
  const searchBox = new google.maps.places.Autocomplete(input)
  searchBox.bindTo('bounds', map)
  searchBox.addListener('place_changed', () => {
    const place = searchBox.getPlace()
    if (!place.geometry?.location) return
    if (place.geometry.viewport) {
      map?.fitBounds(place.geometry.viewport)
    } else {
      map?.setCenter(place.geometry.location)
      map?.setZoom(17)
    }
    placeMarker(place.geometry.location)
  })

  map.addListener('click', (e: google.maps.MapMouseEvent) => {
    if (e.latLng) placeMarker(e.latLng)
  })

  if (hasSavedLocation) {
    placeMarker(new google.maps.LatLng(savedLat, savedLng))
  }

  mapReady.value = true
}

const placeMarker = (location: google.maps.LatLng) => {
  if (marker) {
    marker.setPosition(location)
  } else {
    marker = new google.maps.Marker({ position: location, map })
  }
  farmLocation.value.latitude = location.lat()
  farmLocation.value.longitude = location.lng()
}

const saveLocation = async () => {
  if (farmLocation.value.latitude === 0 && farmLocation.value.longitude === 0) {
    message.warning('Please select a location on the map')
    return
  }
  loading.value = true
  try {
    await FarmApi.saveCurrentFarm({
      latitude: farmLocation.value.latitude,
      longitude: farmLocation.value.longitude
    })
    message.success('Farm location updated successfully')
  } catch {
    message.error('Failed to update farm location')
  } finally {
    loading.value = false
  }
}

declare global {
  interface Window {
    google: any
    initFarmLocationCallback: () => void
  }
}
</script>
