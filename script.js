/**
 * NASAN Transit Landing Page - Interactive Simulator & Scripts
 * Real-time reactive state connecting Passenger & Driver interfaces
 */

// Shared State for the interactive demo (matching NASAN context)
const appState = {
  currentRole: 'passenger', // 'passenger' | 'driver'
  selectedBusId: '101',
  monitorThreshold: '1.0 km',
  bus101: {
    id: '101',
    name: 'BUS 101',
    driver: 'Juan Dela Cruz',
    totalSeats: 40,
    availableSeats: 18,
    isInService: true,
    currentStopIndex: 1, // 0: Terminal, 1: Manggahan, 2: Dasmariñas
    isMonitored: true,
  },
  bus202: {
    id: '202',
    name: 'BUS 202',
    driver: 'Pedro Santos',
    totalSeats: 40,
    availableSeats: 7,
    isInService: true,
    isMonitored: false,
  },
  bus303: {
    id: '303',
    name: 'BUS 303',
    driver: 'Maria Reyes',
    totalSeats: 40,
    availableSeats: 0,
    isInService: true,
    isMonitored: false,
  }
};

const STOPS_101 = [
  { name: 'General Trias Terminal', time: 'Departed • 07:15 AM' },
  { name: 'Governor’s Drive / Manggahan', time: 'Current Location • Approaching' },
  { name: 'Dasmariñas City Center', time: 'Destination • Est. 07:45 AM' },
];

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFaqAccordion();
  initNavbarScroll();
  syncAllViews();
});

/* ==========================================================
   NAVIGATION & UI INTERACTIONS
   ========================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close when clicking any nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.style.boxShadow = '0 6px 20px rgba(16, 45, 75, 0.08)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}

function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close other open accordions
      faqItems.forEach(other => other.classList.remove('open'));

      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

/* ==========================================================
   SIMULATOR: ROLE SWITCHER
   ========================================================== */
function switchSimulatorRole(role) {
  appState.currentRole = role;

  const passengerTab = document.getElementById('tabPassengerBtn');
  const driverTab = document.getElementById('tabDriverBtn');
  const passengerScreen = document.getElementById('simPassengerScreen');
  const driverScreen = document.getElementById('simDriverScreen');

  if (role === 'passenger') {
    passengerTab.classList.add('active');
    driverTab.classList.remove('active');
    passengerScreen.style.display = 'block';
    driverScreen.style.display = 'none';
  } else {
    driverTab.classList.add('active');
    passengerTab.classList.remove('active');
    passengerScreen.style.display = 'none';
    driverScreen.style.display = 'block';
  }

  syncAllViews();
}

/* ==========================================================
   SIMULATOR: BUS SELECTION
   ========================================================== */
function selectBus(busId) {
  appState.selectedBusId = busId;

  // Update card selections
  document.querySelectorAll('.sim-bus-card').forEach(card => card.classList.remove('selected'));
  const targetCard = document.getElementById(`cardBus${busId}`);
  if (targetCard) targetCard.classList.add('selected');

  // Update marker selections
  document.querySelectorAll('.sim-marker').forEach(marker => marker.classList.remove('active-marker'));
  const targetMarker = document.getElementById(`marker${busId}`);
  if (targetMarker) targetMarker.classList.add('active-marker');

  // Update route stroke highlights
  const route101 = document.getElementById('route101Path');
  const route202 = document.getElementById('route202Path');
  const route303 = document.getElementById('route303Path');

  if (route101) route101.setAttribute('stroke-width', busId === '101' ? '6' : '3');
  if (route202) route202.setAttribute('stroke-width', busId === '202' ? '6' : '3');
  if (route303) route303.setAttribute('stroke-width', busId === '303' ? '6' : '3');
}

/* ==========================================================
   SIMULATOR: DRIVER CONTROLS (SEATS & AVAILABILITY)
   ========================================================== */
function changeDriverSeats(delta) {
  const current = appState.bus101.availableSeats;
  const updated = Math.min(40, Math.max(0, current + delta));
  appState.bus101.availableSeats = updated;

  syncAllViews();
}

function toggleDriverService() {
  appState.bus101.isInService = !appState.bus101.isInService;
  syncAllViews();
}

function simulateBusMovement() {
  appState.bus101.currentStopIndex = (appState.bus101.currentStopIndex + 1) % STOPS_101.length;
  syncTimelineStops();

  // Animate marker on map
  const marker = document.getElementById('marker101');
  if (marker) {
    if (appState.bus101.currentStopIndex === 0) {
      marker.style.top = '78%';
      marker.style.left = '16%';
    } else if (appState.bus101.currentStopIndex === 1) {
      marker.style.top = '50%';
      marker.style.left = '55%';
    } else {
      marker.style.top = '22%';
      marker.style.left = '84%';
    }
  }

  // Update banner message
  const banner = document.getElementById('simProximityBanner');
  const msg = document.getElementById('proximityMsg');
  if (banner && msg) {
    banner.style.display = 'flex';
    const stopName = STOPS_101[appState.bus101.currentStopIndex].name;
    msg.textContent = `BUS 101 has arrived at ${stopName}!`;
  }
}

function syncTimelineStops() {
  const step1 = document.getElementById('stopStep1');
  const step2 = document.getElementById('stopStep2');
  const step3 = document.getElementById('stopStep3');
  const statusLabel = document.getElementById('currentStopStatus');

  const idx = appState.bus101.currentStopIndex;

  [step1, step2, step3].forEach((step, i) => {
    if (!step) return;
    step.className = 'stop-step';
    const marker = step.querySelector('.step-marker');
    if (i < idx) {
      step.classList.add('passed');
      if (marker) marker.textContent = '✓';
    } else if (i === idx) {
      step.classList.add('current');
      if (marker) marker.textContent = '📍';
    } else {
      step.classList.add('future');
      if (marker) marker.textContent = '○';
    }
  });

  if (statusLabel) {
    statusLabel.textContent = `Current Location • ${STOPS_101[idx].name}`;
  }
}

/* ==========================================================
   SYNCHRONIZE ALL PASSENGER & DRIVER VIEWS
   ========================================================== */
function syncAllViews() {
  const bus101 = appState.bus101;
  const occupiedSeats = bus101.totalSeats - bus101.availableSeats;
  const percentage = Math.round((bus101.availableSeats / bus101.totalSeats) * 100);

  // 1. DRIVER DASHBOARD ELEMENTS
  const driverSeatDisplay = document.getElementById('driverSeatDisplay');
  const driverSeatStatus = document.getElementById('driverSeatStatusLabel');
  const serviceBtn = document.getElementById('driverServiceBtn');
  const serviceBtnText = document.getElementById('serviceBtnText');

  if (driverSeatDisplay) {
    driverSeatDisplay.textContent = bus101.availableSeats;
  }
  if (driverSeatStatus) {
    driverSeatStatus.textContent = `${bus101.availableSeats} Free • ${occupiedSeats} Occupied`;
    driverSeatStatus.style.color = bus101.availableSeats === 0 ? '#FF7B88' : '#72E3A0';
  }

  if (serviceBtn && serviceBtnText) {
    if (bus101.isInService) {
      serviceBtn.className = 'service-toggle active';
      serviceBtnText.textContent = 'IN SERVICE';
    } else {
      serviceBtn.className = 'service-toggle inactive';
      serviceBtnText.textContent = 'NOT IN SERVICE';
    }
  }

  // 2. PASSENGER VIEW ELEMENTS FOR BUS 101
  const sim101SeatText = document.getElementById('sim101SeatText');
  const sim101Progress = document.getElementById('sim101Progress');
  const badge101 = document.getElementById('badge101');
  const marker101Pill = document.querySelector('#marker101 .marker-pill');
  const marker101Circle = document.querySelector('#marker101 .marker-circle');

  if (sim101SeatText) {
    if (!bus101.isInService) {
      sim101SeatText.innerHTML = '<span class="danger"><strong>Out of Service</strong></span>';
    } else if (bus101.availableSeats === 0) {
      sim101SeatText.innerHTML = '<span class="danger"><strong>0</strong> Seats Available (Puno)</span>';
    } else {
      sim101SeatText.innerHTML = `<strong>${bus101.availableSeats}</strong> Available Seats`;
    }
  }

  if (sim101Progress) {
    sim101Progress.style.width = `${percentage}%`;
    if (!bus101.isInService || bus101.availableSeats === 0) {
      sim101Progress.className = 'sim-progress-fill danger';
    } else if (bus101.availableSeats < 10) {
      sim101Progress.className = 'sim-progress-fill warning';
    } else {
      sim101Progress.className = 'sim-progress-fill';
    }
  }

  if (badge101) {
    if (!bus101.isInService) {
      badge101.className = 'badge badge-danger';
      badge101.textContent = 'Not Available';
    } else if (bus101.availableSeats === 0) {
      badge101.className = 'badge badge-danger';
      badge101.textContent = 'Full • 5 min';
    } else {
      badge101.className = 'badge badge-success';
      badge101.textContent = 'Arriving • 5 min';
    }
  }

  if (marker101Pill) {
    if (!bus101.isInService) {
      marker101Pill.textContent = 'BUS 101 • OFFLINE';
      marker101Pill.className = 'marker-pill full';
    } else if (bus101.availableSeats === 0) {
      marker101Pill.textContent = 'BUS 101 • FULL';
      marker101Pill.className = 'marker-pill full';
    } else {
      marker101Pill.textContent = `BUS 101 • ${bus101.availableSeats} Seats`;
      marker101Pill.className = 'marker-pill';
    }
  }

  if (marker101Circle) {
    if (!bus101.isInService || bus101.availableSeats === 0) {
      marker101Circle.classList.add('full');
    } else {
      marker101Circle.classList.remove('full');
    }
  }
}

/* ==========================================================
   PROXIMITY RADAR ALERTS & THRESHOLD CONTROLS
   ========================================================== */
function dismissProximity() {
  const banner = document.getElementById('simProximityBanner');
  if (banner) banner.style.display = 'none';
}

function setThreshold(btn, distance) {
  appState.monitorThreshold = distance;

  document.querySelectorAll('.btn-thresh').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const banner = document.getElementById('simProximityBanner');
  const msg = document.getElementById('proximityMsg');
  if (banner && msg) {
    banner.style.display = 'flex';
    msg.textContent = `Alert threshold updated to ${distance}. You will be alerted when BUS 101 enters this radius.`;
  }
}

function toggleMonitor(event, busId) {
  event.stopPropagation();
  const busKey = `bus${busId}`;
  if (!appState[busKey]) return;

  appState[busKey].isMonitored = !appState[busKey].isMonitored;
  const btn = event.currentTarget;

  if (appState[busKey].isMonitored) {
    btn.className = 'btn-monitor';
    btn.textContent = '🔔 Alert Active';
  } else {
    btn.className = 'btn-monitor inactive';
    btn.textContent = '🔔 Monitor';
  }
}

