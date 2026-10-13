import { Platform } from "react-native";

// Default target when EXPO_PUBLIC_API_URL is not set: the local mock-server.
// The Node backend and the mock-server both default to :3002. Run one, or
// move the other and set EXPO_PUBLIC_API_URL (e.g. http://localhost:3002).
const DEFAULT_PORT = 3002;

// Android emulators reach the host machine through the 10.0.2.2 loopback,
// while web and the iOS simulator talk to localhost directly.
function defaultHost() {
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}

// Android emulators can't reach the host machine via localhost/127.0.0.1 — they
// need the 10.0.2.2 loopback. Rewrite it so one EXPO_PUBLIC_API_URL value works
// across web, iOS simulator, and Android emulator without editing per platform.
function forPlatform(url) {
  if (Platform.OS === "android") {
    return url.replace(/(https?:\/\/)(localhost|127\.0\.0\.1)/i, "$110.0.2.2");
  }
  return url;
}

// The single place that decides where the backend lives.
export function getBaseUrl() {
  const fromEnv =
    typeof process !== "undefined" &&
    process.env &&
    process.env.EXPO_PUBLIC_API_URL;

  if (fromEnv) {
    // strip any trailing slash so path concatenation stays clean
    return forPlatform(String(fromEnv).replace(/\/+$/, ""));
  }

  return `http://${defaultHost()}:${DEFAULT_PORT}`;
}
