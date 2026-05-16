// ===== ADMIN DASHBOARD =====
async function renderAdmin(app) {
  if (!currentUser || currentUser.role !== 'admin') { showToast('Admin access required'); navigate('login'); return; }
  let bookings = [], products = [];
  try { bookings = await api('/api/bookings/all'); } catch(e) {}
  try { products = await api('/api/products'); } catch(e) {}

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.booking_date === today);
  const revenue = todayBookings.reduce((s, b) => s + (b.price || 0), 0);

  app.innerHTML = `<div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="brand">Admin Portal</div>
      <div class="sub">Manage Studio</div>
      <ul class="admin-nav">
        <li><a class="active" href="#admin">📊 Dashboard</a></li>
        <li><a href="#" onclick="showToast('Coming soon');return false">📅 Appointments</a></li>
        <li><a href="#" onclick="showToast('Coming soon');return false">📦 Products</a></li>
        <li><a href="#" onclick="showToast('Coming soon');return false">⏰ Schedule</a></li>
        <li><a href="#" onclick="showToast('Coming soon');return false">⚙ Settings</a></li>
      </ul>
      <div class="admin-bottom">
        <button class="new-booking" data-page="booking">+ New Booking</button>
        <div class="user-info">
          <div class="user-avatar"></div>
          <div><div class="user-name">${currentUser.name}</div><div class="user-role">Master Barber</div></div>
        </div>
      </div>
    </aside>
    <main class="admin-content">
      <div class="admin-header">
        <div><h1>Overview</h1><p>Good morning, ${currentUser.name}. Here's what's happening today.</p></div>
        <div class="actions">
          <button class="btn btn-outline btn-sm" onclick="showToast('Inventory updated')">📦 Update Inventory</button>
          <button class="notif-btn">🔔</button>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Today's Bookings</div><div class="stat-value">${todayBookings.length}</div><div class="stat-change">📈 +15% from yesterday</div><div class="stat-icon">✓</div></div>
        <div class="stat-card"><div class="stat-label">Daily Revenue</div><div class="stat-value">$${revenue.toFixed(0)}</div><div class="stat-change">⏱ 85% of target reached</div><div class="stat-icon">💰</div></div>
        <div class="stat-card"><div class="stat-label">Active Customers</div><div class="stat-value">84</div><div class="stat-change">👥 4 new members today</div><div class="stat-icon">👤</div></div>
      </div>
      <div class="admin-grid">
        <div>
          <div class="panel">
            <div class="panel-header"><h2>Upcoming Appointments</h2><a href="#">View Calendar</a></div>
            ${bookings.slice(0,5).map(b => {
              const d = new Date(b.booking_date);
              const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
              return `<div class="appointment-item">
                <div class="date-badge"><div class="month">${months[d.getMonth()]}</div><div class="day">${d.getDate()}</div></div>
                <div class="info"><h4>${b.customer_name}</h4><p>${b.service_name}</p></div>
                <div class="time">${b.booking_time}<div class="duration">${b.status}</div></div>
                <span class="type-badge styling">STYLING</span>
              </div>`;
            }).join('') || '<p style="color:var(--text4);padding:20px 0">No appointments yet</p>'}
          </div>
        </div>
        <div>
          <div class="panel">
            <div class="panel-header"><h2>Recent Product Sales</h2></div>
            ${products.slice(0,3).map(p => `<div class="sale-item">
              <div class="thumb">${imgOrPh(p.image, p.name)}</div>
              <div class="info"><h4>${p.name}</h4><p>Sold to Customer</p></div>
              <div class="sale-price">$${p.price.toFixed(2)}</div>
            </div>`).join('')}
            <button class="btn btn-outline btn-sm" style="width:100%;margin-top:16px" onclick="showToast('Reports coming soon')">Inventory Reports</button>
          </div>
          <div class="panel">
            <div class="panel-header"><h2>Staff Performance</h2></div>
            <div class="staff-bar"><div class="staff-info"><span>Marcus Vane</span><span class="pct">98% Booked</span></div><div class="bar"><div class="fill" style="width:98%"></div></div></div>
            <div class="staff-bar"><div class="staff-info"><span>Leo Sterling</span><span class="pct">74% Booked</span></div><div class="bar"><div class="fill" style="width:74%"></div></div></div>
            <div class="staff-bar"><div class="staff-info"><span>Jordan Nash</span><span class="pct">62% Booked</span></div><div class="bar"><div class="fill" style="width:62%"></div></div></div>
          </div>
        </div>
      </div>
    </main>
  </div>`;
}
