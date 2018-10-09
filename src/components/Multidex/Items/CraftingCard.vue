<template>
  <description-card-base
    :entry="item"
    materialColor="green"
    :titleHtmlGenerator="() => 'Crafting Recipe'"
    :tabNames="['Full', item.recipe && 'Base Materials Only'].filter(val => val)">
    <v-container fluid class="pa-0" slot="full">
      <v-layout row v-if="!item.recipe">
        <v-flex>
          This item cannot be crafted.
        </v-flex>
      </v-layout>
      <template v-else>
        <v-layout row v-for="(mat, i) in item.recipe.materials" :key="i">
          <v-flex>
            <material-row :material="mat"/>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex>
            <material-row :karma="+item.recipe.karma"/>
          </v-flex>
        </v-layout>
      </template>
    </v-container>
    <v-container fluid class="pa-0" slot="base-materials-only">
      <v-layout row>
        <v-flex>
          <v-expansion-panel>
            <v-expansion-panel-content>
              <div slot="header">
                <h2 class="subheading">
                  <!-- <b>Immediate Use ({{ itemUsage.length }} {{ itemUsage.length === 1 ? 'item' : 'items' }})</b> -->
                  <b>Your Craftables ({{ allCraftables.length }} {{ allCraftables.length === 1 ? 'item' : 'items' }})</b>
                </h2>
              </div>
              <v-container fluid>
                <v-layout row wrap>
                  <v-flex>
                    your craftables go here
                  </v-flex>
                  <!-- <v-flex xs12 sm6 md4 v-for="(id, j) in itemUsage" :key="j">
                    <item-entry-card
                      :to="getMultidexPathTo(id)"
                      :entry="pageDb[id]"
                      style="height: 100%;"/>
                  </v-flex> -->
                </v-layout>
              </v-container>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <div slot="header">
                <h2 class="subheading">
                  <!-- <b>Extended Use ({{ filteredUsageList.length }} {{ filteredUsageList.length === 1 ? 'item' : 'items' }})</b> -->
                  <b>Needed Base Materials ({{ baseMaterialsNeeded.length }} {{ baseMaterialsNeeded.length === 1 ? 'item' : 'items' }})</b>
                </h2>
              </div>
              <v-container fluid>
                <v-layout row wrap>
                  <v-flex>
                    your base materials go here
                  </v-flex>
                  <!-- <v-flex xs12 sm6 md4 v-for="(id, j) in filteredUsageList" :key="j">
                    <item-entry-card
                      :to="getMultidexPathTo(id)"
                      :entry="pageDb[id]"
                      style="height: 100%;"/>
                  </v-flex> -->
                </v-layout>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-flex>
      </v-layout>
    </v-container>
  </description-card-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import MaterialRow from '@/components/Multidex/Items/MaterialRow';
// import ItemEntryCard from '@/components/Multidex/Items/EntryCard';
// import UnitEntryCard from '@/components/Multidex/Units/EntryCard';
import debounce from 'lodash/debounce';
import { getItemShoppingList, getCraftablesInRecipeOfItem } from '@/modules/core/items';

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
    DescriptionCardBase,
    MaterialRow,
  },
  computed: {
    ...mapState('items', ['pageDb']),
    ...mapGetters('items', ['getMultidexPathTo']),
  },
  data: () => ({
    baseMaterialsNeeded: [],
    totalKarmaNeeded: 0,
    currentlyHave: {},
    allCraftables: [],
    relevantMaterialsCache: {},
  }),
  async mounted () {
    if (this.item) {
      this.updateNeeded();
    }
  },
  methods: {
    updateNeeded: debounce(async function () {
      this.logger.debug('updating needed lists');
      const result = await getItemShoppingList(this.item, this.pageDb, this.currentlyHave);
      this.logger.debug(result);
      this.currentlyHave = result.currentlyHave;
      this.baseMaterialsNeeded = result.baseMaterialsNeeded;
      this.totalKarmaNeeded = result.totalKarmaNeeded;

      if (this.allCraftables.length !== result.allCraftables.length) {
        this.relevantMaterialsCache = {};
      }
      this.allCraftables = result.allCraftables;
    }, 50),
    getRelevantCraftablesForMaterial (materialId = '') {
      if (!this.relevantMaterialsCache[materialId]) {
        const material = this.pageDb[materialId.toString()];
        if (!material || !material.usage) {
          this.relevantMaterialsCache[materialId] = [];
        } else {
          const usageArrays = material.usage.map(entry => entry.id.toString());
          this.relevantMaterialsCache[materialId] = this.allCraftables.filter(entry => usageArrays.includes(usa))
        }
      }
      return this.relevantMaterialsCache[materialId];
    },
    async getAllCraftables () {
      const allCraftables = await getCraftablesInRecipeOfItem(this.item);
      allCraftables.forEach(({ id, count }) => {
        this.currentlyHave[id] = count;
      });
      this.updateNeeded();
    },
    resetAllCraftables () {
      Object.keys(this.currentlyHave)
        .forEach(id => {
          this.currentlyHave[id] = 0;
        });
      this.updateNeeded();
    },
  },
  watch: {
    item () {
      this.currentlyHave = {};
      if (this.item) {
        this.updateNeeded();
      } else {
        this.baseMaterialsNeeded = [];
        this.totalKarmaNeeded = 0;
      }
    },
    currentlyHave: {
      deep: true,
      handler: debounce(function () {
        if (!this.item) {
          if (Object.keys(this.currentlyHave).length !== 0) {
            this.currentlyHave = {};
          }
          return;
        } else {
          this.updateNeeded();
        }
      }, 50),
    }
  },
};
</script>

