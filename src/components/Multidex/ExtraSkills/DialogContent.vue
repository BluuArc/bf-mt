<template>
  <v-card flat>
    <v-card-text v-if="loadingEntryData" class="text-xs-center pt-5">
      <v-progress-circular indeterminate/>
      <h4 class="subheading">Loading extra skill data</h4>
    </v-card-text>
    <v-card-text v-else-if="!extraSkill">
      No extra skill data found.
    </v-card-text>
    <v-card-text v-else class="pl-0 pr-0 pb-5">
      {{ extraSkill }}
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
  props: ['extraId'],
  computed: {
    ...mapState('extraSkills', ['pageDb']),
  },
  data () {
    return {
      extraSkill: undefined,
      loadingEntryData: true,
      // activeTab: 'skills',
    };
  },
  watch: {
    async extraId (newValue) {
      this.alternateImageLoaded = false;
      if (!newValue) {
        this.extraSkill = undefined;
      } else {
        this.loadingEntryData = true;
        this.extraSkill = await this.getExtraSkill(newValue);
        this.loadingEntryData = false;
      }
    },
    async pageDb () {
      if (this.extraId && Object.keys(this.pageDb).length > 0) {
        this.loadingEntryData = true;
        this.extraSkill = await this.getExtraSkill(this.extraId);
        this.loadingEntryData = false;
      }
    },
  },
  async mounted () {
    if (this.extraId) {
      this.loadingEntryData = true;
      this.extraSkill = await this.getExtraSkill(this.extraId);
      this.loadingEntryData = false;
    }
  },
  methods: {
    ...mapActions('extraSkills', { getExtraSkill: 'getById' }),
  },
};
</script>
