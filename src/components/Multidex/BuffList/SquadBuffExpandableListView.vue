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
          class="px-2"
          @click="activeSelector = 'procs'"
          style="cursor: pointer;"
        >
          <v-combobox
            :value="filterOptions.procs"
            disabled
            label="Highlight Active Buffs"
            hint="Empty selection is equivalent to showing all."
            multiple
            persistent-hint/>
        </v-flex>
        <v-flex
          xs12 md6
          class="px-2"
          @click="activeSelector = 'passives'"
          style="cursor: pointer;"
        >
          <v-combobox
            :value="filterOptions.passives"
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
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :squad="squad"
            :targetType="possibleTables[tableConfigIndex].targetType"
            :effectType="possibleTables[tableConfigIndex].effectType"
          />
        </dd>
      </template>
    </dl>
  </span>
</template>

<script>
import { targetTypes, squadBuffTypes } from '@/modules/constants';
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
