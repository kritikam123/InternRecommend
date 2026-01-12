import Chart from "https://cdn.jsdelivr.net/npm/chart.js/auto/+esm";

(async function () {
  try {
    const response = await fetch("/admin/dashboard/data");
    const data = await response.json();
    console.log("data is: ", data);
    new Chart(document.getElementById("acquisitions"), {
      type: "bar",
      data: {
        labels: data.data.map((row) => row.category),
        datasets: [
          {
            label: "Jobs per category",
            data: data.data.map((row) => row.count),
          },
        ],
      },
    });

    new Chart(document.getElementById("acquisitions-pie"), {
      type: "pie",
      data: {
        labels: data.piedata.map((row) => row.jobType),
        datasets: [
          {
            label: "Jobs per category",
            data: data.piedata.map((row) => row.count),
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
  }
})();
