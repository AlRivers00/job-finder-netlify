const jobs = [
  { title: "Web Developer", pay: "$30/hr" },
  { title: "Tutor", pay: "$25/hr" },
  { title: "Nanny", pay: "$20/hr" },
];

document.getElementById("searchInput").addEventListener("input", function() {
  const value = this.value.toLowerCase();
  const filtered = jobs.filter(job => job.title.toLowerCase().includes(value));
  const list = document.getElementById("jobList");
  list.innerHTML = filtered.map(job => `<li>${job.title} - ${job.pay}</li>`).join("");
});