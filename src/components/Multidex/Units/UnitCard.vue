<template>
  <v-card :to="to" class="unit-card">
    <v-container fluid class="pa-1" grid-list-md>
      <v-layout row>
        <v-flex xs3>
          <div class="card__media text-xs-center">
            <unit-thumbnail
              :src="getImageUrls(unit.id).ills_thum"
              class="mx-auto"
              style="height: 64px; width: 64px;"
              imgStyle="height: 64px; width: 64px;"
              :rarity="unit.rarity"
              :title="unit.name"/>
          </div>
        </v-flex>
        <v-flex xs9>
          <v-container fluid class="pa-2">
            <v-layout row>
              <element-icon :element="unit.element"/>
              <h3 class="subheading d-inline-block"><b>{{ unit.name }}</b></h3>
            </v-layout>
            <v-layout row>
              <v-flex xs4 class="pl-0">
                <h3 class="subheading"># {{ unit.guide_id }}</h3>
              </v-flex>
              <v-flex xs4 class="text-xs-center">
                <v-icon :color="genderColor">fas {{ genderIcon }}</v-icon>
              </v-flex>
              <v-flex xs4 class="text-xs-right">
                <span v-if="unit.rarity < 8">
                  <h3 class="subheading d-inline-block">{{ unit.rarity }}</h3>
                  <img class="icon bf" src="@/assets/star_rare.png" height="18px" style="margin-top: -0.25rem;"/>
                </span>
                <img v-else class="icon bf" src="@/assets/phantom_icon.png" height="18px"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import ElementIcon from '@/components/Multidex/Units/ElementIcon';
import LazyLoadThumbnail from '@/components/Multidex/Units/LazyLoadThumbnail';
export default {
  props: ['unit', 'to'],
  components: {
    'unit-thumbnail': LazyLoadThumbnail,
    'element-icon': ElementIcon,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls']),
    genderIcon () {
      const icons = {
        male: 'fa-mars',
        female: 'fa-venus',
        other: 'fa-genderless',
      };
      return icons[this.unit.gender];
    },
    genderColor () {
      const colors = {
        male: 'light-blue',
        female: 'pink lighten-1',
        other: 'grey',
      };
      return colors[this.unit.gender];
    },
  },
};
</script>

<style>
.theme--light .unit-card:hover {
  background-color: lightgrey;
}

.theme--dark .unit-card:hover {
  background-color: grey;
}
</style>
