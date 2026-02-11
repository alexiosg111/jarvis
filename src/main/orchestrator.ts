import { exec } from "child_process";
import { shell } from "electron";
import {
  buildProviderUrl,
  MAX_URL_LENGTH,
  OpenProviderResponse,
  ProviderId,
  PROVIDERS
} from "../shared/config";

const escapeArg = (value: string) => value.replace(/"/g, "\\\"");

const runCommand = (command: string) =>
  new Promise<void>((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

const openWithApp = async (url: string, appName?: string) => {
  if (!appName) {
    return false;
  }

  const safeUrl = escapeArg(url);
  const safeApp = escapeArg(appName);

  try {
    if (process.platform === "darwin") {
      await runCommand(`open -a "${safeApp}" "${safeUrl}"`);
      return true;
    }

    if (process.platform === "win32") {
      await runCommand(`cmd /c start "" "${safeUrl}"`);
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
};

const openDefault = async (url: string) => {
  await shell.openExternal(url);
};

export const openPromptInProvider = async (
  providerId: ProviderId,
  prompt: string
): Promise<OpenProviderResponse> => {
  if (!prompt.trim()) {
    return { ok: false, error: "Please enter a task before launching." };
  }

  if (!PROVIDERS[providerId]) {
    return { ok: false, error: "Unknown provider selected." };
  }

  let url: string;

  try {
    url = buildProviderUrl(providerId, prompt);
  } catch (error) {
    return { ok: false, error: "Failed to build provider URL." };
  }

  if (url.length > MAX_URL_LENGTH) {
    return {
      ok: false,
      error:
        "Prompt is too long for a URL. Copy the prompt and paste it into your chat manually.",
      url
    };
  }

  const provider = PROVIDERS[providerId];
  const opened = await openWithApp(url, provider.appName);

  if (!opened) {
    await openDefault(url);
  }

  return { ok: true, url };
};
