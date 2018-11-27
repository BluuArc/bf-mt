<template>
  <bordered-titled-card materialColor="purple" class="multidex-dialog-content-card">
    <span slot="title">Requirements</span>
    <v-container fluid>
      <v-layout>
        <v-flex>
          To access this mission, the following {{ requiredMissions.length === 1 ? 'mission' : 'missions' }} must be cleared.
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex
          v-for="(missionId, i) in requiredMissions"
          :key="i"
          xs12 :sm6="!isThin" :xl3="!isThin">
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
    mission: {
      type: Object,
    },
    logger: {
      required: true,
    },
    isThin: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    BorderedTitledCard,
    MissionCard,
  },
  computed: {
    ...mapGetters('missions', ['getMultidexPathTo', 'getById']),
    requiredMissions () {
      if (!this.mission || !this.mission.requires) {
        return [];
      }
      return this.mission.requires.split(',');
    },
  },
};
</script>
