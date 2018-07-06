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
        <v-flex xs1 :key="`${i}-icon`" class="text-xs-center">
          <buff-icon @click.native="logBuff(effect)" :icon-key="effect.iconKey"/>
        </v-flex>
        <v-flex xs1 :key="`${i}-type`" class="text-xs-center">
          <p class="mb-0" :title="(effectTypes[effect.parent.type.toUpperCase()] || effectTypes.UNKNOWN).desc">{{ effect.parent.type }}</p>
        </v-flex>
        <v-flex xs10 :key="i" class="text-xs-left">
          <p class="mb-0">{{ effect.desc }}</p>
        </v-flex>
      </template>
    </v-layout>
  </v-container>
</template>

<script>
import {EffectProcessor} from '@/store/instances/EffectProcessor/effect-processor';
import IconKeyMappings from '@/store/instances/EffectProcessor/icon-key-mappings';
import EffectTypes from '@/store/instances/EffectProcessor/effect-types';
import BuffIcon from '@/components/Multidex/BuffList/BuffIcon';

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
  components: {
    'buff-icon': BuffIcon,
  },
  computed: {
    effectTypes: () => EffectTypes,
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
    logBuff (buff) {
      console.debug(buff);
    },
  },
};
</script>
