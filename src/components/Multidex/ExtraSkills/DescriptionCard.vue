<template>
  <v-card>
    <v-card-title class="orange darken-4 white--text">
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
            <v-flex xs12 :sm6="!!skill.associated_units" :md8="!!skill.associated_units">
              <v-layout row>
                <v-flex xs12>
                  <h3 class="subheading"><b>Description:</b></h3>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>{{ description }}</v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs6 sm3>
                  <b>Rarity:</b>
                  <span v-if="rarity < 8">
                    <h3 class="subheading d-inline-block">{{ rarity }}</h3>
                    <img class="icon bf" src="@/assets/star_rare.png" height="18px" style="margin-top: -0.25rem;"/>
                  </span>
                  <img v-else class="icon bf" src="@/assets/phantom_icon.png" height="18px"/>
                </v-flex>
                <v-flex xs6 sm3 v-if="skill.target !== 'self'">
                  <b>Target:</b> {{ skill.target }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs12 sm6 md4 v-if="!!skill.associated_units">
              <v-layout row>
                <v-flex xs12>
                  <h3 class="subheading"><b>Associated Unit:</b></h3>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex
                  v-for="key in skill.associated_units"
                  :key="key"
                  xs12>
                  <unit-card :to="getMultidexPathTo(key)" v-if="unitById(key)" :unit="unitById(key)" class="mr-2 card--flat"/>
                </v-flex>
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
import { mapGetters } from 'vuex';
import JsonViewer from '@/components/Multidex/JsonViewer';
import UnitCard from '@/components/Multidex/Units/UnitCard';

export default {
  props: ['skill'],
  components: {
    'json-viewer': JsonViewer,
    'unit-card': UnitCard,
  },
  computed: {
    ...mapGetters('units', ['unitById', 'getMultidexPathTo']),
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
    rarity () {
      return +this.skill.rarity || 0;
    },
  },
  data () {
    return {
      activeTab: 0,
    };
  },
};
</script>
