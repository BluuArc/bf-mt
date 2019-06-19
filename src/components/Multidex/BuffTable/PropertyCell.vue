<template>
  <td :class="{ 'property-column': !collapsed }" :colspan="1 + (collapsed ? numValueColumns : 0)">
    <template v-if="!collapsed">
      <slot name="default">
        {{ value }}
      </slot>
    </template>
    <template v-else>
      {{ effectsHiddenText }}
    </template>
  </td>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true,
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
    numProps: {
      type: Number,
      default: 1,
    },
    numValueColumns: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    effectsHiddenText () {
      return `${this.numProps} ${this.numProps !== 1 ? 'Effects' : 'Effect'} Hidden`;
    },
  },
  name: 'property-cell',
};
</script>
