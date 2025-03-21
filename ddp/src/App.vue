<script setup lang="ts">
import CardGame from './components/CardGame.vue'
</script>

<template>
  <div class="app">
    <CardGame />
  </div>
</template>

<style>
:root {
  --base-card-width: min(20vw, 90px);
  --base-card-height: calc(var(--base-card-width) * 1.5);
  --base-spacing: min(4vw, 20px);
  --base-font-size: min(4vw, 18px);
}

.app {
  min-height: 100vh;
  background: #000;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

body {
  margin: 0;
  padding: 0;
  background: #000;
  color: #fff;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}
</style>
