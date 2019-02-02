<template>
  <v-container>
    <!-- TODO: check that units, items, and es modules exist -->
    <v-layout row wrap>
      <v-flex>
        <v-card class="pa-2">
          <v-layout row>
            <v-flex>
              <h1 class="title">
                {{ sampleSquad.name }}
              </h1>
            </v-flex>
            <v-spacer/>
            <v-flex style="flex-grow: 0;">
              <h2 class="subheading">
                {{ squadCost }} cost
              </h2>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex
              v-for="(unit, i) in sampleSquad.units"
              :key="[JSON.stringify(unit), i].join('-')"
              xs12 sm6
              class="d-flex py-1"
              style="align-items: center; border: 1px solid var(--background-color-alt);">
              <v-flex :style="`flex-grow: 0!important;`">
                <unit-thumbnail
                  class="ma-2"
                  :isLeader="i === sampleSquad.lead"
                  :isFriend="i === sampleSquad.friend"
                  :src="getImageUrls(unit.id).ills_battle"
                  :rarity="getUnit(unit.id).rarity"
                  :imageTitle="getUnit(unit.id).name || unit.id"
                  :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
              </v-flex>
              <v-layout column>
                <!-- name and leader/friend icon -->
                <v-layout align-center>
                  <v-flex class="d-flex-container align-center">
                    <span v-if="getUnit(unit.id).rarity < 8">{{ getUnit(unit.id).rarity }}</span>
                    <rarity-icon
                      :class="{ 'ml-1': getUnit(unit.id).rarity !== 8, 'mr-1': true, }"
                      :rarity="getUnit(unit.id).rarity || 0"
                      :displaySize="22"/>
                    <span class="font-weight-medium">{{ getUnit(unit.id).name || unit.id }}</span>
                  </v-flex>
                  <v-spacer/>
                  <v-flex
                    v-if="i === sampleSquad.lead || i === sampleSquad.friend"
                    style="flex-grow: 0;">
                    <leader-icon
                      v-if="i === sampleSquad.lead"
                      :displaySize="18"/>
                    <friend-icon
                      v-else-if="i === sampleSquad.friend"
                      :displaySize="18"/>
                  </v-flex>
                </v-layout>
                <!-- extra skill -->
                <v-layout align-center>
                  <v-layout style="flex-grow: 0;" align-center justify-center>
                    <extra-skill-icon
                      :inactive="!unit.es"
                      :displaySize="22"
                      class="mr-1"/>
                  </v-layout>
                  <v-flex>
                    {{ getExtraSkill(unit.es).name || 'No Extra Skill' }}
                  </v-flex>
                </v-layout>
                <!-- spheres -->
                <v-layout row wrap align-center>
                  <v-layout
                    v-for="(sphereId, i) in (unit.spheres.length > 0 ? unit.spheres : ['No Sphere'])"
                    :key="`${sphereId}-${i}`"
                    align-center>
                    <v-layout style="flex-grow: 0;" align-center justify-center>
                      <sphere-type-icon
                        :category="getItem(sphereId)['sphere type']"
                        :displaySize="22"
                        class="mr-1"/>
                    </v-layout>
                    <v-flex>
                      {{ getItem(sphereId).name || sphereId }}
                    </v-flex>
                  </v-layout>
                </v-layout>
                
                <!-- SP -->
                <v-layout v-if="unit.sp">
                  <v-flex style="flex-grow: 0;" class="mr-1">
                    {{ getSpCost(unit.id, unit.sp) }} SP:
                  </v-flex>
                  <v-flex
                    v-for="category in getSpCategories(unit.id, unit.sp)"
                    :key="`${category}-${unit.id}-${i}`"
                    style="flex-grow: 0;">
                    <sp-icon
                      :category="category"
                      :displaySize="22"/>
                  </v-flex>
                </v-layout>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import RarityIcon from '@/components/Multidex/RarityIcon';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import LeaderIcon from '@/components/Multidex/MiniLeaderIcon';
import FriendIcon from '@/components/Multidex/MiniFriendIcon';
import ExtraSkillIcon from '@/components/Multidex/ExtraSkillIcon';
import SpIcon from '@/components/Multidex/Units/SpIcon';
import { spCodeToIndex } from '@/modules/core/units';

export default {
  components: {
    UnitThumbnail,
    RarityIcon,
    SphereTypeIcon,
    LeaderIcon,
    FriendIcon,
    ExtraSkillIcon,
    SpIcon,
  },
  computed: {
    ...mapGetters('units', {
      getImageUrls: 'getImageUrls',
    }),
    thumbnailSize () {
      return 64;
    },
    iconSize () {
      return 22;
    },
    sampleSquad: () => ({
      id: Math.random().toString().split('.')[1],
      name: 'Example Squad',
      lead: 0,
      friend: 3,
      units: (new Array(6))
        .fill(0)
        .map((_, i) => ({
          id: `${i+1}0017`,
          es: i % 5 && '1013600',
          spheres: [i % 3 && '47410', i % 2 && '61070'].filter(v => v),
          sp: i < 3 && 'ACDE',
          bbOrder: i,
          bbType: ['bb', 'sbb', 'ubb'][Math.floor(Math.random() * 3)],
        })),
    }),
    squadCost () {
      return this.sampleSquad.units
        .map(({ id }) => this.units[id] || {})
        .reduce((acc, unit) => acc + (+(unit.cost || 0)), 0);
    },
  },
  data () {
    return {
      units: {},
      items: {},
      extraSkills: {},
    };
  },
  async created () {
    const unitIds = new Set(), esIds = new Set(), itemIds = new Set();
    this.sampleSquad.units.forEach(unit => {
      unitIds.add(unit.id);
      if (unit.es) {
        esIds.add(unit.es);
      }
      if (unit.spheres.length > 0) {
        unit.spheres.forEach(id => {
          itemIds.add(id);
        });
      }
    });

    this.units = await this.getUnits({ ids: Array.from(unitIds) });
    this.items = await this.getItems({ ids: Array.from(itemIds) });
    this.extraSkills = await this.getExtraSkills({ ids: Array.from(esIds) });
  },
  methods: {
    ...mapActions('units', {
      getUnits: 'getByIds',
    }),
    ...mapActions('items', {
      getItems: 'getByIds',
    }),
    ...mapActions('extraSkills', {
      getExtraSkills: 'getByIds',
    }),
    getUnit (id) {
      return this.units[id] || {};
    },
    getItem (id) {
      return this.items[id] || {};
    },
    getExtraSkill (id) {
      return this.extraSkills[id] || {};
    },
    getSpCategories (id, enhancements = '') {
      const feSkills = this.units[id] && this.units[id].feskills;
      if (!feSkills || !enhancements) {
        return [];
      }
      const filteredSkills = enhancements.split('')
        .map(char => feSkills[spCodeToIndex(char)])
        .filter(v => v)
        .map(s => +s.category);
      return Array.from(new Set(filteredSkills));
    },
    getSpCost (id, enhancements = '') {
      const feSkills = this.units[id] && this.units[id].feskills;
      if (!feSkills || !enhancements) {
        return 0;
      }

      return enhancements.split('')
        .map(char => feSkills[spCodeToIndex(char)])
        .filter(v => v)
        .reduce((acc, s) => acc + +s.skill.bp, 0);
    },
  },
};
</script>
