<template>
  <section>
    <div>
      <v-btn @click="runSimulator">Run Sim</v-btn>
    </div>
    <div>
      <pre>
        <code>
          {{ JSON.stringify(results, null, 2) }}
        </code>
      </pre>
    </div>
  </section>
</template>

<script>
import SparkSimulator from '@/modules/spark-simulator';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      sparkSimulator: new SparkSimulator(),
      results: {},
    };
  },
  mounted () {
    this.sparkSimulator.getters = {
      unit: this.getUnit,
      item: this.getItem,
      extraSkill: this.getExtraSkill,
    };
  },
  methods: {
    runSimulator () {
      this.results = this.sparkSimulator.calculateSparksForSquad(this.squad);
    },
  },
};
</script>

<style>

</style>
