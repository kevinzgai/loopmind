import crypto from "crypto";
import https from "https";
// 确保环境变量已加载
import "../config/config.js";

/**
 * 阿里云 NLS Token 服务
 * 用于获取和管理阿里云智能语音交互的 Token
 * 文档: https://help.aliyun.com/document_detail/113251.html
 */

// Token 缓存
let cachedToken = null;
let tokenExpireTime = 0;

// 从环境变量获取配置
function getConfig() {
  return {
    accessKeyId: process.env.ALI_TTS_ACCESS_KEY_ID || "",
    accessKeySecret: process.env.ALI_TTS_ACCESS_KEY_SECRET || "",
  };
}

/**
 * URL 编码（符合 RFC 3986 规范）
 */
function percentEncode(value) {
  if (!value) return "";
  return encodeURIComponent(value)
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");
}

/**
 * 获取 ISO8601 格式的时间戳
 */
function getISO8601Time() {
  return new Date().toISOString();
}

/**
 * 生成唯一的随机数（UUID）
 */
function getUniqueNonce() {
  return crypto.randomUUID();
}

/**
 * 构造规范化的请求字符串
 */
function canonicalizedQuery(params) {
  const sortedKeys = Object.keys(params).sort();
  const pairs = sortedKeys.map(
    (key) => `${percentEncode(key)}=${percentEncode(params[key])}`,
  );
  return pairs.join("&");
}

/**
 * 构造待签名字符串
 */
function createStringToSign(method, urlPath, queryString) {
  return `${method}&${percentEncode(urlPath)}&${percentEncode(queryString)}`;
}

/**
 * 计算签名
 */
function sign(stringToSign, accessKeySecret) {
  const hmac = crypto.createHmac("sha1", accessKeySecret + "&");
  hmac.update(stringToSign);
  return hmac.digest("base64");
}

/**
 * 获取 Token
 * @param {Object} credentials - 包含 accessKeyId 和 accessKeySecret 的对象
 * @returns {Promise<{token: string, expireTime: number}>}
 */
export async function getToken(credentials = {}) {
  const accessKeyId =
    credentials.accessKeyId || process.env.ALI_TTS_ACCESS_KEY_ID;
  const accessKeySecret =
    credentials.accessKeySecret || process.env.ALI_TTS_ACCESS_KEY_SECRET;

  // 只有当使用相同的 credentials 时才使用缓存
  const cacheKey = `${accessKeyId}:${accessKeySecret}`;

  // 检查缓存的 Token 是否还有效（提前 5 分钟刷新）
  const now = Math.floor(Date.now() / 1000);
  if (
    cachedToken &&
    tokenExpireTime > now + 300 &&
    cachedToken.cacheKey === cacheKey
  ) {
    console.log(
      "✅ 使用缓存的 Token，剩余有效期:",
      tokenExpireTime - now,
      "秒",
    );
    return { token: cachedToken.token, expireTime: tokenExpireTime };
  }

  if (!accessKeyId || !accessKeySecret) {
    throw new Error("阿里云 AccessKey 配置不完整");
  }

  console.log("🔑 开始获取新的 Token...");

  // 构造请求参数
  const params = {
    AccessKeyId: accessKeyId,
    Action: "CreateToken",
    Version: "2019-02-28",
    Timestamp: getISO8601Time(),
    Format: "JSON",
    RegionId: "cn-shanghai",
    SignatureMethod: "HMAC-SHA1",
    SignatureVersion: "1.0",
    SignatureNonce: getUniqueNonce(),
  };

  // 1. 构造规范化的请求字符串
  const queryString = canonicalizedQuery(params);

  // 2. 构造待签名字符串
  const stringToSign = createStringToSign("GET", "/", queryString);

  // 3. 计算签名
  const signature = sign(stringToSign, accessKeySecret);

  // 4. 构造完整的请求 URL
  const url = `https://nls-meta.cn-shanghai.aliyuncs.com/?Signature=${percentEncode(signature)}&${queryString}`;

  // 5. 发送 HTTPS GET 请求
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const result = JSON.parse(data);

            if (result.Token && result.Token.Id) {
              cachedToken = {
                token: result.Token.Id,
                cacheKey: cacheKey,
              };
              tokenExpireTime = result.Token.ExpireTime;

              const expireDate = new Date(
                tokenExpireTime * 1000,
              ).toLocaleString("zh-CN", {
                timeZone: "Asia/Shanghai",
              });

              console.log("✅ Token 获取成功");
              console.log(
                "   Token:",
                cachedToken.token.substring(0, 20) + "...",
              );
              console.log("   有效期至:", expireDate);

              resolve({
                token: cachedToken.token,
                expireTime: tokenExpireTime,
              });
            } else {
              console.error("❌ Token 获取失败:", result);
              reject(
                new Error(
                  `获取 Token 失败: ${result.Message || JSON.stringify(result)}`,
                ),
              );
            }
          } catch (error) {
            console.error("❌ 解析响应失败:", error);
            reject(new Error(`解析响应失败: ${error.message}`));
          }
        });
      })
      .on("error", (error) => {
        console.error("❌ 请求失败:", error);
        reject(new Error(`请求失败: ${error.message}`));
      });
  });
}

/**
 * 清除缓存的 Token
 */
export function clearToken() {
  cachedToken = null;
  tokenExpireTime = 0;
  console.log("🗑️  Token 缓存已清除");
}

export default {
  getToken,
  clearToken,
};
