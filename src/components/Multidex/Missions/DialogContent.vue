<template>
  <v-card flat>
    <v-card-text v-if="loadingMissionData" class="text-xs-center pt-5">
      <v-progress-circular indeterminate/>
      <h4 class="subheading">Loading mission data</h4>
    </v-card-text>
    <v-card-text v-else-if="!mission">
      No mission data found.
    </v-card-text>
    <v-card-text v-else class="pl-0 pr-0 pb-5">
      <v-container grid-list-xl class="mission-dialog-content">
        <v-layout row wrap>
          <v-flex xs12 sm4>
            <v-card style="border-color: var(--description-card-color);">
              <v-card-title class="amber darken-2 white--text">
                <h3 class="title">Description</h3>
              </v-card-title>
              <v-card-text>
                <v-container fluid class="pa-0">
                  <v-layout row>
                    <v-flex xs12>
                      <template v-for="(entry, i) in landAreaDungeonText">
                        <span :key="`${i}-divider`" v-if="i > 0" v-text="' / '"/>
                        <span :key="i" v-text="entry.text" :title="entry.type"/>
                      </template>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex xs12>
                      {{ mission.desc || 'No description specified.' }}
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 sm8>
            <v-card style="border-color: var(--miscellaneous-card-color)">
              <v-card-title class="light-green darken-2 white--text">
                <h3 class="title">Miscellaneous Details</h3>
              </v-card-title>
              <v-card-text>
                <v-container fluid>
                  <v-layout row wrap>
                    <v-flex xs12 sm6 md4 v-for="(item, i) in miscellaneousItems" :key="i">
                    <v-layout row>
                      <v-flex xs6 class="text-xs-center pl-0 pr-0">
                        <b>{{ item.label }}</b>
                      </v-flex>
                      <v-flex xs6 class="text-xs-center pl-0 pr-0">
                        {{ item.value }}
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card style="border-color: var(--rewards-card-color);">
              <v-card-title class="blue white--text">
                <h3 class="title">Rewards</h3>
              </v-card-title>
              <v-card-text>
                <v-container fluid class="pa-0">
                  <v-layout row wrap>
                    <v-flex xs12 md6>
                      <v-list subheader>
                        <v-subheader class="title" v-text="'Base Rewards'"/>
                        <v-list-tile>
                          <v-list-tile-action>
                            <xp-icon img-style="height: 52px; width: 52px; vertical-align: middle;"/>
                          </v-list-tile-action>
                          <v-list-tile-content>
                            <v-list-tile-title class="ml-3">
                              {{ formatNumber(baseRewards.XP) }} XP
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-action>
                            <zel-icon img-style="height: 52px; width: 52px; vertical-align: middle;"/>
                          </v-list-tile-action>
                          <v-list-tile-content>
                            <v-list-tile-title class="ml-3">
                              {{ formatNumber(baseRewards.Zel) }} Zel
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-action>
                            <karma-icon img-style="height: 52px; width: 52px; vertical-align: middle;"/>
                          </v-list-tile-action>
                          <v-list-tile-content>
                            <v-list-tile-title class="ml-3">
                              {{ formatNumber(baseRewards.Karma) }} Karma
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-list subheader>
                        <v-subheader class="title" v-text="'First Time Clear Rewards'"/>
                        <v-list-tile v-if="clearRewards.length === 0">
                          <v-list-tile-content>
                            <v-list-tile-title>
                              None
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <template v-for="(reward, i) in clearRewards">
                          <v-list-tile
                            exact
                            :to="(reward.unit ? getUnitMultidexPath(reward.unit.id) : (reward.item ? getItemMultidexPathTo(reward.item.id) : undefined))"
                            :key="i">
                            <v-list-tile-action>
                              <gem-icon v-if="reward.gem" img-style="height: 52px; width: 52px; vertical-align: middle;"/>
                              <zel-icon v-if="reward.zel" img-style="height: 52px; width: 52px; vertical-align: middle;"/>
                              <karma-icon v-if="reward.karma" img-style="height: 52px; width: 52px; vertical-align: middle;"/>
                              <unit-icon
                                v-else-if="reward.unit"
                                :src="getUnitImageUrls(reward.unit.id).ills_thum"
                                class="mx-auto"
                                style="height: 40px; width: 40px;"
                                imgStyle="height: 40px; width: 40px;"
                                :rarity="unitById(reward.unit.id).rarity"
                                :title="unitById(reward.unit.id).name"/>
                              <item-icon
                                v-else-if="reward.item"
                                :src="getItemImageUrl(reward.item.id)"
                                class="mx-auto"
                                style="height: 40px; width: 40px;"
                                imgStyle="height: 40px; width: 40px;"
                                :rarity="itemById(reward.item.id).rarity"
                                :type="itemById(reward.item.id).type"
                                :raid="itemById(reward.item.id).raid"/>
                            </v-list-tile-action>
                            <v-list-tile-content>
                              <v-list-tile-title class="ml-3">
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
                                  {{ reward.unit.count }}x {{ (unitById(reward.unit.id) || {}).name || reward.unit.id }}
                                </span>
                                <span v-else-if="reward.item">
                                  {{ reward.item.count }}x {{ (itemById(reward.item.id) || {}).name || reward.item.id }}
                                </span>
                                <span v-if="reward.unit || reward.item">
                                  <v-icon small class="pb-1">fas fa-external-link-alt</v-icon>
                                </span>
                              </v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12 :md6="hasMimics" v-if="requiredMissions.length > 0">
            <v-card style="border-color: var(--requirements-card-color);">
              <v-card-title class="purple white--text">
                <h3 class="title">Requirements</h3>
              </v-card-title>
              <v-card-text>
                <v-container fluid style="max-height: 50vh; overflow-y: auto;">
                  <v-layout row wrap>
                    <v-flex xs12>
                      To access this mission, the following {{ requiredMissions.length === 1 ? 'mission' : 'missions' }} must be cleared.
                    </v-flex>
                    <v-flex xs12 :sm6="!hasMimics" :md4="!hasMimics" v-for="(missionId, i) in requiredMissions" :key="i">
                      <mission-list-card
                      :to="getMultidexPathTo(missionId)"
                      :mission="missionById(missionId)"
                      style="min-height: 84px; height: 100%;"/>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 :md6="requiredMissions.length > 0" v-if="hasMimics">
            <mimic-card style="border-color: var(--mimic-card-color);" :mission="mission"/>
          </v-flex>
          <v-flex xs12>
            <v-card style="border-style: var(--related-missions-card-color)">
              <v-card-title class="purple white--text">
                <h3 class="title">Related Missions</h3>
              </v-card-title>
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs12>
            {{ mission }}
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import numbro from 'numbro';
import XPIcon from '@/components/Multidex/XPThumbnail';
import ZelIcon from '@/components/Multidex/ZelThumbnail';
import KarmaIcon from '@/components/Multidex/KarmaThumbnail';
import GemIcon from '@/components/Multidex/GemThumbnail';
import UnitIcon from '@/components/Multidex/Units/LazyLoadThumbnail';
import ItemIcon from '@/components/Multidex/Items/ItemThumbnail';
import MissionListCard from '@/components/Multidex/Missions/MissionCard';
import MimicCard from '@/components/Multidex/Missions/MimicCard';

export default {
  props: ['missionId'],
  components: {
    'xp-icon': XPIcon,
    'zel-icon': ZelIcon,
    'karma-icon': KarmaIcon,
    'gem-icon': GemIcon,
    'unit-icon': UnitIcon,
    'item-icon': ItemIcon,
    'mission-list-card': MissionListCard,
    'mimic-card': MimicCard,
  },
  computed: {
    ...mapState('missions', ['pageDb']),
    ...mapGetters('missions', ['getMultidexPathTo', 'missionById']),
    ...mapGetters('units', {
      unitById: 'unitById',
      getUnitImageUrls: 'getImageUrls',
      getUnitMultidexPath: 'getMultidexPathTo',
    }),
    ...mapGetters('items', {
      itemById: 'itemById',
      getItemImageUrl: 'getImageUrl',
      getItemMultidexPathTo: 'getMultidexPathTo',
    }),
    miscellaneousItems () {
      return !this.mission ? [] : [
        { label: 'Mission ID', value: this.mission.id },
        { label: 'Energy Cost:', value: this.mission.energy_use },
        { label: 'Battle Count:', value: this.mission.battle_count },
        { label: 'XP/Energy:', value: this.xpPerEnergy },
        { label: 'Continues Allowed?', value: (this.mission.continue ? 'Yes' : 'No') },
      ];
    },
    xpPerEnergy () {
      if (!this.mission) {
        return 0;
      }
      const result = (+this.mission.xp / (Math.max(1, +this.mission.energy_use))).toFixed(2);
      const [whole, dec] = result.split('.');
      return (+dec === 0) ? whole : result;
    },
    hasMimics () {
      return this.mission && this.mission.mimic_info && Object.keys(this.mission.mimic_info).length > 0;
    },
    requiredMissions () {
      if (!this.mission || !this.mission.requires) {
        return [];
      }
      return this.mission.requires.split(',');
    },
    landAreaDungeonText () {
      if (!this.mission) {
        return '';
      }

      return ['Land', 'Area', 'Dungeon']
        .map(type => ({ type, text: this.mission[type.toLowerCase()] || `Unknown ${type}` }));
    },
    baseRewards () {
      const mission = this.mission || {};
      return {
        Zel: mission.zel || 0,
        Karma: mission.karma || 0,
        XP: mission.xp || 0,
      };
    },
    clearRewards () {
      const mission = this.mission || {};
      return mission.clear_bonus || [];
    },
  },
  data () {
    return {
      mission: undefined,
      loadingMissionData: true,
      extraDependencyMissions: [],
    };
  },
  watch: {
    async missionId (newValue) {
      if (!newValue) {
        this.mission = undefined;
      } else {
        this.idDataChangeHandler();
      }
    },
    async pageDb () {
      if (this.missionId && Object.keys(this.pageDb).length > 0) {
        this.idDataChangeHandler();
      }
    },
  },
  async mounted () {
    if (this.missionId) {
      this.idDataChangeHandler();
    }
  },
  methods: {
    ...mapActions('missions', { getMission: 'getById' }),
    async idDataChangeHandler () {
      this.loadingMissionData = true;
      this.mission = await this.getMission(this.missionId);
      this.loadingMissionData = false;
    },
    formatNumber (number, mantissa = 1) {
      return +number < 1000 ? +number : numbro(+number).format({ average: true, mantissa });
    },
    hasRequirements (missionId) {
      return !!((this.missionById(missionId) || {}).requires);
    },
  },
};
</script>

<style>
.mission-dialog-content .card {
  border: 2px solid transparent;
  margin: -2px;
  --description-card-color: #ffa000; /* amber darken-2 */
  --miscellaneous-card-color: #689f38; /* light-green darken-2 */
  --rewards-card-color: #2196f3; /* blue */
  --requirements-card-color: #9c27b0; /* purple */
  --mimic-card-color: #ff5722; /* deep-orange */
}

.theme--light .mission-dialog-content .unit-card,
.theme--light .mission-dialog-content .mission-card {
  background-color: whitesmoke;
}

.theme--dark .mission-dialog-content .unit-card,
.theme--dark .mission-dialog-content .mission-card {
  background-color: black;
}
</style>
