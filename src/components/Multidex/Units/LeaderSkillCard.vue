<template>
  <bordered-titled-card materialColor="green darken-3">
    <template slot="title">
      <card-title-with-link
        :multidexPath="(leaderSkill && getMultidexPathTo(leaderSkill.id) || '')"
        :titleHtml="`<b>Leader Skill: ${name}</b>`"/>
    </template>
    <card-tabs-container :tabs="tabConfig" v-model="activeTabIndex">
      <section slot="description">
        {{ description }}
        <template v-if="leaderSkill">
          <v-card-actions class="pl-0 pr-0 pb-0">
            <v-btn flat @click="showBuffTable = !showBuffTable">{{ showBuffTable ? 'Hide' : 'Show' }} Buff Table</v-btn>
          </v-card-actions>
          <v-slide-y-transition>
            <buff-table :effects="leaderSkill.effects" v-show="showBuffTable" :showHeaders="true"/>
          </v-slide-y-transition>
        </template>
      </section>
      <section slot="json">
        <json-viewer :json="leaderSkill.effects" :value="activeTabIndex"/>
      </section>
    </card-tabs-container>
  </bordered-titled-card>
</template>

<script>
import { mapGetters } from 'vuex';
import BorderedTitledCard from '@/components/BorderedTitledCard';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import BuffTable from '@/components/Multidex/BuffTable/MainTable.vue';
import CardTabsContainer from '@/components/CardTabsContainer';
import JsonViewer from '@/components/JsonViewer';

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
    CardTabsContainer,
    JsonViewer,
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
    tabConfig () {
      const tabs = ['Description', this.leaderSkill && 'JSON', this.leaderSkill && 'Buff List'].filter(val => val);
      const nameToSlot = str => str.replace(/ /g, '-').toLowerCase();
      return tabs.map(name => ({ name, slot: nameToSlot(name) }));
    },
  },
  data () {
    return {
      activeTabIndex: 0,
      showBuffTable: false,
    };
  },
  mounted () {
    this.logger.todo('implement grabbing existing filters for LS');
  },
};
</script>
