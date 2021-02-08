<template>
  <div id="app" class="h-full py-2">
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
@import "./assets/css/index.css";

body {
  overflow:hidden;
}
</style>
