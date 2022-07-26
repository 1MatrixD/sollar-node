
class ContractsInfo {
	contracts = [];

	async loadContracts() {
		const url = `${API_PREFIX}/contracts/info`;

		return $.ajax({
            type: 'POST',
            url,
            contentType: "application/json",
            dataType: 'json'
        });
	}

	async load() {
		const contracts = await this.loadContracts();
		console.log('contraacts', contracts);
		this.contracts = contracts.data;
	}
}

const contractsInfo = new ContractsInfo();