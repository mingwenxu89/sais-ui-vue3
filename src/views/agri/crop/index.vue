<template>
  <ContentWrap>
    <!-- Search toolbar -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="Crop Name" prop="cropName">
        <el-input
          v-model="queryParams.cropName"
          placeholder="Enter crop name"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="Crop Type" prop="cropType">
        <el-select
          v-model="queryParams.cropType"
          placeholder="Select crop type"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_CROP_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['agri:crop:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> Add
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['agri:crop:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> Export
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- List -->
  <ContentWrap>
    <div v-loading="loading">
      <el-row :gutter="20" v-if="list.length > 0">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in list" :key="item.id" class="mb-20px">
          <el-card :body-style="{ padding: '0px' }" shadow="hover">
            <div class="relative h-200px overflow-hidden group">
              <img 
                v-if="item.imageUrl" 
                :src="item.imageUrl" 
                class="w-full h-full object-contain bg-gray-50 transition-transform duration-300 group-hover:scale-105" 
              />
              <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                 <Icon icon="ep:picture" size="48" />
              </div>
            </div>
            <div class="p-15px">
              <div class="flex justify-between items-start mb-10px">
                <span class="text-16px font-bold truncate flex-1 mr-2" :title="item.cropName">{{ item.cropName }}</span>
                <dict-tag :type="DICT_TYPE.AGRI_CROP_TYPE" :value="item.cropType" />
              </div>
              
              <div class="text-14px text-gray-500 mb-5px flex items-center">
                 <span class="font-medium mr-2">Variety:</span> 
                 <span class="truncate">{{ item.variety || '-' }}</span>
              </div>
              
              <div class="text-14px text-gray-500 mb-10px flex items-center">
                 <span class="font-medium mr-2">Growth Period:</span>
                 <span>{{ item.growthPeriod ? item.growthPeriod + ' days' : '-' }}</span>
              </div>

              <div class="flex justify-end gap-10px mt-15px pt-10px border-t border-gray-100">
                 <el-button link type="primary" @click="openForm('update', item.id)" v-hasPermi="['agri:crop:update']">
                   <Icon icon="ep:edit" class="mr-1" /> Edit
                 </el-button>
                 <el-button link type="danger" @click="handleDelete(item.id)" v-hasPermi="['agri:crop:delete']">
                   <Icon icon="ep:delete" class="mr-1" /> Delete
                 </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- Empty State -->
      <el-empty v-if="list.length === 0 && !loading" description="No crops found" />
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="list.length > 0"
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :page-sizes="[12]"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- Form dialog: add / edit -->
  <CropForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import download from '@/utils/download'
import { CropApi, CropVO } from '@/api/agri/crop'
import CropForm from './CropForm.vue'

/** Crop Library list */
defineOptions({ name: 'AgriCrop' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<CropVO[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 12,
  cropName: undefined,
  cropType: undefined,
})
const queryFormRef = ref()
const exportLoading = ref(false)

/** Fetch list */
const getList = async () => {
  loading.value = true
  try {
    const data = await CropApi.getCropPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** Search */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** Reset */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** Open add/edit form */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** Delete */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await CropApi.deleteCrop(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** Export */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await CropApi.exportCrop(queryParams)
    download.excel(data, 'crop-library.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** Init **/
onMounted(() => {
  getList()
})
</script>
