<template>
  <h2 class="subheading">
    <span v-if="!hasFilters" v-text="renderedTitle"/>
    <b v-else v-text="renderedTitle"/>
  </h2>
</template>

<script>
export default {
  props: ['hasFilters', 'title'],
  computed: {
    renderedTitle () {
      return this.hasFilters ? `${this.title}*` : this.title;
    },
  },
};
</script>

