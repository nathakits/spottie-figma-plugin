<template>
<div class="overflow-y-auto overflow-x-hidden" style="height: calc(100vh - 163px);">
  <template v-if="active_search_view !== 'new-releases'">
    <div
      v-if="active_search_array.length !== 0"
      class="grid grid-cols-3 gap-4 px-4 pt-1"
    >
      <template v-for="(item ,i) in active_search_array">
        <div v-if="item !== null" :key="i" :id="item.name ? item.name : ''">
          <!-- artists -->
          <div
            v-if="active_search_view === 'artists'"
            class="box rounded h-32 w-full relative"
            :class="item.images.length > 0 ? 'hover:opacity-50 cursor-pointer' : 'bg-green-700'"
          >
            <img
              v-if="item.images.length > 0"
              :id="item.id"
              :src="item.images[1].url"
              :alt="item.name"
              loading=lazy
              class="object-cover w-full h-full rounded"
              @click="addToCanvas(item.images[0].url), addToSelection(item.name, item.images[0].url, item.id)"
              v-longclick="() => setLongpress()"
            >
            <Icons v-else name="artist"/>
          </div>
          <!-- tracks -->
          <div
            v-else-if="active_search_view === 'tracks'"
            class="box rounded h-32 w-full relative"
            :class="item.album.images.length > 0 ? 'hover:opacity-50 cursor-pointer' : 'bg-green-700'"
          >
              <img
                v-if="item.album.images.length > 0"
                :id="item.id"
                :src="item.album.images[1].url"
                :alt="item.name"
                loading=lazy
                class="object-cover w-full h-full rounded "
                @click="handleClick(item.album.images[0].url, item.preview_url), addToSelection(item.name, item.album.images[0].url, item.id)"
                v-longclick="() => setLongpress()"
              >
              <Icons v-else name="track"/>
          </div>
          <div class="text-xs pt-1 font-semibold">{{ item.name }}</div>
          <p class="text-xs">
            <template v-for="(artist, i) in item.artists" class="text-xs">{{ i > 0 ? `, ${artist.name}` : artist.name }}</template>
          </p>
        </div>
      </template>
    </div>
    <div v-else class="flex justify-center items-center h-full">
      <div 
        class="text-center"
        style="max-width:240px"
      >
        <template v-if="active_search_view === 'artists'">
          <h1 class="text-lg pb-2 font-semibold">Search Artists</h1>
          <p class="text-xs">Get Spotify Catalog information about artists that match a keyword string.</p>
        </template>
        <template v-if="active_search_view === 'tracks'">
          <h1 class="text-lg pb-2 font-semibold">Search Tracks</h1>
          <p class="text-xs pb-1">Get Spotify Catalog information about tracks that match a keyword string and play track previews.</p>
        </template>
      </div>
    </div>
  </template>
  <template v-if="active_search_view === 'new-releases'">
    <div class="grid grid-cols-3 gap-4 px-4 pt-1">
      <!-- new releases -->
      <div v-for="(item ,i) in new_releases_array" :key="i" :id="item.name">
        <div class="box rounded h-32 w-full relative hover:opacity-50 cursor-pointer">
          <img
            v-if="item.images.length > 0"
            :id="item.id"
            :src="item.images[1].url"
            :alt="item.name"
            loading=lazy
            class="object-cover w-full h-full rounded"
            @click="addToCanvas(item.images[0].url), addToSelection(item.name, item.images[0].url, item.id)"
            v-longclick="() => setLongpress()"
          >
          <Icons v-else name="artist"/>
        </div>
        <div class="text-xs pt-1 pb-1 font-semibold">{{ item.name }}</div>
        <p class="text-xs">
          <template v-for="(artist, i) in item.artists" class="text-xs">{{ i > 0 ? `, ${artist.name}` : artist.name }}</template>
        </p>
      </div>
    </div>
  </template>
</div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex'
import { notify, createImage } from "../helpers/figma-messages";
import Icons from "./Icons.vue";

export default {
  props: {
    active_search_array: Array,
    new_releases_array: Array,
    active_search_view: String,
  },
  components: {
    Icons,
  },
  data() {
    return {
      clickCounter: 0,
      timer: null,
    }
  },
  computed: mapState({
    arraySel: 'arraySel',
    longpress: 'longpress',
    playing: 'playing'
  }),
  methods: {
    handleClick(imageURL, trackURL) {
      this.clickCounter++
      if (this.clickCounter === 1) {
        this.timer = setTimeout(() => {
          this.clickCounter = 0
          this.addToCanvas(imageURL)
        }, 200);
      } else if (this.clickCounter === 2) {
        clearTimeout(this.timer)
        this.clickCounter = 0
        if (trackURL) {
          this.playTrack(trackURL)
        } else {
          notify(`Track not available`, {timeout: 1500})
        }
      }
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
          clickObj.classList.remove('opacity-30')
          clickObj.parentElement.classList.remove('selected-blue')
        }
        else {
          // else add into array
          var select = document.getElementById(id)
          select.classList.add('opacity-30')
          select.parentElement.classList.add('selected-blue')
          this.arraySel.push(obj)
          this.$store.commit('arraySel', this.arraySel)
        }
      }
    },
    setLongpress() {
      this.$store.commit('longpress', true)
    },
    playTrack(url) {
      clearTimeout(this.timer)
      var audio = document.getElementById('audioPlayer')
      audio.src = url
      if (audio.src) {
        var playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.$store.commit('playing', true)
          }).catch((err) => {
            this.$store.commit('playing', false)
            console.log(err)
          })
        }
        audio.onended = () => {
          this.$store.commit('playing', false)
        }
      }
    },
  }
}
</script>

<style>

</style>