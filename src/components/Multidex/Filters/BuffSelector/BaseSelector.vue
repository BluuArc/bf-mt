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
              <v-container fluid class="pb-0 pt-0" style="max-height: 200px; overflow-y: auto;">
                <v-layout row v-for="(buff) in filteredIds" :key="buff.value">
                  <v-flex xs2>
                    <v-checkbox :value="buff.value.toString()" v-model="localSelectedIds"/>
                  </v-flex>
                  <v-flex xs10 class="d-align-self-center">
                    <v-flex xs12 v-text="buff.text"/>
                    <v-flex xs12>Icons here</v-flex>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn flat @click.native="toggleView(false)">Save</v-btn>
        <v-spacer/>
        <v-btn flat @click.native="resetValues">Clear</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SWorker from '@/assets/sww.min.js';
import debounce from 'lodash/debounce';

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
  },
  data () {
    return {
      localSearchOptions: [],
      localSelectedIds: [],
      query: '',
      filteredIds: [],
    };
  },
  methods: {
    emitChange () {
      this.$emit('input', {
        searchOptions: this.localSearchOptions.slice(),
        selectedIds: this.localSelectedIds.slice(),
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
}
</script>

