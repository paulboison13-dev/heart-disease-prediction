
const API_URL = "";
let performanceChart = null;
let analyticsChart = null;
let matrixChart = null;

let metricsData = null;


// ========================================
// NAVIGATION
// ========================================

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageName + "Page");

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    const selectedNav = document.querySelector(
        `.nav-item[data-page="${pageName}"]`
    );

    if (selectedNav) {
        selectedNav.classList.add("active");
    }

    const titles = {
        dashboard: "Dashboard",
        prediction: "Heart Prediction",
        analytics: "Model Analytics"
    };

    document.getElementById("currentPageTitle").textContent =
        titles[pageName] || "Dashboard";

    document.getElementById("sidebar").classList.remove("open");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


document.querySelectorAll(".nav-item").forEach(item => {

    item.addEventListener("click", () => {
        showPage(item.dataset.page);
    });

});


document.getElementById("menuToggle").addEventListener("click", () => {

    document.getElementById("sidebar").classList.toggle("open");

});


document.getElementById("newPredictionButton").addEventListener("click", () => {

    document.getElementById("predictionForm").reset();

    document.getElementById("resultContent").classList.add("hidden");
    document.getElementById("resultEmpty").classList.remove("hidden");

});


document.getElementById("resetButton").addEventListener("click", () => {

    document.getElementById("resultContent").classList.add("hidden");
    document.getElementById("resultEmpty").classList.remove("hidden");

});


// ========================================
// TOAST
// ========================================

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}


// ========================================
// LOAD MODEL METRICS
// ========================================

async function loadMetrics() {

    try {

        const response = await fetch(`${API_URL}/metrics`);

        if (!response.ok) {
            throw new Error("Could not retrieve model metrics.");
        }

        metricsData = await response.json();

        updateDashboard(metricsData);

        updateAnalytics(metricsData);

        createPerformanceChart(metricsData);

        createAnalyticsChart(metricsData);

        createMatrixChart(metricsData);

        console.log("Model metrics loaded successfully.");

    } catch (error) {

        console.error("Metrics loading error:", error);

        showToast("Unable to load metrics. Check that the backend is running.");

    }

}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard(data) {

    document.getElementById("accuracyMetric").textContent =
        formatPercent(data.accuracy);

    document.getElementById("precisionMetric").textContent =
        formatPercent(data.precision);

    document.getElementById("recallMetric").textContent =
        formatPercent(data.recall);

    document.getElementById("f1Metric").textContent =
        formatPercent(data.f1_score);

    document.getElementById("cvMetric").textContent =
        formatPercent(data.cross_validation_f1);

    document.getElementById("aucMetric").textContent =
        formatPercent(data.roc_auc);

    updateConfusionMatrix(data.confusion_matrix);

}


// ========================================
// ANALYTICS
// ========================================

function updateAnalytics(data) {

    document.getElementById("analyticsAccuracy").textContent =
        formatPercent(data.accuracy);

    document.getElementById("analyticsPrecision").textContent =
        formatPercent(data.precision);

    document.getElementById("analyticsRecall").textContent =
        formatPercent(data.recall);

    document.getElementById("analyticsAuc").textContent =
        formatPercent(data.roc_auc);

    document.getElementById("tableAccuracy").textContent =
        formatPercent(data.accuracy);

    document.getElementById("tablePrecision").textContent =
        formatPercent(data.precision);

    document.getElementById("tableRecall").textContent =
        formatPercent(data.recall);

    document.getElementById("tableF1").textContent =
        formatPercent(data.f1_score);

    document.getElementById("tableAuc").textContent =
        formatPercent(data.roc_auc);

    document.getElementById("tableCv").textContent =
        formatPercent(data.cross_validation_f1);

}


// ========================================
// FORMAT METRICS
// ========================================

function formatPercent(value) {

    return (Number(value) * 100).toFixed(2) + "%";

}


// ========================================
// CONFUSION MATRIX
// ========================================

function updateConfusionMatrix(matrix) {

    if (!matrix || matrix.length !== 2) {
        return;
    }

    document.getElementById("tn").textContent = matrix[0][0];
    document.getElementById("fp").textContent = matrix[0][1];
    document.getElementById("fn").textContent = matrix[1][0];
    document.getElementById("tp").textContent = matrix[1][1];

}


// ========================================
// PERFORMANCE CHART
// ========================================

function createPerformanceChart(data) {

    const ctx = document.getElementById("performanceChart");

    if (performanceChart) {
        performanceChart.destroy();
    }

    performanceChart = new Chart(ctx, {

        type: "bar",

        data: {
            labels: [
                "Accuracy",
                "Precision",
                "Recall",
                "F1 Score",
                "ROC-AUC"
            ],

            datasets: [{
                label: "Performance",
                data: [
                    data.accuracy * 100,
                    data.precision * 100,
                    data.recall * 100,
                    data.f1_score * 100,
                    data.roc_auc * 100
                ],

                backgroundColor: [
                    "#3b82f6",
                    "#0d9488",
                    "#f59e0b",
                    "#8b5cf6",
                    "#64748b"
                ],

                borderRadius: 6,
                borderSkipped: false,
                barThickness: 28
            }]
        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: context => context.parsed.y.toFixed(2) + "%"
                    }
                }
            },

            scales: {

                y: {
                    beginAtZero: true,
                    max: 100,

                    ticks: {
                        callback: value => value + "%",
                        font: {
                            size: 10
                        }
                    },

                    grid: {
                        color: "#eef2f7"
                    }
                },

                x: {
                    ticks: {
                        font: {
                            size: 10
                        }
                    },

                    grid: {
                        display: false
                    }
                }

            }

        }

    });

}


// ========================================
// ANALYTICS CHART
// ========================================

function createAnalyticsChart(data) {

    const ctx = document.getElementById("analyticsChart");

    if (analyticsChart) {
        analyticsChart.destroy();
    }

    analyticsChart = new Chart(ctx, {

        type: "bar",

        data: {
            labels: [
                "Accuracy",
                "Precision",
                "Recall",
                "F1 Score",
                "ROC-AUC",
                "CV F1"
            ],

            datasets: [{
                label: "Score (%)",

                data: [
                    data.accuracy * 100,
                    data.precision * 100,
                    data.recall * 100,
                    data.f1_score * 100,
                    data.roc_auc * 100,
                    data.cross_validation_f1 * 100
                ],

                backgroundColor: "#0d9488",
                borderRadius: 6,
                borderSkipped: false
            }]
        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true,
                    max: 100,

                    ticks: {
                        callback: value => value + "%"
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                }

            }

        }

    });

}


// ========================================
// MATRIX CHART
// ========================================

function createMatrixChart(data) {

    const ctx = document.getElementById("matrixChart");

    if (matrixChart) {
        matrixChart.destroy();
    }

    const matrix = data.confusion_matrix;

    matrixChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [
                "True Negative",
                "False Positive",
                "False Negative",
                "True Positive"
            ],

            datasets: [{
                label: "Number of Cases",

                data: [
                    matrix[0][0],
                    matrix[0][1],
                    matrix[1][0],
                    matrix[1][1]
                ],

                backgroundColor: [
                    "#16a34a",
                    "#ef4444",
                    "#f97316",
                    "#0d9488"
                ],

                borderRadius: 6,
                borderSkipped: false
            }]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                },

                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 9
                        }
                    }
                }

            }

        }

    });

}


// ========================================
// PREDICTION FORM
// ========================================

document.getElementById("predictionForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const form = event.target;

        const button = document.getElementById("predictButton");

        button.disabled = true;

        button.innerHTML = `
            <i data-lucide="loader-circle"></i>
            Processing...
        `;

        lucide.createIcons();


        const patientData = {

            age: Number(form.age.value),

            sex: form.sex.value,

            blood_pressure: Number(form.blood_pressure.value),

            cholesterol: Number(form.cholesterol.value),

            bmi: Number(form.bmi.value),

            smoker: form.smoker.value,

            diabetes: form.diabetes.value,

            physical_activity: Number(form.physical_activity.value),

            family_history: form.family_history.value,

            stress_level: Number(form.stress_level.value)

        };


        try {

            const response = await fetch(`${API_URL}/predict`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(patientData)

            });


            const result = await response.json();


            if (!response.ok) {

                throw new Error(result.error || "Prediction failed.");

            }


            displayPrediction(result);

            showToast("Prediction generated successfully.");

        } catch (error) {

            console.error("Prediction error:", error);

            showToast(error.message || "Unable to generate prediction.");

        } finally {

            button.disabled = false;

            button.innerHTML = `
                <i data-lucide="sparkles"></i>
                Generate Prediction
            `;

            lucide.createIcons();

        }

    }
);


// ========================================
// DISPLAY PREDICTION
// ========================================

function displayPrediction(result) {

    const resultCard = document.getElementById("resultCard");

    const emptyState = document.getElementById("resultEmpty");

    const content = document.getElementById("resultContent");

    const isPositive = result.prediction === 1;


    emptyState.classList.add("hidden");

    content.classList.remove("hidden");


    resultCard.classList.remove("result-positive", "result-negative");

    resultCard.classList.add(
        isPositive ? "result-positive" : "result-negative"
    );


    document.getElementById("resultTitle").textContent = result.result;


    document.getElementById("resultDescription").textContent =
        isPositive
        ? "The model classified the submitted information as belonging to the heart disease class."
        : "The model classified the submitted information as belonging to the no heart disease class.";


    document.getElementById("probabilityValue").textContent =
        result.probability.toFixed(2) + "%";


    document.getElementById("probabilityFill").style.width =
        result.probability + "%";


    document.getElementById("predictedClass").textContent =
        result.prediction;


    document.getElementById("resultDisclaimer").textContent =
        result.disclaimer;


    const icon = document.getElementById("resultStatusIcon");

    icon.innerHTML = isPositive
        ? '<i data-lucide="heart-pulse"></i>'
        : '<i data-lucide="heart"></i>';


    lucide.createIcons();


    content.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons();

    loadMetrics();

});
