/**
 * LIRI
 * @package liri
 * @author Christopher Collins
 * @version 1.1.0
 * @license none (public domain)
 * 
 * ===============[ TABLE OF CONTENTS ]===================
 * 0. Libraries
 *   0.1 Environments
 *   0.2 NPM
 *   0.3 Keys
 * 
 * 1. Capture Input
 * 
 * 2. AXIOS Functions
 *   2.1 BandsInTown_Search
 *   2.2 cb_BandsInTown
 *   2.3 Spotify_Search
 *   2.4 cb_Spotify
 *   2.5 Movie_Search
 *   2.6 cb_Movie 
 *   2.7 DoWhatItSays
 *   2.8 cb_DoIt 
 *   2.9 cbError
 * 
 * A. Debugging
 * 
 * NOTES: Bonus
 * -Append output to log.txt file
 * 
 **********************************************************/
/* ===============[ 0. Libraries ]========================*/
// 0.1 Environments
require("dotenv").config();

// 0.2 NPM
const axios = require("axios");
const fs = require("fs");
const inquirer = require("inquirer");
const moment = require("moment");
const jparam = require("jquery-param");
const Spotify = require("node-spotify-api");

// 0.3 Keys
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);

/* ===============[ 1. Capture Input ]====================*/
// command: concert-this, spotify-this-song, movie-this, do-what-it-says
var command = process.argv[2];
var searchTerm = process.argv[3];

if(process.argv.length > 4){
  for (var i=4; i < process.argv.length; i++){
    searchTerm += " " + process.argv[i];
  }
}

switch (command) {
  case 'concert-this':
    BandsInTown_Search(searchTerm);
    break;

  case 'spotify-this-song':
    Spotify_Search(searchTerm);
    break;
    
  case 'movie-this':
    Movie_Search(searchTerm);
    break;

  default:
    DoWhatItSays(searchTerm);
    break;
} // END switch(command)


/* ===============[ 2. AXIOS Functions ]==================*/
/**
 * 2.1 BandsInTown_Search
 * Usage: node liri.js concert-this <artist/band name here>
 * 
 * @param artistName
 * @returns
 * Name of the venue
 * Venue location
 * Date of Event (MM/DD/YYYY)
 */
//https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp
function BandsInTown_Search(artistName, response="events"){
  var APPID = process.env.BANDS_APPID;
  
  // -------------[ Build Query URL ]----------------
  var queryURL = "https://rest.bandsintown.com/artists/";
  var queryParams = {};
  queryParams.app_id = APPID;

  if(artistName !== undefined && artistName !== ""){
    artistName = encodeURI(artistName.toLowerCase().trim());
    queryURL += artistName;

    if( response === "events" ){
      queryURL += "/events?";
    }else{
      queryURL += "?";
    }
  }

  // Combine queryURL with queryParams
  queryURL = queryURL + jparam(queryParams);
  axios.get(queryURL).then(cb_BandsInTown).catch(cbError);

  return;
} // END BandsInTown_Search

/**
 * 2.2 cb_BandsInTown
 * @param response
 */
function cb_BandsInTown(response){
  // detect empty response
  if (response === "" ) { console.log("band not found!"); return; }
  // console.log(response);

  var nextFive = (response.data.length > 5) ? 5 : response.data.length;
  for (var i=0; i < nextFive; i++){
    // console.log(response.data[i]);
    var venueName = response.data[i].venue.name;
    var venueLocation = response.data[i].venue.city + ", " + response.data[i].venue.country;
    var eventDate = moment(response.data[i].datetime).format("L");
    
    console.log("===========[ VENUE "+(i + 1)+" ]====================");
    console.log("Name: "     + venueName);
    console.log("Location: " + venueLocation);
    console.log("Date: "     + eventDate);
    
  }
  return;
} // END cb_BandsInTown

/**
 * 2.3 Spotify_Search
 * Usage: node liri.js spotify-this-song '<song name here>'
 **/
function SpotifySearch(){

  return;
} // END Spotify_Search

/**
 * 2.4 cb_Spotify
 * @param response 
 */
function cb_Spotify(response){
  console.log(response);
  return;
} // END cb_Spotify

/**
 * 2.5 Movie_Search
 * Usage: node liri.js movie-this '<movie name here>'
 **/
function Movie_Search(){

  return;
} // END MovieSearch

/**
 * 2.6 cb_Movie
 * @param response
 */
function cb_Movie(response){
  console.log(response);
  return;
} // END cb_Movie

/**
 * 2.7 DoWhatItSays
 * Usage: node liri.js do-what-it-says
 **/
function DoWhatItSays(){
  
  return;
} // END DoWhatItSays

/**
 * 2.8 cb_DoIt
 * @param response 
 */
function cb_DoIt(response){
  console.log(response);
  return;
} // END cb_DoIt

/**
 * 2.9 cbError
 */
function cbError(error){
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log("---------------Data---------------");
    console.log(error.response.data);
    console.log("---------------Status---------------");
    console.log(error.response.status);
    console.log("---------------Status---------------");
    console.log(error.response.headers);

  } else if(error.request){
    // The request was made but no response was received
    // `error.request` is an object that comes back with details pertaining to the error that occurred.
    console.log(error.request);

  } else{
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
  }

  console.log(error.config);
  return;
} // END cbError

/* ===============[ A. Debugging ]========================*/
