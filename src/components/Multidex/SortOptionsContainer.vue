<template>
  <v-container fluid class="pa-0">
    <v-layout row>
      <v-flex>
        <v-card-text class="pt-0">
          <v-layout row wrap>
            <v-flex xs12 sm6 md12>
              <h3 class="subheading">Sort Type</h3>
              <v-radio-group v-model="value.type" :row="$vuetify.breakpoint.mdAndUp">
                <v-radio
                  v-for="(type, i) in sortLabels"
                  :key="i"
                  :disabled="disableInput"
                  :value="type"
                  :label="type"/>
                </v-radio-group>
            </v-flex>
            <v-flex xs12 sm6 md12>
              <h3 class="subheading">Sort Order</h3>
              <v-radio-group v-model="value.isAscending" :row="$vuetify.breakpoint.mdAndUp">
                <v-radio :disabled="disableInput" :value="true" label="Ascending"/>
                <v-radio :disabled="disableInput" :value="false" label="Descending"/>
              </v-radio-group>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: ['value', 'disableInput', 'sortTypes'],
  computed: {
    sortLabels () {
      return (Array.isArray(this.sortTypes) ? this.sortTypes.slice() : Object.keys(this.sortTypes)).sort();
    },
  },
  watch: {
    value: {
      deep: true,
      handler (newValue) {
        this.$emit('input', newValue);
      },
    },
  },
};
</script>

