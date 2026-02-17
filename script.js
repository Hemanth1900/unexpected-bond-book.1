let pages = [];
let currentPage = 0;

/* Load chapters */
async function loadBook(){

    const res = await fetch('chapters.json');
    const chapters = await res.json();

    pages.push({type:'cover'});

    for(const chapter of chapters){

        const txt = await fetch(chapter.file).then(r=>r.text());

        const split = paginate(txt, 900);

        split.forEach((p,i)=>{
            pages.push({
                type:'text',
                title: chapter.title,
                content: p,
                number: pages.length
            });
        });
    }

    renderPage();
}

/* Pagination */
function paginate(text, size){
    let arr=[];
    for(let i=0;i<text.length;i+=size){
        arr.push(text.substring(i,i+size));
    }
    return arr;
}

/* Render page */
function renderPage(){

    const page = pages[currentPage];
    const el = document.getElementById('page');

    if(page.type==='cover'){
        el.className='page cover';
        el.innerHTML='Swipe to begin';
        return;
    }

    el.className='page';
    el.innerHTML = `
        <div class="chapter-title">${page.title}</div>
        ${page.content}
        <div class="page-number">${currentPage}</div>
    `;
}

/* Swipe + tap navigation */
let startX=0;

document.addEventListener('touchstart',e=>{
    startX=e.touches[0].clientX;
});

document.addEventListener('touchend',e=>{
    let diff=e.changedTouches[0].clientX-startX;

    if(diff<-50) nextPage();
    if(diff>50) prevPage();
});

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
