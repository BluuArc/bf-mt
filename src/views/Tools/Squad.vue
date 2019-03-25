<template>
  <h1>This is the squad page for {{ id }} {{ squad }}</h1>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      squad: null,
    };
  },
  mounted () {
    this.$store.dispatch('squads/getSquadById', this.id)
      .then(result => {
        this.squad = result.squad;
      });
  },
};
</script>

<style>

</style>
