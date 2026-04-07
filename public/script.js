import { animate, scroll, inView } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // Canvas Image Sequence Engine
    // -------------------------------------------------------------
    const canvas = document.getElementById("hero-canvas");
    const context = canvas.getContext("2d");
    const heroTrack = document.getElementById("section-intro");
    
    // Set internal canvas resolution (match high quality)
    // The frames are large, around 1080p, let's keep canvas resolution high
    canvas.width = 1920;
    canvas.height = 1080;

    const frameCount = 240;
    const currentFrame = index => (
        `images/herosection/ezgif-frame-${index.toString().padStart(3, '0')}.png`
    );

    const images = [];
    let loadedImages = 0;

    // Load first frame immediately to display something
    const imgFirst = new Image();
    imgFirst.src = currentFrame(1);
    imgFirst.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Draw the image filling the canvas (object-fit: contain logic is handled by CSS)
        // Wait, CSS object-fit: contain applies to the <canvas> tag itself relative to viewport!
        // We just draw the image to cover the canvas internal buffer.
        context.drawImage(imgFirst, 0, 0, canvas.width, canvas.height);
        
        // Begin background preloading of remaining frames
        preloadImages();
    }
    images[1] = imgFirst;

    function preloadImages() {
        for (let i = 2; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => { loadedImages++; };
            images[i] = img;
        }
    }

    // Engine State for Smooth LERP (Linear Interpolation)
    let currentProgress = 0;
    const ease = 0.07; // 0.07 gives a very smooth, high-end glide

    function renderLoop() {
        const trackHeight = heroTrack.clientHeight - window.innerHeight;
        let targetProgress = window.scrollY / trackHeight;
        
        // Clamp target progress
        targetProgress = Math.max(0, Math.min(targetProgress, 1));
        
        // Lerp magic: smoothly glide current progress towards target
        currentProgress += (targetProgress - currentProgress) * ease;
        
        const frameIndex = Math.min(
            frameCount,
            Math.max(1, Math.floor(currentProgress * frameCount))
        );

        // Render if available
        if (images[frameIndex] && images[frameIndex].complete) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
        }

        // Loop infinitely to maintain smooth glide even after scrolling stops
        requestAnimationFrame(renderLoop);
    }

    // Start the infinite render loop
    requestAnimationFrame(renderLoop);

    // -------------------------------------------------------------
    // Framer Motion Choreography
    // -------------------------------------------------------------
    
    // Background overlay color shifting
    scroll(
        animate("#bg-overlay", { 
            backgroundColor: ["#000000", "#12141c", "#1a1c1e", "#0a0a0a"]
        }),
        { 
            target: document.body,
            offset: ["start start", "end end"]
        }
    );

    // Feature 1: Intro Text - visible on load, fades out quickly
    scroll(
        animate("#feature-1", { opacity: [1, 1, 0], y: ["-50%", "-50%", "-80%"], scale: [1, 1, 0.98] }),
        { 
            target: document.getElementById("section-intro"), 
            // Fades out between 0% and 15% of the hero section scroll
            offset: ["start start", "15% start"] 
        }
    );

    // Scroll Indicator fades out almost instantly
    scroll(
        animate("#scroll-indicator", { opacity: [0.6, 0] }),
        { 
            target: document.getElementById("section-intro"), 
            offset: ["start start", "5% start"] 
        }
    );

    // Feature 2: Oyster Steel (Top Left)
    scroll(
        animate("#feature-2", { opacity: [0, 1, 1, 0], x: ["-40px", "0px", "0px", "-40px"] }),
        { 
            target: document.getElementById("section-intro"), 
            // Stagger 1: 15% - 35%
            offset: ["15% start", "20% start", "30% start", "35% start"] 
        }
    );

    // Feature 4: The Calibre (Top Right) - Adjusted to come earlier where movement is visible
    scroll(
        animate("#feature-4", { opacity: [0, 1, 1, 0], x: ["40px", "0px", "0px", "40px"] }),
        { 
            target: document.getElementById("section-intro"), 
            // Stagger 2: 45% - 65% (Sweet spot for movement reveal)
            offset: ["45% start", "50% start", "60% start", "65% start"] 
        }
    );

    // Feature 3: The Depths (Bottom Left)
    scroll(
        animate("#feature-3", { opacity: [0, 1, 1, 0], x: ["-40px", "0px", "0px", "-40px"] }),
        { 
            target: document.getElementById("section-intro"), 
            // Stagger 3: 75% - 95%
            offset: ["75% start", "80% start", "90% start", "95% start"] 
        }
    );

    // Fade entire canvas out as we move to the story sections
    scroll(
        animate("canvas", { opacity: [1, 1, 0] }),
        {
            target: document.getElementById("section-intro"),
            offset: ["start start", "95% start", "end start"]
        }
    )

    // -------------------------------------------------------------
    // Standard Sections (Below Hero Track)
    // -------------------------------------------------------------
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
