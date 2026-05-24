<template>
  <!-- <doc-alert title="User System" url="https://doc.iocoder.cn/user-center/" />
  <doc-alert title="Social Login" url="https://doc.iocoder.cn/social-user/" />
  <doc-alert title="Excel Import and Export" url="https://doc.iocoder.cn/excel-import-and-export/" /> -->

  <el-row :gutter="20">
    <!-- Department tree -->
    <el-col :span="4" :xs="24">
      <ContentWrap class="h-1/1">
        <DeptTree @node-click="handleDeptNodeClick" />
      </ContentWrap>
    </el-col>
    <el-col :span="20" :xs="24">
      <!-- Search -->
      <ContentWrap>
        <el-form
          class="-mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
        >
          <el-form-item prop="username">
            <el-input
              v-model="queryParams.username"
              placeholder="Enter Username"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item prop="mobile">
            <el-input
              v-model="queryParams.mobile"
              placeholder="Enter Phone"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="Select Status"
              clearable
              class="!w-240px"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              start-placeholder="Start Date"
              end-placeholder="End Date"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleQuery"><Icon icon="ep:search" />Search</el-button>
            <el-button @click="resetQuery"><Icon icon="ep:refresh" />Reset</el-button>
            <el-button
              type="primary"
              plain
              @click="openForm('create')"
              v-hasPermi="['system:user:create']"
            >
              <Icon icon="ep:plus" /> Add
            </el-button>
            <el-button
              type="warning"
              plain
              @click="handleImport"
              v-hasPermi="['system:user:import']"
            >
              <Icon icon="ep:upload" /> Import
            </el-button>
            <el-button
              type="success"
              plain
              @click="handleExport"
              :loading="exportLoading"
              v-hasPermi="['system:user:export']"
            >
              <Icon icon="ep:download" />Export
            </el-button>
            <el-button
              type="danger"
              plain
              :disabled="checkedIds.length === 0"
              @click="handleDeleteBatch"
              v-hasPermi="['system:user:delete']"
            >
              <Icon icon="ep:delete" />Batch Delete
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
      <ContentWrap>
        <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="ID" align="center" key="id" prop="id" />
          <el-table-column label="Username"
            align="center"
            prop="username"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Nickname"
            align="center"
            prop="nickname"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Dept"
            align="center"
            key="deptName"
            prop="deptName"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Phone" align="center" prop="mobile" width="120" />
          <el-table-column label="Status" key="status">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="0"
                :inactive-value="1"
                @change="handleStatusChange(scope.row)"
                :disabled="!checkPermi(['system:user:update'])"
              />
            </template>
          </el-table-column>
          <el-table-column label="Create Time"
            align="center"
            prop="createTime"
            :formatter="dateFormatter"
            width="180"
          />
          <el-table-column label="Actions" align="center" width="160">
            <template #default="scope">
              <div class="flex items-center justify-center">
                <el-button
                  type="primary"
                  link
                  @click="openForm('update', scope.row.id)"
                  v-hasPermi="['system:user:update']"
                >
                  <Icon icon="ep:edit" />Edit
                </el-button>
                <el-dropdown
                  @command="(command) => handleCommand(command, scope.row)"
                  v-hasPermi="[
                    'system:user:delete',
                    'system:user:update-password',
                    'system:permission:assign-user-role'
                  ]"
                >
                  <el-button type="primary" link><Icon icon="ep:d-arrow-right" /> More</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        command="handleDelete"
                        v-if="checkPermi(['system:user:delete'])"
                      >
                        <Icon icon="ep:delete" />Delete
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleResetPwd"
                        v-if="checkPermi(['system:user:update-password'])"
                      >
                        <Icon icon="ep:key" />Reset Password
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleRole"
                        v-if="checkPermi(['system:permission:assign-user-role'])"
                      >
                        <Icon icon="ep:circle-check" />Assign Roles
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          :total="total"
          v-model:page="queryParams.pageNo"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </ContentWrap>
    </el-col>
  </el-row>

  <!-- Add or edit user dialog -->
  <UserForm ref="formRef" @success="getList" />
  <!-- User import dialog -->
  <UserImportForm ref="importFormRef" @success="getList" />
  <!-- Assign roles -->
  <UserAssignRoleForm ref="assignRoleFormRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import UserForm from './UserForm.vue'
import UserImportForm from './UserImportForm.vue'
import UserAssignRoleForm from './UserAssignRoleForm.vue'
import DeptTree from './DeptTree.vue'

defineOptions({ name: 'SystemUser' })

const message = useMessage() // Message popup
const { t } = useI18n() // I18n

const loading = ref(true) // List loading state
const total = ref(0) // Total list count
const list = ref([]) // List data
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: []
})
const queryFormRef = ref() // Search form

/** Query list */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserApi.getUserPage(queryParams)
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
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** Handle department node click */
const handleDeptNodeClick = async (row: any) => {
  if (row === undefined) {
    queryParams.deptId = undefined
    await getList()
  } else {
    queryParams.deptId = row.id
    await getList()
  }
}

/** Add/Edit action */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** User import */
const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}

/** Change user status */
const handleStatusChange = async (row: UserApi.UserVO) => {
  try {
    // Confirm status change
    const text = row.status === CommonStatusEnum.ENABLE ? 'Enable' : 'Disable'
    await message.confirm('Are you sure to "' + text + '" the user "' + row.username + '"?')
    // Send status change request
    await UserApi.updateUserStatus(row.id, row.status)
    // Refresh list
    await getList()
  } catch {
    // Restore switch state after canceling
    row.status =
      row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }
}

/** Export button action */
const exportLoading = ref(false)
const handleExport = async () => {
  try {
    // Confirm export
    await message.exportConfirm()
    // Send export request
    exportLoading.value = true
    const data = await UserApi.exportUser(queryParams)
    download.excel(data, 'user-data.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** Action dispatcher */
const handleCommand = (command: string, row: UserApi.UserVO) => {
  switch (command) {
    case 'handleDelete':
      handleDelete(row.id)
      break
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleRole':
      handleRole(row)
      break
    default:
      break
  }
}

/** Delete button action */
const handleDelete = async (id: number) => {
  try {
    // Confirm delete
    await message.delConfirm()
    // Send delete request
    await UserApi.deleteUser(id)
    message.success(t('common.delSuccess'))
    // Refresh list
    await getList()
  } catch {}
}

/** Batch delete button action */
const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (rows: UserApi.UserVO[]) => {
  checkedIds.value = rows.map((row) => row.id)
}

const handleDeleteBatch = async () => {
  try {
    // Confirm delete
    await message.delConfirm()
    // Send batch delete request
    await UserApi.deleteUserList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    // Refresh list
    await getList()
  } catch {}
}

/** Reset password */
const handleResetPwd = async (row: UserApi.UserVO) => {
  try {
    // Confirm reset
    const result = await message.prompt(
      'Enter new password for "' + row.username + '"',
      t('common.reminder')
    )
    const password = result.value
    // Send reset request
    await UserApi.resetUserPassword(row.id, password)
    message.success('Password changed successfully. New password: ' + password)
  } catch {}
}

/** Assign roles */
const assignRoleFormRef = ref()
const handleRole = (row: UserApi.UserVO) => {
  assignRoleFormRef.value.open(row)
}

/** Initialize */
onMounted(() => {
  getList()
})
</script>
