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
      <v-bottom-nav :value="true" :active.sync="activeTab" fixed color="primary">
        <v-btn
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          flat>
          {{ tab.text }}
          <v-icon v-if="tab.icon">{{ tab.icon }}</v-icon>
        </v-btn>
      </v-bottom-nav>
      <v-container class="unit-dialog-tab" v-if="activeTab === 'general'" grid-list-lg>
        <v-layout row wrap>
          <v-flex xs12 sm6 md3>
            <v-card raised style="border-color: teal; height: 100%;">
              <v-card-title class="teal">
                Miscellaneous Info
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
            <v-card style="border-color: var(--stat-card-color)">
              <v-card-title class="blue-grey darken-1">
                Stats
              </v-card-title>
              <v-card-text class="pt-0">
                <v-data-table
                  :headers="statTableData.headers"
                  :items="statTableData.items"
                  hide-actions>
                  <template slot="items" slot-scope="props">
                    <tr>
                      <template v-for="col in ['name', 'hp', 'atk', 'def', 'rec']">
                        <td :key="col" class=" pt-0 pb-0 text-xs-center">{{ props.item[col] }}</td>
                      </template>
                    </tr>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12>
            <v-card color="purple" v-if="unit.prev || unit.next">
              <v-card-title>
                Evolutions
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
            <v-card color="light-green">
              {{ unit.movement }}
            </v-card>
          </v-flex>
          <v-flex xs12 sm6>
            <v-card color="amber darken-3">
              {{ unit.ai }}
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container class="unit-dialog-tab" v-if="activeTab === 'skills'" grid-list-lg>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card color="black">
              LS
              {{ unit['leader skill'] }}
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card color="orange darken-4">
              ES
              {{ unit['extra skill'] }}
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card color="blue-grey">
              BB
              {{ unit.bb }}
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card color="yellow darken-3">
              SBB
              {{ unit.sbb }}
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card color="red darken-3">
              UBB
              {{ unit.ubb }}
            </v-card>
          </v-flex>
        </v-layout>
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

export default {
  props: ['unitId'],
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
    statTableData () {
      if (!this.unit) {
        return {};
      }

      const stats = ['hp', 'atk', 'def', 'rec'];
      const types = ['Anima', 'Breaker', 'Guardian', 'Oracle'];
      return {
        headers: [
          { text: 'Type', sortable: false, value: 'name', align: 'center' },
          ...stats.map(stat => ({ text: stat.toUpperCase(), sortable: false, value: stat, align: 'center' })),
        ],
        items: [
          { name: 'Base', ...(this.getStats(this.unit.stats._base)) },
          { name: 'Lord', ...(this.getStats(this.unit.stats._lord)) },
          ...types.map(type => ({ name: type, ...(this.getStats(this.unit.stats[type.toLowerCase()])) })),
          { name: `Imps (${this.impCounts.total})`, ...(this.getStats(this.unit.imp, true)) },
        ],
      };
    },
    impCounts () {
      if (!this.unit) {
        return {};
      }

      const counts = {};
      let total = 0;
      ['hp', 'atk', 'def', 'rec'].forEach(stat => {
        const value = this.unit.imp[`max ${stat}`];
        counts[stat] = (stat === 'hp') ? (value / 50) : (value / 20);
        total += counts[stat];
      });
      counts.total = total;
      return counts;
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
        if (tempUnit.id === this.unit.id) {
          this.currentEvolutionIndex = evolutions.length;
        }
        evolutions.push({
          current: tempUnit.id.toString(),
          next: tempUnit.next,
          mats: tempUnit.evo_mats,
        });
        tempUnit = this.pageDb[tempUnit.next.toString()];
        console.debug('next', tempUnit.id);
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
    getStats (item, isImps = false) {
      const result = {};
      const stats = ['hp', 'atk', 'def', 'rec'];
      stats.forEach(stat => {
        if (item[`${stat} max`] || item[`${stat} min`]) {
          result[stat] = `${item[`${stat} min`]}-${item[`${stat} max`]}`;
        } else if (isImps) {
          result[stat] = `${item[`max ${stat}`]} (${this.impCounts[stat]})`;
        } else {
          result[stat] = item[stat];
        }
      });
      return result;
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
  --stat-card-color: #546E7A /* blue-grey darken-1 */
}

.unit-dialog-tab table.table thead th {
  /* padding-top: 0; */
  padding-bottom: 0;
}

.unit-dialog-tab .stepper__label {
  width: 100%;
  display: inline;
  text-align: center;
}
</style>
