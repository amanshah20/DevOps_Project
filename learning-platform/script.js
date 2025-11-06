// JavaScript for pipeline simulation with progress animation
document.getElementById("startPipeline").addEventListener("click", async () => {
  const stages = document.querySelectorAll(".stage");
  const statusDisplay = document.getElementById("statusDisplay");
  const progressBar = document.getElementById("progressBar");

  statusDisplay.innerText = "🚀 Pipeline Execution Started...";
  progressBar.style.width = "0%";

  for (let i = 0; i < stages.length; i++) {
    stages[i].classList.add("active");
    statusDisplay.innerText = `⏳ Running ${stages[i].dataset.stage} Stage...`;
    progressBar.style.width = `${((i + 1) / stages.length) * 100}%`;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  statusDisplay.innerText = "✅ CI/CD Pipeline Completed Successfully!";
  progressBar.style.width = "100%";
});
