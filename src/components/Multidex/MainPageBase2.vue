<template>
  <v-container grid-list-sm class="multidex-page">
    <!-- search card -->

    <!-- results area -->
    <v-layout row>
      <v-flex v-if="isVisuallyInitializing">
        <loading-indicator :loadingMessage="aggregatedLoadingMessage"/>
      </v-flex>
      <v-flex v-else>
        <result-container
            class="pa-0"
            :dataIsLoading="isVisuallyLoadingFromOptions"
            :loadingMessage="`${loadingFilters ? 'Loading' : 'Sorting'} data...`"
            :requiredModules="pageModules"
            :stateInfo="stateInfo"
            :actionInfo="actionInfo"
            :maxResults="stateInfo[mainModule.name].numEntries[activeServer]"
            :numResults="allSortedEntries.length"
            :logger="logger">
            ready
          </result-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import { Logger } from '@/modules/Logger';
import { moduleInfo } from '@/store/multidex';
import { generateStateInfo, generateActionInfo } from '@/modules/utils';
import { servers } from '@/modules/constants';
import FilterOptionsHelper from '@/modules/FilterOptionsHelper';
import LoadingIndicator from '@/components/LoadingIndicator';
import ResultContainer from '@/components/Multidex/ResultContainer';

let filterHelper = new FilterOptionsHelper();
let logger = new Logger({ prefix: '[MULTIDEX/default]' });
export default {
  props: {
    requiredModules: {
      type: Array,
      default: () => moduleInfo.map(({name}) => name),
    },
    viewId: {
      type: String,
      default: '',
    },
    sortTypes: {
      default: () => {
        return {
          'Data ID': (idA, idB, isAscending) => {
            const result = (+idA - +idB);
            return isAscending ? result : -result;
          },
        };
      },
    },
    inputServer: {
      type: String,
      default: '',
    },
    pageDb: {
      type: Object,
      default: () => {},
    },
    getMultidexRouteParamsTo: {
      type: Function,
      required: true,
    },
    dialogCloseLink: {
      type: String,
      default: '',
    },
    filterTypes: {
      type: Array,
      default: () => filterHelper.filterTypes,
    },
    inputFilters: {
      type: Object,
      default: () => {},
    },
    minRarity: {
      type: Number,
      default: 0,
    },
    maxRarity: {
      type: Number,
      default: 8,
    },
    isUnit: {
      type: Boolean,
      default: false,
    },
    onChangeButtonClick: {
      type: Function,
    },
  },
  components: {
    LoadingIndicator,
    ResultContainer,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    ...mapState({
      inInitState: 'inInitState',
      isStateLoading: 'loadingState',
      updateTimes: 'updateTimes',
    }),
    logger: () => logger,
    servers: () => servers,
    pageModules () {
      return moduleInfo.filter(m => this.requiredModules.includes(m.name));
    },
    mainModule () {
      if (this.pageModules.length === 0) {
        logger.warn('No page modules specified. Defaulting to module at first index', moduleInfo[0].name);
      }
      return this.pageModules.find(m => m.name === this.requiredModules[0]) || moduleInfo[0];
    },
    stateInfo () {
      return generateStateInfo(this, moduleInfo.filter(m => m.type === 'multidex'));
    },
    actionInfo () {
      return generateActionInfo(this, this.pageModules);
    },
    aggregatedLoadingMessage () {
      return moduleInfo.filter(m => this.stateInfo[m.name] && this.stateInfo[m.name].loadingMessage)
        .map(m => `[${m.fullName}] ${this.stateInfo[m.name].loadingMessage}`)
        .reduce((acc, val) => acc || val, '');
    },
    aggregatedLoadingState () {
      return Object.values(this.stateInfo).reduce((acc, val) => acc || val.isLoading, false);
    },
    toUpdate () {
      const result = this.pageModules.filter(m => this.stateInfo[m.name] && this.stateInfo[m.name].hasUpdates[this.activeServer]);
      logger.debug('setting toUpdate', result);
      return result;
    },
    hasRequiredModules () {
      const result = this.pageModules.every(({ name }) => this.stateInfo[name] && this.stateInfo[name].numEntries[this.activeServer] > 0);
      logger.debug('setting hasRequiredModules', result);
      return result;
    },
    // separate from isVisuallyInitializing
    isInternallyInitializing () {
      return this.aggregatedLoadingState || this.inInitState || this.isStateLoading;
    },
    // separate from isVisuallyLoadingFromOptions
    isInternallyLoadingFromOptions () {
      return this.loadingFilters || this.loadingSorts;
    },
  },
  data () {
    const filterOptions = {
      ...filterHelper.defaultValues,
      name: '',
    };
    const sortOptions = {
      type: 'ID',
      isAscending: true,
    };
    const resultOptions = {
      allSortedEntries: [],
      filterKeys: [],
    };
    return {
      sortOptions,
      filterOptions,
      ...resultOptions,
      isVisuallyInitializing: true,
      loadingFilters: false,
      loadingSorts: false,
      isVisuallyLoadingFromOptions: true,
    };
  },
  methods: {
    setVisuallyInitializingDebounced: debounce(function (valueGetter) {
      const newValue = !!valueGetter();
      if (this.isVisuallyInitializing !== newValue) {
        this.isVisuallyInitializing = newValue;
      }
    }, 500),
    setVisuallyLoadingFromOptionsDebounced: debounce(function (valueGetter) {
      const newValue = !!valueGetter();
      if (this.isVisuallyLoadingFromOptions !== newValue) {
        this.isVisuallyLoadingFromOptions = newValue;
      }
    }, 500),
  },
  watch: {
    isInternallyInitializing (newValue) {
      logger.debug('is internally loading', newValue, this.hasRequiredModules);
      if (newValue) {
        this.isVisuallyInitializing = newValue;
      } else {
        this.setVisuallyInitializingDebounced(() => this.isInternallyInitializing);
      }
    },
    isVisuallyInitializing (newValue) {
      logger.debug('visual is initializing', newValue);
    },
    isInternallyLoadingFromOptions (newValue) {
      logger.debug('is internally loading from options', newValue);
      if (newValue) {
        this.isVisuallyLoadingFromOptions = newValue;
      } else {
        this.setVisuallyLoadingFromOptionsDebounced(() => this.isInternallyLoadingFromOptions);
      }
    },
    isVisuallyLoadingFromOptions (newValue) {
      logger.debug('visual is loading from options', newValue);
    },
  },
  created () {
    logger = new Logger({ prefix: `[MULTIDEX/${this.$route.name}]` });
    filterHelper = new FilterOptionsHelper(this.minRarity, this.maxRarity);
    this.filterOptions = {
      ...filterHelper.defaultValues,
      name: '',
    };
    this.filterHelper = filterHelper;
  },
  mounted () {
    if (!this.isInternallyInitializing) {
      this.setVisuallyInitializingDebounced(() => this.isInternallyInitializing);
    }
  },
};
</script>

<style>

</style>
