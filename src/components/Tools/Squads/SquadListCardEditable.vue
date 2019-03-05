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
          class="d-flex py-1"
          style="align-items: center; border: 1px solid var(--background-color-alt); position: relative;">
          <div
            slot="before-content"
            v-show="highlightedIndex === i"
            @click="$emit('selectedindex', i)"
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
        <slot name="after-squad"/>
      </template>
      <loading-indicator v-else loadingMessage="Loading squad data"/>
    </v-layout>
    <v-divider class="mt-2"/>
    <slot name="card-actions">
      <v-card-actions style="justify-content: space-between;">
        <v-btn flat v-if="to" :to="to">View</v-btn>
        <v-btn flat v-else @click="$emit('view')">View</v-btn>
        <v-btn flat @click="$emit('share')">
          <v-icon left>share</v-icon>
          Share
        </v-btn>
      </v-card-actions>
    </slot>
  </v-card>
</template>

<script>
import { unitPositionMapping } from '@/modules/constants';
import UnitEntry from '@/components/Tools/Squads/SquadUnitEntry';
import LoadingIndicator from '@/components/LoadingIndicator';

export default {
  components: {
    UnitEntry,
    LoadingIndicator,
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
    getUnit: {
      type: Function,
      default: () => ({}),
    },
    getItem: {
      type: Function,
      default: () => ({}),
    },
    getExtraSkill: {
      type: Function,
      default: () => ({}),
    },
    to: {
      type: String,
      default: '',
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
          unit = { position, id: '(Empty)' };
        }

        return unit;
      });
    },
  },
  data () {
    return {
      highlightedIndex: -1,
    };
  },
  methods: {
    getUnitEntryKey (unit = {}, i = 0) {
      return `${JSON.stringify(unit)}-${i}`;
    },
  },
};
</script>
