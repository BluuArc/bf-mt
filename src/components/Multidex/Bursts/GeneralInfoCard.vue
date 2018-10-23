<template>
  <description-card-base
    class="burst-card"
    :entry="burst"
    :materialColor="titleColor"
    :titleHtmlGenerator="() => 'General Info'"
    :descriptionGetter="() => description"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => []"
    :tabNames="['Description', 'JSON'].filter(val => val)">
    <template slot="title">
      <v-layout row wrap>
        <v-flex xs12 sm8 md9 class="text-xs-left">
          <card-title-with-link
            titleHtml="General Info"/>
        </v-flex>
        <v-flex xs12 sm4 md3 class="text-xs-right">
          <v-tooltip bottom>
            <span slot="activator" style="border-bottom: 1px dotted;" class="body-1">
              {{ bcdcInfo.cost }} BC/{{ bcdcInfo.hits }} {{ bcdcInfo.hits === 1 ? 'Hit' : 'Hits' }}/{{ bcdcInfo.dropchecks }} DC
            </span>
            <span>
              BC required to fill {{ burstType.toUpperCase() }} gauge / Hits on {{ burstType.toUpperCase() }} / Total BC Dropchecks
            </span>
          </v-tooltip>
        </v-flex>
      </v-layout>
    </template>
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
import * as burstHelpers from '@/modules/core/bursts';

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
    bcdcInfo () {
      if (!this.burst) {
        return { cost: 0, hits: 0, dropchecks: 0 };
      }

      return burstHelpers.getBcDcInfo(this.burst);
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
  methods: {
    ...mapActions('units', {
      getUnit: 'getById'
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

<style lang="less">
.burst-card {
  .v-expansion-panel__header {
    height: auto;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
