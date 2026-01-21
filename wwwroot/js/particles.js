// Particle Animation Background
(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let width, height;

    // Coffee-themed colors
    const colors = [
        'rgba(196, 164, 132, 0.6)',  // Primary coffee
        'rgba(212, 165, 116, 0.5)',  // Secondary warm
        'rgba(139, 115, 85, 0.4)',   // Dark roast
        'rgba(232, 220, 196, 0.3)',  // Cream
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.5 + 0.2,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01
        };
    }

    function initParticles() {
        particles = [];
        const count = Math.min(100, Math.floor((width * height) / 15000));
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    function drawParticle(p) {
        const pulseFactor = Math.sin(p.pulse) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * pulseFactor;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    function connectParticles() {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(196, 164, 132, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function updateParticle(p) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += p.pulseSpeed;

        // Wrap around edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw flowing gradient waves
        drawFlowingGradient();

        // Update and draw particles
        particles.forEach(p => {
            updateParticle(p);
            drawParticle(p);
        });

        // Connect nearby particles
        connectParticles();

        animationId = requestAnimationFrame(animate);
    }

    let time = 0;
    function drawFlowingGradient() {
        time += 0.005;

        // Animated gradient blobs
        const gradient1 = ctx.createRadialGradient(
            width * (0.3 + Math.sin(time) * 0.1),
            height * (0.3 + Math.cos(time * 0.7) * 0.1),
            0,
            width * (0.3 + Math.sin(time) * 0.1),
            height * (0.3 + Math.cos(time * 0.7) * 0.1),
            width * 0.4
        );
        gradient1.addColorStop(0, 'rgba(196, 164, 132, 0.03)');
        gradient1.addColorStop(1, 'transparent');

        const gradient2 = ctx.createRadialGradient(
            width * (0.7 + Math.cos(time * 0.8) * 0.1),
            height * (0.7 + Math.sin(time * 0.6) * 0.1),
            0,
            width * (0.7 + Math.cos(time * 0.8) * 0.1),
            height * (0.7 + Math.sin(time * 0.6) * 0.1),
            width * 0.35
        );
        gradient2.addColorStop(0, 'rgba(212, 165, 116, 0.025)');
        gradient2.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, width, height);
    }

    // Initialize
    resize();
    initParticles();
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
})();
