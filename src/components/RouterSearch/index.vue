<template>
  <ElDialog v-if="isModal" v-model="showSearch" :show-close="false" title="Menu Search">
    <el-select
      filterable
      :reserve-keyword="false"
      remote
      placeholder="Search menu"
      :remote-method="remoteMethod"
      style="width: 100%"
      @change="handleChange"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </ElDialog>
  <div v-else class="custom-hover" @click.stop="showTopSearch = !showTopSearch">
    <Icon icon="ep:search" :color="color"/>
    <el-select
      @click.stop
      filterable
      :reserve-keyword="false"
      remote
      placeholder="Search menu"
      :remote-method="remoteMethod"
      class="overflow-hidden transition-all-600"
      :class="showTopSearch ? '!w-220px ml2' : '!w-0'"
      @change="handleChange"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
defineProps({
  isModal: {
    type: Boolean,
    default: true
  },
  color: propTypes.string.def('')
})

const router = useRouter() // Router object
const showSearch = ref(false) // Whether to show dialog
const showTopSearch = ref(false) // Whether to show top search box
const value: Ref = ref('') // User input value

const routers = router.getRoutes() // Router object
const options = computed(() => {
  // Prompt options
  if (!value.value) {
    return []
  }
  const list = routers.filter((item: any) => {
    if (item.meta.title?.indexOf(value.value) > -1 || item.path.indexOf(value.value) > -1) {
      return true
    }
  })
  return list.map((item) => {
    return {
      label: `${item.meta.title}${item.path}`,
      value: item.path
    }
  })
})

function remoteMethod(data) {
  // Perform the corresponding action here, such as opening the search box
  value.value = data
}

function handleChange(path) {
  router.push({ path })
  hiddenSearch()
  hiddenTopSearch()
}

function hiddenSearch() {
  showSearch.value = false
}

function hiddenTopSearch() {
  showTopSearch.value = false
}

onMounted(() => {
  window.addEventListener('keydown', listenKey)
  window.addEventListener('click', hiddenTopSearch)
})

onUnmounted(() => {
  window.removeEventListener('keydown', listenKey)
  window.removeEventListener('click', hiddenTopSearch)
})

// Listen for Ctrl + K
function listenKey(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    // Prevent triggering the browser default event
    event.preventDefault()
    showSearch.value = !showSearch.value
    // Perform the corresponding action here, such as opening the search box
  }
}

defineExpose({
  openSearch: () => {
    showSearch.value = true
  }
})
</script>
