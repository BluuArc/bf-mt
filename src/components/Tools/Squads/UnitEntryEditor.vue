<template>
  <v-layout row wrap class="unit-entry-editor">
    <v-flex xs12>
      {{ activeUnit }} {{ localSquad }}
    </v-flex>
    <v-layout row style="width: 100%;" wrap>
      <v-flex xs12>
        <v-subheader>Unit</v-subheader>
      </v-flex>
      <v-flex xs12 sm6>
        <unit-card
          :key="unitData.id"
          :entry="unitData"
          class="no-highlight ml-1"/>
      </v-flex>
      <v-layout row wrap grid>
        <v-flex xs12 class="px-1">
          <v-btn block @click="activeDialog = 'units'">
            Select Unit
          </v-btn>
        </v-flex>
        <v-flex sm6 class="px-1">
          <v-btn block :disabled="unitData.name === squadFillerMapping.EMPTY">
            Set Empty
          </v-btn>
        </v-flex>
        <v-flex sm6 class="px-1">
          <v-btn block :disabled="unitData.name === squadFillerMapping.ANY">
            Set Any
          </v-btn>
        </v-flex>
      </v-layout>
    </v-layout>
    <v-flex xs12>
      <v-container fluid grid-list-md class="pa-1">
        <v-flex xs12>
          <v-subheader>Position</v-subheader>
        </v-flex>
        <v-layout row wrap>
          <v-flex
            v-for="position in unitPositionMapping"
            :key="position"
            xs12 sm6>
            <v-btn block :color="position === activeUnit.position ? 'primary' : undefined">
              {{ position }}
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
    <v-flex xs12 sm4>
      <v-select
        class="px-1"
        :value="leadFriendStatus"
        :items="leadFriendPossibilities"
        label="Leader or Friend?"/>
    </v-flex>
    <v-flex xs6 sm4>
      <v-layout align-items-center>
        <v-flex style="flex-shrink: 0;" class="d-flex-container items-center">
          <v-subheader class="pl-1" style="flex: auto;">BB Order</v-subheader>
        </v-flex>
        <v-flex class="d-flex-container items-center">
        <v-select
          class="pr-1"
          :value="activeUnit.bbOrder"
          :items="bbOrderPossibilities"/>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex xs6 sm4>
      <v-layout align-items-center>
        <v-flex style="flex-shrink: 0;" class="d-flex-container items-center">
          <v-subheader class="pl-1" style="flex: auto;">Action</v-subheader>
        </v-flex>
        <v-flex class="d-flex-container items-center">
        <v-select
          class="pr-1"
          :value="activeUnit.bbType"
          :items="actionPossibilities"/>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex xs12>
      <v-layout row style="width: 100%;" wrap>
      <v-flex xs12>
        <v-subheader>Extra Skill</v-subheader>
      </v-flex>
      <v-flex xs12 sm6>
        <extra-skill-card
          :showAssociatedUnits="false"
          :key="esData.id"
          :entry="esData"
          class="no-highlight ml-1"/>
      </v-flex>
      <v-layout row wrap align-center>
        <v-flex xs12 class="px-1">
          <v-btn block @click="activeDialog = 'units'">
            Select Extra Skill
          </v-btn>
        </v-flex>
        <v-flex xs12 class="px-1">
          <v-btn block :disabled="esData.id === 0">
            Clear Extra Skill
          </v-btn>
        </v-flex>
      </v-layout>
    </v-layout>
    </v-flex>
    <v-layout row wrap>
      <v-flex xs12 sm6>
        Sphere 1 Selector {{ activeUnit.spheres[0] }}
      </v-flex>
      <v-flex xs12 sm6>
        Sphere 2 Selector {{ activeUnit.spheres[1] }}
      </v-flex>
    </v-layout>
    <v-flex xs12>
      SP Builder {{ activeUnit.sp }}
    </v-flex>
  </v-layout>
</template>

<script>
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
import UnitCard from '@/components/Multidex/Units/EntryCard';
import ExtraSkillCard from '@/components/Multidex/ExtraSkills/EntryCard';
import { Logger } from '@/modules/Logger';
import { squadFillerMapping, unitPositionMapping, squadUnitActions } from '@/modules/constants';
import { isValidUnit, getFillerUnit } from '@/modules/core/units';
import { isValidSkill, getEmptySkill } from '@/modules/core/extra-skills';
import { cloneSquad } from '@/modules/core/squads';

const logger = new Logger({ prefix: '[UnitEntryEditor]' });
export default {
  mixins: [GettersMixin],
  components: {
    UnitCard,
    ExtraSkillCard,
  },
  props: {
    squad: {
      type: Object,
      required: true,
    },
    selectedIndex: {
      type: Number,
      default: -1,
    },
  },
  computed: {
    activeUnit () {
      return this.squad.units[this.selectedIndex] || {};
    },
    unitData () {
      const initialData = this.getUnit(this.activeUnit.id);
      return isValidUnit(initialData)
        ? initialData
        : getFillerUnit(this.activeUnit.id === squadFillerMapping.EMPTY);
    },
    esData () {
      const initialData = this.getExtraSkill(this.activeUnit.es);
      return isValidSkill(initialData)
        ? initialData
        : getEmptySkill();
    },
    unitPositionMapping: () => unitPositionMapping,
    squadFillerMapping: () => squadFillerMapping,
    leadFriendPossibilities: () => ['Leader', 'Friend', 'Neither'],
    leadFriendStatus () {
      return [
        this.squad.lead === this.selectedIndex && 'Leader',
        this.squad.friend === this.selectedIndex && 'Friend',
        'Neither',
      ].find(v => v);
    },
    bbOrderPossibilities: () => Object.freeze(new Array(6).fill(0).map((_, i) => i)),
    actionPossibilities: () => [
      {
        text: 'None',
        value: squadUnitActions.NONE,
      },
      {
        text: 'Attack',
        value: squadUnitActions.ATK,
      },
      {
        text: 'BB',
        value: squadUnitActions.BB,
      },
      {
        text: 'SBB',
        value: squadUnitActions.SBB,
      },
      {
        text: 'UBB',
        value: squadUnitActions.UBB,
      },
    ],
  },
  data () {
    return {
      activeDialog: '',
      localSquad: {},
    };
  },
  methods: {
    onSelectUnit (input) {
      logger.warn(input);
      this.activeDialog = '';
    },
  },
  watch: {
    squad: {
      immediate: true,
      deep: true,
      handler (value) {
        this.localSquad = cloneSquad(value);
      },
    },
  },
};
</script>

<style lang="less" scoped>
.unit-entry-editor {
  & > * {
    border: 1px solid var(--background-color-alt);
  }
}
</style>
