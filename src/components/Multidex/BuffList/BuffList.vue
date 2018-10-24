<template>
  <v-container fluid>
    <v-layout row>
      <v-flex>
        <h3 class="subheading">
          <b>Note:</b> This feature (Buff List) is still in development. None of the information here (UI, description, etc.) is guaranteed to be final or correct.
        </h3>
      </v-flex>
    </v-layout>
    <v-layout>
      TODO: {{ effects }}
      <template v-if="contextHandler">
        <br>
        Context: {{ contextHandler(effects[0], 0) }}
      </template>
    </v-layout>
    <!-- <v-layout row wrap>
      <template v-for="(effect, i) in processedEffects">
        <v-flex xs1 :key="`${i}-icon`" class="text-xs-center">
          <buff-icon @click.native="logBuff(effect)" :icon-key="effect.iconKey"/>
        </v-flex>
        <v-flex xs1 v-if="$vuetify.breakpoint.mdAndUp" :key="`${i}-type`" class="text-xs-center">
          <p class="mb-0" :title="getTypes(effect.parent.type, true)"
            >{{ getTypes(effect.parent.type) }}</p>
        </v-flex>
        <v-flex :xs10="$vuetify.breakpoint.mdAndUp" :xs11="!$vuetify.breakpoint.mdAndUp" :key="i" class="text-xs-left">
          <p class="mb-0">
            <span v-if="effect.parent.originalEffect.sp_type">({{ handleSpType(effect.parent.originalEffect.sp_type) }})</span>
            <span v-if="effect.value.turns && !effect.triggeredEffectContext">{{ effect.value.turns.text }}</span>
            <span>{{ effect.desc }}</span>
            <span v-text="`[${getEffectIds(effect)}]`"/>
            <span v-if="effect.value && effect.value.conditions && effect.value.conditions.text" class="d-block"><i>Requirement:</i> {{ effect.value.conditions.text }}</span>
          </p>
        </v-flex>
      </template>
    </v-layout> -->
  </v-container>
</template>

<script>
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
};
</script>

<style>

</style>
