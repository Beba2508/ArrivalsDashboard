const apartmentsToday = [
  "VILLA LIDIJA", "101", "201", "BEATRICE", "DT1", "ZS2", "ZT2", "DP2",
  "RM2", "CR08", "CR07", "CR19", "CR21", "CS1", "HG7A", "ZP12", "DL1",
  "CR48", "CR60", "VILLA MILLA", "BRONZEES III", "AUDREY"
];

const apartmentsTomorrow = [
  "301", "ZS5", "ZP6", "ZJ1", "ZA1", "RS1", "RM4", "RM01", "RD1", "RM7",
  "CR05", "CR12", "CR26", "HG10A", "HG13A", "ZV1", "ZP1", "RB3", "CS3",
  "CS9", "CS7", "RF1", "CR56", "ZD6", "ZD7", "RC8", "RC6", "EVIE"
];

const villas = ["VILLA MILLA", "VILLA MILA", "VILLA NIKA", "VILLA PRIMA", "VILLA LIDIJA", "VILLA TIE VIŽINADA", "VILLA SECONDA", "BRONZEES"];
const sunny = ["AUDREY", "KANTRIDA", "CLOUD 9", "EVIE"];

function getDestination(prefix) {
  const clean = prefix.replace(/\s*III|\s*II|\s*I/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
  if (prefix.toUpperCase().startsWith("VILLA") || prefix.toUpperCase().startsWith("BRONZEES")) return "VILLAS";
  if (prefix.startsWith("Z")) return "ZAGREB";
  if (prefix.startsWith("D")) return "DUBROVNIK";
  if (prefix.startsWith("R")) return "ROVINJ";
  if (prefix.startsWith("L")) return "BEOGRAD";
  if (prefix.startsWith("HG")) return "BULLDOG HG";
  if (prefix.startsWith("WG")) return "BULLDOG WG";
  if (["S1", "S2", "S3"].some(p => prefix.startsWith(p))) return "BRAČ";
  if (prefix.startsWith("TOP")) return "Praterstern";
  if (["301", "202", "102", "101", "201", "001"].includes(prefix) || prefix.startsWith("MAREBLU")) return "BLUBINI";
  if (prefix.startsWith("CR") || prefix.startsWith("CS") || prefix.startsWith("RC")) return "CRA";
  if (villas.includes(clean)) return "VILLAS";
  if (sunny.includes(clean)) return "SUNNY";
  return "";
}

function saveState() {
  const state = [];
  document.querySelectorAll("#tableBody tr").forEach((row, i) => {
    const cells = row.querySelectorAll("td");
    state.push({
      done: cells[2].querySelector("input").checked,
      evis: cells[3].querySelector("input").checked,
      self: cells[4].querySelector("input").checked,
      messaging: cells[5].querySelector("select").value,
      checkin: cells[6].querySelector("select").value,
      code: cells[7].querySelector("input").checked,
      entered: cells[8].querySelector("input").checked,
      parking: cells[9].querySelector("select").value,
      supervisor: cells[10].querySelector("select").value,
      note: cells[11].querySelector("textarea").value
    });
  });
  localStorage.setItem(`arrivals-${activeTab}`, JSON.stringify(state));
}

function loadState() {
  return JSON.parse(localStorage.getItem(`arrivals-${activeTab}`) || "[]");
}

function loadTable(data) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = "";
  const saved = loadState();

  data.forEach((apartment, i) => {
    const prefix = apartment.toUpperCase();
    const destination = getDestination(prefix);
    const supervisor = destination !== "ZAGREB" ? "MORE" : "";
    const row = document.createElement("tr");
    row.className = destination;

    const s = saved[i] || {};
    row.innerHTML = `
      <td>${destination}</td>
      <td>${apartment}</td>
      <td><input type="checkbox" ${s.done ? "checked" : ""}></td>
      <td><input type="checkbox" ${s.evis ? "checked" : ""}></td>
      <td><input type="checkbox" ${s.self ? "checked" : ""}></td>
      <td>
        <select>
          <option value="">--</option>
          <option value="WA" ${s.messaging === "WA" ? "selected" : ""}>WA</option>
          <option value="SMS" ${s.messaging === "SMS" ? "selected" : ""}>SMS</option>
          <option value="AIRBNB" ${s.messaging === "AIRBNB" ? "selected" : ""}>AIRBNB</option>
          <option value="BCOM" ${s.messaging === "BCOM" ? "selected" : ""}>BCOM</option>
          <option value="MAIL" ${s.messaging === "MAIL" ? "selected" : ""}>MAIL</option>
        </select>
      </td>
      <td>
        <select>
          <option value="">--</option>
          <option value="self" ${s.checkin === "self" ? "selected" : ""}>self</option>
          <option value="host" ${s.checkin === "host" ? "selected" : ""}>host</option>
        </select>
      </td>
      <td><input type="checkbox" ${s.code ? "checked" : ""}></td>
      <td><input type="checkbox" ${s.entered ? "checked" : ""}></td>
      <td>
        <select>
          <option value="">--</option>
          <option value="YES" ${s.parking === "YES" ? "selected" : ""}>YES</option>
          <option value="NO" ${s.parking === "NO" ? "selected" : ""}>NO</option>
          <option value="PAID" ${s.parking === "PAID" ? "selected" : ""}>PAID</option>
          <option value="SENT" ${s.parking === "SENT" ? "selected" : ""}>SENT</option>
        </select>
      </td>
      <td>
        <select>
          <option value="">--</option>
          <option value="KLJUČ U KEYBOXU" ${s.supervisor === "KLJUČ U KEYBOXU" ? "selected" : ""}>KLJUČ U KEYBOXU</option>
          <option value="DA" ${s.supervisor === "DA" ? "selected" : ""}>DA</option>
          <option value="NE" ${s.supervisor === "NE" ? "selected" : ""}>NE</option>
          <option value="TO-DO" ${s.supervisor === "TO-DO" ? "selected" : ""}>TO-DO</option>
          <option value="MORE" ${s.supervisor === "MORE" ? "selected" : ""}>MORE</option>
        </select>
      </td>
      <td><textarea rows="1">${s.note || ""}</textarea></td>
    `;
    tbody.appendChild(row);
    document.getElementById("rowCount").textContent = data.length;
  });

  document.querySelectorAll("input, select, textarea").forEach(el => {
    el.addEventListener("change", saveState);
  });

  updateDestinationFilter();
  applyFilters();
}

function updateDestinationFilter() {
  const set = new Set();
  document.querySelectorAll("#tableBody tr").forEach(row => {
    const dest = row.children[0].textContent.trim();
    if (dest) set.add(dest);
  });

  const filter = document.getElementById("filterDestination");
  filter.innerHTML = '<option value="">All</option>';
  Array.from(set).sort().forEach(dest => {
    const option = document.createElement("option");
    option.value = dest;
    option.textContent = dest;
    filter.appendChild(option);
  });
}

function applyFilters() {
  const dest = document.getElementById("filterDestination").value;
  const done = document.getElementById("filterDone").value;
  const entered = document.getElementById("filterEntered").value;

  document.querySelectorAll("#tableBody tr").forEach(row => {
    const rDest = row.children[0].textContent.trim();
    const rDone = row.children[2].querySelector("input").checked;
    const rEntered = row.children[8].querySelector("input").checked;
    let show = true;

    if (dest && rDest !== dest) show = false;
    if (done === "checked" && !rDone) show = false;
    if (done === "unchecked" && rDone) show = false;
    if (entered === "checked" && !rEntered) show = false;
    if (entered === "unchecked" && rEntered) show = false;

    row.style.display = show ? "" : "none";
  });
}

function loadStats() {
  const stats = {
    total: 38,
    done: 24,
    entered: 20,
    self: 15,
    villas: 9,
    zagreb: 12,
    cra: 8,
    dubrovnik: 4,
    sunny: 5
  };
  const labels = {
    total: "Ukupan broj dolazaka",
    done: "Označeno 'Done'",
    entered: "Gost ušao",
    self: "Self check-in",
    villas: "VILLAS destinacija",
    zagreb: "ZAGREB destinacija",
    cra: "CRA destinacija",
    dubrovnik: "DUBROVNIK destinacija",
    sunny: "SUNNY destinacija"
  };
  const container = document.getElementById('statsContainer');
  container.innerHTML = "";
  Object.keys(stats).forEach((key, i) => {
    const div = document.createElement("div");
    div.className = `card ${key}`;
    div.style.animationDelay = `${i * 0.1}s`;
    div.innerHTML = `<h2>${labels[key]}</h2><p>${stats[key]}</p>`;
    container.appendChild(div);
  });
}

const params = new URLSearchParams(location.search);
const activeTab = params.get("tab") || "today";

window.onload = () => {
  const arrivals = document.getElementById("arrivalsSection");
  const stats = document.getElementById("statsSection");
  const filters = document.getElementById("filters");
  const title = document.getElementById("tableTitle");

  if (activeTab === "stats") {
    arrivals.style.display = "none";
    filters.style.display = "none";
    stats.style.display = "block";
    loadStats();
  } else {
    const isToday = activeTab === "today";
    const date = new Date();
    if (!isToday) date.setDate(date.getDate() + 1);
    title.innerText = `ARRIVALS / ${date.toLocaleDateString("hr-HR")}`;
    loadTable(isToday ? apartmentsToday : apartmentsTomorrow);
  }

  document.getElementById("filterDestination").addEventListener("change", applyFilters);
  document.getElementById("filterDone").addEventListener("change", applyFilters);
  document.getElementById("filterEntered").addEventListener("change", applyFilters);
};
