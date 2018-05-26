<template>
  <v-card flat>
    <v-card-text v-if="loadingUnitData" class="text-xs-center pt-5">
      <v-progress-circular indeterminate/>
      <h4 class="subheading">Loading unit data</h4>
    </v-card-text>
    <v-card-text v-else-if="!unit">
      No unit data found.
    </v-card-text>
    <v-card-text v-else class="pl-0 pr-0 pb-5">
      <v-bottom-nav :value="true" :active.sync="activeTab" fixed color="primary" id="unit-dialog-nav">
        <v-btn
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          flat class="white--text">
          {{ tab.text }}
          <v-icon v-if="tab.icon">{{ tab.icon }}</v-icon>
        </v-btn>
      </v-bottom-nav>
      <v-container class="unit-dialog-tab" v-if="activeTab === 'general'" grid-list-lg>
        <v-layout row wrap>
          <v-flex xs12 sm6 md3>
            <v-card raised style="border-color: teal; height: 100%;">
              <v-card-title class="teal">
                <h3 class="title">Miscellaneous Info</h3>
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-tile v-if="$vuetify.breakpoint.xsOnly">
                    <v-list-tile-content>
                      <span><b>Full Name:</b> <span class="capitalize">{{ unit.name }}</span></span>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>
                      <span><b>Element:</b> <span class="capitalize">{{ unit.element }}</span></span>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>
                      <span><b>Gender:</b> <span class="capitalize">{{ unit.gender }}</span></span>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>
                      <span><b>Cost:</b> {{ unit.cost }}</span>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>
                      <span><b>Guide ID:</b> {{ unit.guide_id }}</span>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>
                      <span><b>Unit ID:</b> {{ unit.id }}</span>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>
                      <span><b>Rarity:</b> {{ (unit.rarity !== 8) ? `${unit.rarity} Stars` : 'Omni' }}</span>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 sm6 md9>
            <stat-card style="border-color: var(--stat-card-color)" :unit="unit"/>
          </v-flex>
          <v-flex xs12>
            <v-card color="purple" v-if="unit.prev || unit.next">
              <v-card-title>
                <h3 class="title">Evolutions</h3>
              </v-card-title>
              <v-stepper vertical v-model="currentEvolutionIndex" class="text-xs-center">
                <template v-for="(evo, i) in evolutions">
                  <v-stepper-step :key="`step-${evo.current}`" edit-icon="" editable :step="i + 1">
                    <img align="middle" height="32px" :src="getUnitImages(evo.current).ills_thum"/>
                    <span>{{ pageDb[evo.current].name }} ({{ pageDb[evo.current].rarity === 8 ? 'OE' : `${pageDb[evo.current].rarity}*` }})</span>
                    <v-icon>chevron_right</v-icon>
                    <img align="middle" height="32px" :src="getUnitImages(evo.next).ills_thum"/>
                    <span>{{ pageDb[evo.next].name }} ({{ pageDb[evo.next].rarity === 8 ? 'OE' : `${pageDb[evo.next].rarity}*` }})</span>
                  </v-stepper-step>
                  <v-stepper-content :key="`content-${evo.current}`" :step="i + 1" class="pr-5">
                    <v-layout row style="overflow-x: auto">
                      <v-flex xs3 style="margin: auto;">
                        <router-link :to="`/multidex/units?unitId=${evo.current}`">
                          <img align="middle" height="64px" :src="getUnitImages(evo.current).ills_thum"/>
                        </router-link>
                      </v-flex>
                      <v-flex xs1 style="margin: auto;">
                        <v-icon>chevron_right</v-icon>
                      </v-flex>
                      <v-flex xs4 style="margin: auto;">
                        <template v-for="(mat, i) in evo.mats">
                          <router-link v-if="mat.type === 'unit'" :to="`/multidex/units?unitId=${mat.id}`" :key="i">
                            <img align="middle" height="64px" :src="getUnitImages(mat.id).ills_thum"/>
                          </router-link>  
                          <router-link v-else :to="`/multidex/items?itemId=${mat.id}`" :key="i">
                            <img align="middle" height="64px" :src="getItemImage(mat.id)"/>
                          </router-link>  
                        </template>
                      </v-flex>
                      <v-flex xs1 style="margin: auto;">
                        <v-icon>chevron_right</v-icon>
                      </v-flex>
                      <v-flex xs3 style="margin: auto;">
                        <router-link :to="`/multidex/units?unitId=${evo.next}`">
                          <img align="middle" height="64px" :src="getUnitImages(evo.next).ills_thum"/>
                        </router-link>
                      </v-flex>
                    </v-layout>
                  </v-stepper-content>
                </template>
              </v-stepper>
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12 sm6>
            <movement-info-card :unit="unit" style="border-color: var(--movement-card-color);"/>
          </v-flex>
          <v-flex xs12 sm6>
            <arena-card :unit="unit" style="border-color: var(--arena-card-color)"/>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container class="unit-dialog-tab" v-if="activeTab === 'skills'" grid-list-lg>
        <v-layout row wrap>
          <v-flex xs12>
            <leader-skill-card :leader-skill="unit['leader skill']" style="border-color: black;"/>
          </v-flex>
        </v-layout>
        <v-layout row wrap v-if="unit['extra skill']">
          <v-flex xs12>
            <extra-skill-card :extra-skill="unit['extra skill']" style="border-color: var(--extra-skill-card-color)"/>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <burst-card :burst="unit.bb" burst-type="bb" style="border-color: var(--burst-card-color--bb)"/>
          </v-flex>
        </v-layout>
        <template v-for="burstType in ['sbb', 'ubb']">
          <v-layout v-if="unit[burstType]" row wrap :key="burstType">
            <v-flex xs12>
              <burst-card :burst="unit[burstType]" :burst-type="burstType" :style="`border-color: var(--burst-card-color--${burstType})`"/>
            </v-flex>
          </v-layout>
        </template>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card color="green darken-3">
              SP
              {{ unit.feskills }}
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container fluid v-if="activeTab === 'art'" class="text-xs-center unit-dialog-tab">
        <img class="unit-image" :src="images.ills_full"/>
        <div v-show="alternateImageLoaded">
          <img class="unit-image" :src="alternateImages.ills_full" @load="alternateImageLoaded = true"/>
        </div>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import StatCard from '@/components/Multidex/Units/StatCard';
import MovementInfoCard from '@/components/Multidex/Units/MovementInfoCard';
import ArenaCard from '@/components/Multidex/Units/ArenaCard';
import LeaderSkillCard from '@/components/Multidex/Units/LeaderSkillCard';
import ExtraSkillCard from '@/components/Multidex/Units/ExtraSkillCard';
import BurstCard from '@/components/Multidex/Units/BurstCard';

export default {
  props: ['unitId'],
  components: {
    'stat-card': StatCard,
    'movement-info-card': MovementInfoCard,
    'arena-card': ArenaCard,
    'leader-skill-card': LeaderSkillCard,
    'extra-skill-card': ExtraSkillCard,
    'burst-card': BurstCard,
  },
  computed: {
    ...mapGetters('units', {
      getUnitImages: 'getImageUrls',
    }),
    ...mapGetters('items', {
      getItemImage: 'getImageUrl',
    }),
    ...mapState('units', ['pageDb']),
    images () {
      return this.getUnitImages(this.unitId);
    },
    alternateImages () {
      return this.getUnitImages(`${this.unitId}_2`);
    },
    tabs () {
      return [
        { text: 'General Info', value: 'general', icon: 'perm_identity' },
        { text: 'Skill Set', value: 'skills', icon: 'category' },
        { text: 'Art', value: 'art', icon: 'insert_photo' },
      ];
    },
    evolutions () {
      this.currentEvolutionIndex = 0;
      if (!this.unit || !(this.unit.next || this.unit.prev || this.unit.evo_mats)) {
        return [];
      }

      const evolutions = [];
      let tempUnit = this.unit;
      // go to first in evo line
      while (tempUnit.prev) {
        tempUnit = this.pageDb[tempUnit.prev.toString()];
      }

      while (tempUnit.next) {
        // offset by 1 as steps start at 1
        if (tempUnit.id === this.unit.id) {
          this.currentEvolutionIndex = evolutions.length + 1;
        }
        evolutions.push({
          current: tempUnit.id.toString(),
          next: tempUnit.next,
          mats: tempUnit.evo_mats,
        });
        tempUnit = this.pageDb[tempUnit.next.toString()];
      }
      if (tempUnit.id === this.unit.id) {
        this.currentEvolutionIndex = evolutions.length;
      }
      return evolutions;
    },
  },
  data () {
    return {
      unit: undefined,
      loadingUnitData: true,
      activeTab: 'skills',
      alternateImageLoaded: false,
      currentEvolutionIndex: 0,
    };
  },
  watch: {
    async unitId (newValue) {
      this.alternateImageLoaded = false;
      if (!newValue) {
        this.unit = undefined;
      } else {
        this.loadingUnitData = true;
        this.unit = await this.getUnit(newValue);
        this.loadingUnitData = false;
      }
    },
    async pageDb () {
      if (this.unitId && Object.keys(this.pageDb).length > 0) {
        this.loadingUnitData = true;
        this.unit = await this.getUnit(this.unitId);
        this.loadingUnitData = false;
      }
    },
  },
  async mounted () {
    if (this.unitId) {
      this.loadingUnitData = true;
      this.unit = await this.getUnit(this.unitId);
      this.loadingUnitData = false;
    }
  },
  methods: {
    ...mapActions('units', ['getById']),
    getUnit (id) {
      return this.getById(id);
    },
  },
};
</script>

<style>
.unit-dialog-tab .unit-image {
  max-width: 100%;
  height: auto;
}

.unit-dialog-tab .capitalize {
  text-transform: capitalize;
}

.unit-dialog-tab .card {
  border: 2px solid transparent;
  margin: -2px;
  --stat-card-color: #546E7A; /* blue-grey darken-1 */
  --movement-card-color: #8BC34A; /* light-green */
  --arena-card-color: #ff8f00; /* amber darken-3 */
  --extra-skill-card-color: #e65100; /* orange darken-4 */
  --burst-card-color--bb: #607d8b; /* blue-grey */
  --burst-card-color--sbb: #f9a825; /* yellow darken-3 */
  --burst-card-color--ubb: #c62828; /* red darken-3 */
}

.unit-dialog-tab .card .card__title h3.title {
  color: white;
}

.unit-dialog-tab table.table thead th {
  padding-bottom: 0;
  font-weight: bold;
}

/* separate due to weird linting issue */
.unit-dialog-tab .stepper__label {
  width: 100%;
}

.unit-dialog-tab .stepper__label {
  display: inline;
  text-align: center;
}
</style>
