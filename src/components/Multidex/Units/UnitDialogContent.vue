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
      <v-container v-if="activeTab === 'general'">
        <v-layout row wrap>
          stats table
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12 sm6>
            movement info table
          </v-flex>
          <v-flex xs12 sm6>
            arena info
          </v-flex>
        </v-layout>
      </v-container>
      <v-container v-if="activeTab === 'skills'">
        <v-layout row wrap>
          {{ unit }}
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
</style>
