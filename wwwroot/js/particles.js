// Interactive Particle Animation with Simplex Noise Flow Field
(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let width, height;
    let mouse = { x: null, y: null, radius: 150 };
    let time = 0;

    // Simplex Noise implementation for organic flow
    const NOISE_SCALE = 0.003;
    const NOISE_SPEED = 0.0005;

    // Simple noise function (based on improved Perlin noise concept)
    function noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = fade(x);
        const v = fade(y);
        const w = fade(z);

        // Simple hash-based noise
        const n = X + Y * 57 + Z * 113;
        const a = hash(n);
        const b = hash(n + 1);
        const c = hash(n + 57);
        const d = hash(n + 58);
        const e = hash(n + 113);
        const f = hash(n + 114);
        const g = hash(n + 170);
        const h = hash(n + 171);

        return lerp(w,
            lerp(v, lerp(u, a, b), lerp(u, c, d)),
            lerp(v, lerp(u, e, f), lerp(u, g, h))
        );
    }

    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(t, a, b) { return a + t * (b - a); }
    function hash(n) {
        const x = Math.sin(n) * 43758.5453123;
        return x - Math.floor(x);
    }

    // Coffee-themed colors with varying opacity
    const colors = [
        { r: 196, g: 164, b: 132 },  // Primary coffee
        { r: 212, g: 165, b: 116 },  // Secondary warm
        { r: 139, g: 115, b: 85 },   // Dark roast
        { r: 232, g: 220, b: 196 },  // Cream
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticle(x, y) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        return {
            x: x !== undefined ? x : Math.random() * width,
            y: y !== undefined ? y : Math.random() * height,
            baseX: 0,
            baseY: 0,
            size: Math.random() * 2.5 + 0.5,
            color: color,
            opacity: Math.random() * 0.6 + 0.2,
            speedMultiplier: Math.random() * 0.5 + 0.5,
            noiseOffsetX: Math.random() * 1000,
            noiseOffsetY: Math.random() * 1000,
            life: 1,
            maxLife: Math.random() * 500 + 500
        };
    }

    function initParticles() {
        particles = [];
        const count = Math.min(150, Math.floor((width * height) / 10000));
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    function getFlowAngle(x, y) {
        const noiseVal = noise(
            x * NOISE_SCALE,
            y * NOISE_SCALE,
            time * NOISE_SPEED
        );
        return noiseVal * Math.PI * 4;
    }

    function updateParticle(p) {
        // Get flow field direction
        const angle = getFlowAngle(p.x + p.noiseOffsetX, p.y + p.noiseOffsetY);
        const flowX = Math.cos(angle) * 0.5 * p.speedMultiplier;
        const flowY = Math.sin(angle) * 0.5 * p.speedMultiplier;

        // Mouse interaction
        let mouseInfluenceX = 0;
        let mouseInfluenceY = 0;

        if (mouse.x !== null && mouse.y !== null) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                // Particles gently pushed away from mouse
                mouseInfluenceX = Math.cos(angle) * force * 2;
                mouseInfluenceY = Math.sin(angle) * force * 2;
            }
        }

        // Apply movement
        p.x += flowX + mouseInfluenceX;
        p.y += flowY + mouseInfluenceY;

        // Wrap around edges with smooth transition
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
    }

    function drawParticle(p) {
        // Pulsing glow effect
        const pulse = Math.sin(time * 0.002 + p.noiseOffsetX) * 0.3 + 0.7;
        const size = p.size * pulse;

        // Draw glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
        gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity * pulse * 0.5})`);
        gradient.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity * pulse * 0.2})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity * pulse})`;
        ctx.fill();
    }

    function connectParticles() {
        const maxDist = 100;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.12;

                    // Gradient line
                    const gradient = ctx.createLinearGradient(
                        particles[i].x, particles[i].y,
                        particles[j].x, particles[j].y
                    );
                    gradient.addColorStop(0, `rgba(${particles[i].color.r}, ${particles[i].color.g}, ${particles[i].color.b}, ${opacity})`);
                    gradient.addColorStop(1, `rgba(${particles[j].color.r}, ${particles[j].color.g}, ${particles[j].color.b}, ${opacity})`);

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function drawMouseGlow() {
        if (mouse.x === null || mouse.y === null) return;

        // Soft glow around mouse
        const gradient = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,
            mouse.x, mouse.y, mouse.radius
        );
        gradient.addColorStop(0, 'rgba(196, 164, 132, 0.08)');
        gradient.addColorStop(0.5, 'rgba(196, 164, 132, 0.03)');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    function drawFlowingGradients() {
        // Multiple animated gradient blobs
        const blobs = [
            { x: 0.25, y: 0.25, speed: 1, size: 0.4, color: [196, 164, 132, 0.04] },
            { x: 0.75, y: 0.75, speed: 0.7, size: 0.35, color: [212, 165, 116, 0.03] },
            { x: 0.5, y: 0.3, speed: 0.9, size: 0.3, color: [139, 115, 85, 0.025] },
            { x: 0.2, y: 0.7, speed: 1.1, size: 0.25, color: [232, 220, 196, 0.02] },
        ];

        blobs.forEach(blob => {
            const t = time * 0.0003 * blob.speed;
            const x = width * (blob.x + Math.sin(t) * 0.15);
            const y = height * (blob.y + Math.cos(t * 0.8) * 0.15);
            const radius = Math.min(width, height) * blob.size;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${blob.color[3]})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        });
    }

    function animate() {
        time++;
        ctx.clearRect(0, 0, width, height);

        // Draw flowing gradient background
        drawFlowingGradients();

        // Draw mouse glow
        drawMouseGlow();

        // Update and draw particles
        particles.forEach(p => {
            updateParticle(p);
            drawParticle(p);
        });

        // Connect nearby particles
        connectParticles();

        animationId = requestAnimationFrame(animate);
    }

    // Mouse tracking with smooth interpolation
    let targetMouse = { x: null, y: null };

    function handleMouseMove(e) {
        targetMouse.x = e.clientX;
        targetMouse.y = e.clientY;
    }

    function handleMouseLeave() {
        targetMouse.x = null;
        targetMouse.y = null;
    }

    function handleTouchMove(e) {
        if (e.touches.length > 0) {
            targetMouse.x = e.touches[0].clientX;
            targetMouse.y = e.touches[0].clientY;
        }
    }

    function handleTouchEnd() {
        targetMouse.x = null;
        targetMouse.y = null;
    }

    // Smooth mouse position interpolation
    function updateMousePosition() {
        if (targetMouse.x !== null && targetMouse.y !== null) {
            if (mouse.x === null) {
                mouse.x = targetMouse.x;
                mouse.y = targetMouse.y;
            } else {
                mouse.x += (targetMouse.x - mouse.x) * 0.1;
                mouse.y += (targetMouse.y - mouse.y) * 0.1;
            }
        } else {
            mouse.x = null;
            mouse.y = null;
        }
        requestAnimationFrame(updateMousePosition);
    }

    // Initialize
    resize();
    initParticles();
    animate();
    updateMousePosition();

    // Event listeners
    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
})();
