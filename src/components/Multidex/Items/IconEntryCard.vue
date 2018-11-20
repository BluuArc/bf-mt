<template>
  <base-entry-card :to="to" style="height: 100%;">
    <v-container fluid class="pl-2 pr-2 pt-1 pb-1">
      <v-layout row style="margin-bottom: -8px;" class="d-align-items-center">
        <v-flex xs4 class="text-xs-left">
          <div class="d-flex-container items-center">
            <sphere-type-icon
              v-if="hasSphereType"
              :category="entry['sphere type']"
              :displaySize="22"/>
          </div>
        </v-flex>
        <v-flex xs4 class="text-xs-center">
          <div class="d-flex-container items-center content-center">
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon :class="{ 'ml-1': rarity !== 8 }" :rarity="rarity" :displaySize="18"/>
          </div>
        </v-flex>
        <v-flex xs4 class="text-xs-right">
          x{{ entry.max_stack }}
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex class="text-xs-center d-align-self-center">
          <item-thumbnail
            :src="getImageUrl(entry.id)"
            :rarity="rarity"
            :type="entry.type"
            :isRaidItem="!!entry.raid"
            :imageTitle="entry.name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
        </v-flex>
      </v-layout>
      <v-layout row style="margin-top: -16px">
        <v-flex class="text-xs-center d-align-self-center">
          <h1 class="subheading">
            {{ entry.name }}
          </h1>
        </v-flex>
      </v-layout>
    </v-container>
  </base-entry-card>
</template>

<script>
import { mapGetters } from 'vuex';
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';
import RarityIcon from '@/components/Multidex/RarityIcon';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import { isSphere } from '@/modules/core/items';

export default {
  mixins: [EntryCardMixin],
  components: {
    RarityIcon,
    ItemThumbnail,
    SphereTypeIcon,
  },
  computed: {
    ...mapGetters('items', ['getImageUrl']),
    rarity () {
      return this.entry.rarity;
    },
    hasSphereType () {
      return isSphere(this.entry);
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
