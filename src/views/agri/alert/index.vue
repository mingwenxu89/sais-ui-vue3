<template>
  <ContentWrap>
    <!-- Search toolbar -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="90px">
      <el-form-item label="Alert Type" prop="alertType">
        <el-select v-model="queryParams.alertType" placeholder="All types" clearable class="!w-200px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_ALERT_TYPE)"
            :key="dict.value" :label="dict.label" :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Alert Level" prop="level">
        <el-select v-model="queryParams.level" placeholder="All levels" clearable class="!w-200px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_ALERT_LEVEL)"
            :key="dict.value" :label="dict.label" :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select v-model="queryParams.status" placeholder="All statuses" clearable class="!w-200px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_ALERT_STATUS)"
            :key="dict.value" :label="dict.label" :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['agri:alert:create']">
          <Icon icon="ep:plus" class="mr-5px" /> Add
        </el-button>
        <el-button type="success" plain @click="handleExport" :loading="exportLoading"
          v-hasPermi="['agri:alert:export']">
          <Icon icon="ep:download" class="mr-5px" /> Export
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- List -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">

      <el-table-column label="Alert Type" align="center" prop="alertType" width="160">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.AGRI_ALERT_TYPE, scope.row.alertType) }}
        </template>
      </el-table-column>

      <el-table-column label="Alert Level" align="center" prop="level" width="120">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.AGRI_ALERT_LEVEL, scope.row.level) }}
        </template>
      </el-table-column>

      <el-table-column label="Field" align="center" prop="fieldName" width="140">
        <template #default="scope">
          <span>{{ scope.row.fieldName ?? '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Status" align="center" prop="status" width="120">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.AGRI_ALERT_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>

      <el-table-column label="Description" align="left" prop="context" min-width="200" show-overflow-tooltip />

      <el-table-column label="Created At" align="center" prop="createTime"
        :formatter="dateFormatter" width="180" />

      <el-table-column label="Actions" align="center" width="210" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openStatusDialog(scope.row)"
            v-hasPermi="['agri:alert:update']">Update Status</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"
            v-hasPermi="['agri:alert:delete']">Delete</el-button>
        </template>
      </el-table-column>

    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
  </ContentWrap>

  <!-- Status update dialog -->
  <el-dialog v-model="statusDialog.visible" title="Update Alert Status" width="400px">
    <el-descriptions :column="1" border class="mb-4">
      <el-descriptions-item label="Type">
        {{ getDictLabel(DICT_TYPE.AGRI_ALERT_TYPE, statusDialog.row?.alertType) }}
      </el-descriptions-item>
      <el-descriptions-item label="Level">
        {{ getDictLabel(DICT_TYPE.AGRI_ALERT_LEVEL, statusDialog.row?.level) }}
      </el-descriptions-item>
      <el-descriptions-item label="Field">{{ statusDialog.row?.fieldName ?? '-' }}</el-descriptions-item>
    </el-descriptions>
    <el-form label-width="80px">
      <el-form-item label="Status" required>
        <el-select v-model="statusDialog.status" class="w-full">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_ALERT_STATUS)"
            :key="dict.value" :label="dict.label" :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="statusDialog.loading" @click="submitStatus">OK</el-button>
      <el-button @click="statusDialog.visible = false">Cancel</el-button>
    </template>
  </el-dialog>

  <AlertForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, getDictLabel, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { AlertApi, AlertVO } from '@/api/agri/alert'
import AlertForm from './AlertForm.vue'

defineOptions({ name: 'AgriAlert' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<AlertVO[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  alertType: undefined as number | undefined,
  level: undefined as number | undefined,
  status: undefined as number | undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)

const getList = async () => {
  loading.value = true
  try {
    const data = await AlertApi.getAlertPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const statusDialog = reactive({
  visible: false,
  loading: false,
  row: null as AlertVO | null,
  status: undefined as number | undefined,
})

const openStatusDialog = (row: AlertVO) => {
  statusDialog.row = row
  statusDialog.status = row.status
  statusDialog.visible = true
}

const submitStatus = async () => {
  if (statusDialog.status === undefined || !statusDialog.row?.id) return
  statusDialog.loading = true
  try {
    await AlertApi.handleAlert(statusDialog.row.id, statusDialog.status)
    message.success(t('common.updateSuccess'))
    statusDialog.visible = false
    await getList()
  } finally {
    statusDialog.loading = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await AlertApi.deleteAlert(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await AlertApi.exportAlert(queryParams)
    download.excel(data, 'Alert Info.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
