<template>
  <Dialog v-model="dialogVisible" title="Data Permission" width="800">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="Role Name">
        <el-tag>{{ formData.name }}</el-tag>
      </el-form-item>
      <el-form-item label="Role Key">
        <el-tag>{{ formData.code }}</el-tag>
      </el-form-item>
      <el-form-item label="Data Scope">
        <el-select v-model="formData.dataScope">
          <el-option
            v-for="item in getIntDictOptions(DICT_TYPE.SYSTEM_DATA_SCOPE)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-form-item
      v-if="formData.dataScope === SystemDataScopeEnum.DEPT_CUSTOM"
      label="Dept Scope"
      label-width="80px"
    >
      <el-card class="w-full h-400px !overflow-y-scroll" shadow="never">
        <template #header>
          Select All/None:
          <el-switch
            v-model="treeNodeAll"
            active-text="Yes"
            inactive-text="No"
            inline-prompt
            @change="handleCheckedTreeNodeAll()"
          />
          Expand/Collapse All:
          <el-switch
            v-model="deptExpand"
            active-text="Expand"
            inactive-text="Collapse"
            inline-prompt
            @change="handleCheckedTreeExpand"
          />
          Parent-child linked (select parent, auto-select children):
          <el-switch v-model="checkStrictly" active-text="Yes" inactive-text="No" inline-prompt />
        </template>
        <el-tree
          ref="treeRef"
          :check-strictly="!checkStrictly"
          :data="deptOptions"
          :props="defaultProps"
          default-expand-all
          empty-text="Loading, please wait..."
          node-key="id"
          show-checkbox
        />
      </el-card>
    </el-form-item>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'
import { SystemDataScopeEnum } from '@/utils/constants'
import * as RoleApi from '@/api/system/role'
import * as DeptApi from '@/api/system/dept'
import * as PermissionApi from '@/api/system/permission'

defineOptions({ name: 'SystemRoleDataPermissionForm' })

const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const formLoading = ref(false) // Form loading state: 1) data loading during update; 2) submit button disabled
const formData = reactive({
  id: undefined,
  name: '',
  code: '',
  dataScope: undefined,
  dataScopeDeptIds: []
})
const formRef = ref() // Form ref
const deptOptions = ref<any[]>([]) // Department tree structure
const deptExpand = ref(true) // Expand/Collapse
const treeRef = ref() // Menu tree component ref
const treeNodeAll = ref(false) // Select all/none
const checkStrictly = ref(true) // Whether strict mode is enabled, meaning parent and child nodes are not linked

/** Open dialog */
const open = async (row: RoleApi.RoleVO) => {
  dialogVisible.value = true
  resetForm()
  // Load the Dept list first so setChecked below has data nodes
  deptOptions.value = handleTree(await DeptApi.getSimpleDeptList())
  // Set data
  formData.id = row.id
  formData.name = row.name
  formData.code = row.code
  formData.dataScope = row.dataScope
  await nextTick()
  // Set checked state after DOM rendering is complete
  row.dataScopeDeptIds?.forEach((deptId: number): void => {
    treeRef.value.setChecked(deptId, true, false)
  })
}
defineExpose({ open }) // Provide the open method for opening the dialog

/** Submit form */
const emit = defineEmits(['success']) // Define the success event for callbacks after successful operations
const submitForm = async () => {
  formLoading.value = true
  try {
    const data = {
      roleId: formData.id,
      dataScope: formData.dataScope,
      dataScopeDeptIds:
        formData.dataScope !== SystemDataScopeEnum.DEPT_CUSTOM
          ? []
          : treeRef.value.getCheckedKeys(false)
    }
    await PermissionApi.assignRoleDataScope(data)
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
  deptExpand.value = true
  checkStrictly.value = true
  // Reset form
  formData.value = {
    id: undefined,
    name: '',
    code: '',
    dataScope: undefined,
    dataScopeDeptIds: []
  }
  treeRef.value?.setCheckedNodes([])
  formRef.value?.resetFields()
}

/** Select all/none */
const handleCheckedTreeNodeAll = () => {
  treeRef.value.setCheckedNodes(treeNodeAll.value ? deptOptions.value : [])
}

/** Expand/collapse all */
const handleCheckedTreeExpand = () => {
  const nodes = treeRef.value?.store.nodesMap
  for (let node in nodes) {
    if (nodes[node].expanded === deptExpand.value) {
      continue
    }
    nodes[node].expanded = deptExpand.value
  }
}
</script>
