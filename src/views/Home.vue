<template>
  <v-container grid-list-lg>
    <v-layout row>
      <v-flex>
        <v-card raised>
          <v-card-title primary-title>
            <h3 class="headline">Description</h3>
          </v-card-title>
          <v-card-text>
            <p class="mb-1">The Brave Frontier Multi Tool (BF-MT) is a web application whose goals are as follows:</p>
            <ul class="ml-3">
              <li>Provide up-to-date information on units and items</li>
              <li>Offer tools to help users build squads</li>
              <li>Deliver data in a timely manner</li>
            </ul>
            <p class="mt-1"><b>Disclaimer:</b> This is an unofficial application and is not associated with Gumi/Alim.</p>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex>
        <GitHubCard/>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex>
        <v-card raised>
          <v-card-title>
            <h3 class="headline">Old Version</h3>
          </v-card-title>
          <v-card-text>
            <p class="mb-0">Interested in seeing what the previous iteration of this tool looked like? If so, click the button below. The Semantic UI version of this tool was deprecated June 16, 2018, which is the day this version (using Vuetify UI) was first publicly released.</p>
          </v-card-text>
          <v-card-actions>
            <v-btn flat rel="noopener" href="https://bluuarc.github.io/bf-mt/semantic_build/" target="_blank">
              Semantic UI Version
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import GitHubCard from '@/components/Home/GitHubCard';

export default {
  name: 'home',
  components: {
    GitHubCard
  }
}
</script>
