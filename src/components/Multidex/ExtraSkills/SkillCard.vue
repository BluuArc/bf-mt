<template>
  <v-card :to="to" class="extra-skill-card">
    <v-container fluid class="pa-1" grid-list-md>
      <v-card-title class="pb-0" style="word-wrap: break-word; word-break: break-word;">
        <v-layout row wrap>
            <v-flex xs9>
                <h3 class="title">{{ extraSkill.name || 'No Name' }}</h3>
            </v-flex>
            <v-flex xs3 class="text-xs-right">
              <span v-if="extraSkill.rarity < 8">
                <h3 class="subheading d-inline-block">{{ extraSkill.rarity }}</h3>
                <img class="icon bf" src="@/assets/star_rare.png" height="18px" style="margin-top: -0.25rem;"/>
              </span>
              <img v-else class="icon bf" src="@/assets/phantom_icon.png" height="18px"/>
            </v-flex>
        </v-layout>
      </v-card-title>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card-text class="pt-0" style="word-wrap: break-word;">
            <h3 v-if="extraSkill.desc && extraSkill.desc !== 'None'" class="subheading">{{ extraSkill.desc }}</h3>
            <h3 class="subheading" v-else>No description.</h3>
          </v-card-text>
        </v-flex>
      </v-layout>
      <v-card-text class="pt-0" v-if="extraSkill.associated_units">
        <v-layout row wrap>
          <v-flex xs6 sm5 class="pt-0 pb-0 text-xs-center">
            <h3 class="subheading">Associated Units:</h3>
          </v-flex>
          <v-flex xs6 sm7 class="text-xs-left pt-0 pb-0" style="margin-top: auto; margin-bottom: auto;">
            <unit-thumbnail
              v-for="(unit, i) in extraSkill.associated_units"
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
  props: ['extraSkill', 'to'],
  components: {
    'unit-thumbnail': LazyLoadThumbnail,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls', 'unitById']),
  },
};
</script>

<style>
.theme--light .extra-skill-card:hover {
  background-color: lightgrey;
}

.theme--dark .extra-skill-card:hover {
  background-color: grey;
}
</style>
