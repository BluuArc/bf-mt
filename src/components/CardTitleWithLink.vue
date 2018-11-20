<template>
  <span>
    <template v-if="multidexPath">
      <router-link title="Click to view more details" :to="multidexPath" style="color: white">
        <span v-html="titleHtml"/>
      </router-link>
      <router-link class="d-inline-flex" title="Click to view more details" :to="multidexPath" style="color: white; text-decoration: none">
        <v-icon small class="pb-1 pl-1 white--text d-align-self-center">fas fa-external-link-alt</v-icon>
      </router-link>
    </template>
    <span v-else v-html="titleHtml"/>
  </span>
</template>

<script>
export default {
  props: {
    titleHtml: {
      type: String,
      default: '<b>Title:</b> name'
    },
    multidexPath: {
      type: String,
      default: '',
    },
  },
};
</script>
