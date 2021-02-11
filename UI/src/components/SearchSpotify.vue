<template>
  <div class="h-full">
    <div class="flex items-center space-x-2 px-4">
      <div class="flex-1">
        <div class="relative focus-within:text-gray-600 text-gray-400">
          <input type="text" class="text-sm px-4 py-1 border focus:ring-gray-500 focus:border-gray-900 hover:border-gray-900 w-full border-gray-300 rounded focus:outline-none text-gray-600" placeholder="Search" v-model="searchQuery">
        </div>
      </div>
      <div>
        <button
          class="text-sm bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 py-1 px-4 rounded disabled:opacity-50"
          @click="querySpotify()"
          :disabled="searchQuery.length === 0"
        >
          Search
        </button>
      </div>
    </div>
    <hr class="divide-solid my-2">
    <div class="overflow-y-auto overflow-x-hidden" style="height: calc(100vh - 110px);">
      <div v-if="artists.length !== 0" class="grid grid-cols-3 gap-4 px-4">
        <div v-for="(item ,i) in artists" :key="i">
          <div class="box bg-gray-400 rounded h-32 hover:opacity-50 cursor-pointer">
            <template v-if="item.images.length > 1">
              <img
              :ref="`${item.name}-${i}`"
              class="object-cover w-full h-full rounded h-32"
              :src="item.images[0].url"
              :alt="item.name"
              @click="addToCanvas(item.images[0].url)"
              >
            </template>
          </div>
          <div class="text-xs">{{ item.name }}</div>
        </div>
      </div>
      <div v-if="artists.length !== total" class="px-4 mt-4">
        <button
          class="text-sm bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 py-1 px-4 rounded w-full"
          @click="paginateSpotify()"
        >
          See More
        </button>
      </div>
      <div v-if="artists.length === 0" class="flex items-center justify-center h-full w-full">
        <div class="text-center">
          <div>SPOTTIE</div>
          <div>Search Artists</div>
        </div>
      </div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 bg-white">
      <hr class="divide-solid my-2">
      <div class="h-full w-full px-4 pb-2">
        <button
          class="text-sm bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 py-1 px-4 rounded w-full h-full disabled:opacity-50"
          @click="clearSearch()"
          :disabled="artists.length === 0"
        >
            Clear Search {{ total ? `(${total})` : '' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { notify, createImage } from "../helpers/figma-messages";

var qs = require('qs');
var data = qs.stringify({
 'grant_type': 'client_credentials' 
});

export default {
  name: "SearchSpotify",
  data() {
    return {
      artists: [],
      searchType: 'artist,track',
      searchQuery: '',
      queryLimit: 18,
      limit: 18,
      offset: 0,
      total: 0,
      next: null,
      previous: null,
      size: {
        width: 0,
        height: 0
      },
    };
  },
  methods: {
    querySpotify() {
      if (this.searchQuery.length !== 0) {
        var auth = process.env.VUE_APP_SPOTIFY_AUTH_BASIC
        axios({
          method: 'post',
          url: 'https://accounts.spotify.com/api/token',
          data: data,
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        })
        .then( response => {
          axios({
            method: 'get',
            url: `https://api.spotify.com/v1/search?q=${this.searchQuery.replace(' ', '+')}&type=${this.searchType}&offset=${this.offset}&limit=${this.limit}`,
            headers: {
              'Authorization': `Bearer ${response.data.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
          })
          .then( response => {
            console.log(response.data.artists)
            this.artists = response.data.artists.items
            this.total = response.data.artists.total
          })
        }).catch( error => {
          console.log(error)
          notify(error)
        });
      }
    },
    paginateSpotify() {
      if (this.searchQuery.length !== 0 && this.artists.length !== 0) {
        var auth = process.env.VUE_APP_SPOTIFY_AUTH_BASIC
        axios({
          method: 'post',
          url: 'https://accounts.spotify.com/api/token',
          data: data,
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        })
        .then( response => {
          axios({
            method: 'get',
            url: `https://api.spotify.com/v1/search?q=${this.searchQuery.replace(' ', '+')}&type=${this.searchType}&offset=${this.offset += 18}&limit=${this.limit}`,
            headers: {
              'Authorization': `Bearer ${response.data.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
          })
          .then( response => {
            console.log(response.data.artists)
            this.artists = this.artists.concat(response.data.artists.items)
            this.total = response.data.artists.total
          })
        }).catch( error => {
          console.log(error)
          notify(error)
        });
      }
    },
    clearSearch() {
      this.artists = []
      this.total = 0
      this.offset = 0
    },
    addToCanvas(imageURL) {
      console.log(imageURL)
      axios({
        method: 'get',
        url: imageURL,
        responseType: 'arraybuffer'
      })
      .then( response => {
        var arrayBufferView = new Uint8Array( response.data );
        // send data to figma
        createImage(arrayBufferView, this.size)
      })
    }
  }
};
</script>