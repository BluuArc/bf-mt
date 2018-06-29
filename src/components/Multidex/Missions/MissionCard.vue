<template>
  <v-card :to="to" class="mission-card">
    <v-container fluid class="pa-1" grid-list-md>
      <v-card-title class="pb-0">
        <v-layout row wrap>
          <v-flex xs8>
            <h3 class="title">{{ mission.name || 'No Name' }}</h3>
            <h3 class="body-1">
              <span v-if="mission.land" v-text="mission.land" title="Land"></span>
              <span v-if="mission.land && mission.area" v-text="'/'"/>
              <span v-if="mission.area" v-text="mission.area" title="Area"></span>
              <span v-if="mission.area && mission.dungeon" v-text="'/'"/>
              <span v-if="mission.dungeon" v-text="mission.dungeon" title="Dungeon"></span>
            </h3>
            <h3 class="body-2" v-if="!mission.continue">
              <u><b>No Continues</b></u>
            </h3>
          </v-flex>
          <v-flex xs4 class="text-xs-right">
            <h3 class="subheading">{{ mission.energy_use }} EN</h3>
            <h3 class="subheading">{{ mission.battle_count }} {{ +mission.battle_count === 1 ? 'Battle' : 'Battles' }}</h3>
            <h3 class="body-1">
              {{ xpPerEnergy }} XP/EN
            </h3>
          </v-flex>
        </v-layout>
      </v-card-title>
      <v-card-text>
        <v-layout row wrap>
          <v-flex xs12 md6>
            <div><b>Base Rewards:</b></div>
            <template v-if="hasBaseRewards">
              <span style="white-space: nowrap;" v-if="mission.xp">{{ formatNumber(mission.xp) }} XP{{ (mission.xp && (mission.zel || mission.karma)) ? ',' : '' }}</span>
              <span style="white-space: nowrap;" v-if="mission.zel">{{ formatNumber(mission.zel) }} Zel{{ ((mission.xp || mission.zel) && mission.karma) ? ',' : '' }}</span>
              <span style="white-space: nowrap;" v-if="mission.karma">{{ formatNumber(mission.karma) }} Karma</span>
            </template>
            <template v-else>
              None
            </template>
          </v-flex>
          <v-flex xs12 md6 v-if="hasClearBonus">
            <v-container fluid class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 class="pa-0">
                  <b>First Clear Rewards:</b>
                </v-flex>
                <v-flex xs6 class="pa-0 text-xs-center" v-for="(reward, i) in mission.clear_bonus" :key="i">
                  <span v-if="reward.gem" style="white-space: nowrap;">
                    {{ reward.gem }}x
                    <gem-thumbnail/>
                  </span>
                  <span v-else-if="reward.zel" style="white-space: nowrap;">
                    {{ formatNumber(reward.zel) }}
                    <zel-thumbnail/>
                  </span>
                  <span v-else-if="reward.karma" style="white-space: nowrap;">
                    {{ formatNumber(reward.karma) }}
                    <karma-thumbnail/>
                  </span>
                  <span v-else-if="reward.unit" style="white-space: nowrap;">
                    {{ reward.unit.count }}x
                    <unit-thumbnail
                        :src="getImageUrls(reward.unit.id.toString()).ills_thum"
                        style="height: 36px; width: 36px;"
                        imgStyle="height: 36px; width: 36px; vertical-align: middle;"
                        :rarity="(unitById(reward.unit.id.toString()) || {}).rarity"
                        :title="(unitById(reward.unit.id.toString()) || {}).name"/>
                  </span>
                  <span v-else-if="reward.item" style="white-space: nowrap;">
                    {{ reward.item.count }}x
                    <item-thumbnail
                      :src="getImageUrl(reward.item.id)"
                      class="mx-auto"
                      style="height: 36px; width: 36px;"
                      imgStyle="height: 36px; width: 36px; vertical-align: middle;"
                      :title="(itemById(reward.item.id) || {}).name"
                      :rarity="reward.item.rarity"
                      :type="reward.item.type"
                      :raid="reward.item.raid"/>
                  </span>
                </v-flex>
              </v-layout>
            </v-container>
          </v-flex>
          <v-flex xs12 :md6="!hasClearBonus" v-if="mimicData.length > 0">
            <b :class="!hasClearBonus ? 'd-block' : undefined">Mimics:</b>
            <unit-thumbnail
              v-for="(entry, i) in mimicData"
              :key="i"
              :src="getImageUrls(entry.group.toString()).ills_thum"
              style="height: 36px; width: 36px;"
              imgStyle="height: 36px; width: 36px; vertical-align: middle;"
              :rarity="(unitById(entry.group.toString()) || {}).rarity"
              :title="(unitById(entry.group.toString()) || {}).name"/>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-container>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import numbro from 'numbro';
import LazyLoadThumbnail from '@/components/Multidex/Units/LazyLoadThumbnail';
import ZelIcon from '@/components/Multidex/ZelThumbnail';
import KarmaIcon from '@/components/Multidex/KarmaThumbnail';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import GemThumbail from '@/components/Multidex/GemThumbnail';
export default {
  props: ['mission', 'to'],
  components: {
    'zel-thumbnail': ZelIcon,
    'karma-thumbnail': KarmaIcon,
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
    mimicData () {
      if (!(this.mission && this.mission.mimic_info && Object.keys(this.mission.mimic_info).length > 0)) {
        return [];
      }

      const mimicIds = {
        mimic: '60142',
        batMimic: '60143',
        dragonMimic: '60144',
        metalMimic: '60224',
      };
      const groupMapping = {
        '1000': mimicIds.mimic,
        '1100': mimicIds.batMimic,
        '1101': mimicIds.batMimic,
        '1200': mimicIds.dragonMimic,
        '1300': mimicIds.metalMimic,
      };
      const { mimic_info: mimicInfo } = this.mission;

      return [
        {
          group: groupMapping[mimicInfo.group_1_monster_group],
          chance: +mimicInfo.group_1_chance,
        },
        {
          group: groupMapping[mimicInfo.group_2_monster_group],
          chance: +mimicInfo.group_2_chance,
        },
      ].filter(entry => !!entry.group && entry.chance > 0);
    },
    xpPerEnergy () {
      const result = (+this.mission.xp / (Math.max(1, +this.mission.energy_use))).toFixed(2);
      const [whole, dec] = result.split('.');
      return (+dec === 0) ? whole : result;
    },
  },
  methods: {
    formatNumber (number) {
      return +number < 1000 ? +number : numbro(+number).format({ average: true, mantissa: 1 });
    },
  },
};
</script>

<style>
.theme--light .mission-card:hover {
  background-color: lightgrey!important;
}

.theme--dark .mission-card:hover {
  background-color: grey!important;
}
</style>
