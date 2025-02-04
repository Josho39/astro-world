export interface MarketConfig {
    name: string;
    displayName: string;
    iconUrl: string;
    url?: string;
    isKrc20Market?: boolean;
}

const MODIFIED_URLS: { [key: string]: string } = {
    'Biconomy': 'https://www.biconomy.com/sign-up?r_user_id=W9RNIX0J8',
    'KSPR Bot': 'https://t.me/kspr_home_bot',
    'XT': 'https://www.xt.com/en/accounts/register',
    'GuacSwap': 'https://swap.guac.fyi/',
    'Kaspa Market': 'https://kaspamarket.io/',
    'Coinstore': 'https://h5.coinstore.com/h5/signup?invitCode=OygYIL',
    'CoinEx': 'https://www.coinex.com/register?refer_code=p7vts',
    'MEXC': 'https://www.mexc.com/register?inviteCode=12TvMq',
    'GroveX': 'https://www.grovex.io/',
    'Pionex': 'https://www.pionex.com/en/signUp?r=0uDSn7pw7pk',
    'Ascendex': 'https://ascendex.com/en-us/register?inviteCode=UQWCYR1CW',
    'BitMart': 'https://www.bitmart.com/invite/cjA4Gq/en',
    'FameEX': 'https://www.fameex.com/en-US/',
    'LBank': 'https://www.lbank.com/en-US/login/?icode=4FSp0'
};

export const MARKETS: Record<string, MarketConfig> = {
    'Ascendex': {
        name: 'Ascendex',
        displayName: 'Ascendex',
        iconUrl: '/exchanges/ascendex.jpg',
        url: MODIFIED_URLS['Ascendex']
    },
    'MEXC': {
        name: 'MEXC',
        displayName: 'MEXC',
        iconUrl: '/exchanges/mexc.jpg',
        url: MODIFIED_URLS['MEXC']
    },
    'FameEX': {
        name: 'FameEX',
        displayName: 'FameEX',
        iconUrl: '/exchanges/fameex.jpg',
        url: MODIFIED_URLS['FameEX']
    },
    'BitMart': {
        name: 'BitMart',
        displayName: 'BitMart',
        iconUrl: '/exchanges/bitmart.jpg',
        url: MODIFIED_URLS['BitMart']
    },
    'Coinstore': {
        name: 'Coinstore',
        displayName: 'Coinstore',
        iconUrl: '/exchanges/coinstore.jpg',
        url: MODIFIED_URLS['Coinstore']
    },
    'CoinEx': {
        name: 'CoinEx',
        displayName: 'CoinEx',
        iconUrl: '/exchanges/coinex.jpg',
        url: MODIFIED_URLS['CoinEx']
    },
    'Poloniex': {
        name: 'Poloniex',
        displayName: 'Poloniex',
        iconUrl: '/exchanges/poloniex.jpg',
        url: 'https://poloniex.com/signup?c=QU9FFW54'
    },
    'Knot Meme': {
        name: 'Knot Meme',
        displayName: 'Knot Meme',
        iconUrl: '/exchanges/knot-meme.jpg',
        url: 'https://knot.meme/',
        isKrc20Market: true
    },
    'Biconomy': {
        name: 'Biconomy',
        displayName: 'Biconomy',
        iconUrl: '/exchanges/biconomy.jpg',
        url: MODIFIED_URLS['Biconomy']
    },
    'GroveX': {
        name: 'GroveX',
        displayName: 'GroveX',
        iconUrl: '/exchanges/grovex.jpg',
        url: MODIFIED_URLS['GroveX']
    },
    'KSPR Bot': {
        name: 'KSPR Bot',
        displayName: 'KSPR Bot',
        iconUrl: '/exchanges/kspr.jpg',
        url: MODIFIED_URLS['KSPR Bot'],
        isKrc20Market: true
    },
    'XT': {
        name: 'XT',
        displayName: 'XT',
        iconUrl: '/exchanges/xt.jpg',
        url: MODIFIED_URLS['XT']
    },
    'LBank': {
        name: 'LBank',
        displayName: 'LBank',
        iconUrl: '/exchanges/lbank.jpg',
        url: MODIFIED_URLS['LBank']
    },
    'XeggeX': {
        name: 'XeggeX',
        displayName: 'XeggeX',
        iconUrl: '/exchanges/xeggex.jpg',
        url: 'https://xeggex.com?ref=6782177130acb40aceb3892f'
    },
    'KaspaCom': {
        name: 'KaspaCom',
        displayName: 'KaspaCom',
        iconUrl: '/exchanges/kaspacom.jpg',
        url: 'https://www.kaspa.com/',
        isKrc20Market: true
    },
    'GuacSwap': {
        name: 'GuacSwap',
        displayName: 'GuacSwap',
        iconUrl: '/exchanges/guac-swap.jpg',
        url: MODIFIED_URLS['GuacSwap'],
        isKrc20Market: true
    },
    'Kaspa Market': {
        name: 'Kaspa Market',
        displayName: 'Kaspa Market',
        iconUrl: '/exchanges/kaspa-market.jpg',
        url: MODIFIED_URLS['Kaspa Market'],
        isKrc20Market: true
    },
    'Pionex US': {
        name: 'Pionex US',
        displayName: 'Pionex US',
        iconUrl: '/exchanges/pionex.jpg',
        url: 'https://www.pionex.us/en-US/trade/NACHO_USD'
    }
};