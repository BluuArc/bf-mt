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
          <v-expansion-panel v-model="activePanel">
            <v-expansion-panel-content>
              <div slot="header">
                <h2 class="subheading">
                  <b>Your Craftables ({{ allCraftables.length }} {{ allCraftables.length === 1 ? 'item' : 'items' }})</b>
                </h2>
              </div>
              <v-container fluid v-if="panelLoadCache[activePanel]">
                <v-layout row wrap>
                  <v-flex
                    xs12 sm6 md4 lg3
                    v-for="(craftable, i) in allCraftables"
                    :key="i">
                    <material-input-card
                      :entry="pageDb[craftable.id]"
                      :value="getHaveValue(craftable.id)"
                      @input="setHaveValue(craftable.id, $event)"
                      :total="craftable.count"/>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <div slot="header">
                <h2 class="subheading">
                  <b>Needed Base Materials ({{ baseMaterialsNeeded.length }} {{ baseMaterialsNeeded.length === 1 ? 'item' : 'items' }})</b>
                </h2>
              </div>
              <v-container fluid v-if="panelLoadCache[activePanel]">
                <v-layout row v-for="(mat, i) in baseMaterialsNeeded" :key="i">
                  <v-flex>
                    <material-row
                      :material="mat"
                      :showButtonCondition="true"
                      buttonText="Change">
                      <v-container fluid slot="expanded-area">
                        <v-layout row>
                          How much of the following do you have?
                        </v-layout>
                        <v-layout row wrap>
                          <!-- current item -->
                          <v-flex xs12 sm6 md4 lg3>
                            <material-input-card
                              :entry="pageDb[mat.id]"
                              :value="getHaveValue(mat.id)"
                              @input="setHaveValue(mat.id, $event)"
                              :total="mat.count"/>
                          </v-flex>
                          <!-- other items that use current item -->
                          <v-flex
                            xs12 sm6 md4 lg3
                            v-for="(craftable, i) in getRelevantCraftablesForMaterial(mat.id)"
                            :key="i">
                            <material-input-card
                              :entry="pageDb[craftable.id]"
                              :value="getHaveValue(craftable.id)"
                              @input="setHaveValue(craftable.id, $event)"
                              :total="craftable.count"/>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </material-row>
                  </v-flex>
                </v-layout>
                <v-layout row v-if="item.recipe.karma">
                  <v-flex>
                    <material-row :karma="totalKarmaNeeded"/>
                  </v-flex>
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
import MaterialInputCard from '@/components/Multidex/Items/MaterialInputCard';
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
    MaterialInputCard,
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
    panelLoadCache: {},
    activePanel: null,
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

      // copy currentlyHave from result
      Object.keys(result.currentlyHave).forEach(key => {
        if (this.currentlyHave[key] !== result.currentlyHave[key]) {
          this.currentlyHave[key] = result.currentlyHave[key];
        }
      });
      Object.keys(this.currentlyHave).forEach(key => {
        if (!result.currentlyHave[key]) {
          delete this.currentlyHave[key];
        }
      });
      // this.currentlyHave = result.currentlyHave;
      this.baseMaterialsNeeded = result.baseMaterialsNeeded;
      this.totalKarmaNeeded = result.totalKarmaNeeded;

      if (this.allCraftables.length !== result.allCraftables.length) {
        this.relevantMaterialsCache = {};
      }
      this.allCraftables = result.allCraftables;
    }, 500),
    getRelevantCraftablesForMaterial (materialId = '') {
      if (!this.relevantMaterialsCache[materialId]) {
        const material = this.pageDb[materialId.toString()];
        if (!material || !material.usage) {
          this.relevantMaterialsCache[materialId] = [];
        } else {
          const usageArrays = material.usage.map(entry => entry.id.toString());
          this.relevantMaterialsCache[materialId] = this.allCraftables.filter(entry => usageArrays.includes(entry.id))
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
      this.currentlyHave = {};
      this.updateNeeded();
    },
    getHaveValue(id) {
      return this.currentlyHave[id] || 0;
    },
    setHaveValue(id, newValue) {
      this.currentlyHave[id] = newValue;
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
    },
    activePanel (newValue) {
      if (newValue !== null) {
        this.panelLoadCache[newValue] = true;
      }
    },
  },
};
</script>

