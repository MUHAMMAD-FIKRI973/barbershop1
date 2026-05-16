// ===== BOOKING PAGE =====
let bookingState = { step: 1, service: null, barber: null, date: '', time: '' };

async function renderBooking(app) {
  if (!currentUser) { showToast('Please login to book'); navigate('login'); return; }
  let services = [], barbers = [];
  try { services = await api('/api/bookings/services'); } catch(e) {}
  try { barbers = await api('/api/bookings/barbers'); } catch(e) {}
  window._bkServices = services;
  window._bkBarbers = barbers;
  bookingState = { step: 1, service: null, barber: null, date: '', time: '' };
  renderBookingStep(app, services, barbers);
}

function renderBookingStep(app, services, barbers) {
  const s = bookingState;
  const steps = ['Service','Barber','Schedule','Details'];
  const stepperHTML = steps.map((st,i) => `<div class="step ${i+1===s.step?'active':''} ${i+1<s.step?'done':''}">
    <div class="num">${i+1}</div><div class="label">${st}</div>
  </div>`).join('');

  let content = '';
  if (s.step === 1) {
    content = `<div><h2 style="font-size:1.8rem;margin-bottom:8px">Select Your Service</h2>
    <p style="color:var(--text3);margin-bottom:32px">Every experience at IRON & GOLD includes a consultation and premium scalp massage.</p>
    ${services.map(sv => `<div class="service-select-card ${s.service&&s.service.id===sv.id?'selected':''}" onclick="selectService(${sv.id})">
      <div class="top"><span class="icon">✂</span><span class="price">$${sv.price.toFixed(2)}</span></div>
      <h4>${sv.name}</h4><p>${sv.description}</p>
      <div class="meta"><span>${sv.duration} MIN</span>${sv.id===1?'<span>MOST POPULAR</span>':''}</div>
    </div>`).join('')}
    </div>`;
  } else if (s.step === 2) {
    content = `<div><h2 style="font-size:1.8rem;margin-bottom:24px">Choose Your Expert</h2>
    <div class="barber-select-grid">
      ${barbers.map(b => `<div class="barber-select-card ${s.barber&&s.barber.id===b.id?'selected':''}" onclick="selectBarber(${b.id})">
        <div class="avatar">${imgOrPh(b.image, b.name)}</div>
        <h4>${b.name}</h4><div class="title">${b.title}</div>
      </div>`).join('')}
      <div class="barber-select-card ${s.barber&&s.barber.id===0?'selected':''}" onclick="selectBarber(0)">
        <div class="avatar"><div class="placeholder-img">👥</div></div>
        <h4>Anyone</h4><div class="title">Next Available</div>
      </div>
    </div></div>`;
  } else if (s.step === 3) {
    content = `<div><h2 style="font-size:1.8rem;margin-bottom:24px">Pick Date & Time</h2>
    <div class="form-group"><label>Date</label>
      <input type="date" class="form-input" id="bk-date" value="${s.date}" min="${new Date().toISOString().split('T')[0]}" onchange="bookingState.date=this.value"></div>
    <div class="form-group"><label>Time</label>
      <select class="form-input" id="bk-time" onchange="bookingState.time=this.value">
        <option value="">Select time</option>
        ${['09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'].map(t => `<option value="${t}" ${s.time===t?'selected':''}>${t}</option>`).join('')}
      </select></div></div>`;
  } else {
    content = `<div><h2 style="font-size:1.8rem;margin-bottom:24px">Confirm Details</h2>
    <div class="form-group"><label>Notes (optional)</label>
      <textarea class="form-input" id="bk-notes" rows="3" placeholder="Any special requests..."></textarea></div>
    <div style="background:var(--bg-card);padding:20px;border-radius:var(--radius);border:1px solid var(--border);margin-top:16px">
      <p><strong>Service:</strong> ${s.service?s.service.name:'-'}</p>
      <p><strong>Barber:</strong> ${s.barber?(s.barber.id===0?'Next Available':s.barber.name):'-'}</p>
      <p><strong>Date:</strong> ${s.date || '-'}</p>
      <p><strong>Time:</strong> ${s.time || '-'}</p>
      <p style="color:var(--gold);font-size:1.2rem;margin-top:12px"><strong>Total: $${s.service?s.service.price.toFixed(2):'0.00'}</strong></p>
    </div></div>`;
  }

  const summaryHTML = s.service ? `<div class="booking-summary">
    <h3>Booking Summary</h3>
    <div class="summary-row"><span class="lbl">Service</span><span class="val">${s.service.name}</span></div>
    <div class="summary-row"><span class="lbl">Price</span><span class="val" style="color:var(--gold)">$${s.service.price.toFixed(2)}</span></div>
    ${s.barber?`<div class="summary-row"><span class="lbl">Barber</span><span class="val">${s.barber.id===0?'Next Available':s.barber.name}</span></div>`:''}
    ${s.date?`<div class="summary-row"><span class="lbl">Date</span><span class="val">${s.date}</span></div>`:''}
    ${s.time?`<div class="summary-row"><span class="lbl">Time</span><span class="val">${s.time}</span></div>`:''}
    <div class="summary-total"><span>Total</span><span>$${s.service.price.toFixed(2)}</span></div>
    <p class="summary-note">Pay at the studio after your service. Free cancellation up to 24h before.</p>
    <div class="summary-secure">🔒 Secure Checkout Experience</div>
  </div>` : '';

  app.innerHTML = `<div class="booking-page"><div class="container">
    <div class="stepper">${stepperHTML}</div>
    <div class="booking-layout"><div>${content}
      <div class="booking-nav">
        ${s.step>1?`<button class="btn btn-outline" onclick="bkPrev()">← Back</button>`:'<span></span>'}
        ${s.step<4?`<button class="btn btn-primary" onclick="bkNext()">Continue</button>`
          :`<button class="btn btn-primary" onclick="submitBooking()">Confirm Booking</button>`}
      </div>
    </div>${summaryHTML}</div>
  </div></div>${renderFooter()}`;
}

function selectService(id) {
  bookingState.service = window._bkServices.find(s => s.id === id);
  renderBookingStep(document.getElementById('app'), window._bkServices, window._bkBarbers);
}
function selectBarber(id) {
  if (id === 0) bookingState.barber = { id: 0, name: 'Next Available' };
  else bookingState.barber = window._bkBarbers.find(b => b.id === id);
  renderBookingStep(document.getElementById('app'), window._bkServices, window._bkBarbers);
}
function bkNext() {
  const s = bookingState;
  if (s.step===1 && !s.service) { showToast('Please select a service'); return; }
  if (s.step===2 && !s.barber) { showToast('Please select a barber'); return; }
  if (s.step===3 && (!s.date||!s.time)) { showToast('Please pick date and time'); return; }
  s.step++;
  renderBookingStep(document.getElementById('app'), window._bkServices, window._bkBarbers);
}
function bkPrev() {
  bookingState.step--;
  renderBookingStep(document.getElementById('app'), window._bkServices, window._bkBarbers);
}
async function submitBooking() {
  const s = bookingState;
  try {
    const barberId = s.barber.id === 0 ? window._bkBarbers[0].id : s.barber.id;
    await api('/api/bookings', { method:'POST', body: {
      barber_id: barberId, service_id: s.service.id,
      booking_date: s.date, booking_time: s.time,
      notes: document.getElementById('bk-notes')?.value || ''
    }});
    showToast('Booking confirmed! See you soon.');
    navigate('home');
  } catch(e) { showToast(e.message); }
}
