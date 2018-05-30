<template>
  <v-card :to="to" class="leader-skill-card">
    <v-container fluid class="pa-1" grid-list-md>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card-title class="pb-0">
            <h3 class="title">{{ leaderSkill.name || 'No Name' }}</h3>
          </v-card-title>
        </v-flex>
        <v-flex xs12>
          <v-card-text class="pt-0" style="word-wrap: break-word;">
            <h3 v-if="leaderSkill.desc && leaderSkill.desc !== 'None' && leaderSkill.desc !== '0'" class="subheading">{{ leaderSkill.desc }}</h3>
            <h3 class="subheading" v-else>No description.</h3>
          </v-card-text>
        </v-flex>
      </v-layout>
      <v-card-text class="pt-0" v-if="leaderSkill.associated_units">
        <v-layout row wrap>
          <v-flex xs6 sm5 class="pt-0 pb-0 text-xs-center">
            <h3 class="subheading">Associated Units:</h3>
          </v-flex>
          <v-flex xs6 sm7 class="text-xs-left pt-0 pb-0" style="margin-top: auto; margin-bottom: auto;">
            <unit-thumbnail
              v-for="(unit, i) in leaderSkill.associated_units"
              :key="i"
              :src="getImageUrls(unit).ills_thum"
              style="height: 36px; width: 36px;"
              imgStyle="height: 36px; width: 36px;"
              :rarity="(unitById(unit) || {}).rarity"
              :title="(unitById(unit) || {}).name"/>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-container>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import LazyLoadThumbnail from '@/components/Multidex/Units/LazyLoadThumbnail';
export default {
  props: ['leaderSkill', 'to'],
  components: {
    'unit-thumbnail': LazyLoadThumbnail,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls', 'unitById']),
  },
};
</script>

<style>
.theme--light .leader-skill-card:hover {
  background-color: lightgrey;
}

.theme--dark .leader-skill-card:hover {
  background-color: grey;
}
</style>
