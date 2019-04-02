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
        <v-layout>
          <unit-entry-editor
            v-if="squad.units[selectedIndex]"
            class="py-2"
            @newunits="($ev) => { selectedIndex = $ev.newIndex; $emit('newunits', $ev.units) }"
            @newsquad="($ev) => { selectedIndex = $ev.newIndex; $emit('newsquad', $ev.squad); }"
            :squad="squad"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :selectedIndex="selectedIndex"/>
          <span v-else>
            Select a unit to edit its details
          </span>
        </v-layout>
      </template>
      <loading-indicator v-else loadingMessage="Loading squad data"/>
    </v-layout>
    <v-divider class="mt-2"/>
    <slot name="card-actions">
      <v-card-actions style="justify-content: space-between;" :disabled="isLoadingInParent">
        <v-btn
          flat
          :disabled="isLoadingInParent"
          @click="onSaveClick">
          <v-icon left>save</v-icon>
          Save Squad
        </v-btn>
        <v-btn
          flat
          :disabled="isLoadingInParent"
          :to="redirectOnCancel ? '/tools/squads' : undefined"
          @click="$emit('cancel')">
          <span>Cancel</span>
        </v-btn>
      </v-card-actions>
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
    redirectOnCancel: {
      type: Boolean,
      default: true,
    },
    squadId: {
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
    async onSaveClick () {
      const resultKey = await this.$store.dispatch('squads/storeSquad', {
        server: this.$store.state.settings.activeServer,
        squad: this.squad,
        id: this.squadId || undefined,
      });
      this.$emit('save', resultKey);
    },
  },
  watch: {
    selectedIndex () {
      this.highlightedIndex = -1;
    },
  },
};
</script>

<style lang="less">
.squad-card--editable {
  .v-card__actions a:not(:hover):before {
    background-color: inherit;
  }
}
</style>
