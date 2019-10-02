<template>
  <base-entry-card :to="to || undefined">
    <v-container fluid class="pa-3 unit-attack-info-entry-card-area">
      <unit-thumbnail
        class="unit-thumbnail"
        :src="getImageUrls(entry.id).ills_thum"
        :rarity="rarity"
        :imageTitle="entry.name"
        :displayWidth="thumbnailSize"
        :displayHeight="thumbnailSize"
      />
      <div class="unit-name d-flex-container items-center">
        <element-icon v-if="entry.element" :element="entry.element" :displaySize="20" class="mr-1"/>
        <h1 class="subheading d-inline-block" style="word-break: break-word;">
          <b v-text="entry.name || entry.id"/>
        </h1>
      </div>
      <div class="attack-chips-container" :data-nonattacker="!hasAnyBurstAttack">
        <template v-if="hasAnyBurstAttack">
          <div v-for="type in BURST_TYPES" :key="type" class="attack-chips--burst-entry">
            <span class="attack-chips--name">
              {{ type.toUpperCase() }}:
            </span>
            <div class="attack-chips--list">
              <template v-if="hasBurstAttack(type)">
                <v-chip
                  v-for="(attack, i) in attackChipsByBurstType[type]"
                  :key="i"
                  small
                  style="pointer-events: none;"
                  :color="getChipColorConfigForBurstType(attack.burstType).color"
                  text-color="white"
                  outline
                >
                  <v-avatar :class="getChipColorConfigForBurstType(attack.burstType).avatarColor">
                    {{ attack.hits }}
                  </v-avatar>
                  {{ attack.label }}
                </v-chip>
              </template>
              <span v-else style="margin-left: 4px;">
                No attacks found.
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <span>No attacks found.</span>
        </template>
      </div>
      <div class="d-flex-container items-center content-flex-end unit-rarity">
        <span v-if="rarity < 8">{{ rarity }}</span>
        <rarity-icon :class="{ 'ml-1': rarity !== 8 }" :rarity="rarity" :displaySize="18"/>
      </div>
    </v-container>
  </base-entry-card>
</template>

<script>
import { mapGetters } from 'vuex';
import { burstTypes } from '@/modules/constants';
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';
import ElementIcon from '@/components/Multidex/ElementIcon';
import RarityIcon from '@/components/Multidex/RarityIcon';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';

const CHIP_COLOR_MAPPING_BY_BURST_TYPE = {
  bb: {
    color: 'blue-grey',
    avatarColor: 'blue-grey darken-1',
  },
  sbb: {
    color: 'amber darken-3',
    avatarColor: 'amber darken-4',
  },
  ubb: {
    color: 'red darken-3',
    avatarColor: 'red darken-4',
  },
};

export default {
  mixins: [EntryCardMixin],
  components: {
    ElementIcon,
    RarityIcon,
    UnitThumbnail,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls']),
    BURST_TYPES: () => burstTypes,
    hasAnyBurstAttack () {
      return !!this.entry && burstTypes.some(t => this.hasBurstAttack(t));
    },
    rarity () {
      return this.entry.rarity;
    },
    thumbnailSize () {
      const breakpoint = this.$vuetify.breakpoint;
      if (breakpoint.xlOnly) {
        return 64;
      } else if (breakpoint.mdAndUp) {
        return 56;
      } else {
        return 48;
      }
    },
    attackChipsByBurstType () {
      const { hasBurstAttack, entry } = this;
      return burstTypes.reduce((acc, burstType) => {
        if (hasBurstAttack(burstType)) {
          const attacks = entry.attackInfo[burstType].map(attack => ({
            hits: attack.hits,
            label: `${attack.target}${attack.sourcePath ? ` (${attack.sourcePath})` : ''}`,
            burstType,
          }));
          acc[burstType] = attacks;
        } else {
          acc[burstType] = [];
        }
        return acc;
      }, {});
    },
  },
  methods: {
    getChipColorConfigForBurstType (type) {
      return CHIP_COLOR_MAPPING_BY_BURST_TYPE[type] || CHIP_COLOR_MAPPING_BY_BURST_TYPE.bb;
    },
    hasBurstAttack (type) {
      return this.entry.attackInfo &&
        Array.isArray(this.entry.attackInfo[type]) &&
        this.entry.attackInfo[type].length >= 1;
    },
  },
};
</script>

<style lang="less">
.unit-attack-info-entry-card-area {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:  "name name rarity"
                        "thumbnail attack attack";
  grid-gap: 0.25em;

  .unit-thumbnail {
    grid-area: thumbnail;
  }

  .unit-name {
    grid-area: name;
  }

  .attack-chips-container {
    grid-area: attack;

    &[data-nonattacker] {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .attack-chips--burst-entry {
      display: grid;
      grid-template-columns: 50px 1fr;
      grid-template-rows: auto;
      grid-row-gap: 0.25em;

      .attack-chips--name {
        display: flex;
        align-items: center;
        font-weight: bold;
      }

      &:not(:last-child) {
        border-bottom: 1px solid var(--background-color-alt);
      }
    }
  }

  .unit-rarity {
    grid-area: rarity;
  }
}
</style>
