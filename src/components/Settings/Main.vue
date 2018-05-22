<template>
    <v-container grid-list-lg>
      <v-layout row wrap>
        <v-flex xs12>
          <v-form ref="general-settings" v-model="general.valid" id="general-settings">
            <v-card raised>
              <v-card-title>
                <h3 class="title">General Settings</h3>
              </v-card-title>
              <v-card-text>
                <v-switch v-model="general.darkMode" label="Use Dark Mode" :rules="darkModeCheckboxRules"/>
              </v-card-text>
              <v-card-actions>
                <v-btn :disabled="!general.valid" flat @click="generalFormSubmit">Save</v-btn>
                <v-btn flat @click="generalFormReset">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-flex>
      </v-layout>
    </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  computed: {
    ...mapState('settings', ['darkMode']),
    darkModeCheckboxRules () {
      return [
        v => v !== this.darkMode || 'Setting is the same as current',
      ];
    },
    generalForm () {
      return this.$refs['general-settings'];
    },
  },
  data () {
    return {
      general: {
        valid: false,
        darkMode: true,
      },
    };
  },
  mounted () {
    this.general.darkMode = this.darkMode;
  },
  methods: {
    ...mapActions('settings', ['setDarkMode']),
    async generalFormSubmit () {
      // valid only if settings are different
      if (this.generalForm.validate()) {
        await this.setDarkMode(this.general.darkMode);
        this.generalFormReset();
      }
    },
    generalFormReset () {
      this.generalForm.reset();
      this.general.darkMode = this.darkMode;
    },
  },
};
</script>
