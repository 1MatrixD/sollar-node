

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
			this.setPath('http://176.9.104.200:3017');
			this.nodes = ['ws://176.9.104.200:6018/'];
			this.randomNode = 'node2';
		} else if (location.origin.endsWith('8')) {
			this.setPath('http://176.9.104.200:3018');
			this.nodes = ['ws://176.9.104.200:6019/'];
			this.randomNode = 'node3';
		} else {
			this.setPath('http://176.9.104.200:3016');
			this.nodes = ['ws://176.9.104.200:6017/'];
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

	async checkAuth(account) {
		const sign = iz3BitcoreCrypto.sign(account.public, account.private);
		const body = {
			wallet: account.public,
			sign,	
		};

		const {status} = await this.request(`/user/auth/`, body);
		return status;

		// const sign = iz3BitcoreCrypto.sign('auth', account.private);
		// const verify = iz3BitcoreCrypto.validate('auth', sign, account.public);
		// return verify;
	}
}

const wallet = new Wallet();

$(async function() {
	await initCreateWallet();
});


async function initCreateWallet() {
	$('#wallet-auth').css('display', 'block');
	$('#wallet-auth #authfile').on('change', async e => {
		const files = e.target.files;
		const file = files[0];
		const reader = new FileReader();
		reader.onload = async (event) => {
			const file = event.target.result;
			const account = JSON.parse(file);

			if (await wallet.checkAuth(account)) {
				// wallet.setWallet(account);
				$('#wallet-auth').css('display', 'none');
				$('#auth-success').css('display', 'block');
			} else {
				$('#wallet-auth').css('display', 'none');
				$('#auth-failed').css('display', 'block');
			}
		}		
		reader.readAsText(file);
	});
	$('#wallet-auth #createWallet').on('click', async e => {
		wallet.create();
	});
}
