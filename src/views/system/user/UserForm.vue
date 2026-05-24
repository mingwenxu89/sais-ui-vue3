<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      class="user-form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="Nickname" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="Enter Nickname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Department" prop="deptId">
            <el-tree-select
              v-model="formData.deptId"
              :data="deptList"
              :props="defaultProps"
              check-strictly
              node-key="id"
              placeholder="Select Department"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Phone" prop="mobile">
            <el-input v-model="formData.mobile" maxlength="11" placeholder="Enter phone number" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Email" prop="email">
            <el-input v-model="formData.email" maxlength="50" placeholder="Enter email" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item v-if="formData.id === undefined" label="Username" prop="username">
            <el-input v-model="formData.username" placeholder="Enter username" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="formData.id === undefined" label="Password" prop="password">
            <el-input
              v-model="formData.password"
              placeholder="Enter password"
              show-password
              type="password"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Gender">
            <el-select v-model="formData.sex" placeholder="Select">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Position">
            <el-select v-model="formData.postIds" multiple placeholder="Select">
              <el-option
                v-for="item in postList"
                :key="item.id"
                :label="item.name"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Remark">
            <el-input v-model="formData.remark" placeholder="Enter remark" type="textarea" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { defaultProps, handleTree } from '@/utils/tree'
import * as PostApi from '@/api/system/post'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { FormRules } from 'element-plus'

defineOptions({ name: 'SystemUserForm' })

const { t } = useI18n() // I18n
const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const dialogTitle = ref('') // Dialog title
const formLoading = ref(false) // Form loading state: 1) loading update data; 2) disabling submit button
const formType = ref('') // Form type: create - add; update - edit
const formData = ref({
  nickname: '',
  deptId: '',
  mobile: '',
  email: '',
  id: undefined,
  username: '',
  password: '',
  sex: undefined,
  postIds: [],
  remark: '',
  status: CommonStatusEnum.ENABLE,
  roleIds: []
})
const formRules = reactive<FormRules>({
  username: [{ required: true, message: 'Username cannot be empty', trigger: 'blur' }],
  nickname: [{ required: true, message: 'Nickname cannot be empty', trigger: 'blur' }],
  password: [{ required: true, message: 'Password cannot be empty', trigger: 'blur' }],
  email: [
    {
      type: 'email',
      message: 'Please enter a valid email address',
      trigger: ['blur', 'change']
    }
  ],
  mobile: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: 'Please enter a valid phone number',
      trigger: 'blur'
    }
  ]
})
const formRef = ref() // Form ref
const deptList = ref<Tree[]>([]) // Tree structure
const postList = ref([] as PostApi.PostVO[]) // Position list

/** Open dialog */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // Set data when editing
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserApi.getUser(id)
    } finally {
      formLoading.value = false
    }
  }
  // Load department tree
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  // Load position list
  postList.value = await PostApi.getSimplePostList()
}
defineExpose({ open }) // Expose open method for opening the dialog

/** Submit form */
const emit = defineEmits(['success']) // Define success event for operation success callback
const submitForm = async () => {
  // Validate form
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // Submit request
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserApi.UserVO
    if (formType.value === 'create') {
      await UserApi.createUser(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserApi.updateUser(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // Emit operation success event
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** Reset form */
const resetForm = () => {
  formData.value = {
    nickname: '',
    deptId: '',
    mobile: '',
    email: '',
    id: undefined,
    username: '',
    password: '',
    sex: undefined,
    postIds: [],
    remark: '',
    status: CommonStatusEnum.ENABLE,
    roleIds: []
  }
  formRef.value?.resetFields()
}
</script>
<style scoped>
.user-form :deep(.el-input),
.user-form :deep(.el-select),
.user-form :deep(.el-tree-select),
.user-form :deep(.el-textarea) {
  width: 80%;
}
</style>
