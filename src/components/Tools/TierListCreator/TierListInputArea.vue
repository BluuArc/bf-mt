<template>
  <section class="tier-list-input-area">
    <div>
      <v-text-field label="Title"/>
    </div>
    <div>
      <tier-list-svg v-model="svgConfig"/>
    </div>
  </section>
</template>

<script>
import TierListSvg from './TierListMainSvg';
export default {
  components: {
    TierListSvg,
  },
  data () {
    return {
      svgConfig: {},
    };
  },
};
</script>

<style>
.tier-list-input-area {
  display: flex;
  flex-direction: column;
}
</style>
