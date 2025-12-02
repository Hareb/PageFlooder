// ==================== WATER ENGINE - CANVAS SIMULATION ====================
// Real water simulation with waves, particles, and fluid physics

class WaterEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.waterLevel = 0; // 0-100
        this.waves = [];
        this.particles = [];
        this.animationFrame = null;
        this.isRunning = false;

        // Water properties
        this.waterColor = {
            r: 41, g: 128, b: 185, a: 0.85
        };
        this.surfaceColor = {
            r: 100, g: 200, b: 255, a: 0.9
        };

        // Wave parameters
        this.waveCount = 5;
        this.waveSpeed = 0.02;
        this.waveAmplitude = 15;

        // Particle parameters
        this.particleCount = 50;
        this.maxParticles = 100;
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'dom-flood-water-canvas';
        this.canvas.style.cssText = `
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 2147483646 !important;
            pointer-events: none !important;
        `;

        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize waves
        this.initWaves();

        // Initialize particles
        this.initParticles();

        console.log('🌊 Water Engine: Canvas initialized');
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initWaves() {
        this.waves = [];
        for (let i = 0; i < this.waveCount; i++) {
            this.waves.push({
                amplitude: this.waveAmplitude + (Math.random() * 10 - 5),
                frequency: 0.01 + Math.random() * 0.005,
                phase: Math.random() * Math.PI * 2,
                speed: this.waveSpeed + (Math.random() * 0.01 - 0.005),
                offset: i * 5
            });
        }
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.addParticle();
        }
    }

    addParticle() {
        if (this.particles.length >= this.maxParticles) return;

        this.particles.push({
            x: Math.random() * this.canvas.width,
            y: this.getWaterSurfaceY() + Math.random() * 100,
            size: 2 + Math.random() * 4,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: -0.5 - Math.random() * 0.5, // Bubbles rise
            opacity: 0.3 + Math.random() * 0.4,
            life: 1.0
        });
    }

    getWaterSurfaceY() {
        const waterHeight = (this.waterLevel / 100) * this.canvas.height;
        return this.canvas.height - waterHeight;
    }

    calculateWaveY(x, time) {
        let y = 0;

        for (let wave of this.waves) {
            y += Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
        }

        return y;
    }

    updateParticles() {
        const waterSurfaceY = this.getWaterSurfaceY();

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update position
            p.x += p.speedX;
            p.y += p.speedY;

            // Fade out
            p.life -= 0.005;

            // Remove if dead or above water
            if (p.life <= 0 || p.y < waterSurfaceY - 50) {
                this.particles.splice(i, 1);
                continue;
            }

            // Wrap around horizontally
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;

            // Slow down near surface
            if (p.y < waterSurfaceY + 20) {
                p.speedY *= 0.95;
            }
        }

        // Add new particles
        if (this.waterLevel > 0 && this.particles.length < this.particleCount) {
            if (Math.random() < 0.1) {
                this.addParticle();
            }
        }
    }

    draw(time) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.waterLevel === 0) return;

        const waterSurfaceY = this.getWaterSurfaceY();

        // Draw water body
        this.ctx.fillStyle = `rgba(${this.waterColor.r}, ${this.waterColor.g}, ${this.waterColor.b}, ${this.waterColor.a})`;
        this.ctx.fillRect(0, waterSurfaceY, this.canvas.width, this.canvas.height);

        // Draw darker gradient at bottom for depth
        const gradient = this.ctx.createLinearGradient(0, waterSurfaceY, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(41, 128, 185, 0)');
        gradient.addColorStop(1, 'rgba(21, 67, 96, 0.4)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, waterSurfaceY, this.canvas.width, this.canvas.height);

        // Draw animated waves on surface
        this.ctx.beginPath();
        this.ctx.moveTo(0, waterSurfaceY);

        for (let x = 0; x <= this.canvas.width; x += 3) {
            const waveY = this.calculateWaveY(x, time);
            this.ctx.lineTo(x, waterSurfaceY + waveY);
        }

        this.ctx.lineTo(this.canvas.width, waterSurfaceY);
        this.ctx.closePath();

        // Fill wave area with lighter color
        const waveGradient = this.ctx.createLinearGradient(0, waterSurfaceY - 30, 0, waterSurfaceY + 30);
        waveGradient.addColorStop(0, `rgba(${this.surfaceColor.r}, ${this.surfaceColor.g}, ${this.surfaceColor.b}, ${this.surfaceColor.a})`);
        waveGradient.addColorStop(1, `rgba(${this.waterColor.r}, ${this.waterColor.g}, ${this.waterColor.b}, ${this.waterColor.a * 0.7})`);
        this.ctx.fillStyle = waveGradient;
        this.ctx.fill();

        // Draw wave highlights
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw particles (bubbles)
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * p.life})`;
            this.ctx.fill();

            // Bubble highlight
            this.ctx.beginPath();
            this.ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * p.life * 0.8})`;
            this.ctx.fill();
        });

        // Draw surface shimmer
        const shimmerY = waterSurfaceY;
        for (let i = 0; i < 3; i++) {
            const shimmerX = (time * 50 + i * this.canvas.width / 3) % this.canvas.width;
            const shimmerGrad = this.ctx.createRadialGradient(
                shimmerX, shimmerY, 0,
                shimmerX, shimmerY, 100
            );
            shimmerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            shimmerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = shimmerGrad;
            this.ctx.fillRect(shimmerX - 100, shimmerY - 20, 200, 40);
        }
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        let startTime = Date.now();

        const animate = () => {
            if (!this.isRunning) return;

            const currentTime = (Date.now() - startTime) / 1000;

            // Update
            this.updateParticles();

            // Draw
            this.draw(currentTime);

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
        console.log('🌊 Water Engine: Animation started');
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        console.log('🌊 Water Engine: Animation stopped');
    }

    setWaterLevel(level) {
        this.waterLevel = Math.max(0, Math.min(100, level));

        // Adjust particle count based on water level
        const targetParticles = Math.floor((this.waterLevel / 100) * this.maxParticles);
        this.particleCount = targetParticles;
    }

    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.canvas = null;
        this.ctx = null;
        console.log('🌊 Water Engine: Destroyed');
    }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WaterEngine;
}
