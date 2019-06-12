<template>
  <module-checker :requiredModules="requiredModules">
    <compare-page :compareInput="compareInput"/>
  </module-checker>
</template>

<script>
import { COMPARE_KEY_ORDER } from '@/modules/constants';
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
          const [type, idAndOptions] = input.split('-');
          const [id, options] = idAndOptions.split('_');
          if (COMPARE_KEY_ORDER.includes(type)) {
            return { type, id, options };
          }
        } catch (err) {
          logger.warn('error parsing input', { input, err });
        }
      }).filter(v => v);
      return Object.freeze(result);
    },
  },
};
</script>
