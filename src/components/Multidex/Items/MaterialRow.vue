<template>
  <v-container fluid class="pb-0 pt-0 pl-1 pr-1 material-row-container">
    <v-layout v-if="!isKarma" row class="d-align-items-center">
      <v-flex xs3 sm2 md1 class="text-xs-center">
        <item-thumbnail
          :src="item && getImageUrl(item.id)"
          :rarity="(item && item.rarity) || 0"
          :type="item && item.type"
          :isRaidItem="item && !!item.raid"
          :imageTitle="item && item.name"
          :displayWidth="52" :displayHeight="52"/>
      </v-flex>
      <v-flex xs6 sm9 md10>
        <v-layout row wrap>
          <v-flex xs12 :sm6="(showButtonCondition === undefined && hasRecipe) || !!showButtonCondition">
            <router-link :to="multidexUrl" style="color: inherit; text-decoration: none;">
              <span class="d-flex-container items-center">
                <sphere-type-icon
                  v-if="isSphere"
                  :category="item['sphere type']"
                  :displaySize="24"
                  class="mr-1"/>
                <h1 class="subheading d-inline-block" style="word-break: break-word;">
                  <b v-text="item.name"/>
                </h1>
                <v-icon small class="ml-1">fas fa-external-link-alt</v-icon>
              </span>
            </router-link>
          </v-flex>
          <v-flex
            v-if="(showButtonCondition === undefined && hasRecipe) || !!showButtonCondition"
            xs3 sm6
            class="text-xs-right">
            <v-btn @click="showRecipe = !showRecipe" small>{{ buttonText || 'Recipe' }}</v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs3 sm1 class="text-xs-center">
        {{ materialCount }}
      </v-flex>
    </v-layout>
    <v-layout row v-else class="d-align-items-center">
      <v-flex xs3 sm2 md1 class="text-xs-center">
        <karma-icon :displaySize="52"/>
      </v-flex>
      <v-flex xs6 sm9 md10>
        <b>Karma</b>
      </v-flex>
      <v-flex xs3 sm1 class="text-xs-center">
        {{ formatNumber(karma) }}
      </v-flex>
    </v-layout>
    <v-layout row v-if="hasShownBefore || showRecipe">
      <v-slide-y-transition mode="in-out">
        <v-flex v-show="showRecipe">
          <slot name="expanded-area">
            <v-container fluid class="pa-1 sub-recipe-container">
              <template v-if="item.recipe && item.recipe.materials">
                <material-row
                    v-for="(mat, i) in item.recipe.materials"
                    :key="i"
                    :material="mat"/>
              </template>
              <material-row
                v-if="item.recipe && item.recipe.karma && item.recipe.karma > 0"
                :karma="+item.recipe.karma"/>
            </v-container>
          </slot>
        </v-flex>
      </v-slide-y-transition>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import numbro from 'numbro';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import KarmaIcon from '@/components/Multidex/KarmaIcon';
import { isSphere as itemSphereCheck } from '@/modules/core/items';

export default {
  props: {
    material: {
      type: Object,
    },
    karma: {
      type: Number,
    },
    showButtonCondition: {
      required: false,
    },
    buttonText: {
      type: String,
    },
  },
  components: {
    ItemThumbnail,
    SphereTypeIcon,
    KarmaIcon,
  },
  computed: {
    ...mapGetters('items', ['getImageUrl', 'getMultidexPathTo', 'getById']),
    ...mapState('items', ['pageDb']),
    item () {
      return !this.material ? undefined : this.getById((this.material.id || '').toString());
    },
    isKarma () {
      return this.karma !== undefined;
    },
    hasRecipe () {
      return this.item && !!this.item.recipe;
    },
    materialCount () {
      return (this.material && this.material.count) || 0;
    },
    multidexUrl () {
      if (!this.material) {
        return;
      }
      return this.getMultidexPathTo(this.material.id);
    },
    isSphere () {
      return itemSphereCheck(this.item);
    },
  },
  data: () => ({
    showRecipe: false,
    hasShownBefore: false,
  }),
  methods: {
    formatNumber (number) {
      return +number < 1000 ? +number : numbro(+number).format({ average: true, mantissa: 3 });
    },
  },
  watch: {
    showRecipe (newValue) {
      if (newValue && !this.hasShownBefore) {
        this.hasShownBefore = true;
      }
    },
  },
  name: 'material-row',
};
</script>

<style lang="less">
.sub-recipe-container {
  border-left: 1px solid var(--background-color-alt--lighten-1);

  &:hover {
    border-left-color: var(--background-color-alt--lighten-1);
  }

  .sub-recipe-container &:hover {
    border-left: 1px solid var(--background-color-alt--lighten-2);
  }
}
</style>


