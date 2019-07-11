<template>
  <v-dialog
    :value="value"
    @input="($val) => $emit('input', $val)"
    max-width="500px">
    <template slot="activator" v-if="useActivator">
      <slot name="activator">
        <v-btn
          fab
          fixed
          left bottom
          color="primary"
          small>
          <v-icon>info</v-icon>
        </v-btn>
      </slot>
    </template>
    <v-card>
      <v-card-text>
        <h1 class="subheading">
          Updates are available for this server ({{ activeServer.toUpperCase() }}). ({{ modulesWithUpdates.map(m => getModuleName(m)).join(', ') }})
        </h1>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="() => downloadData(modulesWithUpdates)">Download Updates</v-btn>
        <v-btn flat @click.stop="$emit('input', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { multidexModuleInfo } from '@/modules/constants';
export default {
  props: {
    // controls visibility
    value: {
      type: Boolean,
      default: false,
    },
    modulesWithUpdates: {
      type: Array,
      default: () => [],
    },
    downloadData: {
      type: Function,
      required: true,
    },
    useActivator: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    activeServer () {
      return this.$store.state.settings.activeServer;
    },
  },
  methods: {
    getModuleName (internalName) {
      const associatedModule = multidexModuleInfo.find(m => m.name === internalName);
      return associatedModule ? associatedModule.fullName : internalName;
    },
  },
};
</script>

