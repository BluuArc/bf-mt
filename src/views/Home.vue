<template>
  <v-container grid-list-lg>
    <v-layout row>
      <v-flex>
        <v-card raised>
          <v-card-title primary-title>
            <h1 class="title">Description</h1>
          </v-card-title>
          <v-card-text>
            <p class="mb-1">Welcome to the Archivum version of the Brave Frontier Multi Tool (BF-MT)! This special version of the Brave Frontier Multi Tool (BF-MT) is a web application whose goals are as follows:</p>
            <ul class="ml-3">
              <li>Provide information on units and items as of the closing of the Global version of Brave Frontier on April 2022</li>
              <li>Offer tools to help users build squads</li>
              <li>Help preserve the data from the game</li>
            </ul>
            <p class="mt-1"><b>Disclaimer:</b> This is a fan-made application and is not associated with Gumi/Alim.</p>
          </v-card-text>
        </v-card>
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
              <li><a rel="noopener" target="_blank" href="https://www.archivum.dev/">The Archivum</a> by Aikenfell</li>
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
            <h1 class="title">Old Versions</h1>
          </v-card-title>
          <v-card-text>
            <p class="mb-0">
              Interested in seeing what the previous iterations of this tool looked like? If so, follow the links below.
              The Semantic UI version of this tool was deprecated June 16, 2018, which is the day the live game version (using Vuetify UI) was first publicly released.
              The live game version is the most recent iteration of this tool prior to the Archivum version; it had the most updates and was frequently tied to the latest version of the datamine available at the time.
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn flat rel="noopener" href="https://bluuarc.github.io/bf-mt/semantic_build/" target="_blank">
              Semantic UI Version
            </v-btn>
            <v-btn flat rel="noopener" href="https://bluuarc.github.io/bf-mt/" target="_blank">
              Live Game Version
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'home',
};
</script>
