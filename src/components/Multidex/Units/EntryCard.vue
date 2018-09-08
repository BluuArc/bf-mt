<template>
  <base-entry-card :to="to">
    <v-container fluid class="pa-3">
      <v-layout row>
        <v-flex xs3 class="text-xs-center d-align-self-center">
          <unit-thumbnail
            :src="getImageUrls(entry.id).ills_thum"
            :rarity="rarity"
            :imageTitle="entry.name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
        </v-flex>
        <v-flex xs9>
          <v-container fluid class="pa-0">
            <v-layout row>
              <v-flex>
                <div class="d-flex-container vertical-center">
                  <element-icon :element="entry.element" :displaySize="20" class="mr-1"/>
                  <h1 class="subheading d-inline-block" style="word-break: break-word;">
                    <b v-text="entry.name"/>
                  </h1>
                </div>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs4>
                <h2 class="subheading" style="white-space: nowrap;"># {{ entry.guide_id }}</h2>
              </v-flex>
              <v-flex xs4 class="text-xs-center">
                <v-icon :color="genderIconInfo.color">fas {{ genderIconInfo.icon }}</v-icon>
              </v-flex>
              <v-flex xs4 class="text-xs-right d-align-self-center">
                <div class="d-flex-container vertical-center content-flex-end">
                  <span v-if="rarity < 8">{{ rarity }}</span>
                  <rarity-icon :class="{ 'ml-1': rarity !== 8 }" :rarity="rarity" :displaySize="18"/>
                </div>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
  </base-entry-card>
</template>

<script>
import { mapGetters } from 'vuex';
import { getGenderInfo } from '@/modules/utils';
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';
import ElementIcon from '@/components/Multidex/ElementIcon';
import RarityIcon from '@/components/Multidex/RarityIcon';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';

export default {
  mixins: [EntryCardMixin],
  components: {
    ElementIcon,
    RarityIcon,
    UnitThumbnail,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls']),
    genderIconInfo () {
      return getGenderInfo(this.entry.gender);
    },
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
