/**
 * Green Earth Commodity FZ LLC
 * Client-Side Interaction & Scroll Reveal Script
 */

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-enabled');
    const preloader = document.getElementById('site-preloader');
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hasSeenPreloader = false;
    try {
        hasSeenPreloader = sessionStorage.getItem('greenearth_preloader_seen') === 'true';
    } catch (e) {
        // Fallback for sandboxed or private browsing environments
        hasSeenPreloader = false;
    }

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
        initRevealObservers();
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
                try {
                    sessionStorage.setItem('greenearth_preloader_seen', 'true');
                } catch (e) {
                    // Safe fallback
                }
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
            initRevealObservers();
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
        
        // Check if link is an anchor link pointing to the current page (or index.html prefix on index.html)
        if (href && (href.startsWith('#') || href.includes('#'))) {
            const hashIndex = href.indexOf('#');
            const pathBeforeHash = href.substring(0, hashIndex);
            const targetId = href.substring(hashIndex + 1);
            
            // Check if target is on the same page
            const currentPath = window.location.pathname;
            const isSamePage = pathBeforeHash === '' || 
                               currentPath.endsWith(pathBeforeHash) || 
                               (pathBeforeHash === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html')));
            
            if (isSamePage) {
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
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
        }
    });


    /* Observers will be initialized after layout finishes */


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
            { name: 'USA', lat: 37.0902, lon: -95.7129, labelPos: 'top-left' },
            { name: 'United Kingdom', lat: 55.3781, lon: -3.4360, labelPos: 'top-left' },
            { name: 'Belgium', lat: 50.5039, lon: 4.4699, labelPos: 'top-right' },
            { name: 'Egypt', lat: 26.8206, lon: 30.8025, labelPos: 'bottom-left' },
            { name: 'UAE', lat: 23.4241, lon: 53.8478, labelPos: 'top-right' },
            { name: 'Turkey', lat: 38.9637, lon: 35.2433, labelPos: 'top-left' },
            { name: 'Bangladesh', lat: 23.6850, lon: 90.3563, labelPos: 'top-right' },
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
    function initRevealObservers() {
        const premiumRevealElements = document.querySelectorAll('.reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-line-by-line, .reveal');
        
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
                        el.classList.add('active');
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

    /* --- PREMIUM 3D TILT & HOLOGRAPHIC SHINE EFFECT --- */
    const premiumCards = document.querySelectorAll(
        '.pillar-card-v2, .why-card, .industry-card, .product-card-mockup, ' +
        '.about-showcase-card, .conclusion-card, .service-card-mockup, ' +
        '.network-detail-card, .info-detail-card, .info-action-card, .contact-form-panel'
    );

    premiumCards.forEach(card => {
        // Inject shine overlay programmatically if not already present
        if (!card.querySelector('.card-shine')) {
            const shine = document.createElement('div');
            shine.className = 'card-shine';
            card.appendChild(shine);
        }

        // Ensure parent style preserves 3D
        card.style.transformStyle = 'preserve-3d';

        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 991 || isReducedMotion) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Percentage positioning for shine overlay
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;

            card.style.setProperty('--shine-x', `${percentX}%`);
            card.style.setProperty('--shine-y', `${percentY}%`);

            // Also keep standard mouse x/y for other animations
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            card.style.setProperty('--mx', `${x}px`);
            card.style.setProperty('--my', `${y}px`);

            // Calculate tilt angles (max 10-12 degrees)
            const tiltY = ((x / rect.width) - 0.5) * 20; // -10deg to +10deg
            const tiltX = (0.5 - (y / rect.height)) * 20; // -10deg to +10deg

            // Dynamic rotation, scale and lift
            card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-10px) scale(1.03)`;
            card.style.transition = 'transform 0.08s linear, box-shadow 0.2s ease';
        });

        card.addEventListener('mouseleave', () => {
            // Reset to defaults smoothly
            card.style.transform = '';
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            
            // Reset properties
            card.style.setProperty('--shine-x', '50%');
            card.style.setProperty('--shine-y', '50%');
        });
    });

    /* --- CANVAS LEAF PARTICLE SYSTEM (SERVICES PAGE) --- */
    const leafCanvas = document.getElementById('services-particles-canvas');
    if (leafCanvas && !isReducedMotion) {
        const ctx = leafCanvas.getContext('2d');
        let width = leafCanvas.width = window.innerWidth;
        let height = leafCanvas.height = window.innerHeight;
        
        const leaves = [];
        const circles = [];
        const maxLeaves = 25;
        const maxCircles = 15;
        
        const mouse = { x: -1000, y: -1000, radius: 140 };
        
        window.addEventListener('resize', () => {
            width = leafCanvas.width = window.innerWidth;
            height = leafCanvas.height = window.innerHeight;
        });
        
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        
        window.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });
        
        // Leaf shape template function
        function drawLeafShape(ctx, size) {
            ctx.beginPath();
            ctx.moveTo(0, -size / 2);
            ctx.quadraticCurveTo(size / 2.5, -size / 4, size / 3.5, 0);
            ctx.quadraticCurveTo(size / 5, size / 3, 0, size / 2);
            ctx.quadraticCurveTo(-size / 5, size / 3, -size / 3.5, 0);
            ctx.quadraticCurveTo(-size / 2.5, -size / 4, 0, -size / 2);
            ctx.closePath();
        }
        
        class LeafParticle {
            constructor() {
                this.reset();
                this.y = Math.random() * height; // initial distribution
            }
            
            reset() {
                this.x = Math.random() * width;
                this.y = -20;
                this.size = Math.random() * 12 + 10;
                this.speedY = Math.random() * 0.7 + 0.4;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() * 0.015 - 0.0075);
                this.opacity = Math.random() * 0.35 + 0.15;
                this.color = [
                    'rgba(21, 128, 61, ' + this.opacity + ')',     // Forest Green
                    'rgba(34, 197, 94, ' + this.opacity + ')',     // Emerald
                    'rgba(132, 204, 22, ' + this.opacity + ')',    // Lime
                    'rgba(215, 191, 139, ' + (this.opacity * 0.75) + ')' // Soft Gold
                ][Math.floor(Math.random() * 4)];
                this.wobbleSpeed = Math.random() * 0.02 + 0.005;
                this.wobbleRange = Math.random() * 1.5 + 0.5;
                this.wobbleAngle = Math.random() * Math.PI * 2;
            }
            
            update() {
                this.y += this.speedY;
                this.wobbleAngle += this.wobbleSpeed;
                this.x += this.speedX + Math.sin(this.wobbleAngle) * this.wobbleRange;
                this.rotation += this.rotationSpeed;
                
                // Mouse interaction (repelling force)
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 4;
                    this.y += Math.sin(angle) * force * 4;
                }
                
                if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.fillStyle = this.color;
                drawLeafShape(ctx, this.size);
                ctx.fill();
                ctx.restore();
            }
        }
        
        class GlowCircle {
            constructor() {
                this.reset();
                this.y = Math.random() * height;
            }
            
            reset() {
                this.x = Math.random() * width;
                this.y = height + 20;
                this.radius = Math.random() * 30 + 15;
                this.speedY = -(Math.random() * 0.4 + 0.2);
                this.speedX = Math.random() * 0.2 - 0.1;
                this.opacity = Math.random() * 0.08 + 0.02;
                this.wobble = 0;
                this.wobbleSpeed = Math.random() * 0.01 + 0.005;
            }
            
            update() {
                this.y += this.speedY;
                this.wobble += this.wobbleSpeed;
                this.x += this.speedX + Math.sin(this.wobble) * 0.2;
                
                // Gentle push from mouse
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 2;
                    this.y += Math.sin(angle) * force * 2;
                }
                
                if (this.y < -this.radius || this.x < -this.radius || this.x > width + this.radius) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                grad.addColorStop(0, `rgba(34, 197, 94, ${this.opacity})`);
                grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            }
        }
        
        for (let i = 0; i < maxLeaves; i++) {
            leaves.push(new LeafParticle());
        }
        for (let i = 0; i < maxCircles; i++) {
            circles.push(new GlowCircle());
        }
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < circles.length; i++) {
                circles[i].update();
                circles[i].draw();
            }
            for (let i = 0; i < leaves.length; i++) {
                leaves[i].update();
                leaves[i].draw();
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }

    /* --- HERO BANNERS SCROLL PARALLAX EFFECT --- */
    const bannerImgs = document.querySelectorAll('.about-banner-img');
    if (bannerImgs.length > 0 && !isReducedMotion) {
        bannerImgs.forEach(img => {
            img.style.transformOrigin = 'center center';
            img.style.transform = 'scale(1.12)';
        });
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop < 750) {
                bannerImgs.forEach(img => {
                    img.style.transform = `translate3d(0, ${scrollTop * 0.22}px, 0) scale(1.12)`;
                });
            }
        }, { passive: true });
    }

    /* --- CURSOR-TRACKING 3D TILT EFFECT FOR CARDS --- */
    function apply3DTiltEffect(selector, intensity = 10) {
        if (isReducedMotion) return;
        const cards = document.querySelectorAll(selector);
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = ((y / rect.height) - 0.5) * -intensity;
                const rotateY = ((x / rect.width) - 0.5) * intensity;
                
                let translateStyle = '';
                if (selector.includes('product-card-mockup')) {
                    translateStyle = 'translateY(-10px) scale(1.02)';
                } else if (selector.includes('network-detail-card')) {
                    translateStyle = 'translateY(-8px) scale(1.02)';
                } else if (selector.includes('why-card')) {
                    translateStyle = 'translateY(-16px) scale(1.02)';
                } else if (selector.includes('service-card-mockup')) {
                    translateStyle = 'translateY(-16px) scale(1.02)';
                }
                
                card.style.transform = `perspective(1000px) ${translateStyle} rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                card.style.transition = 'transform 0.05s linear, box-shadow 0.1s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
            });
        });
    }

    // Initialize cursor-tracking 3D tilt effects
    apply3DTiltEffect('.product-card-mockup', 12);
    apply3DTiltEffect('.network-detail-card', 12);
    apply3DTiltEffect('.why-card', 12);
    apply3DTiltEffect('.service-card-mockup', 12);
});
