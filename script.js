let pages = [];
let currentPage = 0;

/* ===============================
   LOAD BOOK
   =============================== */

async function loadBook(){

    const res = await fetch('chapters.json');
    const chapters = await res.json();

    pages.push({ type:'cover' });

    let chapterIndex = 1;

    for(const chapter of chapters){

        pages.push({
            type:'opening',
            number: chapterIndex,
            title: chapter.title
        });

        const txt = await fetch(chapter.file).then(r=>r.text());
        const split = paginate(txt);

        split.forEach(p=>{
            pages.push({
                type:'text',
                title: chapter.title,
                content: p
            });
        });

        chapterIndex++;
    }

    restoreProgress();
    renderPage();
    createAmbienceButton();
}


/* ===============================
   PAGINATION
   =============================== */

function paginate(text){

    const words = text.split(" ");
    let arr = [];
    let temp = [];

    words.forEach(word=>{
        temp.push(word);
        if(temp.join(" ").length > 900){
            arr.push(temp.join(" "));
            temp=[];
        }
    });

    arr.push(temp.join(" "));
    return arr;
}


/* ===============================
   RENDER PAGE
   =============================== */

function renderPage(){

    const page = pages[currentPage];
    const el = document.getElementById('page');

    if(!page || !el) return;

    document.body.classList.remove("mood-night","mood-rain","mood-terrace","mood-lab");

    if(page.type==='cover'){
        el.className='page cover-page';
        el.innerHTML='';
        return;
    }

    if(page.type==='opening'){
        el.className='page chapter-opening';
        el.innerHTML = `
            <div class="chapter-number">Chapter ${page.number}</div>
            <div class="chapter-title">${page.title}</div>
        `;
        return;
    }

    el.className='page';
    el.innerHTML = `
        <div class="book-header">
            <span class="header-left">Ayush A.</span>
            <span class="header-right">${page.title}</span>
        </div>

        <div class="text-content">
            <p>${autoDialogue(page.content)}</p>
        </div>

        <div class="page-number">${currentPage}</div>
    `;

    applyMoodByContent(page.content);
}


/* ===============================
   AUTO DIALOGUE STYLING
   =============================== */

function autoDialogue(text){
    return text.replace(/"([^"]+)"/g, '<span class="dialogue">"$1"</span>');
}


/* ===============================
   AUTO MOOD DETECTION
   =============================== */

function applyMoodByContent(content){

    const lower = content.toLowerCase();

    if(lower.includes("rain")){
        document.body.classList.add("mood-rain");
    }
    else if(lower.includes("terrace")){
        document.body.classList.add("mood-terrace");
    }
    else if(lower.includes("night")){
        document.body.classList.add("mood-night");
    }
    else if(lower.includes("lab")){
        document.body.classList.add("mood-lab");
    }
}


/* ===============================
   AMBIENCE BUTTON + SOUND
   =============================== */

let ambienceMode = 0;
let ambienceAudio = null;

const ambienceTracks = [
    null,
    "night.mp3",
    "rain.mp3",
    "terrace.mp3",
    "lab.mp3"
];

function createAmbienceButton(){

    if(document.getElementById("ambience-toggle")) return;

    const btn = document.createElement("button");
    btn.id = "ambience-toggle";
    btn.innerText = "☾";

    btn.onclick = toggleAmbience;

    document.body.appendChild(btn);
}

function toggleAmbience(){

    ambienceMode++;
    if(ambienceMode > 4) ambienceMode = 0;

    if(ambienceAudio){
        ambienceAudio.pause();
        ambienceAudio.currentTime = 0;
    }

    document.body.classList.remove(
        "mood-night",
        "mood-rain",
        "mood-terrace",
        "mood-lab"
    );

    switch(ambienceMode){

        case 1:
            document.body.classList.add("mood-night");
            ambienceAudio = new Audio(ambienceTracks[1]);
            break;

        case 2:
            document.body.classList.add("mood-rain");
            ambienceAudio = new Audio(ambienceTracks[2]);
            break;

        case 3:
            document.body.classList.add("mood-terrace");
            ambienceAudio = new Audio(ambienceTracks[3]);
            break;

        case 4:
            document.body.classList.add("mood-lab");
            ambienceAudio = new Audio(ambienceTracks[4]);
            break;

        default:
            ambienceAudio = null;
    }

    if(ambienceAudio){
        ambienceAudio.loop = true;
        ambienceAudio.volume = 0.35;
        ambienceAudio.play();
    }
}


/* ===============================
   NAVIGATION
   =============================== */

document.addEventListener('click',e=>{
    if(e.clientX > window.innerWidth/2) nextPage();
    else prevPage();
});

let startX = 0;

document.addEventListener("touchstart",e=>{
    startX = e.touches[0].clientX;
});

document.addEventListener("touchend",e=>{
    let diff = e.changedTouches[0].clientX - startX;
    if(diff < -50) nextPage();
    if(diff > 50) prevPage();
});

function nextPage(){
    if(currentPage < pages.length-1){
        currentPage++;
        saveProgress();
        renderPage();
    }
}

function prevPage(){
    if(currentPage>0){
        currentPage--;
        saveProgress();
        renderPage();
    }
}


/* ===============================
   SAVE & RESTORE PROGRESS
   =============================== */

function saveProgress(){
    localStorage.setItem("lastPage", currentPage);
}

function restoreProgress(){
    const saved = localStorage.getItem("lastPage");
    if(saved){
        currentPage = parseInt(saved);
    }
}

loadBook();
