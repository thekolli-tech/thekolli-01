/**
 * KLABS — Master Three.js 3D Spatial Universe Engine
 * Creates genuine 3D geometry, spatial camera travel, physical materials,
 * volumetric particles, and page-specific 3D technological environments.
 */

(function () {
  'use strict';

  // Check WebGL availability
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  class Klabs3DUniverse {
    constructor() {
      this.canvas = document.getElementById('webgl-hero-canvas') || document.querySelector('.webgl-3d-canvas');
      if (!this.canvas) return;

      if (!window.THREE || !isWebGLAvailable()) {
        console.warn('Three.js or WebGL not available. Using 2D fallback.');
        return;
      }

      this.pageType = this.canvas.dataset.page || 'home';
      this.container = this.canvas.parentElement;
      this.width = this.container.clientWidth || window.innerWidth;
      this.height = this.container.clientHeight || window.innerHeight;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = new THREE.Clock();
      this.animId = null;
      this.isPaused = false;

      // Mouse parallax tracking
      this.targetMouse = { x: 0, y: 0 };
      this.currentMouse = { x: 0, y: 0 };

      // Reduced motion flag
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Specific 3D Object groups
      this.centralGroup = new THREE.Group();
      this.particlesGroup = new THREE.Group();
      this.ringsGroup = new THREE.Group();
      this.gridHelper = null;

      this.init();
    }

    init() {
      // 1. Scene & Camera Setup
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x05090b, 0.028);

      const aspect = this.width / this.height;
      this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
      this.camera.position.set(0, 0, 11);

      // 2. WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;

      // 3. 3D Lighting Environment
      this.setupLighting();

      // 4. Build 3D World According to Page Mode
      this.buildEnvironment();

      // 5. Global Volumetric Starfield / Spatial Particle Grid
      this.buildSpatialParticles();

      // 6. Horizon Perspective Grid
      this.buildPerspectiveGrid();

      // 7. Event Listeners
      this.bindEvents();

      // 8. Start Render Loop
      this.animate();
    }

    setupLighting() {
      // Ambient base fill
      const ambientLight = new THREE.AmbientLight(0x041a16, 1.4);
      this.scene.add(ambientLight);

      // Key directional light for metallic highlights
      const keyLight = new THREE.DirectionalLight(0xf7fafa, 1.8);
      keyLight.position.set(6, 10, 8);
      this.scene.add(keyLight);

      // Primary Icon Green Rim Light (#01D4AC)
      this.pointLightGreen = new THREE.PointLight(0x01d4ac, 3.8, 30);
      this.pointLightGreen.position.set(-6, 3, 5);
      this.scene.add(this.pointLightGreen);

      // Luminous Bright Green Accent Light (#00FFB2)
      this.pointLightMint = new THREE.PointLight(0x00ffb2, 3.2, 25);
      this.pointLightMint.position.set(6, -4, 4);
      this.scene.add(this.pointLightMint);
    }

    buildEnvironment() {
      this.scene.add(this.centralGroup);
      this.scene.add(this.ringsGroup);

      switch (this.pageType) {
        case 'home':
          this.buildHomeUniverse();
          break;
        case 'about':
          this.buildAboutUniverse();
          break;
        case 'services':
          this.buildServicesUniverse();
          break;
        case 'what-we-do':
          this.buildWhatWeDoUniverse();
          break;
        case 'products':
          this.buildProductsUniverse();
          break;
        default:
          this.buildDefaultUniverse();
          break;
      }
    }

    /* -------------------------------------------------------------------------
       Homepage: Ambient Deep Space Rings (Block K mesh removed per user request)
       ------------------------------------------------------------------------- */
    buildHomeUniverse() {
      // Central 3D polygon K removed to maintain soothing liquid glass aesthetic.
      // centralGroup remains empty or subtle so no rotating block K renders.
      this.centralGroup.position.set(0, 0, 0);

      // Concentric 3D Orbital Torus Rings
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: 0x01d4ac,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });

      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0x00ffb2,
        wireframe: true,
        transparent: true,
        opacity: 0.22
      });

      const ringMat3 = new THREE.MeshBasicMaterial({
        color: 0x02bf97,
        wireframe: true,
        transparent: true,
        opacity: 0.18
      });

      // Inner ring
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.02, 16, 90), ringMat1);
      ring1.rotation.x = Math.PI / 2.8;
      ring1.rotation.y = 0.2;
      this.ringsGroup.add(ring1);
      this.ring1 = ring1;

      // Middle ring
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.02, 16, 90), ringMat2);
      ring2.rotation.x = Math.PI / 3.2;
      ring2.rotation.y = -0.3;
      this.ringsGroup.add(ring2);
      this.ring2 = ring2;

      // Outer ring
      const ring3 = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.02, 16, 90), ringMat3);
      ring3.rotation.x = Math.PI / 2.4;
      ring3.rotation.y = 0.15;
      this.ringsGroup.add(ring3);
      this.ring3 = ring3;
    }

    /* -------------------------------------------------------------------------
       About Us: 3D Interconnected Architectural Crystal Polyhedrons
       ------------------------------------------------------------------------- */
    buildAboutUniverse() {
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x01d4ac,
        metalness: 0.8,
        roughness: 0.25,
        wireframe: true
      });

      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x00ffb2,
        transmission: 0.8,
        transparent: true,
        opacity: 0.7,
        roughness: 0.2
      });

      // Central Polyhedron
      const outerIcosa = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 1), crystalMat);
      const innerCore = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), coreMat);

      this.centralGroup.add(outerIcosa);
      this.centralGroup.add(innerCore);

      // Satellite interconnected nodes
      for (let i = 0; i < 6; i++) {
        const satNode = new THREE.Mesh(new THREE.TetrahedronGeometry(0.5, 0), crystalMat);
        const angle = (Math.PI * 2 / 6) * i;
        const rad = 4.2;
        satNode.position.set(Math.cos(angle) * rad, Math.sin(angle) * (rad * 0.4), Math.sin(angle) * 1.5);
        this.centralGroup.add(satNode);
      }
    }

    /* -------------------------------------------------------------------------
       Services: 4 3D Floating Capability Clusters
       ------------------------------------------------------------------------- */
    buildServicesUniverse() {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x01d4ac,
        wireframe: true,
        metalness: 0.9,
        roughness: 0.1
      });

      // 4 orbiting cluster polyhedrons
      const shapes = [
        new THREE.BoxGeometry(1.6, 1.6, 1.6),        // Software
        new THREE.DodecahedronGeometry(1.3, 0),      // AI Core
        new THREE.SphereGeometry(1.2, 16, 16),       // Cloud
        new THREE.TorusGeometry(1.2, 0.35, 12, 32)   // Managed IT
      ];

      shapes.forEach((geo, idx) => {
        const mesh = new THREE.Mesh(geo, mat);
        const angle = (Math.PI * 2 / 4) * idx;
        mesh.position.set(Math.cos(angle) * 4.5, Math.sin(angle) * 2.2, Math.sin(angle) * 1.5);
        this.centralGroup.add(mesh);
      });
    }

    /* -------------------------------------------------------------------------
       What We Do: 3D 6-Stage Progression Pipeline
       ------------------------------------------------------------------------- */
    buildWhatWeDoUniverse() {
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x00ffb2,
        metalness: 0.7,
        roughness: 0.3
      });

      // 6-stage node pathway in 3D arc
      for (let i = 0; i < 6; i++) {
        const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), nodeMat);
        const t = (i / 5) * 2 - 1; // -1 to 1
        node.position.set(t * 6.5, Math.sin(i * 0.8) * 1.2, Math.cos(i * 0.8) * 2);
        this.centralGroup.add(node);
      }

      // Interconnecting line curve
      const points = [];
      for (let i = 0; i < 6; i++) {
        const t = (i / 5) * 2 - 1;
        points.push(new THREE.Vector3(t * 6.5, Math.sin(i * 0.8) * 1.2, Math.cos(i * 0.8) * 2));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0x01d4ac, transparent: true, opacity: 0.45 });
      this.centralGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
    }

    /* -------------------------------------------------------------------------
       Products: Dual 3D Modules (KLERP Modular Crystal & KLAI Neural Core)
       ------------------------------------------------------------------------- */
    buildProductsUniverse() {
      const klerpMat = new THREE.MeshStandardMaterial({ color: 0x01d4ac, wireframe: true });
      const klaiMat = new THREE.MeshPhysicalMaterial({
        color: 0x00ffb2,
        wireframe: false,
        transmission: 0.7,
        transparent: true,
        opacity: 0.8
      });

      // KLERP Structure (Left)
      const klerpCube = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), klerpMat);
      klerpCube.position.set(-3.5, 0, 0);
      this.centralGroup.add(klerpCube);

      // KLAI Neural Core (Right)
      const klaiCore = new THREE.Mesh(new THREE.IcosahedronGeometry(2.0, 1), klaiMat);
      klaiCore.position.set(3.5, 0, 0);
      this.centralGroup.add(klaiCore);
    }

    /* -------------------------------------------------------------------------
       Default Subpage Spatial Universe
       ------------------------------------------------------------------------- */
    buildDefaultUniverse() {
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x01d4ac, wireframe: true, transparent: true, opacity: 0.25 });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.03, 16, 80), ringMat);
      ring.rotation.x = Math.PI / 3;
      this.ringsGroup.add(ring);
      this.ring1 = ring;
    }

    /* -------------------------------------------------------------------------
       Volumetric Spatial Starfield / Particles in 3D Space
       ------------------------------------------------------------------------- */
    buildSpatialParticles() {
      const particleCount = 750;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorPalette = [
        new THREE.Color(0x01d4ac),
        new THREE.Color(0x00ffb2),
        new THREE.Color(0x02bf97),
        new THREE.Color(0xf7fafa)
      ];

      for (let i = 0; i < particleCount; i++) {
        // Distribute in a spherical volume
        const rad = 5 + Math.random() * 20;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = (rad * Math.sin(phi) * Math.sin(theta)) * 0.7; // flatten Y slightly
        positions[i * 3 + 2] = rad * Math.cos(phi) - 2;

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });

      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);
    }

    /* -------------------------------------------------------------------------
       Perspective Horizon Grid
       ------------------------------------------------------------------------- */
    buildPerspectiveGrid() {
      this.gridHelper = new THREE.GridHelper(30, 30, 0x01d4ac, 0x042e26);
      this.gridHelper.position.set(0, -5, 0);
      this.gridHelper.material.transparent = true;
      this.gridHelper.material.opacity = 0.22;
      this.scene.add(this.gridHelper);
    }

    bindEvents() {
      // Window resize
      window.addEventListener('resize', () => this.onResize(), { passive: true });

      // Pointer parallax
      window.addEventListener('mousemove', (e) => {
        const halfX = window.innerWidth / 2;
        const halfY = window.innerHeight / 2;
        this.targetMouse.x = (e.clientX - halfX) / halfX;
        this.targetMouse.y = (e.clientY - halfY) / halfY;
      }, { passive: true });

      // Scroll linked camera travel
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY || window.pageYOffset;
        if (this.camera) {
          this.camera.position.y = -scrollY * 0.0018;
          if (this.gridHelper) {
            this.gridHelper.position.z = (scrollY * 0.003) % 2;
          }
        }
      }, { passive: true });

      // Tab visibility pause
      document.addEventListener('visibilitychange', () => {
        this.isPaused = document.hidden;
      });

      // Pause when container offscreen
      if ('IntersectionObserver' in window && this.container) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isPaused = !entry.isIntersecting;
          });
        }, { threshold: 0.05 });
        observer.observe(this.container);
      }

      // Smooth reveal on site load event
      window.addEventListener('klabs:site-loaded', () => {
        if (this.camera) {
          // Camera dolly-in zoom from 14 to 11
          const startZ = 13.5;
          const endZ = 11.0;
          let startTime = performance.now();
          const zoomAnim = (now) => {
            const p = Math.min((now - startTime) / 1000, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            this.camera.position.z = startZ + (endZ - startZ) * ease;
            if (p < 1) requestAnimationFrame(zoomAnim);
          };
          requestAnimationFrame(zoomAnim);
        }
      });
    }

    onResize() {
      this.width = this.container.clientWidth || window.innerWidth;
      this.height = this.container.clientHeight || window.innerHeight;
      if (this.camera && this.renderer) {
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      }
    }

    animate() {
      this.animId = requestAnimationFrame(() => this.animate());

      if (this.isPaused) return;

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Smooth pointer parallax with lerp
      if (!this.reducedMotion) {
        this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.04;
        this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.04;

        this.camera.position.x = this.currentMouse.x * 0.8;
        this.camera.lookAt(0, this.camera.position.y * 0.5, 0);

        // Slow central object rotation
        if (this.centralGroup) {
          this.centralGroup.rotation.y = elapsed * 0.15 + this.currentMouse.x * 0.3;
          this.centralGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.08 - this.currentMouse.y * 0.2;
        }

        // Orbit ring continuous rotation
        if (this.ring1) this.ring1.rotation.z = elapsed * 0.1;
        if (this.ring2) this.ring2.rotation.z = -elapsed * 0.07;
        if (this.ring3) this.ring3.rotation.z = elapsed * 0.05;

        // Particle field slow drift
        if (this.particles) {
          this.particles.rotation.y = elapsed * 0.02;
          this.particles.rotation.x = Math.sin(elapsed * 0.015) * 0.05;
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  // Auto-initialize when DOM is ready
  function init() {
    new Klabs3DUniverse();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
