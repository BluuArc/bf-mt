<template>
  <module-checker
    :requiredModules="requiredModules"
    :ensureDbSync="true"
  >
    <tier-list-creator-page
      :categories="parsedConfiguration.categories"
      :entries="parsedConfiguration.entries"
      :config="parsedConfiguration.config"
    />
  </module-checker>
</template>

<script>
import ModuleChecker from '@/components/ModuleChecker';
import TierListCreatorPage from '@/components/Tools/TierListCreator/Main';
import { parseTierListCode } from '@/modules/core/tier-list-creator';
import debounce from 'lodash/debounce';

const DEFAULT_CODE = 'S-000000-ff8a80,A-000000-ffd180,B-000000-ffee58,C-000000-81c784,D-000000-64b5f6';
export default {
  props: {
    code: {
      type: String,
      default: '',
    },
  },
  components: {
    ModuleChecker,
    TierListCreatorPage,
  },
  data () {
    return {
      isFirstLoad: true,
    };
  },
  computed: {
    requiredModules: () => Object.freeze([
      'units',
    ]),
    parsedConfiguration () {
      return parseTierListCode(this.code || (this.isFirstLoad &&  DEFAULT_CODE) || '');
    },
  },
  methods: {
    storeCode () {
      if (this.code) {
        this.$store.commit('tierList/setCurrentCode', this.code);
      }
    },
    debouncedCodeUpdate: debounce(function () {
      this.storeCode();
    }, 1000),
  },
  watch: {
    code () {
      this.isFirstLoad = false;
      this.debouncedCodeUpdate();
    },
  },
  beforeRouteLeave (to, from, next) {
    if (this.debouncedCodeUpdate && typeof this.debouncedCodeUpdate.cancel === 'function') {
      this.debouncedCodeUpdate.cancel();
    }
    this.storeCode();
    next();
  },
};
</script>
