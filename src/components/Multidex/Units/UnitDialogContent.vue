<template>
  <v-card flat>
    <v-card-text v-if="loadingUnitData" class="text-xs-center">
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
      <v-container v-if="activeTab === 'general'" grid-list-lg>
        <v-layout row wrap>
          <v-flex xs12 sm6 md3>
            <v-card raised style="border: 2px solid teal; margin: -2px;">
              <v-card-title class="teal">
                Miscellaneous Info
              </v-card-title>
              <v-card-text>
                <v-list>
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
            <v-card color="blue-grey darken-3">
              {{ unit.stats }}
              {{ unit.imp }}
            </v-card>
          </v-flex>
          <v-flex xs12>
            <v-card color="purple">
              {{ unit.prev }} to {{ unit.next }}
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
      <v-container v-if="activeTab === 'skills'" grid-list-lg>
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
      <v-container fluid v-if="activeTab === 'art'" class="text-xs-center">
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
  },
  data () {
    return {
      unit: undefined,
      loadingUnitData: true,
      activeTab: 'skills',
      alternateImageLoaded: false,
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

<style scoped>
.unit-image {
  max-width: 100%;
  height: auto;
}

.capitalize {
  text-transform: capitalize;
}
</style>
