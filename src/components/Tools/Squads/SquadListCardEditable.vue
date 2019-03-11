<template>
  <v-card class="squad-card--editable" v-bind="$attrs">
    <v-layout row class="px-2 pt-2" align-center>
      <v-flex>
        <v-text-field v-model="squad.name" label="Squad Name"/>
      </v-flex>
      <v-flex style="flex-grow: 0;" class="ml-2">
        <h2 class="subheading">
          {{ squadCost }} Cost
        </h2>
      </v-flex>
    </v-layout>
    <v-layout row class="pa-2">
      <v-flex>Select a unit to edit its details.</v-flex>
    </v-layout>
    <v-layout row wrap class="px-2" @mouseleave="highlightedIndex = -1">
      <template v-if="!isLoadingInParent">
        <unit-entry
          v-for="(unit, i) in fullUnits"
          :key="getUnitEntryKey(unit, i)"
          xs12 sm6
          :index="i"
          :unit="unit"
          :getUnit="getUnit"
          :getItem="getItem"
          :getExtraSkill="getExtraSkill"
          :isLead="i === squad.lead"
          :isFriend="i === squad.friend"
          @mouseover="highlightedIndex = i;"
          @click="() => { selectedIndex = (selectedIndex !== i ? i : -1) }"
          class="d-flex py-1"
          :style="`
            align-items: center;
            border: 1px solid ${selectedIndex === i ? 'yellow' : 'var(--background-color-alt)'};
            position: relative;`">
          <div
            slot="before-content"
            v-show="highlightedIndex === i"
            :style="`
              position: absolute;
              width: 100%;
              height: 100%;
              z-index: 10;
              cursor: pointer;
            `">
            <v-container
              fluid justify-center
              fill-height
              style="background: rgba(0, 0, 0, 0.5);">
              <v-flex align-center>
                <v-btn flat block style="pointer-events: none;">
                  <v-icon left>create</v-icon>
                  Edit
                </v-btn>
              </v-flex>
            </v-container>
          </div>
        </unit-entry>
        <v-flex v-if="squad.units[selectedIndex]" xs12 class="py-1">
          <v-divider/>
        </v-flex>
        <unit-entry-editor
          v-if="squad.units[selectedIndex]"
          class="py-2"
          :squad="squad"
          :getUnit="getUnit"
          :getItem="getItem"
          :getExtraSkill="getExtraSkill"
          :selectedIndex="selectedIndex"/>
        <!-- <v-layout row wrap class="pa-2" v-if="squad.units[selectedIndex]">
          <v-flex xs12>
            {{ squad.units[selectedIndex] }}
          </v-flex>
          <v-flex xs12>
            Unit selector
          </v-flex>
          <v-flex xs12 sm4>
            Position Selector
          </v-flex>
          <v-flex xs6 sm4>
            BB Order Selector
          </v-flex>
          <v-flex xs6 sm4>
            BB Type Selector
          </v-flex>
          <v-flex xs12>
            Extra Skill selector
          </v-flex>
          <v-flex xs12 sm6>
            Sphere 1 Selector
          </v-flex>
          <v-flex xs12 sm6>
            Sphere 2 Selector
          </v-flex>
          <v-flex xs12>
            SP Builder
          </v-flex>
        </v-layout> -->
      </template>
      <loading-indicator v-else loadingMessage="Loading squad data"/>
    </v-layout>
    <v-divider class="mt-2"/>
    <slot name="card-actions">
      <!-- <v-card-actions style="justify-content: space-between;">
        <v-btn flat v-if="to" :to="to">View</v-btn>
        <v-btn flat v-else @click="$emit('view')">View</v-btn>
        <v-btn flat @click="$emit('share')">
          <v-icon left>share</v-icon>
          Share
        </v-btn>
      </v-card-actions> -->
    </slot>
  </v-card>
</template>

<script>
import { unitPositionMapping } from '@/modules/constants';
import { generateFillerSquadUnitEntry } from '@/modules/core/squads';
import UnitEntry from '@/components/Tools/Squads/SquadUnitEntry';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
import LoadingIndicator from '@/components/LoadingIndicator';
import UnitEntryEditor from '@/components/Tools/Squads/UnitEntryEditor';

export default {
  mixins: [GettersMixin],
  components: {
    UnitEntry,
    LoadingIndicator,
    UnitEntryEditor,
  },
  props: {
    squad: {
      type: Object,
      required: true,
    },
    isLoadingInParent: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    squadCost () {
      return this.squad.units
        .map(({ id }) => this.getUnit(id))
        .reduce((acc, unit) => acc + (+(unit.cost || 0)), 0);
    },
    // fills empty positions with empty values
    fullUnits () {
      return unitPositionMapping.map(position => {
        let unit = this.squad.units.find(unit => unit.position === position);
        if (!unit) { // empty position, so fill it with empty data
          unit = generateFillerSquadUnitEntry({ isEmpty: true, bbOrder: null, position });
        }
        return unit;
      });
    },
  },
  data () {
    return {
      highlightedIndex: -1,
      selectedIndex: -1,
    };
  },
  methods: {
    getUnitEntryKey (unit = {}, i = 0) {
      return `${JSON.stringify(unit)}-${i}`;
    },
  },
};
</script>
