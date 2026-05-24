<script lang="tsx">
import { computed, defineComponent, PropType } from 'vue'
import { isHexColor } from '@/utils/color'
import { ElTag } from 'element-plus'
import { DictDataType, getDictOptions } from '@/utils/dict'
import { isArray, isBoolean, isNumber, isString } from '@/utils/is'

export default defineComponent({
  name: 'DictTag',
  props: {
    type: {
      type: String as PropType<string>,
      required: true
    },
    value: {
      type: [String, Number, Boolean, Array],
      required: true
    },
    // String separator. Only valid when props.value is a string.
    separator: {
      type: String as PropType<string>,
      default: ','
    },
    // Spacing between tags. Defaults to 5px, matching el-row gutter.
    gutter: {
      type: String as PropType<string>,
      default: '5px'
    }
  },
  setup(props) {
    const valueArr: any = computed(() => {
      // 1. Number and Boolean values.
      if (isNumber(props.value) || isBoolean(props.value)) {
        return [String(props.value)]
      }
      // 2. String values, split by the configured separator.
      else if (isString(props.value)) {
        return props.value.split(props.separator)
      }
      // 3. Array values.
      else if (isArray(props.value)) {
        return props.value.map(String)
      }
      return []
    })
    const renderDictTag = () => {
      if (!props.type) {
        return null
      }
      // Fix custom dict tags not rendering when the value is zero.
      if (props.value === undefined || props.value === null || props.value === '') {
        return null
      }
      const dictOptions = getDictOptions(props.type)

      return (
        <div
          class="dict-tag"
          style={{
            display: 'inline-flex',
            gap: props.gutter,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {dictOptions.map((dict: DictDataType) => {
            if (valueArr.value.includes(dict.value)) {
              if (dict.colorType + '' === 'primary' || dict.colorType + '' === 'default') {
                dict.colorType = ''
              }
              return (
                // Use white text for custom background colors to keep tag text readable.
                <ElTag
                  style={dict?.cssClass ? 'color: #fff' : ''}
                  type={dict?.colorType || null}
                  color={dict?.cssClass && isHexColor(dict?.cssClass) ? dict?.cssClass : ''}
                  disableTransitions={true}
                >
                  {dict?.label}
                </ElTag>
              )
            }
          })}
        </div>
      )
    }
    return () => renderDictTag()
  }
})
</script>
