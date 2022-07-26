
class NodeCount {
    count = 0

    async request() {
        const url = `${API_PREFIX}/contracts/ecma/callMethod/1/getNodesCount`;

        return $.ajax({
            type: 'POST',
            url,
            contentType: "application/json",
            dataType: 'json'
        });
    }

    async updateCount() {
        const {result} = await this.request();

        $('#connections').text(result);
    }
}

const nodeCount = new NodeCount();
nodeCount.updateCount();