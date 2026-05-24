<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="Package Name" prop="name">
        <el-input v-model="formData.name" placeholder="Enter Package Name" />
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
      <el-form-item label="Status" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Remark" prop="remark">
        <el-input v-model="formData.remark" placeholder="Enter Remark" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { defaultProps, handleTree } from '@/utils/tree'
import * as TenantPackageApi from '@/api/system/tenantPackage'
import * as MenuApi from '@/api/system/menu'
import { ElTree } from 'element-plus'

defineOptions({ name: 'SystemTenantPackageForm' })

const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const dialogTitle = ref('') // Dialog title
const formLoading = ref(false) // Form loading state: 1) data loading during update; 2) submit button disabled
const formType = ref('') // Form type: create - add; update - modify
const formData = ref({
  id: null,
  name: null,
  remark: null,
  menuIds: [],
  status: CommonStatusEnum.ENABLE
})
const formRules = reactive({
  name: [{ required: true, message: 'Package Name cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }],
  menuIds: [{ required: true, message: 'Associated menu ID cannot be empty', trigger: 'blur' }]
})
const formRef = ref() // Form ref
const menuOptions = ref<any[]>([]) // Tree structure data
const menuExpand = ref(false) // Expand/Collapse
const treeRef = ref<InstanceType<typeof ElTree>>() // Tree component ref
const treeNodeAll = ref(false) // Select all/none

/** Open dialog */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // Load the menu list first so setChecked below has data nodes
  menuOptions.value = handleTree(await MenuApi.getSimpleMenusList())
  // Set data during update
  if (id) {
    formLoading.value = true
    try {
      const res = await TenantPackageApi.getTenantPackage(id)
      // Set selected data
      formData.value = res
      // Set checked state
      res.menuIds.forEach((menuId: number) => {
        treeRef.value!.setChecked(menuId, true, false)
      })
    } finally {
      formLoading.value = false
    }
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
    const data = formData.value as unknown as TenantPackageApi.TenantPackageVO
    data.menuIds = [
      ...(treeRef.value!.getCheckedKeys(false) as unknown as Array<number>), // Get currently checked nodes
      ...(treeRef.value!.getHalfCheckedKeys() as unknown as Array<number>) // Get half-checked parent nodes
    ]
    if (formType.value === 'create') {
      await TenantPackageApi.createTenantPackage(data)
      message.success(t('common.createSuccess'))
    } else {
      await TenantPackageApi.updateTenantPackage(data)
      message.success(t('common.updateSuccess'))
    }
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
    id: null,
    name: null,
    remark: null,
    menuIds: [],
    status: CommonStatusEnum.ENABLE
  }
  treeRef.value?.setCheckedNodes([])
  formRef.value?.resetFields()
}

/** Select all/none */
const handleCheckedTreeNodeAll = () => {
  treeRef.value!.setCheckedNodes(treeNodeAll.value ? menuOptions.value : [])
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
