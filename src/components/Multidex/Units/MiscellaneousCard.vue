<template>
  <bordered-titled-card materialColor="teal">
    <template slot="title">
      <b>Miscellaneous Info</b>
    </template>
    <v-container fluid class="subheading text-xs-center miscellaneous-unit-list" grid-list-xl>
      <v-layout row>
        <v-flex xs6 class="pl-0 pr-0">
          <b>Element:</b>
        </v-flex>
        <v-flex xs6>
          <span class="d-flex-container items-center content-center">
            <element-icon :element="getProp('element')" :displaySize="18" class="ml-1 mr-1"/>
            <span class="capitalize">{{ getProp('element') }}</span>
          </span>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs6 class="pl-0 pr-0">
          <b>Gender:</b>
        </v-flex>
        <v-flex xs6>
          <v-icon :color="genderIconInfo.color" class="ml-1 mr-1">fas {{ genderIconInfo.icon }}</v-icon>
          <span class="capitalize">{{ getProp('gender') }}</span>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs6 class="pl-0 pr-0">
          <b>Cost:</b>
        </v-flex>
        <v-flex xs6>
          {{ getProp('cost') }}
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs6 class="pl-0 pr-0">
          <b>Guide ID:</b>
        </v-flex>
        <v-flex xs6>
          {{ getProp('guide_id') }}
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs6 class="pl-0 pr-0">
          <b>Unit ID:</b>
        </v-flex>
        <v-flex xs6>
          {{ getProp('id') }}
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs6 class="pl-0 pr-0">
          <b>Rarity:</b>
        </v-flex>
        <v-flex xs6>
          <span class="d-flex-container items-center content-center">
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon :class="{ 'ml-1': rarity !== 8 }" :rarity="rarity" :displaySize="18"/>
            <span v-if="+rarity === 8">Omni</span>
          </span>
        </v-flex>
      </v-layout>
      <template v-for="animType in ['Idle', 'Move', 'Attack']">
        <v-layout row :key="animType" v-if="getProp('animations') && unit.animations[animType.toLowerCase()]">
          <v-flex xs6 class="pl-0 pr-0">
            <b>{{ animType }} Frames:</b>
          </v-flex>
          <v-flex xs6>
            {{ safeGet(unit, ['animations', animType.toLowerCase(), 'total number of frames'], 0) }}
          </v-flex>
        </v-layout>
      </template>
    </v-container>
  </bordered-titled-card>
</template>

<script>
import BorderedTitledCard from '@/components/BorderedTitledCard';
import ElementIcon from '@/components/Multidex/ElementIcon';
import RarityIcon from '@/components/Multidex/RarityIcon';
import { getGenderInfo, safeGet } from '@/modules/utils';

export default {
  props: {
    unit: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    BorderedTitledCard,
    ElementIcon,
    RarityIcon,
  },
  computed: {
    genderIconInfo () {
      return this.unit && getGenderInfo(this.getProp('gender'));
    },
    rarity () {
      return this.unit && this.getProp('rarity');
    }
  },
  data () {
    return {
      getterCache: {},
    };
  },
  methods: {
    getGenderInfo,
    safeGet,
    getProp (property) {
      if (this.getterCache[property] === undefined) {
        this.getterCache[property] = safeGet(this.unit, [property]);
      }
      return this.getterCache[property];
    },
  },
};
</script>

<style lang="less" scoped>
.capitalize {
  text-transform: capitalize;
}

.miscellaneous-unit-list {
  & > .layout.row:nth-child(odd) {
    background-color: var(--background-color-alt);
  }
}
</style>
