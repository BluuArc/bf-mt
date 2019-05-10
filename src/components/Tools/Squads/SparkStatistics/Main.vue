<template>
  <div class="spark-statistics-container">
    <v-expansion-panel v-model="currentSection">
      <v-expansion-panel-content>
        <span slot="header" class="subheading">Current Squad Statistics</span>
        <section>
          <spark-squad-card
            v-if="resultForCurrentSquad"
            :squad="squad"
            :sparkResult="resultForCurrentSquad"
            :getUnit="getUnit"/>
          <!-- Statistics for current setup goes here
          {{ resultForCurrentSquad }} -->
        </section>
      </v-expansion-panel-content>
      <v-expansion-panel-content>
        <span slot="header" class="subheading">Spark Simulator Input</span>
        <section>
          Input area goes here
        </section>
        <section>
          Spark Sim settings go here
        </section>
        <section>
          <v-btn block @click="runSimulator">Run Simulator</v-btn>
        </section>
      </v-expansion-panel-content>
      <v-expansion-panel-content v-show="runningSimulator || !!results">
        <span slot="header" class="subheading">Simulator Results</span>
        <section>
          Progress can show here.
          Sim Results go here (show one at a time?, have popup modal to jump to specific result)
          <pre>
            <code>
{{ results && JSON.stringify(results, null, 2) }}
            </code>
          </pre>
        </section>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <section>
      Powered by <a href="https://joshuacastor.me/project-sparkle/" target="_blank" rel="noopener">Project Sparkle</a>
    </section>
  </div>
</template>

<script>
import SparkSimulator from '@/modules/spark-simulator';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
import SparkSquadCard from '@/components/Tools/Squads/SparkStatistics/SparkSquadCard';

export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
  },
  components: {
    SparkSquadCard,
  },
  data () {
    return {
      sparkSimulator: new SparkSimulator(),
      results: null,
      currentSection: 0,
      runningSimulator: true,
      resultForCurrentSquad: null,
    };
  },
  mounted () {
    this.sparkSimulator.getters = {
      unit: this.getUnit,
      item: this.getItem,
      extraSkill: this.getExtraSkill,
    };
    this.calculateResultForCurrentSquad();
  },
  methods: {
    runSimulator () {
      this.results = this.sparkSimulator.calculateSparksForSquad(this.squad);
    },
    calculateResultForCurrentSquad () {
      this.resultForCurrentSquad = Object.freeze(this.sparkSimulator.calculateSparksForSquad(this.squad));
    },
  },
};
</script>

<style lang="less">
.spark-statistics-container {
  width: 100%;
  .v-expansion-panel {
    box-shadow: none;
  }

  .v-expansion-panel__header {
    padding-left: 8px;
    padding-right: 8px;

    .subheading {
      font-weight: bold;
    }
  }

  a {
    color: inherit;
    &:hover {
      font-weight: bold;
    }
  }
}
</style>
