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
                <sphere-type-icon
                v-if="item['sphere type'] !== undefined || item.type === 'sphere' || item.type === 'ls_sphere'"
                :category="item['sphere type']"
                class="ml-0 mr-0"/>
                {{ item.name }}
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex xs6 class="center-align-parent">
            <v-text-field v-model="amount" hide-details/>
            <small v-if="need !== undefined">
              Need {{ Math.max(0, need - (have || 0)) }}
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
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import debounce from 'lodash/debounce';

export default {
  props: ['item', 'value', 'need', 'have'],
  components: {
    'item-thumbnail': ItemThumbnail,
    'sphere-type-icon': SphereTypeIcon,
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
      if (this.need !== undefined && +newValue > this.need && +newValue !== this.value) {
        this.emitValue(this.need);
        this.$nextTick(() => {
          this.amount = this.need;
        });
      } else {
        this.emitValue(+newValue);
      }
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
  methods: {
    emitValue: debounce(function (value) {
      this.$emit('input', value);
    }, 50),
  },
};
</script>
