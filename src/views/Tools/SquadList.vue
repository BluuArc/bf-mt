<template>
  <v-container>
    <!-- TODO: check that units, items, and es modules exist -->
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
</template>

<script>
import { mapActions } from 'vuex';
import SquadListCard from '@/components/Tools/Squads/SquadListCard';
import { unitPositionMapping } from '@/modules/constants';

export default {
  components: {
    SquadListCard,
  },
  computed: {
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
    };
  },
  async created () {
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

    this.units = await this.getUnits({ ids: Array.from(unitIds) });
    this.items = await this.getItems({ ids: Array.from(itemIds) });
    this.extraSkills = await this.getExtraSkills({ ids: Array.from(esIds) });
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
};
</script>
