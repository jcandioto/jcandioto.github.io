// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

let droplets = 0;
let misses = 0;
let pollutedRate = 0.3; // 30% polluted by default
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const pipe = document.getElementById('pipe');
const containerHeight = 600;
const dropletFallDuration = 3500; // ms

// Add a label for misses at the bottom of the game container
const missesLabel = document.createElement('div');
missesLabel.id = 'misses';
missesLabel.textContent = 'Misses: 0/5';
missesLabel.style.position = 'absolute';
missesLabel.style.bottom = '18px';
missesLabel.style.left = '50%';
missesLabel.style.transform = 'translateX(-50%)';
missesLabel.style.fontSize = '1.2em';
missesLabel.style.color = '#F5402C';
missesLabel.style.background = 'rgba(255,255,255,0.85)';
missesLabel.style.padding = '6px 18px';
missesLabel.style.borderRadius = '20px';
missesLabel.style.fontWeight = 'bold';
missesLabel.style.boxShadow = '0 2px 8px rgba(245,64,44,0.08)';
gameContainer.appendChild(missesLabel);

let dropletInterval = null;
let gameOverMsg = null;

// Upgrades data
const upgrades = [
  {
    name: "Rainwater Catchments",
    price: 1000,
    icon: "upgrade-icons/rainwater.png",
    desc: "Gutters on rooftops direct the flow of rainfall into a sanitary holding tank. (+5 Droplets per second)"
  },
  {
    name: "Hand-dug Wells",
    price: 2500,
    icon: "upgrade-icons/handdug.png",
    desc: "Skilled laborers dig up to 15 meters by hand to reach aquifers below. (+10 Droplets per second)"
  },
  {
    name: "Latrines",
    price: 5000,
    icon: "upgrade-icons/latrines.png",
    desc: "Covered shelters provide safety and privacy for bathroom users. (-10% polluted water droplet spawn rate)"
  },
  {
    name: "Gravity-fed systems",
    price: 10000,
    icon: "upgrade-icons/gravity.png",
    desc: "The force of gravity feeds water into a community from an elevated source. (+50 Droplets per second)"
  },
  {
    name: "Water-purification systems",
    price: 17500,
    icon: "upgrade-icons/waterpurif.png",
    desc: "Installed treatment systems remove contaminants from existing systems. (10% chance for a normal water droplet to be a golden water droplet, worth 10x the normal amount)"
  },
  {
    name: "Drilled Wells",
    price: 20000,
    icon: "upgrade-icons/drilled.png",
    desc: "A drilling team drills deep into the earth to reach fresh aquifers. (+100 Droplets per second)"
  },
  {
    name: "Spring Protections",
    price: 30000,
    icon: "upgrade-icons/spring.png",
    desc: "A renewable and self-sustaining system captures and safely stores pure water from a natural spring. (Droplets increases by 1.05x every second in water delivery reports)"
  },
  {
    name: "Biosand Filters",
    price: 40000,
    icon: "upgrade-icons/biosand.png",
    desc: "Layers of sand and microbacterial film filter out contaminants. (Further reduce polluted water droplets spawn rate by 15%)."
  },
  {
    name: "Piped Systems",
    price: 65000,
    icon: "upgrade-icons/piped.png",
    desc: "Networks of pipes supply water to different community tap stands. (+250 Droplets per second)."
  }
];

// Update upgrades grid based on droplets
function updateUpgradesGrid() {
  document.querySelectorAll('.upgrade-btn').forEach((btn, i) => {
    const upgrade = upgrades[i];
    const unlocked = droplets >= upgrade.price;
    const img = btn.querySelector('img');
    const tooltip = btn.querySelector('.upgrade-tooltip');
    const price = btn.querySelector('.upgrade-price');

    if (unlocked) {
      btn.classList.remove('locked');
      img.src = upgrade.icon;
      img.alt = upgrade.name;
      tooltip.textContent = `${upgrade.name}: ${upgrade.desc}`;
      price.textContent = `${upgrade.price} Droplets`;
      btn.disabled = false;
    } else {
      btn.classList.add('locked');
      img.src = 'img/padlock.png';
      img.alt = 'Locked Upgrade';
      tooltip.textContent = `Unlock at ${upgrade.price} Droplets`;
      price.textContent = '';
      btn.disabled = true;
    }
  });
}

function spawnDroplet() {
  if (misses >= 5) return; // Don't spawn if game is over

  // Decide droplet type
  const isPolluted = Math.random() < pollutedRate;

  const droplet = document.createElement('div');
  droplet.className = isPolluted ? 'droplet polluted' : 'droplet';
  droplet.style.top = pipe.offsetHeight + 'px';

  // Randomize slight horizontal offset for variety
  const offset = Math.random() * 40 - 20; // -20px to +20px
  droplet.style.left = `calc(50% + ${offset}px)`;

  // Animate falling
  let start = null;
  function fallStep(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const percent = Math.min(elapsed / dropletFallDuration, 1);
    droplet.style.top = (pipe.offsetHeight + percent * (containerHeight - pipe.offsetHeight - 32)) + 'px';
    if (percent < 1) {
      requestAnimationFrame(fallStep);
    } else {
      // Remove droplet if it reaches the bottom
      if (droplet.parentNode) droplet.parentNode.removeChild(droplet);
      // Only update misses if game is not already over AND not removed by upgrades
      if (misses < 5 && !droplet._removedByUpgrade && !droplet._removedByClick) {
        misses++;
        missesLabel.textContent = 'Misses: ' + misses + '/5';
        if (misses >= 5) {
          document.querySelectorAll('.droplet').forEach(d => d.remove());
          endGame();
        }
      }
    }
  }
  requestAnimationFrame(fallStep);

  // Click handler
  droplet.addEventListener('click', function(e) {
    if (isPolluted) {
      droplets -= 500;
      if (droplets < -500) {
        droplets = -500;
        scoreDisplay.textContent = 'Droplets: ' + droplets;
        endGame();
        return;
      }
    } else {
      droplets += 100;
    }
    scoreDisplay.textContent = 'Droplets: ' + droplets;
    droplet._removedByClick = true;
    droplet.remove();
    updateUpgradesGrid();
    e.stopPropagation();
  });

  gameContainer.appendChild(droplet);
}

function startGame() {
  // Reset values
  droplets = 0;
  misses = 0;
  scoreDisplay.textContent = 'Droplets: 0';
  missesLabel.textContent = 'Misses: 0/5';

  // Remove any remaining droplets and game over message
  document.querySelectorAll('.droplet').forEach(d => d.remove());
  if (gameOverMsg) {
    gameOverMsg.remove();
    gameOverMsg = null;
  }
  updateUpgradesGrid();

  // Start interval
  if (dropletInterval) clearInterval(dropletInterval);
  dropletInterval = setInterval(spawnDroplet, 1750);
  // Spawn the first droplet immediately
  spawnDroplet();
}

function endGame() {
  if (dropletInterval) clearInterval(dropletInterval);

  // Remove any previous game over message
  if (gameOverMsg) {
    gameOverMsg.remove();
    gameOverMsg = null;
  }

  // Show game over message and reset button
  gameOverMsg = document.createElement('div');
  gameOverMsg.innerHTML = `
    <div style="font-size:2em;color:#F5402C;margin-bottom:16px;">Game Over!</div>
    <div style="font-size:1.2em;margin-bottom:18px;">Final Score: ${droplets}</div>
    <button id="reset-btn" style="
      font-size:1.1em;
      background:#2E9DF7;
      color:#fff;
      border:none;
      border-radius:12px;
      padding:10px 28px;
      cursor:pointer;
      box-shadow:0 2px 8px rgba(46,157,247,0.12);
      transition:background 0.2s;
    ">Reset</button>
  `;
  gameOverMsg.style.position = 'absolute';
  gameOverMsg.style.top = '50%';
  gameOverMsg.style.left = '50%';
  gameOverMsg.style.transform = 'translate(-50%, -50%)';
  gameOverMsg.style.background = '#fff';
  gameOverMsg.style.padding = '24px 36px';
  gameOverMsg.style.borderRadius = '18px';
  gameOverMsg.style.boxShadow = '0 4px 24px rgba(245,64,44,0.12)';
  gameOverMsg.style.zIndex = '100';
  gameContainer.appendChild(gameOverMsg);

  // Attach the event listener after the button is in the DOM
  const resetBtn = gameOverMsg.querySelector('#reset-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      startGame();
    };
  }
}



// New upgrade screen functionality
const upgradesScreen = document.getElementById('upgrades-screen');
const upgradesBtn = document.getElementById('upgrades-btn');

// Show upgrades screen with animation
upgradesBtn.onclick = function() {
  if (dropletInterval) clearInterval(dropletInterval);
  // Set the flag on all droplets first
  document.querySelectorAll('.droplet').forEach(droplet => {
    droplet._removedByUpgrade = true;
  });
  // Then remove them
  document.querySelectorAll('.droplet').forEach(droplet => {
    droplet.remove();
  });
  upgradesScreen.classList.remove('upgrades-hidden');
  upgradesScreen.classList.add('upgrades-visible');
  updateUpgradesGrid();
};

// Hide upgrades screen and resume game
document.querySelector('.upgrade-x-btn').onclick = function() {
  upgradesScreen.classList.remove('upgrades-visible');
  upgradesScreen.classList.add('upgrades-hidden');
  // Resume game only if not game over
  if (misses < 5) {
    if (dropletInterval) clearInterval(dropletInterval);
    dropletInterval = setInterval(spawnDroplet, 2000);
    spawnDroplet();
  }
};

// Start the game on load
startGame();
