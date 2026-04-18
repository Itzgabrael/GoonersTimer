const names = ["Gabriel", "Wisdom", "Kelvin", "Ezekiel"];

let data = JSON.parse(localStorage.getItem("streakData")) || {};

const usersDiv = document.getElementById("users");
const leaderboard = document.getElementById("leaderboard");

// Initialize users
function init() {
  names.forEach(name => {
    if (!data[name]) {
      data[name] = {
        start: Date.now()
      };
    }

    createUserCard(name);
  });

  updateLeaderboard();
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
    data[name].start = Date.now();
    save();
    div.classList.add("pulse");
    setTimeout(() => div.classList.remove("pulse"), 400);
  };

  div.appendChild(title);
  div.appendChild(timer);
  div.appendChild(btn);

  usersDiv.appendChild(div);
}

// Update timers
function updateTimers() {
  names.forEach(name => {
    if (!data[name]) return;

    const now = Date.now();
    const diff = now - data[name].start;

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const el = document.getElementById(`time-${name}`);
    if (el) {
      el.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  });
}

// Leaderboard
function updateLeaderboard() {
  leaderboard.innerHTML = "";

  const sorted = [...names].sort((a, b) => {
    return data[a].start - data[b].start;
  });

  sorted.forEach(name => {
    const li = document.createElement("li");
    li.innerText = name;
    leaderboard.appendChild(li);
  });
}

function save() {
  localStorage.setItem("streakData", JSON.stringify(data));

  // 🔥 Sync to Firebase
  set(ref(db, "streakData"), data);

  updateLeaderboard();
  onValue(ref(db, "streakData"), (snapshot) => {
  const firebaseData = snapshot.val();

  if (firebaseData) {
    data = firebaseData;
    updateLeaderboard();
  }
});
}
// Theme toggle
const toggle = document.getElementById("themeToggle");

toggle.onclick = () => {
  document.body.classList.toggle("light");
};

// Run
init();
setInterval(updateTimers, 1000);