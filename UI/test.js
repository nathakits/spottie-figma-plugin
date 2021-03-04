const axios = require('axios');
const qs = require('qs');
require('dotenv').config()
var data = qs.stringify({
  'grant_type': 'client_credentials'
});

const auth = process.env.VUE_APP_SPOTIFY_AUTH_BASIC

axios({
  method: 'post',
  url: 'https://accounts.spotify.com/api/token',
  data: data,
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
}).then(response => {
  console.log(`PASS`)
  console.log(`Valid Key`)
}).catch(error => {
  process.exit(1)
})