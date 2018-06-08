<template>
  <v-card>
    <v-card-title class="indigo white--text">
      <h3 class="title">Usage</h3>
    </v-card-title>
    <v-card-text>
      <span v-if="!item.usage || item.usage.length === 0">
        <p class="pb-0 mb-0">This item isn't used to make anything.</p>
      </span>
      <v-layout row wrap v-else>
        <template v-if="deepUsageList.length === item.usage.length">
          <v-flex xs12>
            This item is used to make the following items:
          </v-flex>
          <v-flex xs12 sm6 md4 v-for="(nextItem, j) in item.usage" :key="j">
            <item-card
              class="pa-1 card--raised"
              :to="getMultidexPathTo(nextItem.id)"
              :item="itemById(nextItem.id)"
              style="height: 100%;"/>
          </v-flex>
        </template>
        <v-flex xs12 v-else>
          <v-expansion-panel>
            <v-expansion-panel-content>
              <div slot="header">
                <h3 class="subheading"><b>Immediate Use ({{ usage.length }} {{ usage.length === 1 ? 'item' : 'items' }})</b></h3>
              </div>
              <v-container>
                <v-layout row>
                  <v-flex xs12>
                    This item is a direct material of the following items:
                  </v-flex>
                </v-layout>
                <v-layout row wrap style="max-height: 50vh; overflow-y: auto;">
                  <v-flex xs12 sm6 md4 v-for="(id, j) in usage" :key="j">
                    <item-card
                      class="pa-1 card--raised"
                      :to="getMultidexPathTo(id)"
                      :item="itemById(id)"
                      style="height: 100%;"/>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <div slot="header">
                <h3 class="subheading"><b>Extended Use ({{ filteredUsageList.length }} {{ filteredUsageList.length === 1 ? 'item' : 'items' }})</b></h3>
              </div>
              <v-container>
                <v-layout row>
                  <v-flex xs12>
                    <span>
                      This item is a material for at least one of the craftables used to make the following items:
                    </span>
                    <br>
                    <span><b>Note:</b> Does not include items listed in immediate section</span>
                  </v-flex>
                </v-layout>
                <v-layout row wrap style="max-height: 50vh; overflow-y: auto;">
                  <v-flex xs12 sm6 lg4 v-for="(id, j) in filteredUsageList" :key="j">
                    <item-card
                      class="pa-1 card--raised"
                      :to="getMultidexPathTo(id)"
                      :item="itemById(id)"
                      style="height: 100%;"/>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import ItemCard from '@/components/Multidex/Items/ItemCard';
export default {
  props: ['item'],
  components: {
    'item-card': ItemCard,
  },
  computed: {
    ...mapGetters('items', ['itemById', 'getMultidexPathTo']),
    usage () {
      if (!this.item || !this.item.usage) {
        return [];
      }

      return this.item.usage.map(({ id }) => id.toString());
    },
    deepUsageList () {
      return this.getFullUsageList(this.item);
    },
    filteredUsageList () {
      return this.deepUsageList.filter(id => !this.usage.includes(id));
    },
  },
  methods: {
    getFullUsageList (item, currentUsageTracker = {}) {
      if (!item || !item.usage) {
        return Object.keys(currentUsageTracker);
      }

      item.usage.forEach(({ id }) => {
        currentUsageTracker[id] = true;
        this.getFullUsageList(this.itemById(id), currentUsageTracker);
      });
      return Object.keys(currentUsageTracker);
    },
  },
};
</script>
