<template>
  <v-card>
    <v-card-title class="green darken-3 white--text">
      <h3 class="title">{{ name }}</h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab" class="pb-2">
        <v-tab>Description</v-tab>
        <v-tab v-if="skill">JSON</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" touchless>
        <v-tab-item>
          <v-layout row wrap>
            <v-flex xs12>
              <v-layout row>
                <v-flex xs12>{{ description }}</v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-tab-item>
        <v-tab-item v-if="skill">
          <json-viewer :json="skill" :change-view="activeTab"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import JsonViewer from '@/components/Multidex/JsonViewer';

export default {
  props: ['skill'],
  components: {
    'json-viewer': JsonViewer,
  },
  computed: {
    name () {
      return this.skill ? this.skill.name : 'None';
    },
    description () {
      const emptyDescriptions = ['None', '0'];
      if (this.skill && this.skill.desc && !emptyDescriptions.includes(this.skill.desc)) {
        return this.skill.desc;
      }
      return 'No description.';
    },
  },
  data () {
    return {
      activeTab: 0,
    };
  },
};
</script>
