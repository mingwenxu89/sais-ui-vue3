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
          placeholder="Enter Package Name"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item prop="status">
        <el-select v-model="queryParams.status" placeholder="Select Status" clearable class="!w-240px">
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
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="Start Date"
          end-placeholder="End Date"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['system:tenant-package:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          Add
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="checkedIds.length === 0"
          @click="handleDeleteBatch"
          v-hasPermi="['system:tenant-package:delete']"
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
      <el-table-column label="ID" align="center" prop="id" width="120" />
      <el-table-column label="Package Name" align="center" prop="name" />
      <el-table-column label="Status" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="Remark" align="center" prop="remark" />
      <el-table-column label="Create Time"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['system:tenant-package:update']"
          >
            Edit
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:tenant-package:delete']"
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
  <TenantPackageForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as TenantPackageApi from '@/api/system/tenantPackage'
import TenantPackageForm from './TenantPackageForm.vue'

defineOptions({ name: 'SystemTenantPackage' })

const message = useMessage() // Message popup
const { t } = useI18n() // Internationalization

const loading = ref(true) // List loading state
const total = ref(0) // Total number of list items
const list = ref([]) // List data
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined,
  remark: undefined,
  createTime: []
})
const queryFormRef = ref() // Search form

/** Query list */
const getList = async () => {
  loading.value = true
  try {
    const data = await TenantPackageApi.getTenantPackagePage(queryParams)
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
  queryFormRef.value?.resetFields()
  getList()
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
    await TenantPackageApi.deleteTenantPackage(id)
    message.success(t('common.delSuccess'))
    // Refresh list
    await getList()
  } catch {}
}

/** Batch delete button action */
const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (rows: TenantPackageApi.TenantPackageVO[]) => {
  checkedIds.value = rows.map((row) => row.id)
}

const handleDeleteBatch = async () => {
  try {
    // Secondary confirmation before deletion
    await message.delConfirm()
    // Start batch deletion
    await TenantPackageApi.deleteTenantPackageList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    // Refresh list
    await getList()
  } catch {}
}

/** Initialize */
onMounted(() => {
  getList()
})
</script>
