<template>
  <v-container grid-list-lg>
    <v-layout row>
      <v-flex>
        <v-card raised>
          <v-card-title primary-title>
            <h1 class="title">Description</h1>
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
        <v-card raised>
          <v-card-title>
            <h1 class="title">Data Disclaimer</h1>
          </v-card-title>
          <v-card-text>
            <span>This tool uses StatCounter and Google Analytics for traffic analytics. You can find out more about them below.</span>
          </v-card-text>
          <v-card-actions>
            <v-btn flat rel="noopener" href="https://statcounter.com/" target="_blank">
              StatCounter
            </v-btn>
            <v-btn flat rel="noopener" href="https://marketingplatform.google.com/about/analytics/" target="_blank">
              Google Analytics
            </v-btn>
          </v-card-actions>
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
            <h1 class="title">Rights/Credits</h1>
          </v-card-title>
          <v-card-text>
            <p>Thanks to the following for providing parts used in this tool.
            All images and code belong to their respective owners.
            Unless otherwise specified, this tool is not directly affiliated with
            any of the entities named below.</p>
            <ul>
              <li>Brave Frontier assets by Gumi/Alim</li>
              <li><a rel="noopener" target="_blank" href="https://github.com/cheahjs/bravefrontier_data">Brave Frontier Datamine</a> by Deathmax</li>
              <li><a rel="noopener" target="_blank" href="https://vuetifyjs.com/en/">Vuetify</a></li>
              <li><a rel="noopener" target="_blank" href="https://vuejs.org/">Vue.js</a> by Evan You</li>
              <li><a rel="noopener" target="_blank" href="http://dexie.org/">Dexie.js</a> by David Fahlander</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex>
        <v-card raised>
          <v-card-title>
            <h1 class="title">Old Version</h1>
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
