<template>
  <div class="ui fixed menu bottom center aligned">
    <div class="ui secondary menu">
      <router-link class="item" to="/">Home</router-link>
      <router-link class="item" to="/news">News</router-link>
      <router-link class="item" to="/units">Units</router-link>
      <router-link class="item" to="/items">Items</router-link>
      <router-link class="item" to="/squad">Squad</router-link>
      <router-link class="item" to="/summoner">Summoner</router-link>
    </div>
  </div>
</template>

<style>
.ui.secondary.menu {
  margin: 0 auto;
}
</style>
