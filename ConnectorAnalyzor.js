// ================================================================
// 📚 Connector Analyzor
// Bibliothèque Générale PreCogn
// ================================================================

const ANALYZOR_URL = "http://analyzor.precogn.org:8000";
/**
 * Fonction privée
 */
function _callAnalyzor(endpoint, payload, method) {

  method = method || "POST";

  let url = ANALYZOR_URL + endpoint;

  const options = {
    method: method,
    muteHttpExceptions: true,
    contentType: "application/json"
  };

  if (method === "GET") {

    const qs = _buildQueryString(payload);

    if (qs) {
      url += "?" + qs;
    }

  } else {

    if (payload !== null && payload !== undefined) {
      options.payload = JSON.stringify(payload);
    }

  }

  const response = UrlFetchApp.fetch(url, options);

  const code = response.getResponseCode();
  const text = response.getContentText();

  if (code !== 200) {
    throw new Error("HTTP " + code + " : " + text);
  }

  return JSON.parse(text);

}

/**
 * ============================================================
 * API PUBLIQUE
 * ============================================================
 *
 * Bibliotheque.analyzor(...)
 *
 */
function analyzor(endpoint, data, method) {

  return _callAnalyzor(endpoint, data, method);

}

/**
 * Vocabulaire de reconnaissance des consultations (garde-fou déterministe
 * côté Communicator) — lu depuis les briques Rule de niveau Structory, côté
 * analyzor (le service qui possède les briques documentaires), pas codé en
 * dur côté Apps Script. La compléter ne redéploie jamais Communicator.
 *
 * @returns {string[]} Liste de mots-clés (déjà en minuscules)
 */
function analyzorGetQueryKeywords() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'analyzor_query_keywords';
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const keywords = _callAnalyzor("/api/context/query-keywords", null, "GET").keywords || [];
  cache.put(cacheKey, JSON.stringify(keywords), 6 * 60 * 60);
  return keywords;
}