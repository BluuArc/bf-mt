<template>
  <v-card>
    <v-card-title class="deep-orange white--text">
      <h3 class="title">Mimic Info</h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab">
        <v-tab key="translation">
          Translation
        </v-tab>
        <v-tab key="json">
          JSON
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" touchless>
        <v-tab-item key="translation">
          <template v-if="mimicInfo.length > 0">
            <h3 class="subheading mt-3"><b>Possible Mimic Encounters</b></h3>
            <v-list three-line id="mimic-list">
              <template v-for="(entry, index) in mimicInfo">
                <v-divider :key="`${index}-div`" v-if="index !== 0"/>
                <v-list-tile :key="index" class="pt-1 pb-1" exact :to="monsterGroupMappings[entry.group] ? getMultidexPathTo(monsterGroupMappings[entry.group]) : undefined">
                  <v-list-tile-action>
                    <default-icon v-if="!monsterGroupMappings[entry.group]"/>
                    <unit-icon
                      v-else
                      :src="getImageUrls(monsterGroupMappings[entry.group]).ills_thum"
                      class="mx-auto"
                      style="height: 48px; width: 48px;"
                      imgStyle="height: 48px; width: 48px;"
                      :rarity="(unitById(monsterGroupMappings[entry.group]) || {}).rarity"
                      :title="(unitById(monsterGroupMappings[entry.group]) || {}).name"/>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      <h3 class="subheading">
                        <span v-if="!monsterGroupMappings[entry.group]">
                          Unknown Enemy ({{ entry.group }})
                        </span>
                        <template v-else>
                          <span>
                            {{ (unitById(monsterGroupMappings[entry.group]) || {}).name || monsterGroupMappings[entry.group] }}
                          </span>
                        </template>
                        <b>
                          [{{ entry.chance }}% Chance]
                        </b>
                        <v-icon v-if="monsterGroupMappings[entry.group]" small class="pb-1">fas fa-external-link-alt</v-icon>
                      </h3>
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
            <h3 class="subheading"><b>Mimic Spawn Rate:</b> {{ spawnRate }} chance</h3>
          </template>
          <p v-else class="title text-xs-center ma-3">No mimic data found.</p>
        </v-tab-item>
        <v-tab-item key="json">
          <json-viewer :json="mission.mimic_info" :change-view="activeTab"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import DefaultIcon from '@/components/Multidex/Units/DefaultThumbnail';
import UnitIcon from '@/components/Multidex/Units/LazyLoadThumbnail';
import JsonViewer from '@/components/Multidex/JsonViewer';

export default {
  props: ['mission'],
  components: {
    'json-viewer': JsonViewer,
    'default-icon': DefaultIcon,
    'unit-icon': UnitIcon,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls', 'unitById', 'getMultidexPathTo']),
    hasMission () {
      return this.mission && this.mission.mimic_info;
    },
    mimicInfo () {
      if (!this.hasMission) {
        return [];
      }
      const { mimic_info: mimicInfo } = this.mission;

      return [
        {
          group: mimicInfo.group_1_monster_group,
          chance: +mimicInfo.group_1_chance,
        },
        {
          group: mimicInfo.group_2_monster_group,
          chance: +mimicInfo.group_2_chance,
        },
      ].filter(entry => entry.chance > 0);
    },
    monsterGroupMappings () {
      const mimicIds = {
        mimic: '60142',
        batMimic: '60143',
        dragonMimic: '60144',
        metalMimic: '60224',
      };
      return {
        '1000': mimicIds.mimic,
        '1100': mimicIds.batMimic,
        '1101': mimicIds.batMimic,
        '1200': mimicIds.dragonMimic,
        '1300': mimicIds.metalMimic,
      };
    },
    spawnRate () {
      if (!this.hasMission) {
        return '0%';
      }

      return this.mission.mimic_info.spawn_chance_range_maybe
        .split('~')
        .map(val => `${+val}%`)
        .join('-');
    },
  },
  data () {
    return {
      activeTab: '',
    };
  },
};
</script>
