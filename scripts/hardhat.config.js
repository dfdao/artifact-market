require('dotenv').config();

const {ADMIN_PRIVATE_KEY} = process.env;
const xdai = {
    url: 'https://rpc-df.xdaichain.com/',
    accounts: {
      mnemonic: ADMIN_PRIVATE_KEY,
    },
    chainId: 100,
};

const config = {
    defaultNetwork: 'hardhat',
    networks: {
        xdai
    }
};

export default config;