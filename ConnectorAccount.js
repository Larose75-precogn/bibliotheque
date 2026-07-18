// ================================================================
// 📚 Connector Account — module "mon compte" (organisation / user / abonnement)
// Bibliothèque Générale PreCogn
// ================================================================
// Parle à subscriptions_api (identité + abonnement), pas à ledger_api (compta).

const ACCOUNT_URL = "http://213.32.16.118:8082";

// Clé lue depuis les Script Properties (Apps Script > Paramètres du projet >
// Propriétés du script), jamais en dur dans le code — ce fichier est destiné
// à un dépôt public. Définir la propriété "ACCOUNT_SERVICE_KEY" une fois.
function _accountServiceKey() {
  const key = PropertiesService.getScriptProperties().getProperty('ACCOUNT_SERVICE_KEY');
  if (!key) {
    throw new Error('ACCOUNT_SERVICE_KEY manquante dans les Script Properties du projet Bibliotheque.');
  }
  return key;
}

/**
 * À exécuter UNE SEULE FOIS depuis l'éditeur Apps Script (menu déroulant en haut ->
 * sélectionner "setupAccountServiceKey" -> bouton Exécuter), pas depuis google.script.run :
 * `clasp` ne peut pas régler les Script Properties à distance sans déploiement API-executable,
 * donc ce réglage doit se faire à la main, une fois, ici.
 */
function setupAccountServiceKey() {
  PropertiesService.getScriptProperties().setProperty('ACCOUNT_SERVICE_KEY', '***REMOVED_SERVICE_KEY***');
  Logger.log('ACCOUNT_SERVICE_KEY enregistrée.');
}

function _callAccount(endpoint, payload, method) {
  method = method || "POST";
  let url = ACCOUNT_URL + endpoint;

  const options = {
    method: method,
    muteHttpExceptions: true,
    contentType: "application/json",
    headers: { "X-Service-Key": _accountServiceKey() }
  };

  if (method === "GET") {
    const qs = _buildQueryString(payload);
    if (qs) url += "?" + qs;
  } else if (payload !== null && payload !== undefined) {
    options.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const text = response.getContentText();

  if (code !== 200) {
    throw new Error("HTTP " + code + " : " + text);
  }
  return JSON.parse(text);
}

/** Trouve ou crée un User par email (identité native Structory). */
function accountUpsertUser(email, locale) {
  return _callAccount("/api/account/upsert", { email: email, locale: locale || null }, "POST");
}

/** Enregistre un orgId (déjà utilisé ailleurs, ex. ledger_api) dans le registre de compte. */
function accountRegisterOrg(orgId, name, ownerUid) {
  return _callAccount("/api/org/register", { orgId: orgId, name: name, ownerUid: ownerUid }, "POST");
}

/** Profil complet pour l'écran "mon compte" : org + membres + statut d'abonnement. */
function accountGetOrgProfile(orgId) {
  return _callAccount("/api/org/profile", { orgId: orgId }, "GET");
}

/** fields: {name?, logoUrl?, info?} */
function accountUpdateOrgProfile(orgId, fields) {
  const payload = Object.assign({ orgId: orgId }, fields);
  return _callAccount("/api/org/profile", payload, "POST");
}

/** fields: {photoUrl?, info?} */
function accountUpdateUserProfile(uid, fields) {
  const payload = Object.assign({ uid: uid }, fields);
  return _callAccount("/api/user/profile", payload, "POST");
}

/** Crée une session de paiement Stripe (mode test) pour devenir partenaire. Retourne l'URL à ouvrir. */
function accountSubscriptionCheckout(payerUid, country, locale) {
  return _callAccount("/api/subscription/checkout", { payerUid: payerUid, country: country || null, locale: locale || null }, "POST");
}

/**
 * HTML du widget "mon compte" (avatar + panneau organisation/user/abonnement), prêt à
 * insérer dans la page de n'importe quel outil via <?!= Bibliotheque.getAccountPanelHtml(orgId) ?>.
 *
 * L'outil consommateur doit exposer ces fonctions top-level (wrappers vers Bibliotheque,
 * requis par google.script.run qui ne peut pas appeler une fonction de library directement) :
 * accountUpsertUser, accountRegisterOrg, accountGetOrgProfile, accountUpdateOrgProfile,
 * accountUpdateUserProfile, accountSubscriptionCheckout — voir Code.js de Communicator pour
 * un exemple des wrappers à copier dans un nouvel outil.
 */
function getAccountPanelHtml(orgId) {
  const template = HtmlService.createTemplateFromFile('AccountPanel.html');
  template.orgId = orgId;
  return template.evaluate().getContent();
}
