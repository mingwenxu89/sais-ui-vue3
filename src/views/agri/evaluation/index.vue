<template>
  <div class="evaluation-panel p-20px">
    <div>
      <span class="text-lg font-semibold">Decision Evaluation</span>
      <span class="ml-10px text-sm text-gray-400">
        Shadow-mode comparison of AI vs rule-based irrigation decisions
      </span>
    </div>

    <el-card class="mt-16px" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-10px">
            <span class="font-semibold">AI vs Rule-Based Decision Comparison</span>
            <el-tag v-if="comparisonRows.length > 0" type="info" size="small">
              Agreement: {{ alignedCount }}/{{ totalCount }} ({{
                totalCount > 0 ? Math.round((alignedCount / totalCount) * 100) : 0
              }}%)
            </el-tag>
            <el-tag v-if="!aiAvailable && comparisonRows.length > 0" type="warning" size="small">
              AI Unavailable (rule-based only)
            </el-tag>
          </div>
          <el-button type="primary" plain size="small" :loading="runLoading" @click="runComparison">
            Run Comparison
          </el-button>
        </div>
      </template>

      <div
        v-if="comparisonRows.length === 0 && !tableLoading"
        class="text-center text-gray-400 py-30px"
      >
        Click "Run Comparison" to compare AI vs rule-based decisions and save the records.
      </div>

      <el-table v-else v-loading="tableLoading" :data="comparisonRows" border stripe size="small">
        <el-table-column
          label="Evaluated At"
          prop="evaluatedAt"
          :formatter="dateFormatter"
          min-width="160"
          align="center"
        />
        <el-table-column label="Field" prop="fieldName" min-width="110" />
        <el-table-column label="Crop / Stage" min-width="140">
          <template #default="{ row }">
            <div>{{ row.cropName || '—' }}</div>
            <div class="text-xs text-gray-400">{{ row.stageName || '—' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Moisture / Min" min-width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.currentMoisture != null">
              <span
                :class="
                  row.moistureMin != null && row.currentMoisture < row.moistureMin
                    ? 'text-red-500 font-bold'
                    : 'text-green-600'
                "
              >
                {{ row.currentMoisture?.toFixed(1) }}%
              </span>
              <span class="text-gray-400"> / {{ row.moistureMin?.toFixed(1) }}%</span>
            </span>
            <span v-else class="text-gray-300">—</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Rain Tomorrow"
          prop="tomorrowRainfall"
          min-width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ row.tomorrowRainfall != null ? row.tomorrowRainfall.toFixed(1) + ' mm' : '—' }}
          </template>
        </el-table-column>
        <el-table-column label="Rule Decision" min-width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="decisionTagType(row.ruleDecision)" size="small">{{
              row.ruleDecision
            }}</el-tag>
            <span v-if="row.ruleDurationMinutes" class="ml-4px text-xs text-gray-500"
              >{{ row.ruleDurationMinutes }}min</span
            >
          </template>
        </el-table-column>
        <el-table-column label="AI Decision" min-width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="decisionTagType(row.aiDecision)" size="small">{{
              row.aiDecision
            }}</el-tag>
            <span v-if="row.aiDurationMinutes" class="ml-4px text-xs text-gray-500"
              >{{ row.aiDurationMinutes }}min</span
            >
          </template>
        </el-table-column>
        <el-table-column label="Aligned" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.aligned === true" color="#67c23a" :size="18"
              ><CircleCheck
            /></el-icon>
            <el-icon v-else-if="row.aligned === false" color="#f56c6c" :size="18"
              ><CircleClose
            /></el-icon>
            <span v-else class="text-gray-300">—</span>
          </template>
        </el-table-column>
        <el-table-column label="AI Reasoning" min-width="220">
          <template #default="{ row }">
            <el-tooltip :content="row.aiReason" placement="top" :show-after="300">
              <span class="text-xs text-gray-500 line-clamp-2 cursor-default">{{
                row.aiReason || '—'
              }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        v-if="total > 0"
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="loadRecords"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { EvaluationApi, type DecisionComparisonVO } from '@/api/agri/evaluation'
import { dateFormatter } from '@/utils/formatTime'

defineOptions({ name: 'AgriEvaluation' })

const runLoading = ref(false)
const tableLoading = ref(false)
const comparisonRows = ref<DecisionComparisonVO[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10
})

const alignedCount = computed(() => comparisonRows.value.filter((r) => r.aligned === true).length)
const totalCount = computed(
  () =>
    comparisonRows.value.filter(
      (r) => r.aligned !== null && r.aligned !== undefined && r.ruleDecision !== 'NO_DATA'
    ).length
)
const aiAvailable = computed(() => comparisonRows.value.some((r) => r.aiAvailable))

type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'
const decisionTagType = (decision?: string): TagType | undefined => {
  switch (decision) {
    case 'IRRIGATE':
      return 'primary'
    case 'SKIP':
      return 'warning'
    case 'NO_ACTION':
      return 'success'
    case 'NO_DATA':
      return 'info'
    case 'UNAVAILABLE':
      return undefined
    default:
      return 'danger'
  }
}

const runComparison = async () => {
  runLoading.value = true
  try {
    const result = await EvaluationApi.compareDecision()
    comparisonRows.value = result
    total.value = Math.max(total.value, result.length)
    const aligned = alignedCount.value
    const comparableTotal = totalCount.value
    const pct = comparableTotal > 0 ? Math.round((aligned / comparableTotal) * 100) : 0
    ElMessage.success(
      `Saved ${result.length} evaluation record(s). AI alignment: ${aligned}/${comparableTotal} (${pct}%)`
    )
    queryParams.pageNo = 1
    await loadRecords()
  } catch (e: any) {
    ElMessage.error(e?.message ?? String(e))
  } finally {
    runLoading.value = false
  }
}

const loadRecords = async () => {
  tableLoading.value = true
  try {
    const data = await EvaluationApi.getRecordPage(queryParams)
    comparisonRows.value = data.list || []
    total.value = data.total || 0
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  loadRecords()
})
</script>
