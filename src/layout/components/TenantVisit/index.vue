<template>
  <div>
    <el-select
      filterable
      placeholder="Select tenant"
      class="!w-180px"
      v-model="value"
      @change="handleChange"
      clearable
    >
      <el-option v-for="item in tenants" :key="item.id" :label="item.name" :value="item.id" />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import * as TenantApi from '@/api/system/tenant'
import { getVisitTenantId, setVisitTenantId } from '@/utils/auth'
import { useMessage } from '@/hooks/web/useMessage'
import { useTagsView } from '@/hooks/web/useTagsView'

const message = useMessage() // Message popup
const tagsView = useTagsView() // Tag view actions

const value = ref(getVisitTenantId()) // Currently selected tenant ID
const tenants = ref<any[]>([]) // Tenant list

const handleChange = (id: number) => {
  // Set visit tenant ID
  setVisitTenantId(id)
  // Close other tabs and keep only the current page
  tagsView.closeOther()
  // Refresh current page
  tagsView.refreshPage()
  // Show success message
  const tenant = tenants.value.find((item) => item.id === id)
  if (tenant) {
    message.success(`Current tenant switched to: ${tenant.name}`)
  }
}

onMounted(async () => {
  tenants.value = await TenantApi.getTenantList()
})
</script>
