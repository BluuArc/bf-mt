<template>
  <bordered-titled-card materialColor="blue" class="multidex-dialog-content-card">
    <span slot="title">Rewards</span>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex xs12 :md6="!isThin">
          <v-subheader class="title">Base Rewards</v-subheader>
          <v-list-tile>
            <v-list-tile-action>
              <exp-icon :displaySize="thumbnailSize"/>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ baseRewards.XP }} XP
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-action>
              <zel-icon :displaySize="thumbnailSize"/>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ baseRewards.Zel }} Zel
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-action>
              <karma-icon :displaySize="thumbnailSize"/>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ baseRewards.Karma }} Karma
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-flex>
        <v-flex xs12 :md6="!isThin">
          <v-list subheader style="background-color: transparent;">
            <v-subheader class="title">First Time Clear Rewards</v-subheader>
            <v-list-tile v-if="clearRewards.length === 0">
              <v-list-tile-content>
                <v-list-tile-title>
                  None
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile
              v-for="(reward, i) in clearRewards"
              :key="i"
              exact
              :to="getRewardLink(reward)">
              <v-list-tile-action>
                <gem-icon v-if="reward.gem" :displaySize="thumbnailSize"/>
                <zel-icon v-else-if="reward.zel" :displaySize="thumbnailSize"/>
                <karma-icon v-else-if="reward.karma" :displaySize="thumbnailSize"/>
                <unit-thumbnail
                  v-else-if="reward.unit"
                  :src="getImageUrls(reward.unit.id).ills_thum"
                  :rarity="getUnit(reward.unit.id).rarity"
                  :imageTitle="getUnit(reward.unit.id).name"
                  :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
                <item-thumbnail
                  v-else-if="reward.item"
                  :src="getImageUrl(reward.item.id)"
                  :rarity="getItem(reward.item.id).rarity"
                  :type="getItem(reward.item.id).type"
                  :isRaidItem="!!getItem(reward.item.id).raid"
                  :imageTitle="getItem(reward.item.id).name"
                  :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  <span v-if="reward.gem">
                    {{ reward.gem }}x {{ +reward.gem === 1 ? 'Gem' : 'Gems' }}
                  </span>
                  <span v-if="reward.zel">
                    {{ formatNumber(reward.zel) }} Zel
                  </span>
                  <span v-if="reward.karma">
                    {{ formatNumber(reward.karma) }} Karma
                  </span>
                  <span v-else-if="reward.unit">
                    {{ reward.unit.count }}x {{ getUnit(reward.unit.id).name || reward.unit.id }}
                  </span>
                  <span v-else-if="reward.item">
                    {{ reward.item.count }}x {{ getItem(reward.item.id).name || reward.item.id }}
                  </span>
                  <span v-if="reward.unit || reward.item">
                    <v-icon small>fas fa-external-link-alt</v-icon>
                  </span>
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-flex>
      </v-layout>
    </v-container>
  </bordered-titled-card>
</template>

<script>
import { mapGetters } from 'vuex';
import BorderedTitledCard from '@/components/BorderedTitledCard';
import { formatNumber } from '@/modules/utils';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import GemIcon from '@/components/Multidex/GemIcon';
import ZelIcon from '@/components/Multidex/ZelIcon';
import KarmaIcon from '@/components/Multidex/KarmaIcon';
import ExpIcon from '@/components/Multidex/ExpIcon';

export default {
  props: {
    mission: {
      type: Object,
    },
    logger: {
      required: true,
    },
    isThin: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    BorderedTitledCard,
    UnitThumbnail,
    ItemThumbnail,
    GemIcon,
    ZelIcon,
    KarmaIcon,
    ExpIcon,
  },
  computed: {
    ...mapGetters('units', {
      getImageUrls: 'getImageUrls',
      unitById: 'getById',
      getUnitLink: 'getMultidexPathTo',
    }),
    ...mapGetters('items', {
      getImageUrl: 'getImageUrl',
      itemById: 'getById',
      getItemLink: 'getMultidexPathTo',
    }),
    thumbnailSize () {
      const breakpoint = this.$vuetify.breakpoint;
      if (breakpoint.mdAndUp) {
        return 48;
      } else {
        return 36;
      }
    },
    baseRewards () {
      const mission = this.mission || {};
      return {
        Zel: formatNumber(mission.zel || 0),
        Karma: formatNumber(mission.karma || 0),
        XP: formatNumber(mission.xp || 0),
      };
    },
    clearRewards () {
      const mission = this.mission || {};
      return mission.clear_bonus || [];
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
    getRewardLink (reward) {
      let link = undefined;
      if (reward.unit) {
        link = this.getUnitLink(reward.unit.id);
      } else if (reward.item) {
        link = this.getItemLink(reward.item.id);
      }
      return link;
    },
  },
};
</script>
