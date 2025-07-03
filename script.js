 class SolarSystem {
            constructor() {
                try {
                    this.scene = new THREE.Scene();
                    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                    const canvas = document.getElementById('solar-canvas');
                    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
                    if (!this.renderer.getContext()) throw new Error('WebGL not supported');
                    this.clock = new THREE.Clock();
                    this.isPaused = false;
                    this.isDarkTheme = true;
                    this.planets = [];
                    this.starLayers = []; // To hold star layers for parallax effect
                    
                    this.sunData = {
                        name: 'Sun',
                        info: 'The Sun is a yellow dwarf star at the center of our Solar System. It is a nearly perfect sphere of hot plasma, with its gravity holding the system together. It accounts for 99.86% of the Solar System\'s mass and has a diameter of about 1.39 million km.'
                    };

                    this.planetData = [
                        { name: 'Mercury', size: 0.38, actualDiameter: '4,880 km', distance: 8, baseSpeed: 4.74, actualSpeed: '47.4 km/s', animationSpeed: 1.0, color: 0x8c7853, info: 'The smallest and fastest planet, Mercury zips around the Sun in just 88 Earth days.' },
                        { name: 'Venus', size: 0.95, actualDiameter: '12,104 km', distance: 12, baseSpeed: 3.50, actualSpeed: '35.0 km/s', animationSpeed: 1.0, color: 0xffc649, info: 'Venus is the hottest planet in our solar system due to a thick, toxic atmosphere.' },
                        { name: 'Earth', size: 1.0, actualDiameter: '12,742 km', distance: 16, baseSpeed: 2.98, actualSpeed: '29.8 km/s', animationSpeed: 1.0, color: 0x6b93d6, info: 'Our home is the only place in the universe known to harbor life.' },
                        { name: 'Mars', size: 0.53, actualDiameter: '6,779 km', distance: 20, baseSpeed: 2.41, actualSpeed: '24.1 km/s', animationSpeed: 1.0, color: 0xc1440e, info: 'The "Red Planet" is home to the largest volcano in the solar system, Olympus Mons.' },
                        { name: 'Jupiter', size: 2.5, actualDiameter: '139,820 km', distance: 28, baseSpeed: 1.31, actualSpeed: '13.1 km/s', animationSpeed: 1.0, color: 0xd8ca9d, info: 'The largest planet, Jupiter is a gas giant with a massive storm, the Great Red Spot.' },
                        { name: 'Saturn', size: 2.1, actualDiameter: '116,460 km', distance: 36, baseSpeed: 0.97, actualSpeed: '9.7 km/s', animationSpeed: 1.0, color: 0xfad5a5, info: 'Saturn is famous for its stunning and complex system of icy rings.' },
                        { name: 'Uranus', size: 1.6, actualDiameter: '50,724 km', distance: 44, baseSpeed: 0.68, actualSpeed: '6.8 km/s', animationSpeed: 1.0, color: 0x4fd0e7, info: 'An ice giant that is tilted on its side, causing it to orbit like a rolling ball.' },
                        { name: 'Neptune', size: 1.5, actualDiameter: '49,244 km', distance: 52, baseSpeed: 0.54, actualSpeed: '5.4 km/s', animationSpeed: 1.0, color: 0x4b70dd, info: 'The most distant planet, Neptune is a dark, cold, and incredibly windy ice giant.' }
                    ];
                    this.controls = {};
                    this.raycaster = new THREE.Raycaster();
                    this.mouse = new THREE.Vector2();
                    this.tooltip = document.getElementById('planet-tooltip');
                    this.init();
                    this.animate();
                    this.setupEventListeners();
                    console.log('🌌 Solar System initialized successfully');
                } catch (error) {
                    console.error('❌ Failed to initialize Solar System:', error);
                    this.showError('Failed to initialize 3D graphics. Please check your browser WebGL support.');
                }
            }

            showError(message) {
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 0, 0, 0.9); color: white; padding: 20px; border-radius: 10px; z-index: 1000; text-align: center;`;
                errorDiv.innerHTML = `<h3>Error</h3><p>${message}</p>`;
                document.body.appendChild(errorDiv);
            }

            init() {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                if (this.renderer.getContext().getExtension('WEBGL_depth_texture')) {
                    this.renderer.shadowMap.enabled = true;
                    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                }
                this.camera.position.set(30, 30, 30);
                this.camera.lookAt(0, 0, 0);
                this.setupMouseControls();
                this.createSun();
                this.createPlanets();
                this.createStars();
                this.createLighting();
                this.createControls();
                this.updateTheme();
            }

            setupMouseControls() {
                let isMouseDown = false, mouseX = 0, mouseY = 0;
                const canvas = this.renderer.domElement;
                canvas.addEventListener('contextmenu', (e) => e.preventDefault());
                canvas.addEventListener('mousedown', (e) => {
                    isMouseDown = true; mouseX = e.clientX; mouseY = e.clientY; canvas.style.cursor = 'grabbing';
                });
                canvas.addEventListener('mouseup', () => { isMouseDown = false; canvas.style.cursor = 'grab'; });
                canvas.addEventListener('mouseleave', () => { isMouseDown = false; canvas.style.cursor = 'default'; this.hideTooltip(); });
                canvas.addEventListener('mousemove', (e) => {
                    if (isMouseDown) {
                        const deltaX = e.clientX - mouseX, deltaY = e.clientY - mouseY;
                        const spherical = new THREE.Spherical().setFromVector3(this.camera.position);
                        spherical.theta -= deltaX * 0.01;
                        spherical.phi += deltaY * 0.01;
                        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                        this.camera.position.setFromSpherical(spherical);
                        this.camera.lookAt(0, 0, 0);
                        mouseX = e.clientX; mouseY = e.clientY;
                    } else { this.handleObjectHover(e); }
                });
                canvas.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    const zoom = e.deltaY * 0.01;
                    const newDistance = this.camera.position.length() * (1 + zoom);
                    this.camera.position.setLength(Math.max(15, Math.min(100, newDistance)));
                }, { passive: false });
                canvas.style.cursor = 'grab';
            }

            handleObjectHover(e) {
                if (this.hoverThrottle) return;
                this.hoverThrottle = true;
                setTimeout(() => this.hoverThrottle = false, 100);
                this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const objectsToIntersect = [this.sun, ...this.planets.map(p => p.mesh)];
                const intersects = this.raycaster.intersectObjects(objectsToIntersect);
                if (intersects.length > 0) {
                    this.showTooltip(e.clientX, e.clientY, intersects[0].object.name);
                } else {
                    this.hideTooltip();
                }
            }

            showTooltip(x, y, objectName) {
                let name, htmlContent;
                if (objectName === 'Sun') {
                    const sunInfo = this.sunData;
                    name = sunInfo.name;
                    htmlContent = `<div style="font-size: 11px; opacity: 0.9; max-width: 280px; line-height: 1.4;">${sunInfo.info}</div>`;
                } else {
                    const planetInfo = this.planetData.find(p => p.name === objectName);
                    if (!planetInfo) return;
                    name = planetInfo.name;
                    htmlContent = `<div style="font-size: 11px; opacity: 0.9; line-height: 1.5;">
                                       <b>Diameter:</b> ${planetInfo.actualDiameter}<br>
                                       <b>Orbital Speed:</b> ${planetInfo.actualSpeed}
                                   </div>
                                   <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 8px 0;">
                                   <div style="font-size: 11px; opacity: 0.9; max-width: 280px; line-height: 1.4;">${planetInfo.info}</div>`;
                }
                this.tooltip.innerHTML = `<strong style="color: #4fc3f7; font-size: 14px; display: block; margin-bottom: 8px;">${name}</strong>${htmlContent}`;
                this.tooltip.style.left = x + 'px';
                this.tooltip.style.top = y + 'px';
                this.tooltip.classList.add('visible');
            }

            hideTooltip() { this.tooltip.classList.remove('visible'); }

            createSun() {
                const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
                const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffaa00, emissiveIntensity: 0.5 });
                this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
                this.sun.name = 'Sun';
                this.scene.add(this.sun);
            }

            createPlanets() {
                this.planetData.forEach(data => {
                    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
                    const material = new THREE.MeshLambertMaterial({ color: data.color });
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.x = data.distance;
                    mesh.name = data.name;
                    if (this.renderer.shadowMap.enabled) { mesh.castShadow = true; mesh.receiveShadow = true; }
                    const orbitPoints = Array.from({ length: 65 }, (_, i) => new THREE.Vector3(Math.cos((i / 64) * Math.PI * 2) * data.distance, 0, Math.sin((i / 64) * Math.PI * 2) * data.distance));
                    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
                    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x333333, opacity: 0.3, transparent: true });
                    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
                    this.scene.add(mesh, orbitLine);
                    this.planets.push({ ...data, mesh, orbitLine, angle: Math.random() * Math.PI * 2 });
                });
            }

            // UPDATED: Create a multi-layered, parallax starfield for a more dynamic background
            createStars() {
                const starColors = [new THREE.Color(0xffffff), new THREE.Color(0xfff0c1), new THREE.Color(0xcad8ff)];

                const createStarLayer = (count, size, distance) => {
                    const positions = [];
                    const colors = [];
                    const geometry = new THREE.BufferGeometry();
                    
                    for (let i = 0; i < count; i++) {
                        const vertex = new THREE.Vector3(
                            (Math.random() - 0.5) * 2,
                            (Math.random() - 0.5) * 2,
                            (Math.random() - 0.5) * 2
                        );
                        vertex.normalize();
                        vertex.multiplyScalar(distance);
                        positions.push(vertex.x, vertex.y, vertex.z);
                        
                        const color = starColors[Math.floor(Math.random() * starColors.length)];
                        colors.push(color.r, color.g, color.b);
                    }
                    
                    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                    const material = new THREE.PointsMaterial({
                        size: size,
                        vertexColors: true,
                        transparent: true,
                        opacity: 0.8,
                        sizeAttenuation: true
                    });
                    
                    const points = new THREE.Points(geometry, material);
                    this.starLayers.push(points);
                    this.scene.add(points);
                };

                createStarLayer(5000, 0.5, 400); // Farthest, smallest stars
                createStarLayer(3000, 0.8, 300); // Mid-distance stars
                createStarLayer(1000, 1.2, 200); // Closest, largest stars
            }

            createLighting() {
                this.scene.add(new THREE.AmbientLight(0x404040, 0.3));
                const pointLight = new THREE.PointLight(0xffffff, 1, 100);
                if (this.renderer.shadowMap.enabled) { pointLight.castShadow = true; pointLight.shadow.mapSize.set(1024, 1024); }
                this.scene.add(pointLight);
            }

            createControls() {
                const controlsContainer = document.getElementById('planet-controls');
                this.planets.forEach(planet => {
                    const control = document.createElement('div');
                    control.className = 'planet-control';
                    control.innerHTML = `
                        <div class="planet-info-header">
                            <div class="planet-name">${planet.name}</div>
                            <div class="planet-speed">${planet.actualSpeed}</div>
                        </div>
                        <div class="speed-control">
                            <input type="range" class="speed-slider" min="0" max="3" step="0.1" value="${planet.animationSpeed}">
                            <span class="speed-value">x${planet.animationSpeed.toFixed(1)}</span>
                        </div>`;
                    const slider = control.querySelector('.speed-slider');
                    const valueDisplay = control.querySelector('.speed-value');
                    slider.addEventListener('input', (e) => {
                        planet.animationSpeed = parseFloat(e.target.value);
                        valueDisplay.textContent = `x${planet.animationSpeed.toFixed(1)}`;
                    });
                    controlsContainer.appendChild(control);
                    this.controls[planet.name] = { slider, valueDisplay };
                });
            }

            setupEventListeners() {
                document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
                document.getElementById('reset-btn').addEventListener('click', () => this.resetSimulation());
                document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
                window.addEventListener('resize', () => {
                    this.camera.aspect = window.innerWidth / window.innerHeight;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                });
            }

            togglePause() {
                this.isPaused = !this.isPaused;
                const btn = document.getElementById('pause-btn');
                btn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
                btn.classList.toggle('paused', this.isPaused);
            }

            resetSimulation() {
                this.planets.forEach(planet => {
                    planet.animationSpeed = 1.0;
                    planet.angle = Math.random() * Math.PI * 2;
                    const control = this.controls[planet.name];
                    control.slider.value = planet.animationSpeed;
                    control.valueDisplay.textContent = `x${planet.animationSpeed.toFixed(1)}`;
                });
                if (this.isPaused) this.togglePause();
            }

            toggleTheme() {
                this.isDarkTheme = !this.isDarkTheme;
                this.updateTheme();
            }

            updateTheme() {
                const themeBtn = document.getElementById('theme-toggle');
                const newColor = this.isDarkTheme ? 0x000000 : 0x001122;
                this.scene.background = new THREE.Color(newColor);
                themeBtn.textContent = this.isDarkTheme ? '🌙' : '☀️';
            }

            // UPDATED: Animate star layers for parallax effect
            animate() {
                requestAnimationFrame(() => this.animate());
                if (!this.isPaused) {
                    const delta = this.clock.getDelta();
                    this.sun.rotation.y += delta * 0.5;

                    this.starLayers.forEach((layer, index) => {
                        layer.rotation.y += delta * 0.005 * (index + 1); // Different speeds for each layer
                    });

                    this.planets.forEach(planet => {
                        planet.angle += delta * planet.baseSpeed * planet.animationSpeed * 0.1;
                        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
                        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
                        planet.mesh.rotation.y += delta * 2;
                    });
                }
                this.renderer.render(this.scene, this.camera);
            }
        }

        document.addEventListener('DOMContentLoaded', () => new SolarSystem());