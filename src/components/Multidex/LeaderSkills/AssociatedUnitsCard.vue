<template>
  <bordered-titled-card materialColor="indigo" class="multidex-dialog-content-card">
    <span slot="title">Associated Units</span>
    <v-container fluid>
      <v-layout>
        <v-flex>
          The following units have this leader skill:
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
  </bordered-titled-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import BorderedTitledCard from '@/components/BorderedTitledCard';
import UnitCard from '@/components/Multidex/Units/EntryCard';

export default {
  props: {
    skill: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    BorderedTitledCard,
    UnitCard,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getMultidexPathTo', 'getById']),
    description () {
      return (this.skill && this.skill.desc) || 'None';
    },
    associatedUnits () {
      if (!this.skill || !this.skill.associated_units) {
        return [];
      }

      const getDbId = (associatedUnitId) => `${associatedUnitId}`.includes(':') ? `${associatedUnitId}`.split(':')[0] : associatedUnitId;
      return this.skill.associated_units.map(id => this.pageDb[getDbId(id)]).filter(v => v);
    },
  },
};
</script>
