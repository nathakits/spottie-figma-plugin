import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({

  state: {
    title: "Figma Plugin Vue Sample",
    playing: false,
    longpress: false,
    arraySel: [],
    size: {
      width: 800,
      height: 800
    },
  },

  mutations: {
    title: (state, value) => {
      state.title = value
    },
    playing: (state, value) => {
      state.playing = value
    },
    longpress: (state, value) => {
      state.longpress = value
    },
    arraySel: (state, value) => {
      state.arraySel = value
    },
    size: (state, value) => {
      state.size = {
        width: value.width,
        height: value.height
      }
    }
  },

  actions: {},

  getters: {
    title: state => {
      return state.title
    },
    playing: state => {
      return state.playing
    },
    longpress: state => {
      return state.longpress
    },
    arraySel: state => {
      return state.arraySel
    },
    size: state => {
      return state.size
    }
  },

});