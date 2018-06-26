<template>
  <v-card class="first-clear-mission-card">
    <v-card-title class="teal white--text">
      <h3 class="title">First Time Clear Rewards</h3>
    </v-card-title>
    <v-card-text>
      <v-container fluid style="max-height: 50vh; overflow-y: auto;">
        <v-layout row>
          <v-flex xs12>
            <h3 class="subheading">You can get this as a first time clear reward in the following missions.</h3>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12 sm6 md4 v-for="(missionId, i) in entry.first_clear_missions" :key="i">
            <mission-list-card
            :to="getMultidexPathTo(missionId)"
            :mission="missionById(missionId)"
            style="min-height: 84px; height: 100%;"/>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import MissionListCard from '@/components/Multidex/Missions/MissionCard';
export default {
  props: ['entry'],
  components: {
    'mission-list-card': MissionListCard,
  },
  computed: {
    ...mapGetters('missions', ['missionById', 'getMultidexPathTo']),
  },
};
</script>
