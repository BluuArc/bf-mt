<template>
  <bordered-titled-card materialColor="teal" class="multidex-dialog-content-card">
    <template slot="title">
      <b>Miscellaneous Info</b>
    </template>
    <v-container fluid class="subheading text-xs-center miscellaneous-item-list" grid-list-xl>
      <v-layout row wrap>
        <v-flex xs12 sm6 md4 v-for="(entry, i) in entries" :key="i" class="miscellaneous-item-list-entry">
          <v-layout row>
            <v-flex xs6 class="pl-0 pr-0">
              <b>{{ entry.label }}</b>
            </v-flex>
            <v-flex xs6>
              <template v-if="entry.label.includes('Rarity')">
                <span class="d-flex-container items-center content-center">
                  <span v-if="entry.value < 8">{{ entry.value }}</span>
                  <rarity-icon :class="{ 'ml-1': entry.value !== 8 }" :rarity="entry.value" :displaySize="18"/>
                  <span v-if="entry.value === 8">Omni</span>
                </span>
              </template>
              <template v-else-if="entry.label.includes('Sphere Type')">
                <div class="d-flex-container vertical-center">
                  <sphere-type-icon
                    class="mr-1"
                    :category="entry.value"
                    :displaySize="22"/>
                  <span>
                    {{ entry.name }}
                  </span>
                </div>
              </template>
              <template v-else>
                {{ entry.value }}
              </template>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
      <!-- <v-layout row>
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
      </template> -->
    </v-container>
  </bordered-titled-card>
</template>

<script>
import BorderedTitledCard from '@/components/BorderedTitledCard';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import RarityIcon from '@/components/Multidex/RarityIcon';
import { safeGet } from '@/modules/utils';
import { getItemType, getSphereCategory } from '@/modules/core/items';
import numbro from 'numbro';

export default {
  props: {
    item: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    BorderedTitledCard,
    SphereTypeIcon,
    RarityIcon,
  },
  computed: {
    rarity () {
      return this.item && this.getProp('rarity');
    },
    entries () {
      return !this.item ? [] : [
        { label: 'Item ID:', value: this.getProp('id') },
        { label: 'Max Stack:', value: `x${this.getProp('max_stack')}` },
        { label: 'Sell Price:', value: `${this.formatNumber(+this.getProp('sell_price'))} Zel` },
        // { label: 'Raid Item?', value: this.getProp('raid') ? 'Yes' : 'No' },
        this.getProp('rarity') !== undefined ? { label: 'Rarity:', value: +this.getProp('rarity') } : undefined,
        { label: 'Item Type:', value: this.itemType },
        this.isSphere ? { label: 'Sphere Type:', value: this.getProp('sphere type'), name: getSphereCategory(this.getProp('sphere type')) } : undefined,
      ].filter(i => i);
    },
    isSphere () {
      return !!this.item && (this.item['sphere type'] !== undefined || this.item.type === 'sphere' || this.item.type === 'ls_sphere');
    },
    itemType () {
      return getItemType(this.item);
    },
  },
  data () {
    return {
      getterCache: {},
    };
  },
  methods: {
    safeGet,
    getProp (property) {
      if (this.getterCache[property] === undefined) {
        this.getterCache[property] = safeGet(this.item, [property]);
      }
      return this.getterCache[property];
    },
    formatNumber (number) {
      return +number < 1000 ? +number : numbro(+number).format({ average: true, mantissa: 2 });
    },
  },
};
</script>

<style lang="less" scoped>
.capitalize {
  text-transform: capitalize;
}

.miscellaneous-item-list {
  & .miscellaneous-item-list-entry:nth-child(odd) {
    background-color: var(--background-color-alt);
  }
}
</style>
