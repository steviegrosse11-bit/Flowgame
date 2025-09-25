const grid = document.getElementById('grid');
const levelDisplay = document.getElementById('levelDisplay');
const resetButton = document.getElementById('resetGrid');
const startFlowBtn = document.getElementById('startFlow');

let currentLevel = 1;
let startIndex, endIndexes = [];
let blockedCells = [];
let timer;
let timeLeft = 30;

// Create 6×6 grid
for (let i = 0; i < 36; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.index = i;
  cell.dataset.rotation = 0;
  cell.dataset.pipe = 'none';
  cell.addEventListener('click', () => placePipe(cell));
  grid.appendChild(cell);
}

function placePipe(cell) {
  if (cell.classList.contains('blocked')) return;

  if (!cell.querySelector('.pipe')) {
    const pipe = document.createElement('div');
    pipe.classList.add('pipe');

    const type = Math.random() < 0.5 ? 'straight' : 'curve';
    pipe.setAttribute('data-type', type);

    const visual = document.createElement('div');
    visual.classList.add('visual', type);
    pipe.appendChild(visual);

    cell.appendChild(pipe);
    cell.dataset.pipe = type;
    cell.dataset.rotation = 0;
  } else {
    let rotation = parseInt(cell.dataset.rotation);
    rotation = (rotation + 90) % 360;
    cell.dataset.rotation = rotation;
    cell.querySelector('.pipe').style.transform = `rotate(${rotation}deg)`;
  }
}

function setStartAndEnds() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.classList.remove('start', 'end');
  });

  startIndex = Math.floor(Math.random() * 36);
  endIndexes = [];

  while (endIndexes.length < 2) {
    const index = Math.floor(Math.random() * 36);
    if (index !== startIndex && !endIndexes.includes(index) && Math.abs(startIndex - index) > 10) {
      endIndexes.push(index);
    }
  }

  cells[startIndex].classList.add('start');
  endIndexes.forEach(i => {
    cells[i].classList.add('end');
  });
}

function resetGrid() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.innerHTML = '';
    cell.dataset.pipe = 'none';
    cell.dataset.rotation = 0;
    cell.classList.remove('blocked', 'start', 'end');
  });

  setStartAndEnds();

  const obstacleCount = Math.min(3 + Math.floor(currentLevel / 3), 10);
  blockedCells = [];

  while (blockedCells.length < obstacleCount) {
    const index = Math.floor(Math.random() * 36);
    if (!blockedCells.includes(index) && index !== startIndex && !endIndexes.includes(index)) {
      blockedCells.push(index);
    }
  }

  blockedCells.forEach(i => {
    const cell = document.querySelector(`.cell[data-index="${i}"]`);
    cell.classList.add('blocked');
  });

  updateTimerDisplay();
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert('⏱️ Time’s up! Try again.');
      resetGrid();
    }
  }, 1000);
}

function updateTimerDisplay() {
  levelDisplay.textContent = `Level: ${currentLevel} | Time: ${timeLeft}s`;
}

resetButton.addEventListener('click', () => {
  resetGrid();
});

startFlowBtn.addEventListener('click', () => {
  const startCell = document.querySelector(`.cell[data-index="${startIndex}"]`);
  const endCells = endIndexes.map(i => document.querySelector(`.cell[data-index="${i}"]`));

  const startPipe = startCell.querySelector('.pipe');
  if (!startPipe) {
    alert('🚫 Start missing a pipe!');
    return;
  }

  const startRotation = parseInt(startCell.dataset.rotation);
  const validStart = [0, 90, 180, 270].includes(startRotation);

  const validEnds = endCells.every(cell => {
    const pipe = cell.querySelector('.pipe');
    if (!pipe) return false;
    const rot = parseInt(cell.dataset.rotation);
    return [0, 90, 180, 270].includes(rot);
  });

  if (validStart && validEnds) {
    alert('✅ Water flowed successfully!');
    document.querySelectorAll('.cell').forEach(cell => {
      const pipe = cell.querySelector('.pipe');
      if (pipe) {
        pipe.classList.add('flowing');
      }
    });

    currentLevel++;
    timeLeft = 30;
    clearInterval(timer);
    startTimer();

    setTimeout(() => {
      resetGrid();
    }, 1500);
  } else {
    alert('🚫 Pipes not aligned for flow!');
  }
});

resetGrid();
startTimer();
