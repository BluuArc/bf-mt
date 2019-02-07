<template>
  <module-checker
    :requiredModules="requiredModules"
    :isExternallyLoading="isVisuallyLoading"
    externalLoadingMessage="Fetching squad information..."
    @initfinished="getDbData">
    <v-container>
      <v-layout row wrap>
        <v-flex xs12 v-for="squad in squads" :key="squad.id">
          <squad-list-card
            class="ma-2"
            :squad="squad"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            @view="() => goToSquadPage(squad.id)"
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

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[SquadList]' });
let loadingDebouncer;
export default {
  components: {
    SquadListCard,
    ModuleChecker,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    requiredModules: () => squadRequiredModules,
    squads () {
      return (new Array(10))
        .fill(0)
        .map(() => Object.freeze(this.getSampleSquad()));
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
    };
  },
  beforeCreate () {
    if (loadingDebouncer) {
      loadingDebouncer.dispose();
    }
    loadingDebouncer = new LoadingDebouncer(val => {
      this.isVisuallyLoading = val;
    });
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
        async () => { this.units = await this.getUnits({ ids: Array.from(unitIds), server: currentServer }); },
        async () => { this.items = await this.getItems({ ids: Array.from(itemIds), server: currentServer }); },
        async () => { this.extraSkills = await this.getExtraSkills({ ids: Array.from(esIds), server: currentServer }); },
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
      name: 'Example Squad',
      lead: 0,
      friend: 3,
      units: (new Array(6))
        .fill(0)
        .map((_, i) => ({
          position: unitPositionMapping[i],
          id: `${i+1}0017`,
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
    goToSquadPage (id) {
      this.$router.push({ path: `/tools/squads/${id}` });
    },
  },
  watch: {
    isInternallyLoading () {
      loadingDebouncer.setValue(() => this.isInternallyLoading);
    },
  },
};
</script>
