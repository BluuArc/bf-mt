<template>
  <base-entry-card :to="to" style="height: 100%;">
    <v-container fluid class="pa-3">
      <v-layout row>
        <v-flex>
          <div class="d-flex-container items-center">
            <h1 class="subheading d-inline-block" style="word-break: break-word;">
              <b v-text="entry.name || 'No Name'"/>
            </h1>
          </div>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex style="word-break: break-word;">
          <span v-if="entry.desc && entry.desc !== 'None' && entry.desc !== '0'">{{ entry.desc }}</span>
          <span v-else>No description.</span>
        </v-flex>
      </v-layout>
      <v-layout row wrap v-if="entry.associated_units" class="d-align-items-center">
        <v-flex xs5 sm4 class="text-xs-center">
          Associated Units:
        </v-flex>
        <v-flex xs7 sm8 class="text-xs-left">
          <unit-thumbnail
            v-for="(unit, i) in entry.associated_units"
            :key="i"
            :src="getImageUrls(unit).ills_thum"
            :rarity="getUnit(unit).rarity"
            :imageTitle="getUnit(unit).name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
        </v-flex>
      </v-layout>
    </v-container>
  </base-entry-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';

export default {
  mixins: [EntryCardMixin],
  components: {
    UnitThumbnail,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getImageUrls']),
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
  methods: {
    getUnit (id) {
      return this.pageDb[id] || {};
    },
  },
};
</script>
