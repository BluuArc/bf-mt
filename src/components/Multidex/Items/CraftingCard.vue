<template>
  <v-card class="crafting-card">
    <v-card-title class="green white--text">
      <h3 class="title">Crafting Recipe</h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab">
        <v-tab>Full</v-tab>
        <v-tab>Base Materials Only</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" touchless>
        <v-tab-item class="pt-2 pb-0" style="overflow-x: auto;">
          <v-container fluid class="pb-1">
            <material-row v-for="(mat, i) in item.recipe.materials" :key="i" :material="mat"/>
            <material-row v-if="item.recipe.karma" :karma="item.recipe.karma"/>
          </v-container>
        </v-tab-item>
        <v-tab-item class="pt-2 pb-0" style="overflow-x: auto;">
          <v-container fluid class="pb-1 pl-2 pr-2 pt-0">
            <v-expansion-panel>
              <v-expansion-panel-content v-show="allCraftables.length > 0">
                <div slot="header">Your Craftables</div>
                <v-container fluid>
                  <v-layout row wrap class="pl-3">
                    <v-flex xs12>
                      <v-btn @click="getAllCraftables">Got it all</v-btn>
                      <v-btn @click="resetAllCraftables">Reset</v-btn>
                    </v-flex>
                    <!-- <v-flex xs3 sm2 class="pb-0">Filters:</v-flex>
                    <v-flex class="pb-0" xs12 sm4 md3>
                      <v-checkbox v-model="filters" value="Need 0" label="Need 0"/>
                    </v-flex>
                    <v-flex class="pb-0" xs12 sm4 md3>
                      <v-checkbox v-model="filters" value="Need 1+" label="Need 1+"/>
                    </v-flex> -->
                  </v-layout>
                  <v-layout row wrap>
                    <template v-for="(craftable, i) in allCraftables" >
                      <v-flex xs12 sm6 md4 lg3 :key="i">
                        <item-input-card
                          :item="itemById(craftable.id)"
                          v-model="currentlyHave[craftable.id.toString()]"
                          @input="updateNeeded"
                          :need="craftable.total"
                          :have="(currentlyHave[craftable.id.toString()] || 0) + (craftable.total - craftable.count)"/>
                      </v-flex>
                    </template>
                  </v-layout>
                </v-container>
              </v-expansion-panel-content>
              <v-expansion-panel-content>
                <div slot="header">Needed Base Materials</div>
                <v-container fluid>
                  <v-layout row class="ml-2">
                    <v-flex xs9 sm10 md11 class="text-xs-left pr-0">
                      <b>Item</b>
                    </v-flex>
                    <v-flex xs3 sm2 md1 class="text-xs-left pl-0">
                      <b>Need</b>
                    </v-flex>
                  </v-layout>
                  <v-container fluid class="pa-0">
                    <material-row
                      v-for="(mat, i) in baseMaterialsNeeded"
                      :key="i"
                      :material="mat"
                      :show-button-condition="true"
                      expanded-area-style="border: 1px solid grey; min-width: 20rem; overflow-x: auto;"
                      expanded-area-class="ml-2 mr-2 mb-5 pb-1"
                      button-text="Change"
                      class="ml-4">
                      <template slot="expanded-area">
                        <v-layout row>
                          How much of the following do you have?
                        </v-layout>
                        <v-layout row wrap class="mb-2">
                          <v-flex xs12 sm6 md4 lg3>
                            <item-input-card
                              :item="itemById(mat.id)"
                              v-model="currentlyHave[mat.id.toString()]"
                              @input="updateNeeded"
                              :need="mat.total"
                              :have="(currentlyHave[mat.id.toString()] || 0) + (mat.total - mat.count)"/>
                          </v-flex>
                          <v-flex xs12 sm6 md4 lg3 v-for="(craftable, i) in getRelevantCraftablesForMaterial(mat.id)" :key="i">
                            <item-input-card
                            :item="itemById(craftable.id)"
                            v-model="currentlyHave[craftable.id.toString()]"
                            @input="updateNeeded"
                            :need="craftable.total"
                            :have="(currentlyHave[craftable.id.toString()] || 0) + (craftable.total - craftable.count)"/>
                          </v-flex>
                        </v-layout>
                      </template>
                    </material-row>
                    <material-row
                      v-if="item.recipe.karma"
                      :karma="totalKarmaNeeded"
                      class="ml-4"/>
                  </v-container>
                </v-container>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import MaterialRow from '@/components/Multidex/Items/MaterialRow';
import ItemInputCard from '@/components/Multidex/Items/ItemInputCard';
import debounce from 'lodash/debounce';

export default {
  props: ['item'],
  components: {
    'material-row': MaterialRow,
    'item-input-card': ItemInputCard,
  },
  computed: {
    ...mapGetters('items', ['getImageUrl', 'itemById']),
  },
  data () {
    return {
      activeTab: '',
      baseMaterialsNeeded: [],
      totalKarmaNeeded: 0,
      currentlyHave: {},
      allCraftables: [],
      filters: ['Need 0', 'Need 1+'],
    };
  },
  watch: {
    currentlyHave: {
      deep: true,
      handler: debounce(function () {
        if (!this.item) {
          if (Object.keys(this.currentlyHave).length !== 0) {
            this.currentlyHave = {};
          }
          return;
        }
        this.updateNeeded();
      }, 50),
    },
    item () {
      this.currentlyHave = {};
      if (this.item) {
        this.updateNeeded();
      } else {
        this.baseMaterialsNeeded = [];
        this.totalKarmaNeeded = 0;
      }
    },
  },
  methods: {
    updateNeeded: debounce(function () {
      console.debug('updating needed lists');
      const result = this.getBaseMaterialsOf(this.item);
      const totals = this.getBaseMaterialsOf(this.item);
      const craftables = {};
      this.getCraftablesInRecipeOf(this.item, craftables);
      const totalCraftables = {};
      this.getCraftablesInRecipeOf(this.item, totalCraftables);
      console.debug(craftables);

      const { karma, ...materials } = this.currentlyHave;

      if (!isNaN(karma)) {
        result.karma = Math.max(0, result.karma - karma);
      }

      Object.keys(materials).forEach(materialId => {
        const currentItem = this.itemById(materialId);
        const count = materials[materialId];
        if (craftables[materialId] !== undefined) {
          craftables[materialId] = Math.max(0, craftables[materialId] - materials[materialId]);
        }

        if (currentItem.recipe) {
          // subtract base recipe items
          const materialBaseRecipe = this.getBaseMaterialsOf(this.itemById(materialId));
          result.karma = Math.max(0, result.karma - (count * materialBaseRecipe.karma));
          Object.keys(materialBaseRecipe.materials).forEach(baseMaterialId => {
            const baseMaterialCount = materialBaseRecipe.materials[baseMaterialId];
            result.materials[baseMaterialId] = Math.max(0, result.materials[baseMaterialId] - (count * baseMaterialCount));

            if (this.currentlyHave[baseMaterialId] !== undefined) {
              this.currentlyHave[baseMaterialId] = Math.max(0, this.currentlyHave[baseMaterialId] - (count * baseMaterialCount));
            }
          });
          result.karma = Math.max(0, result.karma - (count * +currentItem.recipe.karma));

          // subtract craftable items
          const materialCraftables = this.getCraftablesInRecipeOf(currentItem);
          materialCraftables.forEach(({ id, count: craftableCount }) => {
            if (craftables[id] !== undefined) {
              craftables[id] = Math.max(0, craftables[id] - (count * craftableCount));
            }

            if (this.currentlyHave[id] !== undefined) {
              this.currentlyHave[id] = Math.max(0, this.currentlyHave[id] - (count * craftableCount));
            }
          });
        } else if (result.materials[materialId] !== undefined) {
          result.materials[materialId] = Math.max(0, result.materials[materialId] - count);
        }
      });
      this.baseMaterialsNeeded = this.convertMaterialsObjectToArray(result.materials)
        .map(entry => ({ total: totals.materials[entry.id], ...entry }));
      this.totalKarmaNeeded = result.karma;
      this.allCraftables = this.convertMaterialsObjectToArray(craftables)
        .map(entry => ({ total: totalCraftables[entry.id], ...entry }));
    }, 50),
    getBaseMaterialsOf (item) {
      const result = {
        materials: {},
        karma: 0,
      };

      if (!item.recipe) {
        return result;
      }

      result.karma += +item.recipe.karma;
      item.recipe.materials.forEach(material => {
        const currentItem = this.itemById(material.id.toString());
        const currentItemId = currentItem.id.toString();
        const count = +material.count;
        if (currentItem.recipe) {
          const materialRecipe = this.getBaseMaterialsOf(currentItem);
          Object.keys(materialRecipe.materials).forEach(baseMaterialId => {
            if (isNaN(result.materials[baseMaterialId])) {
              result.materials[baseMaterialId] = 0;
            }

            result.karma += (count * +currentItem.recipe.karma);
            result.materials[baseMaterialId] += (count * materialRecipe.materials[baseMaterialId]);
          });
        } else {
          if (!result.materials[currentItemId]) {
            result.materials[currentItemId] = 0;
          }
          result.materials[currentItemId] += count;
        }
      });
      return result;
    },
    getCraftablesInRecipeOf (item, currentCraftables = {}) {
      item.recipe.materials.forEach(material => {
        const currentItem = this.itemById(material.id.toString());
        const currentItemId = currentItem.id.toString();
        if (currentItem.recipe) {
          if (!currentCraftables[currentItemId]) {
            currentCraftables[currentItemId] = 0;
          }
          currentCraftables[currentItemId] += +material.count;
          this.getCraftablesInRecipeOf(currentItem, currentCraftables);
        }
      });
      return Object.entries(currentCraftables).map(([id, count]) => ({ id, count }));
    },
    getRelevantCraftablesForMaterial (materialId) {
      const material = this.itemById((materialId || '').toString());
      if (!material || !material.usage) {
        return [];
      }

      const materialIdArray = material.usage.map(entry => entry.id.toString());
      return this.allCraftables.filter(entry => materialIdArray.includes(entry.id));
    },
    convertMaterialsObjectToArray (input) {
      return Object.entries(input).map(([id, count]) => ({ count, id }));
    },
    getAllCraftables () {
      this.getCraftablesInRecipeOf(this.item).forEach(({id, count}) => {
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
  mounted () {
    if (this.item) {
      this.updateNeeded();
    }
  },
};
</script>

<style>
.crafting-card .expansion-panel__header {
  margin-left: 0;
  margin-right: 0;
}
</style>
