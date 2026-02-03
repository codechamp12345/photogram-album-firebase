import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDFrDQy0mKiHOhPqPa7WXxB0D0XN0nlqEg",
    authDomain: "instant-photos-9a258.firebaseapp.com",
    projectId: "instant-photos-9a258",
    storageBucket: "instant-photos-9a258.firebasestorage.app",
    messagingSenderId: "500402254803",
    appId: "1:500402254803:web:2a7f147363611518163526"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const proxyBaseUrl = 'https://us-central1-instant-photos-9a258.cloudfunctions.net/proxyImage';

let papers = [];
let currentPaper = 0;

const loginScreen = document.getElementById("login-screen");
const appContainer = document.getElementById("app-container");
const startBtn = document.getElementById("startBtn");
const qrInput = document.getElementById("qrInput");
const status = document.getElementById("login-status");

startBtn.onclick = async () => {
    const code = qrInput.value.trim();
    if (!code) {
        status.textContent = "Please enter a code.";
        return;
    }
    status.textContent = "Verifying Code...";
    startBtn.disabled = true;

    try {
        const imgRef = collection(db, "favorites", code, "imgs");
        const snapshot = await getDocs(imgRef);

        if (snapshot.empty) {
            status.textContent = "Invalid Qr Code.";
            startBtn.disabled = false;
            return;
        }

        // Support path, url, imagePath, or src field names from Firestore
        const getPath = (doc) => {
            const d = doc.data();
            return d.path || d.url || d.imagePath || d.src || "";
        };

        let urls = snapshot.docs
            .map(doc => getPath(doc))
            .filter(p => p !== "")
            .map(p => p.startsWith("http") ? p : `${proxyBaseUrl}?path=${encodeURIComponent(p)}`);

        // --- ODD COUNT: duplicate second-to-last so last page has a pair ---
        if (urls.length % 2 !== 0 && urls.length > 1) {
            const secondToLastImg = urls[urls.length - 2];
            const lastImg = urls.pop();
            urls.push(secondToLastImg);
            urls.push(lastImg);
        } else if (urls.length === 1) {
            urls.push(urls[0]);
        }

        buildFlipbook(urls);

        // Always switch to album when we got docs (even if no valid URLs)
        status.textContent = "";
        loginScreen.classList.add("hidden");
        appContainer.classList.remove("hidden");
        startBtn.disabled = false;
    } catch (e) {
        status.textContent = "Connection Error. Check network or try again.";
        startBtn.disabled = false;
        console.error(e);
    }
};

// Demo button functionality
document.getElementById("demoBtn").onclick = () => {
    // Create demo images with placeholder content
    const demoUrls = [
        'data:image/svg+xml;base64,' + btoa(`
            <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad1)"/>
                <text x="200" y="120" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Welcome to</text>
                <text x="200" y="150" font-family="Arial, sans-serif" font-size="28" fill="white" text-anchor="middle" font-weight="bold">Memory Album</text>
                <text x="200" y="200" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle">Your digital photo experience</text>
            </svg>
        `),
        'data:image/svg+xml;base64,' + btoa(`
            <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad2)"/>
                <circle cx="200" cy="100" r="40" fill="rgba(255,255,255,0.3)"/>
                <text x="200" y="180" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle">Beautiful Memories</text>
                <text x="200" y="210" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle">Captured in time</text>
            </svg>
        `),
        'data:image/svg+xml;base64=' + btoa(`
            <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad3)"/>
                <polygon points="200,60 220,100 180,100" fill="rgba(255,255,255,0.3)"/>
                <text x="200" y="160" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle">Interactive Experience</text>
                <text x="200" y="190" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle">Flip through your photos</text>
            </svg>
        `),
        'data:image/svg+xml;base64=' + btoa(`
            <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#a8edea;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#fed6e3;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad4)"/>
                <rect x="160" y="80" width="80" height="60" rx="10" fill="rgba(255,255,255,0.4)"/>
                <text x="200" y="180" font-family="Arial, sans-serif" font-size="18" fill="#333" text-anchor="middle">Demo Album</text>
                <text x="200" y="210" font-family="Arial, sans-serif" font-size="14" fill="#666" text-anchor="middle">Sample content for testing</text>
            </svg>
        `)
    ];

    buildFlipbook(demoUrls);
    document.getElementById("albumTitle").textContent = "Demo Album";
    
    loginScreen.classList.add("hidden");
    appContainer.classList.remove("hidden");
};

function buildFlipbook(urls) {
    const notebook = document.getElementById("notebook");
    notebook.innerHTML = "";
    papers = [];
    currentPaper = 0;

    for (let i = 0; i < urls.length; i += 2) {
        const paper = document.createElement("div");
        paper.className = "paper";
        paper.style.zIndex = Math.floor(urls.length / 2) - (i / 2);

        paper.innerHTML = `
            <div class="front"><img src="${urls[i]}"></div>
            <div class="back"><img src="${urls[i+1]}"></div>
        `;
        notebook.appendChild(paper);
        papers.push(paper);
    }
    updateUI();
}

function updateUI() {
    document.getElementById("pageIndicator").textContent = `Sheet ${currentPaper + 1} / ${papers.length}`;
}

document.getElementById("nextBtn").onclick = () => {
    if (currentPaper < papers.length) {
        papers[currentPaper].classList.add("flipped");
        papers[currentPaper].style.zIndex = currentPaper + 1;
        currentPaper++;
        updateUI();
    }
};

document.getElementById("prevBtn").onclick = () => {
    if (currentPaper > 0) {
        currentPaper--;
        papers[currentPaper].classList.remove("flipped");
        papers[currentPaper].style.zIndex = papers.length - currentPaper;
        updateUI();
    }
};

document.getElementById("backBtn").onclick = () => location.reload();