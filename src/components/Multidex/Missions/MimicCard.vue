<template>
  <description-card-base
    :entry="mission.mimic_info"
    materialColor="deep-orange"
    :titleHtmlGenerator="() => 'Mimic Info'"
    :treeOptions="{ maxDepth: 1 }"
    :tabNames="['Translation', 'JSON'].filter(val => val)">
    <template slot="translation">
      <template v-if="mimicData.length === 0">
        <p class="title">No mimic data found.</p>
      </template>
      <template v-else>
        <h2 class="subheading"><b>Possible Mimic Encounters</b></h2>
        <v-list two-line style="background-color: transparent;">
          <v-list-tile
            v-for="(entry, i) in mimicData"
            :key="i"
            exact
            :to="getUnit(entry.group).name ? getMultidexPathTo(entry.group) : undefined">
            <v-list-tile-action>
              <unit-thumbnail
                :src="safeGetImageUrls(entry.group).ills_thum"
                :rarity="getUnit(entry.group).rarity"
                :imageTitle="getUnit(entry.group).name"
                :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                <span>
                  {{ getUnit(entry.group).name || entry.group }}
                </span>
                <b>
                  [{{ entry.chance }}% Chance]
                </b>
                <v-icon v-if="getUnit(entry.group).name" small class="pb-1">fas fa-external-link-alt</v-icon>
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <h3 class="subheading"><b>Mimic Spawn Rate:</b> {{ spawnRate }} chance</h3>
      </template>
    </template>
  </description-card-base>
</template>

<script>
import { mapGetters } from 'vuex';
import { getMimicData } from '@/modules/core/missions';
import { missionMonsterGroupMapping } from '@/modules/constants';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';

export default {
  props: {
    mission: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
    CardTitleWithLink,
    UnitThumbnail,
  },
  computed: {
    ...mapGetters('units', ['getMultidexPathTo', 'getById', 'getImageUrls']),
    monsterGroupMapping: () => missionMonsterGroupMapping,
    mimicData () {
      return getMimicData(this.mission);
    },
    spawnRate () {
      if (!this.mission || !this.mission.mimic_info) {
        return '0%';
      }

      return this.mission.mimic_info.spawn_chance_range_maybe
        .split('~')
        .map(val => `${+val}%`)
        .join('-');
    },
    thumbnailSize () {
      const breakpoint = this.$vuetify.breakpoint;
      if (breakpoint.mdAndUp) {
        return 48;
      } else {
        return 36;
      }
    },
  },
  methods: {
    getUnit (id = '') {
      return this.getById(id) || {};
    },
    safeGetImageUrls (id = '') {
      if (!this.getById(id)) {
        return {};
      }
      return this.getImageUrls(id);
    },
  },
};
</script>
