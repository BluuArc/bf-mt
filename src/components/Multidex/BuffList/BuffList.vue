<template>
  <v-container fluid grid-list-md>
    <v-layout row>
      <v-flex>
        <h3 class="subheading">
          <b>Note:</b> This feature (Buff List) is still in development. None of the information here (UI, description, etc.) is guaranteed to be final or correct.
        </h3>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="d-align-items-center">
      <template v-for="(effect, i) in processedEffects">
        <v-flex
          xs2 sm1
          :key="`${i}-icon`"
          class="text-xs-center">
          <buff-icon
            @click.native="logBuff(effect)"
            :displaySize="iconSize"
            :iconKey="effect.iconKey"/>
        </v-flex>
        <v-flex lg1 v-if="$vuetify.breakpoint.lgAndUp" :key="`${i}-type`" class="text-xs-center">
          <p class="mb-0" :title="getTypes(effect.parent.type, true)">
            {{ getTypes(effect.parent.type) }}
          </p>
        </v-flex>
        <v-flex xs10 sm11 lg10 :key="i" class="text-xs-left">
          <p class="mb-0">
            <span
              v-if="effect.parent.originalEffect.sp_type"
              v-text="`(${handleSpType(effect.parent.originalEffect.sp_type)}) `"/>
            <span
              v-if="effect.value.turns && !effect.triggeredEffectContext"
              v-text="`${effect.value.turns.text} `"/>
            <span v-text="`${effect.desc} [${getEffectIds(effect)}]`"/>
            <span v-if="effect.value && effect.value.conditions && effect.value.conditions.text" class="d-block"><i>Requirement:</i> {{ effect.value.conditions.text }}</span>
          </p>
        </v-flex>
      </template>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import EffectProcessor from '@/modules/EffectProcessor/effect-processor';
import { capitalize, getEffectId } from '@/modules/EffectProcessor/processor-helper';
import { effectTypes } from '@/modules/constants';
import logger from '@/modules/Logger';
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
      required: false,
    },
  },
  components: {
    BuffIcon,
  },
  computed: {
    ...mapGetters('units', {
      unitById: 'getById',
    }),
    ...mapGetters('items', {
      itemById: 'getById',
    }),
    minimumContextFields () {
      return {
        unitById: this.unitById,
        itemById: this.itemById,
      };
    },
    processedEffects () {
      return this.effects
        .map(this.processEffect)
        .map((e, index) => {
          const { values, ...parent } = e;
          return values.map(val => ({ ...val, parent, index }));
        }).reduce((acc, val) => acc.concat(val), []);
    },
    iconSize () {
      const breakpoint = this.$vuetify.breakpoint;
      if (breakpoint.lgAndUp) {
        return 36;
      } else {
        return 32;
      }
    },
  },
  methods: {
    processEffect (effect, index) {
      let context;
      if (typeof this.contextHandler === 'function') {
        context = this.contextHandler(effect, index);
      } else {
        context = this.context || {};
      }
      return EffectProcessor.process(effect, { ...(this.minimumContextFields), ...context });
    },
    getTypes (types = [], doTranslate = false) {
      if (!doTranslate) {
        return types.join(', ');
      }
      return types
        .map(type => `${type}: ${(effectTypes[type.toUpperCase()] || effectTypes.UNKNOWN).desc}`)
        .join('\n');
    },
    handleSpType (text) {
      return capitalize(text).replace('sbb', 'SBB').replace('ubb', 'UBB').replace('bb', 'BB').replace('passive', 'LS');
    },
    getEffectIds (translatedEffect) {
      const mainId = getEffectId(translatedEffect.parent.originalEffect);
      const subId = translatedEffect.triggeredEffectContext ? getEffectId(translatedEffect.triggeredEffectContext.originalEffect) : undefined;
      return (subId !== undefined ? [mainId, subId] : [mainId]).join(', ');
    },
    logBuff (buff) {
      logger.debug(buff);
    },
  },
};
</script>

<style>

</style>
