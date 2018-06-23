<template>
  <v-card :to="to" class="mission-card">
    <v-container fluid class="pa-1" grid-list-md>
      <v-card-title class="pb-0">
        <v-layout row wrap>
          <v-flex xs9>
            <h3 class="title">{{ mission.name || 'No Name' }}</h3>
            <h3 class="body-1">
              <span v-if="mission.area" v-text="mission.area"></span>
              <span v-if="mission.area && mission.dungeon" v-text="'/'"/>
              <span v-if="mission.dungeon" v-text="mission.dungeon"></span>
            </h3>
          </v-flex>
          <v-flex xs3>
            <h3 class="subheading">{{ mission.energy_use }} EN</h3>
            <h3 class="subheading">{{ mission.battle_count }} Battles</h3>
          </v-flex>
        </v-layout>
      </v-card-title>
      <v-card-text>
        <v-layout row wrap>
          <v-flex xs12 md6>
            <span><b>Base Rewards:</b></span>
            <br>
            <template v-if="hasBaseRewards">
              <span v-if="mission.xp">{{ mission.xp }} XP{{ (mission.xp && (mission.zel || mission.karma)) ? ',' : '' }}</span>
              <span v-if="mission.zel">{{ mission.zel }} Zel{{ ((mission.xp || mission.zel) && mission.karma) ? ',' : '' }}</span>
              <span v-if="mission.karma">{{ mission.karma }} Karma</span>
            </template>
            <template v-else>
              None
            </template>
          </v-flex>
          <v-flex xs12 md6 v-if="hasClearBonus">
            <span><b>Clear Rewards:</b></span>
            <br>
            <span v-for="(reward, i) in mission.clear_bonus" :key="i" style="white-space: nowrap; min-width: 50px;">
              <template v-if="reward.gem">
                {{ reward.gem }}x
                <gem-thumbnail/>
              </template>
              <template v-if="reward.unit">
                {{ reward.unit.count }}x
                <unit-thumbnail
                    :src="getImageUrls(reward.unit.id.toString()).ills_thum"
                    style="height: 36px; width: 36px;"
                    imgStyle="height: 36px; width: 36px; vertical-align: middle;"
                    :rarity="(unitById(reward.unit.id.toString()) || {}).rarity"
                    :title="(unitById(reward.unit.id.toString()) || {}).name"/>
              </template>
              <template v-if="reward.item">
                {{ reward.item.count }}x
                <item-thumbnail
                  :src="getImageUrl(reward.item.id)"
                  class="mx-auto"
                  style="height: 36px; width: 36px;"
                  imgStyle="height: 36px; width: 36px; vertical-align: middle;"
                  :rarity="reward.item.rarity"
                  :type="reward.item.type"
                  :raid="reward.item.raid"/>
              </template>
            </span>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-container>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import LazyLoadThumbnail from '@/components/Multidex/Units/LazyLoadThumbnail';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import GemThumbail from '@/components/Multidex/GemThumbnail';
export default {
  props: ['mission', 'to'],
  components: {
    'unit-thumbnail': LazyLoadThumbnail,
    'item-thumbnail': ItemThumbnail,
    'gem-thumbnail': GemThumbail,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls', 'unitById']),
    ...mapGetters('items', ['getImageUrl', 'itemById']),
    hasBaseRewards () {
      return +this.mission.xp > 0 || +this.mission.zel > 0 || +this.mission.karma > 0;
    },
    hasClearBonus () {
      return Array.isArray(this.mission.clear_bonus) && this.mission.clear_bonus.length > 0;
    },
    hasMimics () {
      return this.mission.mimic_info && Object.keys(this.mission.mimic_info).length > 0;
    },
  },
};
</script>

<style>
.theme--light .mission-card:hover {
  background-color: lightgrey;
}

.theme--dark .mission-card:hover {
  background-color: grey;
}
</style>
