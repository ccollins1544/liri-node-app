# Liri Node App

This app will return search results for upcoming concerts, song info from spotify, and movie info from IMDB. We can also run a pre-defined search stored in random.txt using "do-what-it-says" action. 

## Usage Instructions
In order for the app to know what action you want you must enter the actions in the following format, 
```
node liri.js concert-this "<artist-name>"
node liri.js spotify-this-song "<song-name>"
node liri.js movie-this "<movie-name>"
node liri.js do-what-it-says
```
**NOTE:** The *"* quotations are not required but if you're results have a *'* quotes you'll need to escape it like `\'`. For example if you wanted to search spotify for the song *What's My Age Again?* then you would need to enter it like this, 
```
node liri.js spotify-this-song What\'s My Age Again?
```
Or if you don't want to worry about the escape character _\\_ just use *"* 
```
node liri.js spotify-this-song "What's My Age Again?"
```

### Screenshots 

## Installation 
In order to use the app you will need to download and install a few things. 
1. Download and install [Git for Windows](https://gitforwindows.org/)
2. Download and install [NodeJS](https://nodejs.org/en/download/)
3. Download this repository by opening **Git For Windows** and running,
```
git clone https://github.com/ccollins1544/liri-node-app.git
```
4. After running the above command you'll need to *cd* into the directory like this,
```
cd liri-node-app
```
5. Once you're in the application directory we need to setup NPM by entering the command,
```
npm init
```
and then do,
```
npm install
```
If those two commands ran with no errors you're all set! See the [Usage Instructions](#usage-instructions) above. 

### Programs and Libraries Used
* [Git for Windows](https://gitforwindows.org/)
* [NodeJS](https://nodejs.org/en/download/)
* [Spotify API](https://developer.spotify.com/documentation/web-api/)
* [Bands In Town API](https://artists.bandsintown.com/support/bandsintown-api)
* [OMDb API](http://www.omdbapi.com/)
* NPM [Node Spotify API](https://www.npmjs.com/package/node-spotify-api)
* NPM [Axios](https://www.npmjs.com/package/axios)
* NPM [jQuery Param](https://www.npmjs.com/package/jquery-param)
* NPM [File System](https://www.npmjs.com/package/file-system)
* NPM [Moment](https://www.npmjs.com/package/moment)
* NPM [Log4JS](https://www.npmjs.com/package/log4js)

### Credit
* [Christopher Collins](https://ccollins.io) *Lead Developer*