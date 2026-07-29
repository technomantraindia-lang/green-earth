/**
 * Green Earth Commodity FZ LLC
 * Reusable Header and Footer Web Components (Redesigned Light Theme)
 * 
 * To reuse the header and footer on any page, include this script:
 * <script src="header-footer.js" defer></script>
 * And use the custom HTML tags:
 * <custom-header></custom-header>
 * <custom-footer></custom-footer>
 */

class CustomHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="navbar-container">
                <nav class="navbar">
                    <a href="index.html" class="logo-container">
                        <img src="image/NEWST%20LOGO.png" alt="Green Earth Commodity Logo" class="logo-img">
                        <div class="logo-brand-stack">
                            <div class="logo-text">
                                GREEN EARTH
                                <span>Commodity FZ LLC</span>
                            </div>
                            <span class="logo-tagline">Sustainable Global Commodity Trading Partner</span>
                        </div>
                    </a>
                    
                    <ul class="nav-menu" id="nav-menu">
                        <li><a href="index.html#hero" class="nav-link">Home</a></li>
                        <li><a href="about.html" class="nav-link">About Us</a></li>
                        <li><a href="service.html" class="nav-link">Services</a></li>
                        <li class="nav-dropdown">
                            <div class="nav-dropdown-trigger">
                                <a href="product.html" class="nav-link">Products</a>
                                <button class="nav-dropdown-toggle" type="button" aria-label="Show product categories" aria-expanded="false">
                                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                                </button>
                            </div>
                            <ul class="nav-dropdown-menu">
                                <li><a href="metals.html">Ferrous &amp; Non Ferrous Metals</a></li>
                                <li><a href="steel.html">Secondary Steel Coils &amp; Sheets</a></li>
                                <li><a href="rubber.html">Used Tyre Rubber Scrap</a></li>
                                <li><a href="plastic.html">Plastic Scrap</a></li>
                                <li><a href="paper.html">Waste Paper</a></li>
                                <li><a href="wood.html">Wood Raw Materials</a></li>
                            </ul>
                        </li>
                        <li><a href="contact.html" class="nav-link">Contact</a></li>
                    </ul>
                    
                    <div class="nav-cta">
                        <a href="contact.html" class="btn btn-secondary" style="padding: 0.6rem 1.5rem; font-size: 0.9rem; border-radius: 50px;">Get in Touch</a>
                    </div>
                    
                    <div class="menu-toggle" id="mobile-menu">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </nav>
            </div>
        `;
        
        // Setup mobile menu event listeners (self-contained logic)
        const mobileMenu = this.querySelector('#mobile-menu');
        const navMenu = this.querySelector('#nav-menu');
        const navLinks = this.querySelectorAll('.nav-link');
        const dropdown = this.querySelector('.nav-dropdown');
        const dropdownToggle = this.querySelector('.nav-dropdown-toggle');
        
        if (mobileMenu && navMenu) {
            mobileMenu.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });

            if (dropdown && dropdownToggle) {
                dropdownToggle.addEventListener('click', () => {
                    const isOpen = dropdown.classList.toggle('open');
                    dropdownToggle.setAttribute('aria-expanded', String(isOpen));
                });
            }
        }
    }
}

class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="container">
                <div class="footer-top">
                    <div class="footer-brand">
                        <a href="index.html#hero" class="footer-logo">
                            <img src="image/NEWST%20LOGO.png" alt="Green Earth Logo" class="footer-logo-img">
                            <div class="footer-logo-text">
                                GREEN EARTH
                                <div style="font-size: 0.6rem; font-weight: 600; color: #475569; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 0.25rem;">Commodity FZ LLC</div>
                            </div>
                        </a>
                        <p class="footer-brand-desc">
                            Connecting Global Suppliers and Industrial Buyers through transparent Trading, Efficient Logistics, and Custom-tailored Supply Chain Solutions in the Recycling Industry.
                        </p>
                        <div class="footer-social-links" aria-label="Contact Green Earth">
                            <a href="mailto:Office@greenearthcommodity.com" aria-label="Email Green Earth">
                                <i class="fa-solid fa-envelope"></i>
                            </a>
                            <a href="https://wa.me/971562050163" target="_blank" rel="noopener noreferrer" aria-label="Chat with Green Earth on WhatsApp">
                                <i class="fa-brands fa-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer-column">
                        <h4 class="footer-column-title">Quick Links</h4>
                        <ul class="footer-links">
                            <li class="footer-link-item"><a href="index.html#hero">Home</a></li>
                            <li class="footer-link-item"><a href="about.html">About Us</a></li>
                            <li class="footer-link-item"><a href="service.html">Services</a></li>
                            <li class="footer-link-item"><a href="product.html">Products</a></li>
                            <li class="footer-link-item"><a href="contact.html">Contact</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h4 class="footer-column-title">Products</h4>
                        <ul class="footer-links">
                            <li class="footer-link-item"><a href="metals.html">Non Ferrous & Ferrous Metals</a></li>
                            <li class="footer-link-item"><a href="steel.html">Secondary Steel Coils & Sheets</a></li>
                            <li class="footer-link-item"><a href="rubber.html">Used Tyre Rubber Scrap</a></li>
                            <li class="footer-link-item"><a href="plastic.html">Plastic Scrap</a></li>
                            <li class="footer-link-item"><a href="paper.html">Waste Paper</a></li>
                            <li class="footer-link-item"><a href="wood.html">Wood Raw Materials</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h4 class="footer-column-title">Contact Us</h4>
                        <ul class="footer-contact-list">
                            <li class="footer-contact-item">
                                <i class="fa-solid fa-location-dot"></i>
                                <span>VUNE1239, Compass Building<br>Al Hulaila Industrial Zone – FZ<br>Ras Al Khaimah, United Arab Emirates</span>
                            </li>
                            <li class="footer-contact-item">
                                <i class="fa-solid fa-envelope"></i>
                                <a href="mailto:Office@greenearthcommodity.com" style="color: #475569; text-decoration: none;">Office@greenearthcommodity.com</a>
                            </li>
                            <li class="footer-contact-item">
                                <i class="fa-brands fa-whatsapp"></i>
                                <a href="https://wa.me/971562050163" target="_blank" style="color: #475569; text-decoration: none;">+971 56 2050163</a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; 2026 Green Earth Commodity FZ LLC. All Rights Reserved.</p>
                    <div class="footer-legal-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms & Conditions</a>
                    </div>
                </div>
            </div>

            <!-- Floating WhatsApp Button -->
            <a href="https://wa.me/971562050163" target="_blank" class="whatsapp-float-btn" aria-label="Chat on WhatsApp">
                <i class="fa-brands fa-whatsapp"></i>
                <span class="whatsapp-tooltip">Chat with Us!</span>
            </a>
        `;
    }
}

customElements.define('custom-header', CustomHeader);
customElements.define('custom-footer', CustomFooter);
