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
      <tr
        v-for="(spEntry, index) in feSkills"
        :key="index">
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
          <span class="d-block" v-html="getSpDescription(index)"/>
          <i v-if="spEntry.dependency">
            {{ getSpDependencyText(spEntry) }}
          </i>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import {
  getSpEntryEffects,
  spIndexToCode,
  // spCodeToIndex,
  getSpCost,
  getAllDependenciesFromSpEntry,
  getAllEntriesThatDependOnSpEntry,
  getSpDescription,
  getSpDependencyText,
} from '@/modules/core/units';
import { Logger } from '@/modules/Logger';
import debounce from 'lodash/debounce';
import SpIcon from '@/components/Multidex/Units/SpIcon';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[SpBuildTable]' });
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
        .map(s => this.getSpEffects(s))
        .reduce((acc, val) => acc.concat(val), []);
    },
  },
  data () {
    return {
      selectedSpEntries: [],
      activeSkillSum: 0,
      showTables: [],
      effectCache: new WeakMap(),
    };
  },
  methods: {
    getSpEffects (spEntry) {
      if (!this.effectCache.has(spEntry)) {
        this.effectCache.set(spEntry, getSpEntryEffects(spEntry));
      }
      return this.effectCache.get(spEntry);
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
      logger.warn('code', enhancementCode, this.value);
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
    &:nth-child(even) {
      background-color: var(--table-border-color);
    }
  }
}
</style>
