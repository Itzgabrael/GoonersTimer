const userPins = {
  Gabriel: "0314",
  Wisdom: "2009",
  Kelvin: "8080",
  Ezekiel: "9999"
};

const names = ["Gabriel", "Wisdom", "Kelvin", "Ezekiel"];

let data = {};
let currentUserToReset = null;

const usersDiv = document.getElementById("users");
const leaderboard = document.getElementById("leaderboard");

// ---------------- UI ----------------

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
}

function initUI() {
  usersDiv.innerHTML = "";
  names.forEach(createUserCard);
}

// ---------------- MODAL ----------------

function showConfirm(name) {
  currentUserToReset = name;

  const existing = document.getElementById("confirmModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "confirmModal";

  modal.innerHTML = `
    <div class="modal-content">
      <p>Are you sure you want to reset timer?</p>
      <button id="yesBtn">Yes</button>
      <button id="noBtn">Exit</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("yesBtn").onclick = confirmReset;
  document.getElementById("noBtn").onclick = closeModal;
}

function closeModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.remove();
  currentUserToReset = null;
}

// ---------------- RESET ----------------

function confirmReset() {
  if (!currentUserToReset) return;

  const user = data[currentUserToReset];

  const enteredPin = prompt(`Enter passcode for ${currentUserToReset}:`);

  if (enteredPin !== userPins[currentUserToReset]) {
    alert("Wrong passcode.");
    return;
  }

  const now = Date.now();
  const currentStreak = now - user.start;

  if (!user.best || currentStreak > user.best) {
    user.best = currentStreak;
  }

  user.start = Date.now();

  saveUser(currentUserToReset);
  closeModal();
}

// ---------------- TIMERS ----------------

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

// ---------------- LEADERBOARD ----------------

function updateLeaderboard() {
  leaderboard.innerHTML = "";

  const sorted = [...names].sort(
    (a, b) => (data[b]?.best || 0) - (data[a]?.best || 0)
  );

  sorted.forEach((name, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>#${index + 1} ${name}</span>
      <span>${formatTime(data[name]?.best || 0)}</span>
    `;

    if (index === 0) li.classList.add("top");

    leaderboard.appendChild(li);
  });
}

// ---------------- FIREBASE ----------------

function saveUser(name) {
  set(ref(db, "streakData/" + name), data[name]);
}

onValue(ref(db, "streakData"), snapshot => {
  const firebaseData = snapshot.val();

  if (!firebaseData) {
    data = {};

    names.forEach(name => {
      data[name] = {
        start: Date.now(),
        best: 0
      };
      saveUser(name);
    });
  } else {
    data = firebaseData;
  }

  updateTimers();
  updateLeaderboard();
});

// ---------------- THEME ----------------

const toggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") document.body.classList.add("light");

toggle.onclick = () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
};

// ---------------- UTIL ----------------

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (d > 0) return `${d}d`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

// ---------------- START ----------------

initUI();
setInterval(updateTimers, 1000);