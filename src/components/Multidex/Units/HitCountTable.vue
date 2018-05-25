<template>
  <v-data-table :headers="headers" :items="items" hide-actions>
    <template slot="items" slot-scope="props">
      <tr>
        <template v-for="col in ['hitNum', 'frameNum', 'damage', 'diff']">
          <td :key="col" class="pt-0 pb-0 text-xs-center">{{ props.item[col] }}</td>
        </template>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: ['attack'],
  computed: {
    headers () {
      return [
        { text: 'Hit #', sortable: false, value: 'hitNum', align: 'center' },
        { text: 'Frame #', sortable: false, value: 'frameNum', align: 'center' },
        { text: 'DMG%/hit', sortable: false, value: 'damage', align: 'center' },
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
