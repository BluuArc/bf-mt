<template>
  <ul class="category-order-config">
    <!-- overall config -->
    <li
      v-for="(category, i) in categories"
      :key="`${category.name}-${i}`"
      class="category-order-config--category-entry"
    >
      <v-btn icon>
        <v-icon>keyboard_arrow_down</v-icon>
      </v-btn>
      <div class="category-order-config--category-entry-config">
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
        <v-btn block flat :disabled="i === value.length - 1">
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </div>


      <!-- expansion panel here -->
      <!-- name -->
      <!-- text color -->
      <!-- background color -->
      <!-- entry config -->
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
  },
};
</script>

<style lang="less">
.category-order-config {
  list-style-type: none;
  padding-left: 0;

  &--category-entry {
    display: flex;
    align-items: center;
    padding: 1em 0;

    &-config {
      width: 100%;
    }

    &:not(:last-child) {
      border-bottom: 1px solid var(--background-color-alt);
    }
  }
}
</style>
