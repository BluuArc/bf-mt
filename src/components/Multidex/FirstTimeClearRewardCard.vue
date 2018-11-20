<template>
  <bordered-titled-card materialColor="teal" class="multidex-dialog-content-card">
    <span slot="title">First Time Clear Rewards</span>
    <v-container fluid>
      <v-layout>
        <v-flex>
          You can get this as a first time clear reward in the following missions.
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex
          v-for="(missionId, i) in entry.first_clear_missions"
          :key="i"
          xs12 sm6 xl3>
          <mission-card :to="getMultidexPathTo(missionId)" :entry="getById(missionId)"/>
        </v-flex>
      </v-layout>
    </v-container>
  </bordered-titled-card>
</template>

<script>
import { mapGetters } from 'vuex';
import BorderedTitledCard from '@/components/BorderedTitledCard';
import MissionCard from '@/components/Multidex/Missions/EntryCard';

export default {
  props: {
    entry: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    BorderedTitledCard,
    MissionCard,
  },
  computed: {
    ...mapGetters('missions', ['getMultidexPathTo', 'getById']),
  },
};
</script>
