<template>
  <v-card>
    <v-card-title class="orange darken-4 white--text">
      <h3 class="title">
        <span v-if="!extraSkill">
          <b>Extra Skill:</b> {{ name }}
        </span>
        <template v-else>
          <router-link title="Click to view more details" :to="`/multidex/extra-skills/?extraId=${extraSkill.id}`" style="color: white">
            <span><b>Extra Skill:</b> {{ name }}</span>
          </router-link>
          <router-link title="Click to view more details" :to="`/multidex/extra-skills/?extraId=${extraSkill.id}`" style="color: white">
            <v-icon small class="pb-1">fas fa-external-link-alt</v-icon>
          </router-link>
        </template>
      </h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab" class="pb-2">
        <v-tab>Description</v-tab>
        <v-tab v-if="extraSkill">JSON</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" touchless>
        <v-tab-item :key="getLabelIndex('Description')">
          <span>{{ description }}</span>
          <template v-if="extraSkill">
            <v-card-actions class="pl-0 pr-0 pt-2 pb-2">
              <v-btn flat class="ma-0" @click="showBuffList = !showBuffList">{{ showBuffList ? 'Hide' : 'Show' }} Buff List</v-btn>
            </v-card-actions>
            <v-slide-y-transition>
              <passive-buff-list :effects="extraSkill.effects" v-show="showBuffList"/>  
            </v-slide-y-transition>
          </template>
        </v-tab-item>
        <v-tab-item v-if="extraSkill" :key="getLabelIndex('JSON')">
          <json-viewer :json="extraSkill" :change-view="activeTab"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import JsonViewer from '@/components/Multidex/JsonViewer';
import PassiveBuffList from '@/components/Multidex/PassiveBuffList';

export default {
  props: ['extraSkill'],
  components: {
    'json-viewer': JsonViewer,
    'passive-buff-list': PassiveBuffList,
  },
  computed: {
    name () {
      return this.extraSkill ? this.extraSkill.name : 'None';
    },
    description () {
      return this.extraSkill ? this.extraSkill.desc : 'None';
    },
    tabLabels () {
      return this.extraSkill ? ['Description', 'JSON'] : ['Description'];
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
