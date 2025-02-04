interface NetworkConfig {
    SOCKET_SERVER: string;
    SUFFIX: string;
    API_SERVER: string;
    ADDRESS_PREFIX: string;
    KASPA_UNIT: string;
    BPS: number;
  }
  
  const defaultConfig: NetworkConfig = {
    SOCKET_SERVER: process.env.WS_SERVER || "wss://api.kaspa.org",
    SUFFIX: "",
    API_SERVER: process.env.REACT_APP_API_SERVER || "https://api.kaspa.org",
    ADDRESS_PREFIX: "kaspa:",
    KASPA_UNIT: "KAS",
    BPS: 1
  };
  
  const testnet10Config: NetworkConfig = {
    SOCKET_SERVER: "wss://api-tn10.kaspa.org",
    SUFFIX: " TN10",
    API_SERVER: "https://api-tn10.kaspa.org",
    ADDRESS_PREFIX: "kaspatest:",
    KASPA_UNIT: "TKAS",
    BPS: 1
  };
  
  const testnet11Config: NetworkConfig = {
    SOCKET_SERVER: "wss://api-tn11.kaspa.org",
    SUFFIX: " TN11",
    API_SERVER: "https://api-tn11.kaspa.org",
    ADDRESS_PREFIX: "kaspatest:",
    KASPA_UNIT: "TKAS",
    BPS: 10
  };
  
  let config: NetworkConfig;
  
  switch (process.env.REACT_APP_NETWORK) {
    case "testnet-10":
      config = testnet10Config;
      break;
    case "testnet-11":
      config = testnet11Config;
      break;
    default:
      config = defaultConfig;
      break;
  }
  
  export const {
    SOCKET_SERVER,
    SUFFIX,
    API_SERVER,
    ADDRESS_PREFIX,
    KASPA_UNIT,
    BPS
  } = config;