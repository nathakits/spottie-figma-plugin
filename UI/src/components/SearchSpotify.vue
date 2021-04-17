<template>
  <div class="h-full">
    <!-- header -->
    <div class="flex items-center space-x-2 px-4">
      <Menu/>
      <div class="flex-1">
        <div class="relative focus-within:text-gray-600 text-gray-400">
          <input
            id="searchField"
            type="text"
            class="text-xs px-4 py-1 border focus:ring-gray-500 focus:border-gray-900 hover:border-gray-900 w-full border-gray-300 rounded focus:outline-none text-gray-600 h-8"
            placeholder="Search"
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
    <div class="flex justify-between items-center px-4">
      <div class="flex space-x-1">
        <div class="flex-initial">
          <button
            class="text-xs px-2 py-1 focus:outline-none rounded h-8 font-semibold cursor-default"
            :class="activeSearchView === 'new-releases' ? 'text-gray-900': 'text-gray-400 hover:text-gray-700'"
            @click="activeSearchView = 'new-releases'"
          >
            New releases
          </button>
        </div>
        <div class="flex-initial">
          <button
            class="text-xs px-2 py-1 focus:outline-none rounded h-8 font-semibold cursor-default"
            :class="activeSearchView === 'albums' ? 'text-gray-900': 'text-gray-400 hover:text-gray-700'"
            @click="activeSearchView = 'albums', activeSearchArr = albums, setTotal(`albums`)"
          >
            Albums
          </button>
        </div>
        <div class="flex-initial">
          <button
            class="text-xs px-2 py-1 focus:outline-none rounded h-8 font-semibold cursor-default"
            :class="activeSearchView === 'artists' ? 'text-gray-900': 'text-gray-400 hover:text-gray-700'"
            @click="activeSearchView = 'artists', activeSearchArr = artists, setTotal(`artists`)"
          >
            Artists
          </button>
        </div>
        <div class="flex-initial">
          <button 
            class="text-xs px-2 py-1 focus:outline-none rounded h-8 font-semibold cursor-default"
            :class="activeSearchView === 'tracks' ? 'text-gray-900': 'text-gray-400 hover:text-gray-700'"
            @click="activeSearchView = 'tracks', activeSearchArr = tracks, setTotal(`tracks`)"
          >
            Tracks
          </button>
        </div>
      </div>
      <template v-if="activeSearchView === 'tracks'">
        <button
          v-if="playing"
          @click="stopTrack()"
          class="text-xs px-2 py-1 focus:outline-none rounded h-8 cursor-default border-gray-900 text-gray-900 border"
        >
          Stop playing
        </button>
        <audio id="audioPlayer" src=""></audio>
      </template>
      <template>
        <Icons
          id="infoIcon"
          class="relative"
          name="info"
          @mouseover.native="tooltip = true"
          @mouseleave.native="tooltip = false"
        >
          <div
            v-show="tooltip"
            class="absolute bg-gray-900 text-white flex justify-center p-2 right-7 rounded z-50 flex-col shadow"
          >
            <p class="text-xs w-max">Long press to multi-select images.</p>
            <p v-if="activeSearchView === 'tracks'" class="text-xs pt-1 w-max">Double click on a thumbnail to preview track.</p>
          </div>
        </Icons>
      </template>
    </div>
    <hr class="divide-solid my-2">
    <!-- search results -->
    <SearchResults
      :active_search_array="activeSearchArr"
      :new_releases_array="newReleasesArr"
      :active_search_view="activeSearchView"
    ></SearchResults>
    <!-- controls -->
    <div class="absolute bottom-0 left-0 right-0 bg-white">
      <hr class="divide-solid my-2">
      <div class="flex space-x-2 h-full px-4 pb-2 justify-end">
        <template v-if="activeSearchView !== 'new-releases'">
          <template v-if="longpress === false">
            <button
              class="text-xs text-gray-900 border border-gray-900 py-1 px-4 rounded disabled:opacity-50 flex-initial h-8 cursor-default"
              @click="paginateSearch()"
              :disabled="activeSearchArr.length === total"
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
          <template v-if="arraySel.length >= 0 && longpress === true">
            <button
              class="text-xs text-gray-900 border border-gray-900 py-1 px-4 rounded disabled:opacity-50 flex-initial h-8 cursor-default"
              @click="resetLongpress()"
              :disabled="activeSearchArr.length === 0"
            >
              Clear Selection ({{ arraySel.length }})
            </button>
            <button
              class="text-xs text-gray-900 border border-gray-900 py-1 px-4 rounded disabled:opacity-50 flex-initial h-8 cursor-default"
              @click="addSelectionToCanvas()"
              :disabled="arraySel.length === 0"
            >
              Insert
            </button>
          </template>
        </template>
        <template v-if="activeSearchView === 'new-releases'">
          <template>
            <button
              class="text-xs text-gray-900 border border-gray-900 py-1 px-4 rounded disabled:opacity-50 flex-initial h-8 cursor-default"
              :disabled="longpress === false"
              @click="resetLongpress()"
            >
              Clear Selection ({{ arraySel.length }})
            </button>
            <button
              class="text-xs text-gray-900 border border-gray-900 py-1 px-4 rounded disabled:opacity-50 flex-initial h-8 cursor-default"
              @click="addSelectionToCanvas()"
              :disabled="arraySel.length === 0"
            >
              Insert
            </button>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex'
import { notify, createImageArray } from "../helpers/figma-messages";
import SearchResults from "@/components/SearchResults";
import Icons from "./Icons.vue";
import Menu from "./Menu.vue"

var qs = require('qs');
var data = qs.stringify({
 'grant_type': 'client_credentials' 
});

export default {
  name: "SearchSpotify",
  components: {
    Icons,
    Menu,
    SearchResults
  },
  data() {
    return {
      activeSearchView: 'new-releases',
      activeSearchArr: [],
      newReleasesArr: [],
      albums: [],
      artists: [],
      tracks: [],
      searchType: 'album,artist,track',
      searchQuery: '',
      offset: 0,
      limit: 50,
      responseData: {
        albums: {
          total: 0
        },
        artists: {
          total: 0
        },
        tracks: {
          total: 0
        },
      },
      total: 0,
      tooltip: false
    };
  },
  mounted() {
    this.getNewReleases()
    window.addEventListener('keyup', this.enterSearch)
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.enterSearch)
  },
  watch: {
    activeSearchView() {
      // when tab changes
      // reset and exit selection mode
      this.resetLongpress()
    }
  },
  computed: mapState({
    arraySel: 'arraySel',
    longpress: 'longpress',
    playing: 'playing',
    size: 'size'
  }),
  methods: {
    enterSearch(e) {
      if (e.code === 'Enter') {
        this.querySpotify()
      }
    },
    getNewReleases() {
      this.$store.commit('arraySel', [])
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
          url: `https://api.spotify.com/v1/browse/new-releases?limit=50`,
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        })
        .then( response => {
          let res = response.data
          this.newReleasesArr = res.albums.items
        })
      }).catch( error => {
        console.log(error)
        notify(error)
      });
    },
    querySpotify() {
      this.$store.commit('arraySel', [])
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
            this.responseData = res
            this.albums = res.albums.items
            this.artists = res.artists.items
            this.tracks = res.tracks.items
            this.setData()
          })
        }).catch( error => {
          console.log(error)
          notify(error)
        });
      }
    },
    paginateSearch() {
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
            url: `https://api.spotify.com/v1/search?q=${this.searchQuery.replace(' ', '+')}&type=${this.searchType}&offset=${this.offset += 50}&limit=${this.limit}`,
            headers: {
              'Authorization': `Bearer ${response.data.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
          })
          .then( response => {
            let res = response.data
            this.responseData = res
            this.albums = this.albums.concat(res.albums.items)
            this.artists = this.artists.concat(res.artists.items)
            this.tracks = this.tracks.concat(res.tracks.items)
            this.setData()
          })
        }).catch( error => {
          console.log(error)
          notify(error)
        });
      }
    },
    setData() {
      if (this.activeSearchView === 'artists') {
          this.activeSearchArr = this.artists
          this.total = this.responseData.artists.total
      } else if (this.activeSearchView === 'tracks') {
        this.activeSearchArr = this.tracks
        this.total = this.responseData.tracks.total
      } else if (this.activeSearchView === 'albums') {
        this.activeSearchArr = this.albums
        this.total = this.responseData.albums.total
      }
    },
    setTotal(type) {
      if (this.activeSearchArr.length > 0) {
        this.total = this.responseData[type].total
      }
    },
    clearSearch() {
      this.albums = []
      this.artists = []
      this.tracks = []
      this.activeSearchArr = []
      this.total = 0
      this.offset = 0
      this.searchQuery = ''
      var input = document.querySelector('input')
      input.focus()
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
    resetLongpress() {
      this.$store.commit('longpress', false)
      // remove all opacity classes
      var borderArr = document.querySelectorAll('.selected-blue')
      borderArr.forEach(el => {
        el.classList.remove('selected-blue')
      })
      var opacityArr = document.querySelectorAll('.opacity-30')
      opacityArr.forEach(el => {
        el.classList.remove('opacity-30')
      })
      this.$store.commit('arraySel', [])
    },
    stopTrack() {
      var audio = document.getElementById('audioPlayer')
      audio.src = ''
      this.$store.commit('playing', false)
    }
  }
};
</script>

<style>
.bg-fblue:hover {
  background-color:#18a0fb;
}

.selected-blue {
  box-shadow: 0 0 0 2px #18a0fb;
}
</style>