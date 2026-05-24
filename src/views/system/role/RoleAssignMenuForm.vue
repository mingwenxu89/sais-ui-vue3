<template>
  <Dialog v-model="dialogVisible" title="Menu Permissions">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="Role Name">
        <el-tag>{{ formData.name }}</el-tag>
      </el-form-item>
      <el-form-item label="Role Key">
        <el-tag>{{ formData.code }}</el-tag>
      </el-form-item>
      <el-form-item label="Menu Permissions">
        <el-card class="w-full h-400px !overflow-y-scroll" shadow="never">
          <template #header>
            Select All/None:
            <el-switch
              v-model="treeNodeAll"
              active-text="Yes"
              inactive-text="No"
              inline-prompt
              @change="handleCheckedTreeNodeAll"
            />
            Expand/Collapse All:
            <el-switch
              v-model="menuExpand"
              active-text="Expand"
              inactive-text="Collapse"
              inline-prompt
              @change="handleCheckedTreeExpand"
            />
          </template>
          <el-tree
            ref="treeRef"
            :data="menuOptions"
            :props="defaultProps"
            empty-text="Loading, please wait..."
            node-key="id"
            show-checkbox
          />
        </el-card>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { defaultProps, handleTree } from '@/utils/tree'
import * as RoleApi from '@/api/system/role'
import * as MenuApi from '@/api/system/menu'
import * as PermissionApi from '@/api/system/permission'

defineOptions({ name: 'SystemRoleAssignMenuForm' })

const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const formLoading = ref(false) // Form loading state: 1) data loading during update; 2) submit button disabled
const formData = reactive({
  id: undefined,
  name: '',
  code: '',
  menuIds: []
})
const formRef = ref() // Form ref
const menuOptions = ref<any[]>([]) // Menu tree structure
const menuExpand = ref(false) // Expand/Collapse
const treeRef = ref() // Menu tree component ref
const treeNodeAll = ref(false) // Select all/none

/** Open dialog */
const open = async (row: RoleApi.RoleVO) => {
  dialogVisible.value = true
  resetForm()
  // Load the Menu list first so setChecked below has data nodes
  menuOptions.value = handleTree(await MenuApi.getSimpleMenusList())
  // Set data
  formData.id = row.id
  formData.name = row.name
  formData.code = row.code
  formLoading.value = true
  try {
    formData.value.menuIds = await PermissionApi.getRoleMenuList(row.id)
    // Set checked state
    formData.value.menuIds.forEach((menuId: number) => {
      treeRef.value.setChecked(menuId, true, false)
    })
  } finally {
    formLoading.value = false
  }
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
    const data = {
      roleId: formData.id,
      menuIds: [
        ...(treeRef.value.getCheckedKeys(false) as unknown as Array<number>), // Get currently checked nodes
        ...(treeRef.value.getHalfCheckedKeys() as unknown as Array<number>) // Get half-checked parent nodes
      ]
    }
    await PermissionApi.assignRoleMenu(data)
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // Emit the operation success event
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** Reset form */
const resetForm = () => {
  // Reset options
  treeNodeAll.value = false
  menuExpand.value = false
  // Reset form
  formData.value = {
    id: undefined,
    name: '',
    code: '',
    menuIds: []
  }
  treeRef.value?.setCheckedNodes([])
  formRef.value?.resetFields()
}

/** Select all/none */
const handleCheckedTreeNodeAll = () => {
  treeRef.value.setCheckedNodes(treeNodeAll.value ? menuOptions.value : [])
}

/** Expand/collapse all */
const handleCheckedTreeExpand = () => {
  const nodes = treeRef.value?.store.nodesMap
  for (let node in nodes) {
    if (nodes[node].expanded === menuExpand.value) {
      continue
    }
    nodes[node].expanded = menuExpand.value
  }
}
</script>
