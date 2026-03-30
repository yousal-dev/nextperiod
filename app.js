// Schedule data
const schedules = {
    regular: [
        { name: "Period 0", start: "7:15", end: "8:15", duration: 60 },
        { name: "Community Meeting", start: "8:20", end: "8:30", duration: 10 },
        { name: "Period 1", start: "8:30", end: "9:27", duration: 57 },
        { name: "Period 2", start: "9:29", end: "10:26", duration: 57 },
        { name: "Period 3", start: "10:28", end: "11:25", duration: 57 },
        { name: "Period 4", start: "11:27", end: "12:24", duration: 57 },
        { name: "Period 5", start: "12:26", end: "13:11", duration: 45, note: "Lunch" },
        { name: "Period 6", start: "13:13", end: "14:10", duration: 57 },
        { name: "Period 7", start: "14:12", end: "15:11", duration: 59 }
    ],
    wednesday: [
        { name: "Period 0", start: "7:15", end: "8:15", duration: 60 },
        { name: "Community Meeting", start: "8:20", end: "8:30", duration: 10 },
        { name: "Period 1", start: "8:30", end: "9:16", duration: 46 },
        { name: "Period 2", start: "9:18", end: "10:04", duration: 46 },
        { name: "Period 3", start: "10:06", end: "10:52", duration: 46 },
        { name: "Period 4", start: "10:54", end: "11:39", duration: 45, note: "Lunch" },
        { name: "Period 5", start: "11:41", end: "12:27", duration: 46 },
        { name: "Period 6", start: "12:29", end: "13:15", duration: 46 },
        { name: "Period 7", start: "13:17", end: "14:05", duration: 48 }
    ]
};

// DOM elements
const timerElement = document.getElementById('timer');
const currentPeriodElement = document.getElementById('currentPeriod');
const statusElement = document.getElementById('status');
const progressElement = document.getElementById('progress');
const scheduleBody = document.getElementById('scheduleBody');
const dayButtons = document.querySelectorAll('.day-btn');

let currentDayType = 'regular';

function populateSchedule(dayType) {
    scheduleBody.innerHTML = '';
    schedules[dayType].forEach((period, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="period-name">${period.name}</td>
            <td class="period-time">${period.start} – ${period.end}
                ${period.note ? `<div class="lunch-note">🍽 ${period.note}</div>` : ''}
            </td>
            <td>${period.duration} min</td>
            <td id="status-${index}">—</td>
        `;
        scheduleBody.appendChild(row);
    });
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function updateCountdown() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();

    const schedule = schedules[currentDayType];
    let activePeriod = null;
    let nextPeriod = null;

    for (let i = 0; i < schedule.length; i++) {
        const period = schedule[i];
        const startMinutes = timeToMinutes(period.start);
        const endMinutes = timeToMinutes(period.end);
        const statusCell = document.getElementById(`status-${i}`);

        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
            activePeriod = { ...period, index: i };
            statusCell.textContent = '🟢 Active';
            statusCell.parentElement.className = 'active-period';
        } else if (currentMinutes < startMinutes) {
            if (!nextPeriod || startMinutes < timeToMinutes(nextPeriod.start)) {
                nextPeriod = { ...period, index: i };
            }
            statusCell.textContent = '⏳ Upcoming';
            statusCell.parentElement.className = '';
        } else {
            statusCell.textContent = '✅ Ended';
            statusCell.parentElement.className = '';
        }
    }

    if (activePeriod) {
        const startMinutes = timeToMinutes(activePeriod.start);
        const endMinutes = timeToMinutes(activePeriod.end);
        const totalDuration = endMinutes - startMinutes;
        const elapsed = currentMinutes - startMinutes + currentSeconds / 60;
        const remaining = totalDuration - elapsed;

        currentPeriodElement.textContent = `${activePeriod.name} — Time Remaining`;

        const remainingMinutes = Math.floor(remaining);
        const remainingSeconds = Math.floor((remaining % 1) * 60);
        timerElement.textContent = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        statusElement.textContent = `Started at ${activePeriod.start}, ends at ${activePeriod.end}`;

        const progressPercent = (elapsed / totalDuration) * 100;
        progressElement.style.width = `${Math.min(progressPercent, 100)}%`;

        if (remaining < 5) {
            progressElement.style.background = 'linear-gradient(to right, #F87171, #FB923C)';
        } else if (remaining < 10) {
            progressElement.style.background = 'linear-gradient(to right, #FBBF24, #FDE68A)';
        } else {
            progressElement.style.background = 'linear-gradient(to right, #5E17EB, #C084FC, #E879F9)';
        }

        if (nextPeriod) {
            document.getElementById(`status-${nextPeriod.index}`).parentElement.className = 'next-period';
        }
    } else if (nextPeriod) {
        const startMinutes = timeToMinutes(nextPeriod.start);
        const timeUntilStart = startMinutes - currentMinutes;

        currentPeriodElement.textContent = `Break — Next: ${nextPeriod.name}`;

        const untilMinutes = Math.floor(timeUntilStart);
        const untilSeconds = Math.floor((timeUntilStart % 1) * 60);
        timerElement.textContent = `${untilMinutes}:${untilSeconds.toString().padStart(2, '0')}`;
        statusElement.textContent = `Next period starts at ${nextPeriod.start}`;

        progressElement.style.width = '0%';
        progressElement.style.background = 'linear-gradient(to right, #5E17EB, #C084FC, #E879F9)';
    } else {
        currentPeriodElement.textContent = 'School Day Ended';
        timerElement.textContent = '00:00';
        statusElement.textContent = 'No more periods today';
        progressElement.style.width = '100%';
        progressElement.style.background = 'linear-gradient(to right, #4B5563, #6B7280)';
    }
}

function init() {
    dayButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            dayButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentDayType = this.dataset.day;
            populateSchedule(currentDayType);
            updateCountdown();
        });
    });

    populateSchedule(currentDayType);
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

window.onload = init;
