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
          <v-alert
            :value="true"
            :icon="simulatorWarnings.length === 0 ? 'info' : 'priority_high'"
            :color="simulatorWarnings.length === 0 ? 'info' : 'warning'"
          >
            <template v-if="simulatorWarnings.length > 0">
              <span>Warnings that may affect the accuracy of results:</span>
              <ul>
                <li
                  v-for="w in simulatorWarnings"
                  :key="w"
                  v-text="w"
                />
              </ul>
            </template>
            <span v-else>No squad level warnings found. Make sure to check individual units for warnings.</span>
          </v-alert>
        </section>
        <section>
          <v-btn block @click="runSimulator">Run Simulator</v-btn>
        </section>
      </v-expansion-panel-content>
      <v-expansion-panel-content v-show="!runningSimulator && results">
        <span slot="header" class="subheading">Simulator Results</span>
        <div>
          <section class="mx-2">
            <v-alert color="info" :value="true" >
              <v-layout row wrap>
                <v-flex>
                  Time Elapsed: {{ simulationElapsedText }}
                </v-flex>
                <v-flex>
                  Total Combinations Tested: {{ lastTestedCount }}
                </v-flex>
                <v-flex>
                  Combinations Tested/Second: {{ combosTestedPerSecond }}
                </v-flex>
              </v-layout>
            </v-alert>
          </section>
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
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-dialog
      :value="showProgressDialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-card-text>
          <v-progress-linear
            :value="progressPercent"
            :indeterminate="progressPercent === 0"
            query/>
          <div>{{ progressLabel }}</div>
          <div>Time Elapsed: {{ simulationElapsedText }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            v-if="!runningSimulator"
            @click="showProgressDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            v-else
            @click="cancelCalculations"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <section class="mt-3">
      Powered by <a href="https://joshuacastor.me/project-sparkle/" target="_blank" rel="noopener">Project Sparkle</a>
    </section>
  </div>
</template>

<script>
import SparkSimulator from '@/modules/spark-simulator';
import { getSimulatorOptions, applySparkResultToSquad, getSimulatorWarningsForSquad } from '@/modules/spark-simulator/utils';
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
    simulatorWarnings () {
      return getSimulatorWarningsForSquad(this.squad, this.simulatorOptions);
    },
    progressLabel () {
      return `${this.progressPercent.toFixed(2)}% (${this.progressActual}/${this.progressTotal})`;
    },
    progressPercent () {
      return (this.progressActual / Math.max(1, this.progressTotal)) * 100;
    },
    combosTestedPerSecond () {
      return (this.lastTestedCount / Math.max(this.simulationEndTime - this.simulationStartTime, 1) * 1000).toFixed(2);
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
      showProgressDialog: false,
      progressTotal: 0,
      progressActual: 0,
      progressAnimationFrame: null,
      progressObject: { total: 0, completed: 0, countTested: 0 },
      errors: [],
      simulationStartTime: Date.now(),
      simulationEndTime: Date.now(),
      simulationElapsedText: '',
      lastTestedCount: 0,
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
    cancelCalculations () {
      this.sparkSimulator.cancelCalculations();
    },
    async runSimulator () {
      // reset results
      this.progressObject = { total: 0, completed: 0 };
      this.setProgress();
      this.results = null;
      this.runningSimulator = true;
      this.showProgressDialog = true;
      if (this.progressAnimationFrame) {
        cancelAnimationFrame(this.progressAnimationFrame);
        this.progressAnimationFrame = null;
      }
      this.sparkSimulator.addProgressListener(p => {
        this.progressObject = p;
        this.throttledSetProgress();
      });
      this.simulationStartTime = Date.now();
      this.throttledSetProgress();
      await this.$nextTick();

      // run and get results
      const calculationResults = await this.sparkSimulator.calculateOptimalOrdersForSquad(this.squad, this.simulatorOptions);
      this.errors = calculationResults.errors;
      this.results = calculationResults.results;
      if (this.progressAnimationFrame) {
        cancelAnimationFrame(this.progressAnimationFrame);
        this.progressAnimationFrame = null;
      }
      this.setProgress();
      this.runningSimulator = false;
      this.showProgressDialog = false;
      this.progressObject = { total: 0, completed: 0 };
      this.simulationEndTime = Date.now();
      this.sparkSimulator.removeAllListeners();
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
    setProgress () {
      this.progressActual = (this.progressObject && this.progressObject.completed) || 0;
      this.progressTotal = (this.progressObject && this.progressObject.total) || 0;
      this.lastTestedCount = (this.progressObject && this.progressObject.completed) || 0;
      this.simulationElapsedText = this.getTimeElapsedText();
    },
    throttledSetProgress () {
      if (!this.progressAnimationFrame) {
        const progressIsDifferent = (progress) => progress !== this.progressObject;
        const loop = () => {
          const currentProgressObject = this.progressObject;
          this.progressAnimationFrame = requestAnimationFrame(() => {
            this.simulationElapsedText = this.getTimeElapsedText();
            if (progressIsDifferent(currentProgressObject)) {
              this.setProgress();
            }
            if (this.runningSimulator) {
              requestAnimationFrame(loop);
            }
          });
        };
        loop();
      }
    },
    getTimeElapsedText (otherTime = Date.now()) {
      const diff = otherTime - this.simulationStartTime;
      const MS_TO_MINUTES = 1 / (1000 * 60);
      const MS_TO_SECONDS = 1 / 1000;
      const minutes = Math.floor(diff * MS_TO_MINUTES);
      const seconds = Math.floor((diff - (minutes / MS_TO_MINUTES)) * MS_TO_SECONDS);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
