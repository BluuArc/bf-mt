<template>
  <v-card>
    <v-card-title class="blue darken-2 white--text">
      <h3 class="title">Crafting Recipe</h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab">
        <v-tab>Full</v-tab>
        <v-tab>Base Materials Only</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" class="pa-2" touchless>
        <v-tab-item class="pt-2 pb-0" style="overflow-x: auto;">
          <v-container fluid class="pb-1">
            <material-row v-for="(mat, i) in item.recipe.materials" :key="i" :material="mat"/>
            <material-row v-if="item.recipe.karma" :karma="item.recipe.karma"/>
          </v-container>
        </v-tab-item>
        <v-tab-item>
          Basic Materials Only List here
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import MaterialRow from '@/components/Multidex/Items/MaterialRow';

export default {
  props: ['item'],
  components: {
    'material-row': MaterialRow,
  },
  computed: {
    ...mapGetters('items', ['getImageUrl', 'itemById']),
  },
  data () {
    return {
      activeTab: '',
    };
  },
};
</script>
