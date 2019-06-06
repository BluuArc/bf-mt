<template>
  <v-container fluid class="pb-0 pt-0 pl-0 pr-1 buff-selector-list" v-bind="$attrs">
    <v-layout row v-for="(buff, i) in internalEntries" :key="getKeyFunction(buff, i)" class="buff-selector-list--row">
      <v-flex xs2>
        <v-checkbox :value="buff.value.toString()" v-model="localSelectedIds"/>
      </v-flex>
      <v-flex xs10 class="d-align-self-center">
        <v-flex xs12 v-text="buff.text"/>
        <!-- only render icons if searching for a specific buff -->
        <v-flex xs12 v-if="showIcons">
          <buff-icon
            v-for="(iconKey, i) in getFilteredIconsForBuffSelectorEntry(buff)"
            :key="i"
            :displaySize="24"
            :iconKey="iconKey"/>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import DelayedVForMixin from '@/components/DelayedVForMixin';
import IconKeyMappings from '@/modules/EffectProcessor/icon-key-mappings';
import BuffIcon from '@/components/Multidex/BuffList/BuffIcon';

export default {
  mixins: [DelayedVForMixin],
  props: {
    value: {
      type: Array,
      required: true,
    },
    showIcons: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    BuffIcon,
  },
  data () {
    return {
      localSelectedIds: [],
    };
  },
  mounted () {
    this.localSelectedIds = this.value.slice();
  },
  methods: {
    getFilteredIconsForBuffSelectorEntry (entry) {
      if (!entry || !entry.data || typeof (entry.data.possibleIcons) !== 'function') {
        return [];
      }
      return entry.data.possibleIcons()
        .filter(i => {
          // for cases of INSTANT_BUFFKEY or PASSIVE_BUFFKEY
          // eslint-disable-next-line no-unused-vars
          const [ prefix, ...buffKey ] = i.split('_');
          return i !== IconKeyMappings.UNKNOWN.name && !!(IconKeyMappings[i] || IconKeyMappings[buffKey.join('_')]);
        });
    },
  },
  watch: {
    value (newVal) {
      this.localSelectedIds = newVal.slice();
    },
    localSelectedIds (newVal) {
      if (newVal.length !== this.value.length) {
        this.$emit('input', newVal);
      }
    },
  },
};
</script>
