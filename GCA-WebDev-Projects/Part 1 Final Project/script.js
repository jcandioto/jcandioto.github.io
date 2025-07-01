// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

let droplets = 0;
let misses = 0;
let pollutedRate = 0.3; // 30% polluted by default
const gameContainer = document.getElementById('game-container');

const pipe = document.getElementById('pipe');
const containerHeight = 600;
let dropletFallDuration = 3500; // Default for normal

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

// --- Update upgrade descriptions for correct passive values ---
const upgrades = [
  {
    name: "Rainwater Catchments",
    price: 1000,
    icon: "upgrade-icons/rainwater.png",
    desc: "Gutters on rooftops direct the flow of rainfall into a sanitary holding tank. (+20 Droplets per second)"
  },
  {
    name: "Hand-dug Wells",
    price: 2500,
    icon: "upgrade-icons/handdug.png",
    desc: "Skilled laborers dig up to 15 meters by hand to reach aquifers below. (+40 Droplets per second)"
  },
  {
    name: "Latrines",
    price: 5000,
    icon: "upgrade-icons/latrines.png",
    desc: "Covered shelters provide safety and privacy for bathroom users. (-10% polluted water droplet spawn rate, normal droplets now worth 200 each)"
  },
  {
    name: "Gravity-fed systems",
    price: 10000,
    icon: "upgrade-icons/gravity.png",
    desc: "The force of gravity feeds water into a community from an elevated source. (+75 Droplets per second, water drops every 1 second)"
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
    desc: "A renewable and self-sustaining system captures and safely stores pure water from a natural spring. (Droplets increase by 1.05x every 2 seconds in water delivery reports)"
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

let ownedUpgrades = Array(upgrades.length).fill(false);
let passiveDropletsPerSecond = 0;
let passiveInterval = null;
let springInterval = null; // For Spring Protections

// Use the new score area elements
const scoreDisplay = document.getElementById('score');
const dpsLabel = document.getElementById('dps-label');

// --- Calculate only passive DPS (including spring multiplier) ---
function updateDPSLabel() {
  let dps = passiveDropletsPerSecond;
  if (ownedUpgrades[6]) {
    // Spring Protections: 1.05x every 2 seconds, so average DPS is 2.5% of current droplets per second
    dps += (droplets * 0.05) / 2;
  }
  dpsLabel.textContent = `Droplets per second: ${Math.round(dps)}`;
}

// --- Update passive droplets per second and polluted rate ---
function recalculatePassiveDroplets() {
  passiveDropletsPerSecond = 0;
  if (ownedUpgrades[0]) passiveDropletsPerSecond += 20;   // Rainwater Catchments
  if (ownedUpgrades[1]) passiveDropletsPerSecond += 40;   // Hand-dug Wells
  if (ownedUpgrades[3]) passiveDropletsPerSecond += 75;   // Gravity-fed systems
  if (ownedUpgrades[5]) passiveDropletsPerSecond += 100;  // Drilled Wells
  if (ownedUpgrades[8]) passiveDropletsPerSecond += 250;  // Piped Systems

  // Polluted droplet rate upgrades
  if (ownedUpgrades[7]) {
    pollutedRate = 0.05;
  } else if (ownedUpgrades[2]) {
    pollutedRate = 0.20;
  } else {
    pollutedRate = 0.30;
  }

  // Clear previous intervals
  if (passiveInterval) clearInterval(passiveInterval);
  if (springInterval) clearInterval(springInterval);

  // Passive droplets per second
  if (passiveDropletsPerSecond > 0) {
    passiveInterval = setInterval(() => {
      if (
        !upgradesScreen.classList.contains('upgrades-visible') &&
        upgradesScreen.style.opacity !== "1"
      ) {
        droplets += passiveDropletsPerSecond;
        scoreDisplay.textContent = 'Droplets: ' + droplets;
        updateUpgradesGrid();
        updateDPSLabel();
      }
    }, 1000);
  }

  // Spring Protections: 1.05x score every 2 seconds
  if (ownedUpgrades[6]) {
    springInterval = setInterval(() => {
      if (
        !upgradesScreen.classList.contains('upgrades-visible') &&
        upgradesScreen.style.opacity !== "1"
      ) {
        droplets = Math.floor(droplets * 1.05);
        scoreDisplay.textContent = 'Droplets: ' + droplets;
        updateUpgradesGrid();
        updateDPSLabel();
      }
    }, 2000);
  }

  updateDPSLabel();
}

// Update the upgrades grid to allow purchasing and activating upgrades
function updateUpgradesGrid() {
  document.querySelectorAll('.upgrade-btn').forEach((btn, i) => {
    const upgrade = upgrades[i];
    const unlocked = droplets >= upgrade.price || ownedUpgrades[i];
    const img = btn.querySelector('img');
    const tooltip = btn.querySelector('.upgrade-tooltip');
    const price = btn.querySelector('.upgrade-price');

    if (ownedUpgrades[i]) {
      btn.classList.remove('locked');
      btn.classList.add('owned');
      img.src = upgrade.icon;
      img.alt = upgrade.name;
      tooltip.textContent = `Purchased: ${upgrade.name}\n${upgrade.desc}`;
      price.textContent = 'Owned';
      btn.disabled = true;
    } else if (unlocked) {
      btn.classList.remove('locked');
      img.src = upgrade.icon;
      img.alt = upgrade.name;
      tooltip.textContent = `${upgrade.name}: ${upgrade.desc}`;
      price.textContent = `${upgrade.price} Droplets`;
      btn.disabled = false;
      btn.onclick = function () {
        if (droplets >= upgrade.price && !ownedUpgrades[i]) {
          droplets -= upgrade.price;
          ownedUpgrades[i] = true;
          scoreDisplay.textContent = 'Droplets: ' + droplets;
          updateUpgradesGrid();
          recalculatePassiveDroplets();
          if (i === 3) setDropletInterval(); // Gravity-fed systems purchased
        }
      };
    } else {
      btn.classList.add('locked');
      img.src = 'img/padlock.png';
      img.alt = 'Locked Upgrade';
      tooltip.textContent = `Unlock at ${upgrade.price} Droplets`;
      price.textContent = '';
      btn.disabled = true;
      btn.onclick = null;
    }
  });
}

// --- Control droplet spawn interval based on upgrades ---
function setDropletInterval() {
  if (dropletInterval) clearInterval(dropletInterval);
  let interval = 1250;
  if (ownedUpgrades[3]) interval = 1000; // Gravity-fed systems
  dropletInterval = setInterval(spawnDroplet, interval);
}

const dropletSound = new Audio('sound/water.mp3');
dropletSound.preload = 'auto';

// Utility to play only the first 0.25 seconds of the sound
function playDropletSound() {
  dropletSound.currentTime = 0;
  dropletSound.play();
  setTimeout(() => {
    dropletSound.pause();
    dropletSound.currentTime = 0;
  }, 250);
}

function spawnDroplet() {
  if (misses >= 5) return; // Don't spawn if game is over

  // Decide droplet type
  const isPolluted = Math.random() < pollutedRate;
  let isGolden = false;

  // Water-purification systems upgrade (index 4): 10% chance for golden droplet
  if (!isPolluted && ownedUpgrades[4] && Math.random() < 0.10) {
    isGolden = true;
  }

  const droplet = document.createElement('div');
  if (isPolluted) {
    droplet.className = 'droplet polluted';
  } else if (isGolden) {
    droplet.className = 'droplet golden';
  } else {
    droplet.className = 'droplet';
  }
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
        // If polluted, add 50 droplets when it hits the ground, but do NOT update misses or end the game
        if (isPolluted) {
          droplets += 50;
          scoreDisplay.textContent = 'Droplets: ' + droplets;
        } else {
          misses++;
          missesLabel.textContent = 'Misses: ' + misses + '/5';
          if (misses >= 5) {
            document.querySelectorAll('.droplet').forEach(d => d.remove());
            endGame();
          }
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
    } else if (isGolden) {
      droplets += 2000;
    } else {
      // Latrines upgrade: normal droplets worth 200, otherwise use difficulty value
      droplets += ownedUpgrades[2] ? 200 : dropletBaseValue;
    }
    scoreDisplay.textContent = 'Droplets: ' + droplets;
    playDropletSound(); // Play sound on click
    droplet._removedByClick = true;
    droplet.remove();
    updateUpgradesGrid();
    updateDPSLabel();
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
  ownedUpgrades = Array(upgrades.length).fill(false);
  recalculatePassiveDroplets();
  updateUpgradesGrid();
  setDropletInterval();
  spawnDroplet();
}

function endGame() {
  if (dropletInterval) clearInterval(dropletInterval);
  if (passiveInterval) clearInterval(passiveInterval);
  if (springInterval) clearInterval(springInterval); // <-- Add this line

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
  if (passiveInterval) clearInterval(passiveInterval); // <-- Stop passive while menu open
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
    setDropletInterval();
    spawnDroplet();
    recalculatePassiveDroplets(); // <-- Resume passive after closing menu
  }
};
// --- Start Menu & Difficulty UI Logic ---
const startMenu = document.getElementById('start-menu');
const playBtn = document.getElementById('play-btn');
const diffBtn = document.getElementById('difficulty-btn');
const diffSelect = document.getElementById('difficulty-select');
const diffReturnBtn = document.getElementById('diff-return-btn');
const diffChoiceBtns = document.querySelectorAll('.diff-choice-btn');

// Hide game UI until Play is pressed
document.body.classList.add('start-menu-active');
document.getElementById('score-area').style.display = "none";
document.getElementById('game-container').style.display = "none";
document.getElementById('upgrades-area').style.display = "none";

// Show main menu on load
function showMainMenu() {
  playBtn.style.display = "";
  diffBtn.style.display = "";
  diffSelect.classList.add('difficulty-select-hidden');
  diffSelect.classList.remove('difficulty-select-visible');
}

// Show difficulty selection
function showDifficultyMenu() {
  playBtn.style.display = "none";
  diffBtn.style.display = "none";
  diffSelect.classList.remove('difficulty-select-hidden');
  diffSelect.classList.add('difficulty-select-visible');
}

// Track if difficulty has been set
let difficulty = null; // null until chosen
let dropletBaseValue = 100;

// Play button
playBtn.onclick = function() {
  // If difficulty not set, default to normal
  if (!difficulty) {
    difficulty = "normal";
    dropletBaseValue = 100;
    dropletFallDuration = 3500;
  }
  startMenu.classList.add('start-menu-hidden');
  startMenu.classList.remove('start-menu-visible');
  document.body.classList.remove('start-menu-active');
  document.getElementById('score-area').style.display = "";
  document.getElementById('game-container').style.display = "";
  document.getElementById('upgrades-area').style.display = "";
  startGame();
};

// Difficulty button
diffBtn.onclick = function() {
  showDifficultyMenu();
};

// Return button
diffReturnBtn.onclick = function() {
  showMainMenu();
};

// Difficulty choice buttons
diffChoiceBtns.forEach(btn => {
  btn.onclick = function() {
    difficulty = btn.dataset.diff;
    if (difficulty === "easy") {
      dropletBaseValue = 150;
      dropletFallDuration = 4500; // Slower on easy
    } else if (difficulty === "hard") {
      dropletBaseValue = 75;
      dropletFallDuration = 2500; // Faster on hard
    } else {
      dropletBaseValue = 100;
      dropletFallDuration = 3500; // Normal
    }
    showMainMenu();
  };
});

// Show menu on load
showMainMenu();

// --- Charity: water logo popup for mobile ---
const cwLogo = document.getElementById('cw-logo');
const cwPopupOverlay = document.getElementById('cw-popup-overlay');
const cwPopupClose = document.getElementById('cw-popup-close');

// Only enable popup on mobile
function isMobile() {
  return window.innerWidth <= 700;
}

cwLogo.addEventListener('click', function () {
  if (isMobile()) {
    // Pause game: clear intervals and remove all droplets (like upgrades button)
    if (dropletInterval) clearInterval(dropletInterval);
    if (passiveInterval) clearInterval(passiveInterval);
    // Remove all droplets and flag as removed by upgrade (so no misses)
    document.querySelectorAll('.droplet').forEach(droplet => {
      droplet._removedByUpgrade = true;
    });
    document.querySelectorAll('.droplet').forEach(droplet => {
      droplet.remove();
    });
    cwPopupOverlay.classList.add('active');
  }
});

cwPopupClose.addEventListener('click', function () {
  cwPopupOverlay.classList.remove('active');
  // Resume game only if not game over
  if (misses < 5) {
    setDropletInterval();
    spawnDroplet();
    recalculatePassiveDroplets();
  }
});

// Optional: close popup if overlay background is clicked
cwPopupOverlay.addEventListener('click', function (e) {
  if (e.target === cwPopupOverlay) {
    cwPopupOverlay.classList.remove('active');
    // Resume game only if not game over
    if (misses < 5) {
      setDropletInterval();
      spawnDroplet();
      recalculatePassiveDroplets();
    }
  }
});

// Use href to redirect instead of window.open
document.getElementById('cw-take-action-btn').onclick = function () {
  window.location.href = 'https://www.charitywater.org/donate/the-spring';
};
document.getElementById('cw-about-btn').onclick = function () {
  window.location.href = 'https://www.charitywater.org/';
};



