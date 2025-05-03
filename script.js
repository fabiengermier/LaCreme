const tagsToMatch = ["lcrp", "lacreme", "lacremerp", "la creme rp", "la creme", "la crème"];
const clientId = "t2pn7wgvgslmampkngyqjb4a7yxd6b";
const clientSecret = "l2age2j6nq3cvl76yprtvk2xoswaw0";

async function getAccessToken() {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials"
    })
  });
  const data = await res.json();
  return data.access_token;
}

async function getLiveStreams(accessToken) {
  // Get GTA V game_id
  const gameRes = await fetch("https://api.twitch.tv/helix/games?name=Grand%20Theft%20Auto%20V", {
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const gameJson = await gameRes.json();
  const gta = gameJson.data?.[0];
  if (!gta) return [];

  // Fetch multiple pages of GTA streams in FR
  let streams = [];
  let cursor = null;
  let pages = 0;
  const maxPages = 5;

  while (pages < maxPages) {
    const url = new URL("https://api.twitch.tv/helix/streams");
    url.searchParams.set("game_id", gta.id);
    url.searchParams.set("language", "fr");
    url.searchParams.set("first", "100");
    if (cursor) url.searchParams.set("after", cursor);

    const response = await fetch(url, {
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const json = await response.json();
    streams = streams.concat(json.data);
    cursor = json.pagination?.cursor;
    if (!cursor) break;
    pages++;
  }

  return streams.filter(stream => {
    const title = stream.title.toLowerCase();
    return tagsToMatch.some(tag => title.includes(tag));
  });
}

async function renderStreamers() {
  const accessToken = await getAccessToken();
  const streamers = await getLiveStreams(accessToken);

  /*
const staticUsers = ["gotaga", "kamet0", "alpha", "kotei", "baghera"].slice(0, 5);
const clips = await Promise.all(staticUsers.map(async (login) => {
  const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${login}`, {
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const userData = await userRes.json();
  const user = userData.data?.[0];
  if (!user) return null;

  const clipRes = await fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${user.id}&first=1`, {
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const clipData = await clipRes.json();
  const clip = clipData.data?.[0];
  return clip ? {
    title: clip.title,
    thumbnail_url: clip.thumbnail_url,
    url: clip.url
  } : null;
}));
*/

   document.getElementById("streamers").innerHTML = streamers.map(stream => `
    <a href="https://twitch.tv/${stream.user_name}" target="_blank" class="border bg-white rounded shadow hover:shadow-lg mp-4 w-full h-full" style="max-width:63%">
      <img src="${stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')}" class="w-[320px] h-[180px] object-cover rounded mx-auto" style="margin-top:5px;"/>
      <div class="mt-2 font-bold text-lg" style="margin-left:5px;">${stream.user_name}</div>
      <div class="text-sm text-gray-500" style="margin-left:5px;">👁️ ${stream.viewer_count} viewers</div>
      <div class="text-xs text-gray-400 mt-1" style="margin-left:5px;">${stream.title}</div>
    </a>
  `).join('');

  /*
document.getElementById("clips").innerHTML = clips.map(clip => `
  <a href="${clip.url}" target="_blank" class="border bg-white p-4 rounded shadow hover:shadow-lg">
    <img src="${clip.thumbnail_url}" alt="${clip.title}" class="w-full h-40 object-cover rounded" />
    <div class="mt-2 font-bold text-sm">${clip.title}</div>
  </a>
`).join('');
*/
}

renderStreamers();

// Add glitch effect to logo
const style = document.createElement('style');
style.innerHTML = `
  .glitch-logo {
    position: relative;
    display: inline-block;
    animation: glitch 1s infinite;
  }
  .glitch-button {
    position: relative;
    animation: glitch 1.2s infinite;
  }
  .glitch-title {
    display: inline-block;
    animation: glitch 1.5s infinite;
  }
  @keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(2px, -2px); }
    60% { transform: translate(-1px, 1px); }
    80% { transform: translate(1px, -1px); }
    100% { transform: translate(0); }
  }
`;
document.head.appendChild(style);

window.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector('header img');
  if (logo) logo.classList.add('glitch-logo');

  document.querySelectorAll('a.bg-blue-100, a.bg-indigo-100, a.bg-green-100').forEach(btn => {
    btn.classList.add('glitch-button');
  });

  document.querySelectorAll('h2').forEach(h => h.classList.add('glitch-title'));
});
