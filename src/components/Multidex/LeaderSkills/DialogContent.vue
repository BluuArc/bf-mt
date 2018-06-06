<template>
  <v-card flat>
    <v-card-text v-if="loadingSkillData" class="text-xs-center pt-5">
      <v-progress-circular indeterminate/>
      <h4 class="subheading">Loading skill data</h4>
    </v-card-text>
    <v-card-text v-else-if="!leaderSkill">
      No skill data found.
    </v-card-text>
    <v-card-text v-else class="pl-0 pr-0 pb-5">
      <v-container grid-list-xl class="leader-skill-dialog-content">
        <v-layout row>
          <v-flex xs12>
            <description-card :skill="leaderSkill" style="border-color: var(--description-card-color)"/>
          </v-flex>
        </v-layout>
        <v-layout row v-if="leaderSkill.associated_units">
          <v-flex xs12>
            <associated-units-card :units="leaderSkill.associated_units" style="border-color: var(--associated-units-card-color);"/>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs12>
            <v-card style="border-color: var(--effects-card-color)">
              <v-card-title class="purple lighten-1 white--text">
                <h3 class="title">Effects</h3>
              </v-card-title>
              <v-card-text>
                <effect-list :effects="leaderSkill.effects"/>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import DescriptionCard from '@/components/Multidex/LeaderSkills/DescriptionCard';
import AssociatedUnitsCard from '@/components/Multidex/LeaderSkills/AssociatedUnitsCard';
import EffectList from '@/components/Multidex/EffectList/MainTable';

export default {
  props: ['leaderId'],
  components: {
    'description-card': DescriptionCard,
    'effect-list': EffectList,
    'associated-units-card': AssociatedUnitsCard,
  },
  computed: {
    ...mapState('leaderSkills', ['pageDb']),
  },
  data () {
    return {
      leaderSkill: undefined,
      loadingSkillData: true,
      // activeTab: 'skills',
    };
  },
  watch: {
    async leaderId (newValue) {
      if (!newValue) {
        this.leaderSkill = undefined;
      } else {
        this.skillDataChangeHandler();
      }
    },
    async pageDb () {
      if (this.leaderId && Object.keys(this.pageDb).length > 0) {
        this.skillDataChangeHandler();
      }
    },
  },
  async mounted () {
    if (this.leaderId) {
      this.skillDataChangeHandler();
    }
  },
  methods: {
    ...mapActions('leaderSkills', { getLeaderSkill: 'getById' }),
    async skillDataChangeHandler () {
      this.loadingSkillData = true;
      this.leaderSkill = await this.getLeaderSkill(this.leaderId);
      this.loadingSkillData = false;
    },
  },
};
</script>

<style>
.leader-skill-dialog-content .card {
  border: 2px solid transparent;
  margin: -2px;
  --description-card-color: #2e7d32;  /* green darken-3 */
  --associated-units-card-color: #3f51b5; /* indigo */
  --effects-card-color: #AB47BC; /* purple lighten-1 */
}

.theme--light .leader-skill-dialog-content .unit-card {
  background-color: whitesmoke;
}

.theme--dark .leader-skill-dialog-content .unit-card {
  background-color: black;
}
</style>
