/* app.js - The Complete Earworm Engine */
const app = new Framework7({
  el: '#app',
  theme: 'ios',
});

/* app.js - The "Unstoppable" Edition */

// 1. CONFIG
const ACCESS_TOKEN = 'xsNf9NMW_nLYcIXH90NhsuqsUZ4W3NOTwPA_sD0H0DMvZozNE44iel7fFgE-vgoo';

// 2. THE ROTATOR LOGIC
async function fetchWithFailover(query) {
  const targetUrl = `https://api.genius.com/search?q=${encodeURIComponent(query)}&access_token=${ACCESS_TOKEN}`;
  
  // Strategy 1: AllOrigins (Returns JSON inside "contents")
  try {
    console.log("Trying Proxy 1 (AllOrigins)...");
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`); // Timestamp prevents caching
    const json = await res.json();
    const data = JSON.parse(json.contents); // Unpack the wrapper
    return data.response.hits;
  } catch (e) {
    console.warn("Proxy 1 failed, switching to Proxy 2...");
  }

  // Strategy 2: CorsProxy.io (Direct Pass-through)
  try {
    console.log("Trying Proxy 2 (CorsProxy)...");
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
    const data = await res.json();
    return data.response.hits;
  } catch (e) {
    console.warn("Proxy 2 failed, switching to Proxy 3...");
  }

  // Strategy 3: ThingProxy (Backup)
  try {
    console.log("Trying Proxy 3 (ThingProxy)...");
    const res = await fetch(`https://thingproxy.freeboard.io/fetch/${targetUrl}`);
    const data = await res.json();
    return data.response.hits;
  } catch (e) {
    throw new Error("All proxies exhausted.");
  }
}

// 3. YOUR MAIN FUNCTION
async function fetchFromGenius(query) {
  const container = document.getElementById('results-container');
  container.innerHTML = '<li class="item-content"><div class="item-inner">Scouring the web...</div></li>';

  try {
    // INNOVATION: Search for "Query" in quotes for better matches
    const refinedQuery = `"${query}"`; 
    const hits = await fetchWithFailover(refinedQuery); // Calls our new Rotator

    container.innerHTML = ''; 

    if (!hits || hits.length === 0) {
      container.innerHTML = '<li class="item-content"><div class="item-inner">No lyrics matched.</div></li>';
      return;
    }

    hits.forEach(hit => {
      const song = hit.result;
      renderSongCard(song.title, song.artist_names, song.song_art_image_thumbnail_url);
    });

  } catch (error) {
    console.error("Final Error:", error);
    container.innerHTML = '<li class="item-content"><div class="item-inner" style="color:#ff375f">Network busy. Try again in 10s.</div></li>';
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
