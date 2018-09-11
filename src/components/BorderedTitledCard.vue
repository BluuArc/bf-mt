<template>
  <v-card class="bordered-card" :flat="flat" :style="style">
    <v-card-title :class="fullTitleClass">
      <h1 class="title">
        <slot name="title">
          Your Title Here
        </slot>
      </h1>
    </v-card-title>
    <slot name="default">
      Put your card content here.
    </slot>
  </v-card>
</template>

<script>
import colors from 'vuetify/es5/util/colors';
import { safeGet } from '@/modules/utils';
export default {
  props: {
    materialColor: {
      type: String,
      required: true,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    titleClass: {
      type: String,
      default: 'white--text',
    },
  },
  computed: {
    hexColor () {
      return safeGet(colors, this.materialColor.replace(/-/g, '').split(' '));
    },
    style () {
      return this.hexColor ? `border-color: ${this.hexColor};` : undefined;
    },
    fullTitleClass () {
      return [this.materialColor, this.titleClass].join(' ');
    },
  },
};
</script>

<style>
.bordered-card {
  border: 2px solid transparent;
  margin: -2px;
}
</style>
