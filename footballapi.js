const API_KEY = "d17c2126081e04eefbba56d3ef1119d6";
const API_URL = "https://v3.football.api-sports.io/fixtures?live=all";

// Dummy fallback data (shown if API fails)
const fallbackMatches = [
    {
        league: "Premier League",
        home: "Arsenal",
        away: "Chelsea",
        score: "2 - 1",
        odds: "1.95 / 3.50 / 4.20"
    },
    {
        league: "La Liga",
        home: "Barcelona",
        away: "Real Betis",
        score: "1 - 0",
        odds: "1.80 / 3.80 / 4.60"
    },
    {
        league: "Bundesliga",
        home: "Bayern",
        away: "Dortmund",
        score: "3 - 2",
        odds: "1.70 / 3.90 / 4.30"
    }
];

function generateRandomOdds() {
    // Generate a reasonable 3-way (home / draw / away) odds string with two decimals
    function rnd(min, max) {
        return (Math.random() * (max - min) + min);
    }
    // ranges chosen for demo: home 1.2–3.5, draw 2.5–5.0, away 1.3–4.5
    const home = rnd(1.2, 3.5).toFixed(2);
    const draw = rnd(2.5, 5.0).toFixed(2);
    const away = rnd(1.3, 4.5).toFixed(2);
    return `${home} / ${draw} / ${away}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const statusText = document.getElementById("status");
    const tableBody = document.querySelector("#matchTable tbody");

    // If this page doesn't have the sports elements, do nothing
    if (!statusText || !tableBody) return;

    async function loadMatches() {
        try {
            statusText.textContent = "Loading live matches…";
            const res = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "x-apisports-key": API_KEY,
                    "Accept": "application/json"
                }
            });

            if (!res.ok) throw new Error("Blocked or CORS issue");

            const data = await res.json();

            if (!data.response || data.response.length === 0) {
                throw new Error("No matches returned");
            }

            displayMatches(data.response);
            statusText.textContent = "Live matches loaded.";
        } catch (error) {
            console.log("API failed → using fallback data.", error);
            statusText.textContent = "Live data unavailable → showing sample matches.";
            displayFallback();
        }
    }

    function displayMatches(matches) {
        tableBody.innerHTML = "";

        matches.forEach(item => {
            const league = item?.league?.name ?? "Unknown";
            const home = item?.teams?.home?.name ?? "Unknown";
            const away = item?.teams?.away?.name ?? "Unknown";
            const score = (item?.goals?.home != null || item?.goals?.away != null) ? `${item.goals.home ?? "-" } - ${item.goals.away ?? "-"}` : "-";

            // Demo odds: generate random odds for display (not accurate)
            const odds = generateRandomOdds();

            const row = `
                <tr>
                    <td>${league}</td>
                    <td>${home}</td>
                    <td>${away}</td>
                    <td>${score}</td>
                    <td>${odds}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    }

    function displayFallback() {
        tableBody.innerHTML = "";

        fallbackMatches.forEach(match => {
            const row = `
                <tr>
                    <td>${match.league}</td>
                    <td>${match.home}</td>
                    <td>${match.away}</td>
                    <td>${match.score}</td>
                    <td>${match.odds ?? "-"}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    }

    // start the load when page is ready
    loadMatches();
});
