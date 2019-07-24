<template>
  <ul class="category-order-config">
    <!-- overall config -->
    <li
      v-for="(category, i) in categories"
      :key="`${category.name}-${i}`"
      class="category-order-config--category-entry"
    >
      <div class="category-order-config--category-entry-header">
        <v-btn
          icon
          :class="{ 'entry-expansion-icon': true, active: expandedEntries.includes(i) }"
          @click="toggleExpandedEntry(i)"
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
          <v-btn block flat :disabled="i === 0">
            <v-icon>keyboard_arrow_up</v-icon>
          </v-btn>
          <v-btn block flat>
            <v-icon>close</v-icon>
          </v-btn>
          <v-btn block flat :disabled="i === value.length - 1">
            <v-icon>keyboard_arrow_down</v-icon>
          </v-btn>
        </div>
      </div>
      <v-expansion-panel :value="expandedEntries.includes(i) ? 0 : -1">
        <v-expansion-panel-content>
          {{ getEntriesForCategory(i) }}
        </v-expansion-panel-content>
      </v-expansion-panel>
    </li>
    <li>
      <v-btn block>Add Category</v-btn>
    </li>
  </ul>
</template>

<script>
export default {
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
