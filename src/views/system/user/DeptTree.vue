<template>
  <div class="head-container">
    <el-input v-model="deptName" class="mb-20px" clearable placeholder="Enter Department Name">
      <template #prefix>
        <Icon icon="ep:search" />
      </template>
    </el-input>
  </div>
  <div class="head-container">
    <el-tree
      ref="treeRef"
      :data="deptList"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :props="defaultProps"
      default-expand-all
      highlight-current
      node-key="id"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { ElTree } from 'element-plus'
import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'

defineOptions({ name: 'SystemUserDeptTree' })

const deptName = ref('')
const deptList = ref<Tree[]>([]) // Tree structure
const treeRef = ref<InstanceType<typeof ElTree>>()

/** Get department tree */
const getTree = async () => {
  const res = await DeptApi.getSimpleDeptList()
  deptList.value = []
  deptList.value.push(...handleTree(res))
}

/** Filter by name */
const filterNode = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}

/** Handle department node click */
let currentNode: any = {}
const handleNodeClick = async (row: { [key: string]: any }, treeNode: any) => {
  // Determine selected state
  if (currentNode && currentNode.name === row.name) {
    treeNode.checked = !treeNode.checked
  } else {
    treeNode.checked = true
  }
  if (treeNode.checked) {
    // Selected
    currentNode = row
    emits('node-click', row)
  } else {
    // Deselected
    treeRef.value!.setCurrentKey(undefined)
    emits('node-click', undefined)
    currentNode = null
  }
}
const emits = defineEmits(['node-click'])

/** Watch deptName */
watch(deptName, (val) => {
  treeRef.value!.filter(val)
})

/** Initialize */
onMounted(async () => {
  await getTree()
})
</script>
