<template>
  <div id="app">
    <CreateRectangles />
  </div>
</template>

<script>
import CreateRectangles from "./components/CreateRectangles.vue";

export default {
  name: "App",
  components: {
    CreateRectangles
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 16px;
}
</style>
