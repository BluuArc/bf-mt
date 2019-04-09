<template>
  <td class="value-column">
    <buff-table
      v-if="isProcBuffList"
      :effects="value"
      :showHeaders="false"
      :isNested="true"/>
    <template v-else>
      {{ value }}
      <span v-if="isEmptyArray">
        (None)
      </span>
    </template>
  </td>
</template>

<script>
export default {
  props: {
    value: {
      required: true,
    },
    isProcBuffList: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    BuffTable: () => import('./MainTable'),
  },
  computed: {
    isEmptyArray () {
      return Array.isArray(this.value) && this.value.length === 0;
    },
  },
  name: 'value-cell',
};
</script>
