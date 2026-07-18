// ================================================================
// 📚 Connector Ledger
// Bibliothèque Générale PreCogn
// ================================================================

const LEDGER_URL = "http://213.32.16.118:8080";

/**
 * Fonction privée
 */
function _callLedger(endpoint, payload, method) {

  method = method || "POST";

  let url = LEDGER_URL + endpoint;

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
 * Bibliotheque.ledgerConvert(csvData, options)
 * Bibliotheque.ledgerStatus()
 *
 */
function ledgerConvert(csvData, options) {
  return _callLedger("/api/ledger/convert", { data: csvData, options: options || {} }, "POST");
}

function ledgerStatus() {
  return _callLedger("/api/ledger/status", null, "GET");
}

/**
 * Ajoute une écriture classée au journal d'une organisation.
 * Crée le journal de l'organisation s'il n'existe pas encore (bootstrap BYOS).
 *
 * @param {string} orgId
 * @param {{libelle:string, montant:number, sens:("depense"|"recette"), date?:string}} flow
 * @returns {Object} { success, entry, compte, compteNom, confidence, balanceCheck }
 */
function ledgerAddEntry(orgId, flow) {
  return _callLedger("/api/ledger/entry", Object.assign({ orgId: orgId }, flow), "POST");
}

/**
 * Exécute une commande ledger-cli en lecture seule pour une organisation.
 *
 * @param {string} orgId
 * @param {string} command "balance" | "register" | "equity" | "print" | "accounts"
 * @param {string[]} [filters]
 * @returns {Object} { success, output, error }
 */
function ledgerQuery(orgId, command, filters) {
  return _callLedger("/api/ledger/query", { orgId: orgId, command: command, filters: filters || [] }, "POST");
}

/**
 * Indique si une organisation a déjà un journal comptable.
 *
 * @param {string} orgId
 * @returns {boolean}
 */
function ledgerExists(orgId) {
  return !!_callLedger("/api/ledger/exists", { orgId: orgId }, "GET").exists;
}

/**
 * Contexte niveau module Structory + niveau organisation (cascade), résolu
 * côté serveur (BYOS : ledger_api lit ses propres briques locales,
 * pas d'accès Drive depuis Apps Script).
 *
 * @param {string} orgId
 * @returns {string} Contexte concaténé (module Structory + règles de l'organisation, si branchées)
 */
function ledgerGetContext(orgId) {
  return _callLedger("/api/context/structory", { orgId: orgId }, "GET").context;
}

