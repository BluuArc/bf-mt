<template>
  <td class="id-column">
    <v-btn flat small class="collapse-btn" @click="$emit('click')">
      <span style="flex: 1 1 100%;">
        <v-icon>{{ collapsed ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
      </span>
      <span style="flex: 1 1 100%;">
        <slot name="default">
          {{ value }}
        </slot>
      </span>
      <span style="flex: 1 1 100%;">
        <v-icon>{{ collapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
      </span>
    </v-btn>
  </td>
</template>

<script>
export default {
  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },
    value: {
      required: true,
    },
  },
  name: 'id-cell',
};
</script>

<style scoped lang="less">
button.collapse-btn {
  height: auto;
  min-width: 0;

  .v-btn__content {
    flex-wrap: wrap;
  }
}
</style>
