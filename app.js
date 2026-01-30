/* app.js - Optimized for Private Cloudflare Proxy */
const app = new Framework7({
  el: '#app',
  theme: 'ios',
});

// 1. CONFIG
const MY_PROXY = 'https://genius-proxy.timothywilliams-2410.workers.dev/?url='; 
const TOKEN = 'xsNf9NMW_nLYcIXH90NhsuqsUZ4W3NOTwPA_sD0H0DMvZozNE44iel7fFgE-vgoo';

// 2. SEARCHBAR LOGIC (This triggers the search!)
const searchbar = app.searchbar.create({
  el: '.searchbar',
  customSearch: true, 
  on: {
    search(sb, query) {
      if(query.length > 2) {
        console.log("Searching for:", query);
        fetchFromGenius(query);
      }
    },
    clear() {
      document.getElementById('results-container').innerHTML = '';
    }
  }
});

// 3. THE CORE ENGINE
async function fetchFromGenius(query) {
  const container = document.getElementById('results-container');
  container.innerHTML = '<li class="item-content"><div class="item-inner">Scouring Private Cloud...</div></li>';

  // INNOVATION: Search for "Query" in quotes for better matches
  const target = `https://api.genius.com/search?q=${encodeURIComponent('"' + query + '"')}&access_token=${TOKEN}`;
  
  try {
    const response = await fetch(`${MY_PROXY}${encodeURIComponent(target)}`);
    const data = await response.json(); 
    const hits = data.response.hits;

    container.innerHTML = ''; 

    if (!hits || hits.length === 0) {
      container.innerHTML = '<li class="item-content"><div class="item-inner">No lyrics matched.</div></li>';
      return;
    }

    hits.forEach(hit => {
      renderSongCard(hit.result.title, hit.result.artist_names, hit.result.song_art_image_thumbnail_url);
    });

  } catch (error) {
    console.error("Final Error:", error);
    container.innerHTML = '<li class="item-content"><div class="item-inner" style="color:#ff375f">Connection Error. Check Proxy URL.</div></li>';
  }
}

// 4. THE UI RENDERER
function renderSongCard(title, artist, thumb) {
  const container = document.getElementById('results-container');
  const cleanTitle = title.replace(/[^\w\s]/gi, '');
  const cleanArtist = artist.replace(/[^\w\s]/gi, '');
  
  // Spotify Deep Link
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