import { animate, scroll, inView } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // Performance & Device Detection
    // -------------------------------------------------------------
    const isMobile = window.innerWidth <= 768;
    const canvas = document.getElementById("hero-canvas");
    const context = canvas.getContext("2d");
    const heroTrack = document.getElementById("section-intro");
    const preloaderBar = document.getElementById("preloader-bar");
    const preloader = document.getElementById("preloader");
    
    // Adaptive Resolution
    // On mobile, we reduce buffer size to 720p for faster pixel throughput
    canvas.width = isMobile ? 1280 : 1920;
    canvas.height = isMobile ? 720 : 1080;

    // Adaptive Frame Count
    // On mobile, we use 120 frames (skip every 2nd) to save ~50% RAM/GPU memory
    const maxFrames = 240;
    const frameCount = isMobile ? 120 : maxFrames;
    const frameStep = isMobile ? 2 : 1;

    const currentFrame = index => {
        // If mobile, we map index 1-120 to actual files 1-240 (every 2nd)
        const actualIndex = isMobile ? index * 2 : index;
        const paddedIndex = Math.min(maxFrames, Math.max(1, actualIndex))
            .toString().padStart(3, '0');
        return `images/herosection/ezgif-frame-${paddedIndex}.png`;
    };

    const images = [];
    let loadedImages = 0;

    // -------------------------------------------------------------
    // Progressive Loading Engine
    // -------------------------------------------------------------
    
    // Stage 1: Load first frame immediately
    const imgFirst = new Image();
    imgFirst.src = currentFrame(1);
    imgFirst.onload = () => {
        renderFrame(1);
        preloadStage2(); // Load keyframes
    }

    function preloadStage2() {
        // Load every 10th frame first to get "Quick Interaction" ready
        const keyFrames = [];
        for (let i = 1; i <= frameCount; i += 10) {
            keyFrames.push(i);
        }

        let keyLoaded = 0;
        keyFrames.forEach(i => {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                keyLoaded++;
                loadedImages++;
                updatePreloader();
                if (keyLoaded === keyFrames.length) preloadStage3(); // Load the rest
            };
            images[i] = img;
        });
    }

    function preloadStage3() {
        // Load all remaining frames
        for (let i = 1; i <= frameCount; i++) {
            if (images[i]) continue; // Skip if already loaded in Stage 2
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                loadedImages++;
                updatePreloader();
            };
            images[i] = img;
        }
    }

    function updatePreloader() {
        const percent = (loadedImages / frameCount) * 100;
        if (preloaderBar) preloaderBar.style.width = `${percent}%`;
        
        // Hide preloader once "enough" frames are ready (e.g. 20% or 30 frames)
        if (loadedImages >= Math.min(30, frameCount) && preloader) {
            preloader.classList.add("fade-out");
        }
    }

    function renderFrame(index) {
        const img = images[index];
        if (img && img.complete) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }

    // Engine State for Smooth LERP (Linear Interpolation)
    let currentProgress = 0;
    const ease = isMobile ? 0.12 : 0.08; // Snappier on mobile to feel "lighter"

    function renderLoop() {
        const trackHeight = heroTrack.clientHeight - window.innerHeight;
        if (trackHeight <= 0) return requestAnimationFrame(renderLoop);

        let targetProgress = window.scrollY / trackHeight;
        targetProgress = Math.max(0, Math.min(targetProgress, 1));
        
        // Lerp magic
        currentProgress += (targetProgress - currentProgress) * ease;
        
        const frameIndex = Math.min(
            frameCount,
            Math.max(1, Math.floor(currentProgress * frameCount))
        );

        renderFrame(frameIndex);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    // -------------------------------------------------------------
    // Framer Motion Choreography (Fixed for Full Black)
    // -------------------------------------------------------------
    
    // Background remains pure black (No color shift needed unless user specifically requests a subtle one)
    // We'll keep the overlay fixed at #000000

    // Feature 1: Intro Text
    scroll(
        animate("#feature-1", { opacity: [1, 1, 0], y: ["-50%", "-50%", "-80%"], scale: [1, 1, 0.98] }),
        { target: heroTrack, offset: ["start start", "15% start"] }
    );

    // Feature 2: Oyster Steel (Top Left)
    scroll(
        animate("#feature-2", { opacity: [0, 1, 1, 0], x: ["-40px", "0px", "0px", "-40px"] }),
        { target: heroTrack, offset: ["15% start", "20% start", "30% start", "35% start"] }
    );

    // Feature 4: The Calibre (Top Right)
    scroll(
        animate("#feature-4", { opacity: [0, 1, 1, 0], x: ["40px", "0px", "0px", "40px"] }),
        { target: heroTrack, offset: ["45% start", "50% start", "60% start", "65% start"] }
    );

    // Feature 3: The Depths (Bottom Left)
    scroll(
        animate("#feature-3", { opacity: [0, 1, 1, 0], x: ["-40px", "0px", "0px", "-40px"] }),
        { target: heroTrack, offset: ["75% start", "80% start", "90% start", "95% start"] }
    );

    // Fade entire canvas out as we move to the story sections
    scroll(
        animate("canvas", { opacity: [1, 1, 0] }),
        { target: heroTrack, offset: ["start start", "95% start", "end start"] }
    );

    // Story Sections
    scroll(
        animate("#container-story-1", { opacity: [0, 1, 1, 0], y: [50, 0, 0, -50] }),
        { target: document.getElementById("section-story-1"), offset: ["start end", "center center", "center start", "end start"] }
    );

    scroll(
        animate("#container-story-2", { opacity: [0, 1, 1, 0], y: [50, 0, 0, -50] }),
        { target: document.getElementById("section-story-2"), offset: ["start end", "center center", "center start", "end start"] }
    );

    scroll(
        animate("#specs-card", { opacity: [0, 1], y: [100, 0], scale: [0.98, 1] }),
        { target: document.getElementById("section-finale"), offset: ["start end", "center center"] }
    );

    // Badges pop
    inView(".trust-indicators", () => {
        animate(".trust-badge", 
            { opacity: [0, 1], x: [-20, 0] },
            { delay: 0.1, duration: 0.6, easing: [0.22, 1, 0.36, 1] }
        );
    });
});

