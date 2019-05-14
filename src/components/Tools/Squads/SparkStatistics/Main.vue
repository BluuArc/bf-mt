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
            :getUnit="getUnit"
            @share="() => emitShareEvent(resultForCurrentSquad)"
          />
        </section>
      </v-expansion-panel-content>
      <v-expansion-panel-content>
        <span slot="header" class="subheading">Spark Simulator Input</span>
        <section>
          <spark-squad-card-editable
            v-model="simulatorOptions"
            :squad="squad"
            :getUnit="getUnit"
          />
        </section>
        <section>
          <overall-simulator-options
            v-model="simulatorOptions"
            :squad="squad"
          />
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
import { getSimulatorOptions } from '@/modules/spark-simulator/utils';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
import SparkSquadCard from '@/components/Tools/Squads/SparkStatistics/SparkSquadCard';
import SparkSquadCardEditable from '@/components/Tools/Squads/SparkStatistics/SparkSquadCardEditable';
import OverallSimulatorOptions from '@/components/Tools/Squads/SparkStatistics/OverallSimulatorOptions';

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
    SparkSquadCardEditable,
    OverallSimulatorOptions,
  },
  data () {
    return {
      sparkSimulator: new SparkSimulator(),
      results: null,
      currentSection: 0,
      runningSimulator: true,
      resultForCurrentSquad: null,
      simulatorOptions: null,
    };
  },
  created () {
    this.simulatorOptions = getSimulatorOptions(undefined, this.squad);
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
    emitShareEvent (sparkResult) {
      this.$emit('share', sparkResult);
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
