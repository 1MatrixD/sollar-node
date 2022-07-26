

class Pagination {
    constructor(owner='.explorer-pagination') {
        this.owner = owner;
    }

    initAll() {
        this.pages = this.initPages();

        this.current = this.pages.find(_ => _.active);
        this.prev = this.pages.find(_ => _.number === this.current?.number - 1);
        this.next = this.pages.find(_ => _.number === this.current?.number + 1);
    }

    initPages() {
        const searchParams = new SearchParams();
        const page = +searchParams.get('page', default_page);
        const count = searchData?.count;
        console.log('page', page, count);
        let pages = [];

        if (page == 1) {
            pages.push({ active: true, number: 1 });
            pages.push({ number: 2 });
            pages.push({ number: 3 });
            pages.push({ number: 4 });
        } else {
            pages.push({ number: page - 3 });
            pages.push({ number: page - 2 });
            pages.push({ number: page - 1 });
            pages.push({ active: true, number: page });
            pages.push({ number: page + 1 });
            pages.push({ number: page + 2 });
            pages.push({ number: page + 3 });
        }
        
        return pages.filter(_ => {
            if (_.number > 0 && _.number <= Math.ceil(candy.blockHeight / default_limit)) {
                if (count) {
                    if (_.number < Math.ceil(count / default_limit)) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        });
    }

    getPrevios() {
        const current = this.prev;
        const isDisabled = !current;
        
        return `<li class="page-item ${isDisabled ? 'disabled': ''}">
                    <span class="page-link" ${isDisabled ? '' : `page="${current?.number}"`} aria-label="Previous">
                        <span aria-hidden="true" ${isDisabled ? '' : `page="${current?.number}"`}>&lsaquo;</span>
                        <span class="sr-only" ${isDisabled ? '' : `page="${current?.number}"`}>Previous</span>
                    </span>
                </li>`
    }

    getNext() {
        const current = this.next;
        const isDisabled = !current;
        
        return `
                <li class="page-item ${isDisabled ? 'disabled': ''}">
                    <span class="page-link" ${isDisabled ? '' : `page="${current?.number}"`} aria-label="Next">
                        <span aria-hidden="true" ${isDisabled ? '' : `page="${current?.number}"`}>&rsaquo;</span>
                        <span class="sr-only" ${isDisabled ? '' : `page="${current?.number}"`}>Next</span>
                    </span>
                </li>`
    }

    getLast() {
        const current = this.pages?.[this.pages.length - 1];
        const isDisabled = typeof current !== 'undefined' && current.active ? current.active : false || hideEmptyBlocks;
        const lastPage = searchData?.count ? Math.ceil(searchData.count / default_limit) : Math.ceil(candy.blockHeight / default_limit);

        console.log('getLast', current, isDisabled, lastPage, searchData?.count, candy.blockHeight, Math.ceil(candy.blockHeight / default_limit));
        return `
                <li class="page-item ${isDisabled ? 'disabled': ''}">
                    <span class="page-link" ${isDisabled ? '' : `page="${lastPage}"`} aria-label="Last">
                        <span aria-hidden="true" ${isDisabled ? '' : `page="${lastPage}"`}>&raquo;</span>
                        <span class="sr-only" ${isDisabled ? '' : `page="${lastPage}"`}>Last</span>
                    </span>
                </li>`
    }

    getFirst() {
        const current = this.pages?.[0];
        const isDisabled = typeof current !== 'undefined' && current.active ? current.active : false;

        console.log('getFirst', current, isDisabled);
        return `
                <li class="page-item ${isDisabled ? 'disabled': ''}">
                    <span class="page-link" ${isDisabled ? '' : `page="${1}"`} aria-label="First">
                        <span aria-hidden="true" ${isDisabled ? '' : `page="${1}"`}>&laquo;</span>
                        <span class="sr-only" ${isDisabled ? '' : `page="${1}"`}>First</span>
                    </span>
                </li>`
    }



    getPages() {
        const els = [];

        this.pages.forEach(page => {
            const page_str = `<li class="page-item ${page.active ? 'active': ''}">
                <span class="page-link" page="${page.number}">${page.number}</span>
            </li>`;
            els.push(page_str);
        });

        return els.join('\n');
    }

    template() {
        const pages = this.getPages();
        const prev = this.getPrevios();
        const next = this.getNext();
        const first = this.getFirst();
        const last = this.getLast();

        return `
        <ul class="pagination justify-content-center">
            ${first}
            ${prev}
            ${pages}
            ${next}
            ${last}
        </ul>
        `;
    }

    init() {
        this.initAll();

        $(this.owner).html(this.template());
        $(`${this.owner} .page-link`).on('click', event => {
            const page = event.target.getAttribute('page');
            console.log('+page', event.target, page);
            this.setPage(+page);
        });
    }

    setPage(number) {
        console.log('setPage', number);
        if (isFinite(number)) {
            const searchParams = new SearchParams();
            searchParams.set('page', number);
            
            lastestBlocks = [];

            updateLatestBlocks();
            this.init();
        }
    }
}
