<template>
  <tr>
    <property-cell
      :class="propertyCellClass"
      :collapsed="collapsed"
      :value="propName"
      :numProps="numProps"/>
    <value-cell
      v-if="!collapsed && !hasMultipleValues"
      :class="valueCellClass"
      :value="propValue"
      :isProcBuffList="isProcBuffList"/>
    <template v-else-if="!collapsed && hasMultipleValues">
      <value-cell
        v-for="(value, i) in propValue"
        :key="i"
        :class="valueCellClass"
        :value="value"
        :isProcBuffList="isProcBuffList"/>
    </template>
  </tr>
</template>

<script>
import PropertyCell from './PropertyCell';
import ValueCell from './ValueCell';

export default {
  props: {
    propertyCellClass: {
      required: false,
    },
    valueCellClass: {
      required: false,
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
    propName: {
      required: true,
    },
    propValue: {
      required: true,
    },
    isProcBuffList: {
      type: Boolean,
      default: false,
    },
    numProps: {
      type: Number,
      default: 1,
    },
    hasMultipleValues: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    PropertyCell,
    ValueCell,
  },
  name: 'property-value-row',
};
</script>
