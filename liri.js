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
 *   0.3 Logging 
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
 * -Maybe use inquirer for something 
 * 
 * node liri.js concert-this "Mayday Parade"
 * node liri.js spotify-this-song "You be the anchor that keeps my feet on the ground, I'll be the wings that keep your heart in the clouds"
 * node liri.js spotify-this-song "I'd hate to be you when people find out what this song is about"
 **********************************************************/
/* ===============[ 0. Libraries ]========================*/
// 0.1 Environments
require("dotenv").config();

// 0.2 NPM
const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
const jparam = require("jquery-param");
const Spotify = require("node-spotify-api");
const log4js = require('log4js');
// const inquirer = require("inquirer");

/**
 * 0.3 Logging 
 * Note: doesn't work with console.log but can be called with logger
 * and will append to a log file called 'log.txt'. 
 * 
 * Usage in order of each log level includes the one below it, 
 * logger.trace('Entering cheese testing');
 * logger.debug('Debug messages will be logged on debug level.');
 * logger.info('Info messages will be logged on debug level.');
 * logger.warn('Warn messages will be logged on debug level.');
 * logger.error('Will be logged on error level.');
 * logger.fatal('Will be logged on error level.');
 */
log4js.configure({
  appenders: {
    everything: {
      type: 'file',
      filename: 'log.txt',
      maxLogSize: 15000000, // 15000000 Bytes = 15 megabytes
      backups: 3, 
      compress: true 
    }
  },
  categories: {
    default: {
      appenders: ['everything'],
      level: 'debug'
    }
  }
});

// Initialize logger
const logger = log4js.getLogger();

/** ===============[ 1. Inputs ]==================================
 * Possible Options are,
 * concert-this, spotify-this-song, movie-this, do-what-it-says
 ****************************************************************/
// 1.1 Capture Inputs
var dothis = process.argv[2];
var findthis = process.argv[3];

if (process.argv.length > 4) {
  findthis += " ";
  findthis += process.argv.splice(4).join(" ");
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

    case 'do-what-it-says':
      DoWhatItSays();
      break;

    default:
      var this_file = process.argv[1].split("\\").pop();
      console.log('\r\nPlease input parameters in the following formats:');
      console.log('node ' + this_file + ' concert-this "<artist-name>"');
      console.log('node ' + this_file + ' spotify-this-song "<song-name>"');
      console.log('node ' + this_file + ' movie-this "<movie-name>"');
      console.log('node ' + this_file + ' do-what-it-says');
      console.log('\r\nThe last one will read in the file random.txt and do what it says.');

      logger.warn('\r\nPlease input parameters in the following formats:');
      logger.warn('node ' + this_file + ' concert-this "<artist-name>"');
      logger.warn('node ' + this_file + ' spotify-this-song "<song-name>"');
      logger.warn('node ' + this_file + ' movie-this "<movie-name>"');
      logger.warn('node ' + this_file + ' do-what-it-says');
      logger.warn('\r\nThe last one will read in the file random.txt and do what it says.');
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

  if (findthis !== undefined) {
    console.log("\r\nThe next 7 upcoming concerts for " + findthis + " are as follows...");
    logger.info("\r\nThe next 7 upcoming concerts for " + findthis + " are as follows...");
  }

  var nextSeven = (response.data.length > 7) ? 7 : response.data.length;
  for (var i = 0; i < nextSeven; i++) {
    var lineup = response.data[i].lineup.join(', ');
    var venueName = response.data[i].venue.name;
    var venueLocation = response.data[i].venue.city + ", " + response.data[i].venue.country;
    var eventDate = moment(response.data[i].datetime).format("L");

    console.log("===========[ #" + (i + 1) + " " + eventDate + " ]====================");
    console.log("Artist Linup: " + lineup);
    console.log("Venue Name: " + venueName);
    console.log("Location: " + venueLocation);
    console.log("Date: " + eventDate + "\r\n");

    logger.info("===========[ #" + (i + 1) + " " + eventDate + " ]====================");
    logger.info("Artist Linup: " + lineup);
    logger.info("Venue Name: " + venueName);
    logger.info("Location: " + venueLocation);
    logger.info("Date: " + eventDate + "\r\n");
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
    findthis = song;
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

  if (findthis !== undefined) {
    console.log("Searching for: " + findthis + "\r\n");
    logger.info("Searching for: " + findthis + "\r\n");
  }

  var nextSeven = (data.tracks.items.length > 7) ? 7 : data.tracks.items.length;
  for (var i = 0; i < nextSeven; i++) {
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
    console.log("Album: " + Album + "\r\n");

    logger.info("===========[ #" + (i + 1) + " ALBUM: " + Album + " ]====================");
    logger.info("Artists: " + Artists);
    logger.info("Song Name: " + SongName);
    logger.info("Preview Link: " + previewLink);
    logger.info("Album: " + Album + "\r\n");
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

  if (movie === undefined || movie === "") {
    movie = "Mr. Nobody";
    findthis = movie;
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
    var nextFive = (response.data.Search.length > 5) ? 5 : response.data.Search.length;
    console.log("NOTE: We'll only return up to " + nextFive + " results maximum.");
    logger.info("NOTE: We'll only return up to " + nextFive + " results maximum.");

    if (findthis !== undefined) {
      console.log("Searching for Movie: " + findthis + "\r\n");
      logger.info("Searching for Movie: " + findthis + "\r\n");
    }

    for (var i = 0; i < nextFive; i++) {
      var _ID = response.data.Search[i].imdbID;
      Movie_Plot(_ID, "short");
    }

  } else if (response.data.hasOwnProperty('imdbID')) {
    var Title = response.data.Title;
    var Year = response.data.Year;

    console.log("===========[ " + Title + " ]====================");
    console.log("Year: " + Year);
    console.log("IMDB Rating: " + response.data.imdbRating);
   
    logger.info("===========[ " + Title + " ]====================");
    logger.info("Year: " + Year);
    logger.info("IMDB Rating: " + response.data.imdbRating);

    if (response.data.Ratings.length > 0) {
      for (var k in response.data.Ratings) {
        if (response.data.Ratings[k].Source.includes("Rotten")) {
          console.log(response.data.Ratings[k].Source + ": " + response.data.Ratings[k].Value);
          logger.info(response.data.Ratings[k].Source + ": " + response.data.Ratings[k].Value);
        }
      }
    }

    console.log("Country: " + response.data.Country);
    console.log("Language: " + response.data.Language);
    console.log("Plot: " + response.data.Plot);
    console.log("Actors: " + response.data.Actors + "\r\n");

    logger.info("Country: " + response.data.Country);
    logger.info("Language: " + response.data.Language);
    logger.info("Plot: " + response.data.Plot);
    logger.info("Actors: " + response.data.Actors + "\r\n");
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
    logger.error(error);
    return console.log(error);
  }

  var paramsArray = data.split(",");
  var your_wish_is_my_command = paramsArray[0];
  var riddle_me_that = paramsArray[1];
  findthis = riddle_me_that;

  console.log("Command: " + your_wish_is_my_command + "\r\nSearchTerm: " + riddle_me_that);
  logger.info("Command: " + your_wish_is_my_command + "\r\nSearchTerm: " + riddle_me_that);
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

    logger.error("---------------Data---------------");
    logger.error(error.response.data);
    logger.error("---------------Status---------------");
    logger.error(error.response.status);
    logger.error("---------------Status---------------");
    logger.error(error.response.headers);

  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an object that comes back with details pertaining to the error that occurred.
    console.log(error.request);
    logger.fatal(error.request);

  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
    logger.fatal("Error", error.message);
  }

  console.log(error.config);
  logger.fatal(error.config);
  return;
} // END cbError