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
      {{ leaderSkill }}
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
  props: ['leaderId'],
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
        this.loadingSkillData = true;
        this.leaderSkill = await this.getLeaderSkill(newValue);
        this.loadingSkillData = false;
      }
    },
    async pageDb () {
      if (this.leaderId && Object.keys(this.pageDb).length > 0) {
        this.loadingSkillData = true;
        this.leaderSkill = await this.getLeaderSkill(this.leaderId);
        this.loadingSkillData = false;
      }
    },
  },
  async mounted () {
    if (this.leaderId) {
      this.loadingSkillData = true;
      this.leaderSkill = await this.getLeaderSkill(this.leaderId);
      this.loadingSkillData = false;
    }
  },
  methods: {
    ...mapActions('leaderSkills', { getLeaderSkill: 'getById' }),
  },
};
</script>
