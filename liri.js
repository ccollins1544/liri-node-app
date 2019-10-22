/**
 * LIRI
 * @package liri
 * @author Christopher Collins
 * @version 2.0.0
 * @license none (public domain)
 * ===============[ TABLE OF CONTENTS ]===================
 * 0. Libraries
 *   0.1 Environments
 *   0.2 NPM
 * 
 * 1. Inputs
 *   1.1 Capture Inputs
 *   1.2 Process Inputs
 * 
 * 2. AXIOS Functions
 *   2.1 BandsInTown_Search
 *   2.2 cb_BandsInTown
 *   2.3 Spotify_Search
 *   2.4 cb_Spotify
 *   2.5 Movie_Search
 *   2.6 Movie_Plot
 *   2.7 cb_Movie 
 *   2.8 DoWhatItSays
 *   2.9 JustDoIt 
 * 
 * A. Debugging
 *   A.1 cbError
 * 
 * @todo 
 * Bonus: Append output to log.txt file
 * -Maybe use inquirer for something 
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

/** ===============[ 1. Inputs ]==================================
 * Possible Options are,
 * concert-this, spotify-this-song, movie-this, do-what-it-says
 ****************************************************************/
// 1.1 Capture Inputs
var dothis = process.argv[2];
var findthis = process.argv[3];

if (process.argv.length > 4) {
  for (var i = 4; i < process.argv.length; i++) {
    findthis += " " + process.argv[i];
  }
}

// Just Do It!
processInputs(dothis, findthis);

/**
 * 1.2 processInputs
 * @param command 
 * @param searchTerm 
 */
function processInputs(command, searchTerm) {
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
      DoWhatItSays();
      break;
  } // END switch(command)
} // processInputs 


/* ===============[ 2. AXIOS Functions ]==================*/
/**
 * 2.1 BandsInTown_Search
 * Usage: node liri.js concert-this <artist/band name here>
 * 
 * @param artistName 
 * @param response
 * @returns
 * -Name of the venue
 * -Venue location
 * -Date of Event (MM/DD/YYYY)
 */
function BandsInTown_Search(artistName, response = "events") {
  var APPID = process.env.BANDS_APPID;

  // -------------[ Build Query URL ]----------------
  var queryURL = "https://rest.bandsintown.com/artists/";
  var queryParams = {};
  queryParams.app_id = APPID;

  if (artistName !== undefined && artistName !== "") {
    artistName = encodeURI(artistName.toLowerCase().trim());
    queryURL += artistName;

    if (response === "events") {
      queryURL += "/events?";
    } else {
      queryURL += "?";
    }
  } else {
    cbError("Please enter a band!");
    return;
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
function cb_BandsInTown(response) {
  // detect empty response
  if (response.Response === "False") {
    cbError(response.Error);
    return;

  } else if (response === "") {
    cbError("Band not found!");
    return;
  }

  for (var i = 0; i < response.data.length; i++) {
    var venueName = response.data[i].venue.name;
    var venueLocation = response.data[i].venue.city + ", " + response.data[i].venue.country;
    var eventDate = moment(response.data[i].datetime).format("L");

    console.log("===========[ #" + (i + 1) + " " + eventDate + " ]====================");
    console.log("Name: " + venueName);
    console.log("Location: " + venueLocation);
    console.log("Date: " + eventDate);
    console.log("");
  }

  return;
} // END cb_BandsInTown

/**
 * 2.3 Spotify_Search
 * Usage: node liri.js spotify-this-song '<song name here>'
 * @param song 
 * @returns 
 * -Artist(s)
 * -The song's name
 * -A preview link of the song from Spotify
 * -The album that the song is from
 **/
function Spotify_Search(song) {
  var keys = require("./keys.js");
  var spotify = new Spotify(keys.spotify);

  queryParams = {};
  queryParams.type = 'track';

  if (song === undefined || song === "") {
    song = "The Sign by Ace of Base";
  }

  queryParams.query = song;
  spotify.search(queryParams, cb_Spotify);

  return;
} // END Spotify_Search

/**
 * 2.4 cb_Spotify
 * @param err 
 * @param data 
 */
function cb_Spotify(err, data) {
  if (err) {
    cbError('Error occured: ' + err);
  }

  // console.log(data);
  // fs.writeFile("songs_.js", JSON.stringify(data), function(err){
  //   if(err){
  //     cbError(err);
  //   }
  // });

  for (var i = 0; i < data.tracks.items.length; i++) {
    var Artists = "";
    for (var j in data.tracks.items[i].album.artists) {
      Artists += data.tracks.items[i].album.artists[j].name + ", ";
    }

    var SongName = data.tracks.items[i].name;
    var previewLink = data.tracks.items[i].album.external_urls.spotify;
    var Album = data.tracks.items[i].album.name;

    console.log("===========[ #" + (i + 1) + " ALBUM: " + Album + " ]====================");
    console.log("Artists: " + Artists);
    console.log("Song Name: " + SongName);
    console.log("Preview Link: " + previewLink);
    console.log("Album: " + Album);
    console.log("");
  }

  return;
} // END cb_Spotify

/**
 * 2.5 Movie_Search
 * Usage: node liri.js movie-this '<movie name here>'
 * 
 * @params movie 
 * @returns 
 * -Title of the movie.
 * -Year the movie came out.
 * -IMDB Rating of the movie.
 * -Rotten Tomatoes Rating of the movie.
 * -Country where the movie was produced.
 * -Language of the movie.
 * -Plot of the movie.
 * -Actors in the movie.
 */
function Movie_Search(movie) {
  var APIKEY = process.env.MOVIE_APIKEY;

  // -------------[ Build Query URL ]----------------
  var queryURL = "https://www.omdbapi.com/?"
  var queryParams = {};
  queryParams.apikey = APIKEY;

  if (movie === undefined || movie !== "") {
    movie = "Mr. Nobody";
  }

  queryParams.s = movie.trim();

  // Combine queryURL with queryParams
  queryURL = queryURL + jparam(queryParams);
  axios.get(queryURL).then(cb_Movie).catch(cbError);
  return;
} // END MovieSearch

/**
 * 2.6 Movie_Plot
 * @param id 
 * @param plot 
 */
function Movie_Plot(id, plot = "short") {
  var APIKEY = process.env.MOVIE_APIKEY;

  // -------------[ Build Query URL ]----------------
  var queryURL = "https://www.omdbapi.com/?"
  var queryParams = {};
  queryParams.apikey = APIKEY;

  queryParams.i = id.trim();
  queryParams.plot = plot.trim();

  // Combine queryURL with queryParams
  queryURL = queryURL + jparam(queryParams);
  axios.get(queryURL).then(cb_Movie).catch(cbError);
  return;
} // END Movie_Plot

/**
 * 2.7 cb_Movie
 * @param response
 */
function cb_Movie(response) {
  // detect empty response
  if (response.Response === "False") {
    cbError(response.Error);
    return;

  } else if (response === "") {
    cbError("Movie not found!");
    return;
  }

  if (response.data.hasOwnProperty('Search')) {
    for (var i = 0; i < response.data.Search.length; i++) {
      var _ID = response.data.Search[i].imdbID;
      Movie_Plot(_ID, "short");
    }

  } else if (response.data.hasOwnProperty('imdbID')) {
    var Title = response.data.Title;
    var Year = response.data.Year;

    console.log("===========[ " + Title + " ]====================");
    console.log("Year: " + Year);
    console.log("IMDB Rating: " + response.data.imdbRating);

    if (response.data.Ratings.length > 0) {
      for (var k in response.data.Ratings) {
        if (response.data.Ratings[k].Source.includes("Rotten")) {
          console.log(response.data.Ratings[k].Source + ": " + response.data.Ratings[k].Value);
        }
      }
    }

    console.log("Country: " + response.data.Country);
    console.log("Language: " + response.data.Language);
    console.log("Plot: " + response.data.Plot);
    console.log("Actors: " + response.data.Actors);
  }

  return;
} // END cb_Movie

/**
 * 2.8 DoWhatItSays
 * Usage: node liri.js
 * -- or --
 * node liri.js do-what-it-says
 */
function DoWhatItSays() {
  fs.readFile("random.txt", "utf8", JustDoIt);
  return;
} // END DoWhatItSays

/**
 * 2.9 JustDoIt
 * @param error 
 * @param data  
 */
function JustDoIt(error, data) {
  if (error) {
    return console.log(error);
  }

  var paramsArray = data.split(",");
  var your_wish_is_my_command = paramsArray[0];
  var riddle_me_that = paramsArray[1];

  console.log("Command: " + your_wish_is_my_command + ", SearchTerm: " + riddle_me_that);
  processInputs(your_wish_is_my_command, riddle_me_that);
  return;
} // END JustDoIt

/* ===============[ A. Debugging ]========================*/
/**
 * A.1 cbError
 */
function cbError(error) {

  if (typeof (error) !== 'object') {
    console.log(error);
    return;
  }

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log("---------------Data---------------");
    console.log(error.response.data);
    console.log("---------------Status---------------");
    console.log(error.response.status);
    console.log("---------------Status---------------");
    console.log(error.response.headers);

  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an object that comes back with details pertaining to the error that occurred.
    console.log(error.request);

  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
  }

  console.log(error.config);
  return;
} // END cbError