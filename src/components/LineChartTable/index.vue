<template>
  <div class="lchart" :style="cssVar">
    <div class="lchart-head">
      <div class="lchart-head__crossover">
        <div class="lchart-head__crossover-container"></div>
      </div>
      <div class="lchart-head__label">
        <div class="lchart-head__label-container">
          <template v-for="label in colLabel" :key="label">
            <div class="lchart-head__label-container--content">{{ label }}</div>
          </template>
        </div>
      </div>
    </div>
    <div class="lchart-body">
      <div class="lchart-body__label echarts-left">
        <div class="lchart-body__label-container">
          <template v-for="label in rowLabel" :key="label">
            <div class="lchart-body__label-container--content">{{ label }}</div>
          </template>
        </div>
      </div>
      <div class="lchart-body__echarts">
        <div class="lchart__echarts-scroll">
          <div ref="echartsRef"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, ref, type CSSProperties, type Ref } from 'vue'
  import { useLineChartTable } from './use'

  export default defineComponent({
    name: 'EchartsTable',
    setup(props) {
      const echartsRef = ref<any>(null) as Ref<HTMLDivElement>

      const { config, size, colLabel, rowLabel } = useLineChartTable(echartsRef, {
        size: {
          rowHeight: 150,
          colWidth: 150,
        },
        pannel: {
          chartWidth: 600,
          chartHeight: 300,
        },
        colLabel: ['2018-05', '2018-06', '2018-07', '2018-08', '2018-09', '2018-10', '2018-11', '2018-12'],
        rowLabel: ['第一行', '第二行', '第三行', '第四行', '第五行', '第六行', '第七行'],
        data: {
          '第一行': [1, 3, 8, 0, 7, 4, 6, 10],
          '第二行': [60, 72, 10, 39, 40, 33, 50, 69],
          '第三行': [100, 300, 800, 0, 700, 400, 600, 1500],
          '第四行': [108, 125, 80, 0, 71, 40, 60, 135],
          '第五行': [0.6, 0.72, 0.1, 0.39, 0.4, 0.33, 0.5, 0.69],
          '第六行': [1, 3, 8, 0, 7, 4, 6, 2],
          '第七行': [0.06, 0.072, 0.01, 0.039, 0.04, 0.033, 0, 0.069],
        },
      })

      Reflect.set(window, 'config', config)
      Reflect.set(window, 'size', size)

      const cssVar = computed(() => {
        return {
          '--lchart-head-label-width': `${size.colWidth}px`,
          '--lchart-head-label-height': `${size.headLableHeight}px`,
          '--lchart-body-label-width': `${size.bodyLabelWidth}px`,
          '--lchart-body-label-height': `${size.rowHeight}px`,
          '--lchart-chart-width': `${size.chartWidth}px`,
          '--lchart-chart-height': `${size.chartHeight}px`,
          '--lchart-pannel-width': `${size.pannelWidth}px`,
          '--lchart-pannel-height': `${size.pannelHeight}px`,
        } as CSSProperties
      })

      return { echartsRef, config, colLabel, rowLabel, cssVar }
    },
  })
</script>

<style lang="scss">
  $border: 1px solid #999;
  .lchart {
    display: flex;
    flex-direction: column;
    max-width: var(--lchart-pannel-width);
    max-height: var(--lchart-pannel-height);
    overflow: hidden;
    &-head {
      display: flex;
      border-bottom: $border;
      box-sizing: border-box;
      height: var(--lchart-head-label-height);
      &__crossover {
        width: var(--lchart-body-label-width);
        height: var(--lchart-head-label-height);
      }
      &__label {
        position: relative;
        width: var(--lchart-chart-width);
        height: var(--lchart-head-label-height);
        overflow: hidden;
        &-container {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          flex-wrap: nowrap;
          &--content {
            width: var(--lchart-head-label-width);
            height: var(--lchart-head-label-height);
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }
    }
    &-body {
      display: flex;
      &__label {
        position: relative;
        width: var(--lchart-body-label-width);
        height: var(--lchart-chart-height);
        overflow: hidden;
        &-container {
          position: absolute;
          top: 0;
          left: 0;
          &--content {
            width: var(--lchart-body-label-width);
            height: var(--lchart-body-label-height);
            display: flex;
            align-items: center;
          }
        }
      }
      &__echarts {
        width: var(--lchart-chart-width);
        height: var(--lchart-chart-height);
        overflow: auto;
      }
    }
  }
</style>
