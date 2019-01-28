<template>
  <base-entry-card :to="to" style="height: 100%;">
    <v-container fluid class="pa-3">
      <v-layout row wrap>
        <v-flex xs8>
          <h1 class="subheading" style="word-break: break-word;">
            <b v-text="entry.name || 'No Name'"/>
          </h1>
          <h2 class="body-1">
            <span v-text="ladText"/>
          </h2>
          <h3 class="body-2" v-if="!entry.continue">
            <u><b>No Continues</b></u>
          </h3>
        </v-flex>
        <v-flex xs4 class="text-xs-right">
          <h4 class="subheading">{{ entry.energy_use }} EN</h4>
          <h4 class="subheading">{{ entry.battle_count }} {{ +entry.battle_count === 1 ? 'Battle' : 'Battles' }}</h4>
          <h4 class="body-1">
            {{ xpPerEnergy }} XP/EN
          </h4>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs12 md6>
          <b class="d-block">Base Rewards:</b>
          <template v-if="hasBaseRewards">
            <span style="white-space: nowrap;" v-if="entry.xp">{{ formatNumber(entry.xp) }} XP{{ (entry.xp && (entry.zel || entry.karma)) ? ', ' : '' }}</span>
            <span style="white-space: nowrap;" v-if="entry.zel">{{ formatNumber(entry.zel) }} Zel{{ ((entry.xp || entry.zel) && entry.karma) ? ', ' : '' }}</span>
            <span style="white-space: nowrap;" v-if="entry.karma">{{ formatNumber(entry.karma) }} Karma</span>
          </template>
          <template v-else>
            None
          </template>
        </v-flex>
        <v-flex xs12 md6 v-if="hasClearBonus">
          <v-container fluid class="pa-0">
            <v-layout row>
              <v-flex>
                <b>First Clear Rewards:</b>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs6 class="text-xs-center" v-for="(reward, i) in entry.clear_bonus" :key="i">
                <span v-if="reward.gem" style="white-space: nowrap;" class="d-flex-container items-center">
                  <span>{{ reward.gem }}x</span>
                  <gem-icon :displaySize="thumbnailSize"/>
                </span>
                <span v-else-if="reward.zel" style="white-space: nowrap;" class="d-flex-container items-center">
                  <span>{{ formatNumber(reward.zel) }}</span>
                  <zel-icon :displaySize="thumbnailSize"/>
                </span>
                <span v-else-if="reward.karma" style="white-space: nowrap;" class="d-flex-container items-center">
                  <span>{{ formatNumber(reward.karma) }}</span>
                  <karma-icon :displaySize="thumbnailSize"/>
                </span>
                <span v-else-if="reward.unit" style="white-space: nowrap;" class="d-flex-container items-center">
                  <span>{{ reward.unit.count }}x</span>
                  <unit-thumbnail
                    class="ml-1"
                    :src="getImageUrls(reward.unit.id).ills_thum"
                    :rarity="getUnit(reward.unit.id).rarity"
                    :imageTitle="getUnit(reward.unit.id).name"
                    :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
                </span>
                <span v-else-if="reward.item" style="white-space: nowrap;" class="d-flex-container items-center">
                  <span>{{ reward.item.count }}x</span>
                  <item-thumbnail
                    class="ml-1"
                    :src="getImageUrl(reward.item.id)"
                    :rarity="getItem(reward.item.id).rarity"
                    :type="getItem(reward.item.id).type"
                    :isRaidItem="!!getItem(reward.item.id).raid"
                    :imageTitle="getItem(reward.item.id).name"
                    :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
                </span>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex xs12 :md6="!hasClearBonus" v-if="mimicData.length > 0">
          <b class="d-block">Mimics:</b>
          <unit-thumbnail
            v-for="(entry, i) in mimicData"
            :key="i"
            :src="getImageUrls(entry.group).ills_thum"
            :rarity="getUnit(entry.group).rarity"
            :imageTitle="getUnit(entry.group).name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
        </v-flex>
      </v-layout>
    </v-container>
  </base-entry-card>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatNumber } from '@/modules/utils';
import { getMimicData } from '@/modules/core/missions';
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import GemIcon from '@/components/Multidex/GemIcon';
import ZelIcon from '@/components/Multidex/ZelIcon';
import KarmaIcon from '@/components/Multidex/KarmaIcon';

export default {
  mixins: [EntryCardMixin],
  components: {
    UnitThumbnail,
    ItemThumbnail,
    GemIcon,
    ZelIcon,
    KarmaIcon,
  },
  computed: {
    ...mapGetters('units', {
      getImageUrls: 'getImageUrls',
      unitById: 'getById',
    }),
    ...mapGetters('items', {
      getImageUrl: 'getImageUrl',
      itemById: 'getById',
    }),
    thumbnailSize () {
      const breakpoint = this.$vuetify.breakpoint;
      if (breakpoint.mdAndUp) {
        return 48;
      } else {
        return 36;
      }
    },
    ladText () {
      return !this.entry ? '' : [
        this.entry.land,
        this.entry.area,
        this.entry.dungeon,
      ].filter(v => v).join(' / ');
    },
    xpPerEnergy () {
      const result = (+this.entry.xp / (Math.max(1, +this.entry.energy_use))).toFixed(2);
      const [whole, dec] = result.split('.');
      return (+dec === 0) ? whole : result;
    },
    hasBaseRewards () {
      return +this.entry.xp > 0 || +this.entry.zel > 0 || +this.entry.karma > 0;
    },
    hasClearBonus () {
      return Array.isArray(this.entry.clear_bonus) && this.entry.clear_bonus.length > 0;
    },
    mimicData () {
      return getMimicData(this.entry);
    },
  },
  methods: {
    formatNumber,
    getUnit (id) {
      return this.unitById(id) || {};
    },
    getItem (id) {
      return this.itemById(id) || {};
    },
  },
};
</script>
