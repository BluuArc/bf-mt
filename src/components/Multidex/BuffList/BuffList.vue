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
          <p class="mb-0" :title="getTypes(effect.parent.type, true)"
            >{{ getTypes(effect.parent.type) }}</p>
        </v-flex>
        <v-flex xs10 :key="i" class="text-xs-left">
          <p class="mb-0">
            <span v-if="effect.parent.originalEffect.sp_type">({{ handleSpType(effect.parent.originalEffect.sp_type) }})</span>
            <span v-if="effect.value.turns && !effect.triggeredEffectContext">{{ effect.value.turns.text }}</span>
            <span>{{ effect.desc }}</span>
            <span v-text="`[${getEffectId(effect.parent.originalEffect)}]`"/>
          </p>
        </v-flex>
      </template>
    </v-layout>
  </v-container>
</template>

<script>
import EffectProcessor from '@/store/instances/EffectProcessor/effect-processor';
import IconKeyMappings from '@/store/instances/EffectProcessor/icon-key-mappings';
import ProcessorHelper from '@/store/instances/EffectProcessor/processor-helper';
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
    contextHandler: {
      type: Function,
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
    processEffect (effect, index) {
      let context;
      if (typeof this.contextHandler === 'function') {
        context = this.contextHandler(effect, index);
      } else {
        context = this.context;
      }
      return EffectProcessor.process(effect, context);
    },
    logBuff (buff) {
      console.debug(buff);
    },
    getTypes (types = [], doTranslate = false) {
      if (!doTranslate) {
        return types.join(', ');
      }
      return types
        .map(type => `${type}: ${(EffectTypes[type.toUpperCase()] || EffectTypes.UNKNOWN).desc}`)
        .join('\n');
    },
    handleSpType (text) {
      return ProcessorHelper.capitalize(text).replace('sbb', 'SBB').replace('ubb', 'UBB').replace('bb', 'BB');
    },
    getEffectId (effect) {
      return effect['proc id'] || effect['passive id'] || effect['buff id'] ||
        effect['unknown proc id'] || effect['unknown passive id'] || effect['unknown buff id'] || -1;
    },
  },
};
</script>
