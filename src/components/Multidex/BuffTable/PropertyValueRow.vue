<template>
  <tr>
    <property-cell
      :class="propertyCellClass"
      :collapsed="collapsed"
      :value="propName"
      :numProps="numProps"/>
    <value-cell
      v-if="!collapsed"
      :class="valueCellClass"
      :value="propValue"
      :isProcBuffList="isProcBuffList"/>
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
  },
  components: {
    PropertyCell,
    ValueCell,
  },
  name: 'property-value-row',
};
</script>
