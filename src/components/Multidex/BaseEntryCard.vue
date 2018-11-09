<template>
  <v-card :to="to" class="entry-card">
    <slot name="default" :entry="entry">
      <v-card-text>
        {{ entry.name || entry.desc || entry.id || entry }}
      </v-card-text>
    </slot>
  </v-card>
</template>

<script>
export default {
  props: {
    to: {
      type: String,
      default: '',
    },
    entry: {
      default: () => ({ name: 'No entry specified' }),
    },
  },
};
</script>

<style lang="less">
.entry-card:not(.no-highlight):hover {
  background-color: var(--background-color-alt--lighten-1)!important;
}
</style>
