<template>
  <v-layout row wrap class="unit-entry-editor">
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
            <v-btn
              block
              @click="setPosition(position)"
              :color="position === activeUnit.position ? 'primary' : undefined">
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
        @input="setLeadFriendStatus"
        label="Leader or Friend?"/>
    </v-flex>
    <v-flex xs6 sm4>
      <v-layout align-items-center>
        <v-flex style="flex: none;" class="d-flex-container items-center">
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
        <v-flex style="flex: none;" class="d-flex-container items-center">
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
    <v-layout row style="width: 100%; padding-bottom: 8px;" wrap>
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
      <v-flex xs12 sm6>
        <v-layout row wrap align-center fill-height>
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
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 v-if="$vuetify.breakpoint.smAndUp">
        <v-subheader>Spheres</v-subheader>
      </v-flex>
      <v-flex xs12 sm6>
        <v-layout column>
          <v-flex v-if="$vuetify.breakpoint.xsOnly">
            <v-subheader>Sphere 1</v-subheader>
          </v-flex>
          <v-flex>
            <sphere-card
              :key="(sphereData[0] || emptySphere).id"
              :entry="(sphereData[0] || emptySphere)"
              class="no-highlight ml-1"/>
          </v-flex>
          <v-flex class="px-1">
            <v-btn block @click="activeDialog = 'units'">
              Select Sphere 1
            </v-btn>
          </v-flex>
          <v-flex class="px-1">
            <v-btn block :disabled="!sphereData[0]">
              Clear Sphere 1
            </v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12 sm6>
        <v-layout column>
          <v-flex v-if="$vuetify.breakpoint.xsOnly">
            <v-subheader>Sphere 2</v-subheader>
          </v-flex>
          <v-flex>
            <sphere-card
              :key="(sphereData[1] || emptySphere).id"
              :entry="(sphereData[1] || emptySphere)"
              class="no-highlight ml-1"/>
          </v-flex>
          <v-flex class="px-1">
            <v-btn block @click="activeDialog = 'units'">
              Select Sphere 2
            </v-btn>
          </v-flex>
          <v-flex class="px-1">
            <v-btn block :disabled="!sphereData[1]">
              Clear Sphere 2
            </v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-layout column style="width: 100%;">
      <v-flex>
        <v-subheader>
          <span>SP Enhancements</span>
          <span v-if="activeUnit.sp" class="pl-1">
            ({{ activeUnit.sp }})
          </span>
        </v-subheader>
      </v-flex>
      <v-flex>
        <sp-build-table
          v-if="unitData.feskills"
          :value="activeUnit.sp"
          :feSkills="unitData.feskills"/>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
import UnitCard from '@/components/Multidex/Units/EntryCard';
import ExtraSkillCard from '@/components/Multidex/ExtraSkills/EntryCard';
import SphereCard from '@/components/Multidex/Items/EntryCard';
import SpBuildTable from '@/components/Multidex/Units/SpBuildTable';
import { Logger } from '@/modules/Logger';
import { squadFillerMapping, unitPositionMapping, squadUnitActions } from '@/modules/constants';
import { isValidUnit, getFillerUnit } from '@/modules/core/units';
import { isValidSkill, getEmptySkill } from '@/modules/core/extra-skills';
import { isValidSphere, getEmptySphere } from '@/modules/core/items';
import { cloneSquad, sortUnitsByPosition } from '@/modules/core/squads';

const logger = new Logger({ prefix: '[UnitEntryEditor]' });
export default {
  mixins: [GettersMixin],
  components: {
    UnitCard,
    ExtraSkillCard,
    SphereCard,
    SpBuildTable,
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
      return this.localSquad.units[this.selectedIndex] || {};
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
    sphereData () {
      return this.activeUnit.spheres.map(sphereId => {
        const initialData = this.getItem(sphereId);
        return isValidSphere(initialData)
          ? initialData
          : this.emptySphere;
      });
    },
    emptySphere () {
      return getEmptySphere();
    },
    unitPositionMapping: () => unitPositionMapping,
    squadFillerMapping: () => squadFillerMapping,
    leadFriendPossibilities: () => ['Leader', 'Friend', 'Neither'],
    leadFriendStatus () {
      return [
        this.localSquad.lead === this.selectedIndex && 'Leader',
        this.localSquad.friend === this.selectedIndex && 'Friend',
        'Neither',
      ].find(v => v);
    },
    bbOrderPossibilities: () => Object.freeze(new Array(6).fill(0).map((_, i) => i + 1)),
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
    emitUnits (units = [], newIndex) {
      this.$emit('newunits', { units, newIndex: !isNaN(newIndex) ? newIndex : this.selectedIndex });
    },
    emitSquad (squad = {}, newIndex) {
      this.$emit('newsquad', { squad, newIndex: !isNaN(newIndex) ? newIndex : this.selectedIndex });
    },
    setPosition (position) {
      const { units } = this.localSquad;
      const unitToSwap = units.find(u => u.position === position);
      if (unitToSwap && unitToSwap !== this.activeUnit) {
        const otherUnits = units.filter((u, i) => i !== this.selectedIndex && u !== unitToSwap);
        const newUnitList = sortUnitsByPosition([
          ...otherUnits,
          {
            ...unitToSwap,
            position: this.activeUnit.position,
          },
          {
            ...this.activeUnit,
            position,
          },
        ], false);

        const newIndex = unitPositionMapping.indexOf(position);
        this.emitUnits(newUnitList, newIndex);
      }
    },
    setLeadFriendStatus (status) {
      const { lead, friend } = this.localSquad;
      const getEmptyIndex = () => this.localSquad.units
        .findIndex((_, i) => i !== lead && i !== friend && i !== this.selectedIndex);
      if (status === 'Leader') {
        if (friend === this.selectedIndex) {
          this.localSquad.friend = lead;
        }
        this.localSquad.lead = this.selectedIndex;
      } else if (status === 'Friend') {
        if (lead === this.selectedIndex) {
          this.localSquad.lead = friend;
        }
        this.localSquad.friend = this.selectedIndex;
      } else {
        // neither
        if (lead === this.selectedIndex) {
          this.localSquad.lead = getEmptyIndex();
        } else if (friend === this.selectedIndex) {
          this.localSquad.friend = getEmptyIndex();
        }
      }

      this.emitSquad(this.localSquad);
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
