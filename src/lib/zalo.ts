import { getPayload } from 'payload';
import configPromise from '@payload-config';
import fs from 'fs';
import path from 'path';

const ZALO_OA_API = "https://openapi.zalo.me/v2.0/oa";
const ZALO_ZNS_API = "https://business.openapi.zalo.me/message/template";

async function getConfigValue(key: string): Promise<string | null> {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'zalo-system-configs',
    where: { key: { equals: key } },
    limit: 1,
  });
  return result.docs.length > 0 ? result.docs[0].value : null;
}

export async function getAccessToken(): Promise<string> {
  const token = await getConfigValue('zalo_access_token');
  return token ?? process.env.ZALO_ACCESS_TOKEN ?? "";
}

export async function refreshZaloAccessToken() {
  const payload = await getPayload({ config: configPromise });
  const appId = await getConfigValue('zalo_app_id');
  const secret = await getConfigValue('zalo_app_secret');
  const refreshToken = await getConfigValue('zalo_refresh_token');

  const res = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      secret_key: secret ?? "",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken ?? "",
      app_id: appId ?? "",
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();

  if (data.access_token) {
    const existing = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: 'zalo_access_token' } } });
    if (existing.docs.length > 0) {
      await payload.update({ collection: 'zalo-system-configs', id: existing.docs[0].id, data: { value: data.access_token } });
    } else {
      await payload.create({ collection: 'zalo-system-configs', data: { key: 'zalo_access_token', value: data.access_token, label: 'Access Token' } });
    }
  }

  if (data.refresh_token) {
    const existing = await payload.find({ collection: 'zalo-system-configs', where: { key: { equals: 'zalo_refresh_token' } } });
    if (existing.docs.length > 0) {
      await payload.update({ collection: 'zalo-system-configs', id: existing.docs[0].id, data: { value: data.refresh_token } });
    } else {
      await payload.create({ collection: 'zalo-system-configs', data: { key: 'zalo_refresh_token', value: data.refresh_token, label: 'Refresh Token' } });
    }
  }

  return data;
}

async function getValidToken(): Promise<string> {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'zalo-system-configs',
    where: { key: { equals: 'zalo_access_token' } },
    limit: 1,
  });

  if (result.docs.length === 0 || !result.docs[0].value) {
    return process.env.ZALO_ACCESS_TOKEN ?? "";
  }

  const config = result.docs[0];
  const ageMs = Date.now() - new Date(config.updatedAt).getTime();
  const TWENTY_THREE_HOURS = 23 * 60 * 60 * 1000;

  if (ageMs > TWENTY_THREE_HOURS) {
    console.log("[Zalo] Token cũ hơn 23 giờ, đang tự động làm mới...");
    try {
      const refreshed = await refreshZaloAccessToken();
      if (refreshed?.access_token) {
        console.log("[Zalo] Token đã được làm mới tự động thành công.");
        return refreshed.access_token;
      }
    } catch (err: any) {
      console.error("[Zalo] Tự động làm mới token thất bại:", err.message);
    }
  }

  return config.value as string;
}

async function callZaloAPI(url: string, options: any = {}) {
  let token = await getValidToken();
  const makeRequest = (t: string) => fetch(url, {
    ...options,
    headers: { ...options.headers, access_token: t },
  });

  let res = await makeRequest(token);
  let data = await res.json();

  if (data.error === -216) {
    console.log("[Zalo] Token hết hạn (error -216), đang làm mới và thử lại...");
    try {
      const refreshed = await refreshZaloAccessToken();
      if (refreshed?.access_token) {
        token = refreshed.access_token;
        res = await makeRequest(token);
        data = await res.json();
      }
    } catch (err: any) {
      console.error("[Zalo] Làm mới token thất bại:", err.message);
    }
  }
  return data;
}

function splitTextIntoChunks(text: string, maxLen = 2000) {
  const lines = text.split("\n");
  const chunks = [];
  let currentChunk = "";
  
  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxLen) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      if (line.length > maxLen) {
        let remainingLine = line;
        while (remainingLine.length > maxLen) {
          chunks.push(remainingLine.substring(0, maxLen));
          remainingLine = remainingLine.substring(maxLen);
        }
        currentChunk = remainingLine;
      } else {
        currentChunk = line;
      }
    } else {
      if (currentChunk) {
        currentChunk += "\n" + line;
      } else {
        currentChunk = line;
      }
    }
  }
  
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

export async function sendTextMessage(toUserId: string, text: string) {
  if (!text) return { error: -1, message: "Empty text" };

  if (text.length > 2000) {
    const chunks = splitTextIntoChunks(text, 2000);
    let lastRes = { error: 0, message: "Success" };
    
    for (const chunk of chunks) {
      if (chunk.trim()) {
        lastRes = await callZaloAPI("https://openapi.zalo.me/v2.0/oa/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { user_id: toUserId },
            message: { text: chunk },
          }),
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    return lastRes;
  }

  return callZaloAPI("https://openapi.zalo.me/v2.0/oa/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { user_id: toUserId },
      message: { text },
    }),
  });
}

export async function sendZNS({ phone, templateId, templateData }: any) {
  return callZaloAPI(ZALO_ZNS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone,
      template_id: templateId,
      template_data: templateData,
      tracking_id: `cdc_${Date.now()}`,
    }),
  });
}

export async function getFollowers(offset = 0, count = 50) {
  return callZaloAPI(
    `${ZALO_OA_API}/getfollowers?data=${encodeURIComponent(JSON.stringify({ offset, count }))}`
  );
}

export async function getUserProfile(userId: string) {
  return callZaloAPI(
    `${ZALO_OA_API}/getprofile?data=${encodeURIComponent(JSON.stringify({ user_id: userId }))}`
  );
}
