<template>
  <v-card flat>
    <v-card-text v-if="loadingItemData" class="text-xs-center pt-5">
      <v-progress-circular indeterminate/>
      <h4 class="subheading">Loading item data</h4>
    </v-card-text>
    <v-card-text v-else-if="!item">
      No item data found.
    </v-card-text>
    <v-card-text v-else class="pl-0 pr-0 pb-5">
      {{ item }}
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
export default {
  props: ['itemId'],
  computed: {
    ...mapGetters('items', { getItemImage: 'getImageUrl' }),
    ...mapState('items', ['pageDb']),
  },
  data () {
    return {
      item: undefined,
      loadingItemData: true,
      // activeTab: 'skills',
    };
  },
  watch: {
    async itemId (newValue) {
      if (!newValue) {
        this.item = undefined;
      } else {
        this.loadingItemData = true;
        this.item = await this.getItem(newValue);
        this.loadingItemData = false;
      }
    },
    async pageDb () {
      if (this.itemId && Object.keys(this.pageDb).length > 0) {
        this.loadingItemData = true;
        this.item = await this.getItem(this.itemId);
        this.loadingItemData = false;
      }
    },
  },
  async mounted () {
    if (this.itemId) {
      this.loadingItemData = true;
      this.item = await this.getItem(this.itemId);
      this.loadingItemData = false;
    }
  },
  methods: {
    ...mapActions('items', { getItem: 'getById' }),
  },
};
</script>
