<template>
  <v-layout row wrap class="unit-entry-editor">
    <v-dialog
      :value="!!activeDialog"
      @input="activeDialog = ''"
      lazy>
      <unit-selector
        v-if="activeDialog === 'units'"
        @input="$d => setUnit($d.data)"
        @cancel="activeDialog = ''"/>
      <es-selector
        v-else-if="activeDialog === 'extraSkills'"
        @input="$d => setExtraSkill($d.id)"
        @cancel="activeDialog = ''"/>
      <sphere-selector
        v-else-if="activeDialog === 'spheres'"
        @input="$d => onSelectSphere($d.id)"
        @cancel="activeDialog = ''"/>
    </v-dialog>
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
          <v-btn
            block
            @click="setUnit(squadFillerMapping.EMPTY)"
            :disabled="unitData.name === squadFillerMapping.EMPTY">
            Set Empty
          </v-btn>
        </v-flex>
        <v-flex sm6 class="px-1">
          <v-btn
            block
            @click="setUnit(squadFillerMapping.ANY)"
            :disabled="unitData.name === squadFillerMapping.ANY">
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
        :items="leadFriendPossibilities"
        :value="leadFriendStatus"
        @input="setLeadFriendStatus"
        :disabled="isEmptyUnit"
        label="Leader or Friend?"/>
    </v-flex>
    <v-flex xs6 sm4>
      <v-layout align-items-center>
        <v-flex style="flex: none;" class="d-flex-container items-center" id="bb-order-label">
          <v-subheader class="pl-1" style="flex: auto;">BB Order</v-subheader>
        </v-flex>
        <v-flex class="d-flex-container items-center">
        <v-select
          class="pr-1"
          aria-labelledby="bb-order-label"
          :value="activeUnit.bbOrder"
          @input="setBbOrder"
          :items="bbOrderPossibilities"/>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex xs6 sm4>
      <v-layout align-items-center>
        <v-flex style="flex: none;" class="d-flex-container items-center" id="action-label">
          <v-subheader class="pl-1" style="flex: auto;">Action</v-subheader>
        </v-flex>
        <v-flex class="d-flex-container items-center">
        <v-select
          class="pr-1"
          aria-labelledby="action-label"
          :disabled="isEmptyUnit"
          :items="actionPossibilities"
          :value="activeUnit.action"
          @input="setAction"/>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex xs6>
      <v-layout align-items-center>
        <v-flex style="flex: none;" class="d-flex-container items-center" id="type-label">
          <v-subheader class="pl-1" style="flex: auto;">Type</v-subheader>
        </v-flex>
        <v-flex class="d-flex-container items-center">
        <v-select
          class="pr-1"
          aria-labelledby="type-label"
          :disabled="isEmptyUnit"
          :items="typePossibilities"
          :value="activeUnit.type"
          @input="setType"/>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex xs6>
      <v-layout align-items-center>
        <v-flex style="flex: none;" class="d-flex-container items-center" id="boost-label">
          <v-subheader class="pl-1" style="flex: auto;">OE+ Level</v-subheader>
        </v-flex>
        <v-flex class="d-flex-container items-center">
        <v-select
          class="pr-1"
          aria-labelledby="boost-label"
          :disabled="isEmptyUnit || !canEditBoost"
          :items="boostPossibilities"
          :value="activeUnit.omniBoost"
          @input="setOmniBoost"/>
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
            <v-btn block :disabled="isEmptyUnit" @click="activeDialog = 'extraSkills'">
              Select Extra Skill
            </v-btn>
          </v-flex>
          <v-flex xs12 class="px-1">
            <v-btn
              block
              @click="setExtraSkill('')"
              :disabled="esData.id === 0">
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
            <v-btn block :disabled="isEmptyUnit" @click="() => { lastSelectedSphereIndex = 0; activeDialog = 'spheres'; }">
              Select Sphere 1
            </v-btn>
          </v-flex>
          <v-flex class="px-1">
            <v-btn
              @click="setSpheres(activeUnit.spheres.slice(1, 2))"
              block
              :disabled="!sphereData[0]">
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
            <v-btn block :disabled="isEmptyUnit" @click="() => { lastSelectedSphereIndex = 1; activeDialog = 'spheres'; }">
              Select Sphere 2
            </v-btn>
          </v-flex>
          <v-flex class="px-1">
            <v-btn
              block
              @click="setSpheres(activeUnit.spheres.slice(0, 1))"
              :disabled="!sphereData[1]">
              Clear Sphere 2
            </v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-layout column style="width: 100%;" v-if="!isEmptyUnit && Array.isArray(unitData.feskills)">
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
          :value="activeUnit.sp"
          @input="setEnhancements"
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
import UnitSelector from '@/components/Tools/Squads/MultidexSelectors/UnitSelector';
import EsSelector from '@/components/Tools/Squads/MultidexSelectors/ExtraSkillSelector';
import SphereSelector from '@/components/Tools/Squads/MultidexSelectors/SphereSelector';
import { Logger } from '@/modules/Logger';
import { squadFillerMapping, unitPositionMapping, squadUnitActions, UNIT_TYPE_MAPPING } from '@/modules/constants';
import { isValidUnit, getFillerUnit } from '@/modules/core/units';
import { isValidSkill, getEmptySkill } from '@/modules/core/extra-skills';
import { isValidSphere, getEmptySphere } from '@/modules/core/items';
import { cloneSquad, sortUnitsByPosition, fixSquadErrors } from '@/modules/core/squads';

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[UnitEntryEditor]' });
export default {
  mixins: [GettersMixin],
  components: {
    UnitCard,
    ExtraSkillCard,
    SphereCard,
    SpBuildTable,
    UnitSelector,
    EsSelector,
    SphereSelector,
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
    isEmptyUnit () {
      return this.unitData.name === squadFillerMapping.EMPTY;
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
    actionPossibilities () {
      const availableBurstTypes = [
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
      ].filter(({ value }) => this.activeUnit.id === squadFillerMapping.ANY || this.unitData[value] || this.activeUnit.action === value);

      const nonBurstActions = [
        {
          text: 'None',
          value: squadUnitActions.NONE,
        },
        (!this.isEmptyUnit && {
          text: 'Attack',
          value: squadUnitActions.ATK,
        }),
      ].filter(v => v);
      return nonBurstActions.concat(availableBurstTypes);
    },
    typePossibilities: () => ['L', 'A', 'B', 'G', 'O', 'R'].map(type => ({ value: type, text: UNIT_TYPE_MAPPING[type] })),
    boostPossibilities: () => [0, 1, 2, 3],
    canEditBoost () {
      return +this.unitData.rarity === 8 || this.activeUnit.id === squadFillerMapping.ANY;
    },
  },
  data () {
    return {
      activeDialog: '',
      localSquad: {},
      lastSelectedSphereIndex: -1,
    };
  },
  methods: {
    onSelectSphere (sphereId) {
      let spheres = this.activeUnit.spheres.slice();
      if (this.lastSelectedSphereIndex > -1 && !spheres.includes(sphereId) && !spheres.includes(+sphereId)) {
        if (spheres[this.lastSelectedSphereIndex]) {
          spheres[this.lastSelectedSphereIndex] = sphereId;
        } else if (spheres.length < 2) {
          spheres.push(sphereId);
        } else {
          // remove first sphere
          spheres = [spheres[1], sphereId];
        }
        this.setSpheres(spheres);
      }
      this.activeDialog = '';
    },
    emitUnits (units = [], newIndex) {
      this.$emit('newunits', { units, newIndex: !isNaN(newIndex) ? newIndex : this.selectedIndex });
      if (this.activeDialog) {
        this.activeDialog = '';
      }
    },
    emitSquad (squad = {}, newIndex) {
      this.$emit('newsquad', { squad, newIndex: !isNaN(newIndex) ? newIndex : this.selectedIndex });
      if (this.activeDialog) {
        this.activeDialog = '';
      }
    },
    // update an internal value for the current unit
    updateCurrentUnit (newUnitData = {}) {
      this.lastSelectedSphereIndex = -1;
      this.emitUnits([
        ...this.localSquad.units.slice(0, this.selectedIndex),
        {
          ...this.activeUnit,
          ...newUnitData,
        },
        ...this.localSquad.units.slice(this.selectedIndex + 1),
      ]);
    },
    setPosition (position) {
      const { units, lead, friend } = this.localSquad;
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
        this.emitSquad({
          ...this.localSquad,
          lead: this.selectedIndex === lead ? newIndex : lead,
          friend: this.selectedIndex === friend ? newIndex : friend,
          units: newUnitList,
        }, newIndex);
      }
    },
    setLeadFriendStatus (status) {
      const { lead, friend } = this.localSquad;
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
        // allow for squads to have no leader/friend lead
        if (lead === this.selectedIndex) {
          this.localSquad.lead = -1;
        } else if (friend === this.selectedIndex) {
          this.localSquad.friend = -1;
        }
      }

      this.emitSquad(this.localSquad);
    },
    setBbOrder (order) {
      const unitToSwapOrder = this.localSquad.units.find(u => u.bbOrder === order);
      if (unitToSwapOrder && unitToSwapOrder !== this.activeUnit) {
        const otherUnits = this.localSquad.units.filter((u, i) => i !== this.selectedIndex && u !== unitToSwapOrder);
        const newUnitList = sortUnitsByPosition([
          ...otherUnits,
          {
            ...unitToSwapOrder,
            bbOrder: this.activeUnit.bbOrder,
          },
          {
            ...this.activeUnit,
            bbOrder: order,
          },
        ], false);
        this.emitUnits(newUnitList);
      }
    },
    setAction (action) {
      if (this.actionPossibilities.some(({ value }) => action === value)) {
        this.updateCurrentUnit({ action });
      }
    },
    setType (type) {
      this.updateCurrentUnit({ type });
    },
    setOmniBoost (omniBoost) {
      this.updateCurrentUnit({ omniBoost });
    },
    setEnhancements (sp) {
      this.updateCurrentUnit({ sp });
    },
    async setUnit (id) {
      let tempData;
      if (id.then !== undefined) {
        await id.then(data => {
          tempData = data;
        });
      } else {
        tempData = this.getUnit(id);
      }
      if (isValidUnit(tempData) || id === squadFillerMapping.ANY || id === squadFillerMapping.EMPTY) {
        const { lead, friend, name } = this.localSquad;
        // eslint-disable-next-line no-unused-vars
        const { messages, ...squad } = fixSquadErrors({
          lead,
          friend,
          name,
          units: [
            ...this.localSquad.units.slice(0, this.selectedIndex),
            {
              ...this.activeUnit,
              id: (id.then !== undefined && tempData.id) || id,
              sp: '', // reset SP on change
            },
            ...this.localSquad.units.slice(this.selectedIndex + 1),
          ],
        }, {
          getUnit: (inputId) => +inputId === +tempData.id ? tempData : this.getUnit(inputId),
          getExtraSkill: this.getExtraSkill,
          getItem: this.getItem,
        });
        this.emitSquad(squad);
      }
    },
    setExtraSkill (es) {
      this.updateCurrentUnit({ es });
    },
    setSpheres (spheres = []) {
      const newSphereList = spheres.map(id => (id || '').toString()).filter(v => v);
      this.updateCurrentUnit({ spheres: newSphereList });
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
  .v-subheader {
    padding-left: 0;
  }
}
</style>
