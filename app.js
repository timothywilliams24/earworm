const app = new Framework7({ el: '#app', theme: 'ios' });

const ACCESS_TOKEN = 'xsNf9NMW_nLYcIXH90NhsuqsUZ4W3NOTwPA_sD0H0DMvZozNE44iel7fFgE-vgoo';

const searchbar = app.searchbar.create({
  el: '.searchbar',
  customSearch: true,
  on: {
    search(sb, query) {
      if(query.length > 3) fetchGeniusDeep(query);
    }
  }
});

async function fetchGeniusDeep(query) {
  const container = document.getElementById('results-container');
  container.innerHTML = '<li class="item-content"><div class="item-inner">Searching deep...</div></li>';

  // The Secret Sauce: AllOrigins + Random Seed to bypass GitHub cache
  const target = `https://api.genius.com/search?q=${encodeURIComponent(query)}&access_token=${ACCESS_TOKEN}`;
  const finalUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}&callback=?`;

  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(target)}&_=${Date.now()}`);
    const json = await response.json();
    
    // Unpack the proxy wrapper
    const data = JSON.parse(json.contents);
    const hits = data.response.hits;

    container.innerHTML = ''; 

    if (!hits || hits.length === 0) {
      container.innerHTML = '<li class="item-content">No lyrics found.</li>';
      return;
    }

    hits.forEach(hit => {
      const s = hit.result;
      // Build the Spotify URI
      const spotifyUri = `spotify:search:${encodeURIComponent(s.title + ' ' + s.artist_names)}`;
      
      container.innerHTML += `
        <li class="song-card">
          <a href="${spotifyUri}" class="item-link item-content external">
            <div class="item-media">
              <img src="${s.song_art_image_thumbnail_url}" style="width:48px; border-radius:8px;">
            </div>
            <div class="item-inner">
              <div class="item-title">${s.title}</div>
              <div class="item-subtitle">${s.artist_names}</div>
              <div class="item-after"><i class="f7-icons" style="color:#1DB954; font-size:20px;">play in spotify</i></div>
            </div>
          </a>
        </li>`;
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<li class="item-content" style="color:#ff3b30;">Proxy Timeout. Try again in 5s.</li>';
  }
}