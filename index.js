const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
require('dotenv').config();



const app = express()

const stateKey = 'spotify_auth_state';

const generateRandomString = length =>  {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

app.use(cors({exposedHeaders: ['x-token']}));


app.get('/login', async (req, res) => {
  
  // your application requests refresh and access tokens
  // after checking the state parameter
  const { code, redirect_uri } = req.query;
  // var storedState = req.cookies ? req.cookies[stateKey] : null;

  // if (state === null || state !== storedState) {
  //  invalidate session
  // } 


    // res.clearCookie(stateKey);
    

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }), {
        headers: {
        'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
      },
    });
    const { access_token, refresh_token } = response.data;

    res.set('X-Token', access_token);
    //Use token to get user data
    const userResponse = await axios.get('https://api.spotify.com/v1/me', 
      {
        headers: { 'Authorization': 'Bearer ' + access_token }
    });
    res.json(userResponse.data);
  } catch (e) {
    console.log('TOKEN ERROR', e);
    res.sendStatus(404);
  }    
});

app.get('/playlists', async(req, res) => {
  const {token} = req.query
  res.set('X-Token', token);
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {headers: {Authorization: `Bearer ${token}`}})
    res.json(response.data)
  } catch (e) {
    console.log('PLAYLISTS ERROR', e);
    res.sendStatus(404);
  }
})

app.get('/', (req, res) => {
    res.json({
        name: "Brittany"
    })
});

app.listen(3333, () => {
    console.log("App up and running")
});