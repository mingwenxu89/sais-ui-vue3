<template>
  <doc-alert title="Social Login" url="https://doc.iocoder.cn/social-user/" />

  <ContentWrap>
    <!-- Search toolbar -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
    >
      <el-form-item prop="type">
        <el-select
          v-model="queryParams.type"
          class="!w-240px"
          clearable
          placeholder="Select social platform"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_SOCIAL_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          class="!w-240px"
          clearable
          placeholder="Enter user nickname"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="openid">
        <el-input
          v-model="queryParams.openid"
          class="!w-240px"
          clearable
          placeholder="Enter social openid"
          @keyup.enter="handleQuery"
        />
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
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- List -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column label="Platform" align="center" prop="type">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_SOCIAL_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="Open ID" align="center" prop="openid" />
      <el-table-column label="Nickname" align="center" prop="nickname" />
      <el-table-column label="Avatar" align="center" prop="avatar">
        <template #default="{ row }">
          <el-image :src="row.avatar" class="h-30px w-30px" @click="imagePreview(row.avatar)" />
        </template>
      </el-table-column>
      <el-table-column label="Create Time"
        :formatter="dateFormatter"
        align="center"
        prop="createTime"
        width="180px"
      />
      <el-table-column label="Update Time"
        :formatter="dateFormatter"
        align="center"
        prop="updateTime"
        width="180px"
      />
      <el-table-column label="Actions" align="center" fixed="right">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:social-user:query']"
            link
            type="primary"
            @click="openDetail(scope.row.id)"
          >
            Detail
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

  <!-- Detail dialog -->
  <SocialUserDetail ref="detailRef" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as SocialUserApi from '@/api/system/social/user'
import SocialUserDetail from './SocialUserDetail.vue'
import { createImageViewer } from '@/components/ImageViewer'

defineOptions({ name: 'SocialUser' })

const loading = ref(true) // List loading state
const total = ref(0) // Total list count
const list = ref([]) // List data
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  type: undefined,
  openid: undefined,
  nickname: undefined,
  createTime: []
})
const queryFormRef = ref() // Search form

/** Query list */
const getList = async () => {
  loading.value = true
  try {
    const data = await SocialUserApi.getSocialUserPage(queryParams)
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

const imagePreview = (imgUrl: string) => {
  createImageViewer({
    urlList: [imgUrl]
  })
}

/** Detail action */
const detailRef = ref()
const openDetail = (id: number) => {
  detailRef.value.open(id)
}

/** Initialize */
onMounted(() => {
  getList()
})
</script>
