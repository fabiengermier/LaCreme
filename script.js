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
  const query = tagsToMatch.map(tag => `title=${encodeURIComponent(tag)}`).join('&');
  const response = await fetch(`https://api.twitch.tv/helix/streams?first=100`, {
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const json = await response.json();
  return json.data.filter(stream => {
    const title = stream.title.toLowerCase();
    return tagsToMatch.some(tag => title.includes(tag));
  });
}

async function renderStreamers() {
  const accessToken = await getAccessToken();
  const streamers = await getLiveStreams(accessToken);

  const clips = streamers.slice(0, 5).map((s, i) => ({
    title: `Clip ${i + 1} - ${s.user_name}`,
    thumbnail_url: s.thumbnail_url.replace("{width}", "320").replace("{height}", "180"),
    url: `https://twitch.tv/${s.user_name}/clip`
  }));

  document.getElementById("streamers").innerHTML = streamers.map(stream => `
    <a href="https://twitch.tv/${stream.user_name}" target="_blank" class="border bg-white p-4 rounded shadow hover:shadow-lg">
      <img src="${stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')}" class="w-full h-40 object-cover rounded" />
      <div class="mt-2 font-bold text-lg">${stream.user_name}</div>
      <div class="text-sm text-gray-500">👁️ ${stream.viewer_count} viewers</div>
      <div class="text-xs text-gray-400 mt-1">Titre: ${stream.title}</div>
    </a>
  `).join('');

  document.getElementById("clips").innerHTML = clips.map(clip => `
    <a href="${clip.url}" target="_blank" class="border bg-white p-4 rounded shadow hover:shadow-lg">
      <img src="${clip.thumbnail_url}" alt="${clip.title}" class="w-full h-40 object-cover rounded" />
      <div class="mt-2 font-bold text-sm">${clip.title}</div>
    </a>
  `).join('');
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

document.getElementById("toggleDark")?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
