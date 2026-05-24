<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="Parent Menu">
        <el-tree-select
          v-model="formData.parentId"
          :data="menuTree"
          :default-expanded-keys="[0]"
          :props="defaultProps"
          check-strictly
          node-key="id"
        />
      </el-form-item>
      <el-form-item label="Menu Name" prop="name">
        <el-input v-model="formData.name" clearable placeholder="Enter Menu Name" />
      </el-form-item>
      <el-form-item label="Menu Type" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio-button
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_TYPE)"
            :key="dict.label"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="Icon">
        <IconSelect v-model="formData.icon" clearable />
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="Route Path" prop="path">
        <template #label>
          <Tooltip
            message="The route path, e.g.: `user`. For external URLs, start with `http(s)://`"
            title="Route Path"
          />
        </template>
        <el-input v-model="formData.path" clearable placeholder="Enter Route Path" />
      </el-form-item>
      <el-form-item v-if="formData.type === 2" label="Component Path" prop="component">
        <el-input v-model="formData.component" clearable placeholder="e.g.: system/user/index" />
      </el-form-item>
      <el-form-item v-if="formData.type === 2" label="Component Name" prop="componentName">
        <el-input v-model="formData.componentName" clearable placeholder="e.g.: SystemUser" />
      </el-form-item>
      <el-form-item v-if="formData.type !== 1" label="Permission" prop="permission">
        <template #label>
          <Tooltip
            message="Permission string on the Controller method, e.g.: @PreAuthorize(`@ss.hasPermission('system:user:list')`)"
            title="Permission"
          />
        </template>
        <el-input v-model="formData.permission" clearable placeholder="Enter Permission" />
      </el-form-item>
      <el-form-item label="Sort" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" clearable controls-position="right" />
      </el-form-item>
      <el-form-item label="Menu Status" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.label"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="Visible" prop="visible">
        <template #label>
          <Tooltip message="When hidden, the route will not appear in the sidebar but is still accessible" title="Visible" />
        </template>
        <el-radio-group v-model="formData.visible">
          <el-radio key="true" :value="true" border>Show</el-radio>
          <el-radio key="false" :value="false" border>Hide</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="Always Show" prop="alwaysShow">
        <template #label>
          <Tooltip
            message="When set to No, if this menu has only one child, it will not render itself and will show the child directly"
            title="Always Show"
          />
        </template>
        <el-radio-group v-model="formData.alwaysShow">
          <el-radio key="true" :value="true" border>Yes</el-radio>
          <el-radio key="false" :value="false" border>No</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type === 2" label="Keep Alive" prop="keepAlive">
        <template #label>
          <Tooltip
            message="When enabled, the page will be cached by `keep-alive`. The Component Name field must be filled in."
            title="Keep Alive"
          />
        </template>
        <el-radio-group v-model="formData.keepAlive">
          <el-radio key="true" :value="true" border>Cache</el-radio>
          <el-radio key="false" :value="false" border>No Cache</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as MenuApi from '@/api/system/menu'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { CommonStatusEnum, SystemMenuTypeEnum } from '@/utils/constants'
import { defaultProps, handleTree } from '@/utils/tree'

defineOptions({ name: 'SystemMenuForm' })

const { wsCache } = useCache()
const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const dialogTitle = ref('') // Dialog title
const formLoading = ref(false) // Form loading state: 1) data loading during update; 2) submit button disabled
const formType = ref('') // Form type: create - add; update - modify
const formData = ref({
  id: undefined,
  name: '',
  permission: '',
  type: SystemMenuTypeEnum.DIR,
  sort: Number(undefined),
  parentId: 0,
  path: '',
  icon: '',
  component: '',
  componentName: '',
  status: CommonStatusEnum.ENABLE,
  visible: true,
  keepAlive: true,
  alwaysShow: true
})
const formRules = reactive({
  name: [{ required: true, message: 'Menu Name cannot be empty', trigger: 'blur' }],
  type: [{ required: true, message: 'Menu type cannot be empty', trigger: 'blur' }],
  sort: [{ required: true, message: 'Menu sort cannot be empty', trigger: 'blur' }],
  path: [{ required: true, message: 'Route path cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }]
})
const formRef = ref() // Form ref

/** Open dialog */
const open = async (type: string, id?: number, parentId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (parentId) {
    formData.value.parentId = parentId
  }
  // Set data during update
  if (id) {
    formLoading.value = true
    try {
      formData.value = await MenuApi.getMenu(id)
    } finally {
      formLoading.value = false
    }
  }
  // Get menu list
  await getTree()
}
defineExpose({ open }) // Provide the open method for opening the dialog

/** Submit form */
const emit = defineEmits(['success']) // Define the success event for callbacks after successful operations
const submitForm = async () => {
  // Validate form
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // Submit request
  formLoading.value = true
  try {
    if (
      formData.value.type === SystemMenuTypeEnum.DIR ||
      formData.value.type === SystemMenuTypeEnum.MENU
    ) {
      if (!isExternal(formData.value.path)) {
        if (formData.value.parentId === 0 && formData.value.path.charAt(0) !== '/') {
          message.error('Path must start with /')
          return
        } else if (formData.value.parentId !== 0 && formData.value.path.charAt(0) === '/') {
          message.error('Path must not start with /')
          return
        }
      }
    }
    const data = formData.value as unknown as MenuApi.MenuVO
    if (formType.value === 'create') {
      await MenuApi.createMenu(data)
      message.success(t('common.createSuccess'))
    } else {
      await MenuApi.updateMenu(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // Emit the operation success event
    emit('success')
  } finally {
    formLoading.value = false
    // Clear cache to trigger refresh
    wsCache.delete(CACHE_KEY.ROLE_ROUTERS)
  }
}

/** Get dropdown data for [Parent Menu] */
const menuTree = ref<Tree[]>([]) // Tree structure
const getTree = async () => {
  menuTree.value = []
  const res = await MenuApi.getSimpleMenusList()
  let menu: Tree = { id: 0, name: 'Root', children: [] }
  menu.children = handleTree(res)
  menuTree.value.push(menu)
}

/** Reset form */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    permission: '',
    type: SystemMenuTypeEnum.DIR,
    sort: Number(undefined),
    parentId: 0,
    path: '',
    icon: '',
    component: '',
    componentName: '',
    status: CommonStatusEnum.ENABLE,
    visible: true,
    keepAlive: true,
    alwaysShow: true
  }
  formRef.value?.resetFields()
}

/** Determine whether path is an external HTTP link */
const isExternal = (path: string) => {
  return /^(https?:|mailto:|tel:)/.test(path)
}
</script>
