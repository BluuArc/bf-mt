<template>
  <base-entry-card style="height: 100%;" class="material-input-card">
    <v-container fluid class="pa-3">
      <v-layout row class="d-align-items-center">
        <v-flex xs6 class="text-xs-center">
          <item-thumbnail
            :src="getImageUrl(entry.id)"
            :rarity="rarity"
            :type="entry.type"
            :isRaidItem="!!entry.raid"
            :imageTitle="entry.name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
          <b class="d-block" v-text="entry.name"/>
        </v-flex>
        <v-flex xs6>
          <v-text-field
            v-model="localValue"
            :success="localValue === total"
            :disabled="total === 0 && localValue === 0"
            type="number"
            :hint="inputHint"
            single-line
            persistent-hint/>
        </v-flex>
      </v-layout>
    </v-container>
  </base-entry-card>
</template>

<script>
import { mapGetters } from 'vuex';
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import { isSphere } from '@/modules/core/items';
import debounce from 'lodash/debounce';

export default {
  mixins: [EntryCardMixin],
  props: {
    value: {
      type: Number,
    },
    total: {
      type: Number,
    },
  },
  components: {
    SphereTypeIcon,
    ItemThumbnail,
  },
  computed: {
    ...mapGetters('items', ['getImageUrl']),
    inputHint () {
      return `Need ${Math.max(0, this.total - +this.localValue)}`;
    },
    rarity () {
      return this.entry.rarity;
    },
    hasSphereType () {
      return isSphere(this.entry);
    },
    thumbnailSize () {
      const breakpoint = this.$vuetify.breakpoint;
      if (breakpoint.xlOnly) {
        return 64;
      } else if (breakpoint.mdAndUp) {
        return 56;
      } else {
        return 48;
      }
    },
  },
  data: () => ({
    localValue: 0,
  }),
  watch: {
    value: debounce(function () {
      this.syncValueToLocal();
    }, 50),
    localValue () {
      this.syncLocalToValue();
    },
    total () {
      this.syncValueToLocal();
    },
  },
  methods: {
    getValidValue (input) {
      if (isNaN(input) || +input < 0) {
        return 0;
      } else if (+input > this.total) {
        return this.total;
      } else {
        return +input;
      }
    },
    syncValueToLocal () {
      this.localValue = this.getValidValue(this.value);
    },
    syncLocalToValue () {
      this.emitValue(this.localValue);
    },
    emitValue: debounce(function (newValue) {
      this.emitChange(this.getValidValue(newValue));
    }, 75),
    emitChange (newValue) {
      if (newValue !== this.localValue) {
        this.localValue = newValue;
      } else {
        this.$emit('input', newValue);
      }
    },
  },
  mounted () {
    this.syncValueToLocal();
  },
};
</script>

<style lang="less">
.entry-card.material-input-card:hover {
  background-color: var(--background-color--card)!important;
}
</style>
