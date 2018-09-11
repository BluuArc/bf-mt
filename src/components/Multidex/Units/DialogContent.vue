<template>
  <dialog-content-base :entry="entry" :loadingEntryData="loadingEntryData">
    <v-container class="mb-5 pb-3">
      <v-layout row>
        <v-flex v-if="activeMainTab === 'general'">
          general tab
        </v-flex>
        <v-flex v-else-if="activeMainTab === 'skills'">
          <leader-skill-card :unit="entry" :logger="logger"/>
        </v-flex>
        <v-flex v-else-if="activeMainTab === 'art'">
          art tab
          {{ entry }}
        </v-flex>
      </v-layout>
    </v-container>
    <v-bottom-nav :value="true" :active.sync="activeMainTab" app color="primary">
      <v-btn
        v-for="tab in mainTabs"
        :key="tab.value"
        :value="tab.value"
        flat class="white--text">
        {{ tab.text }}
        <v-icon v-if="tab.icon">{{ tab.icon }}</v-icon>
      </v-btn>
    </v-bottom-nav>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import BorderedTitledCard from '@/components/BorderedTitledCard';
import LeaderSkillCard from '@/components/Multidex/Units/LeaderSkillCard';

export default {
  mixins: [DialogContentMixin],
  components: {
    BorderedTitledCard,
    LeaderSkillCard,
  },
  computed: {
    mainTabs: () => [
      { text: 'General Info', value: 'general', icon: 'perm_identity' },
      { text: 'Skill Set', value: 'skills', icon: 'category' },
      { text: 'Art', value: 'art', icon: 'insert_photo' },
    ],
    mainTabValues () {
      return this.mainTabs.map(({ value }) => value);
    },
  },
  data () {
    return {
      alternateImageLoaded: false,
      activeMainTab: 0,
    };
  },
  watch: {
    activeMainTab (newValue) {
      // default to middle tab if invalid
      if (!this.mainTabValues.includes(newValue)) {
        this.activeMainTab = this.mainTabValues[1];
      }
    },
  },
  mounted () {
    this.activeMainTab = this.mainTabValues[1];
  },
};
</script>
