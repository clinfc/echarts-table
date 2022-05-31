<template>
  <div class="lchart" :style="cssVar">
    <div class="lchart-row">
      <div class="lchart-row__label">
        <div class="lchart-row__label-container"></div>
      </div>
      <div class="lchart-col__label">
        <div class="lchart-col__label-container">
          <template v-for="label in colLabel" :key="label">
            <div class="lchart-col__label-container--content">{{ label }}</div>
          </template>
        </div>
      </div>
    </div>
    <div class="lchart-row">
      <div class="lchart-row__label echarts-left">
        <div class="lchart-row__label-container">
          <template v-for="label in rowLabel" :key="label">
            <div class="lchart-col__label-container--content">{{ label }}</div>
          </template>
        </div>
      </div>
      <div class="lchart__echarts">
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
          rowHeight: 40,
          colWidth: 70,
        },
        colLabel: ['2018-06', '2018-07', '2018-08', '2018-09', '2018-10', '2018-11', '2018-12'],
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

      const cssVar = computed(() => {
        return {
          '--lchart-col-label-width': `${size.colWidth}px`,
          '--lchart-col-label-height': `${size.rowHeight}px`,
          '--lchart-row-label-width': `70px`,
          '--lchart-row-label-height': `${size.rowHeight}px`,
          '--lchart-echarts-width': `900px`,
          '--lchart-echarts-height': `900px`,
        } as CSSProperties
      })

      return { echartsRef, config, colLabel, rowLabel, cssVar }
    },
  })
</script>

<style lang="scss">
  .lchart {
    display: flex;
    flex-direction: column;
    &-row {
      display: flex;
    }
    &-row__label {
      overflow: hidden;
      position: relative;
      width: var(--lchart-row-label-width);
      &.echarts-left {
        height: var(--lchart-echarts-height);
      }
      &-container {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        &--content {
          width: var(--lchart-row-label-width);
          height: var(--lchart-row-label-height);
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
    &-col__label {
      overflow: hidden;
      width: var(--lchart-echarts-width);
      height: var(--lchart-col-label-height);
      position: relative;
      &-container {
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        &--content {
          width: var(--lchart-col-label-width);
          height: var(--lchart-col-label-height);
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
    &__echarts {
      width: var(--lchart-echarts-width);
      height: var(--lchart-echarts-height);
      overflow: auto;
    }
  }
</style>
