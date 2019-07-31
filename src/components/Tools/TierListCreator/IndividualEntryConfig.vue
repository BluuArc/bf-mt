<template>
  <v-layout align-center>
    <v-layout column>
      <v-layout align-center>
        <img
          :src="entry.base64Url || entry.imgUrl"
          width="70"
          style="max-height: 70px"
          class="ma-2"
        />
        <v-layout column>
          <v-flex>
            <span class="subheading">
              <b v-text="entry.name"/>
            </span>
          </v-flex>
          <v-layout wrap align-baseline>
            <v-flex>
              <v-text-field
                label="Alternate Art ID"
                persistent-hint
                hint="Apply a blank ID to reset to default art"
                v-model="alternateArtId"
              />
            </v-flex>
            <v-btn flat @click="applyNewAlternateId">Apply</v-btn>
          </v-layout>
        </v-layout>
      </v-layout>
      <v-layout>
        <v-dialog
          v-model="showCategoriesDialog"
          lazy
          scrollable
          max-width="500"
        >
          <template slot="activator" slot-scope="{ on }">
            <v-btn outline block v-on="on">
              Move to Category
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              Select New Category for {{ entry.name }}
            </v-card-title>
            <v-divider/>
            <v-card-text style="max-height: 300px;">
              <v-list>
                <template v-for="(category, c) in categories">
                  <v-list-tile
                    :disabled="c === currentCategoryIndex"
                    @click="moveToNewCategory(c)"
                    :key="`${category.name}-${c}`"
                  >
                    <v-list-tile-content>
                      <v-list-tile-title>
                        {{ category.name }}
                      </v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-divider
                    v-if="c < numCategories + 1"
                    :key="c"
                  />
                </template>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn flat @click="showCategoriesDialog = false">
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-layout>
    <div>
      <v-btn block flat :disabled="entryIndex === 0" @click="$emit('indexchange', entryIndex - 1)">
        <v-icon>keyboard_arrow_up</v-icon>
      </v-btn>
      <v-btn block flat @click="$emit('delete')">
        <v-icon>close</v-icon>
      </v-btn>
      <v-btn block flat :disabled="entryIndex === numEntries - 1" @click="$emit('indexchange', entryIndex + 1)">
        <v-icon>keyboard_arrow_down</v-icon>
      </v-btn>
    </div>
  </v-layout>
</template>

<script>
export default {
  props: {
    entry: {
      type: Object,
      required: true,
    },
    numEntries: {
      type: Number,
      default: 0,
    },
    categories: {
      type: Array,
      default: () => [],
    },
    entryIndex: {
      type: Number,
      default: 0,
    },
    currentCategoryIndex: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    numCategories () {
      return this.categories.length;
    },
  },
  data () {
    return {
      alternateArtId: '',
      showCategoriesDialog: false,
    };
  },
  methods: {
    applyNewAlternateId () {
      this.$emit('entry', {
        ...this.entry,
        altArtId: this.alternateArtId || '',
      });
    },
    moveToNewCategory (newIndex)  {
      this.showCategoriesDialog = false;
      this.$emit('movecategory', newIndex);
    },
  },
  watch: {
    entry: {
      immediate: true,
      handler (newValue) {
        this.alternateArtId = newValue.altArtId || '';
      },
    },
  },
};
</script>

<style>

</style>
