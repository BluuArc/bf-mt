<template>
  <bordered-titled-card materialColor="amber darken-2" class="multidex-dialog-content-card">
    <span slot="title">Description</span>
    <v-container fluid>
      <v-layout v-if="ladText">
        <v-flex>
          {{ ladText }}
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex>
          {{ description }}
        </v-flex>
      </v-layout>
    </v-container>
  </bordered-titled-card>
</template>

<script>
import BorderedTitledCard from '@/components/BorderedTitledCard';

export default {
  props: {
    mission: {
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
    description () {
      return (this.mission && this.mission.desc) || 'None';
    },
    ladText () {
      return !this.mission ? '' : [
        this.mission.land,
        this.mission.area,
        this.mission.dungeon
      ].filter(v => v).join(' / ');
    },
  },
};
</script>
