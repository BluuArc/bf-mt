<template>
  <v-card>
    <v-card-title class="green darken-3 white--text">
      <v-layout row wrap>
        <v-flex xs9 class="text-xs-left">
          <h3 class="title">SP Enhancements</h3>
        </v-flex>
        <v-flex xs3 class="text-xs-right">
          NNN SP
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-card-text>
      SP
      {{ unit.feskills }}
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ['unit'],
};
</script>
