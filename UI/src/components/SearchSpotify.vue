<template>
  <div class="h-full">
    <div class="flex items-center space-x-2 px-4">
      <div class="flex-1">
        <div class="relative focus-within:text-gray-600 text-gray-400">
          <input type="text" class="text-sm px-4 py-1 border focus:ring-gray-500 focus:border-gray-900 w-full border-gray-300 rounded focus:outline-none text-gray-600" placeholder="Search">
        </div>
      </div>
      <div>
        <button class="text-sm bg-blue-700 text-white border border-blue-700 py-1 px-4 rounded">
          Search
        </button>
      </div>
    </div>
    <hr class="divide-solid my-2">
    <div class="overflow-y-auto" style="height: calc(100vh - 110px);">
      <div class="grid grid-cols-3 gap-4 px-4">
        <template v-for="num in 14">
          <div class="bg-blue-200 rounded h-32" :key="num"></div>
        </template>
      </div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 bg-white">
      <hr class="divide-solid my-2">
      <div class="h-full w-full px-4 pb-2">
        <button class="text-sm bg-blue-700 text-white border border-blue-700 py-1 px-4 rounded w-full h-full">Insert Random</button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "SearchSpotify", 
  methods: {
  },
  data: function() {
    return {
      result: []
    };
  }
};
</script>