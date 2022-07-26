

class Transactions {
    items = [];
    page = +new SearchParams().get('page', default_page);

    async getItems(wallet, limit=default_limit) {
        const url = `${API_PREFIX}/ertc/search/wallet/${encodeURIComponent(wallet)}`;
        const offset = (this.page - 1) * limit;
        const contractAddress = new SearchParams().get('contract', undefined);

        return $.ajax({
            type: 'POST',
            url,
            data: JSON.stringify({ limit, offset, contractAddress }),
            contentType: "application/json",
            dataType: 'json'
        });
    }

    async showItems(items, wallet) {
        showModalPage('Transaction history', formatTransactionHistory(items, wallet));
        
        $('#modalModulePage .blockHref').click(loadBlockPreview);
        return true;
    }

    async loadWalletHistory(wallet, limit) {
        const {data} = await this.getItems(wallet, limit);
        const list = data.list;
        this.count = data.count;
        searchData = this;
        
        if (list.length === 0) {
            return false;
        }

        this.items = list;
        return this.showItems(this.items, wallet);
    }

    async showWalletHistory(wallet, limit) {
        const searchParams = new SearchParams();
        searchParams.set('wallet', wallet);
        searchParams.delete('q');

        return this.loadWalletHistory(wallet, limit);
    }

    async setPage(page, wallet) {
        if (!isFinite(page)) {
            throw new Error('Transaction page is not integer');
        }

        this.page = page;
        this.items = [];

        return this.showWalletHistory(wallet);
    }

    async setPageNative(page) {
        if (!isFinite(page)) {
            throw new Error('Search page is not integer');
        }

        const searchParams = new SearchParams();
        const search = searchParams.get('wallet').trim();

        return this.setPage(page, search);
    }
}


class TransactionElement extends Transactions {
    async showWalletHistoryFromEl(e) {
        const wallet = e.target.innerText;
        console.log('wallet', wallet);

        return this.showWalletHistory(wallet.trim());
    }
}