<template>
  <base-entry-card :to="to">
    <v-container fluid class="pl-2 pr-2 pt-1 pb-1">
      <v-layout row style="margin-bottom: -8px">
        <v-flex class="text-xs-center">
          <h2 class="subheading" style="white-space: nowrap;"># {{ entry.guide_id }}</h2>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex class="text-xs-center d-align-self-center">
          <unit-thumbnail
            :src="getImageUrls(entry.id).ills_thum"
            :rarity="rarity"
            :imageTitle="entry.name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
        </v-flex>
      </v-layout>
      <v-layout row style="margin-top: -16px">
        <v-flex class="text-xs-center d-align-self-center">
          <div class="d-flex-container vertical-center content-center">
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon :class="{ 'ml-1': rarity !== 8 }" :rarity="rarity" :displaySize="18"/>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </base-entry-card>
</template>

<script>
import { mapGetters } from 'vuex';
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';
import RarityIcon from '@/components/Multidex/RarityIcon';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';

export default {
  mixins: [EntryCardMixin],
  components: {
    RarityIcon,
    UnitThumbnail,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls']),
    rarity () {
      return this.entry.rarity;
    },
    thumbnailSize () {
      const breakpoint = this.$vuetify.breakpoint;
      if (breakpoint.xlOnly) {
        return 64;
      } else if (breakpoint.mdAndUp) {
        return 56;
      } else {
        return 48;
      }
    },
  },
};
</script>
