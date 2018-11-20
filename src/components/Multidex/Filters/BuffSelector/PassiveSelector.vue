<template>
  <base-selector
    :showSelector="showSelector"
    @toggleview="$emit('toggleview', $event)"
    @input="onBaseInput($event)"
    :defaultSearchOptions="defaultSearchOptions"
    :searchOptions="value.passiveBuffSearchOptions.slice()"
    :selectedIds="value.passives.slice()"
    :possibleIds="possibleIds"
    :isUnit="isUnit"
    :logger="logger"
    selectLabel="Select Passive Buffs"
  />
</template>

<script>
import BaseSelector from './BaseSelector';
import { arraysAreDifferent } from '@/modules/utils';
import { passives } from '@/modules/EffectProcessor/constants';
import { Logger } from '@/modules/Logger';

const logger = new Logger({ prefix: '[MULTIDEX/PassiveSelector]' });
export default {
  props: {
    showSelector: {
      type: Boolean,
      required: true,
    },
    isUnit: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      required: true,
    },
    filterHelper: {
      required: true,
    },
  },
  components: {
    BaseSelector,
  },
  computed: {
    defaultSearchOptions () {
      return this.filterHelper.defaultValues.passiveBuffSearchOptions;
    },
    possibleIds: () => passives,
    logger: () => logger,
  },
  methods: {
    onBaseInput ({ searchOptions = [], selectedIds = [] }) {
      if (arraysAreDifferent(this.value.passiveBuffSearchOptions, searchOptions) || arraysAreDifferent(this.value.passives, selectedIds)) {
        this.value.passiveBuffSearchOptions = searchOptions;
        this.value.passives = selectedIds;
        this.$emit('input', this.value);
      }
    },
  },
}
</script>
