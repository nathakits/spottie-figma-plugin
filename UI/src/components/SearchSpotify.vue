<template>
  <div class="h-full">
    <!-- header -->
    <div class="flex items-center space-x-2 px-4">
      <div class="relative">
        <button
          id="menuBtn"
          class="text-xs text-gray-900 hover:bg-gray-200 py-1 px-4 rounded disabled:opacity-50 h-8 focus:outline-none cursor-default"
          @click="menu = !menu"
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 12H18V10H0V12ZM0 7H18V5H0V7ZM0 0V2H18V0H0Z" fill="black"/>
          </svg>
        </button>
        <div v-show="menu" class="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-gray-900 shadow-md">
          <div id="menuList" class="py-2" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <template v-for="(item, i) in menuItems">
              <hr v-if="item.name ==='divider'" :key="i" class="my-2 opacity-30">
              <a
                v-else
                :key="i"
                :href="item.url"
                class="block px-4 py-1 text-xs text-white menuItem"
                :class="!item.url ? 'cursor-default' : 'bg-fblue'"
                role="menuitem"
              >
                <div v-if="item.name === 'GitHub Repo'" class="flex justify-between">
                  <span>{{ item.name }}</span>
                  <span>{{ version }}</span>
                </div>
                <template v-else>{{ item.name }}</template>
              </a>
            </template>
          </div>
        </div>
      </div>
      <div class="flex-1">
        <div class="relative focus-within:text-gray-600 text-gray-400">
          <input
            id="searchField"
            type="text"
            class="text-xs px-4 py-1 border focus:ring-gray-500 focus:border-gray-900 hover:border-gray-900 w-full border-gray-300 rounded focus:outline-none text-gray-600 h-8"
            placeholder="Search artists and tracks"
            v-model="searchQuery"
          >
        </div>
      </div>
      <div>
        <button
          class="text-xs bg-blue-600 text-white border border-blue-600 py-1 px-4 rounded disabled:opacity-50 h-8 cursor-default"
          :class="searchQuery.length !== 0 ? 'hover:bg-blue-700' : 'cursor-default'"
          @click="querySpotify()"
          :disabled="searchQuery.length === 0"
        >
          Search
        </button>
      </div>
    </div>
    <!-- type -->
    <hr class="divide-solid my-2">
    <div class="flex justify-between px-4">
      <div class="flex space-x-1">
        <div class="flex-initial">
          <button
            class="text-xs px-2 py-1 focus:outline-none rounded h-8 font-semibold cursor-default"
            :class="activeSearchView === 'artists' ? 'text-gray-900': 'text-gray-400 hover:text-gray-700'"
            @click="activeSearchView = 'artists', activeSearchArr = artists"
          >
            Artists
          </button>
        </div>
        <div class="flex-initial">
          <button 
            class="text-xs px-2 py-1 focus:outline-none rounded h-8 font-semibold cursor-default"
            :class="activeSearchView === 'tracks' ? 'text-gray-900': 'text-gray-400 hover:text-gray-700'"
            @click="activeSearchView = 'tracks', activeSearchArr = tracks"
          >
            Tracks
          </button>
        </div>
      </div>
      <template v-if="activeSearchView === 'tracks'">
        <div
          v-if="playing === false"
          class="text-xs px-2 py-1 focus:outline-none rounded h-8 cursor-default text-gray-500 flex items-center"
        >
          Double click on a thumbnail to play preview track
        </div>
        <button
          v-else
          @click="stopTrack()"
          class="text-xs px-2 py-1 focus:outline-none rounded h-8 cursor-default border-gray-900 text-gray-900 border"
        >
          Stop playing
        </button>
      </template>
      <audio id="audioPlayer" src=""></audio>
    </div>
    <hr class="divide-solid my-2">
    <!-- search results -->
    <div v-if="activeSearchView === 'artists'" class="overflow-y-auto overflow-x-hidden" style="height: calc(100vh - 163px);">
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
          <div class="text-xs pt-1">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div v-if="activeSearchView === 'tracks'" class="overflow-y-auto overflow-x-hidden" style="height: calc(100vh - 152px);">
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
                @dblclick="playTrack(item.preview_url)"
                @click="addToCanvas(item.album.images[0].url), addToSelection(item.name, item.album.images[0].url, item.id)"
                v-longclick="() => setLongpress()"
              >
            </template>
          </div>
          <div class="text-xs">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <!-- controls -->
    <div class="absolute bottom-0 left-0 right-0 bg-white">
      <hr class="divide-solid my-2">
      <div class="flex space-x-2 h-full px-4 pb-2 justify-end	">
        <template v-if="longpress === false">
          <button
            v-if="activeSearchArr.length !== total"
            class="text-xs text-gray-900 border border-gray-900 py-1 px-4 rounded disabled:opacity-50 flex-initial h-8 cursor-default"
            @click="paginateSpotify()"
            :disabled="activeSearchArr.length === 0"
          >
            Load More
          </button>
          <button
            class="text-xs text-gray-900 border border-gray-900 py-1 px-4 rounded disabled:opacity-50 flex-initial h-8 cursor-default"
            :class="activeSearchArr.length === 0 ? 'disabled:opacity-50' : ''"
            @click="clearSearch()"
            :disabled="activeSearchArr.length === 0"
          >
            Clear Search
          </button>
        </template>
         <template v-if="arraySel.length > 0">
          <button
            class="text-xs bg-blue-200 hover:bg-blue-300 text-blue-600 border border-blue-600 py-1 px-4 rounded disabled:opacity-50 flex-initial h-8 cursor-default"
            @click="resetLongpress()"
            :disabled="activeSearchArr.length === 0"
          >
            Clear Selection ({{ arraySel.length }})
          </button>
          <button
            class="text-xs bg-red-200 hover:bg-red-300 text-red-600 border border-red-600 py-1 px-4 rounded disabled:opacity-50 flex-initial h-8 cursor-default"
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
      // activeEmptyView: 'new_releases',
      // emptyHeader: ['new_releases, browse_all'],
      // activeEmptyhArr: [],
      // categories: [],
      activeSearchView: 'artists',
      activeSearchArr: [],
      releases: [],
      artists: [],
      tracks: [],
      searchType: 'artist,track',
      searchQuery: '',
      limit: 50,
      offset: 0,
      total: 0,
      size: {
        width: 800,
        height: 800
      },
      arraySel: [],
      longpress: false,
      menu: false,
      previewTrack: '',
      playing: false,
      version: 'V1.0.0',
      menuItems: [
        {
          name: 'GitHub Repo',
          url: 'https://github.com/nathakits/spottie-figma-plugin'
        },
        {
          name: 'divider',
          url: false
        },
        {
          name: 'Patreon',
          url: 'https://github.com/nathakits/spottie-figma-plugin'
        },
        {
          name: 'Buy Me a coffee',
          url: 'https://github.com/nathakits/spottie-figma-plugin'
        },
        {
          name: 'divider',
          url: false
        },
        {
          name: 'By Nathakit Sae-Tan',
          url: 'https://nathakits.com'
        },
        {
          name: 'Support: natdev@gmail.com',
          url: 'mailto:natdev.tan@gmail.com'
        }
      ]
    };
  },
  mounted(){
    document.addEventListener('mouseup', this.closeMenu)
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.closeMenu)
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
      this.activeSearchArr = []
      this.total = 0
      this.offset = 0
      this.searchQuery = ''
      var input = document.querySelector('input')
      input.focus()
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
    },
    closeMenu(e) {
      var menubtn = document.getElementById('menuBtn');
      var menu = document.getElementById('menuList');
      var isClickInside = menu.contains(e.target);
      var isMenuBtn = menubtn.contains(e.target)
      if (!isClickInside && !isMenuBtn) {
        this.menu = false
      } else {
        if (e.target.href) {
          this.menu = false
        }
      }
    },
    playTrack(url) {
      var audio = document.getElementById('audioPlayer')
      audio.src = url
      if (audio.src) {
        var playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.playing = true
          }).catch(() => {
            this.playing = false
            notify(`Can't play this track`)
          })
        }
        audio.onended = () => {
          this.playing = false
        }
      }
    },
    stopTrack() {
      var audio = document.getElementById('audioPlayer')
      audio.src = ''
      this.playing = false
    }
  }
};
</script>

<style>
.bg-fblue:hover {
  background-color:#18a0fb;
}
</style>