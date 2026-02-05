import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_IP = "@server_ip";
const STORAGE_KEY_PORT = "@server_port";

export const useServerConfig = () => {
  const [ip, setIP] = useState("");
  const [port, setPort] = useState("");

  useEffect(() => {
    const load = async () => {
      const savedIp = await AsyncStorage.getItem(STORAGE_KEY_IP);
      const savedPort = await AsyncStorage.getItem(STORAGE_KEY_PORT);
      if (savedIp) setIP(savedIp);
      if (savedPort) setPort(savedPort);
    };
    load();
  }, []);

  const saveServerSettings = async (newIp: string, newPort: string) => {
    setIP(newIp);
    setPort(newPort);
    await AsyncStorage.setItem(STORAGE_KEY_IP, newIp);
    await AsyncStorage.setItem(STORAGE_KEY_PORT, newPort);
  };

  // Automatically formats to full URL
  const serverURL = ip && port ? `http://${ip}:${port}` : null;

  return { ip, port, setIP, setPort, saveServerSettings, serverURL };
};
