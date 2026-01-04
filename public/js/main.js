console.log('Laminar Circuits Engine Initialized');

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Burger Menu Logic
    const burger = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav-list');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('active');
            burger.classList.toggle('active');
            document.body.classList.toggle('no-scroll'); // Optional: prevent body scroll
        });

        // Close menu when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                burger.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // 1. Initial Hero Animation (On Load)
    const heroTimeline = gsap.timeline();
    heroTimeline
        .from(".hero-heading", { y: 30, opacity: 0, duration: 1, ease: "power3.out" })
        .from(".hero-subtext", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
        .from(".frame-hero .btn", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");

    // 2. Scroll Animations for Subsequent Frames
    const frames = document.querySelectorAll('.scroll-frame:not(.frame-hero)');
    frames.forEach(frame => {
        // Micro Headings
        const heading = frame.querySelector('.micro-heading');
        if (heading) {
            gsap.from(heading, {
                scrollTrigger: { trigger: frame, start: "top 70%" },
                y: 20, opacity: 0, duration: 0.8, ease: "power2.out"
            });
        }

        // Main Text Blocks (Stacked, Statements, CTA)
        const mainText = frame.querySelectorAll('.stacked-text p, .main-statement, .cta-heading');
        if (mainText.length) {
            gsap.from(mainText, {
                scrollTrigger: { trigger: frame, start: "top 65%" },
                y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out"
            });
        }

        // Supporting Lines (Fade in from left)
        const lines = frame.querySelectorAll('.supporting-lines p');
        if (lines.length) {
            gsap.from(lines, {
                scrollTrigger: { trigger: frame, start: "top 60%" },
                x: -15, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out"
            });
        }

        // Stagger Group (Beliefs)
        const beliefs = frame.querySelectorAll('.belief-item');
        if (beliefs.length) {
            gsap.from(beliefs, {
                scrollTrigger: { trigger: frame, start: "top 60%" },
                y: 20, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out"
            });
        }

        // Action Area (CTA at bottom)
        const action = frame.querySelector('.action-area');
        if (action) {
            gsap.from(action, {
                scrollTrigger: { trigger: frame, start: "top 75%" },
                y: 20, opacity: 0, duration: 0.8, ease: "power2.out"
            });
        }
    });

    // 3. Generic Fade Up (Services/Capabilities)
    gsap.utils.toArray('.fade-up').forEach(element => {
        gsap.from(element, {
            scrollTrigger: { trigger: element, start: "top 90%" },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // 4. Initialize PCB Background Animation
    initPCBBackground();
});

function initPCBBackground() {
    const container = document.getElementById('hero-canvas-container');
    if (!container) return;

    // Create Canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Resize Observer
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // PCB Traces Logic
    // We want a subtle, technical background.
    // Slow moving "signals" along grid lines.

    const gridSize = 40;
    const traces = [];
    const maxTraces = 30;
    // const color = '#6D7F48'; // Golden Green

    class Trace {
        constructor() {
            this.reset();
        }

        reset() {
            // Snap to grid
            this.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
            this.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
            this.history = [];
            this.dir = Math.floor(Math.random() * 4); // 0: N, 1: E, 2: S, 3: W
            this.speed = 2; // slow speed
            this.length = 0;
            this.maxLength = 200 + Math.random() * 400;
            this.age = 0;
            this.maxAge = 400 + Math.random() * 200;
            this.opacity = 0;
        }

        update() {
            // Fade in/out
            if (this.age < 50) this.opacity += 0.02;
            if (this.age > this.maxAge - 50) this.opacity -= 0.02;
            if (this.opacity < 0) this.opacity = 0;
            if (this.opacity > 0.4) this.opacity = 0.4; // Max opacity low

            // Move
            if (this.dir === 0) this.y -= this.speed;
            else if (this.dir === 1) this.x += this.speed;
            else if (this.dir === 2) this.y += this.speed;
            else if (this.dir === 3) this.x -= this.speed;

            // Turn randomly on grid points
            if (this.x % gridSize === 0 && this.y % gridSize === 0) {
                if (Math.random() < 0.2) {
                    // Pick new direction 90 degrees
                    const turns = [0, 1, 2, 3].filter(d => d !== (this.dir + 2) % 4); // Don't go back
                    this.dir = turns[Math.floor(Math.random() * turns.length)];
                }
            }

            // Boundary checks
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }

            // Age
            this.age++;
            if (this.age > this.maxAge) {
                this.reset();
            }

            // Store history for drawing trails
            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > 50) this.history.shift();
        }

        draw() {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(109, 127, 72, ${this.opacity})`; // Golden Green
            ctx.lineWidth = 1.5;

            if (this.history.length < 2) return;

            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.stroke();

            // Draw head
            ctx.fillStyle = `rgba(109, 127, 72, ${this.opacity + 0.3})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize traces
    for (let i = 0; i < maxTraces; i++) {
        traces.push(new Trace());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Grid Points (Subtle) - Dark dots for White BG
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for (let x = 0; x < canvas.width; x += gridSize) {
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.fillRect(x - 1, y - 1, 2, 2);
            }
        }

        traces.forEach(t => {
            t.update();
            t.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}
