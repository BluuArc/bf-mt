<template>
  <ul class="order-configurator">
    <li v-for="(entry, i) in value" :key="getValueOfEntry(entry, i)">
      <v-btn icon flat @click="moveEntryUp(i)" :disabled="i === 0">
        <v-icon>keyboard_arrow_up</v-icon>
      </v-btn>
      <v-btn icon flat @click="moveEntryDown(i)" :disabled="i === value.length - 1">
        <v-icon>keyboard_arrow_down</v-icon>
      </v-btn>
      <span v-text="getEntryName(entry)"/>
      <v-btn icon flat @click="hideEntry(i)">
        <v-icon>fa fa-eye</v-icon>
      </v-btn>
    </li>
    <li v-for="(entry, i) in remainingValues" :key="getValueOfEntry(entry, i + value.length)">
      <v-btn icon flat disabled>
        <v-icon>keyboard_arrow_up</v-icon>
      </v-btn>
      <v-btn icon flat disabled>
        <v-icon>keyboard_arrow_down</v-icon>
      </v-btn>
      <span v-text="getEntryName(entry)" class="grey--text"/>
      <v-btn icon flat @click="showEntry(i)">
        <v-icon>fa fa-eye-slash</v-icon>
      </v-btn>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    getEntryName: {
      type: Function,
      default: (v) => (v && v.name) || v,
    },
    getEntryValue: {
      required: false,
    },
    fullValueSet: {
      required: false,
    },
  },
  computed: {
    remainingValues () {
      // default to value array if no full value set is defined
      const fullValueSet = Array.isArray(this.fullValueSet) ? this.fullValueSet : this.value;
      let remainingValues;
      if (fullValueSet !== this.value) {
        remainingValues = this.fullValueSet.filter(v => !this.value.includes(v));
      } else {
        remainingValues = [];
      }
      return remainingValues;
    },
  },
  methods: {
    getValueOfEntry (v, i) {
      return typeof this.getEntryValue !== 'function'
        ? `${this.getEntryName(v)}-${i}`
        : this.getEntryValue(v, i);
    },
    emitValue (value) {
      this.$emit('input', value);
    },
    moveEntryUp (indexOfEntryToMove) {
      const newOrder = this.value.slice();
      if (indexOfEntryToMove > 0 && indexOfEntryToMove < newOrder.length) {
        const otherEntry = newOrder[indexOfEntryToMove - 1];
        const currentEntry = newOrder[indexOfEntryToMove];
        newOrder[indexOfEntryToMove - 1] = currentEntry;
        newOrder[indexOfEntryToMove] = otherEntry;
      }
      this.emitValue(newOrder);
    },
    moveEntryDown (indexOfEntryToMove) {
      const newOrder = this.value.slice();
      if (indexOfEntryToMove > -1 && indexOfEntryToMove < newOrder.length - 1) {
        const otherEntry = newOrder[indexOfEntryToMove + 1];
        const currentEntry = newOrder[indexOfEntryToMove];
        newOrder[indexOfEntryToMove + 1] = currentEntry;
        newOrder[indexOfEntryToMove] = otherEntry;
      }
      this.emitValue(newOrder);
    },
    hideEntry (indexOfEntry) {
      this.emitValue(this.value.filter((v, i) => i !== indexOfEntry));
    },
    showEntry (indexOfEntry) {
      const newOrder = this.value.slice();
      if (indexOfEntry > -1 && indexOfEntry < this.remainingValues.length) {
        newOrder.push(this.remainingValues[indexOfEntry]);
      }
      this.emitValue(newOrder);
    },
  },
};
</script>

<style lang="less">
ul.order-configurator {
  list-style-type: none;
  padding: 0;

  li {
    display: grid;
    // position-up position-down name toggle-display
    grid-template-columns: auto auto 1fr auto;

    align-items: center;
  }
}
</style>
