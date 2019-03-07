<template>
  <v-container>
    Ready {{ mainModuleState }} {{ Object.entries(mainModuleActions).map(([key, value]) => [key, typeof value]) }}
    <v-layout>
      <module-update-dialog
        v-if="hasUpdates"
        :modulesWithUpdates="modulesWithUpdates"
        :downloadData="downloadData">
        <v-btn
          slot="activator"
          color="primary"
          small>
          <v-icon>info</v-icon>
        </v-btn>
      </module-update-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import { servers, missionLocationTypes, multidexModuleInfo } from '@/modules/constants';
import { delay } from '@/modules/utils';
import { Logger } from '@/modules/Logger';
import debounce from 'lodash/debounce';
import LoadingDebouncer from '@/modules/LoadingDebouncer';
import FilterOptionsHelper from '@/modules/FilterOptionsHelper';
import LoadingIndicator from '@/components/LoadingIndicator';
import ResultContainer from '@/components/Multidex/ResultContainer';
import SortOptionsContainer from '@/components/Multidex/SortOptionsContainer';
import FilterOptionsSidebar from '@/components/Multidex/Filters/FilterOptionsSidebar';
import FilterChipList from '@/components/Multidex/Filters/FilterChipList';
import ProcSelector from '@/components/Multidex/Filters/BuffSelector/ProcSelector';
import PassiveSelector from '@/components/Multidex/Filters/BuffSelector/PassiveSelector';
import BaseEntryCard from '@/components/Multidex/BaseEntryCard';
import LadSelector from '@/components/Multidex/Filters/LandAreaDungeonSelector';
import ModuleUpdateDialog from '@/components/ModuleUpdateDialog';

let filterHelper = new FilterOptionsHelper();
let logger = new Logger({ prefix: '[MULTIDEX/default]' });
let loadingDebouncer;
export default {
  props: {
    requiredModules: {
      type: Array,
      default: () => multidexModuleInfo.map(({name}) => name),
    },
    modulesWithUpdates: {
      type: Array,
      default: () => [],
    },
    downloadData: {
      type: Function,
      required: true,
    },
    hasUpdates: {
      type: Boolean,
      default: false,
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
    // synchronous getter
    getEntryById: {
      type: Function,
      default: () => ({}),
    },
    // equivalent to Object.keys(pageDb)
    getAllEntryKeys: {
      type: Function,
      default: () => ([]),
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
    SortOptionsContainer,
    ResultContainer,
    FilterOptionsSidebar,
    FilterChipList,
    ProcSelector,
    PassiveSelector,
    BaseEntryCard,
    LadSelector,
    ModuleUpdateDialog,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    logger: () => logger,
    servers: () => servers,
    missionLocationTypes: () => missionLocationTypes,
    mainModule () {
      return multidexModuleInfo.find(m => m.name === this.requiredModules[0]) || multidexModuleInfo[0];
    },
    mainModuleState () {
      const moduleState = this.$store.state[this.mainModule.name];
      return {
        numEntries: moduleState.numEntries,
        filterUrl: moduleState.filterUrl,
        sortOptions: moduleState.sortOptions,
        otherServers: servers.filter(s =>
          s !== this.activeServer &&
          moduleState.numEntries[s] !== undefined && moduleState.numEntries[s] > 0
        ),
      };
    },
    mainModuleActions () {
      const moduleName = this.mainModule.name;
      const getStorePath = (methodName) => `${moduleName}/${methodName}`;
      return {
        filter: (filters, sorts) => this.$store.dispatch(getStorePath('getFilteredKeys'), { filters, sorts }),
        sort: (options) => this.$store.dispatch(getStorePath('getSortedKeys'), options),
        updateFilterUrl: (url) => this.$store.commit(getStorePath('setFilterUrl'), url),
        updateSortOptions: (options) => this.$store.commit(getStorePath('setSortOptions'), options),
      };
    },
    // separate from isVisuallyLoadingFromOptions
    isInternallyLoadingFromOptions () {
      return this.loadingFilters || this.loadingSorts;
    },
    searchResultCountText () {
      return [`Showing ${this.allSortedEntries.length}`, this.mainModule.fullName, this.mainModule.fullName === 'Dictionary' ? 'Entries' : ''].join(' ');
    },
    numPages () {
      return Math.ceil(this.allSortedEntries.length / this.amountPerPage);
    },
    entriesToShow () {
      const startIndex = this.pageIndex * this.amountPerPage;
      return this.allSortedEntries.slice(startIndex, startIndex + this.amountPerPage);
    },
    hasNonNameFilters () {
      // eslint-disable-next-line no-unused-vars
      const { name, ...filterOptions } = this.filterOptions;
      return filterHelper.hasFilters(filterOptions);
    },
    hasFilters () {
      return !!this.filterOptions.name || this.hasNonNameFilters;
    },
    hasViewId () {
      const entryData = this.getEntryById(this.viewId);
      return !!this.viewId && entryData && Object.keys(entryData).length > 0;
    },
    filterOptionsUrl () {
      return filterHelper.optionsToString(this.filterOptions);
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

    return {
      loadingFilters: false,
      loadingSorts: false,
      isVisuallyLoadingFromOptions: false,

      // resultOptions
      sortOptions,
      filterOptions,
      allSortedEntries: [],
      filteredKeys: [],

      // resultViewConfig
      amountPerPage: 36,
      pageIndex: 0,
      paginationModel: 0,
      filterHelper,

      showEntryDialog: false,
      activeSelector: '',
      showUpdateTooltip: false,
    };
  },
  beforeCreate () {
    if (loadingDebouncer) {
      loadingDebouncer.dispose();
    }
    loadingDebouncer = new LoadingDebouncer(val => {
      this.isVisuallyLoadingFromOptions = val;
    });
  },
  created () {
    logger = new Logger({ prefix: `[MULTIDEX/${this.$route.name}]` });
    filterHelper = new FilterOptionsHelper(this.minRarity, this.maxRarity);
    this.filterOptions = {
      ...filterHelper.defaultValues,
      name: '',
    };
    this.loadingFilters = true; // first time filtering data; set true to avoid flickering loading message
    this.syncUrlFiltersToLocalFilters();
    this.syncSortCacheToPage();
    this.sortOptions.type = this.sortTypes[0];
    this.debounceApplyFilters();
  },
  mounted () {
    this.setDocumentTitle();
    this.setShowEntryDialog();
    this.syncPageIndexToPaginationModel();
  },
  methods: {
    ...mapActions(['setActiveServer']),
    ...mapMutations(['setHtmlOverflowDisableState']),
    changePageByAmount (amount = 0) {
      const newIndex = this.pageIndex + amount;
      this.pageIndex = (amount < 0) ? Math.max(newIndex, 0) : Math.min(newIndex, this.numPages);
    },
    getMultidexPathTo (id, server) {
      const { path, query } = this.getMultidexRouteParamsTo(id, server);
      const filters = (path === this.$route.path && this.filterOptionsUrl) ? this.filterOptionsUrl : undefined;
      const resolvedPath = this.$router.resolve({
        path,
        query: {
          ...query,
          filters,
        },
      });
      // logger.debug('resolved path', resolvedPath);
      return resolvedPath;
    },
    async setServerBasedOnInputServer () {
      if (!this.inputServer) {
        return;
      }
      if (!servers.includes(this.inputServer)) {
        logger.warn(`unknown input server [${this.inputServer}]. Auto rerouting to last known valid server`, this.activeServer);
        await new Promise((fulfill, reject) => {
          this.$router.push(this.getMultidexPathTo(this.viewId, this.activeServer).location, fulfill, reject);
        });
      } else if (this.inputServer !== this.activeServer) {
        try {
          await this.setActiveServer(this.inputServer);
        } catch (err) {
          logger.error(err);
        }
      }
    },
    setDocumentTitle () {
      const defaultTitle = `BF-MT - ${this.mainModule.fullName}`;
      if (this.viewId) {
        const entryData = this.getEntryById(this.viewId);
        document.title = [defaultTitle, (entryData && entryData.name) || this.viewId].join(' - ');
      } else if (this.hasFilters) {
        document.title = [defaultTitle, 'Search Results'].join(' - ');
      } else {
        document.title = defaultTitle;
      }
    },
    resetNonNameFilters () {
      const defaultFilterOptions = filterHelper.defaultValues;
      const name = this.filterOptions.name || '';
      this.filterOptions = {
        ...defaultFilterOptions,
        name,
      };
      logger.debug('reset filter options', this.filterOptions, this.filterOptionsUrl);
      this.syncLocalFiltersToUrlFilters(true);
    },
    syncPageSortsToCache () {
      logger.debug('storing sorts', this.sortOptions);
      this.mainModuleActions.updateSortOptions(JSON.stringify(this.sortOptions));
    },
    syncSortCacheToPage () {
      const sortCache = this.mainModuleState && this.mainModuleState.sortOptions;
      logger.debug('setting sorts from cache', sortCache);
      if (sortCache !== JSON.stringify(this.sortOptions)) {
        this.sortOptions = {
          ...this.sortOptions,
          ...(JSON.parse(sortCache) || {}),
        };
      }
    },
    async syncLocalFiltersToUrlFilters (forcePush = false) {
      if (forcePush || this.mainModuleState.filterUrl !== this.filterOptionsUrl) {
        logger.debug('going to new filter options url', this.filterOptionsUrl || undefined);
        this.mainModuleActions.updateFilterUrl(this.filterOptionsUrl);
        await new Promise((fulfill, reject) => {
          this.$router.replace({
            path: this.$route.path,
            query: {
              ...this.$route.query,
              viewId: this.viewId || undefined,
              server: this.inputServer || undefined,
              filters: this.filterOptionsUrl || undefined,
            },
          }, fulfill, reject);
        });
      }
    },
    async syncUrlFiltersToLocalFilters () {
      if (Object.keys(this.inputFilters).length > 0) {
        // get from url
        logger.debug('input filters', this.inputFilters);
        this.filterOptions = {
          ...this.filterOptions,
          ...this.inputFilters,
        };
      } else if (this.mainModuleState && this.mainModuleState.filterUrl) {
        // get from cache
        const cachedFilters = filterHelper.stringToOptions(this.mainModuleState.filterUrl);
        this.filterOptions = {
          ...this.filterOptions,
          ...(cachedFilters || {}),
        };
        this.syncLocalFiltersToUrlFilters(true); // update URL
      } else {
        logger.debug('no filter cache found');
      }
    },
    async closeDialog () {
      if (this.dialogCloseLink) {
        await new Promise((fulfill, reject) => {
          this.$router.push(this.dialogCloseLink, fulfill, reject);
        });
      } else {
        await new Promise((fulfill, reject) => {
          this.$router.push({
            path: this.$route.path,
            query: {
              filters: this.filterOptionsUrl || undefined,
            },
          }, fulfill, reject);
        });
      }
      this.showEntryDialog = false;
    },
    syncPageIndexToPaginationModel () {
      this.paginationModel = this.pageIndex + 1;
    },
    setHtmlOverflow () {
      this.setHtmlOverflowDisableState(!!this.activeSelector || this.showEntryDialog);
    },
    onResize: debounce(async function () {
      if (this.showUpdateTooltip) {
        this.showUpdateTooltip = false;
        await this.$nextTick();
        this.showUpdateTooltip = true;
      }
    }, 250),
    async applyFilters () {
      logger.debug('applying filters');
      if (this.isInternallyInitializing) {
        this.filteredKeys = [];
        this.loadingFilters = false;
        return;
      }
      this.loadingFilters = true;
      try {
        this.filteredKeys = await this.mainModuleActions.filter(this.filterOptions, this.sortOptions);
        this.allSortedEntries = this.filteredKeys.slice(); // sort automatically applied in filter function
      } catch (err) {
        logger.error('FILTER', err);
        this.filteredKeys = this.getAllEntryKeys();
      }
      this.loadingFilters = false;
    },
    async applySorts () {
      if (this.isInternallyInitializing) {
        this.allSortedEntries = [];
        return;
      }
      this.loadingSorts = true;
      try {
        this.allSortedEntries = await this.mainModuleActions.sort({
          ...this.sortOptions,
          keys: this.filteredKeys.slice(),
        });
      } catch (err) {
        logger.error('SORT', err);
        this.allSortedEntries = this.filteredKeys.slice();
      }
      this.loadingSorts = false;
    },
    debounceApplyFilters: debounce(async function () {
      logger.debug('debounce apply filters');
      this.lastKnownFilters = filterHelper.optionsToString(this.filterOptions);
      await this.applyFilters();
      this.syncPageSortsToCache();
      this.loadingFilters = false;
    }, 750),
    debounceApplySorts: debounce(function () {
      this.applySorts();
      this.syncPageSortsToCache();
    }, 250),
    setShowEntryDialog () {
      this.showEntryDialog = !!this.viewId;
    },
  },
  watch: {
    isInternallyLoadingFromOptions () {
      loadingDebouncer.setValue(() => this.isInternallyLoadingFromOptions);
    },
    filterOptions: {
      deep: true,
      handler () {
        this.pageIndex = 0;
        // filter out invalid rarity values
        if (this.filterOptions.rarity && this.filterOptions.rarity.some(val => val < this.minRarity || val > this.maxRarity)) {
          this.filterOptions.rarity = this.filterOptions.rarity.filter(val => val >= this.minRarity && val <= this.maxRarity);
        } else if (typeof this.filterOptions.name !== 'string') {
          this.filterOptions.name = '';
        } else {
          this.syncLocalFiltersToUrlFilters();
          this.debounceApplyFilters();
        }
      },
    },
    sortOptions: {
      deep: true,
      handler () {
        this.debounceApplySorts();
      },
    },
    amountPerPage (newValue) {
      this.pageIndex = 0;
      const value = !isNaN(newValue) ? +newValue : 1;
      if (value < 1) {
        this.amountPerPage = 1;
      } else if (value > this.allSortedEntries.length) {
        this.amountPerPage = this.allSortedEntries.length;
      } else {
        this.amountPerPage = value;
      }
    },
    viewId () {
      this.setShowEntryDialog();
      this.setDocumentTitle();
    },
    activeServer () {
      this.setShowEntryDialog();
    },
    inputFilters (newValue, oldValue) {
      const hasChanged = filterHelper.optionsToString(newValue) !== filterHelper.optionsToString(oldValue);
      if (hasChanged && !this.showEntryDialog) {
        logger.debug('input filters changed to', newValue);
        this.syncUrlFiltersToLocalFilters();
        this.syncSortCacheToPage();
      }
    },
    activeSelector () {
      this.setHtmlOverflow();
    },
    async showEntryDialog (isShowing) {
      this.setHtmlOverflow();

      if (!isShowing) {
        // fix for bottom padding going missing after dialog closes
        await delay(1000);
        const vContent = document.querySelector('.application--wrap .v-content');
        if (vContent.style.paddingBottom !== '56px' ) {
          logger.debug('changing padding');
          vContent.style.paddingBottom = '56px';
        }
      }
    },
    paginationModel (newValue) {
      this.pageIndex = newValue - 1;
    },
    hasFilters () {
      this.setDocumentTitle();
    },
  },
};
</script>

<style>

</style>
