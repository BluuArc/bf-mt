<template>
  <v-expansion-panel v-bind="$attrs" :value="value" @input="$v => $emit('input', $v)">
    <v-expansion-panel-content v-for="(entry, i) in internalEntries" :key="getKeyFunction(entry, i)">
      <template slot="header">
        <slot name="header" :arrayEntry="entry" :index="i">
          Header
        </slot>
      </template>
      <slot name="default" :arrayEntry="entry" :index="i">
        <div>{{ entry }}</div>
      </slot>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import DelayedVForMixin from '@/components/DelayedVForMixin';
export default {
  mixins: [DelayedVForMixin],
  props: {
    value: {
      required: false,
    },
  },
};
</script>
