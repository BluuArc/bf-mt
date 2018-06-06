<template>
  <v-expansion-panel-content>
    <h3 class="subheading" slot="header" style="text-transform: capitalize;"> {{ condition }}</h3>
    <v-container fluid>
      <effect-list :effects="effects"/>
    </v-container>
  </v-expansion-panel-content>
</template>

<script>
import EffectList from '@/components/Multidex/EffectList/MainTable';
export default {
  props: ['effects', 'condition'],
  components: {
    'effect-list': EffectList,
  },
};
</script>
