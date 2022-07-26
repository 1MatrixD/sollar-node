
class PaginationModal extends Pagination {
    setPage(number) {
        console.log('setPage', number);
        if (isFinite(number)) {
            const searchParams = new SearchParams();
            searchParams.set('page', number);
            
            searchData?.setPageNative(number);
            this.init();
        }
    }
}
