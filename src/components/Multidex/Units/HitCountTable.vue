<template>
  <v-container fluid class="hitcount-table">
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
          <v-layout row v-for="(item, index) in items" :key="index" class="text-xs-center hitcount-table--row">
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
