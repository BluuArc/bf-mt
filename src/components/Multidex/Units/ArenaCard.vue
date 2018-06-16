<template>
  <v-card>
    <v-card-title class="amber darken-3">
      <h3 class="title">Arena AI</h3>
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
          <v-list v-if="unit.ai" three-line id="arena-list">
            <template v-for="(stat, index) in unit.ai">
              <v-divider :key="`${index}-div`" v-if="index !== 0"/>
              <v-list-tile :key="index" class="pt-1 pb-1">
                <v-list-tile-content>
                  <v-list-tile-sub-title>
                    <h3 class="subheading">{{ generateArenaText(stat) }}</h3>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
          <p v-else>No arena data found.</p>
        </v-tab-item>
        <v-tab-item key="json">
          <json-viewer :json="unit.ai" :change-view="activeTab"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import JsonViewer from '@/components/Multidex/JsonViewer';

export default {
  props: ['unit'],
  components: {
    'json-viewer': JsonViewer,
  },
  computed: {
    conditionMapping () {
      return {
        hp_50pr_under: 'has less than 50% HP',
        hp_50pr_over: 'has more than 50% HP',
        hp_75pr_under: 'has less than 75% HP',
        hp_25pr_under: 'has less than 25% HP',
        hp_min: 'has the lowest HP',
        hp_max: 'has the highest HP',
        atk_max: 'has the highest attack',
        random: 'is present',
      };
    },
    actionMapping () {
      return {
        skill: 'use BB/SBB',
        attack: 'normal attack',
      };
    },
    targetMapping () {
      return {
        party: 'when an ally',
        enemy: 'on enemy that',
      };
    },
  },
  data () {
    return {
      activeTab: '',
    };
  },
  methods: {
    generateArenaText (data = {}) {
      const chance = `${data['chance%']}% chance`;
      const action = this.actionMapping[data.action] || data.action;
      const target = this.targetMapping[data['target type']] || data['target type'];
      const condition = this.conditionMapping[data['target conditions']] || data['target conditions'];
      return `${chance} to ${action} ${target} ${condition}`;
    },
  },
};
</script>

<style>
#arena-list .list__tile {
  height: auto;
}

.theme--dark #arena-list h3.subheading {
  color: white;
}

.theme--light #arena-list h3.subheading {
  color: black;
}
</style>
