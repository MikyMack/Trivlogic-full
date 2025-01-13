let xValue = 0, yValue = 0;

// Calculate background width based on viewport
const calculateBackgroundWidth = () => {
    const viewportWidth = window.innerWidth;
    return Math.max(viewportWidth * 2, 1920); 
};

//  initial background width
const bgElement = document.querySelector(".scene-bg");
bgElement.style.width = `${calculateBackgroundWidth()}px`;

// Update background width on resize
window.addEventListener("resize", () => {
    bgElement.style.width = `${calculateBackgroundWidth()}px`;
});

// Function to update the parallax effect
function updateParallax() {
    const parallax_el = document.querySelectorAll(".scene-element");
    
    parallax_el.forEach(el => {
        let speedx = el.dataset.speedx;
        let speedy = el.dataset.speedy;
        
        // Add extra movement range for background
        if(el.classList.contains('scene-bg')) {
            speedx *= 1.2;
            speedy *= 1.2;
        }
        
        el.style.transform = `translate(-50%, -50%) 
                             translateX(${xValue * speedx}px) 
                             translateY(${yValue * speedy}px)`;
    });
}

// Update the parallax effect when the mouse is moved
window.addEventListener("mousemove", (e) => {
    xValue = e.clientX - window.innerWidth/2;
    yValue = e.clientY - window.innerHeight/2;
    updateParallax();
});


function createTimeline() {
    let timeline = gsap.timeline();


    timeline.from(".scene-bg", {
        y: "-30%",
        scale: 1.2,
        duration: 2,
        ease: "power2.out"
    });

    const parallax_el = document.querySelectorAll(".scene-element");
    parallax_el.forEach(el => {
        if (!el.classList.contains('scene-bg')) {
            timeline.from(el, {
                top: "100%", 
                duration: 1.5,
                ease: "power2.out"
            }, "<0.1");
        }
    });
}


function initializeParallax() {
    createTimeline();
    updateParallax();
}


document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        initializeParallax();
    }
});


window.addEventListener("popstate", () => {
    initializeParallax();
});


window.onload = () => {
    initializeParallax();
};