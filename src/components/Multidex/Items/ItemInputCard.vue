<template>
  <v-card raised>
    <v-card-text>
      <v-container fluid class="pa-0">
        <v-layout row style="min-height: 64px;">
          <v-flex xs6 class="pa-0">
            <v-layout row style="min-height: 64px;">
              <v-flex xs12 class="center-align-parent mt-3">
                <div class="center-align-container card__media">
                  <item-thumbnail
                    :src="getImageUrl(item.id)"
                    style="height: 52px; width: 52px;"
                    imgStyle="height: 52px; width: 52px;"
                    :rarity="item.rarity"
                    :type="item.type"
                    :raid="item.raid"/>
                </div>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12 class="text-xs-center">
                {{ item.name }}
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex xs6 class="center-align-parent">
            <v-text-field v-model="amount" hide-details/>
            <small v-if="need !== undefined">
              {{ need }} needed.
            </small>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>


<script>
import { mapGetters } from 'vuex';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
export default {
  props: ['item', 'value', 'need'],
  components: {
    'item-thumbnail': ItemThumbnail,
  },
  computed: {
    ...mapGetters('items', ['getImageUrl']),
  },
  data () {
    return {
      amount: 0,
    };
  },
  watch: {
    amount (newValue) {
      this.$emit('input', +newValue);
    },
    value (newValue) {
      this.amount = newValue;
    },
  },
  created () {
    if (this.value !== undefined) {
      this.amount = this.value;
    }
  },
};
</script>
