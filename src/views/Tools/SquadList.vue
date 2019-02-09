<template>
  <module-checker
    :requiredModules="requiredModules"
    :isExternallyLoading="isVisuallyLoading"
    externalLoadingMessage="Fetching squad information..."
    @initfinished="getDbData">
    <v-container>
      <v-toolbar
        fixed extended
        scroll-off-screen
        extension-height="72px"
      >
        <v-container
          fluid
          slot="extension"
          id="squad-list--search-extension"
          :class="{ 'pt-0 pb-0 mb-1 px-1': true, focused: searchIsFocused }">
          <form @submit.prevent="onFilterUpdate">
            <v-layout row align-center>
              <v-flex>
                <v-text-field
                  v-model="nameFilter"
                  @focusin="searchIsFocused = true"
                  @focusout="searchIsFocused = false"
                  clearable
                  :color="lightMode ? 'black' : 'white'"
                  label="Search"
                  prepend-inner-icon="search"
                  :hint="`${sortedSquads.length} ${sortedSquads.length === 1 ? 'squad' : 'squads'}`"
                  persistent-hint
                />
              </v-flex>
              <v-layout row style="flex-grow: 0">
                <v-flex style="flex-grow: 0">
                  <v-btn icon flat>
                    <v-icon>sort</v-icon>
                  </v-btn>
                </v-flex>
                <v-flex style="flex-grow: 0">
                  <v-btn
                    type="submit"
                    @click="onFilterUpdate"
                    :outline="!filterChanged"
                    :color="filterChanged ? 'primary' : ''"
                    style="min-width: 64px;"
                    round>
                    <v-icon>search</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-layout>
          </form>
        </v-container>
      </v-toolbar>
      <v-layout row wrap class="mt-5 pt-2">
        <v-flex xs12 v-for="(squad, i) in sortedSquads" :key="squad.id">
          <squad-list-card
            :id="`squad-result-${i + 1}`"
            class="ma-2"
            :squad="squad"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :to="`/tools/squads/${squad.id}`"
            @register="registerSquadCard"
            @unregister="unRegisterSquadCard"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </module-checker>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import SquadListCard from '@/components/Tools/Squads/SquadListCard';
import ModuleChecker from '@/components/ModuleChecker';
import { unitPositionMapping } from '@/modules/constants';
import { squadRequiredModules } from '@/router/tool-routes';
import { Logger } from '@/modules/Logger';
import LoadingDebouncer from '@/modules/LoadingDebouncer';
import debounce from 'lodash/debounce';

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[SquadList]' });
let loadingDebouncer;
let intersectionObserver;
export default {
  components: {
    SquadListCard,
    ModuleChecker,
  },
  computed: {
    ...mapState('settings', ['activeServer', 'lightMode']),
    requiredModules: () => squadRequiredModules,
    squads () {
      return (new Array(10))
        .fill(0)
        .map(() => Object.freeze(this.getSampleSquad()));
    },
    sortedSquads () {
      return Object.freeze(this.filteredSquads.slice());
    },
  },
  data () {
    return {
      units: {},
      items: {},
      extraSkills: {},
      isInternallyLoading: false,
      isVisuallyLoading: false,
      activeCallToken: '0',
      isVisible: false,
      squadDomElems: {},
      nameFilter: '',
      searchIsFocused: false,
      filterChanged: false,
      filteredSquads: [],
    };
  },
  beforeCreate () {
    if (loadingDebouncer) {
      loadingDebouncer.dispose();
    }
    loadingDebouncer = new LoadingDebouncer(val => {
      this.isVisuallyLoading = val;
    });

    if (intersectionObserver && intersectionObserver.disconnect) {
      intersectionObserver.disconnect();
    }
    intersectionObserver = new IntersectionObserver((entries) => {
      const squadKeys = Object.keys(this.squadDomElems);
      entries.forEach(entry => {
        const squadId = squadKeys.find(key => this.squadDomElems[key].elem === entry.target);
        // logger.warn({ elem: entry.target, isIntersecting: entry.isIntersecting, squadId });
        if (squadId) {
          this.squadDomElems[squadId].setVisibility(entry.isIntersecting);
        }
      });
    });
  },
  beforeDestroy () {
    if (intersectionObserver && intersectionObserver.disconnect) {
      intersectionObserver.disconnect();
    }
  },
  methods: {
    ...mapActions('units', {
      getUnits: 'getByIds',
    }),
    ...mapActions('items', {
      getItems: 'getByIds',
    }),
    ...mapActions('extraSkills', {
      getExtraSkills: 'getByIds',
    }),
    async getDbData () {
      this.isInternallyLoading = true;
      // generate unique value on every call
      const activeCallToken = [(new Date().valueOf()).toString(), Math.random().toString()].join('-');
      this.activeCallToken = activeCallToken;
      const unitIds = new Set(), esIds = new Set(), itemIds = new Set();
      this.squads.forEach(squad => {
        squad.units.forEach(unit => {
          unitIds.add(unit.id);
          if (unit.es) {
            esIds.add(unit.es);
          }
          if (unit.spheres.length > 0) {
            unit.spheres.forEach(id => {
              itemIds.add(id);
            });
          }
        });
      });

      const currentServer = this.activeServer;
      await [
        async () => this.units = await this.getUnits({
          ids: Array.from(unitIds),
          server: currentServer,
          extractedFields: ['id', 'rarity', 'feskills', 'name', 'sbb', 'cost'],
        }),
        async () => this.items = await this.getItems({
          ids: Array.from(itemIds),
          server: currentServer,
          extractedFields: ['name', 'sphere type'],
        }),
        async () => this.extraSkills = await this.getExtraSkills({
          ids: Array.from(esIds),
          server: currentServer,
          extractedFields: ['name'],
        }),
      ].reduce((acc, val) => acc.then(() => {
        // only continue if call token is the same
        if (activeCallToken === this.activeCallToken) {
          return val();
        }
      }), Promise.resolve());
      if (activeCallToken === this.activeCallToken) {
        this.isInternallyLoading = false;
      }
    },
    getSampleSquad: () => ({
      id: Math.random().toString().split('.')[1],
      name: `Example Squad ${String.fromCharCode('A'.charCodeAt(0) + (Math.floor(Math.random() * 26)))}`,
      lead: 0,
      friend: 3,
      units: (new Array(6))
        .fill(0)
        .map((_, i) => ({
          position: unitPositionMapping[i],
          id: `${i+1}001${Math.floor(Math.random() * 7) + 1}`,
          es: (Math.random() > 0.5) && '1013600',
          spheres: [(Math.random() > 0.5) && '47410', (Math.random() > 0.5) && '61070'].filter(v => v),
          sp: ((Math.random() > 0.5)) && 'ACDE',
          bbOrder: i + 1,
          bbType: ['bb', 'sbb', 'ubb'][Math.floor(Math.random() * 3)],
        })),
    }),
    getUnit (id) {
      return this.units[id] || {};
    },
    getItem (id) {
      return this.items[id] || {};
    },
    getExtraSkill (id) {
      return this.extraSkills[id] || {};
    },
    registerSquadCard ({ elem, squadId, setVisibility } = {}) {
      if (elem && squadId) {
        if (this.squadDomElems[squadId]) {
          intersectionObserver.unobserve(this.squadDomElems[squadId].elem);
        }
        intersectionObserver.observe(elem);
        this.squadDomElems[squadId] = {
          elem,
          setVisibility: (val) => setVisibility(val),
        };
      }
    },
    unRegisterSquadCard ({ squadId } = {}) {
      if (squadId && this.squadDomElems.hasOwnProperty(squadId)) {
        intersectionObserver.unobserve(this.squadDomElems[squadId].elem);
      }
    },
    // TODO: offload filter into a worker
    filterSquads ({ name = '' } = {}) {
      const lowerCaseName = name && name.toLowerCase();
      const includesName = (n) => (n || '').toLowerCase().includes(lowerCaseName);
      return this.squads.filter(s => {
        return [
          () => !lowerCaseName, // check if name has any values
          () => includesName(s.id.toString()),
          () => s.name && includesName(s.name),
          () => s.units.some(u => [
            () => includesName(this.getUnit(u.id).name),
            () => u.es && includesName(this.getExtraSkill(u.es).name),
            () => Array.isArray(u.spheres) && u.spheres.some(i => includesName(this.getItem(i).name)),
          ].some(v => v())),
        ].some(v => v());
      });
    },
    onFilterUpdate: debounce(function () {
      this.filteredSquads = this.filterSquads({ name: this.nameFilter });
      this.filterChanged = false;
    }, 300),
  },
  watch: {
    isInternallyLoading () {
      loadingDebouncer.setValue(() => this.isInternallyLoading);
    },
    squads: {
      immediate: true,
      handler () {
        this.onFilterUpdate();
      },
    },
    nameFilter () {
      this.filterChanged = true;
    },
  },
};
</script>

<style lang="less">
#squad-list--search-extension {
  background-color: var(--background-color-alt--lighten-1);
  border-radius: 28px;
  transition: border-color 0.25s;
  border: 1px solid var(--background-color-alt--lighten-1);

  &.focused {
    border-color: var(--border-color-alt--lighten-2);
  }

  .v-text-field {
    .v-input__slot {
      margin-bottom: 0;
      &::before, &::after {
        border-width: 0;
      }
    }

    .v-messages {
      padding-left: 28px;
    }
  }
}
</style>
