<template>
  <div class="spark-statistics-container">
    <section>
      Statistics for current setup goes here
    </section>
    <section>
      Input area goes here
    </section>
    <section>
      Spark Sim settings go here
    </section>
    <section>
      Sim Results go here (show one at a time, have popup modal to jump to specific result)
    </section>
    <section>
      Powered by <a href="https://joshuacastor.me/project-sparkle/" target="_blank" rel="noopener">Project Sparkle</a>
    </section>
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
  </div>
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

<style lang="less">
.spark-statistics-container {
  a {
    color: inherit;
    &:hover {
      font-weight: bold;
    }
  }
}
</style>
