/**
 * NorNickel block explorer customize
 */

function isSearchedText(data, searchStr, like = false) {
    let result = data;

    if (!result) {
        return result;
    }

    if (isFinite(result)) {
        result = JSON.stringify(result);
    }

    if (result) {
        if (like) {
            if (result.includes(searchStr)) {
                const reg = new RegExp(`${searchStr}`, 'ig');
                result = result.replace(reg, `<strong>${searchStr}</strong>`);
            }
        } else {
            if (result === searchStr) {
                result = result.replace(searchStr, `<strong>${searchStr}</strong>`);
            }
        }
    }

    return result;
}

function formatResults(list, searchStr) {
    let result = `
    <div class="col-md-12" style="overflow-scrolling: auto">
        <table class="table table-striped" style="width: 100%">
        <thead>
            <tr>`;

    for (const tableName of ['#', 'Contract', 'Event', 'Hash', 'From', 'To', 'Date']) {
        result += `<th scope="col">${tableName}</th>`;
    }
    result += `
            </tr>
        </thead>
        <tbody>
`;

    for (const blockData of list) {
        result += `<tr>`;

        result += `<td><a href='#' class="blockHref blockIndex">${isSearchedText(parseFloat(blockData.block) || '', searchStr)}</a></td>`; // id
        result += `<td>${blockData.contract || ''}</td>`; // Contract
        result += `<td>${blockData.event || ''}</td>`; // Event
        result += `<td class='text-truncate' style='max-width: 400px; display: inline-block;'>${isSearchedText(blockData.blockHash || '', searchStr)}</td>`; // Hash
        result += `<td><span class="blockHref blockFrom">${isSearchedText(blockData.from || '', searchStr)}</span></td>`; // From
        result += `<td><span class="blockHref blockTo">${isSearchedText(blockData.to || '', searchStr)}</span></td>`; // To
        result += `<td>${moment(blockData.date).format('LLLL')}</td>`;

        result += `</tr>`;
    }
    result += `
            </tbody>
        </table>
    </div>
    `;

    return result;
}

function formatTransactionHistory(list, address) {
    let result = `
    <div class="col-md-12" style="overflow-scrolling: auto">
        <table class="table table-striped" style="width: 100%">
        <thead>
            <tr>`;

    for (const tableName of ['#', 'Contract', 'Event', 'From', 'To', 'Amount', 'Fee', 'Date']) {
        result += `<th scope="col">${tableName}</th>`;
    }

    result += `
            </tr>
        </thead>
        <tbody>
`;

    for (const blockData of list) {
        result += `<tr>`;

        result += `<td><span class="blockHref blockIndex">${isSearchedText(parseFloat(blockData.block) || '', address)}</span></td>`;
        result += `<td>${blockData.contract || ''}</td>`; // Contract
        result += `<td>${blockData.event || ''}</td>`; // Event
        result += `<td>${isSearchedText(blockData.from || '', address)}</td>`; // From
        result += `<td>${isSearchedText(blockData.to || '', address)}</td>`; // To
        result += `<td>${blockData.amount || ''}</td>`; // Amount
        result += `<td>${blockData.fee || ''}</td>`; // Fee
        result += `<td>${moment(blockData.date).format('LLLL')}</td>`; // Date

        result += `</tr>`;
    }

    result += `
            </tbody>
        </table>
    </div>
    `;

    return result;
}
