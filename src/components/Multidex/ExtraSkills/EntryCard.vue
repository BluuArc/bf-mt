<template>
  <base-entry-card :to="to" style="height: 100%;">
    <v-container fluid class="pa-3">
      <v-layout row>
        <v-flex xs9>
          <div class="d-flex-container items-center">
            <h1 class="subheading d-inline-block" style="word-break: break-word;">
              <b v-text="entry.name || 'No Name'"/>
            </h1>
          </div>
        </v-flex>
        <v-flex xs3 class="test-xs-right">
          <div class="d-flex-container items-center content-flex-end">
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon :class="{ 'ml-1': rarity !== 8 }" :rarity="rarity" :displaySize="18"/>
          </div>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex style="word-break: break-word;">
          <span v-if="entry.desc && entry.desc !== 'None' && entry.desc !== '0'">{{ entry.desc }}</span>
          <span v-else>No description.</span>
        </v-flex>
      </v-layout>
      <v-layout row wrap v-if="showAssociatedUnits && associatedUnits.length > 0" class="d-align-items-center">
        <v-flex xs5 sm4 class="text-xs-center">
          Associated Units:
        </v-flex>
        <v-flex xs7 class="text-xs-left">
          <unit-thumbnail
            v-for="(unit, i) in associatedUnits"
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
import RarityIcon from '@/components/Multidex/RarityIcon';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';

export default {
  mixins: [EntryCardMixin],
  props: {
    showAssociatedUnits: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    RarityIcon,
    UnitThumbnail,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getImageUrls']),
    rarity () {
      return +this.entry.rarity;
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
    associatedUnits () {
      return Array.isArray(this.entry.associated_units)
        ? this.entry.associated_units.map((id) => `${id}`.includes(':') ? `${id}`.split(':')[0] : id)
        : [];
    },
  },
  methods: {
    getUnit (id) {
      return this.pageDb[id] || {};
    },
  },
};
</script>
