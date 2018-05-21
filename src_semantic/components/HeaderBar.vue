<template>
  <div class='ui top fixed menu' id="header-bar">
    <router-link
      :to="href || (defaultValues.href)"
      class='item text center aligned' id="action-button">
        {{ content || defaultValues.content }}
      </router-link>
    <div class='left menu' id="title">
      <div class='header item'>Brave Frontier Multi Tool</div>
    </div>
    <div class='right menu'>
      <a class='right item' target="_blank"
        href="http://joshuacastor.me">JCCC</a>
      <a class='right item' target="_blank"
        href="https://github.com/BluuArc/bf-mt">
        <img src='../assets/GitHub-Mark-32px.png'>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: ['href', 'content'],
  watch: {
    href(newValue) {
      // eslint-disable-next-line
      console.debug("new href", newValue);
    },
    content(newValue) {
      // eslint-disable-next-line
      console.debug("new content", newValue);
    },
  },
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
#header-bar #title .item::before {
  background: none;
}

#header-bar #action-button {
  width: 5rem;
 }

 #header-bar img {
   max-height: 1.5rem;
   max-width: 1.5rem;
 }
</style>
