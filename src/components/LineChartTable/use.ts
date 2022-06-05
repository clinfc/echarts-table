import { useEventListener } from '@vueuse/core'
import { init, type EChartsType } from 'echarts'
import {
  computed,
  isRef,
  onUnmounted,
  reactive,
  readonly,
  ref,
  shallowRef,
  toRaw,
  unref,
  watch,
  watchEffect,
  type Ref,
} from 'vue'
import type { LChartEdge, LSize, Opts, UnRelyKey, UseLineChartTableOpts } from './types'
import { computedIntervel, formatterContent } from './utils'

export const LCT_DEFAULT = reactive({
  lineChartColWidth: 50,
  lineChartRowsHeight: 60,
  chartWidth: 500,
  chartHeight: 500,
})

const UN_RELY_KEY: UnRelyKey[] = ['top', 'left', 'right', 'bottom', 'xAxisLabelHeight', 'yAxisLabelWidth']

export function useLineChartTable(container: Ref<HTMLDivElement>, option: UseLineChartTableOpts = {}) {
  /**
   * 数据池/配置池
   */
  const config = reactive<Required<UseLineChartTableOpts>>({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    lineChartColWidth: 0,
    lineChartRowsHeight: 0,
    xAxisLabelHeight: 0,
    yAxisLabelWidth: 0,
    tableWidth: 0,
    tableHeight: 0,
    data: {},
    xAxisLabel: [],
    yAxisLabel: [],
    viewWidth: 0,
    viewHeight: 0,
    markAreaIndex: null,
    ...option,
  })

  /**
   * echarts 画布的宽高、单个个折线图的高度、单个折线图数据项的宽度
   */
  const size = reactive({} as Required<LSize>)

  const chartSize = computed(() => {
    return {
      width: size.canvasWidth,
      height: size.canvasHeight,
    }
  })

  /**
   * echarts 的配置项
   */
  const eopts = reactive<Opts>({
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      alwaysShowContent: true,
      formatter: formatterContent,
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
    },
  })

  // 数据同步
  UN_RELY_KEY.forEach((key) => {
    watch(
      () => config[key],
      (value) => {
        size[key] = value
      },
      { immediate: true }
    )
  })

  // 计算 echarts 画布的高度、单个个折线图的高度
  watchEffect(() => {
    const { top, bottom, canvasHeight, lineChartRowsHeight } = config

    const rows = config.yAxisLabel.length

    if (lineChartRowsHeight || !canvasHeight) {
      size.lineChartRowsHeight = lineChartRowsHeight || LCT_DEFAULT.lineChartRowsHeight
      size.canvasHeight = size.lineChartRowsHeight * rows + top + bottom
    } else {
      size.canvasHeight = canvasHeight
      size.lineChartRowsHeight = (canvasHeight - top - bottom) / rows
    }
  })

  // 计算 echarts 画布的宽度、单个折线图数据项的宽度
  watchEffect(() => {
    const { left, right, canvasWidth, lineChartColWidth } = config

    const cols = config.xAxisLabel.length

    if (lineChartColWidth || !canvasWidth) {
      size.lineChartColWidth = lineChartColWidth || LCT_DEFAULT.lineChartColWidth
      size.canvasWidth = size.lineChartColWidth * cols + left + right
    } else {
      size.canvasWidth = canvasWidth
      size.lineChartColWidth = (canvasWidth - left - right) / cols
    }
  })

  // 计算整个表格的宽度、图标容器的宽度
  watchEffect(() => {
    const { yAxisLabelWidth, viewWidth, tableWidth } = config

    if (tableWidth > 0) {
      size.viewWidth = tableWidth - yAxisLabelWidth
      size.tableWidth = tableWidth
    } else if (viewWidth > 0) {
      size.viewWidth = viewWidth
      size.tableWidth = viewWidth + yAxisLabelWidth
    }
  })

  // 计算整个表格的高度、图标容器的高度
  watchEffect(() => {
    const { xAxisLabelHeight, viewHeight, tableHeight } = config

    if (tableHeight > 0) {
      size.viewHeight = tableHeight - xAxisLabelHeight
      size.tableHeight = tableHeight
    } else if (viewHeight > 0) {
      size.viewHeight = viewHeight
      size.tableHeight = viewHeight + xAxisLabelHeight
    }
  })

  // 生成 echarts 的 grid、xAxis 配置项
  watchEffect(() => {
    const { top, left, right } = size
    const { xAxisLabel, yAxisLabel } = config

    const label = toRaw(xAxisLabel)

    const grid: Opts['grid'] = []
    const xAxis: Opts['xAxis'] = []

    yAxisLabel.forEach((_, index) => {
      grid.push({
        left: left,
        right: right,
        top: top + size.lineChartRowsHeight * index,
        bottom: size.canvasHeight - (top + size.lineChartRowsHeight * (index + 1)),
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

  // 生成 echarts 的 series、yAxis 配置项
  watchEffect(() => {
    const series: Opts['series'] = []
    const yAxis: Opts['yAxis'] = []

    const { data, yAxisLabel, xAxisLabel, markAreaIndex } = config

    const markArea: Opts['series'] = {}
    if (markAreaIndex && markAreaIndex >= 0) {
      markArea.markArea = {
        emphasis: { disabled: true },
        itemStyle: {
          color: '#00000005',
        },
        data: [[{ x: size.lineChartColWidth * markAreaIndex }, { x: size.lineChartColWidth * (markAreaIndex + 1) }]],
      }
    }

    const empty = Array(xAxisLabel.length).fill(null)

    yAxisLabel.forEach((label, index) => {
      const row = toRaw(data[label]) ?? empty

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
        ...markArea,
      })

      yAxis.push({
        type: 'value',
        gridIndex: index,
        axisLabel: { show: false },
        ...computedIntervel(row),
      })
    })

    eopts.series = series
    eopts.yAxis = yAxis
  })

  /**
   * echarts 实例
   */
  const instance = shallowRef<EChartsType | null>(null)

  watch(container, (nv) => {
    // 销毁
    instance.value?.dispose()

    // 重建
    if (nv) {
      instance.value = init(nv, undefined, toRaw(chartSize.value))
      // debugger
      instance.value.setOption(toRaw(eopts))
    } else {
      instance.value = null
    }
  })

  // 重置大小
  watch(chartSize, () => {
    instance.value?.resize(toRaw(chartSize.value))
  })

  // 重配置
  watch(eopts, () => {
    instance.value?.setOption(toRaw(eopts))
  })

  // 销毁
  onUnmounted(() => {
    instance.value?.dispose()
  })

  // @ts-ignore
  window.size = size

  return { instance, config, eopts, size: readonly(size) }
}

/**
 * scroll 监听
 * @param target 进行滚动监听的节点
 * @param size useLineChartTable 返回的 size
 */
export function useLChartScroll<T extends HTMLElement>(target: Ref<T>, size: Required<LSize>) {
  const x = ref(0)
  const y = ref(0)

  const { across, vertical } = useScrollbarWidth(target)

  watchEffect(() => {
    target.value?.scrollTo({
      left: x.value,
      top: y.value,
    })
  })

  useEventListener(target, 'scroll', () => {
    const el = unref(target)

    x.value = el.scrollLeft
    y.value = el.scrollTop

    // console.log({
    //   left: x.value,
    //   top: y.value,
    // })
  })

  /**
   * 手动设置滚动位置
   * @param offset
   */
  function scrollTo(offset: LChartEdge) {
    const { top, left, right, bottom } = offset

    const h = size.canvasHeight - (size.viewHeight - across.value)

    if (typeof top === 'number') {
      y.value = top > h ? h : top
    } else if (typeof bottom === 'number') {
      const value = h - bottom
      y.value = value > 0 ? (value > h ? h : value) : 0
    }

    const w = size.canvasWidth - (size.viewWidth - vertical.value)

    if (typeof left === 'number') {
      x.value = left > w ? w : left
    } else if (typeof right === 'number') {
      const value = w - right
      x.value = value > 0 ? (value > w ? w : value) : 0
    }

    // console.log({ w, h })
  }

  return { x, y, scrollTo }
}

/**
 * 计算 scrollbar 的宽度
 * @param root 在指定节点下计算
 */
function useScrollbarWidth<T extends HTMLElement>(root: Ref<T> | T = document.body as T) {
  /**
   * 横向滚动条宽度/底部滚动条宽度
   */
  const across = ref(0)

  /**
   * 纵向滚动条宽度/右侧滚动条宽度
   */
  const vertical = ref(0)

  /**
   * 计算滚动条的宽度和高度
   * @param parent 根节点
   */
  function compute(parent: T) {
    if (!parent) return

    const el = document.createElement('div')

    el.setAttribute(
      'style',
      `width: 50px;height: 50px;overflow: scroll;border: 0;padding: 0;position: absolute;opacity: 0;z-index: -1;`
    )

    el.innerHTML = `<div style="width: 100px;height: 100px"></div>`

    parent.appendChild(el)

    across.value = el.offsetHeight - el.clientHeight
    vertical.value = el.offsetWidth - el.clientWidth

    parent.removeChild(el)
  }

  isRef(root) ? watch(root, compute, { immediate: true }) : compute(root)

  return { across, vertical }
}
