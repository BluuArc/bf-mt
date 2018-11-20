<template>
  <base-selector
    :showSelector="showSelector"
    @toggleview="$emit('toggleview', $event)"
    @input="onBaseInput($event)"
    :defaultSearchOptions="defaultSearchOptions"
    :searchOptions="value.procBuffSearchOptions.slice()"
    :selectedIds="value.procs.slice()"
    :possibleIds="possibleIds"
    :isUnit="isUnit"
    :logger="logger"
    selectLabel="Select Active (Proc) Buffs"
  />
</template>

<script>
import BaseSelector from './BaseSelector';
import { arraysAreDifferent } from '@/modules/utils';
import { procs } from '@/modules/EffectProcessor/constants';
import { Logger } from '@/modules/Logger';

const logger = new Logger({ prefix: '[MULTIDEX/ProcSelector]' });
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
      return this.filterHelper.defaultValues.procBuffSearchOptions;
    },
    possibleIds: () => procs,
    logger: () => logger,
  },
  methods: {
    onBaseInput ({ searchOptions = [], selectedIds = [] }) {
      if (arraysAreDifferent(this.value.procBuffSearchOptions, searchOptions) || arraysAreDifferent(this.value.procs, selectedIds)) {
        this.value.procBuffSearchOptions = searchOptions;
        this.value.procs = selectedIds;
        this.$emit('input', this.value);
      }
    },
  },
}
</script>
