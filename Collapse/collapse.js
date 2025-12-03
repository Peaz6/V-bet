const plane = document.getElementById('plane');
const trailCanvas = document.getElementById('trailCanvas');
const ctx = trailCanvas.getContext('2d');
const multiplierEl = document.querySelector('.multiplier');
const resultEl = document.querySelector('.result');
const pointsEl = document.querySelector('.points');
const cashOutBtn = document.getElementById('cashOutBtn');

// Set canvas size
trailCanvas.width = trailCanvas.parentElement.offsetWidth;
trailCanvas.height = trailCanvas.parentElement.offsetHeight;

let points = 1000;
pointsEl.textContent = `Points: ${points}`;

let currentBet = 0;
let isRunning = false;
let multiplier = 1;
let crashMultiplier = 0;
let intervalId;
let trail = [];
const maxTrailLength = 120;
let cashedOut = false;

// BET SELECTION
const betButtons = document.querySelectorAll('.bet-buttons button[data-bet]');
const customInput = document.getElementById('customBet');

betButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        betButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentBet = parseInt(btn.dataset.bet);
        customInput.value = '';
    });
});

customInput.addEventListener('input', () => {
    currentBet = parseInt(customInput.value) || 0;
    betButtons.forEach(b => b.classList.remove('selected'));
});

// START GAME
document.getElementById('startBtn').addEventListener('click', () => {
    if(currentBet <= 0 || currentBet > points){
        alert('Invalid bet amount!');
        return;
    }
    if(isRunning) return;

    points -= currentBet;
    pointsEl.textContent = `Points: ${points}`;

    isRunning = true;
    multiplier = 1;
    crashMultiplier = generateCrashMultiplier();
    trail = [];
    cashedOut = false;
    multiplierEl.textContent = `Multiplier: 1.00x`;
    resultEl.textContent = '';
    cashOutBtn.disabled = false;
    plane.style.left = '0px';
    plane.style.bottom = '0px';
    plane.src = 'Pics/plane.png';
    ctx.clearRect(0,0,trailCanvas.width,trailCanvas.height);

    intervalId = setInterval(runGame, 50);
});

// CASH OUT
cashOutBtn.addEventListener('click', () => {
    if(!isRunning || cashedOut) return;
    cashedOut = true;
    clearInterval(intervalId);
    isRunning = false;
    let winnings = Math.floor(currentBet * multiplier);
    points += winnings;
    pointsEl.textContent = `Points: ${points}`;
    resultEl.textContent = `Cashed out at ${multiplier.toFixed(2)}x: +${winnings} points`;
    cashOutBtn.disabled = true;
});

// GAME LOOP
function runGame() {
    multiplier += 0.05;
    multiplier = parseFloat(multiplier.toFixed(2));
    multiplierEl.textContent = `Multiplier: ${multiplier.toFixed(2)}x`;

    // Plane movement
    const planeX = multiplier * 12;
    const planeY = multiplier * 3;
    plane.style.left = planeX + 'px';
    plane.style.bottom = planeY + 'px';

    // Trail - calculate position from bottom-left of plane area
    const planeAreaHeight = trailCanvas.height;
    const trailX = planeX + 24;
    const trailY = planeAreaHeight - planeY - 24;
    trail.push({x: trailX, y: trailY});
    if(trail.length > maxTrailLength) trail.shift();

    ctx.clearRect(0,0,trailCanvas.width,trailCanvas.height);
    ctx.beginPath();
    for(let i=0;i<trail.length;i++){
        const alpha = i/trail.length;
        ctx.strokeStyle = `rgba(0,255,255,${alpha})`;
        if(i===0) ctx.moveTo(trail[i].x, trail[i].y);
        else ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.lineWidth = 3;
    ctx.stroke();

    // Crash check
    if(multiplier >= crashMultiplier) {
        endGame();
    }
}

// END GAME
function endGame() {
    clearInterval(intervalId);
    isRunning = false;
    if(!cashedOut){
        resultEl.textContent = `Crashed at ${crashMultiplier.toFixed(2)}x`;
    }
    plane.src = 'Pics/ex.png';
    cashOutBtn.disabled = true;
}

// RANDOM CRASH MULTIPLIER
function generateCrashMultiplier() {
    const rand = Math.random()*100;
    if(rand < 5) return Math.random() * 0.5 + 1;       // 1-1.5x 5%
    else if(rand < 55) return Math.random() * 1.5 + 4;  // 4-5.5x 50%
    else if(rand < 85) return Math.random() * 4 + 6;    // 6-10x 30%
    else return Math.random() * 40 + 10;                // 10-50x 15%
}
