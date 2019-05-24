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
            :simulatorOptions="simulatorOptions"
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
      <v-expansion-panel-content v-show="!runningSimulator && results">
        <span slot="header" class="subheading">Simulator Results</span>
        <section v-if="Array.isArray(results) && results.length > 0">
          <section class="result-navigator">
            <v-btn
              flat
              :icon="$vuetify.breakpoint.xsOnly"
              :disabled="currentResultIndex <= 0"
              @click="currentResultIndex = Math.max(currentResultIndex - 1, 0)"
            >
              <v-icon>chevron_left</v-icon>
            </v-btn>
            <v-select
              class="mx-2"
              v-model="currentResultIndex"
              :items="resultSelectValues"
              item-text="label"
              item-value="value"
            />
            <v-btn
              flat
              :icon="$vuetify.breakpoint.xsOnly"
              :disabled="currentResultIndex + 1 >= results.length"
              @click="currentResultIndex = Math.min(currentResultIndex + 1, results.length - 1)"
            >
              <v-icon>chevron_right</v-icon>
            </v-btn>
          </section>
          <section>
            <spark-squad-card
              :key="getResultName(results[currentResultIndex], currentResultIndex)"
              :squad="squad"
              :sparkResult="results[currentResultIndex]"
              :getUnit="getUnit"
              :simulatorOptions="simulatorOptions">
            <v-card-actions slot="card-actions">
              <v-btn outline @click="() => applySparkResult(results[currentResultIndex])">
                <v-icon left>save</v-icon>
                Apply
              </v-btn>
            </v-card-actions>
            </spark-squad-card>
          </section>
        </section>
        <section v-else>
          No results found for given configuration.
        </section>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <section class="mt-3">
      Powered by <a href="https://joshuacastor.me/project-sparkle/" target="_blank" rel="noopener">Project Sparkle</a>
    </section>
  </div>
</template>

<script>
import SparkSimulator from '@/modules/spark-simulator';
import { getSimulatorOptions, applySparkResultToSquad } from '@/modules/spark-simulator/utils';
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
    initialSimulatorOptions: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    SparkSquadCard,
    SparkSquadCardEditable,
    OverallSimulatorOptions,
  },
  computed: {
    resultSelectValues () {
      return Object.freeze(this.results.map((r, i) => ({
        label: this.getResultName(r, i),
        value: i,
      })));
    },
  },
  data () {
    return {
      sparkSimulator: new SparkSimulator(),
      results: null,
      currentSection: 0,
      runningSimulator: false,
      resultForCurrentSquad: null,
      simulatorOptions: null,
      currentResultIndex: 0,
    };
  },
  created () {
    this.simulatorOptions = getSimulatorOptions(this.initialSimulatorOptions, this.squad);
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
    async runSimulator () {
      this.results = await this.sparkSimulator.calculateOptimalOrdersForSquad(this.squad, this.simulatorOptions);
      await this.$nextTick();
      this.currentSection = 2; // show result panel
    },
    calculateResultForCurrentSquad () {
      this.resultForCurrentSquad = Object.freeze(this.sparkSimulator.calculateSparksForSquad(this.squad, getSimulatorOptions(this.squad.simulatorOptions, this.squad)));
    },
    emitShareEvent (sparkResult) {
      this.$emit('share', sparkResult);
    },
    emitSimulatorOptions () {
      this.$emit('simoptions', this.simulatorOptions);
    },
    getResultName (sparkResult, resultIndex) {
      return `Result ${resultIndex + 1} (${(sparkResult.weightedPercentage * 100).toFixed(2)}%)`;
    },
    applySparkResult (sparkResult) {
      this.$emit('apply', {
        squad: applySparkResultToSquad(this.squad, sparkResult),
        sparkResult,
      });

      this.currentSection = 0; // show current squad panel
    },
  },
  watch: {
    simulatorOptions () {
      this.emitSimulatorOptions();
    },
    squad () {
      this.calculateResultForCurrentSquad();
    },
    resultForCurrentSquad (newValue) {
      this.$emit('currentsquadresult', newValue);
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

  .result-navigator {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
  }
}
</style>
