<template>
  <Dialog v-model="dialogVisible" title="Department Selection" width="600">
    <el-row v-loading="formLoading">
      <el-col :span="24">
        <ContentWrap class="h-1/1">
          <el-tree
            ref="treeRef"
            :data="deptTree"
            :props="defaultProps"
            show-checkbox
            :check-strictly="checkStrictly"
            check-on-click-node
            default-expand-all
            highlight-current
            node-key="id"
            @check="handleCheck"
          />
        </ContentWrap>
      </el-col>
    </el-row>
    <template #footer>
      <el-button
        :disabled="formLoading || !selectedDeptIds?.length"
        type="primary"
        @click="submitForm"
      >
        Confirm
      </el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'

defineOptions({ name: 'DeptSelectForm' })

const emit = defineEmits<{
  confirm: [deptList: any[]]
}>()

const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup

const props = defineProps({
  // Whether to strictly keep parent and child nodes unlinked
  checkStrictly: {
    type: Boolean,
    default: false
  },
  // Whether multiple selection is supported
  multiple: {
    type: Boolean,
    default: true
  }
})

const treeRef = ref()
const deptTree = ref<Tree[]>([]) // Department tree structure
const selectedDeptIds = ref<number[]>([]) // Selected department ID list
const dialogVisible = ref(false) // Whether the dialog is visible
const formLoading = ref(false) // Form loading state

/** Open dialog */
const open = async (selectedList?: DeptApi.DeptVO[]) => {
  resetForm()
  formLoading.value = true
  try {
    // Load department list
    const deptData = await DeptApi.getSimpleDeptList()
    deptTree.value = handleTree(deptData)
  } finally {
    formLoading.value = false
  }
  dialogVisible.value = true
  // Set selected departments
  if (selectedList?.length) {
    await nextTick()
    const selectedIds = selectedList
      .map((dept) => dept.id)
      .filter((id): id is number => id !== undefined)
    selectedDeptIds.value = selectedIds
    treeRef.value?.setCheckedKeys(selectedIds)
  }
}

/** Handle selected state changes */
const handleCheck = (data: any, checked: any) => {
  selectedDeptIds.value = treeRef.value.getCheckedKeys()
  if (!props.multiple && selectedDeptIds.value.length > 1) {
    // In single-select mode, keep only the last selected node
    const lastSelectedId = selectedDeptIds.value[selectedDeptIds.value.length - 1]
    selectedDeptIds.value = [lastSelectedId]
    treeRef.value.setCheckedKeys([lastSelectedId])
  }
}

/** Submit selection */
const submitForm = async () => {
  try {
    // Get complete selected department data
    const checkedNodes = treeRef.value.getCheckedNodes()
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    emit('confirm', checkedNodes)
  } finally {
  }
}

/** Reset form */
const resetForm = () => {
  deptTree.value = []
  selectedDeptIds.value = []
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([])
  }
}

defineExpose({ open }) // Provide the open method for opening the dialog
</script>
