/**
 *
 * iZ³ | IZZZIO blockchain - https://izzz.io
 *
 * iZ³ BigNet Master contract
 * Provides main token and platform functionality
 * Process payable transaction
 * Process resources rental
 * Backend for C2C ordering
 *
 */
/**
 * Token emission amount
 * @type {number}
 */
const EMISSION = 9999999999;

/**
 * Token full name
 * @type {string}
 */
const TOKEN_NAME = 'sBTC token';

/**
 * Token ticker
 * @type {string}
 */
const TICKER = 'sBTC';

/**
 * Address of main contract owner
 * @type {string}
 */
const CONTRACT_OWNER = 'sol3SkCrMnxp7WzmJiCbzmJiCbjyJWbwwXHmyQt74C';

/**
 * C2C Fee
 * @type {number}
 */
const C2C_FEE = 0.001;

/**
 * C2C Fee transfer address
 * @type {string}
 */
const FEE_ADDRESS = 'solKdeY2qq2Uy2LfFS73hh6mvKu57k5XZ2ss';

const TokenLogo = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.6227 14.9204C22.02 21.3491 15.5088 25.2614 9.07941 23.6583C2.65271 22.0556 -1.25963 15.5441 0.343757 9.11594C1.94574 2.68661 8.4569 -1.22603 14.8843 0.376659C21.3132 1.97935 25.2253 8.49162 23.6225 14.9206L23.6226 14.9204H23.6227Z" fill="#F7931A"/>
    <path d="M17.291 10.2903C17.5299 8.6934 16.3141 7.83498 14.6516 7.26233L15.1909 5.09914L13.8741 4.77103L13.3491 6.87726C13.0029 6.79092 12.6474 6.70957 12.2941 6.62892L12.8229 4.50878L11.5069 4.18066L10.9673 6.34315C10.6808 6.27793 10.3994 6.21347 10.1265 6.14554L10.128 6.13874L8.31209 5.68528L7.9618 7.09171C7.9618 7.09171 8.93876 7.31565 8.91817 7.32943C9.4514 7.46252 9.54783 7.81551 9.53182 8.09529L8.91747 10.5597C8.95418 10.569 9.00181 10.5825 9.05437 10.6036C9.01043 10.5927 8.96369 10.5808 8.91518 10.5692L8.05407 14.0214C7.9889 14.1834 7.82349 14.4266 7.45068 14.3342C7.46388 14.3534 6.49361 14.0954 6.49361 14.0954L5.83984 15.6027L7.55345 16.0299C7.87224 16.1098 8.18463 16.1935 8.49228 16.2721L7.94737 18.4601L9.26265 18.7883L9.80228 16.6235C10.1616 16.721 10.5103 16.811 10.8517 16.8958L10.3139 19.0504L11.6307 19.3785L12.1756 17.1946C14.421 17.6196 16.1094 17.4482 16.82 15.4172C17.3927 13.7821 16.7915 12.8389 15.6102 12.2238C16.4706 12.0254 17.1187 11.4595 17.2915 10.2905L17.2911 10.2902L17.291 10.2903ZM14.2825 14.5091C13.8755 16.1443 11.1224 15.2604 10.2298 15.0387L10.9529 12.14C11.8454 12.3628 14.7078 12.8038 14.2825 14.5091H14.2825ZM14.6897 10.2666C14.3185 11.754 12.027 10.9984 11.2837 10.8131L11.9392 8.1841C12.6826 8.36939 15.0764 8.71522 14.6898 10.2666H14.6897Z" fill="white"/>
</svg>
`;

/**
 * Main token contract
 */
class secondToken extends SollarTokenContract {

    /**
     * Contract info
     * @return {{owner: string, ticker: string, name: string}}
     */
    get contract() {
        return {
            name: TOKEN_NAME,
            ticker: TICKER,
            owner: CONTRACT_OWNER,
            address: {
                fee: FEE_ADDRESS,
            },
            logo: TokenLogo,
            emission: EMISSION,
            c2cFee: C2C_FEE,
            type: 'token',
        };
    }

    /**
     * Initialization and emission
     */
    init() {
        super.init(EMISSION);
    }
}

global.registerContract(secondToken);