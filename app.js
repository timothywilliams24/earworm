/* app.js - The Complete Earworm Engine */
const app = new Framework7({
  el: '#app',
  theme: 'ios',
});

// 1. CONFIG
const ACCESS_TOKEN = 'xsNf9NMW_nLYcIXH90NhsuqsUZ4W3NOTwPA_sD0H0DMvZozNE44iel7fFgE-vgoo';
const PROXY = 'https://api.allorigins.win/get?url='; // The most reliable for GitHub Pages

// 2. SEARCHBAR SETUP
const searchbar = app.searchbar.create({
  el: '.searchbar',
  customSearch: true, 
  on: {
    search(sb, query) {
      if(query.length > 2) {
        fetchFromGenius(query);
      }
    },
    clear() {
      document.getElementById('results-container').innerHTML = '';
    }
  }
});

// 3. THE CORE SEARCH LOGIC
async function fetchFromGenius(query) {
  const container = document.getElementById('results-container');
  container.innerHTML = '<li class="item-content"><div class="item-inner">Scouring lyrics...</div></li>';

  // INNOVATION: Wrap query in quotes for better phrase matching in lyrics
  const refinedQuery = `"${query}"`; 
  const targetUrl = `https://api.genius.com/search?q=${encodeURIComponent(refinedQuery)}&access_token=${ACCESS_TOKEN}`;
  const finalUrl = `${PROXY}${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(finalUrl);
    const json = await response.json();
    
    // AllOrigins wraps the data in a "contents" string
    const data = JSON.parse(json.contents);
    const hits = data.response.hits;

    container.innerHTML = ''; 

    if (hits.length === 0) {
      // Fallback to loose search if exact match fails
      return retryLooseSearch(query);
    }

    hits.forEach(hit => {
      const song = hit.result;
      renderSongCard(song.title, song.artist_names, song.song_art_image_thumbnail_url);
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = '<li class="item-content"><div class="item-inner" style="color:#ff375f">Connection lost. Check Proxy.</div></li>';
  }
}

// 4. FALLBACK SEARCH
async function retryLooseSearch(query) {
    const container = document.getElementById('results-container');
    const targetUrl = `https://api.genius.com/search?q=${encodeURIComponent(query)}&access_token=${ACCESS_TOKEN}`;
    const finalUrl = `${PROXY}${encodeURIComponent(targetUrl)}`;
    
    try {
        const response = await fetch(finalUrl);
        const json = await response.json();
        const data = JSON.parse(json.contents);
        const hits = data.response.hits;
        
        if (hits.length > 0) {
            hits.forEach(hit => renderSongCard(hit.result.title, hit.result.artist_names, hit.result.song_art_image_thumbnail_url));
        } else {
            container.innerHTML = '<li class="item-content"><div class="item-inner">No lyrics matched.</div></li>';
        }
    } catch (e) {
        container.innerHTML = '<li class="item-content"><div class="item-inner">Error in fallback search.</div></li>';
    }
}

// 5. THE UI RENDERER (Spotify Redirect)
function renderSongCard(title, artist, thumb) {
  const container = document.getElementById('results-container');
  
  const cleanTitle = title.replace(/[^\w\s]/gi, '');
  const cleanArtist = artist.replace(/[^\w\s]/gi, '');
  
  // The Spotify Deep Link
  const spotifyUrl = `spotify:search:${encodeURIComponent(cleanTitle + ' ' + cleanArtist)}`;

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
             <i class="f7-icons" style="font-size: 24px; color: #1DB954;">play_circle_fill</i>
          </div>
        </div>
      </a>
    </li>`;
  container.innerHTML += html;
}
