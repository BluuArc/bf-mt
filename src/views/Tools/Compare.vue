<template>
  <module-checker :requiredModules="requiredModules">
    <compare-page :compareInput="compareInput"/>
  </module-checker>
</template>

<script>
import { convertCompareCodeToInput } from '@/modules/core/compare';
import { Logger } from '@/modules/Logger';
import ModuleChecker from '@/components/ModuleChecker';
import ComparePage from '@/components/Tools/Compare/Main';

const logger = new Logger({ prefix: '[Compare]' });
export default {
  props: {
    input: {
      type: String,
      default: '',
    },
  },
  components: {
    ModuleChecker,
    ComparePage,
  },
  computed: {
    requiredModules: () => Object.freeze([
      'units',
      'items',
      'bursts',
      'extraSkills',
      'leaderSkills',
    ]),
    compareInput () {
      // format: <type>-<id>_options~by~tilde
      const result = Array.from(new Set(this.input.split(','))).map(input => {
        try {
          return convertCompareCodeToInput(input);
        } catch (err) {
          logger.warn('error parsing input', { input, err });
        }
      }).filter(v => v);
      return Object.freeze(result);
    },
  },
};
</script>
