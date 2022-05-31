import {
  init,
  type ComposeOption,
  type EChartsType,
  type GridComponentOption,
  type LineSeriesOption,
  type TooltipComponentOption,
} from 'echarts'
import { computed, onUnmounted, reactive, readonly, ref, shallowRef, toRaw, watch, watchEffect, type Ref } from 'vue'

type Opts = ComposeOption<LineSeriesOption | GridComponentOption | TooltipComponentOption>

/**
 * 布局外边距
 */
export type LCTEdge = {
  top?: number
  left?: number
  right?: number
  bottom?: number
}

/**
 * 画布的宽高、单个个折线图的高度、单个折线图数据项的宽度
 */
export type LCTSize = {
  /** 画布的宽度 */
  width?: number
  /** 画布的高度 */
  height?: number
  /** 单个折线图数据项的宽度 */
  colWidth?: number
  /** 单个个折线图的高度 */
  rowHeight?: number
}

/**
 * 折线图数据集合
 */
export type LCTData = Record<string, number[]>

/**
 * 折线图表格的所有配置
 */
export type UseLineChartTableOpts = {
  size?: LCTSize
  data?: LCTData
  edge?: LCTEdge
  /** 单个折线图的 x 轴标签集合 */
  colLabel?: string[]
  /** 所有折线图的 y 轴标签集合，每项数据对应一个独立的折线图 y 轴 */
  rowLabel?: string[]
  rowPreviewLable?: string[]
}

/**
 * echarts 折线图每列的默认宽度
 */
export const LCT_COL_WIDTH = ref(50)

/**
 * echarts 折线图的默认高度
 */
export const LCT_ROW_HEIGHT = ref(50)

export function useLineChartTable(container: Ref<HTMLDivElement>, option: UseLineChartTableOpts = {}) {
  /**
   * 数据池/配置池
   */
  const config = reactive({
    size: {},
    data: {},
    edge: {},
    colLabel: [],
    rowLabel: [],
    ...option,
  })

  const rowLabel = computed(() => config.rowPreviewLable ?? config.rowLabel)
  const colLabel = computed(() => config.colLabel)

  /**
   * echarts 画布的宽高、单个个折线图的高度、单个折线图数据项的宽度
   */
  const size = reactive({} as Required<LCTSize>)

  /**
   * echarts 的配置项
   */
  const eopts = reactive<Opts>({
    tooltip: {
      show: true,
      trigger: 'axis',
      appendToBody: true,
      axisPointer: {
        type: 'shadow',
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
    },
  })

  // 计算 echarts 画布的宽高、单个个折线图的高度、单个折线图数据项的宽度
  watchEffect(() => {
    const { size: ets, edge } = config
    const { width, height, colWidth, rowHeight } = ets
    const { top = 2, left = 0, right = 0, bottom = 2 } = edge

    const cols = colLabel.value.length
    const rows = rowLabel.value.length

    if (rowHeight || !height) {
      size.rowHeight = rowHeight || LCT_ROW_HEIGHT.value
      size.height = size.rowHeight * rows + top + bottom
    } else {
      size.height = height
      size.rowHeight = (height - top - bottom) / rows
    }

    if (colWidth || !width) {
      size.colWidth = colWidth || LCT_COL_WIDTH.value
      size.width = size.colWidth * cols + left + right
    } else {
      size.width = width
      size.colWidth = (width - left - right) / cols
    }
  })

  // 生成 echarts 的 grid、xAxis、yAxis 配置项
  watchEffect(() => {
    const { top = 0, left = 0, right = 0 } = config.edge
    const label = toRaw(colLabel.value)

    const grid: Opts['grid'] = []
    const xAxis: Opts['xAxis'] = []

    rowLabel.value.forEach((_, index) => {
      grid.push({
        left: left,
        right: right,
        top: top + size.rowHeight * index,
        bottom: size.height - (top + size.rowHeight * (index + 1)),
      })

      xAxis.push({
        type: 'category',
        gridIndex: index,
        data: label,
        position: 'top',
        axisLabel: { show: false },
        axisTick: { show: false },
      })
    })

    eopts.grid = grid
    eopts.xAxis = xAxis
  })

  // 生成 echarts 的 series 配置项
  watchEffect(() => {
    const series: Opts['series'] = []
    const yAxis: Opts['yAxis'] = []

    rowLabel.value.forEach((label, index) => {
      const row = toRaw(config.data[label] ?? [])

      series.push({
        name: label,
        type: 'line',
        symbol: 'circle',
        symbolSize: 7,
        xAxisIndex: index,
        yAxisIndex: index,
        data: row,
        lineStyle: {
          type: 'dashed',
        },
        itemStyle: {
          color: '#999',
        },
        emphasis: {
          scale: false,
        },
      })

      yAxis.push({
        type: 'value',
        gridIndex: index,
        axisLabel: { show: false },
        ...computedIntervel(row),
      })
    })

    eopts.yAxis = yAxis
    eopts.series = series
  })

  /**
   * echarts 实例
   */
  const instance = shallowRef<EChartsType | null>(null)

  watch(container, (nv) => {
    // 销毁
    instance.value?.dispose()

    // 重建
    instance.value = nv ? init(nv, undefined, toRaw(size)) : null
    instance.value?.setOption(toRaw(eopts))
  })

  // 重置大小
  watch(size, () => {
    instance.value?.resize(toRaw(size))
  })

  // 重配置
  watch(eopts, () => {
    instance.value?.setOption(toRaw(eopts))
  })

  // 销毁
  onUnmounted(() => {
    instance.value?.dispose()
  })

  return { instance, config, eopts, size: readonly(size), colLabel, rowLabel }
}

/**
 * 计算该条数据的 yAxis 的 interval、max 值
 * @param row 折线图数据
 */
function computedIntervel(row: number[]) {
  if (!row.length) return

  const [maxNum] = [...row].sort((a, b) => b - a)
  const average = maxNum / 5
  const [integer, decimal] = String(average).split('.')

  let interval = average
  let proportion = 1

  if (Number(integer) > 0) {
    interval = Number(integer[0]) + 1
    proportion = Math.pow(10, integer.length - 1)
  } else {
    for (let i = 0; i < decimal.length; i++) {
      let num = Number(decimal[i])
      if (num) {
        interval = num + 1
        proportion = Math.pow(10, -i - 1)
        break
      }
    }
  }

  // 刚好处于节点最大值，直接封顶
  if ((interval - 1) * proportion * 5 == maxNum) interval--

  const max = interval * proportion * 5

  interval *= proportion

  return {
    max,
    interval,
  }
}
