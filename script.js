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
}


/* Navigation */

document.addEventListener('click',e=>{
    if(e.clientX > window.innerWidth/2) nextPage();
    else prevPage();
});

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
