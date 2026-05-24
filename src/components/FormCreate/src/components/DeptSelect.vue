<!-- Department selector - tree structure display -->
<template>
  <el-tree-select
    v-model="selectedValue"
    class="w-1/1"
    :data="deptTree"
    :props="treeProps"
    :multiple="multiple"
    :disabled="disabled"
    :placeholder="placeholder || 'Select department'"
    :check-strictly="true"
    :filterable="true"
    :filter-node-method="filterNode"
    :clearable="true"
    :render-after-expand="false"
    node-key="id"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
import { handleTree } from '@/utils/tree'
import { getSimpleDeptList, type DeptVO } from '@/api/system/dept'
import { useUserStoreWithOut } from '@/store/modules/user'

defineOptions({ name: 'DeptSelect' })

// Accept parent component parameters
interface Props {
  modelValue?: number | string | number[] | string[]
  multiple?: boolean
  returnType?: 'id' | 'name'
  defaultCurrentDept?: boolean
  disabled?: boolean
  placeholder?: string
  formCreateInject?: any
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  returnType: 'id',
  defaultCurrentDept: false,
  disabled: false,
  placeholder: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string | number[] | string[] | undefined): void
}>()

// Tree selector configuration
const treeProps = {
  label: 'name',
  value: 'id',
  children: 'children'
}

// Department tree data
const deptTree = ref<any[]>([])
// Original department list, used to find names when returnType='name'
const deptList = ref<DeptVO[]>([])
// Current selected value
const selectedValue = ref<number | string | number[] | string[] | undefined>()

// Load department tree data
const loadDeptTree = async () => {
  try {
    const data = await getSimpleDeptList()
    deptList.value = data
    deptTree.value = handleTree(data)
  } catch (error) {
    console.warn('Failed to load department data:', error)
    deptTree.value = []
  }
}

// Get department name by ID
const getDeptNameById = (id: number): string | undefined => {
  const dept = deptList.value.find((item) => item.id === id)
  return dept?.name
}

// Get department ID by name
const getDeptIdByName = (name: string): number | undefined => {
  const dept = deptList.value.find((item) => item.name === name)
  return dept?.id
}

// Handle selected value change
const handleChange = (value: number | number[] | undefined) => {
  if (value === undefined || value === null) {
    emit('update:modelValue', props.multiple ? [] : undefined)
    return
  }

  // Determine the emitted value type based on returnType
  if (props.returnType === 'name') {
    if (props.multiple && Array.isArray(value)) {
      const names = value.map((id) => getDeptNameById(id)).filter(Boolean) as string[]
      emit('update:modelValue', names)
    } else if (!props.multiple && typeof value === 'number') {
      const name = getDeptNameById(value)
      emit('update:modelValue', name)
    }
  } else {
    emit('update:modelValue', value)
  }
}

// Tree node filter method that supports search
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.includes(value)
}

// Watch modelValue changes and sync them to the internal selected value
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue === undefined || newValue === null) {
      selectedValue.value = props.multiple ? [] : undefined
      return
    }

    // Convert names to IDs for tree selector display when returnType is 'name'
    if (props.returnType === 'name') {
      if (props.multiple && Array.isArray(newValue)) {
        const ids = (newValue as string[])
          .map((name) => getDeptIdByName(name))
          .filter(Boolean) as number[]
        selectedValue.value = ids
      } else if (!props.multiple && typeof newValue === 'string') {
        const id = getDeptIdByName(newValue)
        selectedValue.value = id
      }
    } else {
      selectedValue.value = newValue as number | number[]
    }
  },
  { immediate: true }
)

// Check whether a valid preset value exists
const hasValidPresetValue = (): boolean => {
  const value = props.modelValue
  if (value === undefined || value === null || value === '') {
    return false
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  return true
}

// Set the default value to the current user's department
const setDefaultValue = () => {
  console.log('[DeptSelect] setDefaultValue called, defaultCurrentDept:', props.defaultCurrentDept)
  
  // Only process when defaultCurrentDept is true
  if (!props.defaultCurrentDept) {
    console.log('[DeptSelect] defaultCurrentDept is false, skip')
    return
  }
  
  // Preset values take precedence over the current department default
  if (hasValidPresetValue()) {
    console.log('[DeptSelect] has preset value, skip:', props.modelValue)
    return
  }
  
  // Get the current user's department ID
  const userStore = useUserStoreWithOut()
  const user = userStore.getUser
  const deptId = user?.deptId
  
  console.log('[DeptSelect] current user:', user, 'deptId:', deptId)
  
  // Handle empty or zero deptId edge cases
  if (!deptId || deptId === 0) {
    console.log('[DeptSelect] deptId is invalid, skip')
    return
  }
  
  // Determine the default value format based on multi-select mode
  const defaultValue = props.multiple ? [deptId] : deptId
  console.log('[DeptSelect] setting default value:', defaultValue)
  emit('update:modelValue', defaultValue)
}

// Load data and set the default value when the component mounts
onMounted(async () => {
  await loadDeptTree()
  // Set the default value after data has loaded
  setDefaultValue()
})
</script>
