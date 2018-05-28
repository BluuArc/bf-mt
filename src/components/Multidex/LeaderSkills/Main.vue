<template>
  <v-container grid-list-sm class="pb-5">
    <v-layout row v-if="isLoading">
      <v-flex xs12 class="text-xs-center pt-5">
        <v-progress-circular indeterminate/>
        <h4 class="subheading">Waiting for data to finish loading.</h4>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <v-flex xs12 class="text-xs-center">
        <h1 class="title">Leader Skills Page Coming Soon</h1>
        {{ leaderId }}
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
  props: ['query', 'leaderId'],
  computed: {
    ...mapState('leaderSkills', ['pageDb', 'isLoading']),
  },
  methods: {
    ...mapActions('leaderSkills', ['getFilteredKeys']),
  },
};
</script>
