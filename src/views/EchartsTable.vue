<template>
  <EchartsTable />
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import EchartsTable from '../components/LineChartTable/index.vue'

  export default defineComponent({
    components: { EchartsTable },
  })
</script>
