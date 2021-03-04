const axios = require('axios');
const qs = require('qs');
require('dotenv').config()
var data = qs.stringify({
  'grant_type': 'client_credentials'
});

const auth = process.env.VUE_APP_SPOTIFY_AUTH_BASIC

try {
  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: data,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  }).then(response => {
    console.log(`Success`)
  })
} catch(error) {
  console.error(error)
  process.exit(1);
}