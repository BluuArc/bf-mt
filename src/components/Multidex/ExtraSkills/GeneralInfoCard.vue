<template>
  <description-card-base
    :entry="skill"
    materialColor="orange darken-4"
    :titleHtmlGenerator="() => 'General Info'"
    :descriptionGetter="() => description"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => []"
    :tabNames="['Description', 'JSON'].filter(val => val)">
    <template slot="title">
      <v-layout row wrap>
        <v-flex xs8 md9 class="text-xs-left">
          <card-title-with-link
            titleHtml="General Info"/>
        </v-flex>
        <v-flex xs4 md3 class="text-xs-right">
          <div class="d-flex-container items-center content-flex-end body-1">
            <b v-text="'Rarity:'" class="mr-1"/>
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon :rarity="rarity" :displaySize="18"/>
          </div>
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
import { mapState, mapGetters } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import RarityIcon from '@/components/Multidex/RarityIcon';
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
    DescriptionCardBase,
    CardTitleWithLink,
    UnitCard,
    RarityIcon,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getMultidexPathTo']),
    description () {
      return (this.skill && this.skill.desc) || 'None';
    },
    associatedUnits () {
      if (!this.skill || !this.skill.associated_units) {
        return [];
      }

      return this.skill.associated_units.map(id => this.pageDb[id]).filter(v => v);
    },
    rarity () {
      return +this.skill.rarity;
    },
  },
};
</script>
