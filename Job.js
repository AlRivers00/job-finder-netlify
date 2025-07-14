let currentPage = 1;
let lastQuery = "";
let lastLocation = "";
let lastType = "";
let fetchedJobs = [];



function debounce(func, delay = 500) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}


async function searchJobs(resetPage = true) {
  const keyword = document.getElementById("keyword").value.trim();
  const location = document.getElementById("location").value.trim();
  const jobType = document.getElementById("jobType").value;

  if (resetPage) {
    currentPage = 1;
    fetchedJobs = [];
    saveSearchHistory(keyword, location);
    showSearchHistory();
  } else {
    currentPage++;
  }

  lastQuery = keyword;
  lastLocation = location;
  lastType = jobType;

  const resultsDiv = document.getElementById("results");
  const loadMoreBtn = document.getElementById("loadMore");

  if (resetPage) resultsDiv.innerHTML = "";
  resultsDiv.innerHTML += `<div class="spinner"></div>`;

  const query = `${keyword} in ${location}`;
  const url = `/api/key?query=${encodeURIComponent(query)}`;


try {
  const response = await fetch(url);
  const data = await response.json();
  document.querySelectorAll('.spinner').forEach(spinner => spinner.remove());

  if (!data.data || data.data.length === 0) {
    if (resetPage) resultsDiv.innerHTML = "<p>No jobs found.</p>";
    loadMoreBtn.style.display = "none";
    return;
  }

  fetchedJobs = fetchedJobs.concat(data.data);
  renderJobs();
  loadMoreBtn.style.display = "block";
} catch (err) {
  resultsDiv.innerHTML += "<p>Error fetching jobs.</p>";
  console.error(err);
}


  
}

function renderJobs() {
  const resultsDiv = document.getElementById("results");
  const jobType = document.getElementById("jobType").value;
  const sortOption = document.getElementById("sortOption")?.value || "";
  const companyInput = document.getElementById("companyFilter").value.trim().toLowerCase();

  let jobsToRender = [...fetchedJobs];

  if (companyInput) {
    jobsToRender = jobsToRender.filter(job =>
      (job.employer_name || "").toLowerCase().includes(companyInput)
    );
  }

  if (jobType) {
    jobsToRender = jobsToRender.filter(
      job => job.job_employment_type?.toLowerCase() === jobType
    );
  }


  if (sortOption === "title") {
    jobsToRender.sort((a, b) => a.job_title.localeCompare(b.job_title));
  } else if (sortOption === "type") {
    jobsToRender.sort((a, b) =>
      (a.job_employment_type || "").localeCompare(b.job_employment_type || "")
    );
  }


  resultsDiv.innerHTML = "";
  if (jobsToRender.length === 0) {
    resultsDiv.innerHTML = "<p>No jobs match your filters.</p>";
    return;
  }

  jobsToRender.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";
    card.innerHTML = `
      <h3>${job.job_title}</h3>
      <p><strong>Company:</strong> ${job.employer_name || "N/A"}</p>
      <p><strong>Location:</strong> ${job.job_city || "N/A"}</p>
      <p><strong>Type:</strong> ${job.job_employment_type || "N/A"}</p>
      <a href="${job.job_apply_link}" target="_blank">Apply Now</a>
    `;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save Job";
    saveBtn.className = "save-btn";
    saveBtn.onclick = () => saveJob(job);
    card.appendChild(saveBtn);

    resultsDiv.appendChild(card);
  });
}

function sortJobResults() {
  renderJobs();
}

function saveJob(job) {
  let saved = JSON.parse(localStorage.getItem("savedJobs") || "[]");

  const isDuplicate = saved.some(savedJob => savedJob.job_id === job.job_id);
  if (isDuplicate) {
    alert("This job is already saved.");
    return;
  }

  saved.push(job);
  localStorage.setItem("savedJobs", JSON.stringify(saved));
  showSavedJobs();
}

function removeSavedJob(index) {
  let saved = JSON.parse(localStorage.getItem("savedJobs") || "[]");
  saved.splice(index, 1);
  localStorage.setItem("savedJobs", JSON.stringify(saved));
  showSavedJobs();
}

function showSavedJobs() {
  const savedJobsDiv = document.getElementById("savedJobs");
  const saved = JSON.parse(localStorage.getItem("savedJobs") || "[]");
  savedJobsDiv.innerHTML = "";

  if (saved.length === 0) {
    savedJobsDiv.innerHTML = "<p>No saved jobs.</p>";
    return;
  }

  saved.forEach((job, index) => {
    const card = document.createElement("div");
    card.className = "job-card";
    card.innerHTML = `
      <h3>${job.job_title}</h3>
      <p><strong>Company:</strong> ${job.employer_name || "N/A"}</p>
      <p><strong>Location:</strong> ${job.job_city || "N/A"}</p>
      <p><strong>Type:</strong> ${job.job_employment_type || "N/A"}</p>
      <a href="${job.job_apply_link}" target="_blank">Apply Now</a>
    `;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "save-btn";
    removeBtn.onclick = () => removeSavedJob(index);
    card.appendChild(removeBtn);

    savedJobsDiv.appendChild(card);
  });
}

function saveSearchHistory(keyword, location) {
  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  const entry = { keyword, location };

  if (!history.find(h => h.keyword === keyword && h.location === location)) {
    history.unshift(entry);
    if (history.length > 10) history.pop();
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }
}

function showSearchHistory() {
  const container = document.getElementById("searchHistory");
  if (!container) return;

  const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  container.innerHTML = "";

  history.forEach(entry => {
    const btn = document.createElement("button");
    btn.textContent = `${entry.keyword} in ${entry.location}`;
    btn.onclick = () => {
      document.getElementById("keyword").value = entry.keyword;
      document.getElementById("location").value = entry.location;
      searchJobs(true);
    };
    container.appendChild(btn);
  });
}

window.onload = () => {
  showSavedJobs();
  showSearchHistory();

  document.getElementById("companyFilter").addEventListener("input", renderJobs);

  
  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme === "enabled") {
    document.body.classList.add("dark-mode");
  }


  const toggleBtn = document.getElementById("themeToggle");
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
    };
  }
};