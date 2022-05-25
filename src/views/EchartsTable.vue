<template>
  <EchartsTable v-bind="bindRaw" />
</template>

<script lang="ts">
  import { defineComponent, reactive } from 'vue'
  import EchartsTable from '../components/EchartsTable.vue'

  export default defineComponent({
    components: { EchartsTable },
    setup() {
      const bindRaw = reactive({
        data: [
          {
            label: '第一行',
            '2018-06': 4,
            '2018-07': 4,
            '2018-08': 5,
            '2018-09': 4,
            '2018-10': 3,
            '2018-11': 1,
            '2018-12': 2,
          },
          {
            label: '第二行',
            '2018-06': 1,
            '2018-07': 4,
            '2018-08': 3,
            '2018-09': 4,
            '2018-10': 5,
            '2018-11': 1,
            '2018-12': 2,
          },
          {
            label: '第三行',
            '2018-06': 4,
            '2018-07': 1,
            '2018-08': 5,
            '2018-09': 2,
            '2018-10': 3,
            '2018-11': 4,
            '2018-12': 2,
          },
        ],
        labelKeys: ['label', '2018-06', '2018-07', '2018-08', '2018-09', '2018-10', '2018-11', '2018-12'],
        width: window.innerWidth - 40,
        height: window.innerHeight - 40,
      })

      return { bindRaw }
    },
  })
</script>
