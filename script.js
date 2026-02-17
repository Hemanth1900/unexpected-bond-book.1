let pages = [];
let currentPage = 0;

/* Load chapters */
async function loadBook(){

    const res = await fetch('chapters.json');
    const chapters = await res.json();

    let chapterIndex = 1;

    for(const chapter of chapters){

        // Chapter opening page
        pages.push({
            type:'opening',
            number: chapterIndex,
            title: chapter.title
        });

        const txt = await fetch(chapter.file).then(r=>r.text());

        const split = paginate(txt, 180); // word-based feel

        split.forEach(p=>{
            pages.push({
                type:'text',
                title: chapter.title,
                content: p
            });
        });

        chapterIndex++;
    }

    renderPage();
}

/* Pagination (prevents word cutting) */
function paginate(text, wordsPerPage){
    let words = text.split(' ');
    let arr = [];

    for(let i=0;i<words.length;i+=wordsPerPage){
        arr.push(words.slice(i,i+wordsPerPage).join(' '));
    }

    return arr;
}

/* Render page */
function renderPage(){

    const page = pages[currentPage];
    const el = document.getElementById('page');

    // Opening chapter page
    if(page.type==='opening'){
        el.className='page chapter-opening';
        el.innerHTML = `
            <div class="chapter-number">Chapter ${page.number}</div>
            <div class="chapter-title">${page.title}</div>
        `;
        return;
    }

    // Normal novel pages
    el.className='page';
    el.innerHTML = `
        <div class="header-left">Ayush A.</div>
        <div class="header-right">${page.title}</div>

        <div class="text-content">
            ${page.content}
        </div>

        <div class="page-number">${currentPage + 1}</div>
    `;
}

/* Swipe navigation */

let startX=0;

document.addEventListener('touchstart',e=>{
    startX=e.touches[0].clientX;
});

document.addEventListener('touchend',e=>{
    let diff=e.changedTouches[0].clientX-startX;

    if(diff<-50) nextPage();
    if(diff>50) prevPage();
});

/* Tap navigation */

document.addEventListener('click',e=>{
    if(e.clientX>window.innerWidth/2) nextPage();
    else prevPage();
});

/* Navigation */

function nextPage(){
    if(currentPage < pages.length-1){
        currentPage++;
        renderPage();
    }
}

function prevPage(){
    if(currentPage>0){
        currentPage--;
        renderPage();
    }
}

loadBook();
