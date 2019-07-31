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
          <v-layout align-baseline>
            <v-text-field
              label="Category Name"
              :value="editableNameValues[c] || category.name"
              @input="$v => editableNameValues[c] = $v"/>
            <v-btn flat @click="updateCategoryValue(c, { name: editableNameValues[c] })">
              Apply
            </v-btn>
          </v-layout>
          <v-layout row wrap>
            <v-flex>
              <label>
                Text Color
                <input
                  type="color"
                  :value="category.textColor"
                  @input="$v => updateCategoryValue(c, { textColor: $v.target.value })"
                />
              </label>
            </v-flex>
            <v-flex>
              <label>
                Background Color
                <input
                  type="color"
                  :value="category.backgroundColor"
                  @input="$v => updateCategoryValue(c, { backgroundColor: $v.target.value })"
                />
              </label>
            </v-flex>
          </v-layout>
        </div>
        <v-spacer/>
        <div>
          <v-btn block flat :disabled="c === 0" @click="swapOrderForCategory(c, c - 1)">
            <v-icon>keyboard_arrow_up</v-icon>
          </v-btn>
          <v-btn block flat>
            <v-icon>close</v-icon>
          </v-btn>
          <v-btn block flat :disabled="c === categories.length - 1" @click="swapOrderForCategory(c, c + 1)">
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
              <individual-entry-config
                :entry="entry"
                :entryIndex="e"
                :categories="categories"
                :numEntries="getEntriesForCategory(c).length"
                :currentCategoryIndex="c"
                @indexchange="newIndex => swapOrderForEntry(e, newIndex, c)"
                @delete="deleteEntry(entry, c)"
                @entry="newEntry => replaceEntry(e, newEntry, c)"
                @movecategory="newIndex => moveEntryToCategory(entry, c, newIndex)"
              />
            </li>
            <li>
              <v-btn flat large @click="() => { categoryToAddTo = c; activeDialog = 'unit'; }">
                <v-icon>add</v-icon>
                Add Entry
              </v-btn>
            </li>
          </ul>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </li>
    <li>
      <v-btn flat large @click="addCategory">
        <v-icon>add</v-icon>
        Add Category
      </v-btn>
      <v-dialog
        :value="!!activeDialog"
        @input="activeDialog = ''"
        lazy
      >
        <unit-selector
          v-if="activeDialog === 'unit'"
          @input="$d => addEntry($d.data, categoryToAddTo)"
          @cancel="activeDialog = ''"
        />
      </v-dialog>
    </li>
  </ul>
</template>

<script>
import { convertCodeToCategory } from '@/modules/core/tier-list-creator';
import UnitSelector from '@/components/Tools/Squads/MultidexSelectors/UnitSelector';
import IndividualEntryConfig from './IndividualEntryConfig';
import throttle from 'lodash/throttle';

export default {
  components: {
    IndividualEntryConfig,
    UnitSelector,
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
    allEntries () {
      return this.value.entries;
    },
  },
  data () {
    return {
      expandedEntries: [],
      activeDialog: '',
      categoryToAddTo: -1,
      editableNameValues: {},
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
      return this.hasEntries && Array.isArray(this.allEntries[index])
        ? this.allEntries[index]
        : [];
    },
    emitNewValue (newValue = {}) {
      this.$emit('input', {
        ...this.value,
        ...newValue,
      });
    },
    emitNewEntriesForCategory (newEntries, categoryIndex) {
      if (this.allEntries[categoryIndex]) {
        const newFullEntries = this.allEntries.slice();
        newFullEntries[categoryIndex] = newEntries;
        this.emitNewValue({
          entries: newFullEntries,
        });
      }
    },
    swapOrderForEntry (newIndex, oldIndex, categoryIndex) {
      const categoryEntries = this.getEntriesForCategory(categoryIndex);
      if (categoryEntries[oldIndex] && categoryEntries[newIndex]) {
        const currentEntry = categoryEntries[oldIndex];
        const entryToSwap = categoryEntries[newIndex];

        this.emitNewEntriesForCategory(
          categoryEntries.map(entry => {
            if (entry === currentEntry) {
              return entryToSwap;
            } else if (entry === entryToSwap) {
              return currentEntry;
            } else {
              return entry;
            }
          }),
          categoryIndex,
        );
      }
    },
    deleteEntry (entryToDelete, categoryIndex) {
      if (this.allEntries[categoryIndex]) {
        const categoryEntries = this.getEntriesForCategory(categoryIndex);
        this.emitNewEntriesForCategory(
          categoryEntries.filter(e => e !== entryToDelete),
          categoryIndex,
        );
      }
    },
    replaceEntry (entryIndex, newEntry, categoryIndex) {
      if (this.allEntries[categoryIndex]) {
        const categoryEntries = this.getEntriesForCategory(categoryIndex);
        this.emitNewEntriesForCategory(
          categoryEntries.map((e, i) => i !== entryIndex ? e : newEntry),
          categoryIndex,
        );
      }
    },
    moveEntryToCategory (entry, oldCategoryIndex, newCategoryIndex) {
      if (this.allEntries[oldCategoryIndex] && this.allEntries[newCategoryIndex]) {
        const oldCategoryEntries = this.getEntriesForCategory(oldCategoryIndex);
        const newCategoryEntries = this.getEntriesForCategory(newCategoryIndex);
        const newFullEntries = this.allEntries.slice();
        newFullEntries[oldCategoryIndex] = oldCategoryEntries.filter(e => e !== entry);
        newFullEntries[newCategoryIndex] = newCategoryEntries.concat([entry]);
        this.emitNewValue({
          entries: newFullEntries,
        });
      }
    },
    async addEntry (unitPromise, categoryIndex) {
      if (this.allEntries[categoryIndex]) {
        const categoryEntries = this.getEntriesForCategory(categoryIndex);
        const data = await unitPromise;
        this.activeDialog = '';
        this.emitNewEntriesForCategory(
          categoryEntries.concat([{
            type: "unit",
            name: data.name,
            id: `${data.id}`,
          }]),
          categoryIndex,
        );
      }
    },
    addCategory () {
      const newCategory = convertCodeToCategory('Category');
      this.emitNewValue({
        categories: this.categories.concat([newCategory]),
        entries: this.allEntries.concat([]),
      });
    },
    swapOrderForCategory (oldIndex, newIndex) {
      const { categories } = this;
      if (categories[oldIndex] && categories[newIndex]) {
        const categoryAtOldIndex = categories[oldIndex];
        const categoryAtNewIndex = categories[newIndex];
        const entriesAtOldIndex = this.getEntriesForCategory(oldIndex);
        const entriesAtNewIndex = this.getEntriesForCategory(newIndex);

        const newCategories = categories.slice();
        const newEntries = this.allEntries.slice();

        newCategories[oldIndex] = categoryAtNewIndex;
        newCategories[newIndex] = categoryAtOldIndex;
        newEntries[oldIndex] = entriesAtNewIndex;
        newEntries[newIndex] = entriesAtOldIndex;

        this.emitNewValue({
          categories: newCategories,
          entries: newEntries,
        });
      }
    },
    updateCategoryValue (categoryIndex, newValue = {}) {
      const { categories } = this;
      if (categories[categoryIndex]) {
        const newCategories = categories.slice();
        newCategories[categoryIndex] = {
          ...categories[categoryIndex],
          ...newValue,
        };

        this.emitNewValue({
          categories: newCategories,
        });
      }
    },
    throttledUpdateCategoryValue: throttle(function(index, value) {
      this.updateCategoryValue(index, value);
    }, 500),
  },
  watch: {
    value () {
      // reset name fields on new config
      this.editableNameValues = {};
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
