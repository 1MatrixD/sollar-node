/**
 * IZZZIO Blockchain explorer
 * @author IZZZIO, LLC
 */

let candy = null;
let lastestBlocks = [];
let parsers = {};

let lastBlockInTable = 0;

let searchHooks = [];
let hideEmptyBlocks = true;
let searchData = {};

let latestBlockId = 0;


class SearchParams {
    constructor(location = window.location.hash) {
        this.location = location;

        this.init();
    }

    init(location = this.location) {
        this.location = location.split('#');

        if (this.location.length > 1) {
            this.location = this.location.pop();
        } else {
            this.location = '';
        }

        this.location = new URLSearchParams(this.location);
    }

    toString() {
        return this.location.toString();
    }

    append(key, value) {
        const result = this.location.append(key, value);
        this.updateHash();

        return result;
    }

    get(key, def) {
        let data = this.location.get(key);
        if (!data) {
            if (def === undefined) {
                this.delete(key);
            } else {
                this.set(key, def);
            }
            data = def;
        }
        return data;
    }

    delete(key) {
        const result = this.location.delete(key);
        this.updateHash();

        return result;
    }

    set(key, value) {
        const result = this.location.set(key, value);
        this.updateHash();

        return result;
    }

    updateHash() {
        window.location.hash = this.location.toString();
        this.init(window.location.hash);
        return true;
    }
}

$(async function() {
    $('#loadingModal').modal('show');
    
    new SearchParams().get('page', default_page);

    startCandyConnection(nodes);

    $('.returnButton').click(async () => {
        const searchParams = new SearchParams();
        searchParams.delete('blockId');
        searchParams.delete('limit');
        searchParams.delete('offset');

        $('#lastestBlocksPage').fadeIn();
        $('#blockDetailPage').hide();
        $('#modalModulePage').hide();
    });

    $('.searchForm').on('submit', async (event) => {
        event.preventDefault();

        const searchParams = new SearchParams();
        searchParams.delete('limit');
        searchParams.delete('offset');

        const search = $('#search').val();

        await startChainSearching(search);
    })

    if (localStorage.getItem('hideEmptyBlocks') == null) {
        localStorage.setItem('hideEmptyBlocks', 0);
    }

    hideEmptyBlocks = localStorage.getItem('hideEmptyBlocks') == 1 ? true : false;

    $(':checkbox').prop('checked', hideEmptyBlocks);

    $('.checkbox-empty-blocks').on('change', async (event) => {
        event.preventDefault();
        
        hideEmptyBlocks = event.target.checked;
        localStorage.setItem('hideEmptyBlocks', Number(hideEmptyBlocks));

        lastestBlocks = [];
        updateLatestBlocks();
        
        window.pagination.init();
    });

    await contractsInfo.load();

    for (const contract of contractsInfo.contracts) {
        const option = `<option value="${contract.address}">${contract.ticker} contract</option>`;

        $('#contract-selector').append(option);
    }

    const searchParams = new SearchParams();

    if (isFinite(searchParams.get('contract'))) {
        $('#contract-selector').val(searchParams.get('contract'));
    }

    $('#contract-selector').on('change', async e => {
        const value = e.target.value;
        const searchParams = new SearchParams();

        if (isFinite(value)) {
            searchParams.set('contract', value);
        } else {
            searchParams.delete('contract');
        }

        location.reload();
    })
})

/**
 * Start searching
 * @param search
 */
async function startChainSearching(search) {
    const searchParams = new SearchParams();
    searchParams.set('q', search);
    searchParams.delete('limit');
    searchParams.delete('offset');

    for (let hook of searchHooks) {
        if (await hook(search)) {
            searchParams.delete('blockId');
            return;
        }
    }

    if (confirm('Search by hash may take a long time. Are you sure?')) {
        let blockId = 1;

        function searchBlock(rawBlock) {
            if (rawBlock.hash.includes(search)) {
                return true;
            }

            const data = JSON.parse(rawBlock.data);
            const args = data.args;
            if (args.length) {
                const validationId = data.args[0].validationId;

                if (validationId && validationId.toString().includes(search)) {
                    return true;
                }
            }
        }
        
        function showBlockPreview(blockId) {
            return setTimeout(() => loadBlockPreview(blockId), 500);
        }

        function checkBlock() {
            candy.loadResource(blockId, async function (err, block, rawBlock) {
                if (searchBlock(rawBlock)) {
                    return showBlockPreview(blockId);
                }

                blockId++;

                $('#height').text(`${blockId}/${candy.blockHeight}`);

                if (blockId > candy.blockHeight) {
                    alert('Block not found');
                    return;
                }

                checkBlock();
            })
        }

        checkBlock();
    }
}

/**
 * Initiats candy connection
 * @param nodes
 */
function startCandyConnection(nodes) {
    function hideModal() {
        $('#loadingModal').fadeOut(1000);
        $('.modal-backdrop').fadeOut(1000);
        $('.modal-open').removeClass('modal-open');
    }

    candy = new Candy(nodes).start();

    candy.onready = function() {
        latestBlockId = candy.blockHeight;
        setInterval(async () => {
            $('#height').text(candy.blockHeight);
            // $('#connections').text(candy.getActiveConnections().length);

            if (candy.getActiveConnections().length === 0) {
                $('#loadingModal').modal('show').show();
                $('.modal-backdrop').show();
            } else {
                hideModal();
            }
        }, 1000);

        // setInterval(async () => updateLatestBlocks(), 5000);

        setTimeout(async () => {
            updateLatestBlocks();
            
            const searchParams = new SearchParams();
            const search = searchParams.get('q');
            if (search) {
                $('#search').val(search);
            }

            const blockId = searchParams.get('blockId');
            if (blockId != null) {
                return loadBlockPreview(blockId);
            }

            if (search && blockId == null) {
                return startChainSearching(search);
            }

            const page = +searchParams.get('page', default_page);
            const wallet = searchParams.get('wallet');
            if (!search && wallet) {
                const transactions = new TransactionElement();
                transactions.setPage(page, wallet);
            }
        }, 1000);

        window.pagination = new Pagination();
        window.pagination.init();

        window.paginationModal = new PaginationModal('.module-pagination');
        window.paginationModal.init();
    }

/*candy.onmessage = function (messageBody) {
    for (let a in waitingMessages) {
        if(waitingMessages.hasOwnProperty(a)) {
            if(waitingMessages[a].id === messageBody.id) {
                if(waitingMessages[a].handle(messageBody)) {
                    delete waitingMessages[a];
                }
                return;
            }
        }
    }
}*/
}


/**
 * Detect block type by params
 * @param rawBlock
 * @return {*}
 */
function detectBlockType(rawBlock) {
    try {
        const data = JSON.parse(rawBlock.data);
        if (typeof data.type !== 'undefined') {
            return data.type;
        }

        return 'Unknown';
    } catch {
        return 'Unknown without data';
    }
}


/**
 * Block view href event
 */
 function loadBlockPreview(index) {
    index = (!isFinite(index) ? $(this).text() : index);

    candy.loadResource(index, async function (err, block, rawBlock) {
        const searchParams = new SearchParams();
        searchParams.set('blockId', index);

        const blockType = detectBlockType(rawBlock);

        $('#lastestBlocksPage').hide();
        $('#modalModulePage').hide();
        $('#blockDetailPage').fadeIn();

        $('.blockIndex').text(rawBlock.index);
        $('.blockSize').text(rawBlock.data.length);
        $('.blockHash').text(rawBlock.hash);
        $('.blockPrevHash').text(rawBlock.previousHash);
        $('.blockPrevious').text(rawBlock.index - 1);
        $('.blockNext').text(rawBlock.index + 1);
        $('.blockType').text(blockType);
        $('.blockTimestamp').text(moment(rawBlock.timestamp).format('LLLL'));
        $('.blockStartTimestamp').text(moment(rawBlock.startTimestamp).format('LLLL'));
        $('.blockFee').text(`${rawBlock.fee || 0} SOL`);
        $('.blockData').text(rawBlock.data);
        $('.blockSign').text(rawBlock.sign);

        const data = JSON.parse(rawBlock.data);
        if (data.method === 'validation') {
            const [wallet, validationId, squares] = data.args;

            showMapData(squares.map(_ => _.square));
            showCoordData(squares);

            $('.tab1').fadeIn();
            $('.tab2').fadeIn();
            $('.tab1 a').click();
        } else {
            $('.tab1').hide();
            $('.tab2').hide();
            $('.tab3 a').click();
        }

        if (typeof parsers[blockType] !== 'undefined') {
            const parserResult = parsers[blockType](rawBlock);
            Promise.resolve(parserResult).then((value) => $('.blockParserOutput').html(value));
        } else {
            $('.blockParserOutput').text('No parser for this block type');
        }
    })
}

/**
 * Update latest blocks list
 */
function updateLatestBlocks() {
    const searchParams = new SearchParams();
    const page = +searchParams.get('page', default_page);

    // let blockId = candy.blockHeight;
    const limit = default_limit;
    const offset = (page - 1) * default_limit;

    let blockId;
    if (offset === 0) {
        blockId = candy.blockHeight;
        latestBlockId = blockId;
    } else {
        blockId = latestBlockId;
    }

    const contractAddress = new SearchParams().get('contract', undefined);

    console.log('blockId, limit, offset, hideEmptyBlocks', blockId, limit, offset, hideEmptyBlocks, contractAddress);

    candy.loadBlocks(blockId, limit, offset, hideEmptyBlocks, contractAddress);
}


/**
 * Loads parser module
 * Example: loadParser('parsers/EcmaContractDeploy.js');
 * @param {string} uri
 */
function loadParser(uri) {
    $.getScript(uri);
}


/**
 * Registers search hook
 * @param {Function} hookFunction
 */
function registerSearchHook(hookFunction) {
    searchHooks.push(hookFunction);
}


/**
 * Opens modal page with custom content
 * @param {string} modalHeader
 * @param {string} modalContent
 */
function showModalPage(modalHeader, modalContent) {
    $('#lastestBlocksPage').hide();
    $('#blockDetailPage').hide();
    $('#modalModulePage').fadeIn();

    $('#modalHeader').html(modalHeader);
    $('#modalContent').html(modalContent);
}