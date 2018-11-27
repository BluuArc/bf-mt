<template>
  <v-dialog :value="showSelector" @input="toggleView($event)" lazy scrollable max-width="400px">
    <v-card>
      <card-tabs-container :tabs="tabConfig" :growTabs="true" v-model="activeType">
        <v-container fluid class="pa-0" v-for="tab in tabConfig" :key="tab.name" :slot="tab.slot">
          <v-layout row>
            <v-flex>
              <v-combobox
                v-model="configByType[tab.slot].localSelectedIds"
                :label="`Select ${tab.slot}`"
                hint="Empty selection is equivalent to showing all."
                :items="possibleValues[tab.slot]"
                multiple
                persistent-hint>
                <template slot="selection" slot-scope="data">
                  <v-chip
                    :selected="data.selected"
                    :disabled="data.disabled"
                    :key="JSON.stringify(data.item)"
                    small class="v-chip--select-multi"
                    @click="query = `[${data.item}]`"
                    style="cursor: pointer;">
                    {{ data.item }}
                  </v-chip>
                </template>
              </v-combobox>
            </v-flex>
          </v-layout>
        </v-container>
      </card-tabs-container>
      <v-card-actions>
        <v-btn flat @click.native="toggleView(false)">Save</v-btn>
        <v-spacer/>
        <v-btn flat @click.native="resetValues">Reset</v-btn>
        <v-btn flat @click.native="resetAll">Reset All</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import { missionLocationTypes } from '@/modules/constants';
import { arraysAreDifferent } from '@/modules/utils';
import SWorker from '@/assets/sww.min.js';
import debounce from 'lodash/debounce';
import CardTabsContainer from '@/components/CardTabsContainer';
import { Logger } from '@/modules/Logger';

const logger = new Logger({ prefix: '[MULTIDEX/LandAreaDungeonSelector]' });
export default {
  props: {
    showSelector: {
      type: Boolean,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
  },
  components: {
    CardTabsContainer,
  },
  computed: {
    ...mapState('missions', ['possibleValues']),
    tabConfig () {
      return missionLocationTypes.map(name => ({ name: `${name} (${this.configByType[name].localSelectedIds.length})`, slot: name }));
    },
    activeTypeName () {
      return missionLocationTypes[this.activeType];
    },
  },
  data () {
    const data = {
      activeType: 0,
      configByType: {},
      lastKnownConfig: {},
    };
    missionLocationTypes.forEach(type => {
      data.configByType[type] = {
        localSelectedIds: [],
        query: '',
        filteredIds: [],
      };
      data.lastKnownConfig[type] = {
        localSelectedIds: [],
        query: '',
        filteredIds: [],
      };
    });
    return data;
  },
  methods: {
    emitChange () {
      const accumulator = {};
      missionLocationTypes.forEach(type => {
        if (arraysAreDifferent(this.value[type], this.configByType[type].localSelectedIds)) {
          accumulator[type] = this.configByType[type].localSelectedIds;
        }
      });
      if (Object.keys(accumulator).length > 0) {
        logger.debug('emitting change', accumulator);
        this.$emit('input', {
          ...this.value,
          ...accumulator,
        });
      } else {
        logger.debug('no value changed');
      }
    },
    async syncInputToLocal () {
      missionLocationTypes.forEach(type => {
        this.configByType[type].localSelectedIds = this.value[type].slice();
      });
      await this.filterIds();
    },
    toggleView (bool) {
      this.$emit('toggleview', bool);
      if (!bool) {
        this.emitChange();
      }
    },
    async filterIds () {
      const currentConfig = this.configByType[this.activeTypeName];
      const possibleValues = this.possibleValues[this.activeTypeName];
      if (!currentConfig.query) {
        currentConfig.filteredIds = possibleValues.slice();
      } else {
        logger.debug(possibleValues, currentConfig.query);
        currentConfig.filteredIds = await SWorker.run((names, query) => {
          return names.filter(name => name.toLowerCase().includes(query));
        }, [possibleValues, currentConfig.query.toLowerCase()]);
      }
    },
    async resetValues () {
      this.configByType[this.activeTypeName].localSelectedIds = [];
      this.configByType[this.activeTypeName].query = '';
    },
    resetAll () {
      missionLocationTypes.forEach(type => {
        this.configByType[type].localSelectedIds = [];
        this.configByType[type].query = '';
      });
    },
  },
  watch: {
    configByType: {
      deep: true,
      handler: debounce(function (newValue) {
        let isAnythingDifferent = false;
        missionLocationTypes.forEach(type => {
          isAnythingDifferent = isAnythingDifferent ||
            (newValue[type].query !== this.lastKnownConfig[type].query) ||
            (arraysAreDifferent(newValue[type].localSelectedIds, this.lastKnownConfig[type].localSelectedIds)) ||
            (arraysAreDifferent(newValue[type].filteredIds, this.lastKnownConfig[type].filteredIds));

          // deep copy of values
          Object.keys(newValue[type]).forEach(key => {
            this.lastKnownConfig[type][key] = (newValue[type][key] || '').slice();
          });
        });
        if (isAnythingDifferent) {
          this.filterIds();
        }
      }, 750),
    },
    value: {
      deep: true,
      handler  () {
        this.syncInputToLocal();
      },
    },
    showSelector (newValue) {
      if (newValue) {
        this.syncInputToLocal();
      }
    },
    activeTypeName (newValue) {
      // lazily initialize filtered values
      if (this.configByType[newValue].filteredIds.length === 0) {
        this.filterIds();
      }
    },
  },
  mounted () {
    logger.warn('TODO: styling and icons');
    this.syncInputToLocal();
  },
};
</script>

<style lang="less">
.lad-selector-list {
  max-height: 200px;
  overflow-y: auto;
}
</style>
