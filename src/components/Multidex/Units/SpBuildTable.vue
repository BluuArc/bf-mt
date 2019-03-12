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
            v-model="selectedSpEntries"
            :value="spIndexToCode(index)"
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
  // getSpEntryWithId,
  getSpDescription,
  getSpDependencyText,
} from '@/modules/core/units';
import { Logger } from '@/modules/Logger';
import debounce from 'lodash/debounce';
import SpIcon from '@/components/Multidex/Units/SpIcon';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';

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
    allEnhancementsSum () {
      return getSpCost(this.feSkills, this.feSkills.map((_, i) => spIndexToCode(i)).join(''));
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
      logger.debug(this.overallState);
      // if (this.overallState === 'all') {
      //   Object.keys(this.activeSkills)
      //     .forEach(key => {
      //       // this.toggleSkill(key, false);
      //     });
      // } else {
      //   Object.keys(this.feSkills)
      //     .forEach((s, i) => {
      //       // this.toggleSkill(i, true);
      //     });
      // }
    },
    computeActiveSum: debounce(function () {
      this.activeSkillSum = getSpCost(this.feSkills, this.value);
    }, 50),
  },
  watch: {
    value: {
      immediate: true,
      handler (newValue) {
        this.selectedSpEntries = newValue.split('');
      },
    },
    selectedSpEntries (newValue) {
      const enhancementCode = newValue.join('');
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

  // .v-input--checkbox {
  //   margin-top: 0;
  //   padding-left: 4px;

  //   .v-input__control {
  //     text-align: center;
  //   }

  //   .v-input__slot {
  //     margin-bottom: 0;
  //   }

  //   .v-messages {
  //     display: none;
  //   }
  // }

  & > thead > th {
    font-weight: bold;
    border-bottom: var(--table-border-settings);
  }

  & > tbody > tr {
    // padding-top: 8px;
    // padding-bottom: 8px;
    // padding-right: 8px;
    &:nth-child(odd) {
      background-color: var(--table-border-color);

      // & > td {
      //   background-color: var(--table-border-color);
      // }
    }
  }
}
</style>
