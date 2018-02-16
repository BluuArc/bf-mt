<template>
  <div class='ui top fixed menu' id="header-bar">
    <router-link
      :to="href || (defaultValues.href)"
      class='item'>
        {{ content || defaultValues.content }}
      </router-link>
    <div class='left menu' id="title">
      <div class='header item'>Brave Frontier Multi Tool</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['href', 'content'],
  data() {
    return {
      defaultValues: {
        href: '/',
        content: 'Home',
      },
    };
  },
};
</script>

<style>
#header-bar #title .item::before{
  background: none;
}
</style>
