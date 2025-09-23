const moodButtons = document.querySelectorAll('.mood-btn');
const selectedMoodInput = document.getElementById('selectedMood');
const moodForm = document.getElementById('moodForm');
const moodList = document.getElementById('moodList');
const datePicker = document.getElementById('datePicker');
let moodChart;

moodButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    moodButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMoodInput.value = btn.textContent;
  });
});

moodForm.addEventListener('submit', e => {
  e.preventDefault();
  const mood = selectedMoodInput.value;
  const note = document.getElementById('note').value;
  const date = new Date().toISOString().split('T')[0];

  if (!mood) return alert('Please select a mood.');

  const entry = { mood, note, date };
  saveMood(entry);
  displayMoods(date);
  renderChart();
  moodForm.reset();
  moodButtons.forEach(b => b.classList.remove('selected'));
});

function saveMood(entry) {
  const moods = JSON.parse(localStorage.getItem('moods')) || [];
  moods.push(entry);
  localStorage.setItem('moods', JSON.stringify(moods));
}

function displayMoods(date) {
  const moods = JSON.parse(localStorage.getItem('moods')) || [];
  const filtered = moods.filter(entry => entry.date === date);
  moodList.innerHTML = '';

  if (filtered.length === 0) {
    moodList.innerHTML = '<li>No mood recorded for this day.</li>';
  } else {
    filtered.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.date} - ${entry.mood} - ${entry.note}`;
      moodList.appendChild(li);
    });
  }
}

datePicker.addEventListener('change', () => {
  displayMoods(datePicker.value);
});

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function countMoodsByDay(days) {
  const moods = JSON.parse(localStorage.getItem('moods')) || [];
  const moodTypes = ['😊', '😐', '😢', '😠'];
  const counts = moodTypes.map(mood => {
    return days.reduce((total, day) => {
      return total + moods.filter(entry => entry.date === day && entry.mood === mood).length;
    }, 0);
  });
  return { moodTypes, counts };
}

function renderChart() {
  const days = getLast7Days();
  const { moodTypes, counts } = countMoodsByDay(days);
  const ctx = document.getElementById('moodChart').getContext('2d');

  if (moodChart) moodChart.destroy();

  moodChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: moodTypes,
      datasets: [{
        label: 'Mood Frequency (Last 7 Days)',
        data: counts,
        backgroundColor: ['#4caf50', '#ffeb3b', '#2196f3', '#f44336']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Initialize
datePicker.value = new Date().toISOString().split('T')[0];
displayMoods(datePicker.value);
renderChart();