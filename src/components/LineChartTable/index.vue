<template>
  <div class="lchart lchart-fullscreen">
    <div class="lchart-table" :style="cssVar">
      <div class="lchart-table__head">
        <div class="lchart-table__head--crossover">
          <div class="lchart-table__head--crossover-container"></div>
        </div>
        <div class="lchart-table__head--label">
          <div class="lchart-table__head--label-container" :style="xAxisLabelScroll">
            <template v-for="(label, index) in xAxisLabel" :key="label">
              <div
                class="lchart-table__head--label-container--content"
                :class="{ emphasis: config.markAreaIndex == index }"
              >
                {{ label }}
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="lchart-table__body">
        <div class="lchart-table__body-content" ref="scrollRef">
          <div class="lchart-table__body-content--label" :style="bodyLabelPadding">
            <template v-for="(label, index) in yAxisLabelView" :key="label">
              <div
                class="lchart-table__body-content--label-container"
                :class="{ 'emphasis': yAxisHoverIndex == index }"
              >
                {{ label }}
              </div>
            </template>
          </div>
          <div class="lchart-table__body-content--chart">
            <div class="lchart-table__body-content--chart-container" ref="echartsRef" :style="yAxisHoverEmphasis"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="lchart-tools"></div>
  </div>
</template>

<script lang="ts">
  import { useMouseInElement, useResizeObserver } from '@vueuse/core'
  import {
    computed,
    defineComponent,
    nextTick,
    onMounted,
    ref,
    toRaw,
    watch,
    watchEffect,
    type CSSProperties,
    type PropType,
    type Ref,
  } from 'vue'
  import type { LCahrtLabel, LChartData } from './types'
  import { useLChartScroll, useLineChartTable } from './use'

  export default defineComponent({
    name: 'EchartsTable',
    props: {
      /**
       * 数据集合
       */
      data: {
        type: Object as PropType<LChartData>,
        required: true,
      },
      /**
       * x 轴标签集合
       */
      xAxisLabel: {
        type: Array as PropType<LCahrtLabel>,
        required: true,
      },
      /**
       * y 轴标签集合
       */
      yAxisLabel: {
        type: Array as PropType<LCahrtLabel>,
        required: true,
      },
      /**
       * x 轴标签被高亮突出的列
       */
      xAxisLabelEmphasis: {
        type: [Number, String] as PropType<number | string>,
        default: -1,
      },
    },
    setup(props) {
      const scrollRef = ref<any>(null) as Ref<HTMLDivElement>
      const echartsRef = ref<any>(null) as Ref<HTMLDivElement>

      const yAxisLabelView = ref<LCahrtLabel>([])

      const { config, size } = useLineChartTable(echartsRef, {
        lineChartColWidth: 150,
        lineChartRowsHeight: 150,
        tableHeight: 800,
        xAxisLabelHeight: 60,
        yAxisLabelWidth: 150,
      })

      watch(
        () => props.data,
        (data) => {
          config.data = data
        },
        { immediate: true, deep: true }
      )

      watch(
        () => props.yAxisLabel,
        (label) => {
          config.yAxisLabel = [...label]
          yAxisLabelView.value = [...label]
        },
        { immediate: true, deep: true }
      )

      watchEffect(() => {
        const { xAxisLabel, xAxisLabelEmphasis } = props

        config.xAxisLabel = xAxisLabel
        config.markAreaIndex =
          typeof xAxisLabelEmphasis === 'number' ? xAxisLabelEmphasis : xAxisLabel.indexOf(xAxisLabelEmphasis)
      })

      useResizeObserver(scrollRef, () => {
        config.tableWidth = scrollRef.value.offsetWidth
      })

      /**
       * css 变量
       */
      const cssVar = computed(() => {
        return {
          '--lchart-head-label-width': `${size.lineChartColWidth}px`,
          '--lchart-head-label-height': `${size.xAxisLabelHeight}px`,
          '--lchart-body-label-width': `${size.yAxisLabelWidth}px`,
          '--lchart-body-label-height': `${size.lineChartRowsHeight}px`,
          '--lchart-body-content-height': `${size.canvasHeight}px`,
          '--lchart-view-height': `${size.viewHeight}px`,
        } as CSSProperties
      })

      /**
       * y 轴标签容器的上下内边距
       */
      const bodyLabelPadding = computed(() => {
        const css: CSSProperties = {}
        if (size.top > 0) css.paddingTop = `${size.top}px`
        if (size.bottom > 0) css.paddingBottom = `${size.bottom}px`
        return css
      })

      const { x, y, scrollTo } = useLChartScroll(scrollRef, size)

      /**
       * x 轴的滚动联动
       */
      const xAxisLabelScroll = computed(() => {
        return {
          left: `-${x.value}px`,
        }
      })

      const { elementY, isOutside } = useMouseInElement(scrollRef)

      /**
       * y 轴悬浮选中的行索引
       */
      const yAxisHoverIndex = computed(() => {
        if (isOutside.value) return -1
        const index = Math.floor((y.value + elementY.value - size.top) / size.lineChartRowsHeight)
        return index < yAxisLabelView.value.length ? index : -1
      })

      /**
       * y 轴悬浮高亮
       */
      const yAxisHoverEmphasis = computed(() => {
        const css: CSSProperties = {}
        if (yAxisHoverIndex.value > -1) {
          const top = size.top + yAxisHoverIndex.value * size.lineChartRowsHeight
          const bottom = top + size.lineChartRowsHeight
          css.background = `linear-gradient(to bottom, transparent ${top}px, pink ${top}px ${bottom}px, transparent ${bottom}px)`
        }
        return css
      })

      // @ts-ignore
      window.scrollTo = scrollTo

      return {
        scrollRef,
        echartsRef,
        yAxisLabelView,
        config,
        yAxisHoverIndex,
        yAxisHoverEmphasis,
        bodyLabelPadding,
        cssVar,
        xAxisLabelScroll,
      }
    },
  })
</script>

<style lang="scss">
  .lchart {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    width: 1000px;
    height: 800px;
    margin: auto;
    resize: both;
    &-table {
      flex-grow: 1;
      height: 100%;
      overflow: hidden;
      &__head {
        flex-shrink: 0;
        flex-grow: 0;
        display: flex;
        box-sizing: border-box;
        height: var(--lchart-head-label-height);
        border: 1px solid #999;
        &--crossover {
          width: var(--lchart-body-label-width);
          height: var(--lchart-head-label-height);
        }
        &--label {
          flex-grow: 1;
          position: relative;
          height: var(--lchart-head-label-height);
          overflow: hidden;
          &-container {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            flex-wrap: nowrap;
            &--content {
              flex-shrink: 0;
              flex-grow: 0;
              width: var(--lchart-head-label-width);
              height: var(--lchart-head-label-height);
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              &.emphasis {
                background-color: #999;
              }
            }
          }
        }
      }
      &__body {
        overflow: hidden;
        height: var(--lchart-view-height);
        &-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-wrap: nowrap;
          position: relative;
          overflow: auto;
          &--label {
            flex-shrink: 0;
            width: var(--lchart-body-label-width);
            height: var(--lchart-body-content-height);
            position: sticky;
            left: 0;
            background-color: #fff;
            z-index: 2;
            &-container {
              width: var(--lchart-body-label-width);
              height: var(--lchart-body-label-height);
              display: flex;
              align-items: center;
              &.emphasis {
                background-color: #999;
              }
            }
          }
          &--chart {
            flex-grow: 1;
            z-index: 1;
          }
        }
      }
    }
    &-tools {
      flex-shrink: 0;
      width: 60px;
      background-color: pink;
    }
  }
</style>
