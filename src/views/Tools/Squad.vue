<template>
  <h1>This is the squad page for {{ id }}</h1>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
};
</script>

<style>

</style>
