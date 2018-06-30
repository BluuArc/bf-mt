<template>
  <v-card :to="to" class="item-card">
    <v-container fluid class="pa-1" grid-list-md>
      <v-layout row>
        <v-flex xs3 class="center-align-parent">
          <div class="card__media text-xs-center center-align-container">
            <item-thumbnail
              :src="getImageUrl(item.id)"
              class="mx-auto"
              width="48" height="48"
              style="height: 48px; width: 48px;"
              imgStyle="height: 48px; width: 48px;"
              :rarity="item.rarity"
              :type="item.type"
              :raid="item.raid"/>
          </div>
        </v-flex>
        <v-flex xs9 class="pl-0">
          <v-container fluid class="pa-2">
            <v-layout row>
              <sphere-type-icon
                v-if="item['sphere type'] !== undefined || item.type === 'sphere' || item.type === 'ls_sphere'"
                :category="item['sphere type']"
                class="ml-0"/>
              <h3 class="subheading d-inline-block"><b>{{ item.name }}</b></h3>
            </v-layout>
            <v-layout row>
              <v-flex xs12 class="pa-0" style="word-wrap: break-word;">
                {{ item.desc }}
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs6 class="pl-0">
                <h3 class="subheading"> {{ itemType }} </h3>
              </v-flex>
              <v-flex xs3>
                x{{ item.max_stack }}
              </v-flex>
              <v-flex xs3 class="text-xs-right">
                <span v-if="item.rarity < 8">
                  <h3 class="subheading d-inline-block">{{ item.rarity }}</h3>
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
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';

export default {
  props: ['item', 'to'],
  components: {
    'item-thumbnail': ItemThumbnail,
    'sphere-type-icon': SphereTypeIcon,
  },
  computed: {
    ...mapGetters('items', ['getImageUrl']),
    itemType () {
      const { type, raid } = this.item;
      // items, raid items, booster, spheres, materials, evo materials, ls spheres
      if (type === 'consumable' && !raid) {
        return 'Item';
      } else if (type === 'material' && !raid) {
        return 'Material';
      } else if (type === 'sphere') {
        return 'Sphere';
      } else if (type === 'evomat') {
        return 'Evo Material';
      } else if (type === 'summoner_consumable') {
        return 'Booster';
      } else if (raid) {
        return 'Raid Item';
      } else if (type === 'ls_sphere') {
        return 'LS Sphere';
      } else {
        console.warn('unknown item type', type);
        return type || 'Unknown Type';
      }
    },
  },
};
</script>

<style>
.theme--light .item-card:hover {
  background-color: lightgrey!important;
}

.theme--dark .item-card:hover {
  background-color: grey!important;
}
</style>
