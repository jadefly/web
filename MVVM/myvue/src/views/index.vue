<template>
  <div class="main">
    <div id="nav">
      <router-link to="/home">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/chat">chat</router-link> |
      <router-link to="/shopingCart">shopingCart</router-link> | 
      <router-link to="/test">test</router-link>
    </div>
    
    <router-view></router-view>
  </div>
</template>