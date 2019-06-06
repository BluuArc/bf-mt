<template>
  <v-dialog :value="showSelector" @input="toggleView($event)" lazy scrollable max-width="400px">
    <v-card>
      <v-card-text>
        <v-container fluid class="pa-0">
          <v-layout row wrap v-if="isUnit">
            <v-flex xs4 class="pa-0" v-for="option in defaultSearchOptions" :key="option" style="cursor: pointer;">
              <v-checkbox hide-details :value="option" v-model="localSearchOptions">
                <div slot="label" v-text="option.toUpperCase()"/>
              </v-checkbox>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex>
              <v-combobox
                v-model="localSelectedIds"
                :label="selectLabel"
                hint="Empty selection is equivalent to showing all."
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
          <v-layout row>
            <v-flex class="pa-0">
              <v-container fluid class="pl-0 pr-0">
                <v-layout row>
                  <v-flex>
                    <v-divider/>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex>
                    <v-text-field
                      label="Search"
                      v-model="query"
                      clearable
                      persistent-hint
                      :hint="`${filteredIds.length} results`"/>
                  </v-flex>
                </v-layout>
              </v-container>
              <loading-indicator
                :progress="loadProgress"
                v-if="loadingList"
                loadingMessage="Loading list..."
              />
              <delayed-v-for-selector-list
                v-show="!loadingList"
                v-model="localSelectedIds"
                :entries="filteredIds"
                :getKeyFunction="getKeyForIdEntry"
                :amountToAddPerTick="10"
                :showIcons="true"
                @start="handleLoadStart"
                @end="handleLoadEnd"
                @progress="$p => loadProgress = $p"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn flat @click.native="toggleView(false)">Save</v-btn>
        <v-spacer/>
        <v-btn flat @click.native="resetValues">Reset</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SWorker from '@/assets/sww.min.js';
import IconKeyMappings from '@/modules/EffectProcessor/icon-key-mappings';
import debounce from 'lodash/debounce';
import LoadingIndicator from '@/components/LoadingIndicator';
import DelayedVForSelectorList from './DelayedVForSelectorList';

export default {
  props: {
    showSelector: {
      type: Boolean,
      required: true,
    },
    isUnit: {
      type: Boolean,
      default: false,
    },
    defaultSearchOptions: {
      type: Array,
      default: () => [],
    },
    searchOptions: {
      type: Array,
      default: () => [],
    },
    selectedIds: {
      type: Array,
      required: true,
    },
    possibleIds: {
      type: Array,
      required: true,
    },
    selectLabel: {
      type: String,
      default: 'Select Buffs',
    },
    logger: {
      required: true,
    },
  },
  components: {
    LoadingIndicator,
    DelayedVForSelectorList,
  },
  data () {
    return {
      localSearchOptions: [],
      localSelectedIds: [],
      query: '',
      filteredIds: [],
      loadStartToken: 0,
      loadingList: true,
      loadProgress: -1,
    };
  },
  methods: {
    handleLoadStart (startToken) {
      this.loadStartToken = startToken;
      this.loadingList = true;
      this.loadProgress = -1;
    },
    handleLoadEnd (endToken) {
      if (this.loadStartToken === endToken) {
        this.loadingList = false;
      }
    },
    emitChange () {
      this.logger.debug('emitting change', {
        searchOptions: this.localSearchOptions,
        selectedIds: this.localSelectedIds,
      });
      this.$emit('input', {
        searchOptions: this.localSearchOptions,
        selectedIds: this.localSelectedIds,
      });
    },
    async syncInputToLocal () {
      this.localSearchOptions = this.searchOptions.slice();
      this.localSelectedIds = this.selectedIds.map(val => typeof val !== 'string' ? val.toString() : val).slice();
      await this.filterIds();
    },
    toggleView (bool) {
      this.$emit('toggleview', bool);
      if (!bool) {
        this.emitChange();
      }
    },
    async filterIds () {
      if (!this.query) {
        this.filteredIds = this.possibleIds.slice();
      } else {
        const results = await SWorker.run((buffs, query) => {
          return buffs.filter(buff => buff.text.toLowerCase().includes(query)).map(buff => buff.value);
        }, [this.possibleIds.map(({ text, value }) => ({ text,value })), this.query.toLowerCase()]);
  
        this.filteredIds = this.possibleIds.filter(({ value }) => results.includes(value));
      }
    },
    async resetValues () {
      this.localSearchOptions = this.defaultSearchOptions.slice();
      this.localSelectedIds = [];
      this.query = '';
      await this.filterIds();
    },
    getFilteredIconsForBuffSelectorEntry (entry) {
      if (!entry || !entry.data || typeof (entry.data.possibleIcons) !== 'function') {
        return [];
      }
      return entry.data.possibleIcons()
        .filter(i => {
          // for cases of INSTANT_BUFFKEY or PASSIVE_BUFFKEY
          // eslint-disable-next-line no-unused-vars
          const [ prefix, ...buffKey ] = i.split('_');
          return i !== IconKeyMappings.UNKNOWN.name && !!(IconKeyMappings[i] || IconKeyMappings[buffKey.join('_')]);
        });
    },
    getKeyForIdEntry (buff) {
      return buff.value;
    },
  },
  watch: {
    searchOptions () {
      this.syncInputToLocal();
    },
    selectedIds () {
      this.syncInputToLocal();
    },
    query: debounce(async function () { 
      await this.filterIds();
    }, 750),
    showSelector (newValue) {
      if (newValue) {
        this.syncInputToLocal();
      }
    },
  },
  mounted () {
    this.syncInputToLocal();
  },
};
</script>

<style lang="less">
.buff-selector-list {
  max-height: 200px;
  overflow-y: auto;

  & .buff-selector-list--row {
    &:nth-child(even) {
      background-color: var(--background-color-alt);
    }

    .v-input--selection-controls__input {
      margin: auto;
    }
  }
}
</style>
