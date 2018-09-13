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
      let [primaryColor, accent] = this.materialColor.split(' ');
      if (primaryColor.includes('-')) {
        const capitalize = str => [str[0].toUpperCase(), str.slice(1)].join('');
        const colorSplit = primaryColor.split('-');
        primaryColor = [colorSplit[0], colorSplit.slice(1).map(capitalize)].join('');
      }
      if (accent) {
        accent = accent.replace(/-/g, '');
      }
      return safeGet(colors, [primaryColor, accent || 'base']);
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
