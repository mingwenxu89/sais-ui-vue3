<template>
  <!-- <doc-alert title="Feature Permissions" url="https://doc.iocoder.cn/resource-permission" />
  <doc-alert title="Data Permissions" url="https://doc.iocoder.cn/data-permission" /> -->

  <ContentWrap>
    <!-- Search toolbar -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
    >
      <el-form-item prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="Enter Role Name"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-240px"
          clearable
          placeholder="Enter Role Key"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="Select Status">
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
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="End Date"
          start-placeholder="Start Date"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          Search
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          Reset
        </el-button>
        <el-button
          v-hasPermi="['system:role:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          Add
        </el-button>
        <el-button
          v-hasPermi="['system:role:export']"
          :loading="exportLoading"
          plain
          type="success"
          @click="handleExport"
        >
          <Icon class="mr-5px" icon="ep:download" />
          Export
        </el-button>
        <el-button
          v-hasPermi="['system:role:delete']"
          :disabled="checkedIds.length === 0"
          plain
          type="danger"
          @click="handleDeleteBatch"
        >
          <Icon class="mr-5px" icon="ep:delete" />
          Batch Delete
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- List -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="Role Name" align="center" prop="name" />
      <el-table-column label="Type" align="center" prop="type">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_ROLE_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="Role Key" align="center" prop="code" />
      <el-table-column label="Sort" align="center" prop="sort" />
      <el-table-column label="Remark" align="center" prop="remark" />
      <el-table-column label="Status" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="Create Time"
        :formatter="dateFormatter"
        align="center"
        prop="createTime"
        width="180"
      />
      <el-table-column label="Actions" :width="300" align="center">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:role:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            Edit
          </el-button>
          <el-button
            v-hasPermi="['system:permission:assign-role-menu']"
            link
            preIcon="ep:basketball"
            title="Menu Permissions"
            type="primary"
            @click="openAssignMenuForm(scope.row)"
          >
            Menu Permissions
          </el-button>
          <el-button
            v-hasPermi="['system:permission:assign-role-data-scope']"
            link
            preIcon="ep:coin"
            title="Data Permission"
            type="primary"
            @click="openDataPermissionForm(scope.row)"
          >
            Data Permission
          </el-button>
          <el-button
            v-hasPermi="['system:role:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Pagination -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- Form dialog: add/update -->
  <RoleForm ref="formRef" @success="getList" />
  <!-- Form dialog: menu permissions -->
  <RoleAssignMenuForm ref="assignMenuFormRef" @success="getList" />
  <!-- Form dialog: data permissions -->
  <RoleDataPermissionForm ref="dataPermissionFormRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as RoleApi from '@/api/system/role'
import RoleForm from './RoleForm.vue'
import RoleAssignMenuForm from './RoleAssignMenuForm.vue'
import RoleDataPermissionForm from './RoleDataPermissionForm.vue'

defineOptions({ name: 'SystemRole' })

const message = useMessage() // Message popup
const { t } = useI18n() // Internationalization

const loading = ref(true) // List loading state
const total = ref(0) // Total number of list items
const list = ref([]) // List data
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  code: '',
  name: '',
  status: undefined,
  createTime: []
})
const queryFormRef = ref() // Search form
const exportLoading = ref(false) // Export loading state

/** Query role list */
const getList = async () => {
  loading.value = true
  try {
    const data = await RoleApi.getRolePage(queryParams)
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

/** Data permission action */
const dataPermissionFormRef = ref()
const openDataPermissionForm = async (row: RoleApi.RoleVO) => {
  dataPermissionFormRef.value.open(row)
}

/** Menu permission action */
const assignMenuFormRef = ref()
const openAssignMenuForm = async (row: RoleApi.RoleVO) => {
  assignMenuFormRef.value.open(row)
}

/** Delete button action */
const handleDelete = async (id: number) => {
  try {
    // Secondary confirmation before deletion
    await message.delConfirm()
    // Start deletion
    await RoleApi.deleteRole(id)
    message.success(t('common.delSuccess'))
    // Refresh list
    await getList()
  } catch {}
}

/** Batch delete button action */
const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (rows: RoleApi.RoleVO[]) => {
  checkedIds.value = rows.map((row) => row.id)
}

const handleDeleteBatch = async () => {
  try {
    // Secondary confirmation before deletion
    await message.delConfirm()
    // Start batch deletion
    await RoleApi.deleteRoleList(checkedIds.value)
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
    const data = await RoleApi.exportRole(queryParams)
    download.excel(data, 'Role Data.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** Initialize */
onMounted(() => {
  getList()
})
</script>
