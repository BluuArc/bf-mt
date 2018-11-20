<template>
  <v-container fluid class="hitcount-table">
    <v-layout row wrap v-if="hasSparks" class="pl-4 pr-4">
      <v-flex xs12>
        <b>Note:</b> No delays are added to these visible values, but sparked rows are calculated using unit delays.
      </v-flex>
      <v-flex xs12 sm6 md3 v-for="(entry, legendIndex) in legendColors" :key="legendIndex">
        <b :class="entry.class">{{ entry.label }}:</b>
        <span v-html="entry.desc"/>
      </v-flex>
    </v-layout>
    <v-layout row v-if="useVuetifyTable">
      <v-data-table :headers="headers" :items="items" hide-actions class="mx-auto">
        <template slot="items" slot-scope="props">
          <tr>
            <template v-for="col in ['hitNum', 'frameNum', 'damage', 'diff']">
              <td :key="col" class="pt-0 pb-0 text-xs-center">{{ props.item[col] }}</td>
            </template>
          </tr>
        </template>
      </v-data-table>
    </v-layout>
    <template v-else>
      <v-layout row class="hitcount-table--headers">
        <v-flex xs4 v-for="(col, i) in headers" :key="i" class="text-xs-center">
          <b>{{ col.text }}</b>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs12 :style="limitHeight ? ('max-height: 50vh; overflow-y: auto;') : ''">
          <v-layout
            v-for="(item, index) in items" :key="index"
            :class="{
              'text-xs-center hitcount-table--row': true,
              'blue--text': selfSparkType(item) === 'native',
              'orange--text': selfSparkType(item) === 'extra',
              'purple--text text--lighten-2': selfSparkType(item) === 'both',
            }"
            row>
            <v-flex xs4 v-for="(col, i) in headers" :key="i" class="text-xs-center">
              {{ item[col.value] }}
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </template>
  </v-container>
</template>

<script>
export default {
  props: {
    attack: {
      type: Object,
    },
    useVuetifyTable: {
      type: Boolean,
      default: false,
    },
    limitHeight: {
      type: Boolean,
      default: false,
    },
    sparkedFrames: {
      type: Object,
      default: () => {},
    },
    attackIndex: {
      type: Number,
      default: 0,
    },
    // native or extra
    attackType: {
      type: String,
      default: '',
    },
    delay: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    headers () {
      return [
        { text: 'Hit #', sortable: false, value: 'hitNum', align: 'center' },
        { text: 'Frame #', sortable: false, value: 'frameNum', align: 'center' },
        { text: 'DMG% per hit', sortable: false, value: 'damage', align: 'center' },
        { text: 'Frame Diff', sortable: false, value: 'diff', align: 'center' },
      ];
    },
    items () {
      return this.attack['frame times'].map((frame, frameIndex) => (
        {
          hitNum: frameIndex + 1,
          frameNum: frame,
          damage: this.attack['hit dmg% distribution'][frameIndex],
          diff: (frameIndex === 0) ? 0 : (frame - this.attack['frame times'][frameIndex - 1]),
        }
      ));
    },
    legendColors () {
      return [
        { label: 'Default Color Text', desc: 'No sparks' },
        { label: 'Blue Text', desc: 'Sparks with an attack that <u>is not</u> from ES/SP/Items (i.e. "native" attacks)', class: 'blue--text' },
        { label: 'Orange Text', desc: 'Sparks with an attack that <u>is</u> from ES/SP/Items (i.e. "extra" attacks)', class: 'orange--text' },
        { label: 'Purple Text', desc: 'Sparks with at least one native attack and one extra attack', class: 'purple--text text--lighten-2' },
      ];
    },
  },
  data () {
    return {
      hasSparks: false,
    };
  },
  methods: {
    selfSparkType (item) {
      const sparkEntry = (this.sparkedFrames || {})[(item.frameNum + this.delay).toString()];
      if (!sparkEntry) {
        return '';
      } else {
        this.hasSparks = true;
      }

      const sparkTypes = sparkEntry
        .filter(({ index, type }) => !(index === this.attackIndex && type === this.attackType))
        .map(({ type }) => type);

      const hasNativeAttacks = sparkTypes.some(t => t === 'native');
      const hasExtraAttacks = sparkTypes.some(t => t === 'extra');
      // console.debug(this.attackIndex, this.attackType, item.frameNum, this.delay, sparkEntry, sparkTypes, hasNativeAttacks, hasExtraAttacks);
      if (hasNativeAttacks && hasExtraAttacks) {
        return 'both';
      } else if (hasNativeAttacks) {
        return 'native';
      } else {
        return 'extra';
      }
    },
  },
};
</script>

<style>
.theme--dark .hitcount-table--row {
  border-bottom: 1px solid var(--border-color-dark)
}

.theme--light .hitcount-table--row {
  border-bottom: 1px solid var(--border-color-light)
}

.theme--dark .hitcount-table--row:hover {
  background-color: dimgrey;
}

.theme--light .hitcount-table--row:hover {
  background-color: lightgrey;
}
</style>
