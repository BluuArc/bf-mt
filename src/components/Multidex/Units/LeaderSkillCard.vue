<template>
  <bordered-titled-card materialColor="green darken-3">
    <template slot="title">
      <span v-if="!leaderSkill">
        <b>Leader Skill:</b> {{ name }}
      </span>
      <template v-else>
        <router-link title="Click to view more details" :to="getMultidexPathTo(leaderSkill.id)" style="color: white">
          <span><b>Leader Skill:</b> {{ name }}</span>
        </router-link>
        <router-link class="d-inline-flex" title="Click to view more details" :to="getMultidexPathTo(leaderSkill.id)" style="color: white; text-decoration: none">
          <v-icon small class="pb-1 pl-1 white--text d-align-self-center">fas fa-external-link-alt</v-icon>
        </router-link>
      </template>
    </template>
    <v-container fluid class="pt-0">
      <v-layout row>
        <v-flex>
          <v-tabs v-model="activeTabIndex">
            <v-tab v-for="(tab, i) in tabs" :key="i">{{ tab }}</v-tab>
          </v-tabs>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <v-tabs-items v-model="activeTabIndex">
            <v-tab-item :key="getTabIndexOf('Description')">
                {{ description }}
            </v-tab-item>
            <v-tab-item :key="getTabIndexOf('JSON')">
              {{ leaderSkill }}
            </v-tab-item>
            <v-tab-item :key="getTabIndexOf('Buff List')">
              Buff List
            </v-tab-item>
          </v-tabs-items>
        </v-flex>
      </v-layout>
    </v-container>
  </bordered-titled-card>
</template>

<script>
import { mapGetters } from 'vuex';
import BorderedTitledCard from '@/components/BorderedTitledCard';

export default {
  props: {
    unit: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    BorderedTitledCard,
  },
  computed: {
    ...mapGetters('leaderSkills', ['getMultidexPathTo']),
    leaderSkill () {
      return this.unit && this.unit['leader skill'];
    },
    name () {
      return this.leaderSkill ? this.leaderSkill.name : 'None';
    },
    description () {
      return this.leaderSkill ? this.leaderSkill.desc : 'None';
    },
    tabs () {
      return ['Description', 'JSON', 'Buff List'];
    },
    activeTabName () {
      return this.tabs[this.activeTabIndex];
    },
  },
  data () {
    return {
      activeTabIndex: 0,
    };
  },
  methods: {
    getTabIndexOf (name) {
      return this.tabs.indexOf(name);
    },
  },
  mounted () {
    this.logger.todo('implement grabbing existing filters');
  },
};
</script>
