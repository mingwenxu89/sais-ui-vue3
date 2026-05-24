<template>
  <Dialog v-model="dialogVisible" title="Import Users" width="400">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="importUrl + '?updateSupport=' + updateSupport"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx, .xls"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">Drop file here, or <em>click to upload</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            Update existing user data
          </div>
          <span>Only xls and xlsx files can be imported.</span>
          <el-link
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            type="primary"
            @click="importTemplate"
          >
            Download Template
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { getAccessToken, getTenantId } from '@/utils/auth'
import download from '@/utils/download'

defineOptions({ name: 'SystemUserImportForm' })

const message = useMessage() // Message popup

const dialogVisible = ref(false) // Whether the dialog is visible
const formLoading = ref(false) // Form loading state
const uploadRef = ref()
const importUrl =
  import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/system/user/import'
const uploadHeaders = ref() // Upload headers
const fileList = ref([]) // File list
const updateSupport = ref(0) // Update existing user data

/** Open dialog */
const open = () => {
  dialogVisible.value = true
  updateSupport.value = 0
  fileList.value = []
  resetForm()
}
defineExpose({ open }) // Expose open method for opening the dialog

/** Submit form */
const submitForm = async () => {
  if (fileList.value.length == 0) {
    message.error('Please upload a file')
    return
  }
  // Submit request
  uploadHeaders.value = {
    Authorization: 'Bearer ' + getAccessToken(),
    'tenant-id': getTenantId()
  }
  formLoading.value = true
  uploadRef.value!.submit()
}

/** File upload success */
const emits = defineEmits(['success'])
const submitFormSuccess = (response: any) => {
  if (response.code !== 0) {
    message.error(response.msg)
    resetForm()
    return
  }
  // Build message text
  const data = response.data
  let text = 'Upload success: ' + data.createUsernames.length + ';'
  for (let username of data.createUsernames) {
    text += '< ' + username + ' >'
  }
  text += 'Update success: ' + data.updateUsernames.length + ';'
  for (const username of data.updateUsernames) {
    text += '< ' + username + ' >'
  }
  text += 'Update failed: ' + Object.keys(data.failureUsernames).length + ';'
  for (const username in data.failureUsernames) {
    text += '< ' + username + ': ' + data.failureUsernames[username] + ' >'
  }
  message.alert(text)
  formLoading.value = false
  dialogVisible.value = false
  // Emit operation success event
  emits('success')
}

/** Upload error message */
const submitFormError = (): void => {
  message.error('Upload failed, please try again!')
  formLoading.value = false
}

/** Reset form */
const resetForm = async (): Promise<void> => {
  // Reset upload state and files
  formLoading.value = false
  await nextTick()
  uploadRef.value?.clearFiles()
}

/** File count exceeded message */
const handleExceed = (): void => {
  message.error('Only one file can be uploaded!')
}

/** Download template action */
const importTemplate = async () => {
  const res = await UserApi.importUserTemplate()
  download.excel(res, 'user-import-template.xls')
}
</script>
