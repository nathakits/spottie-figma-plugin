<template>
  <div class="h-full">
    <div class="flex items-center space-x-2 px-4">
      <div class="flex-1">
        <div class="relative focus-within:text-gray-600 text-gray-400">
          <input
            id="searchField"
            type="text"
            class="text-sm px-4 py-1 border focus:ring-gray-500 focus:border-gray-900 hover:border-gray-900 w-full border-gray-300 rounded focus:outline-none text-gray-600"
            placeholder="Search"
            v-model="searchQuery"
          >
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
    <div class="flex pb-4 space-x-2 px-4">
      <div class="flex-initial divide-gray-800">
        <div
          class="cursor-pointer"
          :class="activeSearchView === 'artists' ? 'font-bold': ''"
          @click="activeSearchView = 'artists', activeSearchArr = artists"
        >
          Artists ({{ artists.length }})
        </div>
        <hr v-if="activeSearchView === 'artists'" class="divide-solid" style="border-top-width:2px">
      </div>
      <div class="flex-initial divide-gray-800">
        <div 
          class="cursor-pointer"
          :class="activeSearchView === 'tracks' ? 'font-bold': ''"
          @click="activeSearchView = 'tracks', activeSearchArr = tracks"
        >
          Tracks ({{ tracks.length }})
        </div>
        <hr v-if="activeSearchView === 'tracks'" class="divide-solid" style="border-top-width:2px">
      </div>
    </div>
    <div v-if="activeSearchView === 'artists'" class="overflow-y-auto overflow-x-hidden" style="height: calc(100vh - 110px);">
      <div v-if="activeSearchArr.length !== 0" class="grid grid-cols-3 gap-4 px-4">
        <div v-for="(item ,i) in activeSearchArr" :key="i" :id="item.name">
          <div
            class="box bg-gray-400 rounded h-32"
            :class="item.images.length > 0 ? 'hover:opacity-50 cursor-pointer' : ''"
          >
            <template v-if="item.images.length > 0">
              <img
                :id="`${item.id}`"
                class="object-cover w-full h-full rounded h-32"
                :src="item.images[0].url"
                :alt="item.name"
                @click="addToCanvas(item.images[0].url), addToSelection(item.name, item.images[0].url, item.id)"
                v-longclick="() => setLongpress()"
              >
            </template>
          </div>
          <div class="text-xs">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div v-if="activeSearchView === 'tracks'" class="overflow-y-auto overflow-x-hidden" style="height: calc(100vh - 110px);">
      <div v-if="activeSearchArr.length !== 0" class="grid grid-cols-3 gap-4 px-4">
        <div v-for="(item ,i) in activeSearchArr" :key="i" :id="item.name">
          <div
            class="box bg-gray-400 rounded h-32"
            :class="item.album.images.length > 0 ? 'hover:opacity-50 cursor-pointer' : ''"
          >
            <template v-if="item.album.images.length > 0">
              <img
                :id="`${item.id}`"
                class="object-cover w-full h-full rounded h-32"
                :src="item.album.images[0].url"
                :alt="item.name"
                @click="addToCanvas(item.album.images[0].url), addToSelection(item.name, item.album.images[0].url, item.id)"
                v-longclick="() => setLongpress()"
              >
            </template>
          </div>
          <div class="text-xs">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 bg-white">
      <hr class="divide-solid my-2">
      <div class="flex space-x-2 h-full px-4 pb-2 justify-end	">
        <template v-if="longpress === false">
          <button
            v-if="artists.length !== total"
            class="text-sm bg-blue-200 hover:bg-blue-300 text-blue-600 border border-blue-600 py-1 px-4 rounded h-full disabled:opacity-50 flex-initial"
            @click="paginateSpotify()"
            :disabled="artists.length === 0"
          >
            Load More
          </button>
          <button
            class="text-sm bg-red-200 hover:bg-red-300 text-red-600 border border-red-600 py-1 px-4 rounded h-full disabled:opacity-50 flex-initial"
            @click="clearSearch()"
            :disabled="artists.length === 0"
          >
            Clear Search
          </button>
        </template>
         <template v-if="arraySel.length > 0">
          <button
            class="text-sm bg-blue-200 hover:bg-blue-300 text-blue-600 border border-blue-600 py-1 px-4 rounded h-full disabled:opacity-50 flex-initial"
            @click="resetLongpress()"
            :disabled="artists.length === 0"
          >
            Clear Selection ({{ arraySel.length }})
          </button>
          <button
            class="text-sm bg-red-200 hover:bg-red-300 text-red-600 border border-red-600 py-1 px-4 rounded h-full disabled:opacity-50 flex-initial"
            @click="addSelectionToCanvas()"
          >
            Insert
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { notify, createImage, createImageArray } from "../helpers/figma-messages";

var qs = require('qs');
var data = qs.stringify({
 'grant_type': 'client_credentials' 
});

export default {
  name: "SearchSpotify",
  data() {
    return {
      activeEmptyView: 'new_releases',
      emptyHeader: ['new_releases, browse_all'],
      activeSearchView: 'artists',
      searchHheader: ['artists, tracks'],
      releases: [],
      categories: [],
      activeEmptyhArr: [],
      artists: [],
      tracks: [],
      activeSearchArr: [],
      searchType: 'artist,track',
      searchQuery: '',
      queryLimit: 18,
      limit: 18,
      offset: 0,
      total: 0,
      next: null,
      previous: null,
      size: {
        width: 800,
        height: 800
      },
      arraySel: [],
      longpress: false,
    };
  },
  methods: {
    querySpotify() {
      this.arraySel = []
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
            let res = response.data
            this.artists = res.artists.items
            this.tracks = res.tracks.items
            this.total = res.artists.total

            if (this.activeSearchView === 'artists') {
               this.activeSearchArr = this.artists
            } else if (this.activeSearchView === 'tracks') {
              this.activeSearchArr = this.tracks
            }
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
            let res = response.data
            this.artists = this.artists.concat(res.artists.items)
            this.tracks = this.tracks.concat(res.tracks.items)
            this.total = res.artists.total

            if (this.activeSearchView === 'artists') {
              this.activeSearchArr = this.artists
            } else {
              this.activeSearchArr = this.tracks
            }
          })
        }).catch( error => {
          console.log(error)
          notify(error)
        });
      }
    },
    clearSearch() {
      this.artists = []
      this.tracks = []
      this.total = 0
      this.offset = 0
    },
    addToCanvas(imageURL) {
      if (this.longpress === false) {
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
    },
    addToSelection(name, url, id) {
      if (this.longpress === true) {
        var obj = {
          id: id,
          name: name,
          url: url
        }
        // check for duplicate
        var dupObj = this.arraySel.find(obj => {
          return obj.id === id
        })

        if (dupObj) {
          // if already exists then remove from array
          var index = this.arraySel.indexOf(dupObj)
          this.arraySel.splice(index, 1)
          var clickObj = document.getElementById(id)
          clickObj.classList.remove('opacity-20')
        }
        else {
          // else add into array
          var select = document.getElementById(id)
          select.classList.add('opacity-20')
          this.arraySel.push(obj)
        }        
      }
    },
    addSelectionToCanvas() {
      var imgBufferArray = []
      var promises = []

      if (this.arraySel.length > 0) {
        this.arraySel.forEach( obj => {
          promises.push(
            axios({
              method: 'get',
              url: obj.url,
              responseType: 'arraybuffer'
            })
            .then( response => {
              var arrayBufferView = new Uint8Array( response.data )
              imgBufferArray.push(arrayBufferView)
            })
          )
        })
        Promise.all(promises).then(() => {
          createImageArray(imgBufferArray, this.size)
        })
      }
    },
    setLongpress() {
      this.longpress = true;
    },
    resetLongpress() {
      this.longpress = false
      // remove all opacity classes
      var arr = document.querySelectorAll('.opacity-20')
      arr.forEach(el => {
        el.classList.remove('opacity-20')
      })
      this.arraySel = []
    }
  }
};
</script>

