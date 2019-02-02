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
              class="d-flex"
              style="align-items: center;">
              <v-flex :style="`flex-grow: 0!important;`">
                <unit-thumbnail
                  class="ma-2"
                  :src="getImageUrls(unit.id).ills_thum"
                  :rarity="getUnit(unit.id).rarity"
                  :imageTitle="getUnit(unit.id).name || unit.id"
                  :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
              </v-flex>
              <v-layout column>
                <v-flex class="d-flex-container items-center">
                  <span v-if="getUnit(unit.id).rarity < 8">{{ getUnit(unit.id).rarity }}</span>
                  <rarity-icon
                    :class="{ 'ml-1': getUnit(unit.id).rarity !== 8, 'mr-1': true }"
                    :rarity="getUnit(unit.id).rarity || 0"
                    :displaySize="18"/>
                  <span class="font-weight-medium">{{ getUnit(unit.id).name || unit.id }}</span>
                </v-flex>
                <v-flex>Spheres {{ unit.spheres }}</v-flex>
                <v-flex>Extra Skill {{ unit.es }}</v-flex>
                <v-flex>SP {{ unit.sp }}</v-flex>
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

export default {
  components: {
    UnitThumbnail,
    RarityIcon,
  },
  computed: {
    ...mapGetters('units', {
      getImageUrls: 'getImageUrls',
    }),
    thumbnailSize () {
      return 64;
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
          es: '1013600',
          spheres: ['47410', '61070'],
          sp: 'ABCDE',
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
  },
};
</script>
