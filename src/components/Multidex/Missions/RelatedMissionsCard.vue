<template>
  <bordered-titled-card materialColor="indigo" class="multidex-dialog-content-card">
    <span slot="title">Related Missions (in the same {{ type }})</span>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex
          v-for="(missionId, i) in relatedKeys"
          :key="i"
          xs12 :sm6="!isThin" :xl3="!isThin">
          <mission-card :to="getMultidexPathTo(missionId)" :entry="getById(missionId)"/>
        </v-flex>
        <v-flex v-if="relatedKeys.length === 0">
          No related missions found.
        </v-flex>
      </v-layout>
    </v-container>
  </bordered-titled-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { getRelatedMissions } from '@/modules/core/missions';
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
    ...mapState('missions', ['pageDb']),
    ...mapGetters('missions', ['getMultidexPathTo', 'getById']),
    requiredMissions () {
      if (!this.mission || !this.mission.requires) {
        return [];
      }
      return this.mission.requires.split(',');
    }
  },
  data: () => ({
    type: 'Dungeon',
    relatedKeys: [],
  }),
  async mounted () {
    try {
      const result = await getRelatedMissions(this.mission, this.pageDb);
      this.type = result.type;
      this.relatedKeys = result.relatedKeys;
    } catch (err) {
      this.logger.error(err);
    }
  },
};
</script>
