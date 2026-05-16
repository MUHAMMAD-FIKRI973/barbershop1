// ===== LOGIN PAGE =====
function renderLogin(app) {
  app.innerHTML = `
  <div class="login-page">
    <div class="login-left">
      <div class="bg"></div>
      <div class="content">
        <h2>Crafted for the Modern Gentleman.</h2>
        <p>Experience meticulous grooming in an atmosphere of urban luxury and refined excellence.</p>
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-wrap">
        <a href="#home" data-page="home" style="display:block;margin-bottom:32px;font-size:.85rem">← Back to Home</a>
        <h2>Welcome Back</h2>
        <p class="subtitle">Enter your credentials to manage your bookings and profile.</p>
        <div class="social-btns">
          <button class="social-btn" onclick="showToast('Google login coming soon')"><span>G</span> Google</button>
          <button class="social-btn" onclick="showToast('Apple login coming soon')"><span>🍎</span> Apple</button>
        </div>
        <div class="divider"><span>Or Email</span></div>
        <form id="login-form" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-input" id="login-email" placeholder="gentleman@ironandgold.com" required>
          </div>
          <div class="form-group">
            <label>Password <a href="#" onclick="showToast('Password reset coming soon');return false">Forgot Password?</a></label>
            <div class="input-wrap">
              <input type="password" class="form-input" id="login-pw" placeholder="••••••••" required>
              <button type="button" class="toggle-pw" onclick="togglePw('login-pw',this)">👁</button>
            </div>
          </div>
          <div class="remember-row"><input type="checkbox" id="login-remember"><label for="login-remember">Remember me for 30 days</label></div>
          <button type="submit" class="btn btn-primary" id="login-btn">Login</button>
        </form>
        <p class="login-footer-text">Don't have an account? <a href="#register" data-page="register">Join the Club</a></p>
      </div>
    </div>
    <div class="login-page-footer">© 2024 Iron & Gold Barbershop. Crafted for the modern gentleman.</div>
  </div>`;
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  btn.innerHTML = '<div class="loading-spinner"></div>';
  try {
    const data = await api('/api/auth/login', { method: 'POST', body: {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-pw').value,
      remember: document.getElementById('login-remember').checked
    }});
    setAuth(data);
    showToast('Welcome back, ' + data.user.name + '!');
    navigate(data.user.role === 'admin' ? 'admin' : 'home');
  } catch (err) { showToast(err.message); btn.textContent = 'Login'; }
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🔒';
}

// ===== REGISTER PAGE =====
function renderRegister(app) {
  app.innerHTML = `
  <div class="login-page">
    <div class="login-left">
      <div class="bg"></div>
      <div class="content">
        <h2>Join the Club.</h2>
        <p>Become part of an exclusive community of gentlemen who value precision and style.</p>
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-wrap">
        <a href="#home" data-page="home" style="display:block;margin-bottom:32px;font-size:.85rem">← Back to Home</a>
        <h2>Create Account</h2>
        <p class="subtitle">Join Iron & Gold to book appointments and shop premium products.</p>
        <form onsubmit="handleRegister(event)">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" class="form-input" id="reg-name" placeholder="Your full name" required>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-input" id="reg-email" placeholder="your@email.com" required>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" class="form-input" id="reg-phone" placeholder="Your phone number">
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="input-wrap">
              <input type="password" class="form-input" id="reg-pw" placeholder="Min 6 characters" required minlength="6">
              <button type="button" class="toggle-pw" onclick="togglePw('reg-pw',this)">👁</button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" id="reg-btn">Create Account</button>
        </form>
        <p class="login-footer-text" style="margin-top:20px">Already have an account? <a href="#login" data-page="login">Sign In</a></p>
      </div>
    </div>
  </div>`;
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('reg-btn');
  btn.innerHTML = '<div class="loading-spinner"></div>';
  try {
    const data = await api('/api/auth/register', { method: 'POST', body: {
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      phone: document.getElementById('reg-phone').value,
      password: document.getElementById('reg-pw').value
    }});
    setAuth(data);
    showToast('Welcome to Iron & Gold, ' + data.user.name + '!');
    navigate('home');
  } catch (err) { showToast(err.message); btn.textContent = 'Create Account'; }
}
