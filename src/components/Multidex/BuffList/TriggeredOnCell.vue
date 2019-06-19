<template>
  <span class="triggered-on-cell">
    <span v-text="displayValue" :style="cellStyle"/>
  </span>
</template>

<script>
import colors from 'vuetify/es5/util/colors';
import { safeGet } from '@/modules/utils';

const BURST_TYPE_TO_MATERIAL_COLOR_MAPPING = Object.freeze({
  bb: 'blue-grey',
  sbb: 'yellow darken-3',
  ubb: 'red darken-3',
});

const BURST_TYPE_TO_TEXT_MAPPING = Object.freeze({
  bb: 'Brave Burst',
  sbb: 'Super Brave Burst',
  ubb: 'Ultimate Brave Burst',
});

export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  computed: {
    materialColor () {
      return BURST_TYPE_TO_MATERIAL_COLOR_MAPPING[this.value];
    },
    hexColor () {
      if (!this.materialColor) {
        return 'transparent';
      }
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
    cellStyle () {
      return {
        'border-color': this.hexColor,
      };
    },
    displayValue () {
      return BURST_TYPE_TO_TEXT_MAPPING[this.value] || this.value;
    },
  },
};
</script>

<style lang="less">
.triggered-on-cell {
  display: flex;
  span {
    height: 100%;
    flex: auto;
    border-width: 4px;
    border-style: solid;
    padding: 0 1px;

    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
