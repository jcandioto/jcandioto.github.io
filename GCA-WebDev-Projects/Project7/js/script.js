// NASA APOD API key
const NASA_API_KEY = "5HEJz6HfCZCcolkdMTHxT7Z2W4klOQQSuPijuu21";

// DOM elements
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const getBtn = document.querySelector('.filters button');

// Fun facts array
const spaceFacts = [
  "Venus spins backwards compared to most planets.",
  "A day on Mercury is longer than its year.",
  "Neutron stars can spin at a rate of 600 rotations per second.",
  "There are more trees on Earth than stars in the Milky Way.",
  "Jupiter’s Great Red Spot is a giant storm bigger than Earth.",
  "One million Earths could fit inside the Sun.",
  "A spoonful of a neutron star weighs about a billion tons.",
  "The footprints on the Moon will be there for millions of years.",
  "Saturn could float in water because it’s mostly gas.",
  "Space is completely silent—there’s no air for sound to travel."
];

// Insert Did You Know fact above gallery
function showRandomFact() {
  let factSection = document.getElementById('space-fact');
  if (!factSection) {
    factSection = document.createElement('div');
    factSection.id = 'space-fact';
    factSection.style.background = "#fff";
    factSection.style.borderRadius = "8px";
    factSection.style.boxShadow = "0 2px 5px rgba(0,0,0,0.07)";
    factSection.style.margin = "0 0 18px 0";
    factSection.style.padding = "18px";
    factSection.style.fontSize = "1.1em";
    factSection.style.textAlign = "center";
    gallery.parentNode.insertBefore(factSection, gallery);
  }
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factSection.innerHTML = `<strong>Did You Know?</strong> ${fact}`;
}

// Modal logic
function createModal({ url, title, date, explanation }) {
  // Remove existing modal if present
  const oldModal = document.getElementById('modal-overlay');
  if (oldModal) oldModal.remove();

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 10000;

  const modal = document.createElement('div');
  modal.style.background = '#fff';
  modal.style.borderRadius = '12px';
  modal.style.maxWidth = '90vw';
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';
  modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  modal.style.padding = '24px';
  modal.style.position = 'relative';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.alignItems = 'center';
  modal.style.width = '90vw';

  // Responsive close button placement
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '12px';
  closeBtn.style.right = '18px';
  closeBtn.style.fontSize = '2em';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = '#2E9DF7';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.lineHeight = '1';
  closeBtn.style.zIndex = '2';
  // Responsive adjustment for small screens
  closeBtn.style.padding = '0';
  closeBtn.style.width = '40px';
  closeBtn.style.height = '40px';
  closeBtn.style.display = 'flex';
  closeBtn.style.alignItems = 'center';
  closeBtn.style.justifyContent = 'center';

  // Media query for portrait/small screens
  function adjustCloseBtn() {
    if (window.innerWidth < 500) {
      closeBtn.style.top = '6px';
      closeBtn.style.right = '6px';
      closeBtn.style.fontSize = '2.2em';
    } else {
      closeBtn.style.top = '12px';
      closeBtn.style.right = '18px';
      closeBtn.style.fontSize = '2em';
    }
  }
  adjustCloseBtn();
  window.addEventListener('resize', adjustCloseBtn);

  closeBtn.onclick = () => {
    overlay.remove();
    window.removeEventListener('resize', adjustCloseBtn);
  };

  const img = document.createElement('img');
  img.src = url;
  img.alt = title;
  img.style.maxWidth = '80vw';
  img.style.maxHeight = '50vh';
  img.style.borderRadius = '8px';
  img.style.marginBottom = '18px';

  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  titleEl.style.fontSize = '1.3em';
  titleEl.style.margin = '0 0 8px 0';
  titleEl.style.textAlign = 'center';

  const dateEl = document.createElement('div');
  dateEl.textContent = date;
  dateEl.style.color = '#2E9DF7';
  dateEl.style.fontWeight = 'bold';
  dateEl.style.marginBottom = '12px';

  const expl = document.createElement('p');
  expl.textContent = explanation;
  expl.style.fontSize = '1em';
  expl.style.marginTop = '8px';

  modal.appendChild(closeBtn);
  modal.appendChild(img);
  modal.appendChild(titleEl);
  modal.appendChild(dateEl);
  modal.appendChild(expl);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close modal on overlay click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.remove();
      window.removeEventListener('resize', adjustCloseBtn);
    }
  });
}

// Fetch and display images
async function fetchGallery(start, end) {
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🔄</div><p>Loading space photos…</p></div>`;
  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${start}&end_date=${end}`;
    const res = await fetch(url);
    let data = await res.json();

    // Handle error from API
    if (!Array.isArray(data)) {
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚫</div><p>Sorry, couldn't load images. Please try a different date range.</p></div>`;
      return;
    }

    // Sort by date ascending
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // If no entries at all
    if (data.length === 0) {
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚫</div><p>No entries found for this range.</p></div>`;
      return;
    }

    gallery.innerHTML = "";
    data.forEach(item => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.tabIndex = 0;

      if (item.media_type === "image") {
        // Image entry
        div.innerHTML = `
          <img src="${item.url}" alt="${item.title}" />
          <p><strong>${item.title}</strong><br>${item.date}</p>
        `;
        div.addEventListener('click', () => {
          createModal({
            url: item.hdurl || item.url,
            title: item.title,
            date: item.date,
            explanation: item.explanation
          });
        });
        div.addEventListener('keypress', (e) => {
          if (e.key === "Enter" || e.key === " ") {
            createModal({
              url: item.hdurl || item.url,
              title: item.title,
              date: item.date,
              explanation: item.explanation
            });
          }
        });
      } else if (item.media_type === "video") {
        // Video entry
        let videoThumb = '';
        // Try to get a YouTube thumbnail if possible
        if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
          // Extract YouTube video ID
          let videoId = '';
          const ytMatch = item.url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([A-Za-z0-9_\-]+)/);
          if (ytMatch && ytMatch[1]) {
            videoId = ytMatch[1];
            videoThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        }
        div.innerHTML = `
          <div class="video-thumb-wrap" style="position:relative;">
            ${videoThumb ? `<img src="${videoThumb}" alt="Video thumbnail for ${item.title}" style="width:100%;height:200px;object-fit:cover;border-radius:4px;">` : `<div style="width:100%;height:200px;display:flex;align-items:center;justify-content:center;background:#222;color:#fff;border-radius:4px;font-size:2em;">🎬</div>`}
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:3em;color:#fff;text-shadow:0 2px 8px #000;">▶</div>
          </div>
          <p><strong>${item.title}</strong><br>${item.date}</p>
        `;
        // Open modal with embedded video or link
        div.addEventListener('click', () => {
          createVideoModal({
            url: item.url,
            title: item.title,
            date: item.date,
            explanation: item.explanation
          });
        });
        div.addEventListener('keypress', (e) => {
          if (e.key === "Enter" || e.key === " ") {
            createVideoModal({
              url: item.url,
              title: item.title,
              date: item.date,
              explanation: item.explanation
            });
          }
        });
      }

      gallery.appendChild(div);
    });
  } catch (err) {
    gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚫</div><p>Error loading images. Please check your connection and try again.</p></div>`;
  }
}

// Modal for videos
function createVideoModal({ url, title, date, explanation }) {
  // Remove existing modal if present
  const oldModal = document.getElementById('modal-overlay');
  if (oldModal) oldModal.remove();

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 10000;

  const modal = document.createElement('div');
  modal.style.background = '#fff';
  modal.style.borderRadius = '12px';
  modal.style.maxWidth = '90vw';
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';
  modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  modal.style.padding = '24px';
  modal.style.position = 'relative';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.alignItems = 'center';
  modal.style.width = '90vw';

  // Responsive close button placement
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '12px';
  closeBtn.style.right = '18px';
  closeBtn.style.fontSize = '2em';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = '#2E9DF7';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.lineHeight = '1';
  closeBtn.style.zIndex = '2';
  closeBtn.style.padding = '0';
  closeBtn.style.width = '40px';
  closeBtn.style.height = '40px';
  closeBtn.style.display = 'flex';
  closeBtn.style.alignItems = 'center';
  closeBtn.style.justifyContent = 'center';

  function adjustCloseBtn() {
    if (window.innerWidth < 500) {
      closeBtn.style.top = '6px';
      closeBtn.style.right = '6px';
      closeBtn.style.fontSize = '2.2em';
    } else {
      closeBtn.style.top = '12px';
      closeBtn.style.right = '18px';
      closeBtn.style.fontSize = '2em';
    }
  }
  adjustCloseBtn();
  window.addEventListener('resize', adjustCloseBtn);

  closeBtn.onclick = () => {
    overlay.remove();
    window.removeEventListener('resize', adjustCloseBtn);
  };

  // Embed YouTube or show link
  let embed = null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // Extract YouTube video ID
    let videoId = '';
    const ytMatch = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([A-Za-z0-9_\-]+)/);
    if (ytMatch && ytMatch[1]) {
      videoId = ytMatch[1];
      embed = document.createElement('iframe');
      embed.src = `https://www.youtube.com/embed/${videoId}`;
      embed.width = "560";
      embed.height = "315";
      embed.style.maxWidth = "80vw";
      embed.style.maxHeight = "40vh";
      embed.style.border = "none";
      embed.style.borderRadius = "8px";
      embed.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      embed.allowFullscreen = true;
      embed.style.marginBottom = "18px";
    }
  }
  if (!embed) {
    // Not a YouTube video, show a link
    embed = document.createElement('a');
    embed.href = url;
    embed.target = "_blank";
    embed.rel = "noopener";
    embed.textContent = "Watch Video";
    embed.style.display = "inline-block";
    embed.style.background = "#2E9DF7";
    embed.style.color = "#fff";
    embed.style.fontWeight = "bold";
    embed.style.fontSize = "1.2em";
    embed.style.padding = "12px 28px";
    embed.style.borderRadius = "8px";
    embed.style.margin = "24px 0 18px 0";
    embed.style.textDecoration = "none";
  }

  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  titleEl.style.fontSize = '1.3em';
  titleEl.style.margin = '0 0 8px 0';
  titleEl.style.textAlign = 'center';

  const dateEl = document.createElement('div');
  dateEl.textContent = date;
  dateEl.style.color = '#2E9DF7';
  dateEl.style.fontWeight = 'bold';
  dateEl.style.marginBottom = '12px';

  const expl = document.createElement('p');
  expl.textContent = explanation;
  expl.style.fontSize = '1em';
  expl.style.marginTop = '8px';

  modal.appendChild(closeBtn);
  modal.appendChild(embed);
  modal.appendChild(titleEl);
  modal.appendChild(dateEl);
  modal.appendChild(expl);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close modal on overlay click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.remove();
      window.removeEventListener('resize', adjustCloseBtn);
    }
  });
}

// Setup date pickers (from dateRange.js)
setupDateInputs(startInput, endInput);

// Show a random fact on load
showRandomFact();

// Initial gallery load
fetchGallery(startInput.value, endInput.value);

// Update gallery on button click
getBtn.addEventListener('click', () => {
  fetchGallery(startInput.value, endInput.value);
});

// Keyboard navigation for date inputs
[startInput, endInput].forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const startDate = startInput.value;
      const endDate = endInput.value;
      // Simple date validation
      if (new Date(startDate) > new Date(endDate)) {
        alert("Start date must be before end date.");
        return;
      }
      fetchGallery(startDate, endDate);
    }
  });
});

// Auto-focus on first load
window.addEventListener('load', () => {
  startInput.focus();
});
