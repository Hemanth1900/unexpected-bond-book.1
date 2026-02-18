let pages = [];
let currentPage = 0;

/* Load chapters */
async function loadBook(){

    const res = await fetch('chapters.json');
    const chapters = await res.json();

    /* FIRST PAGE = COVER */
    pages.push({
        type:'cover'
    });

    let chapterIndex = 1;

    for(const chapter of chapters){

        /* Chapter opening page */
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
}


/* Pagination */
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


/* Render page */
function renderPage(){

    const page = pages[currentPage];
    const el = document.getElementById('page');

    if(!page || !el) return;

    /* COVER */
    if(page.type==='cover'){
        el.className='page cover-page';
        el.innerHTML='';
        return;
    }

    /* CHAPTER OPENING */
    if(page.type==='opening'){
        el.className='page chapter-opening';
        el.innerHTML = `
            <div class="chapter-number">Chapter ${page.number}</div>
            <div class="chapter-title">${page.title}</div>
        `;
        return;
    }

    /* STORY PAGE */
    el.className='page';
    el.innerHTML = `
        <div class="book-header">
            <span class="header-left">Ayush A.</span>
            <span class="header-right">${page.title}</span>
        </div>

        <div class="text-content">
            <p>${page.content}</p>
        </div>

        <div class="page-number">${currentPage}</div>
    `;

    /* SATURDAY MESSAGE ON LAST PAGE */
    if(currentPage === pages.length-1){
        document.querySelector(".text-content").insertAdjacentHTML("beforeend", `
            <div class="next-release-note">
                <p>You’ve reached the latest chapter.</p>
                <h3>New chapter releases Saturday.</h3>
                <span>Come back and continue the story.</span>
            </div>
        `);
    }
}


/* DESKTOP CLICK NAVIGATION */

document.addEventListener('click',e=>{
    if(e.clientX > window.innerWidth/2) nextPage();
    else prevPage();
});


/* MOBILE SWIPE NAVIGATION */

let startX = 0;

document.addEventListener("touchstart",e=>{
    startX = e.touches[0].clientX;
});

document.addEventListener("touchend",e=>{
    let diff = e.changedTouches[0].clientX - startX;

    if(diff < -50) nextPage();
    if(diff > 50) prevPage();
});


/* PAGE NAVIGATION */

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


/* SAVE & RESTORE READING PROGRESS */

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
