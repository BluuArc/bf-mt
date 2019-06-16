<template>
  <span class="generic-source-path-cell">
    <span v-text="displayValue" :style="cellStyle"/>
  </span>
</template>

<script>
import colors from 'vuetify/es5/util/colors';
import { safeGet } from '@/modules/utils';

const SOURCE_PATH_TO_MATERIAL_COLOR_MAPPING = Object.freeze({
  'unit.ls': 'green darken-3',
  'unit.es': 'orange darken-4',
  'unit.bb': 'blue-grey',
  'unit.sbb': 'yellow darken-3',
  'unit.ubb': 'red darken-3',
  'unit.sp': 'light-green darken-3',
  'es': 'purple lighten-1',
  'sphere': 'grey',
});

const SOURCE_PATH_TO_TEXT_MAPPING = Object.freeze({
  'unit.ls': 'Leader Skill',
  'unit.es': 'Extra Skill',
  'unit.bb': 'Brave Burst',
  'unit.sbb': 'Super Brave Burst',
  'unit.ubb': 'Ultimate Brave Burst',
  'unit.sp': 'SP Enhancement',
});

export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    source: { // squad unit entry
      type: Object,
      default: () => {},
    },
    getTextForSource: {
      type: Function,
      required: true,
    },
  },
  computed: {
    materialColor () {
      return SOURCE_PATH_TO_MATERIAL_COLOR_MAPPING[this.value] || 'grey';
    },
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
    cellStyle () {
      return {
        'border-color': this.hexColor,
      };
    },
    displayValue () {
      let displayValue = SOURCE_PATH_TO_TEXT_MAPPING[this.value];
      displayValue = this.getTextForSource(this.value, this.source, displayValue) || displayValue;
      return displayValue || this.value;
    },
  },
};
</script>

<style lang="less">
.generic-source-path-cell {
  display: flex;
  span {
    height: 100%;
    flex: auto;
    border: 4px solid grey;
    padding: 0 1px;

    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
