import request from '@/config/axios'
import { isEmpty } from '@/utils/is'
import { ApiSelectProps } from '@/components/FormCreate/src/type'
import { jsonParse } from '@/utils'
import { useUserStoreWithOut } from '@/store/modules/user'

export const useApiSelect = (option: ApiSelectProps) => {
  return defineComponent({
    name: option.name,
    props: {
      // Option label.
      labelField: {
        type: String,
        default: () => option.labelField ?? 'label'
      },
      // Option value.
      valueField: {
        type: String,
        default: () => option.valueField ?? 'value'
      },
      // API endpoint.
      url: {
        type: String,
        default: () => option.url ?? ''
      },
      // Request method.
      method: {
        type: String,
        default: 'GET'
      },
      // Option parser function.
      parseFunc: {
        type: String,
        default: ''
      },
      // Request parameters.
      data: {
        type: String,
        default: ''
      },
      // Selector type: select dropdown, checkbox multi-select, radio single-select.
      selectType: {
        type: String,
        default: 'select'
      },
      // Whether multiple selection is enabled.
      multiple: {
        type: Boolean,
        default: false
      },
      // Whether remote search is enabled.
      remote: {
        type: Boolean,
        default: false
      },
      // Parameter used during remote search.
      remoteField: {
        type: String,
        default: 'label'
      },
      // Return value type for department selectors and similar components: id returns ID, name returns name.
      returnType: {
        type: String,
        default: 'id'
      },
      // Whether to select the current user by default. Only used by UserSelect.
      defaultCurrentUser: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { emit }) {
      const attrs = useAttrs()
      const options = ref<any[]>([]) // Dropdown data.
      const loading = ref(false) // Whether data is being fetched remotely.
      const queryParam = ref<any>() // Current input value.

      // Check whether a valid preset value exists.
      const hasValidPresetValue = (): boolean => {
        const value = attrs.modelValue
        if (value === undefined || value === null || value === '') {
          return false
        }
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return true
      }

      // Set the current user as default only when defaultCurrentUser is true and no preset value exists.
      const setDefaultCurrentUser = () => {
        // Only process when the component is UserSelect and defaultCurrentUser is true.
        if (option.name !== 'UserSelect' || !props.defaultCurrentUser) {
          return
        }
        // Preset values take precedence over the current user default.
        if (hasValidPresetValue()) {
          return
        }

        // Get the current user ID.
        const userStore = useUserStoreWithOut()
        const user = userStore.getUser
        const currentUserId = user?.id
        if (currentUserId) {
          // Set the default value based on multi-select or single-select mode.
          const defaultValue = props.multiple ? [currentUserId] : currentUserId
          emit('update:modelValue', defaultValue)
        }
      }

      const getOptions = async () => {
        options.value = []
        // API selector.
        if (isEmpty(props.url)) {
          return
        }

        switch (props.method) {
          case 'GET':
            let url: string = props.url
            if (props.remote) {
              if (queryParam.value != undefined) {
                if (url.includes('?')) {
                  url = `${url}&${props.remoteField}=${queryParam.value}`
                } else {
                  url = `${url}?${props.remoteField}=${queryParam.value}`
                }
              }
            }
            parseOptions(await request.get({ url: url }))
            break
          case 'POST':
            const data: any = jsonParse(props.data)
            if (props.remote) {
              data[props.remoteField] = queryParam.value
            }
            parseOptions(await request.post({ url: props.url, data: data }))
            break
        }
      }

      function parseOptions(data: any) {
        // Case 1: Prefer a custom parser when one is configured.
        if (!isEmpty(props.parseFunc)) {
          options.value = parseFunc()?.(data)
          return
        }
        // Case 2: The response is a list.
        if (Array.isArray(data)) {
          parseOptions0(data)
          return
        }
        // Case 3: The response is paginated data. Try reading list.
        data = data.list
        if (!!data && Array.isArray(data)) {
          parseOptions0(data)
          return
        }
        // Case 4: The response is not a standard yudao-vue-pro response.
        console.warn(
          `API [${props.url}] response is not a standard yudao-vue-pro response. Consider using a custom parser.`
        )
      }

      function parseOptions0(data: any[]) {
        if (Array.isArray(data)) {
          options.value = data.map((item: any) => {
            const label = parseExpression(item, props.labelField)
            let value = parseExpression(item, props.valueField)

            // Determine the return value based on returnType.
            // When returnType is set to 'name', return the label as the value.
            if (props.returnType === 'name') {
              value = label
            }

            return {
              label: label,
              value: value
            }
          })
          return
        }
        console.warn(`API [${props.url}] response is not an array`)
      }

      function parseFunc() {
        let parse: any = null
        if (!!props.parseFunc) {
          // Parse string function.
          parse = new Function(`return ${props.parseFunc}`)()
        }
        return parse
      }

      function parseExpression(data: any, template: string) {
        // Check whether an expression is used.
        if (template.indexOf('${') === -1) {
          return data[template]
        }
        // Match ${...} in the template string.
        const pattern = /\$\{([^}]*)}/g
        // Use replace with the regular expression and callback to perform replacement.
        return template.replace(pattern, (_, expr) => {
          // expr is the expression inside ${}. Read the matching value from data.
          const result = data[expr.trim()] // Trim whitespace in case the property name contains spaces.
          if (!result) {
            console.warn(
              `API selector option template [${template}][${expr.trim()}] failed to parse value. Result: [${result}]. Check whether the property exists in the API response. Ignore this warning if it exists.`
            )
          }
          return result
        })
      }

      const remoteMethod = async (query: any) => {
        if (!query) {
          return
        }
        loading.value = true
        try {
          queryParam.value = query
          await getOptions()
        } finally {
          loading.value = false
        }
      }

      onMounted(async () => {
        await getOptions()
        // Set the current user as default after data has loaded.
        setDefaultCurrentUser()
      })

      const buildSelect = () => {
        if (props.multiple) {
          // Keep this explicit multiple prop to avoid multiple-selection issues.
          return (
            <el-select
              class="w-1/1"
              multiple
              loading={loading.value}
              {...attrs}
              remote={props.remote}
              {...(props.remote && { remoteMethod: remoteMethod })}
            >
              {options.value.map((item, index) => (
                <el-option key={index} label={item.label} value={item.value} />
              ))}
            </el-select>
          )
        }
        return (
          <el-select
            class="w-1/1"
            loading={loading.value}
            {...attrs}
            remote={props.remote}
            {...(props.remote && { remoteMethod: remoteMethod })}
          >
            {options.value.map((item, index) => (
              <el-option key={index} label={item.label} value={item.value} />
            ))}
          </el-select>
        )
      }
      const buildCheckbox = () => {
        if (isEmpty(options.value)) {
          options.value = [
            { label: 'Option 1', value: 'Option 1' },
            { label: 'Option 2', value: 'Option 2' }
          ]
        }
        return (
          <el-checkbox-group class="w-1/1" {...attrs}>
            {options.value.map((item, index) => (
              <el-checkbox key={index} label={item.label} value={item.value} />
            ))}
          </el-checkbox-group>
        )
      }
      const buildRadio = () => {
        if (isEmpty(options.value)) {
          options.value = [
            { label: 'Option 1', value: 'Option 1' },
            { label: 'Option 2', value: 'Option 2' }
          ]
        }
        return (
          <el-radio-group class="w-1/1" {...attrs}>
            {options.value.map((item, index) => (
              <el-radio key={index} value={item.value}>
                {item.label}
              </el-radio>
            ))}
          </el-radio-group>
        )
      }
      return () => (
        <>
          {props.selectType === 'select'
            ? buildSelect()
            : props.selectType === 'radio'
              ? buildRadio()
              : props.selectType === 'checkbox'
                ? buildCheckbox()
                : buildSelect()}
        </>
      )
    }
  })
}
