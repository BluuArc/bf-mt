<template>
  <v-card :to="to">
    <v-container fluid class="pa-1" grid-list-md>
      <v-layout row>
        <v-flex xs4>
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
        <v-flex xs8>
          {{ unit.name }}
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import LazyLoadThumbnail from '@/components/Multidex/Units/LazyLoadThumbnail';
export default {
  props: ['unit', 'to'],
  components: {
    'unit-thumbnail': LazyLoadThumbnail,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls']),
  },
};
</script>
