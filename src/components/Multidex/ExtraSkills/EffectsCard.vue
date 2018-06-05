<template>
  <v-card>
    <v-card-title class="purple lighten-1 white--text">
      <h3 class="title">Effects</h3>
    </v-card-title>
    <v-card-text>
      <span v-if="!effects">No effects found</span>
      <template v-else>
        <effect-list :effects="effects"/>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
import EffectList from '@/components/Multidex/EffectList/MainTable';
export default {
  props: ['effects'],
  components: {
    'effect-list': EffectList,
  },
  computed: {
    localEffects () {
      if (!this.effects || !Array.isArray(this.effects)) {
        return [];
      }

      return this.effects;
    },
  },
};
</script>
