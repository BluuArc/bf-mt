<template>
  <v-container>
    <!-- TODO: check that units, items, and es modules exist -->
    <v-layout row wrap>
      <v-flex xs12 v-for="squad in squads" :key="squad.id">
        <squad-list-card
          class="ma-2 pa-2"
          :squad="squad"
          :getUnit="getUnit"
          :getItem="getItem"
          :getExtraSkill="getExtraSkill"
        />
        <!-- <v-card class="pa-2">
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
              <v-layout :style="`flex-grow: 0!important;`" column class="mx-2">
                <v-flex text-xs-center v-if="$vuetify.breakpoint.xsOnly">
                  <span class="caption">{{ unit.position }}</span>
                </v-flex>
                <v-flex>
                  <unit-thumbnail
                    :isLeader="i === sampleSquad.lead"
                    :isFriend="i === sampleSquad.friend"
                    :src="getImageUrls(unit.id).ills_battle"
                    :rarity="getUnit(unit.id).rarity"
                    :imageTitle="getUnit(unit.id).name || unit.id"
                    :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
                </v-flex>
                <v-flex class="text-xs-center">
                  <span class="body-1" v-text="`${unit.bbOrder}-${unit.bbType.toUpperCase()}`"/>
                </v-flex>
              </v-layout>
              <v-layout column>
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
        </v-card> -->
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex';
import SquadListCard from '@/components/Tools/Squads/SquadListCard';
import { unitPositionMapping } from '@/modules/constants';

export default {
  components: {
    SquadListCard,
  },
  computed: {
    squads () {
      return (new Array(10))
        .fill(0)
        .map(() => Object.freeze(this.getSampleSquad()));
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
    this.squads.forEach(squad => {
      squad.units.forEach(unit => {
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
    getSampleSquad: () => ({
      id: Math.random().toString().split('.')[1],
      name: 'Example Squad',
      lead: 0,
      friend: 3,
      units: (new Array(6))
        .fill(0)
        .map((_, i) => ({
          position: unitPositionMapping[i],
          id: `${i+1}0017`,
          es: (Math.random() > 0.5) && '1013600',
          spheres: [(Math.random() > 0.5) && '47410', (Math.random() > 0.5) && '61070'].filter(v => v),
          sp: ((Math.random() > 0.5)) && 'ACDE',
          bbOrder: i + 1,
          bbType: ['bb', 'sbb', 'ubb'][Math.floor(Math.random() * 3)],
        })),
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
  },
};
</script>
