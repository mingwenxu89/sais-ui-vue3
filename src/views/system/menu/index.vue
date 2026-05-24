<template>
  <!-- <doc-alert title="Feature Permissions" url="https://doc.iocoder.cn/resource-permission" />
  <doc-alert title="Menu Routes" url="https://doc.iocoder.cn/vue3/route/" /> -->

  <!-- Search toolbar -->
  <ContentWrap>
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
          placeholder="Enter Menu Name"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="status">
        <el-select
          v-model="queryParams.status"
          class="!w-240px"
          clearable
          placeholder="Select Status"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['system:menu:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          Add
        </el-button>
        <el-button plain type="danger" @click="toggleExpandAll">
          <Icon class="mr-5px" icon="ep:sort" />
          Expand/Collapse
        </el-button>
        <el-button plain @click="refreshMenu">
          <Icon class="mr-5px" icon="ep:refresh" />
          Refresh Menu Cache
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- List -->
  <ContentWrap>
    <el-auto-resizer>
      <template #default="{ width }">
        <el-table-v2
          v-model:expanded-row-keys="expandedRowKeys"
          :columns="columns"
          :data="list"
          :expand-column-key="columns[0].key"
          :height="1000"
          :width="width"
          fixed
          row-key="id"
        />
      </template>
    </el-auto-resizer>
  </ContentWrap>

  <!-- Form dialog: add/update -->
  <MenuForm ref="formRef" @success="getList" />
</template>
<script lang="tsx" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { handleTree } from '@/utils/tree'
import * as MenuApi from '@/api/system/menu'
import { MenuVO } from '@/api/system/menu'
import MenuForm from './MenuForm.vue'
import DictTag from '@/components/DictTag/src/DictTag.vue'
import { Icon } from '@/components/Icon'
import { ElButton, TableV2FixedDir, ElSwitch } from 'element-plus'
import { checkPermi } from '@/utils/permission'
import { CommonStatusEnum } from '@/utils/constants'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

defineOptions({ name: 'SystemMenu' })

// Virtual list table
const columns = [
  {
    key: 'name',
    title: 'Menu Name',
    dataKey: 'name',
    width: 250,
    fixed: TableV2FixedDir.LEFT
  },
  {
    key: 'icon',
    title: 'Icon',
    dataKey: 'icon',
    width: 100,
    align: 'center',
    cellRenderer: ({ cellData: icon }) => <Icon icon={icon} />
  },
  {
    key: 'sort',
    title: 'Sort',
    dataKey: 'sort',
    width: 60
  },
  {
    key: 'permission',
    title: 'Permission',
    dataKey: 'permission',
    width: 300
  },
  {
    key: 'component',
    title: 'Component Path',
    dataKey: 'component',
    width: 500
  },
  {
    key: 'componentName',
    title: 'Component Name',
    dataKey: 'componentName',
    width: 200
  },
  {
    key: 'status',
    title: 'Status',
    dataKey: 'status',
    width: 60,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData }) => {
      // Check permission
      if (!checkPermi(['system:menu:update'])) {
        return <DictTag type={DICT_TYPE.COMMON_STATUS} value={rowData.status} />
      }

      // Render ElSwitch if permission is granted
      return (
        <ElSwitch
          v-model={rowData.status}
          active-value={CommonStatusEnum.ENABLE}
          inactive-value={CommonStatusEnum.DISABLE}
          loading={menuStatusUpdating[rowData.id]}
          class="ml-4px"
          onChange={(val) => handleStatusChanged(rowData, val)}
        />
      )
    }
  },
  {
    key: 'operations',
    title: 'Actions',
    align: 'center',
    width: 160,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData }) => {
      // Define button list
      const buttons: InstanceType<typeof ElButton>[] = []

      // Check permissions and add buttons
      if (checkPermi(['system:menu:update'])) {
        buttons.push(
          <ElButton key="edit" link type="primary" onClick={() => openForm('update', rowData.id)}>
            Edit
          </ElButton>
        )
      }
      if (checkPermi(['system:menu:create'])) {
        buttons.push(
          <ElButton
            key="create"
            link
            type="primary"
            onClick={() => openForm('create', undefined, rowData.id)}
          >
            Add
          </ElButton>
        )
      }
      if (checkPermi(['system:menu:delete'])) {
        buttons.push(
          <ElButton key="delete" link type="danger" onClick={() => handleDelete(rowData.id)}>
            Delete
          </ElButton>
        )
      }
      // Return null when no permission is granted
      if (buttons.length === 0) {
        return null
      }
      // Render button list
      return <>{buttons}</>
    }
  }
]

const { wsCache } = useCache()
const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup

const loading = ref(true) // List loading state
const list = ref<any[]>([]) // List data
const queryParams = reactive({
  name: undefined,
  status: undefined
})
const queryFormRef = ref() // Search form
const isExpandAll = ref(false) // Whether expanded, collapsed by default
const refreshTable = ref(true) // Table rerender state

// Add expanded row control
const expandedRowKeys = ref<number[]>([])

/** Query list */
const getList = async () => {
  loading.value = true
  try {
    const data = await MenuApi.getMenuList(queryParams)
    list.value = handleTree(data)
  } finally {
    loading.value = false
  }
}

/** Search button action */
const handleQuery = () => {
  getList()
}

/** Reset button action */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** Add/update action */
const formRef = ref()
const openForm = (type: string, id?: number, parentId?: number) => {
  formRef.value.open(type, id, parentId)
}

/** Expand/collapse action */
const toggleExpandAll = () => {
  if (!isExpandAll.value) {
    // Expand all
    expandedRowKeys.value = list.value.map((item) => item.id)
  } else {
    // Collapse all
    expandedRowKeys.value = []
  }
  isExpandAll.value = !isExpandAll.value
}

/** Refresh Menu Cache button action */
const refreshMenu = async () => {
  try {
    await message.confirm('Cache will be cleared and browser refreshed!', 'Refresh Menu Cache')
    // Clear cache to trigger refresh
    wsCache.delete(CACHE_KEY.USER)
    wsCache.delete(CACHE_KEY.ROLE_ROUTERS)
    // Refresh browser
    location.reload()
  } catch {}
}

/** Delete button action */
const handleDelete = async (id: number) => {
  try {
    // Secondary confirmation before deletion
    await message.delConfirm()
    // Start deletion
    await MenuApi.deleteMenu(id)
    message.success(t('common.delSuccess'))
    // Refresh list
    await getList()
  } catch {}
}

/** Enable/disable menu status */
const menuStatusUpdating = ref({}) // Menu status update mapping. key: menu ID, value: whether updating
const handleStatusChanged = async (menu: MenuVO, val: number) => {
  // 1. Mark menu.id as updating
  menuStatusUpdating.value[menu.id] = true
  try {
    // 2. Start status update
    menu.status = val
    await MenuApi.updateMenu(menu)
  } finally {
    // 3. Mark menu.id update as complete
    menuStatusUpdating.value[menu.id] = false
  }
}

/** Initialize */
onMounted(() => {
  getList()
})
</script>
