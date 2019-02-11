<template>
  <v-card>
    {{ squad }}
  </v-card>
</template>

<script>
export default {
  props: {
    squad: {
      type: Object,
      required: true,
    },
  },
};
</script>

