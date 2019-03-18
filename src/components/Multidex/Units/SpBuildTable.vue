<template>
  <table class="sp-table">
    <thead>
      <th class="sp-column">
        <v-checkbox
          class="mt-0"
          :label="`${activeSkillSum} SP`"
          :input-value="overallState === 'all'"
          :indeterminate="overallState === 'some'"
          @click.native="toggleOverallState"
          hide-details/>
      </th>
      <th class="type-column">
        <v-subheader class="flex-container align-center justify-center px-0">Type</v-subheader>
      </th>
      <th class="description-column">
        <v-subheader class="flex-container align-center px-0">Description</v-subheader>
      </th>
    </thead>
    <tbody>
      <template v-for="(spEntry, index) in feSkills">
        <tr :key="`${index}-content`" :class="`content-row content-row--${index % 2 === 0 ? 'even' : 'odd'}`">
          <td class="sp-column">
            <v-checkbox
              :label="`${spEntry.skill.bp} SP`"
              :input-value="selectedSpEntries.includes(spIndexToCode(index))"
              @click.native="toggleSpEntry(index, spEntry)"
            />
          </td>
          <td class="type-column text-xs-center">
            <sp-icon :category="+spEntry.category" :displaySize="24"/>
          </td>
          <td class="description-column py-2">
            <v-layout row wrap align-center justify-space-between>
              <v-flex xs12 sm8>
                <span class="d-block" v-html="getSpDescription(index)"/>
                <i v-if="spEntry.dependency">
                  {{ getSpDependencyText(spEntry) }}
                </i>
              </v-flex>
              <v-flex xs12 sm4>
                <v-btn
                  v-if="!showTables.includes(index)"
                  block flat
                  @click="showTables.push(index)">
                  Show Data
                </v-btn>
                <v-btn
                  v-else
                  block flat
                  @click="showTables = showTables.filter(elem => elem !== index)">
                  Hide Data
                </v-btn>
              </v-flex>
            </v-layout>
          </td>
        </tr>
        <v-slide-y-transition :key="`${index}-table`">
          <tr
            v-show="showTables.includes(index)"
            :class="`buff-row buff-row--${index % 2 === 0 ? 'even' : 'odd'}`">
            <td colspan="3">
              <buff-table
                class="mb-2"
                :effects="getSpEffects(spEntry, true)"
                :showHeaders="true"/>
            </td>
          </tr>
        </v-slide-y-transition>
      </template>
    </tbody>
  </table>
</template>

<script>
import {
  getSpEntryEffects,
  spIndexToCode,
  getSpCost,
  getAllDependenciesFromSpEntry,
  getAllEntriesThatDependOnSpEntry,
  getSpDescription,
  getSpDependencyText,
} from '@/modules/core/units';
import debounce from 'lodash/debounce';
import SpIcon from '@/components/Multidex/Units/SpIcon';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';

export default {
  props: {
    feSkills: {
      type: Array,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  },
  components: {
    SpIcon,
    BuffTable,
  },
  computed: {
    allEnhancementsCode () {
      return this.feSkills.map((_, i) => spIndexToCode(i)).join('');
    },
    allEnhancementsSum () {
      return getSpCost(this.feSkills, this.allEnhancementsCode);
    },
    overallState () {
      if (this.activeSkillSum === this.allEnhancementsSum) {
        return 'all';
      } else if (this.activeSkillSum === 0) {
        return 'none';
      } else {
        return 'some';
      }
    },
    allEffects () {
      return !this.feSkills ? [] : this.feSkills
        .map(s => this.getSpEffects(s, false))
        .reduce((acc, val) => acc.concat(val), []);
    },
  },
  data () {
    return {
      selectedSpEntries: [],
      activeSkillSum: 0,
      showTables: [],
      effectCache: new WeakMap(),
      cacheChangeToken: Date.now(),
    };
  },
  methods: {
    getSpEffects (spEntry, useCache = false) {
      if (useCache) {
        if (!this.effectCache.has(spEntry)) {
          this.effectCache.set(spEntry, getSpEntryEffects(spEntry));
          this.cacheExchangeToken = Date.now();
        }
        return this.effectCache.get(spEntry);
      } else {
        return getSpEntryEffects(spEntry);
      }
    },
    getSpDescription (entryIndex) {
      return `<b>${spIndexToCode(entryIndex)}</b>: ${getSpDescription(this.feSkills[entryIndex])}`;
    },
    getSpDependencyText (spEntry) {
      return getSpDependencyText(spEntry, this.feSkills);
    },
    spIndexToCode,
    toggleOverallState () {
      if (this.overallState === 'all') {
        this.selectedSpEntries = [];
      } else {
        this.selectedSpEntries = this.allEnhancementsCode.split('');
      }
    },
    computeActiveSum: debounce(function () {
      this.activeSkillSum = getSpCost(this.feSkills, this.selectedSpEntries.join(''));
    }, 50),
    toggleSpEntry (index, spEntry) {
      const code = spIndexToCode(index);
      const isCurrentlyActive = this.selectedSpEntries.includes(code);
      let newEntries = this.selectedSpEntries.slice();
      if (isCurrentlyActive) {
        // toggle off entry and entries dependent on it
        const dependentEntries = getAllEntriesThatDependOnSpEntry(spEntry, this.feSkills);
        newEntries = newEntries.filter(activeCode => {
          return activeCode !== code && !dependentEntries.includes(activeCode);
        });
      } else {
        // toggle on entry and entries it depends on
        newEntries.push(code);

        const dependencies = getAllDependenciesFromSpEntry(spEntry, this.feSkills);
        dependencies.forEach(depCode => {
          if (!newEntries.includes(depCode)) {
            newEntries.push(depCode);
          }
        });
      }

      this.selectedSpEntries = newEntries;
    },
  },
  watch: {
    value: {
      immediate: true,
      handler (newValue) {
        this.selectedSpEntries = newValue.split('');
      },
    },
    selectedSpEntries (newValue) {
      this.computeActiveSum();
      const enhancementCode = newValue.slice().sort().join('');
      if (enhancementCode !== this.value) {
        this.$emit('input', enhancementCode);
      }
    },
  },
};
</script>

<style lang="less">
table.sp-table {
  --table-border-color: var(--background-color-alt);
  --table-background-color: var(--background-color-alt--lighten-1);
  --table-border-settings: 1px solid var(--table-border-color);

  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;

  & > thead, & > tbody {
    .sp-column {
      width: 6.5em;
    }
    .type-column {
      width: 3.5em;
    }
  }

  & > thead > th {
    font-weight: bold;
    border-bottom: var(--table-border-settings);
  }

  & > tbody > tr {
    &.content-row--odd, &.buff-row--odd {
      background-color: var(--table-border-color);
    }

    &.buff-row {
      overflow-x: auto;
    }
  }
}
</style>
