import {
  useDictSelectRule,
  useEditorRule,
  useSelectRule,
  useUploadFileRule,
  useUploadImgRule,
  useUploadImgsRule,
  useIframeRule,
  useAreaSelectRule
} from './config'
import { Ref } from 'vue'
import { Menu } from '@/components/FormCreate/src/type'
import { apiSelectRule } from '@/components/FormCreate/src/config/selectRule'
import { generateUUID } from '@/utils'

/**
 * Form designer enhancement hook.
 * Adds:
 * - File upload
 * - Single image upload
 * - Multiple image upload
 * - Dict selector
 * - User selector
 * - Department selector
 * - Rich text
 */
export const useFormCreateDesigner = async (designer: Ref) => {
  const editorRule = useEditorRule()
  const uploadFileRule = useUploadFileRule()
  const uploadImgRule = useUploadImgRule()
  const uploadImgsRule = useUploadImgsRule()

  /**
   * Build form components.
   */
  const buildFormComponents = () => {
    // Remove built-in upload rules and use uploadFileRule, uploadImgRule, and uploadImgsRule instead.
    designer.value?.removeMenuItem('upload')
    // Remove the built-in rich text rule and use editorRule instead.
    designer.value?.removeMenuItem('fcEditor')
    const iframeRule = useIframeRule()
    const areaSelectRule = useAreaSelectRule()
    const components = [editorRule, uploadFileRule, uploadImgRule, uploadImgsRule, iframeRule, areaSelectRule]
    components.forEach((component) => {
      // Insert component rule.
      designer.value?.addComponent(component)
      // Insert drag button under the `main` category.
      designer.value?.appendMenuItem('main', {
        icon: component.icon,
        name: component.name,
        label: component.label
      })
    })
  }

  const userSelectRule = useSelectRule({
    name: 'UserSelect',
    label: 'User Selector',
    icon: 'icon-user-o',
    props: [
      {
        type: 'switch',
        field: 'defaultCurrentUser',
        title: 'Select current user by default',
        value: false
      }
    ]
  })
  const deptSelectRule = useSelectRule({
    name: 'DeptSelect',
    label: 'Department Selector',
    icon: 'icon-address-card-o',
    props: [
      {
        type: 'select',
        field: 'returnType',
        title: 'Return Type',
        value: 'id',
        options: [
          { label: 'Department ID', value: 'id' },
          { label: 'Department Name', value: 'name' }
        ]
      },
      {
        type: 'switch',
        field: 'defaultCurrentDept',
        title: 'Select current department by default',
        value: false
      }
    ]
  })
  const dictSelectRule = useDictSelectRule()
  const apiSelectRule0 = useSelectRule({
    name: 'ApiSelect',
    label: 'API Selector',
    icon: 'icon-server',
    props: [...apiSelectRule],
    event: ['click', 'change', 'visibleChange', 'clear', 'blur', 'focus']
  })

  /**
   * Build the system field menu.
   */
  const buildSystemMenu = () => {
    // Remove built-in selector components if custom replacements are enabled.
    // designer.value?.removeMenuItem('select')
    // designer.value?.removeMenuItem('radio')
    // designer.value?.removeMenuItem('checkbox')
    const components = [userSelectRule, deptSelectRule, dictSelectRule, apiSelectRule0]
    const menu: Menu = {
      name: 'system',
      title: 'System Fields',
      list: components.map((component) => {
        // Insert component rule.
        designer.value?.addComponent(component)
        // Insert drag button under the `system` category.
        return {
          icon: component.icon,
          name: component.name,
          label: component.label
        }
      })
    }
    designer.value?.addMenu(menu)
  }

  /**
   * Fix duplicate field IDs.
   * When a component is copied, automatically generate a new field ID for it.
   *
   * Related issue: https://gitee.com/yudaocode/yudao-ui-admin-vue3/issues/ICM22X
   */
  const fixDuplicateFields = () => {
    // Get all current rules.
    const rules = designer.value?.getRule() || []
    const fieldIds = new Set<string>()
    let hasChanges = false

    // Traverse all rules and fix duplicate field IDs.
    rules.forEach((rule: any) => {
      if (rule.field) {
        if (fieldIds.has(rule.field)) {
          // Generate a new ID when a duplicate is found.
          const oldField = rule.field
          const newField = generateUUID()
          console.log(`[FormCreate] Duplicate field ID detected: ${oldField}, updated to: ${newField}`)
          rule.field = newField
          hasChanges = true
        } else {
          fieldIds.add(rule.field)
        }
      }
    })

    // Update the designer if any duplicate fields were fixed.
    if (hasChanges) {
      designer.value?.setRule(rules)
    }

    return hasChanges
  }

  onMounted(async () => {
    await nextTick()
    buildFormComponents()
    buildSystemMenu()

    // Watch designer content changes and automatically fix duplicate field IDs.
    let isFixing = false // Prevent infinite loops.
    watch(
      () => designer.value?.getRule(),
      async () => {
        if (!isFixing) {
          isFixing = true
          await nextTick()
          fixDuplicateFields()
          isFixing = false
        }
      },
      { deep: true }
    )
  })
}
