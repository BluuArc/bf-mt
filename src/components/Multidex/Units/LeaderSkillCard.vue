<template>
  <v-card>
    <v-card-title class="black white--text">
      <h3 class="title"><b>Leader Skill:</b> {{ name }}</h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab" class="pb-2">
        <v-tab>Description</v-tab>
        <v-tab v-if="leaderSkill">JSON</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" touchless>
        <v-tab-item :key="getLabelIndex('Description')">
          <span>{{ description }}</span>
          <template v-if="leaderSkill">
            <v-card-actions class="pl-0 pr-0 pt-2 pb-2">
              <v-btn flat class="ma-0" @click="showBuffList = !showBuffList">{{ showBuffList ? 'Hide' : 'Show' }} Buff List</v-btn>
            </v-card-actions>
            <v-slide-y-transition>
              <passive-buff-list :effects="leaderSkill.effects" class="pl-3 pr-3" v-show="showBuffList" style="max-height: 35vh; overflow-y: auto;"/>  
            </v-slide-y-transition>
          </template>
        </v-tab-item>
        <v-tab-item v-if="leaderSkill" :key="getLabelIndex('JSON')">
          <json-viewer :json="leaderSkill" :change-view="activeTab"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import JsonViewer from '@/components/Multidex/JsonViewer';
import PassiveBuffList from '@/components/Multidex/PassiveBuffList';

export default {
  props: ['leaderSkill'],
  components: {
    'json-viewer': JsonViewer,
    'passive-buff-list': PassiveBuffList,
  },
  computed: {
    name () {
      return this.leaderSkill ? this.leaderSkill.name : 'None';
    },
    description () {
      return this.leaderSkill ? this.leaderSkill.desc : 'None';
    },
    tabLabels () {
      return this.leaderSkill ? ['Description', 'JSON'] : ['Description'];
    },
  },
  data () {
    return {
      activeTab: 0,
      showBuffList: false,
    };
  },
  methods: {
    getLabelIndex (label) {
      return this.tabLabels.indexOf(label);
    },
  },
};
</script>
