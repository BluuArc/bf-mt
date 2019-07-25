<template>
  <ul class="category-order-config">
    <!-- overall config -->
    <li
      v-for="(category, c) in categories"
      :key="`${category.name}-${c}`"
      class="category-order-config--category-entry"
    >
      <div class="category-order-config--category-entry-header">
        <v-btn
          icon
          :class="{ 'entry-expansion-icon': true, active: expandedEntries.includes(c) }"
          @click="toggleExpandedEntry(c)"
        >
          <v-icon>keyboard_arrow_right</v-icon>
        </v-btn>
        <div class="category-order-config--category-entry-header-config">
          <v-text-field label="Category Name" :value="category.name"/>
          <v-layout row wrap>
            <v-flex>
              <label>
                Text Color
                <input type="color" :value="category.textColor"/>
              </label>
            </v-flex>
            <v-flex>
              <label>
                Background Color
                <input type="color" :value="category.backgroundColor"/>
              </label>
            </v-flex>
          </v-layout>
        </div>
        <v-spacer/>
        <div>
          <v-btn block flat :disabled="c === 0">
            <v-icon>keyboard_arrow_up</v-icon>
          </v-btn>
          <v-btn block flat>
            <v-icon>close</v-icon>
          </v-btn>
          <v-btn block flat :disabled="c === categories.length - 1">
            <v-icon>keyboard_arrow_down</v-icon>
          </v-btn>
        </div>
      </div>
      <v-expansion-panel :value="expandedEntries.includes(c) ? 0 : -1">
        <v-expansion-panel-content>
          <ul class="entry-order-config mx-2">
            <li
              v-for="(entry, e) in getEntriesForCategory(c)"
              :key="`${entry.id || entry.name || entry.imgUrl}-${e}`"
            >
              <individual-entry-config :entry="entry" :entryIndex="e" :numCategories="getEntriesForCategory(c).length"/>
            </li>
            <li>
              <v-btn flat large>
                <v-icon>add</v-icon>
                Add Entry
              </v-btn>
            </li>
          </ul>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </li>
    <li>
      <v-btn flat large>
        <v-icon>add</v-icon>
        Add Category
      </v-btn>
    </li>
  </ul>
</template>

<script>
import IndividualEntryConfig from './IndividualEntryConfig';

export default {
  components: {
    IndividualEntryConfig,
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  computed: {
    categories () {
      return Array.isArray(this.value.categories)
        ? this.value.categories
        : [];
    },
    hasEntries () {
      return Array.isArray(this.value.entries);
    },
  },
  data () {
    return {
      expandedEntries: [],
    };
  },
  methods: {
    toggleExpandedEntry (index) {
      if (this.expandedEntries.includes(index)) {
        this.expandedEntries = this.expandedEntries.filter(e => e !== index);
      } else {
        this.expandedEntries.push(index);
      }
    },
    getEntriesForCategory (index) {
      return this.hasEntries && Array.isArray(this.value.entries[index])
        ? this.value.entries[index]
        : [];
    },
  },
};
</script>

<style lang="less">
.entry-order-config {
  list-style-type: none;
  padding-left: 0;
}

.category-order-config {
  list-style-type: none;
  padding-left: 0;

  &--category-entry-header {
    display: flex;
    align-items: center;
    padding: 1em 0;

    .entry-expansion-icon.active {
      transform: rotate(90deg);
    }

    &-config {
      width: 100%;

      label {
        display: flex;
        align-items: center;
      }
    }

    &:not(:last-child) {
      border-bottom: 1px solid var(--background-color-alt);
    }
  }
}
</style>
