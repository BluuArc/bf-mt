<template>
  <bordered-titled-card materialColor="green darken-3">
    <template slot="title">
      <card-title-with-link
        :multidexPath="(leaderSkill && getMultidexPathTo(leaderSkill.id) || '')"
        :titleHtml="`<b>Leader Skill: ${name}</b>`"/>
    </template>
    <v-container fluid class="pt-0">
      <v-layout row>
        <v-flex>
          <v-tabs v-model="activeTabIndex" class="mb-2">
            <v-tab v-for="(tab, i) in tabs" :key="i">{{ tab }}</v-tab>
          </v-tabs>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <v-tabs-items v-model="activeTabIndex" touchless>
            <v-tab-item :key="getTabIndexOf('Description')">
              {{ description }}
              <template v-if="leaderSkill">
                <v-card-actions class="pl-0 pr-0 pb-0">
                  <v-btn flat @click="showBuffTable = !showBuffTable">{{ showBuffTable ? 'Hide' : 'Show' }} Buff Table</v-btn>
                </v-card-actions>
                <v-slide-y-transition>
                  <buff-table :effects="leaderSkill.effects" v-show="showBuffTable" :showHeaders="true"/>
                </v-slide-y-transition>
              </template>
            </v-tab-item>
            <v-tab-item v-if="leaderSkill" :key="getTabIndexOf('JSON')">
              {{ leaderSkill }}
            </v-tab-item>
            <v-tab-item v-if="leaderSkill" :key="getTabIndexOf('Buff List')">
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
import CardTitleWithLink from '@/components/CardTitleWithLink';
import BuffTable from '@/components/Multidex/BuffTable/MainTable.vue';

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
    CardTitleWithLink,
    BuffTable,
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
      return ['Description', this.leaderSkill && 'JSON', this.leaderSkill && 'Buff List'].filter(val => val);
    },
    activeTabName () {
      return this.tabs[this.activeTabIndex];
    },
  },
  data () {
    return {
      activeTabIndex: 0,
      showBuffTable: false,
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
