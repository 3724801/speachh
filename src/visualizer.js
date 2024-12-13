export class AudioVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.animationId = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.source = this.audioContext.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing audio visualizer:', error);
            throw error;
        }
    }

    start() {
        if (!this.isInitialized) {
            this.initialize().then(() => this.draw());
            return;
        }
        this.draw();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    draw = () => {
        if (!this.analyser) return;

        // Update canvas dimensions to match display size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        const barWidth = width / this.dataArray.length;
        const barGap = 2;
        
        // Draw frequency bars
        this.ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--secondary')
            .trim();
        
        for (let i = 0; i < this.dataArray.length; i++) {
            const barHeight = (this.dataArray[i] / 255) * height;
            const x = i * (barWidth + barGap);
            const y = height - barHeight;
            
            this.ctx.fillRect(x, y, barWidth - barGap, barHeight);
        }
        
        this.animationId = requestAnimationFrame(this.draw);
    }
}

export function setupVisualizer() {
    return new AudioVisualizer('visualizer');
}