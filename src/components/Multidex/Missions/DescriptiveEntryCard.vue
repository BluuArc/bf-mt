<template>
  <base-entry-card :to="to" style="height: 100%;">
    <v-container fluid class="pa-3">
      <v-layout row wrap>
        <v-flex xs8>
          <h1 class="subheading" style="word-break: break-word;">
            <b v-text="entry.name || 'No Name'"/>
          </h1>
          <h2 class="body-1">
            <span v-text="ladText"/>
          </h2>
          <h3 class="body-2" v-if="entry.continue">
            <u><b>No Continues</b></u>
          </h3>
        </v-flex>
        <v-flex xs4 class="text-xs-right">
          <h4 class="subheading">{{ entry.energy_use }} EN</h4>
          <h4 class="subheading">{{ entry.battle_count }} {{ +entry.battle_count === 1 ? 'Battle' : 'Battles' }}</h4>
          <h4 class="body-1">
            {{ xpPerEnergy }} XP/EN
          </h4>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex style="word-break: break-word;">
          <span v-if="entry.desc && entry.desc !== 'None' && entry.desc !== '0'">{{ entry.desc }}</span>
          <span v-else>No description.</span>
        </v-flex>
      </v-layout>
    </v-container>
  </base-entry-card>
</template>

<script>
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';

export default {
  mixins: [EntryCardMixin],
  computed: {
    ladText () {
      return !this.entry ? '' : [
        this.entry.land,
        this.entry.area,
        this.entry.dungeon
      ].filter(v => v).join(' / ');
    },
    xpPerEnergy () {
      const result = (+this.entry.xp / (Math.max(1, +this.entry.energy_use))).toFixed(2);
      const [whole, dec] = result.split('.');
      return (+dec === 0) ? whole : result;
    },
  },
};
</script>
