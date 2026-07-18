// ================================================================
// 📚 TABLE DES MATIÈRES – BIBLIOTHEQUE PRECOGN
// ================================================================
// 1.  📄 HEADER
// 2.  📝 CONTEXTE UNIVERSEL PRECOGN
// 3.  🔧 FONCTION UNIQUE
// 4.  🧪 FONCTION DE TEST
// 5.  📝 NOTES DE VERSION
// ================================================================

// ================================================================
// 1. 📄 HEADER
// ================================================================

/**
 * BIBLIOTHEQUE PRECOGN
 * Version : 1.0.0
 * 
 * Bibliothèque partagée pour tous les outils PreCogn (Apps Script)
 * 
 * Fonction unique :
 * - getPreCognContext() : retourne le contexte universel PreCogn
 * 
 * Utilisation :
 * const context = Bibliotheque.getPreCognContext();
 * 
 * Chaque outil construit son propre payload et appelle son propre Worker.
 */

// ================================================================
// 2. 📝 CONTEXTE UNIVERSEL PRECOGN
// ================================================================

/**
 * CONTEXTE PRECOGN (universel)
 * 
 * Version : 1.0
 * 
 * Ce contexte est partagé par tous les outils PreCogn.
 * Il définit :
 * - L'identité de LLMPreCogn
 * - Les 4 briques fondamentales (Object, Flow, Rule, Time)
 * - Le rôle du document (source de vérité, immuable)
 * - Le rôle des briques (compréhension évolutive)
 * - Les principes de distinction (faits / hypothèses / propositions)
 */
const PRECOGN_CONTEXT = `
# PRECOGN

Tu es LLMPreCogn.

Tu es le moteur de compréhension documentaire de PreCogn.

PreCogn est un moteur universel décrivant toute organisation à l'aide de quatre briques fondamentales :

- Object
- Flow
- Rule
- Time

Le document constitue une source de vérité, il ne doit jamais être modifié.
Les briques représentent la compréhension actuelle du document selon un principe de reversibilité.

Les briques peuvent évoluer.
Le document reste immuable.

Tu ne dois jamais inventer une information absente du document.

Lorsque plusieurs interprétations sont possibles :

- les identifier ;
- expliquer pourquoi ;
- indiquer un niveau de confiance.

Tu dois toujours distinguer :

- les faits observés ;
- les hypothèses ;
- les propositions.

Tu réalises ensuite uniquement la mission demandée.
`;

// ================================================================
// 3. 🔧 FONCTIONS
// ================================================================

/**
 * Retourne le contexte universel PreCogn
 *
 * @returns {string} Le contenu du contexte PreCogn
 *
 * @example
 * const context = Bibliotheque.getPreCognContext();
 */
function getPreCognContext() {
  return PRECOGN_CONTEXT;
}

// ================================================================
// ESCALADE DE CONTEXTE : org -> Structory -> PreCogn
// ================================================================
//
// Les briques Rule restent stockées côté BYOS (aujourd'hui : disque local
// de ledger_api, copie de travail des briques Drive — jamais lues
// directement depuis Apps Script). getStructoryContext() interroge
// ledger_api via ConnectorLedger, exactement comme pour une écriture ou
// une consultation de journal : Communicator ne connaît que le connector,
// jamais le support de stockage réel derrière.

const CONTEXT_CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h : les règles changent rarement

/**
 * Compose le contexte complet pour un outil PreCogn qui a besoin du niveau
 * intermédiaire Structory + du niveau organisation, en plus du contexte
 * universel PreCogn.
 *
 * @param {string} orgId
 * @returns {string} Contexte composé : PreCogn + module Structory + règles de l'organisation
 *
 * @example
 * const context = Bibliotheque.getStructoryContext(orgId);
 */
function getStructoryContext(orgId) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'structory_context_' + orgId;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const orgContext = ledgerGetContext(orgId);
  const context = PRECOGN_CONTEXT +
    (orgContext ? '\n\n# NIVEAU MODULE + ORGANISATION\n\n' + orgContext : '');

  cache.put(cacheKey, context, CONTEXT_CACHE_TTL_SECONDS);
  return context;
}

// ================================================================
// 4. 🧪 FONCTION DE TEST
// ================================================================

/**
 * Test de la bibliothèque
 * Vérifie que le contexte PreCogn est accessible
 */
function testBibliotheque() {
  Logger.log('=== TEST BIBLIOTHEQUE PRECOGN ===');
  
  try {
    const context = getPreCognContext();
    Logger.log('✅ Contexte PreCogn : ' + context.length + ' caractères');
    Logger.log('   Aperçu : ' + context.substring(0, 200) + '...');
  } catch (e) {
    Logger.log('❌ Erreur : ' + e.message);
  }
  
  Logger.log('=== FIN TEST ===');
}

// ================================================================
// 5. 📝 NOTES DE VERSION
// ================================================================

/**
 * v1.0.0 - 2026-07-13
 * -------------------
 * - Version initiale
 * - Un seul contexte : PreCogn (universel)
 * - Fonction unique : getPreCognContext()
 * - Fonction de test : testBibliotheque()
 */

// ================================================================
// FIN DE LA BIBLIOTHEQUE
// ================================================================
