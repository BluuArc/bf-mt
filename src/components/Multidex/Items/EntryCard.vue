<template>
  <base-entry-card :to="to" style="height: 100%;">
    <v-container fluid class="pa-3">
      <v-layout row>
        <v-flex xs3 class="text-xs-center d-align-self-center pb-0">
          <item-thumbnail
            :src="getImageUrl(entry.id)"
            :rarity="rarity"
            :imageTitle="entry.name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
          <div class="d-flex-container vertical-center content-center">
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon :class="{ 'ml-1': rarity !== 8 }" :rarity="rarity" :displaySize="18"/>
          </div>
        </v-flex>
        <v-flex xs9 class="pb-0">
          <v-container fluid class="pa-0">
            <v-layout row>
              <v-flex>
                <div class="d-flex-container vertical-center">
                  <sphere-type-icon
                    v-if="hasSphereType"
                    :category="entry['sphere type']"
                    :displaySize="24"
                    class="mr-1"/>
                  <h1 class="subheading d-inline-block" style="word-break: break-word;">
                    <b v-text="entry.name"/>
                  </h1>
                </div>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex>
                {{ entry.desc }}
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs6>
                <h2 class="subheading">{{ itemType }}</h2>
              </v-flex>
              <v-flex xs6 class="text-xs-right">
                x{{ entry.max_stack }}
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
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import RarityIcon from '@/components/Multidex/RarityIcon';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import { getItemType } from '@/modules/core/items';

export default {
  mixins: [EntryCardMixin],
  components: {
    SphereTypeIcon,
    RarityIcon,
    ItemThumbnail,
  },
  computed: {
    ...mapGetters('items', ['getImageUrl']),
    rarity () {
      return this.entry.rarity;
    },
    hasSphereType () {
      return this.entry['sphere type'] !== undefined || this.entry.type === 'sphere' || this.entry.type === 'ls_sphere';
    },
    itemType () {
      return getItemType(this.entry);
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
