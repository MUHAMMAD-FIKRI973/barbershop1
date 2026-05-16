// ===== HOME PAGE =====
async function renderHome(app) {
  let barbers = [], services = [], testimonials = [];
  try { barbers = await api('/api/bookings/barbers'); } catch(e) {}
  try { services = await api('/api/bookings/services'); } catch(e) {}
  try { testimonials = await api('/api/bookings/testimonials'); } catch(e) {}

  app.innerHTML = `
  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="container">
      <div class="hero-content">
        <h1>Elevate Your Style</h1>
        <p>Step into the world of premium grooming at Iron & Gold. Where craftsmanship meets sophistication, and every cut tells a story. Your transformation starts here.</p>
        <div class="hero-actions">
          <button class="btn btn-primary" data-page="booking">Book an Appointment</button>
          <button class="btn btn-outline" data-page="shop">Explore Products</button>
        </div>
      </div>
    </div>
  </section>

  <!-- ABOUT -->
  <section class="about">
    <div class="container">
      <div class="about-grid">
        <div>
          <div class="section-label">Our Story</div>
          <h2 class="section-title">Meticulous Craft, Uncompromising Quality</h2>
          <p class="about-text section-desc">Founded in 2014, Iron & Gold has grown from a single chair operation to a premier grooming destination. We combine traditional barbering techniques with modern styling to deliver an experience that's truly exceptional.</p>
          <p class="about-text section-desc" style="margin-top:12px">Every visit to Iron & Gold is a commitment to excellence — from the premium products we use to the skilled hands that shape your look.</p>
        </div>
        <div class="about-image">${phImg('✂')}</div>
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section>
    <div class="container">
      <div style="text-align:center;margin-bottom:16px">
        <div class="section-label">What We Offer</div>
        <h2 class="section-title">Curated Grooming</h2>
      </div>
      <div class="services-grid">
        ${services.slice(0,3).map(s => `
        <div class="service-card">
          <div class="card-img">${imgOrPh(s.image, s.name)}</div>
          <div class="card-body">
            <h3>${s.name}</h3>
            <p>${s.description}</p>
            <div class="card-footer">
              <span class="price">$${s.price.toFixed(2)}</span>
              <a href="#booking" class="book-link" data-page="booking">Book Now →</a>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- BARBERS -->
  <section>
    <div class="container">
      <div class="section-label">Our Team</div>
      <h2 class="section-title">Meet Our Master Barbers</h2>
      <div class="barbers-grid">
        ${barbers.map(b => `
        <div class="barber-card">
          <div class="barber-avatar">${imgOrPh(b.image, b.name)}</div>
          <h3>${b.name}</h3>
          <div class="title">${b.title}</div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="testimonials">
    <div class="container">
      <div class="section-label">Reviews</div>
      <h2 class="section-title">Trusted by Gentlemen</h2>
      <div class="testimonials-grid">
        ${testimonials.map(t => `
        <div class="testimonial-card">
          <div class="stars">${stars(t.rating)}</div>
          <p>"${t.text}"</p>
          <div class="author">${t.name}</div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="container">
      <h2>Ready to <span class="gold">Transform?</span></h2>
      <p>Book your session today and experience the Iron & Gold standard of grooming.</p>
      <div class="cta-actions">
        <button class="btn btn-primary" data-page="booking">Book Online Now</button>
        <button class="btn btn-outline" data-page="haircuts">Our Services</button>
      </div>
    </div>
  </section>

  ${renderFooter()}`;
}

// ===== FOOTER =====
function renderFooter() {
  return `<footer class="footer"><div class="container">
    <div class="footer-grid">
      <div class="footer-brand"><div class="logo">✂ IRON & GOLD</div><p>The definitive source for modern grooming and traditional mastery. Since 2014.</p></div>
      <div><h4>Navigate</h4><ul><li><a href="#home" data-page="home">Home</a></li><li><a href="#haircuts" data-page="haircuts">Haircuts</a></li><li><a href="#shop" data-page="shop">Shop</a></li></ul></div>
      <div><h4>Company</h4><ul><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">Contact Us</a></li><li><a href="#">Careers</a></li></ul></div>
      <div><h4>Social</h4><ul><li><a href="#">Instagram</a></li><li><a href="#">YouTube</a></li><li><a href="#">TikTok</a></li><li><a href="#">Twitter</a></li></ul></div>
    </div>
    <div class="footer-bottom"><span>© 2024 Iron & Gold Barbershop. Crafted for the modern gentleman.</span><span></span></div>
  </div></footer>`;
}
