<template>
  <div ref="elRef"></div>
</template>

<script lang="ts">
  import { defineComponent, ref, type Ref } from 'vue'
  import { useLineChartTable } from './useLineChartTable'

  export default defineComponent({
    name: 'EchartsTable',
    setup(props) {
      const elRef = ref<any>(null) as Ref<HTMLDivElement>

      const { instance, config, size, eopts } = useLineChartTable(elRef, {
        size: {
          width: window.innerWidth - 60,
          height: window.innerHeight - 100,
        },
        colLabel: ['label', '2018-06', '2018-07', '2018-08', '2018-09', '2018-10', '2018-11', '2018-12'],
        rowLabel: ['第一行', '第二行', '第三行', '第四行', '第五行', '第六行', '第七行'],
        data: [
          [1, 3, 8, 0, 7, 4, 6, 10],
          [60, 72, 10, 39, 40, 33, 50, 69],
          [100, 300, 800, 0, 700, 400, 600, 1500],
          [108, 125, 80, 0, 71, 40, 60, 135],
          [0.6, 0.72, 0.1, 0.39, 0.4, 0.33, 0.5, 0.69],
          [1, 3, 8, 0, 7, 4, 6, 2],
          [0.06, 0.072, 0.01, 0.039, 0.04, 0.033, 0, 0.069],
        ],
      })

      Reflect.set(window, 'config', config)

      return { elRef }
    },
  })
</script>
