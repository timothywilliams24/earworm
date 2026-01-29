const app = new Framework7({
  el: '#app',
  theme: 'ios',
});

// 1. YOUR GENIUS CONFIG
const ACCESS_TOKEN = 'xsNf9NMW_nLYcIXH90NhsuqsUZ4W3NOTwPA_sD0H0DMvZozNE44iel7fFgE-vgoo'; 
const PROXY = 'https://corsproxy.io/?';  // Bypasses browser security blocks

/* app.js */

// 1. Better Proxy for GitHub Pages



async function fetchFromGenius(query) {
  const container = document.getElementById('results-container');
  container.innerHTML = '<li class="item-content"><div class="item-inner">Searching lyrics...</div></li>';

  try {
    // We encode the URI to ensure special characters don't break the link
    const url = `${PROXY}${encodeURIComponent(`https://api.genius.com/search?q=${query}&access_token=${ACCESS_TOKEN}`)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    const hits = data.response.hits;

    container.innerHTML = ''; 

    if (hits.length === 0) {
      container.innerHTML = '<li class="item-content"><div class="item-inner">No lyrics matched.</div></li>';
      return;
    }

    hits.forEach(hit => {
      const song = hit.result;
      renderSongCard(song.title, song.artist_names, song.song_art_image_thumbnail_url, song.url);
    });

  } catch (error) {
    console.error(error);
    // If you see this message, the proxy or the token is the culprit
    container.innerHTML = `<li class="item-content"><div class="item-inner" style="color:#ff375f">API Error: Check Token or Refresh</div></li>`;
  }
}

// 2. Initialize Searchbar with customSearch enabled
const searchbar = app.searchbar.create({
  el: '.searchbar',
  customSearch: true, // IMPORTANT: Tells F7 NOT to look for a local list
  on: {
    search(sb, query) {
      if(query.length > 2) {
        console.log("Searching Genius for:", query);
        fetchFromGenius(query);
      }
    },
    clear() {
      document.getElementById('results-container').innerHTML = '';
    }
  }
});

/* app.js - Optimized for Lyric Matching */

async function fetchFromGenius(query) {
  const container = document.getElementById('results-container');
  container.innerHTML = '<li class="item-content"><div class="item-inner">Scouring lyrics...</div></li>';

  try {
    // INNOVATION: Wrap query in quotes for better phrase matching in lyrics
    const refinedQuery = `"${query}"`; 
    const url = `${PROXY}https://api.genius.com/search?q=${encodeURIComponent(refinedQuery)}&access_token=${ACCESS_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    const hits = data.response.hits;

    container.innerHTML = ''; 

    if (hits.length === 0) {
      // DEVIL'S ADVOCATE: If no exact match, try a loose search as a backup
      return retryLooseSearch(query);
    }

    hits.forEach(hit => {
      const song = hit.result;
      renderSongCard(song.title, song.artist_names, song.song_art_image_thumbnail_url, song.url);
    });

  } catch (error) {
    container.innerHTML = '<li class="item-content"><div class="item-inner">Connection lost. Check Proxy.</div></li>';
  }
}

// Backup function if the exact phrase is too specific
async function retryLooseSearch(query) {
    const container = document.getElementById('results-container');
    const url = `${PROXY}https://api.genius.com/search?q=${encodeURIComponent(query)}&access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    const hits = data.response.hits;
    
    if (hits.length > 0) {
        hits.forEach(hit => renderSongCard(hit.result.title, hit.result.artist_names, hit.result.song_art_image_thumbnail_url, hit.result.url));
    } else {
        container.innerHTML = '<li class="item-content"><div class="item-inner">No lyrics matched.</div></li>';
    }
}

/* app.js - Optimized for Spotify Redirection */

function renderSongCard(title, artist, thumb) {
  const container = document.getElementById('results-container');
  
  // 1. Clean up the strings for the URL (remove special characters)
  const cleanTitle = title.replace(/[^\w\s]/gi, '');
  const cleanArtist = artist.replace(/[^\w\s]/gi, '');
  
  // 2. Create the Spotify Deep Link
  // This format opens the Spotify App and searches for the song
  const spotifyUrl = `spotify:search:${encodeURIComponent(cleanTitle + ' ' + cleanArtist)}`;
  
  // 3. Create a Web Fallback for users without the app
  const webFallback = `https://open.spotify.com/search/${encodeURIComponent(cleanTitle + ' ' + cleanArtist)}`;

  const html = `
    <li class="song-card">
      <a href="${spotifyUrl}" class="item-link item-content external">
        <div class="item-media">
          <img src="${thumb}" style="width:48px; height:48px; border-radius:8px;">
        </div>
        <div class="item-inner">
          <div class="item-title">${title}</div>
          <div class="item-subtitle" style="color:#8e8e93;">${artist}</div>
          <div class="item-after">
             <i class="f7-icons" style="font-size: 20px; color: #1DB954;"></i>
          </div>
        </div>
      </a>
    </li>`;
  container.innerHTML += html;
}
