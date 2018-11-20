<template>
  <bordered-titled-card materialColor="blue-grey" class="multidex-dialog-content-card">
    <template slot="title">
      <b>Miscellaneous Info</b>
    </template>
    <v-container fluid class="subheading text-xs-center miscellaneous-item-list" grid-list-xl>
      <v-layout row wrap>
        <v-flex xs12 sm6 md4 v-for="(entry, i) in entries" :key="i" class="miscellaneous-item-list-entry">
          <v-layout row class="d-align-items-center">
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
                <div class="d-flex-container items-center content-center">
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
    </v-container>
  </bordered-titled-card>
</template>

<script>
import BorderedTitledCard from '@/components/BorderedTitledCard';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import RarityIcon from '@/components/Multidex/RarityIcon';
import { safeGet } from '@/modules/utils';
import { getItemType, getSphereCategory, isSphere as itemSphereCheck } from '@/modules/core/items';
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
      return itemSphereCheck(this.item);
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
  // & .miscellaneous-item-list-entry:nth-child(odd) {
  //   background-color: var(--background-color-alt);
  // }
  & > .layout.row {
    align-items: center;
  }
}
</style>
