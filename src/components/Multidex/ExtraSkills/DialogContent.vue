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
      <v-container grid-list-xl class="extra-skill-dialog-content">
        <v-layout row>
          <v-flex xs12>
            <description-card :skill="extraSkill" style="border-color: var(--description-card-color);"/>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs12>
            <effects-card :effects="extraSkill.effects" style="border-color: var(--effects-card-color);"/>
          </v-flex>
        </v-layout>
        <v-layout row>
          {{ extraSkill }}
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import JsonViewer from '@/components/Multidex/JsonViewer';
import DescriptionCard from '@/components/Multidex/ExtraSkills/DescriptionCard';
import EffectsCard from '@/components/Multidex/ExtraSkills/EffectsCard';

export default {
  props: ['extraId'],
  components: {
    'json-viewer': JsonViewer,
    'description-card': DescriptionCard,
    'effects-card': EffectsCard,
  },
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
      if (!newValue) {
        this.extraSkill = undefined;
      } else {
        this.skillDataChangeHandler();
      }
    },
    async pageDb () {
      if (this.extraId && Object.keys(this.pageDb).length > 0) {
        this.skillDataChangeHandler();
      }
    },
  },
  async mounted () {
    if (this.extraId) {
      this.skillDataChangeHandler();
    }
  },
  methods: {
    ...mapActions('extraSkills', { getExtraSkill: 'getById' }),
    async skillDataChangeHandler () {
      this.loadingEntryData = true;
      this.extraSkill = await this.getExtraSkill(this.extraId);
      this.loadingEntryData = false;
    },
  },
};
</script>

<style>
.extra-skill-dialog-content .card {
  border: 2px solid transparent;
  margin: -2px;
  --description-card-color: #e65100; /* orange darken-4 */
  --effects-card-color: #AB47BC; /* purple lighten-1 */
}
</style>
