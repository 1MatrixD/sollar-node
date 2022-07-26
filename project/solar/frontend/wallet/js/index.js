

// var wallet = iz3BitcoreCrypto.generateWallet();
// var sign = iz3BitcoreCrypto.sign('qwe', wallet.keysPair.private);
// var isSignValidate = iz3BitcoreCrypto.validate('qwe', sign, wallet.keysPair.public);
// console.log(wallet);
// console.log(sign);
// console.log(isSignValidate);

class API {
	api_path = location.origin;
	nodes = [];
	randomNode = '';

	headers = {
		"content-type": "application/json",
	}
	master_contract_address = 1;
	contract_address = 1;
	
	master_ticker = 'SOL';
	sbtc_ticker = 'sBTC';

	constructor() {
		if (location.origin.endsWith('7')) {
			this.setPath('http://88.99.5.47:3017');
			this.nodes = ['ws://88.99.5.47:6018/'];
			this.randomNode = 'node2';
		} else if (location.origin.endsWith('8')) {
			this.setPath('http://88.99.5.47:3018');
			this.nodes = ['ws://88.99.5.47:6019/'];
			this.randomNode = 'node3';
		} else {
			this.setPath('http://88.99.5.47:3016');
			this.nodes = ['ws://88.99.5.47:6017/'];
			this.randomNode = 'node1';
		}

		const contractAddress = isFinite(localStorage.getItem('contractAddress')) ? 
		Number(localStorage.getItem('contractAddress') || this.master_contract_address) : 
		this.master_contract_address;
		this.setContractAddress(contractAddress);
		$('.contractAddress').val(contractAddress);
	}

	setPath(path) {
		this.api_path = path;
		$('#network-url').text(path);
	}

	setContractAddress(address) {
		this.contract_address = Number(address);
		localStorage.setItem('contractAddress', address);
		$('#transactions').html('');
	}

	request(path, data, contractAddress=this.contract_address) {
		return new Promise(resolve => {
			let url = `${this.api_path}${path}`;

			if (url.endsWith('/')) {
				url += contractAddress;
			} else {
				url += `/${contractAddress}`;
			}

			fetch(url, {
				method: 'post',
				headers: this.headers,
				body: JSON.stringify(data),
			})
			.then(res => {
				resolve(res.json())
			})
		})
	}
}


class Wallet extends API {
	data = {};
	storageName = 'wallet';
	goodWallet = false;
	balance = 0;

	constructor() {
		super();

		this.init();
	}

	save() {
		localStorage.setItem(this.storageName, JSON.stringify(this.data));
	}

	init() {
		let wallet;
		try {
			wallet = JSON.parse(localStorage.getItem(this.storageName));
			if (wallet.public) {
				this.goodWallet = true;
			}
		} catch (e) {
			wallet = {};
			this.goodWallet = false;
		}

		this.data = wallet;
		// this.save();
	}

	create() {
		let wallet = iz3BitcoreCrypto.generateWallet();

		this.goodWallet = true;
		this.data = wallet.keysPair;
		this.generateWalletFile();
		// this.save();
	}

	get public() {
		return this.data.public
	}

	get private() {
		return this.data.private;
	}

	async loadBalance() {
		const {data} = await this.request(`/balance/`, {wallet: this.data.public});
		this.balance = data;
		$('.balance').text(`${this.balance} ${this.master_ticker}`);
	}

	async loadSecondTokenBalance() {
		const {data} = await this.request(`/balance/`, {wallet: this.data.public}, 2);
		this.balance = data;
		$('.sbtc-balance').text(`${this.balance} ${this.sbtc_ticker}`);
	}

	async getFreeBalance(contractAddress=this.contract_address) {
		// const body = {wallet: this.data.public, amount: 1000};
		const body = [this.data.public, 1000];

		// const {data} = await this.request('/get-free/', body);
		
		const message = candy.starwave.createMessage(
			body, 
			this.randomNode,
			undefined,
		'getFreeCoins')
		message['contractAddress'] = contractAddress;
		candy.starwave.sendMessage(message);

		setTimeout(() => this.loadBalance(), 1 * 1000);
		setTimeout(() => this.loadSecondTokenBalance(), 1 * 1000);
	}

	async transferTo(contractAddress=this.contract_address) {
		const recieverPublicKey = $('#recieverPublicKey').val();
		const recieverAmount = parseFloat($('#recieverAmount').val());
		// const body = { from: this.public, to: recieverPublicKey, amount: recieverAmount }
		const body = [this.public, recieverPublicKey, recieverAmount];
		// const {data} = await this.request('/transfer/', body);
		
		const message = candy.starwave.createMessage(
			body, 
			this.randomNode, 
			undefined, 
		'transferFromTo');
		message['contractAddress'] = contractAddress;
		candy.starwave.sendMessage(message);
	}

	async transferHistory() {
		const {data: items} = await this.request('/transfer-history/', { wallet: this.public });
		$('#transactions').html('');

		for (const item of items) {
			await this.addTransferHistory(item, false);
		}
	}

	async addTransferHistory(item, inFirstPlace=true) {
		if (Array.isArray(item)) {
			const newItem = {
				v1: item[0],
				v2: item[1],
				v3: item[2],
				v4: item[3],
				v5: item[4],
				timestamp: item[5],
			};
			console.log('item', item);
			item = newItem;
		};

		const timestamp = parseInt(item.timestamp);
		const ticker = item.v1;
		const from = item.v2;
		const to = item.v3;
		const amount = item.v4;
		let fee = item.v5;

		let sum = amount;

		if (from === this.public) {
			sum = `-${amount}`;
		} else {
			sum = `${amount}`;
			fee = '';
		}

		let v1_class = `${from === this.public ? 'fw-bold' : 'fw-normal'}`;
		let v2_class = `${to === this.public ? 'fw-bold' : 'fw-normal'}`;
		let v3_class = `text-end fw-normal ${from === this.public ? 'bg-danger' : 'bg-success'}`;
		let v4_class = `text-end fw-normal`;

		// const el = `
		// <tr>
  //         <th><p class='fw-light'>${new Date(timestamp).toGMTString()}</p></th>
  //         <th><p class='${v1_class} d-inline-block text-truncate' style="max-width: 150px;">${from}</p></th>
  //         <th><p class='${v2_class} d-inline-block text-truncate' style="max-width: 150px;">${to}</p></th>
  //         <td><p class='${v3_class}'>${sum}<br><span class='${v4_class}' style="font-size: 11px; padding-top: 0;">${fee}</span></p></td>          
  //       </tr>
		// `;
		if (fee) fee = `
				(${fee} ${this.master_ticker})
				
			`
		const el = `
			<div class="card">
				<div class="row m-1">
					<div class="col-8" style="font-size: 12px;">
						${new Date(timestamp).toGMTString()}
					</div>
					<div class="col-4">						
						<span class='badge ${v3_class} float-right'>
							${sum} ${ticker} ${fee}
						</span>
					</div>
				</div>
				<div class="row m-1">
					<div class="col-2" style="font-size: 12px;">
						От:
					</div>
					<div class="col-10 ${v1_class}" style="font-size: 12px;">						
						${from}
					</div>
				</div>
				<div class="row m-1">
					<div class="col-2" style="font-size: 12px;">
						Кому:
					</div>
					<div class="col-10 ${v2_class}" style="font-size: 12px;">						
						${to}
					</div>
				</div>
			</div>
			<br>
		`;

		if (inFirstPlace) {
			$('#transactions').prepend(el);
		} else {
			$('#transactions').append(el);
		}
	}

	generateWalletFile() {
		const fileName = this.public.slice(0, 6) + '_' + this.public.slice(this.public.length - 6)
		const data = JSON.stringify({ public: this.public, private: this.private });
		const a = document.createElement('a');
		const file = new Blob([data], {type: 'application/json'});
		a.href = URL.createObjectURL(file);
		a.download = fileName + '.json';
		a.click();
		a.remove();
	}

	checkAuth(account) {
		const sign = iz3BitcoreCrypto.sign('auth', account.private);
		const verify = iz3BitcoreCrypto.validate('auth', sign, account.public);
		return verify;
	}

	setWallet(account) {
		if (this.checkAuth(account)) {
			this.data = account;
			this.goodWallet = true;
		}
	}
}

const wallet = new Wallet();
let candy;

$(async function() {
	await initAll();
});

async function initAll() {
	await initNetwork();
	await initCreateWallet();
	await checkExistWallet();
	await initWallet();
}

async function initNetwork() {
	$('#network-url').text(wallet.api_path);
	$('.contractAddress').on('change', async e => {
		const val = e.target.value;
		if (isFinite(val)) {
			wallet.setContractAddress(val);
			// location.reload();
			await initAll();
		}
	})
}

async function initCreateWallet() {
	$('#wallet-create').css('display', 'block');
	$('#wallet-create button').on('click', async e => {
		wallet.create();

		location.reload();
		// await checkExistWallet();
	});

	$('#wallet-auth').css('display', 'block');
	$('#wallet-auth #authfile').on('change', async e => {
		const files = e.target.files;
		const file = files[0];
		const reader = new FileReader();
		reader.onload = async (event) => {
			const file = event.target.result;
			const account = JSON.parse(file);

			if (wallet.checkAuth(account)) {
				wallet.setWallet(account);
				await checkExistWallet();
			}
		}		
		reader.readAsText(file);
	});
	$('#wallet-auth #createWallet').on('click', async e => {
		wallet.create();

		location.reload();
	});
}

function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
}

async function checkExistWallet() {
	if (wallet.goodWallet) {
		$('#wallet-create').css('display', 'none');
		$('#wallet-auth').css('display', 'none');
		$('#my-wallet').css('display', 'block');
		$('#transactions').css('display', 'block');

		$('#my-wallet .publicKey').val(wallet.public);
		$('#my-wallet .privateKey').val(wallet.private);
		$('#my-wallet .balance').text(`${wallet.balance}`);

		$('.wallet-transfer').on('click', async e => {
			wallet.transferTo();
		});

		$('.wallet-transfer2').on('click', async e => {
			wallet.transferTo(2);
		});

		$('.publicKeyCopy').on('click', async e => {
			const el = document.querySelector('#my-wallet .publicKey');
			copyToClipboard(el);
		});

		tippy('.publicKeyCopy', {
		  trigger: 'click',
		  content: 'Copied!',
		  theme: 'light',
		  animation: 'scale-extreme',
		  interactiveDebounce: 75,
		});

		$('.privateKeyCopy').on('click', async e => {
			const el = document.querySelector('#my-wallet .privateKey');
			copyToClipboard(el);
		});

		tippy('.privateKeyCopy', {
		  trigger: 'click',
		  content: 'Copied!',
		  theme: 'light',
		  animation: 'scale-extreme',
		  interactiveDebounce: 75,
		});

		wallet.loadBalance();
		wallet.loadSecondTokenBalance();
		wallet.transferHistory();
		await initTransactions();
	}
}

async function initWallet() {
	$('#my-wallet .wallet-get-free').on('click', async e => {
		await wallet.getFreeBalance();
	});

	$('#my-wallet .wallet-get-free2').on('click', async e => {
		await wallet.getFreeBalance(2);
	});
}

async function initTransactions() {
	candy = new Candy(wallet.nodes).start();
	candy.recieverAddress = `${wallet.public}`;

	let transferTimeout = null;
	candy.starwave.registerMessageHandler(`transfers`, async (message) => {
		console.log('message!')
		if (message.sender === wallet.randomNode) {
			clearTimeout(transferTimeout);
			transferTimeout = setTimeout(async () => {
				clearTimeout(transferTimeout);
				await wallet.transferHistory();
				await wallet.loadBalance();
				await wallet.loadSecondTokenBalance();
			}, 300);
			console.log('new message', message);
			// await wallet.addTransferHistory(message.data);
			// await wallet.loadBalance();
		}
	})
}