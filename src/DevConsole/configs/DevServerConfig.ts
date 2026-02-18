// DevServerConfig.ts

const DEFAULT_IP = "149.165.174.119";
const DEFAULT_PORT = "5000";

let serverIP = DEFAULT_IP;
let serverPort = DEFAULT_PORT;

export const DevServerConfig = {
  setIP: (ip: string) => {
    serverIP = ip;
  },

  setPort: (port: string) => {
    serverPort = port;
  },

  getIP: () => serverIP,
  getPort: () => serverPort,

  getBaseURL: () => {
    return `http://${serverIP}:${serverPort}`;
  },

  useDefault: () => {
    serverIP = DEFAULT_IP;
    serverPort = DEFAULT_PORT;
  },

  isUsingDefault: () => {
    return serverIP === DEFAULT_IP && serverPort === DEFAULT_PORT;
  },

  getDefaultIP: () => DEFAULT_IP,
  getDefaultPort: () => DEFAULT_PORT,
};
