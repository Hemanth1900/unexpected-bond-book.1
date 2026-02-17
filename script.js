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

    renderPage();
}


/* REAL PAGINATION — based on visible page height */
function paginate(text){

    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.width = "560px";
    temp.style.fontSize = "18px";
    temp.style.lineHeight = "1.9";
    temp.style.fontFamily = "'Libre Baskerville', serif";

    document.body.appendChild(temp);

    let words = text.split(" ");
    let result = [];
    let pageWords = [];

    for(let i=0;i<words.length;i++){

        pageWords.push(words[i]);
        temp.innerHTML = "<p>"+pageWords.join(" ")+"</p>";

        if(temp.scrollHeight > 650){

            pageWords.pop();
            result.push(pageWords.join(" "));

            pageWords = [words[i]];
        }
    }

    if(pageWords.length){
        result.push(pageWords.join(" "));
    }

    document.body.removeChild(temp);

    return result;
}


/* Render page */
function renderPage(){

    const page = pages[currentPage];
    const el = document.getElementById('page');

    /* COVER PAGE */
    if(page.type==='cover'){
        el.className='page cover-page';
        el.innerHTML='';
        return;
    }

    /* Chapter opening page */
    if(page.type==='opening'){
        el.className='page chapter-opening';
        el.innerHTML = `
            <div class="chapter-number">Chapter ${page.number}</div>
            <div class="chapter-title">${page.title}</div>
        `;
        return;
    }

    /* Story pages */
    el.className='page';
 el.innerHTML = `
    <div class="book-header">
        <div class="header-left">Ayush A.</div>
        <div class="header-right">${page.title}</div>
    </div>

    <div class="text-content">
        <p>${page.content}</p>
    </div>

    <div class="page-number">${currentPage}</div>
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


/* Start */

loadBook();
