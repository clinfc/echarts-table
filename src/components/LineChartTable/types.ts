import type { Ref } from 'vue'

/**
 * 折线图数据集合
 */
export type LChartData = Record<string, number[]>

/**
 * 布局外边距
 */
export type LChartEdge = {
  top?: number
  left?: number
  right?: number
  bottom?: number
}

/**
 * 画布的宽高、单个个折线图的高度、单个折线图数据项的宽度
 */
export type LChartSize = {
  /** 画布的宽度 */
  canvasWidth?: number
  /** 画布的高度 */
  canvasHeight?: number
  /** 单个折线图数据项的宽度 */
  lineChartColWidth?: number
  /** 单个个折线图的高度 */
  lineChartRowsHeight?: number
}

/**
 * 表头宽高
 */
export type LTheadSize = {
  /** x 轴表头高度 */
  xAxisLabelHeight?: number
  /** y 轴表头宽度 */
  yAxisLabelWidth?: number
}

/**
 * echarts 容器的最大宽高
 */
export type LViewSize = {
  /** echarts 容器的最大宽度 */
  viewWidth?: number
  /** echarts 容器的最大高度 */
  viewHeight?: number
}

export type LTableSize = {
  tableWidth?: number
  tableHeight?: number
}

export type LSize = LChartEdge & LChartSize & LTheadSize & LViewSize & LTableSize

/**
 * x轴/y轴 的标签
 */
export type LCahrtLabel = string[]

/**
 * 折线图表格的所有配置
 */
export type UseLineChartTableOpts = LSize & {
  data?: LChartData
  /** 单个折线图的 x 轴标签集合 */
  xAxisLabel?: LCahrtLabel
  /** 所有折线图的 y 轴标签集合，每项数据对应一个独立的折线图 y 轴 */
  yAxisLabel?: LCahrtLabel
  /** 需要被标记的列 */
  markAreaIndex?: number | null
}

/**
 * 直接从 config 搬数据到 size 的键，没有依赖
 */
export type UnRelyKey = keyof (LChartEdge & LTheadSize)

export type LChartScroll<T extends HTMLElement = HTMLDivElement> = {
  target: Ref<T>
  x?: boolean
  y?: boolean
}
