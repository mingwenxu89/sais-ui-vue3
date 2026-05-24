<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
    >
      <el-form-item prop="dictType">
        <el-select v-model="queryParams.dictType" class="!w-240px" @change="dictChange">
          <el-option
            v-for="item in dictTypeList"
            :key="item.type"
            :label="dict.label"
            :value="item.type"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="label">
        <el-input
          v-model="queryParams.label"
          placeholder="Enter Dict Label"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item prop="status">
        <el-select v-model="queryParams.status" placeholder="Data Status" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />Reset</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['system:dict:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> Add
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['system:dict:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> Export
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="checkedIds.length === 0"
          @click="handleDeleteBatch"
          v-hasPermi="['system:dict:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> Batch Delete
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- List -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="Label" align="center" prop="label" />
      <el-table-column label="Value" align="center" prop="value" />
      <el-table-column label="Sort" align="center" prop="sort" />
      <el-table-column label="Status" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="Color Type" align="center" prop="colorType" />
      <el-table-column label="CSS Class" align="center" prop="cssClass" />
      <el-table-column label="Remark" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="Create Time"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="Actions" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['system:dict:update']"
          >
            Edit
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:dict:delete']"
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
  <DictDataForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as DictDataApi from '@/api/system/dict/dict.data'
import * as DictTypeApi from '@/api/system/dict/dict.type'
import DictDataForm from './DictDataForm.vue'

defineOptions({ name: 'SystemDictData' })

const message = useMessage() // Message popup
const { t } = useI18n() // Internationalization
const route = useRoute() // Route

const loading = ref(true) // List loading state
const total = ref(0) // Total number of list items
const list = ref([]) // List data
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  label: '',
  status: undefined,
  dictType: route.params.dictType
})
const queryFormRef = ref() // Search form
const exportLoading = ref(false) // Export loading state
const dictTypeList = ref<DictTypeApi.DictTypeVO[]>() // Dict type list

/** Query list */
const getList = async () => {
  loading.value = true
  try {
    const data = await DictDataApi.getDictDataPage(queryParams)
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

/** Update list data when dict type changes */
const dictChange = (v) => {
  queryParams.dictType = v
  handleQuery()
}

/** Reset button action */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** Add/update action */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id, queryParams.dictType)
}

/** Delete button action */
const handleDelete = async (id: number) => {
  try {
    // Secondary confirmation before deletion
    await message.delConfirm()
    // Start deletion
    await DictDataApi.deleteDictData(id)
    message.success(t('common.delSuccess'))
    // Refresh list
    await getList()
  } catch {}
}

/** Batch delete button action */
const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (rows: DictDataApi.DictDataVO[]) => {
  checkedIds.value = rows.map((row) => row.id)
}

const handleDeleteBatch = async () => {
  try {
    // Secondary confirmation before deletion
    await message.delConfirm()
    // Start batch deletion
    await DictDataApi.deleteDictDataList(checkedIds.value)
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
    const data = await DictDataApi.exportDictData(queryParams)
    download.excel(data, 'dict-data.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** Initialize */
onMounted(async () => {
  await getList()
  // Query simplified dict type list
  dictTypeList.value = await DictTypeApi.getSimpleDictTypeList()
})
</script>
