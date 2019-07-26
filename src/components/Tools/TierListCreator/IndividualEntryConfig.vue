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
            <v-btn flat>Apply</v-btn>
          </v-layout>
        </v-layout>
      </v-layout>
      <v-layout>
        <v-btn outline block>
          Move to Category
        </v-btn>
      </v-layout>
    </v-layout>
    <div>
      <v-btn block flat :disabled="entryIndex === 0">
        <v-icon>keyboard_arrow_up</v-icon>
      </v-btn>
      <v-btn block flat>
        <v-icon>close</v-icon>
      </v-btn>
      <v-btn block flat :disabled="entryIndex === numCategories - 1">
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
    numCategories: {
      type: Number,
      default: 0,
    },
    entryIndex: {
      type: Number,
      default: 0,
    },
  },
  data () {
    return {
      alternateArtId: '',
    };
  },
};
</script>

<style>

</style>
