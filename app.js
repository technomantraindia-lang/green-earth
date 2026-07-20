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

    /* --- SUSTAINABILITY ORBIT & COMMITMENT CARDS HOVER HANDLER --- */
    const orbitNodes = document.querySelectorAll('.sus-orbit-node');
    const commitmentItems = document.querySelectorAll('.sus-commitment-item');
    const parentBox = document.querySelector('.sus-interactive-box');
    const detailsCard = document.querySelector('.sus-orbit-tooltip');
    const detailsTitle = document.querySelector('.sus-tooltip-title');
    const detailsDesc = document.querySelector('.sus-tooltip-desc');
    
    function activateSustainabilityIndex(index) {
        orbitNodes.forEach(n => {
            if (n.getAttribute('data-index') === String(index)) {
                n.classList.add('active');
                const title = n.getAttribute('data-title');
                const desc = n.getAttribute('data-desc');
                if (detailsCard) {
                    detailsCard.style.opacity = '0';
                    setTimeout(() => {
                        if (detailsTitle) detailsTitle.textContent = title;
                        if (detailsDesc) detailsDesc.textContent = desc;
                        detailsCard.style.opacity = '1';
                    }, 150);
                }
            } else {
                n.classList.remove('active');
            }
        });

        commitmentItems.forEach(item => {
            if (item.getAttribute('data-index') === String(index)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        if (parentBox) {
            parentBox.className = `sus-interactive-box active-node-${index}`;
        }
    }

    if (orbitNodes.length > 0) {
        orbitNodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                const index = node.getAttribute('data-index');
                activateSustainabilityIndex(index);
            });
        });
    }

    if (commitmentItems.length > 0) {
        commitmentItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const index = item.getAttribute('data-index');
                activateSustainabilityIndex(index);
            });
        });
    }

    /* --- GLOBAL NETWORK INTERACTIVE EARTH --- */
    const tradeGlobeStage = document.getElementById('trade-globe-stage');

    if (tradeGlobeStage) {
        initTradeGlobe(tradeGlobeStage);
    }

    function initTradeGlobe(stage) {
        const markerLayer = stage.querySelector('.global-network-earth-marker-layer');
        const hasThree = typeof window.THREE !== 'undefined';
        const canUseWebGL = (() => {
            try {
                const testCanvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
            } catch (error) {
                return false;
            }
        })();

        if (!hasThree || !canUseWebGL || !markerLayer) {
            stage.classList.add('webgl-unavailable');
            return;
        }

        const THREE = window.THREE;
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const textureBase = 'https://threejs.org/examples/textures/planets/';
        const networkLocations = [
            { name: 'India', lat: 20.5937, lon: 78.9629, labelPos: 'bottom-left' },
            { name: 'Pakistan', lat: 30.3753, lon: 69.3451, labelPos: 'top-left' },
            { name: 'China', lat: 35.8617, lon: 104.1954, labelPos: 'top-right' },
            { name: 'Vietnam', lat: 14.0583, lon: 108.2772, labelPos: 'bottom-right' },
            { name: 'Thailand', lat: 15.8700, lon: 100.9925, labelPos: 'top-left' },
            { name: 'Malaysia', lat: 4.2105, lon: 101.9758, labelPos: 'bottom-left' },
            { name: 'Indonesia', lat: -0.7893, lon: 113.9213, labelPos: 'bottom-right' },
            { name: 'Taiwan', lat: 23.6978, lon: 120.9605, labelPos: 'top-right' },
            { name: 'South Korea', lat: 35.9078, lon: 127.7669, labelPos: 'top-right' }
        ];

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0, 4.2);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setClearColor(0x000000, 0);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        stage.appendChild(renderer.domElement);

        const globeGroup = new THREE.Group();
        const markerGroup = new THREE.Group();
        scene.add(globeGroup);
        globeGroup.add(markerGroup);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.62);
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
        keyLight.position.set(-3.8, 2.2, 4.6);
        const rimLight = new THREE.DirectionalLight(0x9fe8ff, 0.36);
        rimLight.position.set(3.2, -1.3, -2.6);
        scene.add(ambientLight, keyLight, rimLight);

        const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
        const segments = isMobile() ? 48 : 64;
        const earthGeometry = new THREE.SphereGeometry(1, segments, segments);
        const cloudGeometry = new THREE.SphereGeometry(1.012, segments, segments);
        const atmosphereGeometry = new THREE.SphereGeometry(1.06, segments, segments);
        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;

        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin('anonymous');
        const loadedTextures = [];
        let earthMesh = null;
        let cloudMesh = null;
        let atmosphereMesh = null;
        let animationFrame = null;
        let resizeObserver = null;
        let sectionObserver = null;
        let isInView = true;
        let isHidden = document.hidden;
        let isPointerDown = false;
        let isDragging = false;
        let pointerId = null;
        let lastX = 0;
        let lastY = 0;
        let pointerStartX = 0;
        let pointerStartY = 0;
        let lastMoveTime = performance.now();
        let targetRotationX = -0.32;
        let targetRotationY = -1.82;
        let currentRotationX = targetRotationX;
        let currentRotationY = targetRotationY;
        let velocityX = 0;
        let velocityY = 0;
        let targetHoverX = 0;
        let targetHoverY = 0;
        let currentHoverX = 0;
        let currentHoverY = 0;
        let lastFrameTime = performance.now();
        const verticalLimit = 1.05;
        const dragSensitivity = isMobile() ? 0.0062 : 0.0075;
        const verticalSensitivity = isMobile() ? 0.0045 : 0.0055;
        const autoRotationSpeed = reducedMotionQuery.matches ? 0 : 0.085;

        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function loadTexture(path, colorSpace = true) {
            return new Promise((resolve, reject) => {
                textureLoader.load(
                    path,
                    (texture) => {
                        texture.anisotropy = Math.min(maxAnisotropy, 8);
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.ClampToEdgeWrapping;
                        if (colorSpace) texture.encoding = THREE.sRGBEncoding;
                        loadedTextures.push(texture);
                        resolve(texture);
                    },
                    undefined,
                    reject
                );
            });
        }

        function latLonToVector3(lat, lon, radius = 1.035) {
            const phi = THREE.MathUtils.degToRad(90 - lat);
            const theta = THREE.MathUtils.degToRad(lon + 180);
            return new THREE.Vector3(
                -radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
        }

        const markerEntries = networkLocations.map((location) => {
            const markerElement = document.createElement('span');
            markerElement.className = `global-network-earth-marker pos-${location.labelPos || 'right'}`;
            markerElement.innerHTML = `<span class="global-network-earth-marker-dot"></span><span class="global-network-earth-marker-label">${location.name}</span>`;
            markerLayer.appendChild(markerElement);
            return {
                location,
                element: markerElement,
                basePosition: latLonToVector3(location.lat, location.lon)
            };
        });

        function createMarkerObjects() {
            const markerGeometry = new THREE.SphereGeometry(0.018, 16, 16);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981 });

            markerEntries.forEach((entry) => {
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.copy(entry.basePosition);
                markerGroup.add(marker);
            });
        }

        function resizeRenderer() {
            const rect = stage.getBoundingClientRect();
            const size = Math.max(260, Math.round(Math.min(rect.width, rect.height || rect.width)));
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
            renderer.setSize(size, size, false);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
        }

        function updateMarkers() {
            const stageSize = renderer.domElement.clientWidth;
            const rotation = new THREE.Euler(globeGroup.rotation.x, globeGroup.rotation.y, globeGroup.rotation.z, 'XYZ');

            markerEntries.forEach((entry) => {
                const worldPosition = entry.basePosition.clone().applyEuler(rotation);
                if (worldPosition.z <= 0.12) {
                    entry.element.classList.remove('visible');
                    return;
                }

                const projected = worldPosition.clone().project(camera);
                const x = ((projected.x + 1) / 2) * stageSize;
                const y = ((-projected.y + 1) / 2) * stageSize;
                const edgeDistance = Math.hypot(x - stageSize / 2, y - stageSize / 2) / (stageSize / 2);
                const opacity = clamp((worldPosition.z - 0.12) / 0.42, 0, 1) * clamp(1.08 - edgeDistance * 0.16, 0.55, 1);

                entry.element.style.setProperty('--marker-x', `${x}px`);
                entry.element.style.setProperty('--marker-y', `${y}px`);
                entry.element.style.setProperty('--marker-opacity', opacity.toFixed(3));
                entry.element.style.setProperty('--marker-scale', (0.82 + opacity * 0.18).toFixed(3));
                entry.element.classList.add('visible');
            });
        }

        function renderFrame(timestamp) {
            const delta = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
            lastFrameTime = timestamp;

            if (!isHidden && isInView) {
                if (!isDragging && !reducedMotionQuery.matches) {
                    targetRotationY += autoRotationSpeed * delta;
                    targetRotationY += velocityY * delta;
                    targetRotationX = clamp(targetRotationX + velocityX * delta, -verticalLimit, verticalLimit);
                    velocityY *= Math.pow(0.9, delta * 60);
                    velocityX *= Math.pow(0.88, delta * 60);
                    if (Math.abs(velocityY) < 0.0008) velocityY = 0;
                    if (Math.abs(velocityX) < 0.0008) velocityX = 0;
                }

                currentRotationX += (targetRotationX - currentRotationX) * Math.min(1, delta * 8);
                currentRotationY += (targetRotationY - currentRotationY) * Math.min(1, delta * 8);
                currentHoverX += (targetHoverX - currentHoverX) * Math.min(1, delta * 6);
                currentHoverY += (targetHoverY - currentHoverY) * Math.min(1, delta * 6);

                globeGroup.rotation.x = currentRotationX + currentHoverX;
                globeGroup.rotation.y = currentRotationY + currentHoverY;

                if (cloudMesh && !reducedMotionQuery.matches) {
                    cloudMesh.rotation.y += delta * 0.035;
                    cloudMesh.rotation.x = currentHoverX * 0.3;
                }

                updateMarkers();
                renderer.render(scene, camera);
            }

            animationFrame = window.requestAnimationFrame(renderFrame);
        }

        function startLoop() {
            if (animationFrame === null) {
                lastFrameTime = performance.now();
                animationFrame = window.requestAnimationFrame(renderFrame);
            }
        }

        function handlePointerDown(event) {
            isPointerDown = true;
            isDragging = false;
            pointerId = event.pointerId;
            pointerStartX = event.clientX;
            pointerStartY = event.clientY;
            lastX = event.clientX;
            lastY = event.clientY;
            lastMoveTime = performance.now();
            velocityX = 0;
            velocityY = 0;
            if (stage.setPointerCapture) {
                stage.setPointerCapture(pointerId);
            }
        }

        function handlePointerMove(event) {
            const rect = stage.getBoundingClientRect();
            targetHoverY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.1;
            targetHoverX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.06;

            if (!isPointerDown || event.pointerId !== pointerId) return;

            const dx = event.clientX - lastX;
            const dy = event.clientY - lastY;
            const totalDx = event.clientX - pointerStartX;
            const totalDy = event.clientY - pointerStartY;
            const now = performance.now();
            const elapsed = Math.max((now - lastMoveTime) / 1000, 0.016);

            if (!isDragging) {
                if (event.pointerType === 'touch' && Math.abs(totalDy) > Math.abs(totalDx) * 1.15 && Math.abs(totalDy) > 8) {
                    stopDragging();
                    return;
                }
                if (Math.hypot(totalDx, totalDy) < 3) return;
                isDragging = true;
                stage.classList.add('dragging');
            }

            event.preventDefault();
            lastX = event.clientX;
            lastY = event.clientY;
            lastMoveTime = now;
            targetRotationY += dx * dragSensitivity;
            targetRotationX = clamp(targetRotationX + dy * verticalSensitivity, -verticalLimit, verticalLimit);
            velocityY = (dx * dragSensitivity) / elapsed;
            velocityX = (dy * verticalSensitivity) / elapsed;
        }

        function handlePointerLeave() {
            targetHoverX = 0;
            targetHoverY = 0;
            if (!isDragging) {
                stage.classList.remove('dragging');
            }
        }

        function stopDragging() {
            isPointerDown = false;
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

        function handleKeydown(event) {
            const keyStep = 0.12;
            if (event.key === 'ArrowLeft') {
                targetRotationY -= keyStep;
            } else if (event.key === 'ArrowRight') {
                targetRotationY += keyStep;
            } else if (event.key === 'ArrowUp') {
                targetRotationX = clamp(targetRotationX - keyStep, -verticalLimit, verticalLimit);
            } else if (event.key === 'ArrowDown') {
                targetRotationX = clamp(targetRotationX + keyStep, -verticalLimit, verticalLimit);
            } else {
                return;
            }
            event.preventDefault();
        }

        function handleVisibilityChange() {
            isHidden = document.hidden;
            lastFrameTime = performance.now();
        }

        function disposeGlobe() {
            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }
            resizeObserver?.disconnect();
            sectionObserver?.disconnect();
            stage.removeEventListener('pointerdown', handlePointerDown);
            stage.removeEventListener('pointermove', handlePointerMove);
            stage.removeEventListener('pointerup', stopDragging);
            stage.removeEventListener('pointercancel', stopDragging);
            stage.removeEventListener('pointerleave', handlePointerLeave);
            stage.removeEventListener('keydown', handleKeydown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            earthGeometry.dispose();
            cloudGeometry.dispose();
            atmosphereGeometry.dispose();
            loadedTextures.forEach((texture) => texture.dispose());
            scene.traverse((object) => {
                if (object.geometry && object.geometry !== earthGeometry && object.geometry !== cloudGeometry && object.geometry !== atmosphereGeometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((material) => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            renderer.dispose();
        }

        Promise.all([
            loadTexture(`${textureBase}earth_atmos_2048.jpg`),
            loadTexture(`${textureBase}earth_normal_2048.jpg`, false),
            loadTexture(`${textureBase}earth_specular_2048.jpg`, false),
            loadTexture(`${textureBase}earth_clouds_1024.png`)
        ]).then(([dayTexture, normalTexture, specularTexture, cloudTexture]) => {
            earthMesh = new THREE.Mesh(
                earthGeometry,
                new THREE.MeshPhongMaterial({
                    map: dayTexture,
                    normalMap: normalTexture,
                    normalScale: new THREE.Vector2(0.12, 0.12),
                    specularMap: specularTexture,
                    specular: new THREE.Color(0x244b64),
                    shininess: 16
                })
            );

            cloudMesh = new THREE.Mesh(
                cloudGeometry,
                new THREE.MeshPhongMaterial({
                    map: cloudTexture,
                    transparent: true,
                    opacity: 0.38,
                    depthWrite: false
                })
            );

            atmosphereMesh = new THREE.Mesh(
                atmosphereGeometry,
                new THREE.MeshBasicMaterial({
                    color: 0x8bdcff,
                    transparent: true,
                    opacity: 0.12,
                    side: THREE.BackSide,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                })
            );

            globeGroup.add(earthMesh, cloudMesh, atmosphereMesh);
            createMarkerObjects();
            stage.classList.add('loaded');
            resizeRenderer();
            renderer.render(scene, camera);
            startLoop();
        }).catch(() => {
            stage.classList.add('webgl-unavailable');
        });

        resizeObserver = new ResizeObserver(() => {
            resizeRenderer();
            lastFrameTime = performance.now();
        });
        resizeObserver.observe(stage);

        sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                isInView = entry.isIntersecting;
                lastFrameTime = performance.now();
                markerLayer.style.opacity = isInView ? '1' : '0';
            });
        }, { threshold: 0.05 });
        sectionObserver.observe(stage);

        stage.addEventListener('pointerdown', handlePointerDown);
        stage.addEventListener('pointermove', handlePointerMove, { passive: false });
        stage.addEventListener('pointerup', stopDragging);
        stage.addEventListener('pointercancel', stopDragging);
        stage.addEventListener('pointerleave', handlePointerLeave);
        stage.addEventListener('keydown', handleKeydown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', disposeGlobe, { once: true });

        if (reducedMotionQuery.matches) {
            targetRotationY = -0.92;
            currentRotationY = targetRotationY;
        }
    }

    /* --- CUSTOM PREMIUM INTERSECTION OBSERVER SYSTEM --- */
    const premiumRevealElements = document.querySelectorAll('.reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-line-by-line');
    
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
