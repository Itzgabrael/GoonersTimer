const userPins = {
  Gabriel: "0314",
  Wisdom: "2009",
  Kelvin: "8080",
  Ezekiel: "9999"
};
function showConfirm(name) {
  currentUserToReset = name;

  // prevent duplicate modal
  const existing = document.getElementById("confirmModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "confirmModal";

  modal.innerHTML = `
    <div class="modal-content">
      <p>Gooners!!are you sure you want to reset timer?</p>
      <button id="yesBtn">Yes</button>
      <button id="noBtn">Exit</button>
    </div>
  `;

  document.body.appendChild(modal);

  // attach events AFTER adding to DOM
  document.getElementById("yesBtn").onclick = confirmReset;
  document.getElementById("noBtn").onclick = closeModal;
}

function closeModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) {
    modal.remove();
  }
  currentUserToReset = null;
}

function confirmReset() {
  if (!currentUserToReset) return;

  const user = data[currentUserToReset];

  // ASK FOR PIN
  const enteredPin = prompt(`Enter passcode for ${currentUserToReset}:`);

  if (enteredPin !== userPins[currentUserToReset]) {
    alert("Wrong passcode. You cannot reset this timer.");
    return;
  }

  const now = Date.now();
  const currentStreak = now - user.start;

  // save best BEFORE reset
  if (!user.best || currentStreak > user.best) {
    user.best = currentStreak;
  }

  user.start = Date.now();

  saveUser(currentUserToReset);
  closeModal();
}
const names = ["Gabriel", "Wisdom", "Kelvin", "Ezekiel"];

let data = {};

const usersDiv = document.getElementById("users");
const leaderboard = document.getElementById("leaderboard");

// Initialize users
function init() {
  names.forEach(name => {
    createUserCard(name);
  });
}

function createUserCard(name) {
  const div = document.createElement("div");
  div.classList.add("user");

  const title = document.createElement("h3");
  title.innerText = name;

  const timer = document.createElement("p");
  timer.id = `time-${name}`;

  const btn = document.createElement("button");
  btn.innerText = "Reset";
  btn.classList.add("reset");

  btn.onclick = () => {
  showConfirm(name);

  div.classList.add("pulse");
  setTimeout(() => div.classList.remove("pulse"), 400);
};
  

  div.appendChild(title);
  div.appendChild(timer);
  div.appendChild(btn);

  usersDiv.appendChild(div);
};
// Update timers
function updateTimers() {
  names.forEach(name => {
    const el = document.getElementById(`time-${name}`);

    if (!data[name] || !el) return;

    const now = Date.now();

    const current = now - data[name].start;
    const best = data[name].best || 0;

    el.innerHTML = `
      Current: ${formatTime(current)} <br/>
      Best: ${formatTime(best)}
    `;
  });
}

// Leaderboard
function updateLeaderboard() {
  leaderboard.innerHTML = "";

  const sorted = [...names].sort((a, b) => {
    return (data[b].best || 0) - (data[a].best || 0);
  });

  sorted.forEach((name, index) => {
    const li = document.createElement("li");

    const bestTime = formatTime(data[name].best || 0);

    li.innerHTML = `
      <span>#${index + 1} ${name}</span>
      <span> ${bestTime}</span>
    `;

    if (index === 0) li.classList.add("top");

    leaderboard.appendChild(li);
  });
}

function saveUser(name) {
  // save ONLY this user
  set(ref(db, "streakData/" + name), data[name]);
}
// Theme toggle
const toggle = document.getElementById("themeToggle");

toggle.onclick = () => {
  document.body.classList.toggle("light");

  //save preference
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
};
//load saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light");
} else {
  document.body.classList.remove("light"); // default dark
}
// Run
init();
updateTimers();function updateTimers() {
  names.forEach(name => {
    const el = document.getElementById(`time-${name}`);

    if (!data[name] || !el) return;

    const now = Date.now();

    const current = now - data[name].start;
    const best = data[name].best || 0;

    el.innerHTML = `
      Current: ${formatTime(current)} <br/>
      Best: ${formatTime(best)}
    `;
  });
}
init();
updateTimers();
setInterval(updateTimers, 1000);
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y`;
  if (months > 0) return `${months}mo`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
updateLeaderboard();
}
onValue(ref(db, "streakData"), (snapshot) => {
  const firebaseData = snapshot.val();

  if (!firebaseData) {
    // 🔥 FORCE CREATE DATA
    data = {};

    names.forEach(name => {
      data[name] = {
        start: Date.now(),
        best: 0
      };

      set(ref(db, "streakData/" + name), data[name]);
    });

    updateTimers();
    updateLeaderboard();
    return;
  }

  // normal flow
  data = firebaseData;

  updateTimers();
  updateLeaderboard();
});