// ===== CLIENT BOOKING FUNCTIONS =====
// This file overrides functions from app.js for the client booking flow

// Calendar rendering with proper month navigation
function renderBkCalendar() {
  var year = DB.bookingCalendar.year;
  var month = DB.bookingCalendar.month;
  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var today = new Date();
  var todayStr = today.toISOString().split('T')[0];
  var monthNames = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  var html = '<div class="cal-header">';
  html += '<button class="cal-nav" onclick="prevMonth()">&#8249;</button>';
  html += '<span class="cal-month">' + monthNames[month] + ' ' + year + '</span>';
  html += '<button class="cal-nav" onclick="nextMonth()">&#8250;</button>';
  html += '</div>';

  html += '<div class="cal-grid">';
  var dayHeaders = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
  for (var i = 0; i < 7; i++) {
    html += '<div class="cal-day-head">' + dayHeaders[i] + '</div>';
  }

  // Empty cells before first day
  for (var e = 0; e < firstDay; e++) {
    html += '<div class="cal-day empty"></div>';
  }

  // Days
  for (var day = 1; day <= daysInMonth; day++) {
    var date = new Date(year, month, day);
    var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    var isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var isToday = dateStr === todayStr;
    var isSelected = DB.booking.date === dateStr;
    var dayOfWeek = date.getDay();
    
    // Logica inteligente: Ver se o barbeiro trabalha nesse dia
    var barber = DB.booking.barber ? DB.barbers.find(b => String(b.id) === String(DB.booking.barber)) : null;
    var isClosed = false;

    if (barber && barber.working_days && barber.working_days.length > 0) {
      const workingDay = barber.working_days.find(d => Number(d.day_of_week) === dayOfWeek);
      isClosed = !workingDay || workingDay.is_working === false;
    } else {
      // Fallback para horário da loja
      var hoursConfig = DB.hours[dayOfWeek];
      isClosed = hoursConfig && !hoursConfig.open;
    }

    var classes = 'cal-day';
    if (isPast || isClosed) classes += ' disabled';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';

    if (isPast || isClosed) {
      html += '<div class="' + classes + '">' + day + '</div>';
    } else {
      html += '<div class="' + classes + '" onclick="selectDate(\'' + dateStr + '\',this)">' + day + '</div>';
    }
  }
  html += '</div>';

  var container = document.getElementById('bk-calendar');
  if (container) container.innerHTML = html;
}

function selectDate(dateStr, el) {
  DB.booking.date = dateStr;
  DB.booking.time = null;
  // Re-render calendar to update selection
  renderBkCalendar();
  // Render available times
  renderBkTimes();
}

function prevMonth() {
  DB.bookingCalendar.month--;
  if (DB.bookingCalendar.month < 0) {
    DB.bookingCalendar.month = 11;
    DB.bookingCalendar.year--;
  }
  renderBkCalendar();
}

function nextMonth() {
  DB.bookingCalendar.month++;
  if (DB.bookingCalendar.month > 11) {
    DB.bookingCalendar.month = 0;
    DB.bookingCalendar.year++;
  }
  renderBkCalendar();
}

// Render available time slots - targets id="bk-slots"
function renderBkTimes() {
  var container = document.getElementById('bk-slots');
  if (!container) return;

  var date = DB.booking.date;
  if (!date) {
    container.innerHTML = '<p style="color:var(--text-faint);text-align:center;padding:1rem;">Selecione uma data</p>';
    return;
  }

  var dateObj = new Date(date + 'T00:00:00');
  var dayOfWeek = dateObj.getDay();
  var hoursConfig = DB.hours[dayOfWeek];

  if (!hoursConfig || !hoursConfig.open) {
    container.innerHTML = '<p style="color:var(--text-faint);text-align:center;padding:1rem;">Fechado neste dia</p>';
    return;
  }

  // Generate time slots
  var startParts = hoursConfig.start.split(':');
  var endParts = hoursConfig.end.split(':');
  var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  var endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

  // Get service duration
  var svc = DB.services.find(function(s) { return String(s.id) === String(DB.booking.service); });
  var slotDuration = svc ? svc.duration : 30;

  // Get barber to check availability
  var barberId = DB.booking.barber;

  var times = [];
  for (var m = startMinutes; m + slotDuration <= endMinutes; m += 30) {
    var h = Math.floor(m / 60);
    var min = m % 60;
    var timeStr = String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');

    // Check if slot is occupied
    var occupied = DB.appointments.some(function(a) {
      if (a.date !== date || a.status === 'cancelled') return false;
      if (barberId && String(a.barber) !== String(barberId)) return false;
      return a.time === timeStr;
    });

    times.push({ time: timeStr, occupied: occupied });
  }

  if (!times.length) {
    container.innerHTML = '<p style="color:var(--text-faint);text-align:center;padding:1rem;">Nenhum horario disponivel</p>';
    return;
  }

  container.innerHTML = times.map(function(t) {
    if (t.occupied) {
      return '<div class="time-slot taken">' + t.time + '</div>';
    }
    var isSelected = DB.booking.time === t.time;
    return '<div class="time-slot' + (isSelected ? ' selected' : '') + '" onclick="selectTimeSlot(\'' + t.time + '\')">' + t.time + '</div>';
  }).join('');

  // Update title
  var title = document.getElementById('slots-title');
  if (title) {
    var dateFormatted = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    title.textContent = 'Horarios - ' + dateFormatted;
  }
}

function selectTimeSlot(time) {
  DB.booking.time = time;
  renderBkTimes(); // Re-render to update selection
}

// Step navigation with validation
function goStep(step) {
  // Validate current step before moving forward
  if (step > currentStep) {
    if (currentStep === 1 && !DB.booking.service) {
      toast('Selecione um servico', 'error');
      return;
    }
    if (currentStep === 3 && !DB.booking.date) {
      toast('Selecione uma data', 'error');
      return;
    }
    if (currentStep === 3 && !DB.booking.time) {
      toast('Selecione um horario', 'error');
      return;
    }
  }

  currentStep = step;
  var steps = document.querySelectorAll('[id^="bk-step-"]');
  steps.forEach(function(s) { s.style.display = 'none'; });

  var stepEl = document.getElementById('bk-step-' + step);
  if (stepEl) stepEl.style.display = 'block';

  // Update step indicators
  var indicators = document.querySelectorAll('.si-step');
  indicators.forEach(function(ind) {
    var stepNum = parseInt(ind.getAttribute('data-step'));
    ind.classList.remove('active', 'done');
    if (stepNum === step) ind.classList.add('active');
    else if (stepNum < step) ind.classList.add('done');
  });

  // Step-specific rendering
  if (step === 3) {
    renderBkCalendar();
    if (DB.booking.date) renderBkTimes();
  }
  if (step === 4) {
    renderBookingSummary();
  }
}

function nextStep() {
  goStep(currentStep + 1);
}

function prevStep() {
  if (currentStep > 1) {
    goStep(currentStep - 1);
  }
}

// Render booking summary on step 4
function renderBookingSummary() {
  var summary = document.getElementById('booking-summary');
  if (!summary) return;

  var svc = DB.services.find(function(s) { return String(s.id) === String(DB.booking.service); });
  var barber = DB.booking.barber ? DB.barbers.find(function(b) { return String(b.id) === String(DB.booking.barber); }) : null;
  var dateFormatted = '';
  if (DB.booking.date) {
    dateFormatted = new Date(DB.booking.date + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  summary.innerHTML =
    '<div class="bs-row"><span class="bs-label">Servico</span><span class="bs-val">' + (svc ? svc.name : '—') + '</span></div>' +
    '<div class="bs-row"><span class="bs-label">Duracao</span><span class="bs-val">' + (svc ? svc.duration + ' min' : '—') + '</span></div>' +
    '<div class="bs-row"><span class="bs-label">Barbeiro</span><span class="bs-val">' + (barber ? barber.name || barber.nick : 'Qualquer disponivel') + '</span></div>' +
    '<div class="bs-row"><span class="bs-label">Data</span><span class="bs-val">' + (dateFormatted || '—') + '</span></div>' +
    '<div class="bs-row"><span class="bs-label">Horario</span><span class="bs-val">' + (DB.booking.time || '—') + '</span></div>' +
    '<div class="bs-row"><span class="bs-label">Valor</span><span class="bs-price">R$' + (svc ? svc.price : 0) + '</span></div>';
}

// Barber selection fix
function selectBarber(barberId, el) {
  DB.booking.barber = barberId;
  document.querySelectorAll('.bk-barber-card, .bk-any-card').forEach(function(c) {
    c.classList.remove('selected');
  });
  if (el) el.classList.add('selected');
}

// Service selection fix
function selectService(id, el) {
  DB.booking.service = id;
  document.querySelectorAll('.bk-svc-card').forEach(function(c) {
    c.classList.remove('selected');
  });
  if (el) el.classList.add('selected');
  // Reset barber since available barbers may change
  DB.booking.barber = null;
  if (typeof renderBkBarbers === 'function') renderBkBarbers();
}

// New booking reset
function newBooking() {
  initBooking();
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.DB) renderBkCalendar();
  });
} else {
  if (window.DB) renderBkCalendar();
}

console.log('BarberOS booking functions loaded');
