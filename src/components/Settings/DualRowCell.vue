<template>
  <v-container fluid>
    <v-layout row>
      <slot name="top">
        <v-flex v-text="'top row'"/>
      </slot>
    </v-layout>
    <v-layout row wrap>
      <slot name="bottom">
        <v-flex v-text="'bottom row'"/>
      </slot>
    </v-layout>
  </v-container>
</template>

