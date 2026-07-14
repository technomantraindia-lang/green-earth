/**
 * Green Earth Commodity FZ LLC
 * Client-Side Interaction & Scroll Reveal Script
 */

document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('site-preloader');
    const preloaderProgressValue = document.getElementById('preloader-progress-value');
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenPreloader = sessionStorage.getItem('greenearth_preloader_seen') === 'true';
    let preloaderClosed = false;
    let preloaderProgress = 0;
    let progressTimer = null;
    let safetyTimer = null;

    if (preloader) {
        startPreloader();
    }

    function startPreloader() {
        if (isReducedMotion) {
            preloader.classList.add('is-animating');
        } else {
            requestAnimationFrame(() => {
                preloader.classList.add('is-animating');
            });
        }

        const minimumDuration = isReducedMotion ? 350 : (hasSeenPreloader ? 360 : 1650);
        const maximumDuration = isReducedMotion ? 900 : (hasSeenPreloader ? 900 : 2300);
        const startTime = Date.now();

        progressTimer = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            const cappedTarget = hasSeenPreloader ? 92 : 96;
            const durationFactor = Math.min(elapsed / minimumDuration, 1);
            const nextValue = Math.min(cappedTarget, Math.round(durationFactor * cappedTarget));
            updatePreloaderProgress(nextValue);
        }, isReducedMotion ? 120 : 40);

        const completeWhenReady = () => {
            const elapsed = Date.now() - startTime;
            const waitRemaining = Math.max(minimumDuration - elapsed, 0);
            window.setTimeout(() => finishPreloader(), waitRemaining);
        };

        if (document.readyState === 'complete') {
            completeWhenReady();
        } else {
            window.addEventListener('load', completeWhenReady, { once: true });
        }

        safetyTimer = window.setTimeout(() => {
            finishPreloader();
        }, maximumDuration);
    }

    function updatePreloaderProgress(value) {
        preloaderProgress = Math.max(preloaderProgress, Math.min(100, value));
        if (preloaderProgressValue) {
            preloaderProgressValue.textContent = `${preloaderProgress}%`;
        }
        const preloaderOrbitProgress = document.querySelector('.preloader-orbit-progress');
        if (preloaderOrbitProgress) {
            const circumference = 528;
            const offset = circumference - ((preloaderProgress / 100) * circumference);
            preloaderOrbitProgress.style.strokeDashoffset = `${offset}`;
        }
    }

    function finishPreloader() {
        if (!preloader || preloaderClosed) return;
        preloaderClosed = true;

        if (progressTimer) window.clearInterval(progressTimer);
        if (safetyTimer) window.clearTimeout(safetyTimer);

        updatePreloaderProgress(100);
        sessionStorage.setItem('greenearth_preloader_seen', 'true');

        preloader.classList.add('is-complete');

        window.setTimeout(() => {
            document.body.classList.remove('preloader-active');
            preloader.classList.add('is-hidden');
            animatePageEntry();

            window.setTimeout(() => {
                preloader.remove();
            }, isReducedMotion ? 120 : 700);
        }, isReducedMotion ? 120 : (hasSeenPreloader ? 260 : 620));
    }

    function animatePageEntry() {
        if (isReducedMotion) {
            document.querySelectorAll('.reveal').forEach((element) => {
                element.classList.add('active');
            });
            return;
        }

        if (typeof gsap !== 'undefined') {
            const entryTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

            entryTimeline.fromTo('custom-header',
                { y: -26, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.45 }
            );

            entryTimeline.fromTo('.bg-blob',
                { opacity: 0, scale: 0.9 },
                { opacity: 0.4, scale: 1, duration: 0.6, stagger: 0.08 },
                0
            );

            entryTimeline.fromTo('.hero-bg-video',
                { scale: 1.06, opacity: 0.72 },
                { scale: 1.02, opacity: 1, duration: 0.95 },
                0.05
            );

            entryTimeline.fromTo(['#about-us .about-tag-container', '#about-us .about-heading', '#about-us .about-lead-green'],
                { y: 24, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 },
                0.18
            );

            entryTimeline.fromTo(['#about-us .about-text', '#about-us .about-features-card', '#about-us .about-btn-pill', '#about-us .about-visual-block'],
                { y: 28, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
                0.32
            );
        }
    }

    /* --- STICKY HEADER SCROLL TRANSITION --- */
    const handleHeaderScroll = () => {
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
            { name: 'United Kingdom', short: 'UK', lat: 55.0, lon: -2.5, type: 'supplier', dx: -26, dy: -12 },
            { name: 'Germany', short: 'Germany', lat: 51.2, lon: 10.4, type: 'supplier', dx: -18, dy: -10 },
            { name: 'Italy', short: 'Italy', lat: 42.8, lon: 12.5, type: 'supplier', dx: -16, dy: -12 },
            { name: 'United States', short: 'USA', lat: 39.8, lon: -98.6, type: 'supplier', dx: -18, dy: -12 },
            { name: 'UAE', short: 'UAE', lat: 24.3, lon: 54.4, type: 'hub', dx: -12, dy: -12 },
            { name: 'India', short: 'India', lat: 22.4, lon: 78.9, type: 'customer', dx: -14, dy: -12 },
            { name: 'Pakistan', short: 'Pakistan', lat: 30.4, lon: 69.3, type: 'customer', dx: -18, dy: -12 },
            { name: 'Bangladesh', short: 'Bangladesh', lat: 23.7, lon: 90.4, type: 'customer', dx: 10, dy: -12 },
            { name: 'China', short: 'China', lat: 35.8, lon: 104.2, type: 'customer', dx: 10, dy: -10 },
            { name: 'Vietnam', short: 'Vietnam', lat: 16.3, lon: 107.8, type: 'customer', dx: 10, dy: -6 },
            { name: 'Thailand', short: 'Thailand', lat: 15.8, lon: 101.0, type: 'customer', dx: 12, dy: 8 },
            { name: 'Malaysia', short: 'Malaysia', lat: 4.2, lon: 102.0, type: 'customer', dx: 10, dy: 10 },
            { name: 'Singapore', short: 'Singapore', lat: 1.3, lon: 103.8, type: 'customer', dx: 10, dy: 18 },
            { name: 'Indonesia', short: 'Indonesia', lat: -2.4, lon: 118.0, type: 'customer', dx: 10, dy: 10 },
            { name: 'Taiwan', short: 'Taiwan', lat: 23.7, lon: 121.0, type: 'customer', dx: 10, dy: -12 },
            { name: 'South Korea', short: 'S. Korea', lat: 36.2, lon: 127.9, type: 'customer', dx: 10, dy: -12 },
            { name: 'Sri Lanka', short: 'Sri Lanka', lat: 7.8, lon: 80.7, type: 'customer', dx: -12, dy: 16 }
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
            radius = Math.min(width, height) * 0.33;
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
            routePairs.forEach(([fromName, toName]) => {
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

                drawPolyline(denseRoute, 'rgba(124, 224, 255, 0.45)', 1.1, 0.85);
            });
        }

        function drawGlobe() {
            ctx.clearRect(0, 0, width, height);

            const glow = ctx.createRadialGradient(width / 2, height / 2, radius * 0.3, width / 2, height / 2, radius * 1.6);
            glow.addColorStop(0, 'rgba(18, 117, 145, 0.18)');
            glow.addColorStop(1, 'rgba(18, 117, 145, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, radius * 1.75, 0, Math.PI * 2);
            ctx.fill();

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
                ctx.arc(location.x, location.y, radiusDot + 5, 0, Math.PI * 2);
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

    /* --- GSAP WHY CHOOSE US ANIMATIONS --- */
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.to('.hero-bg-video', {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        gsap.fromTo('.products-header',
            { opacity: 0, y: 40, filter: 'blur(8px)' },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#products',
                    start: 'top 78%'
                }
            }
        );

        gsap.fromTo('.product-card-mockup',
            { opacity: 0, y: 70, rotateX: -10, transformOrigin: 'top center' },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 1,
                stagger: 0.12,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: '.products-grid',
                    start: 'top 80%'
                }
            }
        );

        gsap.fromTo('.services-header',
            { opacity: 0, y: 36 },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#services',
                    start: 'top 80%'
                }
            }
        );

        gsap.fromTo('.network-content',
            { opacity: 0, x: -40, filter: 'blur(8px)' },
            {
                opacity: 1,
                x: 0,
                filter: 'blur(0px)',
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#global-network',
                    start: 'top 78%'
                }
            }
        );

        gsap.fromTo('.network-visual',
            { opacity: 0, x: 40, scale: 0.97 },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#global-network',
                    start: 'top 78%'
                }
            }
        );

        gsap.fromTo('.service-card-mockup:not(.hidden-service)',
            { opacity: 0, y: 55, scale: 0.96 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 82%'
                }
            }
        );

        // Animated world map lines & background fade-in
        gsap.fromTo('.why-background', 
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 1.5,
                ease: 'sine.out',
                scrollTrigger: {
                    trigger: '#why-choose-us',
                    start: 'top 80%',
                }
            }
        );

        gsap.fromTo('.why-hero-panel',
            { opacity: 0, y: 50, scale: 0.98, filter: 'blur(8px)' },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 1.1,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: '.why-hero-panel',
                    start: 'top 82%'
                }
            }
        );

        gsap.fromTo('.why-signal-card',
            { opacity: 0, y: 45, scale: 0.97 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.why-signal-band',
                    start: 'top 82%'
                }
            }
        );

        // Header slide upward with blur
        gsap.fromTo('.why-section-header-gsap', 
            { opacity: 0, y: 50, filter: 'blur(10px)' },
            { 
                opacity: 1, 
                y: 0, 
                filter: 'blur(0px)',
                duration: 1.2,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: '#why-choose-us',
                    start: 'top 80%',
                }
            }
        );

        // Expand header line decoration
        gsap.fromTo('.why-section-line-gsap', 
            { width: 0 },
            { 
                width: '120px', 
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#why-choose-us',
                    start: 'top 80%',
                }
            }
        );

        // Staggered cards entrance: left/right/bottom shifts, scale, opacity, blur
        const whyCards = gsap.utils.toArray('.why-card');
        whyCards.forEach((card, index) => {
            let initialX = 0;
            let initialY = 60;
            
            // Stagger left / right / bottom entrance depending on column positions
            if (index % 3 === 0) {
                initialX = -45;
            } else if (index % 3 === 2) {
                initialX = 45;
            }
            
            gsap.fromTo(card,
                { 
                    opacity: 0, 
                    x: initialX, 
                    y: initialY, 
                    scale: 0.92, 
                    filter: 'blur(8px)' 
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '#why-choose-us',
                        start: 'top 70%',
                    },
                    delay: index * 0.15
                }
            );
        });

        // Bottom CTA entrance
        gsap.fromTo('.why-cta-container',
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.why-cta-container',
                    start: 'top 85%'
                }
            }
        );
    }

    /* --- LIGHTWEIGHT POINTER DEPTH EFFECTS --- */
    const interactiveCards = document.querySelectorAll('.product-card-mockup, .service-card-mockup, .network-detail-card, .why-signal-card, .why-orbit-node');
    interactiveCards.forEach((card) => {
        card.addEventListener('mousemove', (event) => {
            if (window.innerWidth <= 991) return;

            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rotateY = ((x / rect.width) - 0.5) * 8;
            const rotateX = (0.5 - (y / rect.height)) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

});
