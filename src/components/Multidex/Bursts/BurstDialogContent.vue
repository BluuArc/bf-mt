<template>
  <v-card flat>
    <v-card-text v-if="loadingBurstData" class="text-xs-center pt-5">
      <v-progress-circular indeterminate/>
      <h4 class="subheading">Loading burst data</h4>
    </v-card-text>
    <v-card-text v-else-if="!burst">
      No burst data found.
    </v-card-text>
    <v-card-text v-else class="pl-0 pr-0 pb-5">
      <v-container grid-list-xl class="burst-dialog-content">
        <v-layout row wrap>
          <v-flex xs12>
            <description-card :class="descriptionCardClass" :burst="burst"/>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <hitcount-card style="border-color: var(--hitcount-card-color)" :burst="burst"/>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import DescriptionCard from '@/components/Multidex/Bursts/DescriptionCard';
import HitCountCard from '@/components/Multidex/Bursts/HitCountCard';

export default {
  props: ['burstId'],
  components: {
    'description-card': DescriptionCard,
    'hitcount-card': HitCountCard,
  },
  computed: {
    ...mapState('bursts', ['pageDb']),
    ...mapGetters('units', ['unitById']),
  },
  data () {
    return {
      burst: undefined,
      loadingBurstData: true,
      descriptionCardClass: 'regular',
      // activeTab: 'skills',
    };
  },
  watch: {
    async burstId (newValue) {
      if (!newValue) {
        this.burst = undefined;
      } else {
        this.burstDataChangeHandler();
      }
    },
    async pageDb () {
      if (this.burstId && Object.keys(this.pageDb).length > 0) {
        this.burstDataChangeHandler();
      }
    },
  },
  async mounted () {
    if (this.burstId) {
      this.burstDataChangeHandler();
    }
  },
  methods: {
    ...mapActions('bursts', { getBurst: 'getById' }),
    ...mapActions('units', { getUnit: 'getById' }),
    async burstDataChangeHandler () {
      this.loadingBurstData = true;
      this.burst = await this.getBurst(this.burstId);
      await this.setDescriptionCardClass();
      this.loadingBurstData = false;
    },
    async setDescriptionCardClass () {
      this.descriptionCardClass = 'regular';
      if (!this.burst || !this.burst.associated_units) {
        return;
      }

      const unit = await this.getUnit(this.burst.associated_units[0]);
      const { sbb = {}, ubb = {} } = unit;
      if (sbb.id && sbb.id.toString() === this.burstId) {
        this.descriptionCardClass = 'sbb';
      } else if (ubb.id && ubb.id.toString() === this.burstId) {
        this.descriptionCardClass = 'ubb';
      } else {
        this.descriptionCardClass = 'bb';
      }
    },
  },
};
</script>

<style>
.burst-dialog-content .card {
  border: 2px solid transparent;
  margin: -2px;
  --hitcount-card-color: #388e3c; /* green darken-2 */
  --usage-card-color: #4caf50; /* green */
  --recipe-card-color: #1976d2; /* blue darken-2 */
}

.burst-dialog-content .card.description.regular {
  border-color: #757575; /* grey darken-1 */
}

.burst-dialog-content .card.description.regular > .card__title {
  background-color: #757575; /* grey darken-1 */
}

.burst-dialog-content .card.description.bb {
  border-color: #607d8b; /* blue-grey */
}

.burst-dialog-content .card.description.bb > .card__title {
  background-color: #607d8b; /* blue-grey */
}

.burst-dialog-content .card.description.sbb {
  border-color: #f9a825; /* yellow darken-3 */
}

.burst-dialog-content .card.description.sbb > .card__title {
  background-color: #f9a825; /* yellow darken-3 */
}

.burst-dialog-content .card.description.ubb {
  border-color: #c62828; /* red darken-3 */
}

.burst-dialog-content .card.description.ubb > .card__title {
  background-color: #c62828; /* red darken-3 */
}
</style>
