/**
 * Green Earth Commodity FZ LLC
 * Client-Side Interaction & Scroll Reveal Script
 */

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-enabled');
    const preloader = document.getElementById('site-preloader');
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenPreloader = sessionStorage.getItem('greenearth_preloader_seen') === 'true';

    // Elements to animate on page reveal
    const header = document.querySelector('custom-header');
    const heading = document.querySelector('#about-us .about-heading');
    const paragraph = document.querySelector('#about-us .about-lead-green');
    const btn = document.querySelector('#about-us .about-btn-pill');
    const heroImage = document.querySelector('.about-img-box img');
    
    // Additional secondary elements we can animate for a complete feel:
    const tag = document.querySelector('#about-us .about-tag-container');
    const textEls = document.querySelectorAll('#about-us .about-text');
    const badge = document.querySelector('#about-us .about-badge-card-overlay');
    const border = document.querySelector('#about-us .about-border-overlay');
    const features = document.querySelector('#about-us .about-features-card');
    const blobs = document.querySelectorAll('.bg-blob');

    if (preloader) {
        initPreloader();
    } else {
        document.body.classList.add('page-loaded');
    }

    function initPreloader() {
        // Prevent scrolling while loader is active
        document.body.classList.add('preloader-active');

        if (isReducedMotion) {
            // Skips complex animations for reduced-motion users
            setTimeout(() => {
                closePreloader(300);
            }, 500);
            return;
        }

        if (hasSeenPreloader) {
            // Same-session transition: 250-400ms fade-out of overlay
            setTimeout(() => {
                closePreloader(350);
            }, 100);
            return;
        }

        // First visit: Keep loader visible for approximately 3.0 seconds (3000ms)
        // Wait for page load or a safety timeout (max 3700ms)
        const startTime = Date.now();
        const minDuration = 3000;
        let preloaderFinished = false;

        function finishPreloader() {
            if (preloaderFinished) return;
            preloaderFinished = true;

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDuration - elapsed);

            setTimeout(() => {
                sessionStorage.setItem('greenearth_preloader_seen', 'true');
                closePreloader(600); // 600ms fade out transition matching CSS
            }, remaining);
        }

        if (document.readyState === 'complete') {
            finishPreloader();
        } else {
            window.addEventListener('load', finishPreloader, { once: true });
        }

        // Safety timeout in case load event gets delayed
        setTimeout(finishPreloader, 3700);
    }

    function closePreloader(fadeDuration) {
        if (!preloader) return;
        
        // Hide the loader visually by adding the CSS fade-out class
        preloader.classList.add('fade-out');

        // Apply a smooth reveal sequence after fade-out transition finishes
        setTimeout(() => {
            document.body.classList.remove('preloader-active');
            preloader.style.display = 'none';
            preloader.remove(); // Cleanly remove from DOM to prevent blocking
            document.body.classList.add('page-loaded');
        }, fadeDuration);
    }

    // animatePageEntry removed - handled by CSS transitions based on body.page-loaded class

    /* --- STICKY HEADER SCROLL TRANSITION --- */
    const handleHeaderScroll = () => {
        const customHeader = document.querySelector('custom-header');
        if (!customHeader) return;
        
        if (window.scrollY > 50) {
            customHeader.classList.add('header-active');
        } else {
            customHeader.classList.remove('header-active');
        }
    };
    
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Trigger initial run on load


    /* --- BACK TO TOP BUTTON --- */
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    /* --- SMOOTH NAVIGATION LINK SCROLLING --- */
    // Select all links with hash tags, including inside the Custom Element header
    document.body.addEventListener('click', (e) => {
        const targetLink = e.target.closest('a');
        if (!targetLink) return;
        
        const href = targetLink.getAttribute('href');
        
        // Check if link is an anchor link pointing to the current page
        if (href && href.startsWith('#')) {
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Get header height for scrolling offset
                const header = document.querySelector('.navbar');
                const headerHeight = header ? header.offsetHeight : 80;
                
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerHeight;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });


    /* --- INTERSECTION OBSERVER FOR SCROLL REVEAL --- */
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once animated in
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null, // Viewport
            threshold: 0.1, // Trigger when 10% visible
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before entering screen
        });
        
        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(element => {
            element.classList.add('active');
        });
    }


    /* --- CONTACT FORM HANDLING --- */
    const contactForm = document.getElementById('contact-form');
    const formAlert = document.getElementById('form-alert');
    
    if (contactForm && formAlert) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
            // Set loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>Sending Inquiry...</span>
                <i class="fa-solid fa-circle-notch fa-spin" style="margin-left: 5px;"></i>
            `;
            
            // Extract values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Client-side Validation (simple checks)
            if (!name || !email || !subject || !message) {
                showNotification('Error: Please fill in all required fields.', 'error');
                resetBtnState(submitBtn, originalBtnHtml);
                return;
            }
            
            // Simulate API request (delay)
            setTimeout(() => {
                // Successful submission mockup
                showNotification(`
                    <i class="fa-solid fa-circle-check" style="margin-right: 10px; font-size: 1.25rem;"></i>
                    <strong>Thank you, ${name}!</strong> Your inquiry has been sent successfully. Our team will contact you shortly at ${email}.
                `, 'success');
                
                // Clear input fields
                contactForm.reset();
                resetBtnState(submitBtn, originalBtnHtml);
                
                // Smooth scroll back to form notification
                formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Clear alert after 8 seconds
                setTimeout(() => {
                    formAlert.style.display = 'none';
                    formAlert.className = 'form-notification';
                }, 8000);
                
            }, 1800); // 1.8 seconds processing time simulation
        });
    }
    
    function showNotification(msg, type) {
        formAlert.innerHTML = msg;
        formAlert.style.display = 'flex';
        formAlert.className = 'form-notification ' + type;
    }
    
    function resetBtnState(btn, originalHtml) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }

    /* --- OUR SERVICES TOGGLE --- */
    const toggleServicesBtn = document.getElementById('toggle-services-btn');
    if (toggleServicesBtn) {
        toggleServicesBtn.addEventListener('click', () => {
            const hiddenCards = document.querySelectorAll('.service-card-mockup.hidden-card');
            const isExpanded = toggleServicesBtn.getAttribute('data-expanded') === 'true';
            
            if (isExpanded) {
                // Collapse
                hiddenCards.forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.classList.add('hidden-service');
                    }, 400);
                });
                toggleServicesBtn.innerHTML = '<span>See More Services</span><i class="fa-solid fa-chevron-down" style="margin-left: 0.5rem;"></i>';
                toggleServicesBtn.setAttribute('data-expanded', 'false');
            } else {
                // Expand
                hiddenCards.forEach((card, index) => {
                    card.classList.remove('hidden-service');
                    // Stagger animation
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100 + 50);
                });
                toggleServicesBtn.innerHTML = '<span>See Less Services</span><i class="fa-solid fa-chevron-up" style="margin-left: 0.5rem;"></i>';
                toggleServicesBtn.setAttribute('data-expanded', 'true');
            }
        });
    }

    /* --- SUSTAINABILITY ORBIT HOVER HANDLER --- */
    const orbitNodes = document.querySelectorAll('.sus-orbit-node');
    const parentBox = document.querySelector('.sus-interactive-box');
    const detailsCard = document.querySelector('.sus-orbit-tooltip');
    const detailsTitle = document.querySelector('.sus-tooltip-title');
    const detailsDesc = document.querySelector('.sus-tooltip-desc');
    
    if (orbitNodes.length > 0 && detailsCard) {
        orbitNodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                // If it is already active, don't do anything
                if (node.classList.contains('active')) return;
                
                // Clear active from all nodes and set it on current hovered node
                orbitNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');
                
                // Extract details and index
                const index = node.getAttribute('data-index');
                const title = node.getAttribute('data-title');
                const desc = node.getAttribute('data-desc');
                
                // Update parent container class to adjust tooltip top/left coordinates
                if (parentBox) {
                    parentBox.className = `sus-interactive-box active-node-${index}`;
                }
                
                // Fade out card contents smoothly
                detailsCard.style.opacity = '0';
                
                setTimeout(() => {
                    // Update text details
                    if (detailsTitle) detailsTitle.textContent = title;
                    if (detailsDesc) detailsDesc.textContent = desc;
                    
                    // Fade back in
                    detailsCard.style.opacity = '1';
                }, 150);
            });
        });
    }

    /* --- GLOBAL NETWORK INTERACTIVE GLOBE --- */
    const tradeGlobeCanvas = document.getElementById('trade-globe-canvas');
    const tradeGlobeStage = document.getElementById('trade-globe-stage');

    if (tradeGlobeCanvas && tradeGlobeStage) {
        initTradeGlobe(tradeGlobeCanvas, tradeGlobeStage);
    }

    function initTradeGlobe(canvas, stage) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const DEG = Math.PI / 180;
        const locations = [
            { name: 'United Kingdom', short: 'UK', lat: 55.0, lon: -2.5, type: 'supplier', dx: -15, dy: -15 },
            { name: 'Germany', short: 'Germany', lat: 51.2, lon: 10.4, type: 'supplier', dx: 12, dy: -10 },
            { name: 'Italy', short: 'Italy', lat: 42.8, lon: 12.5, type: 'supplier', dx: 12, dy: 14 },
            { name: 'United States', short: 'USA', lat: 39.8, lon: -98.6, type: 'supplier', dx: -18, dy: -12 },
            { name: 'UAE', short: 'UAE', lat: 26.0, lon: 48.0, type: 'hub', dx: -36, dy: -10 },
            { name: 'Pakistan', short: 'Pakistan', lat: 33.0, lon: 63.0, type: 'customer', dx: -32, dy: -16 },
            { name: 'India', short: 'India', lat: 19.0, lon: 77.0, type: 'customer', dx: -18, dy: 18 },
            { name: 'Bangladesh', short: 'Bangladesh', lat: 25.0, lon: 92.0, type: 'customer', dx: 12, dy: -14 },
            { name: 'China', short: 'China', lat: 41.0, lon: 100.0, type: 'customer', dx: -18, dy: -18 },
            { name: 'Vietnam', short: 'Vietnam', lat: 16.0, lon: 111.0, type: 'customer', dx: 14, dy: -4 },
            { name: 'Thailand', short: 'Thailand', lat: 14.0, lon: 98.0, type: 'customer', dx: -36, dy: 12 },
            { name: 'Malaysia', short: 'Malaysia', lat: 2.0, lon: 100.0, type: 'customer', dx: -36, dy: -4 },
            { name: 'Singapore', short: 'Singapore', lat: -1.0, lon: 104.0, type: 'customer', dx: 12, dy: 16 },
            { name: 'Indonesia', short: 'Indonesia', lat: -6.0, lon: 120.0, type: 'customer', dx: 12, dy: 12 },
            { name: 'Taiwan', short: 'Taiwan', lat: 24.0, lon: 124.0, type: 'customer', dx: 14, dy: 4 },
            { name: 'South Korea', short: 'S. Korea', lat: 40.0, lon: 132.0, type: 'customer', dx: 12, dy: -12 },
            { name: 'Sri Lanka', short: 'Sri Lanka', lat: 4.0, lon: 78.0, type: 'customer', dx: -30, dy: 18 }
        ];

        const routePairs = [
            ['United Kingdom', 'UAE'],
            ['Germany', 'UAE'],
            ['Italy', 'UAE'],
            ['United States', 'UAE'],
            ['UAE', 'India'],
            ['UAE', 'Pakistan'],
            ['UAE', 'China'],
            ['UAE', 'Vietnam'],
            ['UAE', 'Thailand'],
            ['UAE', 'Malaysia'],
            ['UAE', 'Indonesia'],
            ['UAE', 'Taiwan'],
            ['UAE', 'South Korea']
        ];

        const landPolygons = [
            [[-168, 72], [-150, 68], [-132, 58], [-124, 50], [-118, 36], [-110, 28], [-100, 25], [-90, 22], [-82, 25], [-78, 30], [-82, 44], [-95, 55], [-120, 66], [-150, 72]],
            [[-82, 12], [-74, 6], [-68, -2], [-62, -14], [-60, -24], [-66, -38], [-72, -49], [-62, -55], [-50, -50], [-46, -30], [-50, -8], [-60, 4], [-70, 10]],
            [[-10, 36], [4, 44], [18, 50], [34, 56], [56, 60], [78, 58], [100, 54], [124, 50], [142, 46], [154, 56], [164, 62], [172, 54], [156, 42], [130, 24], [110, 12], [92, 20], [74, 30], [52, 34], [34, 38], [12, 42], [-4, 40]],
            [[-18, 35], [6, 36], [22, 30], [34, 20], [42, 8], [42, -12], [32, -30], [18, -34], [4, -32], [-6, -18], [-12, 2], [-16, 20]],
            [[68, 26], [78, 34], [88, 30], [92, 22], [86, 10], [78, 8], [72, 14]],
            [[96, 22], [106, 24], [114, 20], [118, 10], [114, 2], [106, 0], [98, 8]],
            [[112, -12], [122, -10], [132, -14], [142, -18], [148, -28], [138, -38], [124, -36], [114, -26]]
        ];

        const landPoints = buildLandPoints(landPolygons, 4);
        let width = 0;
        let height = 0;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let radius = 0;
        let rotationLon = 72 * DEG;
        let rotationLat = -12 * DEG;
        let isDragging = false;
        let pointerId = null;
        let lastX = 0;
        let lastY = 0;
        let autoVelocity = 0.0072;

        function resizeCanvas() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = stage.clientWidth;
            height = stage.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            radius = Math.min(width, height) * 0.45;
        }

        function buildLandPoints(polygons, step) {
            const points = [];
            polygons.forEach((polygon) => {
                const lons = polygon.map(([lon]) => lon);
                const lats = polygon.map(([, lat]) => lat);
                const minLon = Math.floor(Math.min(...lons));
                const maxLon = Math.ceil(Math.max(...lons));
                const minLat = Math.floor(Math.min(...lats));
                const maxLat = Math.ceil(Math.max(...lats));

                for (let lat = minLat; lat <= maxLat; lat += step) {
                    for (let lon = minLon; lon <= maxLon; lon += step) {
                        if (pointInPolygon([lon, lat], polygon)) {
                            points.push({ lat, lon });
                        }
                    }
                }
            });
            return points;
        }

        function pointInPolygon(point, polygon) {
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i][0];
                const yi = polygon[i][1];
                const xj = polygon[j][0];
                const yj = polygon[j][1];
                const intersect = ((yi > point[1]) !== (yj > point[1])) &&
                    (point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || 0.00001) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }

        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function projectPoint(latDeg, lonDeg) {
            const lat = latDeg * DEG;
            const lon = lonDeg * DEG;
            const cosLat = Math.cos(lat);
            const sinLat = Math.sin(lat);
            const deltaLon = lon - rotationLon;
            const cosDelta = Math.cos(deltaLon);
            const sinDelta = Math.sin(deltaLon);
            const cosCenter = Math.cos(rotationLat);
            const sinCenter = Math.sin(rotationLat);

            const x = radius * cosLat * sinDelta;
            const y = radius * ((cosCenter * sinLat) - (sinCenter * cosLat * cosDelta));
            const z = (sinCenter * sinLat) + (cosCenter * cosLat * cosDelta);

            return {
                x: width / 2 + x,
                y: height / 2 - y,
                z,
                visible: z > 0
            };
        }

        function drawPolyline(points, color, lineWidth, alpha) {
            ctx.beginPath();
            let hasSegment = false;

            points.forEach((point, index) => {
                const projected = projectPoint(point.lat, point.lon);
                if (!projected.visible) {
                    hasSegment = false;
                    return;
                }

                if (!hasSegment || index === 0) {
                    ctx.moveTo(projected.x, projected.y);
                    hasSegment = true;
                } else {
                    ctx.lineTo(projected.x, projected.y);
                }
            });

            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.globalAlpha = alpha;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        function interpolateRoute(start, end, segments = 40) {
            const points = [];
            for (let i = 0; i <= segments; i += 1) {
                const t = i / segments;
                const lat = start.lat + ((end.lat - start.lat) * t);
                const lon = start.lon + ((end.lon - start.lon) * t);
                points.push({ lat, lon });
            }
            return points;
        }

        function drawRoutes() {
            routePairs.forEach(([fromName, toName], index) => {
                const from = locations.find((item) => item.name === fromName);
                const to = locations.find((item) => item.name === toName);
                if (!from || !to) return;

                const midLat = (from.lat + to.lat) / 2 + 8;
                const midLon = (from.lon + to.lon) / 2;
                const routePoints = [
                    { lat: from.lat, lon: from.lon },
                    { lat: midLat, lon: midLon },
                    { lat: to.lat, lon: to.lon }
                ];

                const denseRoute = [];
                for (let i = 0; i < routePoints.length - 1; i += 1) {
                    denseRoute.push(...interpolateRoute(routePoints[i], routePoints[i + 1], 18));
                }

                const alphaPulse = 0.35 + Math.sin(Date.now() * 0.002 + index) * 0.15;
                drawPolyline(denseRoute, `rgba(124, 224, 255, ${alphaPulse})`, 1.1, alphaPulse);
            });
        }

        function drawGlobe() {
            ctx.clearRect(0, 0, width, height);



            ctx.save();
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
            ctx.clip();

            const sphereGradient = ctx.createRadialGradient(width / 2 - radius * 0.35, height / 2 - radius * 0.38, radius * 0.2, width / 2, height / 2, radius * 1.08);
            sphereGradient.addColorStop(0, '#1d8dbe');
            sphereGradient.addColorStop(0.45, '#0b4d83');
            sphereGradient.addColorStop(0.72, '#07285d');
            sphereGradient.addColorStop(1, '#041438');
            ctx.fillStyle = sphereGradient;
            ctx.fillRect(width / 2 - radius, height / 2 - radius, radius * 2, radius * 2);

            for (let lat = -60; lat <= 60; lat += 20) {
                const points = [];
                for (let lon = -180; lon <= 180; lon += 6) {
                    points.push({ lat, lon });
                }
                drawPolyline(points, 'rgba(255, 255, 255, 0.12)', 1, 1);
            }

            for (let lon = -180; lon < 180; lon += 20) {
                const points = [];
                for (let lat = -90; lat <= 90; lat += 4) {
                    points.push({ lat, lon });
                }
                drawPolyline(points, 'rgba(255, 255, 255, 0.1)', 1, 1);
            }

            const visibleLand = [];
            landPoints.forEach((point) => {
                const projected = projectPoint(point.lat, point.lon);
                if (projected.visible) {
                    visibleLand.push(projected);
                }
            });

            visibleLand.sort((a, b) => a.z - b.z);
            visibleLand.forEach((point) => {
                const size = 1.6 + point.z * 1.7;
                ctx.fillStyle = point.z > 0.65 ? 'rgba(72, 163, 114, 0.95)' : 'rgba(48, 110, 82, 0.9)';
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            });

            drawRoutes();

            ctx.restore();

            ctx.beginPath();
            ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            const visibleLocations = [];
            locations.forEach((location) => {
                const projected = projectPoint(location.lat, location.lon);
                if (projected.visible) {
                    visibleLocations.push({ ...location, ...projected });
                }
            });

            visibleLocations.sort((a, b) => a.z - b.z);
            visibleLocations.forEach((location) => {
                const palette = location.type === 'supplier'
                    ? { fill: '#8fe26d', glow: 'rgba(143, 226, 109, 0.45)' }
                    : location.type === 'hub'
                        ? { fill: '#7ce0ff', glow: 'rgba(124, 224, 255, 0.45)' }
                        : { fill: '#ffd15c', glow: 'rgba(255, 209, 92, 0.45)' };

                const radiusDot = 3.2 + location.z * 2.1;

                ctx.beginPath();
                ctx.fillStyle = palette.glow;
                const pulse = 1.0 + Math.sin(Date.now() * 0.003 + location.lat) * 0.25;
                ctx.arc(location.x, location.y, (radiusDot + 5) * pulse, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.fillStyle = palette.fill;
                ctx.arc(location.x, location.y, radiusDot, 0, Math.PI * 2);
                ctx.fill();

                ctx.lineWidth = 1.5;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.stroke();

                const labelX = location.x + location.dx;
                const labelY = location.y + location.dy;
                ctx.font = '700 12px Outfit, sans-serif';
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'rgba(4, 15, 22, 0.72)';
                ctx.strokeText(location.short, labelX, labelY);
                ctx.fillStyle = '#f8fafc';
                ctx.fillText(location.short, labelX, labelY);
            });
        }

        function animate() {
            if (!isDragging) {
                rotationLon += autoVelocity;
            }
            drawGlobe();
            window.requestAnimationFrame(animate);
        }

        stage.addEventListener('pointerdown', (event) => {
            isDragging = true;
            pointerId = event.pointerId;
            lastX = event.clientX;
            lastY = event.clientY;
            stage.classList.add('dragging');
            if (stage.setPointerCapture) {
                stage.setPointerCapture(pointerId);
            }
        });

        stage.addEventListener('pointermove', (event) => {
            if (!isDragging) return;
            const dx = event.clientX - lastX;
            const dy = event.clientY - lastY;
            lastX = event.clientX;
            lastY = event.clientY;
            rotationLon -= dx * 0.0085;
            rotationLat = clamp(rotationLat + dy * 0.0055, -0.9, 0.9);
        });

        function stopDragging() {
            if (pointerId !== null && stage.releasePointerCapture) {
                try {
                    stage.releasePointerCapture(pointerId);
                } catch (error) {
                    // Ignore release issues on browsers that already released the pointer.
                }
            }
            isDragging = false;
            pointerId = null;
            stage.classList.remove('dragging');
        }

        stage.addEventListener('pointerup', stopDragging);
        stage.addEventListener('pointercancel', stopDragging);
        stage.addEventListener('mouseleave', () => {
            if (!isDragging) {
                stage.classList.remove('dragging');
            }
        });

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }

    /* --- CUSTOM PREMIUM INTERSECTION OBSERVER SYSTEM --- */
    const premiumRevealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-line-by-line');
    
    if (premiumRevealElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.02
        };

        const premiumRevealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = el.getAttribute('data-delay') || 0;
                    el.style.setProperty('--delay', `${delay}ms`);
                    el.classList.add('visible');
                    observer.unobserve(el);
                    
                    // Trigger statistics count-up
                    if (el.classList.contains('why-card') || el.classList.contains('about-content') || el.classList.contains('why-hero-panel')) {
                        const countUpElements = el.querySelectorAll('.why-card-stat, .about-badge-large-num, .why-orbit-node strong');
                        countUpElements.forEach(statEl => {
                            if (!statEl.classList.contains('counted')) {
                                statEl.classList.add('counted');
                                animateCountUp(statEl);
                            }
                        });
                    }
                }
            });
        }, observerOptions);

        premiumRevealElements.forEach(el => premiumRevealObserver.observe(el));
    }

    function animateCountUp(element) {
        const firstChild = element.firstChild;
        if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
            const text = firstChild.textContent;
            const numberMatch = text.match(/\d+/);
            if (numberMatch) {
                const targetValue = parseInt(numberMatch[0], 10);
                const suffix = text.replace(numberMatch[0], '');
                const duration = 1200;
                const startTime = performance.now();
                
                function update(timestamp) {
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const easeProgress = progress * (2 - progress);
                    const current = Math.floor(easeProgress * targetValue);
                    firstChild.textContent = current + suffix;
                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        firstChild.textContent = text;
                    }
                }
                requestAnimationFrame(update);
                return;
            }
        }
        
        const text = element.textContent;
        const numberMatch = text.match(/\d+/);
        if (!numberMatch) return;
        const targetValue = parseInt(numberMatch[0], 10);
        const suffix = text.replace(numberMatch[0], '');
        const duration = 1200;
        const startTime = performance.now();
        
        function updateSimple(timestamp) {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = progress * (2 - progress);
            const current = Math.floor(easeProgress * targetValue);
            element.textContent = current + suffix;
            if (progress < 1) {
                requestAnimationFrame(updateSimple);
            } else {
                element.textContent = text;
            }
        }
        requestAnimationFrame(updateSimple);
    }

    /* --- ABOUT IMAGE 3D TILT EFFECT --- */
    const aboutImgBox = document.querySelector('.about-img-box');
    if (aboutImgBox) {
        aboutImgBox.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 991 || isReducedMotion) return;
            const rect = aboutImgBox.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateY = ((x / rect.width) - 0.5) * 4; // max 2 degrees
            const rotateX = (0.5 - (y / rect.height)) * 4; // max 2 degrees
            aboutImgBox.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
            aboutImgBox.style.transition = 'transform 0.1s ease';
        });
        aboutImgBox.addEventListener('mouseleave', () => {
            aboutImgBox.style.transform = '';
            aboutImgBox.style.transition = 'transform 0.4s ease';
        });
    }

    /* --- SUSTAINABILITY GLOBE SCROLL ROTATION --- */
    const susGlobe = document.querySelector('.sus-globe-center');
    const susSection = document.getElementById('sustainability');
    if (susGlobe && susSection) {
        window.addEventListener('scroll', () => {
            if (isReducedMotion) return;
            const rect = susSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const scrolledFraction = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                const rotation = (scrolledFraction - 0.5) * 6; // rotates between -3deg and +3deg
                susGlobe.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            }
        });
    }

    /* --- MOUSE GLOW & PERSPECTIVE TILT TRACKER FOR CARDS --- */
    const glowCards = document.querySelectorAll('.why-card, .service-card-mockup, .network-detail-card');
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            if (window.innerWidth <= 991 || isReducedMotion) return;
            const rotateY = ((x / rect.width) - 0.5) * 5;
            const rotateX = (0.5 - (y / rect.height)) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            card.style.transition = 'transform 0.1s ease';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.4s ease';
        });
    });
});
