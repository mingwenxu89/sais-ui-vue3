<template>
  <Dialog v-model="dialogVisible" title="User Selection" width="800">
    <el-row class="gap2" v-loading="formLoading">
      <el-col :span="6">
        <ContentWrap class="h-1/1">
          <el-tree
            ref="treeRef"
            :data="deptTree"
            :expand-on-click-node="false"
            :props="defaultProps"
            default-expand-all
            highlight-current
            node-key="id"
            @node-click="handleNodeClick"
          />
        </ContentWrap>
      </el-col>
      <el-col :span="17">
        <el-transfer
          v-model="selectedUserIdList"
          :titles="['Unselected', 'Selected']"
          filterable
          filter-placeholder="Search members"
          :data="transferUserList"
          :props="{ label: 'nickname', key: 'id' }"
        />
      </el-col>
    </el-row>
    <template #footer>
      <el-button
        :disabled="formLoading || !selectedUserIdList?.length"
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
import * as UserApi from '@/api/system/user'

defineOptions({ name: 'UserSelectForm' })
const emit = defineEmits<{
  confirm: [id: any, userList: any[]]
}>()
const { t } = useI18n() // Internationalization
const message = useMessage() // Message popup
const deptTree = ref<Tree[]>([]) // Structured department tree
const deptList = ref<any[]>([]) // Flat department list data
const userList = ref<UserApi.UserVO[]>([]) // All users
const filteredUserList = ref<UserApi.UserVO[]>([]) // Users filtered by the current department
const selectedUserIdList: any = ref([]) // Selected users
const dialogVisible = ref(false) // Dialog visibility
const formLoading = ref(false) // Form loading state
const activityId = ref()

/** Computed property: merge selected users with users filtered by the current department. */
const transferUserList = computed(() => {
  // 1.1 Get all selected users.
  const selectedUsers = userList.value.filter((user: any) =>
    selectedUserIdList.value.includes(user.id)
  )

  // 1.2 Get unselected users filtered by the current department.
  const filteredUnselectedUsers = filteredUserList.value.filter(
    (user: any) => !selectedUserIdList.value.includes(user.id)
  )

  // 2. Merge and deduplicate.
  return [...selectedUsers, ...filteredUnselectedUsers]
})

/** Open dialog. */
const open = async (id: number, selectedList?: any[]) => {
  activityId.value = id
  resetForm()

  // Load department and user lists.
  const deptData = await DeptApi.getSimpleDeptList()
  deptList.value = deptData // Save flat department data.
  deptTree.value = handleTree(deptData) // Convert to tree structure.
  userList.value = await UserApi.getSimpleUserList()

  // Initially, the filtered list is equal to the full user list.
  filteredUserList.value = [...userList.value]
  selectedUserIdList.value = selectedList?.map((item: any) => item.id) || []
  dialogVisible.value = true
}

/** Get the ID list for the specified department and all child departments. */
const getChildDeptIds = (deptId: number, deptList: any[]): number[] => {
  const ids = [deptId]
  const children = deptList.filter((dept) => dept.parentId === deptId)
  children.forEach((child) => {
    ids.push(...getChildDeptIds(child.id, deptList))
  })
  return ids
}

/** Get users filtered by department. */
const filterUserList = async (deptId?: number) => {
  formLoading.value = true
  try {
    if (!deptId) {
      // Show all users when no department is selected.
      filteredUserList.value = [...userList.value]
      return
    }

    // Filter using the saved department list data.
    const deptIds = getChildDeptIds(deptId, deptList.value)

    // Filter users under these departments.
    filteredUserList.value = userList.value.filter((user) => deptIds.includes(user.deptId))
  } finally {
    formLoading.value = false
  }
}

/** Submit selection. */
const submitForm = async () => {
  try {
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // Select users from the full user list.
    const emitUserList = userList.value.filter((user: any) =>
      selectedUserIdList.value.includes(user.id)
    )
    // Emit the operation success event.
    emit('confirm', activityId.value, emitUserList)
  } finally {
  }
}

/** Reset form. */
const resetForm = () => {
  deptTree.value = []
  deptList.value = []
  userList.value = []
  filteredUserList.value = []
  selectedUserIdList.value = []
}

/** Handle department click. */
const handleNodeClick = (row: { [key: string]: any }) => {
  filterUserList(row.id)
}

defineExpose({ open }) // Expose the open method for opening the dialog.
</script>

<style lang="scss" scoped>
:deep() {
  .el-transfer {
    display: flex;
  }
  .el-transfer__buttons {
    display: flex !important;
    flex-direction: column-reverse;
    justify-content: center;
    gap: 20px;
    .el-transfer__button:nth-child(2) {
      margin: 0;
    }
  }
}
</style>
