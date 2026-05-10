<template>
  <div class="evaluation-panel p-20px">
    <el-page-header title="Back" @back="router.back()">
      <template #content>
        <span class="text-lg font-semibold">Decision Evaluation</span>
        <span class="ml-10px text-sm text-gray-400">Shadow-mode comparison of AI vs rule-based irrigation decisions</span>
      </template>
    </el-page-header>

    <el-alert
      class="mt-16px"
      title="Dry-Run Mode"
      type="info"
      description="Runs both rule-based and AI decision logic on every active field using current sensor + weather data. No irrigation plans are created. The 'Aligned' column tracks AI agreement with the deterministic rule baseline."
      show-icon
      :closable="false"
    />

    <el-card class="mt-16px" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-10px">
            <span class="font-semibold">AI vs Rule-Based Decision Comparison</span>
            <el-tag v-if="comparisonRows.length > 0" type="info" size="small">
              Agreement: {{ alignedCount }}/{{ totalCount }}
              ({{ totalCount > 0 ? Math.round(alignedCount / totalCount * 100) : 0 }}%)
            </el-tag>
            <el-tag v-if="!aiAvailable && comparisonRows.length > 0" type="warning" size="small">
              AI Unavailable (rule-based only)
            </el-tag>
          </div>
          <el-button
            type="primary"
            plain
            size="small"
            :loading="loading"
            @click="runComparison"
          >
            Run Comparison (Dry-Run)
          </el-button>
        </div>
      </template>

      <div v-if="comparisonRows.length === 0" class="text-center text-gray-400 py-30px">
        Click "Run Comparison" to compare AI vs rule-based decisions on all active fields (no plans created).
      </div>

      <el-table v-else :data="comparisonRows" border stripe size="small">
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
              <span :class="row.currentMoisture < row.moistureMin ? 'text-red-500 font-bold' : 'text-green-600'">
                {{ row.currentMoisture?.toFixed(1) }}%
              </span>
              <span class="text-gray-400"> / {{ row.moistureMin?.toFixed(1) }}%</span>
            </span>
            <span v-else class="text-gray-300">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Rain Tomorrow" prop="tomorrowRainfall" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.tomorrowRainfall != null ? row.tomorrowRainfall.toFixed(1) + ' mm' : '—' }}
          </template>
        </el-table-column>
        <el-table-column label="Rule Decision" min-width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="decisionTagType(row.ruleDecision)" size="small">{{ row.ruleDecision }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="AI Decision" min-width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="decisionTagType(row.aiDecision)" size="small">{{ row.aiDecision }}</el-tag>
            <span v-if="row.aiDurationMinutes" class="ml-4px text-xs text-gray-500">{{ row.aiDurationMinutes }}min</span>
          </template>
        </el-table-column>
        <el-table-column label="Aligned" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.aligned === true" color="#67c23a" :size="18"><CircleCheck /></el-icon>
            <el-icon v-else-if="row.aligned === false" color="#f56c6c" :size="18"><CircleClose /></el-icon>
            <span v-else class="text-gray-300">—</span>
          </template>
        </el-table-column>
        <el-table-column label="AI Reasoning" min-width="220">
          <template #default="{ row }">
            <el-tooltip :content="row.aiReason" placement="top" :show-after="300">
              <span class="text-xs text-gray-500 line-clamp-2 cursor-default">{{ row.aiReason || '—' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { EvaluationApi, type DecisionComparisonVO } from '@/api/agri/evaluation'

defineOptions({ name: 'AgriEvaluation' })

const router = useRouter()

const loading = ref(false)
const comparisonRows = ref<DecisionComparisonVO[]>([])

const alignedCount = computed(() =>
  comparisonRows.value.filter(r => r.aligned === true).length
)
const totalCount = computed(() =>
  comparisonRows.value.filter(r => r.aligned !== null && r.aligned !== undefined && r.ruleDecision !== 'NO_DATA').length
)
const aiAvailable = computed(() =>
  comparisonRows.value.some(r => r.aiAvailable)
)

type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'
const decisionTagType = (decision?: string): TagType | undefined => {
  switch (decision) {
    case 'IRRIGATE':     return 'primary'
    case 'SKIP':         return 'warning'
    case 'NO_ACTION':    return 'success'
    case 'NO_DATA':      return 'info'
    case 'UNAVAILABLE':  return undefined
    default:             return 'danger'
  }
}

const runComparison = async () => {
  loading.value = true
  try {
    comparisonRows.value = await EvaluationApi.compareDecision()
    const aligned = alignedCount.value
    const total = totalCount.value
    const pct = total > 0 ? Math.round(aligned / total * 100) : 0
    ElMessage.success(`AI alignment: ${aligned}/${total} (${pct}%)`)
  } catch (e: any) {
    ElMessage.error(e?.message ?? String(e))
  } finally {
    loading.value = false
  }
}
</script>
