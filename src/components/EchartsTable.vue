<template>
  <div ref="elRef"></div>
</template>

<script lang="ts">
  import {
    defineComponent,
    onMounted,
    reactive,
    ref,
    shallowRef,
    toRaw,
    watchEffect,
    type PropType,
    type Ref,
  } from 'vue'

  import {
    init,
    type ComposeOption,
    type EChartsType,
    type GridComponentOption,
    type LineSeriesOption,
    type TooltipComponentOption,
  } from 'echarts'

  type Opts = ComposeOption<LineSeriesOption | GridComponentOption | TooltipComponentOption>

  const BASE = {
    top: 70,
    left: 50,
    right: 10,
    bottom: 70,
  }

  export default defineComponent({
    name: 'EchartsTable',
    props: {
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
      rowHeight: {
        type: Number,
      },
      colWidth: {
        type: Number,
      },
      data: {
        type: Array as PropType<Record<string, string | number>[]>,
        required: true,
      },
      labelKeys: {
        type: Array as PropType<string[]>,
        required: true,
      },
    },
    setup(props) {
      const elRef = ref<any>(null) as Ref<HTMLDivElement>

      const inst = shallowRef<EChartsType | null>()

      const size = reactive({
        width: 0,
        height: 0,
        rowHeight: 0,
        colWidth: 0,
      })

      const opts = reactive<Opts>({
        tooltip: {
          show: true,
          trigger: 'axis',
          appendToBody: true,
          formatter(params) {
            return params.map((item) => `${item.seriesName} - ${item.value}`).join('<br/>')
          },
        },
        axisPointer: {
          type: 'line',
          link: [{ xAxisIndex: 'all' }],
        },
      })

      watchEffect(() => {
        const {
          width,
          height,
          rowHeight,
          colWidth,
          labelKeys: [labelKey, ...dataKeys],
          data,
        } = props

        if (rowHeight) {
          size.rowHeight = rowHeight
          size.height = rowHeight * data.length + BASE.top + BASE.bottom
        } else if (height) {
          size.height = height
          size.rowHeight = (height - BASE.top - BASE.bottom) / data.length
        } else {
          size.height = 0
          size.rowHeight = 0
        }

        if (colWidth) {
          size.colWidth = colWidth
          size.width = colWidth * dataKeys.length + BASE.left + BASE.right
        } else if (width) {
          size.width = width
          size.colWidth = (width - BASE.left - BASE.right) / dataKeys.length
        } else {
          size.width = 0
          size.colWidth = 0
        }

        const grid: Opts['grid'] = []
        const xAxis: Opts['xAxis'] = []
        const yAxis: Opts['yAxis'] = []
        const series: Opts['series'] = []

        data.forEach((row, index) => {
          grid.push({
            left: BASE.left,
            right: BASE.right,
            top: BASE.top + size.rowHeight * index,
            bottom: size.height - (BASE.top + size.rowHeight * (index + 1)),
          })

          xAxis.push({
            type: 'category',
            gridIndex: index,
            data: dataKeys,
            position: 'top',
            axisLabel: { show: !index },
            axisTick: { show: false },
          })

          yAxis.push({
            type: 'value',
            gridIndex: index,
            axisLabel: {
              formatter(value, index) {
                return !index || index == 5 ? '' : value
              },
            },
          })

          series.push({
            name: row[labelKey],
            type: 'line',
            xAxisIndex: index,
            yAxisIndex: index,
            data: dataKeys.map((k) => row[k]),
            lineStyle: {
              type: 'dashed',
            },
          })
        })

        opts.grid = grid
        opts.xAxis = xAxis
        opts.yAxis = yAxis
        opts.series = series

        if (inst.value) inst.value.setOption(toRaw(opts))
      })

      onMounted(() => {
        inst.value = init(elRef.value, undefined, size)
        inst.value.setOption(toRaw(opts))
      })

      return { elRef, opts, size }
    },
  })
</script>
