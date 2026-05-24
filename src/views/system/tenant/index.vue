<template>
  <!-- <doc-alert title="SaaS Multi-Tenant" url="https://doc.iocoder.cn/saas-tenant/" /> -->

  <!-- Search -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
    >
      <el-form-item prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="Enter Tenant Name"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item prop="contactName">
        <el-input
          v-model="queryParams.contactName"
          placeholder="Enter Contact"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item prop="contactMobile">
        <el-input
          v-model="queryParams.contactMobile"
          placeholder="Enter Phone"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Select Status"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="Start Date"
          end-placeholder="End Date"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />
          Search
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />
          Reset
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['system:tenant:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          Add
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['system:tenant:export']"
        >
          <Icon icon="ep:download" class="mr-5px" />
          Export
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="checkedIds.length === 0"
          @click="handleDeleteBatch"
          v-hasPermi="['system:tenant:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" />
          Batch Delete
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- List -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <!-- <el-table-column label="ID" align="center" prop="id" /> -->
      <el-table-column label="Tenant Name" align="center" prop="name" />

      <el-table-column label="Contact" align="center" prop="contactName" />
      <el-table-column label="Phone" align="center" prop="contactMobile" />
      <el-table-column label="Expire Time"
        align="center"
        prop="expireTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="Websites" align="center" prop="websites" width="180">
        <template #default="scope">
          <el-tag v-for="website in scope.row.websites || []" :key="website" class="mr-1 mb-1">
            {{ website }}
          </el-tag>
          <span v-if="!scope.row.websites || scope.row.websites.length === 0">-</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="Create Time"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="Actions" align="center" min-width="110" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['system:tenant:update']"
          >
            Edit
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:tenant:delete']"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Pagination -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- Form dialog: add/update -->
  <TenantForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as TenantApi from '@/api/system/tenant'
import TenantForm from './TenantForm.vue'

defineOptions({ name: 'SystemTenant' })

const message = useMessage() // Message popup
const { t } = useI18n() // Internationalization

const loading = ref(true) // List loading state
const total = ref(0) // Total number of list items
const list = ref([]) // List data
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  contactName: undefined,
  contactMobile: undefined,
  status: undefined,
  createTime: []
})
const queryFormRef = ref() // Search form
const exportLoading = ref(false) // Export loading state

/** Query list */
const getList = async () => {
  loading.value = true
  try {
    const data = await TenantApi.getTenantPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** Search button action */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** Reset button action */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** Add/update action */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** Delete button action */
const handleDelete = async (id: number) => {
  try {
    // Secondary confirmation before deletion
    await message.delConfirm()
    // Start deletion
    await TenantApi.deleteTenant(id)
    message.success(t('common.delSuccess'))
    // Refresh list
    await getList()
  } catch {}
}

/** Batch delete button action */
const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (rows: TenantApi.TenantVO[]) => {
  checkedIds.value = rows.map((row) => row.id)
}

const handleDeleteBatch = async () => {
  try {
    // Secondary confirmation before deletion
    await message.delConfirm()
    // Start batch deletion
    await TenantApi.deleteTenantList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    // Refresh list
    await getList()
  } catch {}
}

/** Export button action */
const handleExport = async () => {
  try {
    // Secondary confirmation before export
    await message.exportConfirm()
    // Start export
    exportLoading.value = true
    const data = await TenantApi.exportTenant(queryParams)
    download.excel(data, 'tenant-list.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** Initialize */
onMounted(async () => {
  await getList()
})
</script>
