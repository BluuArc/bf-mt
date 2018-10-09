<template>
  <description-card-base
    :entry="item"
    materialColor="indigo"
    :titleHtmlGenerator="() => 'Usage'"
    :tabNames="['Items', 'Units']">
    <v-container fluid class="pa-0" slot="items">
      <v-layout row>
        <v-flex>
          <span v-if="itemUsage.length === 0">
            This item isn't used to make anything.
          </span>
          <template v-else>
            <v-expansion-panel v-model="activePanel">
              <v-expansion-panel-content>
                <div slot="header">
                  <h2 class="subheading">
                    <b>Immediate Use ({{ itemUsage.length }} {{ itemUsage.length === 1 ? 'item' : 'items' }})</b>
                  </h2>
                </div>
                <v-container fluid v-if="panelViewCache[activePanel]">
                  <v-layout row>
                    <v-flex>
                      This item is a direct material of the following items:
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex xs12 sm6 md4 v-for="(id, j) in itemUsage" :key="j">
                      <item-entry-card
                        :to="getMultidexPathTo(id)"
                        :entry="pageDb[id]"
                        style="height: 100%;"/>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-expansion-panel-content>
              <v-expansion-panel-content>
                <div slot="header">
                  <h2 class="subheading">
                    <b>Extended Use ({{ filteredUsageList.length }} {{ filteredUsageList.length === 1 ? 'item' : 'items' }})</b>
                  </h2>
                </div>
                <v-container fluid v-if="panelViewCache[activePanel]" class="pb-1">
                  <template v-if="filteredUsageList.length > 0">
                    <v-layout row>
                      <v-flex>
                        This item is a material for at least one of the craftables used to make the following items:
                        <br>
                        <span><b>Note:</b> Does not include items listed in immediate section</span>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex xs12 sm6 md4 v-for="(id, j) in filteredUsageList" :key="j">
                        <item-entry-card
                          :to="getMultidexPathTo(id)"
                          :entry="pageDb[id]"
                          style="height: 100%;"/>
                      </v-flex>
                    </v-layout>
                  </template>
                  <template v-else>
                    <v-flex>
                      This item isn't used for anything else.
                    </v-flex>
                  </template>
                </v-container>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </template>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid class="pa-0" slot="units">
      <span v-if="associatedUnits.length === 0">
        This item isn't associated with any units.
      </span>
      <v-layout row v-else>
        <v-flex>
          <span v-if="associatedUnits.length === 0">
            This item isn't associated with any units.
          </span>
          <template v-else>
            <v-container fluid>
              <v-layout row>
                <v-flex>
                  This item can be used with the following units:
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex xs12 sm6 md4 v-for="(id, j) in associatedUnits" :key="j">
                  <unit-entry-card
                    :to="unitMultidexPathTo(id)"
                    :entry="unitDb[id]"
                    style="height: 100%;"/>
                </v-flex>
              </v-layout>
            </v-container>
          </template>
        </v-flex>
      </v-layout>
    </v-container>
  </description-card-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import ItemEntryCard from '@/components/Multidex/Items/EntryCard';
import UnitEntryCard from '@/components/Multidex/Units/EntryCard';
import { getFullUsageList } from '@/modules/core/items';

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
    ItemEntryCard,
    UnitEntryCard,
  },
  computed: {
    ...mapState('items', ['pageDb']),
    ...mapGetters('items', ['getMultidexPathTo']),
    ...mapState('units', { unitDb: 'pageDb' }),
    ...mapGetters('units', { unitMultidexPathTo: 'getMultidexPathTo' }),
    associatedUnits () {
      if (!this.item || !this.item.associated_units) {
        return [];
      }
      return this.item.associated_units;
    },
    itemUsage () {
      if (!this.item || !this.item.usage) {
        return [];
      }

      return this.item.usage.map(({ id }) => id.toString());
    },
    filteredUsageList () {
      return this.deepUsageList.filter(id => !this.itemUsage.includes(id));
    },
  },
  data: () => ({
    deepUsageList: [],
    activePanel: null,
    panelViewCache: {}, // used to lazily render panel contents
  }),
  async mounted () {
    await this.updateDeepUsageList();
  },
  methods: {
    async updateDeepUsageList () {
      this.deepUsageList = await getFullUsageList(this.item, this.pageDb);
    },
  },
  watch: {
    async item () {
      this.deepUsageList = [];
      await this.updateDeepUsageList();
    },
    activePanel (newValue) {
      this.panelViewCache[newValue] = true;
    },
  },
};
</script>

