<template>
  <buff-expandable-list
    class="squad-buff-expandable-list"
    :sources="unitEntries"
    :getEffectsFromSource="getEffectsForSquadUnit"
    :highlightedBuffIds="highlightedBuffIds"
    :effectType="effectType"
    :getTextForSource="getTextForSourceInSquadUnit"
  >
    <span slot="noentries">
      No entries of type [{{ effectType }}] targeting [{{ targetType }}] were found.
    </span>
    <div
      class="expandable-list-entry--columns-preview"
      slot="allentrypreview"
      slot-scope="{ entries }"
    >
      <div
        class="expandable-list-entry--columns-preview-entry"
        v-for="entry in entries"
        :key="`${entry.source.id}-${entry.source.position}`"
      >
        <v-layout align-content-center row>
          <unit-thumbnail
            class="unit-thumbnail"
            :src="getImageUrls(entry.source.id).ills_battle"
            :rarity="getUnit(entry.source.id).rarity"
            :imageTitle="getUnit(entry.source.id).name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize">
            <template slot="after-image">
              <text
                :x="0"
                :y="thumbnailSize">
                {{ !isNaN(entry.source.bbOrder) ? entry.source.bbOrder : '-' }}
              </text>
            </template>
          </unit-thumbnail>
        </v-layout>
        <v-flex text-xs-center>
          <span class="caption text-no-wrap">{{ entry.source.position }}</span>
        </v-flex>
      </div>
    </div>
    <v-layout
      slot="value-header"
      slot-scope="{ entry }"
      style="max-width: 500px; width: 100%; min-width: 300px;"
      row
    >
      <unit-entry
        xs12
        :index="squad.units.indexOf(entry)"
        :unit="entry"
        :getUnit="getUnit"
        :getItem="getItem"
        :getExtraSkill="getExtraSkill"
        :isLead="squad.units.indexOf(entry) === squad.lead"
        :isFriend="squad.units.indexOf(entry) === squad.friend"
        class="d-flex py-1"
        style="align-items: center; border: 1px solid var(--background-color-alt);"/>
    </v-layout>
  </buff-expandable-list>
</template>

<script>
import { getEffectsListForSquadUnitEntry, generateFillerSquadUnitEntry, getEffectsListBasedOnSquadComposition } from '@/modules/core/squads';
import { mapGetters } from 'vuex';
import { squadBuffTypes, SOURCE_PATH_TO_TEXT_MAPPING, squadFillerMapping } from '@/modules/constants';
import UnitEntry from '@/components/Tools/Squads/SquadUnitEntry';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import BuffExpandableList from '@/components/Multidex/BuffList/GenericBuffExpandableList/BuffExpandableList';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

function generateSquadAsUnitEntry () {
  const baseEntry = generateFillerSquadUnitEntry();
  baseEntry.id = squadFillerMapping.SQUAD;
  baseEntry.position = 'Squad';
  baseEntry.bbOrder = '-';
  return baseEntry;
}

export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    effectType: {
      type: String,
      required: true,
    },
    inputEffectMappingByUnitEntry: {
      type: WeakMap,
      default: () => new WeakMap(),
    },
    highlightedProcs: {
      type: Array,
      default: () => [],
    },
    highlightedPassives: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    UnitThumbnail,
    UnitEntry,
    BuffExpandableList,
  },
  computed: {
    blacklistedKeys: () => [
      'passive id',
      'unknown passive id',
      'proc id',
      'unknown proc id',
      'add to bb',
      'add to sbb',
      'add to ubb',
      'trigger on bb',
      'trigger on sbb',
      'trigger on ubb',
    ],
    ...mapGetters('units', {
      getImageUrls: 'getImageUrls',
    }),
    thumbnailSize () {
      return 48;
    },
    unitEntries () {
      return this.squad.units.concat([generateSquadAsUnitEntry()]);
    },
    effectMappingByUnitEntry () {
      const mapping = new WeakMap();
      this.unitEntries.forEach(unit => {
        let effects = this.inputEffectMappingByUnitEntry.get(unit);
        if (!Array.isArray(effects)) {
          if (unit.id !== squadFillerMapping.SQUAD) {
            effects = getEffectsListForSquadUnitEntry({
              unitEntry: unit,
              target: this.targetType,
              effectType: this.effectType,
              squad: this.squad,
            }, this);
          } else {
            effects = getEffectsListBasedOnSquadComposition({
              target: this.targetType,
              effectType: this.effectType,
              squad: this.squad,
            }, this);
          }
        }
        mapping.set(unit, effects);
      });
      return mapping;
    },
    highlightedBuffIds () {
      let ids = [];
      if (this.effectType === squadBuffTypes.PASSIVE) {
        ids = this.highlightedPassives;
      } else if (this.effectType === squadBuffTypes.PROC) {
        ids = this.highlightedProcs;
      }
      return ids;
    },
  },
  methods: {
    getEffectsForSquadUnit (unit) {
      const effects = this.effectMappingByUnitEntry.get(unit);
      return Array.isArray(effects) ? effects : [];
    },
    getTextForSourceInSquadUnit (path, source) {
      let displayValue = SOURCE_PATH_TO_TEXT_MAPPING[path];
      if (!displayValue) {
        if (path === 'es') {
          displayValue = `Elgif: ${this.getExtraSkill(source.es).name || source.es || path}`;
        } else if (path.startsWith('sphere:')) {
          const sphereId = path.split(':')[1];
          displayValue = `Sphere: ${this.getItem(sphereId).name || sphereId || path}`;
        }
      } else if (path === 'squad.omniBoost') {
        const unitData = this.getUnit(source.id) || {};
        if (unitData.element) {
          displayValue = `Elemental Paradigm (${unitData.element})`;
        }
      }
      return displayValue || path;
    },
  },
};
</script>

<style lang="less">
.squad-buff-expandable-list {
  .expandable-list-entry--columns-preview {
    display: flex;
    margin-left: 1em;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .expandable-list-entry--columns-preview-entry {
    margin: 0 0.5em;
    min-width: 70px;
    image.lazy-actual {
      min-width: 48px;
    }

    .unit-thumbnail {
      flex: 0 1 auto;
      margin: auto;
      font: bold 4.5em sans-serif;
      stroke: black;
      stroke-width: 2px;
      fill: white;
    }
  }
}
</style>
