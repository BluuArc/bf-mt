<template>
  <v-container fluid>
    <v-layout row>
      <v-flex>
        <h3 class="subheading">
          <b>Note:</b> This feature (Buff List) is still in development. None of the information here (UI, description, etc.) is guaranteed to be final or correct.
        </h3>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <template v-for="(effect, i) in processedEffects">
        <v-flex xs1 :key="`${i}-icon`">
          {{ effect.iconKey }}
        </v-flex>
        <v-flex xs1 :key="`${i}-type`">
          {{ effect.parent.type }}
        </v-flex>
        <v-flex xs10 :key="i">
          {{ effect.desc }}
        </v-flex>
      </template>
    </v-layout>
  </v-container>
</template>

<script>
import {IconKeyMappings, EffectProcessor} from '@/store/instances/effect-processor';
export default {
  props: {
    effects: {
      type: Array,
      default: () => [],
    },
    context: {
      default: () => undefined,
    },
  },
  computed: {
    processedEffects () {
      return this.effects
        .map(this.processEffect)
        .map((e, index) => {
          const { values, ...parent } = e;
          return values.map(val => ({ ...val, parent, index }));
        }).reduce((acc, val) => acc.concat(val), []);
    },
    iconKeyMappings: () => IconKeyMappings,
  },
  methods: {
    processEffect (effect) {
      return EffectProcessor.process(effect, this.context);
    },
  },
};
</script>
