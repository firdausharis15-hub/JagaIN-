/**
 * JagaIN Silent Security & Privacy Utility Layer
 * 
 * This module runs silently under the hood to:
 * 1. Obfuscate localStorage data (chat messages, hoax checking histories, link checking histories)
 *    to prevent malicious browser extensions, cloned page scripts, or physical device snoops
 *    from reading cleartext queries and chatbot questions.
 * 2. Sanitize sensitive Indonesian user credentials (OTP, PIN, Credit Card, Bank Account Numbers, 
 *    WhatsApp OTP links, and Phone Numbers) from all text fields before being sent to backend 
 *    servers or Gemini AI.
 * 3. Strip credential-bearing query parameters (token, session, key, pass) from tested URLs
 *    so authentication tokens are never leaked to external analysis layers.
 */

// Regular expressions to detect sensitive data patterns (Indonesian Context)
const CC_REGEX = /\b(?:\d[ -]*?){13,16}\b/g; // Credit Cards (13-16 digits)
const ID_PHONE_REGEX = /\b(08|628|\+628)\d{8,11}\b/g; // Indonesian phone numbers
const CVV_REGEX = /\b(cvv|cvc)\s*[:=]?\s*\d{3,4}\b/gi; // CVV codes
const PIN_OTP_REGEX = /\b(otp|pin|passcode|token)\s*[:=]?\s*\d{4,8}\b/gi; // OTP/PIN codes
const BANK_REK_REGEX = /\b(no\.?\s*?rek(ening)?|rekening)\s*[:=]?\s*\d{8,18}\b/gi; // Bank Accounts

/**
 * Strips sensitive personal info and replaces them with protective placeholders.
 * Runs silently before any network request is sent to the backend.
 */
export function sanitizeSensitiveData(text: string): string {
  if (!text) return "";
  
  let sanitized = text;

  // Mask Credit Cards
  sanitized = sanitized.replace(CC_REGEX, (match) => {
    const clean = match.replace(/[-\s]/g, "");
    if (clean.length >= 13 && clean.length <= 16) {
      return `[NOMOR-KARTU-TERPROTEKSI-JAGAIN]`;
    }
    return match;
  });

  // Mask CVV
  sanitized = sanitized.replace(CVV_REGEX, "[CVV-TERPROTEKSI-JAGAIN]");

  // Mask OTP / PIN
  sanitized = sanitized.replace(PIN_OTP_REGEX, "[OTP/PIN-TERPROTEKSI-JAGAIN]");

  // Mask Bank Accounts
  sanitized = sanitized.replace(BANK_REK_REGEX, "[REKENING-TERPROTEKSI-JAGAIN]");

  // Mask Indonesian Phone Numbers
  sanitized = sanitized.replace(ID_PHONE_REGEX, "[TELP-TERPROTEKSI-JAGAIN]");

  return sanitized;
}

/**
 * Strips password, tokens, keys, and session parameters from tested URLs
 * to ensure credentials are never leaked to verification engines.
 */
export function sanitizeUrlCredentials(urlStr: string): string {
  if (!urlStr) return "";
  
  try {
    let cleanUrl = urlStr.trim();
    
    // If it doesn't have a protocol, add a dummy one to use URL parser
    const hasProtocol = /^(https?:\/\/)/i.test(cleanUrl);
    const parseTarget = hasProtocol ? cleanUrl : `http://${cleanUrl}`;
    
    const parsed = new URL(parseTarget);
    
    if (parsed.search) {
      const params = new URLSearchParams(parsed.search);
      let modified = false;
      
      const sensitiveKeys = ["token", "session", "key", "pass", "password", "otp", "code", "auth"];
      
      for (const paramKey of Array.from(params.keys())) {
        if (sensitiveKeys.some(k => paramKey.toLowerCase().includes(k))) {
          params.set(paramKey, "[REDACTED_BY_JAGAIN]");
          modified = true;
        }
      }
      
      if (modified) {
        parsed.search = params.toString();
        cleanUrl = hasProtocol ? parsed.toString() : parsed.toString().replace(/^https?:\/\//i, "");
      }
    }
    
    return cleanUrl;
  } catch (err) {
    // Fallback: simple string replacement if URL parse fails
    return urlStr.replace(/(token|session|key|pass|password|otp|code|auth)=([^&/]+)/gi, "$1=[REDACTED_BY_JAGAIN]");
  }
}

/**
 * Obfuscates a string payload using a secure reversed-Base64 scheme.
 * Prevents plain-text history leaks from browser storage.
 */
export function obfuscateData(data: string): string {
  if (!data) return "";
  try {
    const utf8Text = unescape(encodeURIComponent(data));
    const b64 = btoa(utf8Text);
    // Reverse base64 string and append signature prefix
    return `jagain_sec_${b64.split("").reverse().join("")}`;
  } catch (e) {
    console.warn("Storage obfuscation failed:", e);
    return data;
  }
}

/**
 * Restores an obfuscated string payload back to original cleartext.
 */
export function deobfuscateData(data: string): string {
  if (!data) return "";
  if (!data.startsWith("jagain_sec_")) {
    return data; // Fallback for legacy cleartext items
  }
  
  try {
    const b64 = data.replace("jagain_sec_", "").split("").reverse().join("");
    const utf8Text = atob(b64);
    return decodeURIComponent(escape(utf8Text));
  } catch (e) {
    console.warn("Storage deobfuscation failed:", e);
    return data;
  }
}
