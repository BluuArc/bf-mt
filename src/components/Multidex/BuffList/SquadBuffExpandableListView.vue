<template>
  <span class="squad-buff-expandable-list-view">
    <v-expansion-panel class="order-configuration-panel">
      <v-expansion-panel-content>
        <div slot="header">
          Reorder Buff Lists
        </div>
        <section>
          <order-configurator
            v-model="buffTables"
            :getEntryName="(configIndex) => possibleTables[configIndex].name"
            :fullValueSet="defaultBuffTables"
          />
          <section>
            <v-btn flat @click="buffTables = buffTables.concat(defaultBuffTables.filter((_, i) => !buffTables.includes(i)))">Show All</v-btn>
            <v-btn flat @click="buffTables = []">Hide All</v-btn>
            <v-btn flat @click="buffTables = defaultBuffTables.slice()">Reset to Default</v-btn>
          </section>
        </section>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <section class="buff-configuration-area my-2">
      <proc-selector
        :showSelector="activeSelector === 'procs'"
        @toggleview="$show => activeSelector = $show ? 'procs' : ''"
        v-model="filterOptions"
        :filterHelper="filterHelper"
      />
      <passive-selector
        :showSelector="activeSelector === 'passives'"
        @toggleview="$show => activeSelector = $show ? 'passives' : ''"
        v-model="filterOptions"
        :filterHelper="filterHelper"
      />
      <div class="px-2" style="font-weight: bold;">Buff Highlighting</div>
      <v-layout row wrap>
        <v-flex
          xs12 md6
          @click="activeSelector = 'procs'"
          style="cursor: pointer;"
        >
          <v-combobox
            :value="filterOptions.procs"
            class="mx-2"
            disabled
            label="Highlight Active Buffs"
            hint="Empty selection is equivalent to showing all."
            multiple
            persistent-hint/>
        </v-flex>
        <v-flex
          xs12 md6
          @click="activeSelector = 'passives'"
          style="cursor: pointer;"
        >
          <v-combobox
            :value="filterOptions.passives"
            class="mx-2"
            disabled
            label="Highlight Passive Buffs"
            hint="Empty selection is equivalent to showing all."
            multiple
            persistent-hint/>
        </v-flex>
      </v-layout>
    </section>
    <dl>
      <template v-for="tableConfigIndex in buffTables">
        <dt
          class="title"
          :style="buffGroupTitleStyle"
          :key="`${possibleTables[tableConfigIndex].targetType}-${possibleTables[tableConfigIndex].effectType}-title`"
          v-text="possibleTables[tableConfigIndex].name"
        />
        <dd :key="`${possibleTables[tableConfigIndex].targetType}-${possibleTables[tableConfigIndex].effectType}-table`">
          <squad-buff-expandable-list
            :key="getEffectTypeKey(possibleTables[tableConfigIndex].effectType)"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :squad="squad"
            :targetType="possibleTables[tableConfigIndex].targetType"
            :effectType="possibleTables[tableConfigIndex].effectType"
            :effectMappingByUnitEntry="effectMappingByTable.get(getTableKey(possibleTables[tableConfigIndex].targetType, possibleTables[tableConfigIndex].effectType))"
            :highlightedProcs="filterOptions.procs"
            :highlightedPassives="filterOptions.passives"
          />
        </dd>
      </template>
    </dl>
  </span>
</template>

<script>
import { targetTypes, squadBuffTypes } from '@/modules/constants';
import { getEffectsListForSquadUnitEntry } from '@/modules/core/squads';
import { getEffectId } from '@/modules/EffectProcessor/processor-helper';
// import { getEffectName } from '@/modules/core/buffs';
import FilterOptionsHelper from '@/modules/FilterOptionsHelper';
import SquadBuffExpandableList from '@/components/Multidex/BuffList/SquadBuffExpandableList';
import OrderConfigurator from '@/components/OrderConfigurator';
import ProcSelector from '@/components/Multidex/Filters/BuffSelector/ProcSelector';
import PassiveSelector from '@/components/Multidex/Filters/BuffSelector/PassiveSelector';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
    topNavbarHeight: {
      type: Number,
      default: 56,
    },
  },
  components: {
    SquadBuffExpandableList,
    OrderConfigurator,
    ProcSelector,
    PassiveSelector,
  },
  computed: {
    buffGroupTitleStyle () {
      return {
        top: `${this.topNavbarHeight}px`,
      };
    },
    possibleTables: () => Object.freeze([
      {
        name: 'Party Passives',
        targetType: targetTypes.PARTY,
        effectType: squadBuffTypes.PASSIVE,
      },
      {
        name: 'Party Buffs',
        targetType: targetTypes.PARTY,
        effectType: squadBuffTypes.PROC,
      },
      {
        name: 'For the Enemy',
        targetType: targetTypes.ENEMY,
        effectType: squadBuffTypes.PROC,
      },
      {
        name: 'Self Passives',
        targetType: targetTypes.SELF,
        effectType: squadBuffTypes.PASSIVE,
      },
      {
        name: 'Self Buffs',
        targetType: targetTypes.SELF,
        effectType: squadBuffTypes.PROC,
      },
      {
        name: 'Other Passives',
        targetType: targetTypes.OTHER,
        effectType: squadBuffTypes.PASSIVE,
      },
      {
        name: 'Other Buffs',
        targetType: targetTypes.OTHER,
        effectType: squadBuffTypes.PROC,
      },
    ]),
    defaultBuffTables () {
      return Object.freeze(this.possibleTables.map((_, i) => i));
    },
    effectMappingByTable () {
      const allProcIds = new Set();
      const allPassiveIds = new Set();
      const tableMapping = new Map();
      const { squad } = this;
      const unitEntries = squad.units;
      this.possibleTables.forEach(({ targetType, effectType }) => {
        const effectMappingByUnit = new WeakMap();
        unitEntries.forEach(entry => {
          const effects = getEffectsListForSquadUnitEntry({
            unitEntry: entry,
            target: targetType,
            effectType,
            squad,
          }, this);
          effects.forEach(effect => {
            if (effectType === squadBuffTypes.PROC) {
              allProcIds.add(getEffectId(effect));
            } else if (effectType === squadBuffTypes.PASSIVE) {
              allPassiveIds.add(getEffectId(effect));
            }
          });
          effectMappingByUnit.set(entry, effects);
        });
        tableMapping.set(this.getTableKey(targetType, effectType), effectMappingByUnit);
      });

      tableMapping.set('allProcs', Array.from(allProcIds).sort((a, b) => +a - +b));
      tableMapping.set('allPassives', Array.from(allPassiveIds).sort((a, b) => +a - +b));
      return tableMapping;
    },
  },
  data () {
    return {
      buffTables: [],
      filterOptions: {
        procs: ['1', '2', '3'],
        passives: [],
      },
      activeSelector: '',
      filterHelper: new FilterOptionsHelper(),
    };
  },
  created () {
    this.buffTables = this.defaultBuffTables.slice();
  },
  methods: {
    getTableKey (targetType, effectType) {
      return `${targetType}-${effectType}`;
    },
    getEffectTypeKey (effectType) {
      let key = '';
      if (effectType === squadBuffTypes.PROC) {
        key = this.filterOptions.procs.join('-');
      } else if (effectType === squadBuffTypes.PASSIVE) {
        key = this.filterOptions.passives.join('-');
      }
      return key;
    },
  },
};
</script>


<style lang="less">
.squad-buff-expandable-list-view {
  .order-configuration-panel {
    .v-expansion-panel__header {
      padding-left: 8px;
      padding-right: 8px;
      font-weight: bold;
    }
  }
  dl {
    width: 100%;

    > dt {
      position: sticky;
      background: var(--background-color);
      z-index: 1;
      padding: 0.75em 0.25em;
      margin: 0 -0.25em;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }

  dd {
    // width: 100%;
    overflow-x: auto;
  }
}
</style>