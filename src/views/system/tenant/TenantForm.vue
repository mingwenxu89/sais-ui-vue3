<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="Tenant Name" prop="name">
        <el-input v-model="formData.name" placeholder="Enter Tenant Name" />
      </el-form-item>
      <el-form-item label="Contact" prop="contactName">
        <el-input v-model="formData.contactName" placeholder="Enter Contact" />
      </el-form-item>
      <el-form-item label="Phone" prop="contactMobile">
        <el-input v-model="formData.contactMobile" placeholder="Enter Phone" />
      </el-form-item>
      <el-form-item v-if="formData.id === undefined" label="Username" prop="username">
        <el-input v-model="formData.username" placeholder="Enter Username" />
      </el-form-item>
      <el-form-item v-if="formData.id === undefined" label="Password" prop="password">
        <el-input
          v-model="formData.password"
          placeholder="Enter Password"
          show-password
          type="password"
        />
      </el-form-item>
      <el-form-item label="Expiry Time" prop="expireTime">
        <el-date-picker
          v-model="formData.expireTime"
          clearable
          placeholder="Select Expiry Time"
          type="date"
          value-format="x"
        />
      </el-form-item>
      <el-form-item label="Domain" prop="websites">
        <el-input-tag
          v-model="formData.websites"
          placeholder="Enter domain, press Enter to add"
          class="w-full"
        />
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
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">OK</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as TenantApi from '@/api/system/tenant'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'SystemTenantForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  packageId: undefined,
  contactName: undefined,
  contactMobile: undefined,

  expireTime: undefined,
  websites: [],
  status: CommonStatusEnum.ENABLE,
  // 新增专属
  username: undefined,
  password: undefined
})
const formRules = reactive({
  name: [{ required: true, message: 'Tenant Name cannot be empty', trigger: 'blur' }],
  contactName: [{ required: true, message: 'Contact cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }],
  expireTime: [{ required: true, message: 'Expiry Time cannot be empty', trigger: 'blur' }],
  username: [{ required: true, message: 'Username cannot be empty', trigger: 'blur' }],
  password: [{ required: true, message: 'Password cannot be empty', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await TenantApi.getTenant(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as TenantApi.TenantVO
    if (formType.value === 'create') {
      await TenantApi.createTenant(data)
      message.success(t('common.createSuccess'))
    } else {
      await TenantApi.updateTenant(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    packageId: undefined,
    contactName: undefined,
    contactMobile: undefined,
  
    expireTime: undefined,
    websites: [],
    status: CommonStatusEnum.ENABLE,
    username: undefined,
    password: undefined
  }
  formRef.value?.resetFields()
}
</script>
