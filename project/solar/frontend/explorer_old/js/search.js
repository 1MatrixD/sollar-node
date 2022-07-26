

class Search {
    items = [];
    page = +new SearchParams().get('page', default_page);

    async getItems(search, limit=default_limit) {
        const url = `${API_PREFIX}/ertc/search/validation/${encodeURIComponent(search)}`;
        const offset = (this.page - 1) * limit;
        const contractAddress = new SearchParams().get('contract', undefined);

        return $.ajax({
            type: 'POST',
            url,
            data: JSON.stringify({ offset, limit, contractAddress }),
            contentType: "application/json",
            dataType: 'json'
        });
    }

    async showItems(items, search) {        
        showModalPage('Search results', formatResults(items, search));

        const transactions = new TransactionElement();

        function showModuleModal(e) {
            window.paginationModal.setPage(1);

            transactions.showWalletHistoryFromEl(e)
            .then(_ => {
                window.paginationModal.init();
            })
        }

        $('#modalModulePage .blockHref').click(loadBlockPreview);
        $('#modalModulePage .blockFrom').click(showModuleModal);
        $('#modalModulePage .blockTo').click(showModuleModal);

        return true;
    }

    async loadItems(search, limit) {
        const {data} = await this.getItems(search, limit);
        const list = data.list;
        this.count = data.count;
        searchData = this;
        
        if (list.length === 0) {
            return false;
        }

        this.items = list;
        return this.showItems(this.items, search);
    }

    async setPage(page, search, limit) {
        if (!isFinite(page)) {
            throw new Error('Search page is not integer');
        }

        this.page = page;
        this.items = [];

        return this.loadItems(search, limit);
    }

    async setPageNative(page) {
        if (!isFinite(page)) {
            throw new Error('Search page is not integer');
        }

        const searchParams = new SearchParams();
        const search = searchParams.get('q').trim();
        
        return this.setPage(page, search);
    }
}

const search = new Search();

registerSearchHook(async (searchStr) => {
    searchStr = searchStr.trim();

    if (searchStr.length) {
        const loadItems = await search.loadItems(searchStr, default_limit);
        window.paginationModal.init();
        return loadItems;
    }
})