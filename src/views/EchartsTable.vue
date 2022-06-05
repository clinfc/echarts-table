<template>
  <EchartsTable :x-axis-label="xAxisLabel" :x-axis-label-emphasis="2" :y-axis-label="yAxisLabel" :data="data" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import EchartsTable from '../components/LineChartTable/index.vue'

  export default defineComponent({
    components: { EchartsTable },
    setup() {
      const xAxisLabel = ['2018-05', '2018-06', '2018-07', '2018-08', '2018-09', '2018-10', '2018-11', '2018-12']

      const yAxisLabel = ['第一行', '第二行', '第三行', '第四行', '第五行', '第六行', '第七行']

      const data = {
        '第一行': [1, 3, 8, 0, 7, 4, 6, 10],
        '第二行': [60, 72, 10, 39, 40, 33, 50, 69],
        '第三行': [100, 300, 800, 0, 700, 400, 600, 1500],
        '第四行': [108, 125, 80, 0, 71, 40, 60, 135],
        '第五行': [0.6, 0.72, 0.1, 0.39, 0.4, 0.33, 0.5, 0.69],
        '第六行': [1, 3, 8, 0, 7, 4, 6, 2],
        '第七行': [0.06, 0.072, 0.01, 0.039, 0.04, 0.033, 0, 0.069],
      }

      return { xAxisLabel, yAxisLabel, data }
    },
  })
</script>
