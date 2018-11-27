<template>
  <description-card-base
    :entry="burst"
    :materialColor="titleColor"
    :titleHtmlGenerator="() => 'General Info'"
    :descriptionGetter="() => description"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => []"
    :tabNames="['Description', 'JSON'].filter(val => val)">
    <template slot="description">
      {{ description }}
      <v-container fluid class="pl-0 pr-0" v-if="associatedUnits.length > 0">
        <v-layout>
          <v-flex>
            <h2 class="subheading">Associated Units</h2>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex
            v-for="(unit, i) in associatedUnits"
            :key="i"
            xs12 sm6 md4 xl3>
            <unit-card :to="getMultidexPathTo(unit.id)" :entry="unit"/>
          </v-flex>
        </v-layout>
      </v-container>
    </template>
  </description-card-base>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import UnitCard from '@/components/Multidex/Units/EntryCard';

export default {
  props: {
    burst: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
    CardTitleWithLink,
    UnitCard,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getMultidexPathTo']),
    description () {
      return (this.burst && this.burst.desc) || 'None';
    },
    titleColor () {
      const types = {
        bb: 'blue-grey',
        sbb: 'yellow darken-3',
        ubb: 'red darken-3',
      };
      return types[this.burstType];
    },
    associatedUnits () {
      if (!this.burst || !this.burst.associated_units) {
        return [];
      }

      return this.burst.associated_units.map(id => this.pageDb[id]).filter(v => v);
    },
  },
  data: () => ({
    burstType: 'bb',
  }),
  watch: {
    async burst () {
      await this.setBurstType();
    },
  },
  async mounted () {
    await this.setBurstType();
  },
  methods: {
    ...mapActions('units', {
      getUnit: 'getById',
    }),
    async setBurstType () {
      this.burstType = 'bb';
      if (!this.burst || !this.burst.associated_units) {
        return;
      }

      const unit = await this.getUnit(this.burst.associated_units[0]);
      const burstId = this.burst.id.toString();
      const { sbb = {}, ubb = {} } = unit;
      if (sbb.id && sbb.id.toString() === burstId) {
        this.burstType = 'sbb';
      } else if (ubb.id && ubb.id.toString() === burstId) {
        this.burstType = 'ubb';
      } else {
        this.burstType = 'bb';
      }
    },
  },
};
</script>
