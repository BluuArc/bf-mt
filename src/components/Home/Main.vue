<template>
  <v-container grid-list-lg>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card raised>
          <v-card-title primary-title>
            <h3 class="headline">Description</h3>
          </v-card-title>
          <v-card-text>
            <p>The Brave Frontier Multi Tool (BF-MT) is a web application whose goals are as follows:</p>
            <ul class="ml-3">
              <li>Provide up-to-date information on units and items</li>
              <li>Offer tools to help users build squads</li>
              <li>Deliver data in a timely manner</li>
            </ul>
            <p><b>Disclaimer:</b> This is an unofficial application and is not associated with Gumi/Alim.</p>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card raised>
          <v-card-title>
            <h3 class="headline">Rights/Credits</h3>
          </v-card-title>
          <v-card-text>
            <p>Thanks to the following for providing parts used in this tool.
            All images and code belong to their respective owners.
            Unless otherwise specified, this tool is not directly affiliated with
            any of the entities named below.</p>
            <ul class="ml-3">
              <li>Brave Frontier assets by Gumi/Alim</li>
              <li><a rel="noopener" target="_blank" href="https://github.com/cheahjs/bravefrontier_data">Brave Frontier Datamine</a> by Deathmax</li>
              <li><a rel="noopener" target="_blank" href="https://vuetifyjs.com/en/">Vuetify</a></li>
              <li><a rel="noopener" target="_blank" href="https://vuejs.org/">Vue.js</a> by Evan You</li>
              <li><a rel="noopener" target="_blank" href="http://dexie.org/">Dexie.js</a> by David Fahlander</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
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
