<template>
  <div class="lchart lchart-fullscreen">
    <div class="lchart-table" :style="cssVar">
      <div class="lchart-table__head">
        <div class="lchart-table__head--crossover">
          <div class="lchart-table__head--crossover-container"></div>
        </div>
        <div class="lchart-table__head--label">
          <div class="lchart-table__head--label-container" :style="scrollLeft">
            <template v-for="label in xAxisLabel" :key="label">
              <div class="lchart-table__head--label-container--content">{{ label }}</div>
            </template>
          </div>
        </div>
      </div>
      <div class="lchart-table__body">
        <div class="lchart-table__body--label">
          <div class="lchart-table__body--label-container" :style="scrolTop">
            <template v-for="label in yAxisLabelView" :key="label">
              <div class="lchart-table__body--label-container--content">{{ label }}</div>
            </template>
          </div>
        </div>
        <div class="lchart-table__body--chart">
          <div class="lchart-table__body--chart-container" ref="scrollRef">
            <div ref="echartsRef"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="lchart-tools"></div>
  </div>
</template>

<script lang="ts">
  import { useResizeObserver } from '@vueuse/core'
  import {
    computed,
    defineComponent,
    nextTick,
    onMounted,
    ref,
    toRaw,
    watch,
    type CSSProperties,
    type PropType,
    type Ref,
  } from 'vue'
  import type { LCahrtLabel, LChartData } from './types'
  import { useLChartScroll, useLineChartTable } from './use'

  export default defineComponent({
    name: 'EchartsTable',
    props: {
      data: {
        type: Object as PropType<LChartData>,
        required: true,
      },
      xAxisLabel: {
        type: Array as PropType<LCahrtLabel>,
        required: true,
      },
      yAxisLabel: {
        type: Array as PropType<LCahrtLabel>,
        required: true,
      },
    },
    setup(props) {
      const scrollRef = ref<any>(null) as Ref<HTMLDivElement>
      const echartsRef = ref<any>(null) as Ref<HTMLDivElement>

      const yAxisLabelView = ref(toRaw(props.yAxisLabel))

      const { config, size } = useLineChartTable(echartsRef, {
        lineChartColWidth: 150,
        lineChartRowsHeight: 150,
        tableHeight: 800,
        xAxisLabelHeight: 60,
        yAxisLabelWidth: 150,
      })

      useResizeObserver(scrollRef, () => {
        config.viewWidth = scrollRef.value.offsetWidth
      })

      const { x, y, scrollTo } = useLChartScroll(scrollRef, size)

      watch(
        () => props.xAxisLabel,
        (label) => {
          const now = '2018-06'

          config.markAreaIndex = label.indexOf(now)
          config.xAxisLabel = label
        },
        { immediate: true }
      )

      watch(
        () => props.data,
        (data) => {
          config.data = data
        },
        { immediate: true, deep: true }
      )

      watch(
        yAxisLabelView,
        (label) => {
          config.yAxisLabel = label
          yAxisLabelView.value = label
        },
        { immediate: true, deep: true }
      )

      const cssVar = computed(() => {
        return {
          '--lchart-head-label-width': `${size.lineChartColWidth}px`,
          '--lchart-head-label-height': `${size.xAxisLabelHeight}px`,
          '--lchart-body-label-width': `${size.yAxisLabelWidth}px`,
          '--lchart-body-label-height': `${size.lineChartRowsHeight}px`,
          '--lchart-view-width': size.viewWidth ? `${size.viewWidth}px` : 'auto',
          '--lchart-view-height': size.viewHeight ? `${size.viewHeight}px` : 'auto',
        } as CSSProperties
      })

      const scrolTop = computed(() => {
        return {
          top: `-${y.value}px`,
        }
      })
      const scrollLeft = computed(() => {
        return {
          left: `-${x.value}px`,
        }
      })

      return { scrollRef, echartsRef, yAxisLabelView, config, cssVar, scrolTop, scrollLeft }
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
            }
          }
        }
      }
      &__body {
        overflow: hidden;
        display: flex;
        height: var(--lchart-view-height);
        position: relative;
        &--label {
          flex-shrink: 0;
          width: var(--lchart-body-label-width);
          &-container {
            position: absolute;
            top: 0;
            left: 0;
            &--content {
              width: var(--lchart-body-label-width);
              height: var(--lchart-body-label-height);
              display: flex;
              align-items: center;
              box-shadow: 0 1px 0 0 #999;
            }
          }
        }
        &--chart {
          overflow: hidden;
          flex-grow: 1;
          &-container {
            width: 100%;
            height: 100%;
            overflow: auto;
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
