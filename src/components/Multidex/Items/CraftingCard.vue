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
                  <b>Your Craftables (## items)</b>
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
                  <b>Needed Base Materials (## items)</b>
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
// import { getFullUsageList } from '@/modules/core/items';

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
    // associatedUnits () {
    //   if (!this.item || !this.item.associated_units) {
    //     return [];
    //   }
    //   return this.item.associated_units;
    // },
    // itemUsage () {
    //   if (!this.item || !this.item.usage) {
    //     return [];
    //   }

    //   return this.item.usage.map(({ id }) => id.toString());
    // },
    // filteredUsageList () {
    //   return this.deepUsageList.filter(id => !this.itemUsage.includes(id));
    // },
  },
  data: () => ({
    deepUsageList: [],
  }),
  async mounted () {
    // await this.updateDeepUsageList();
  },
  methods: {
    // async updateDeepUsageList () {
    //   this.deepUsageList = await getFullUsageList(this.item, this.pageDb);
    // },
  },
  watch: {
    // async item () {
    //   this.deepUsageList = [];
    //   await this.updateDeepUsageList();
    // },
  },
};
</script>

