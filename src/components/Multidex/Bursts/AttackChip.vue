<template>
  <v-chip
    v-bind="$attrs"
    small
    outline
    style="pointer-events: none;"
    :color="!$vuetify.theme.dark ? 'white' : 'black'"
    :text-color="!$vuetify.theme.dark ? 'white' : 'black'"
  >
    <v-avatar :class="{ 'grey': true, 'darken-2': !$vuetify.theme.dark, 'lighten-2': $vuetify.theme.dark }">
      {{ hits }}
    </v-avatar>
    {{ label }}
  </v-chip>
</template>

<script>
import { getEffectName } from '@/modules/core/buffs';

export default {
  props: {
    attack: {
      type: Object,
      required: true,
    },
  },
  computed: {
    hits () {
      return this.attack.hits;
    },
    label () {
      const { id, target } = this.attack;
      const buffName = (getEffectName({ 'proc id': id }) || '').replace(/ Damage$/, '');
      return `${buffName ? `${buffName} ` : ''}${target}`;
    },
  },
};
</script>
