/**
 * Utilitaires pour gérer les URLs IPFS dans le graphique
 * Convertit les URLs IPFS en URLs HTTP utilisables par le navigateur
 */

/**
 * Gateway IPFS publique par défaut
 * Alternative: ipfs.io, dweb.link, etc.
 */
const DEFAULT_GATEWAY = 'gateway.pinata.cloud';

/**
 * Vérifie si une URL est une URL IPFS
 */
export const isIpfsUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('ipfs://') || url.startsWith('ipfs/');
};

/**
 * Convertit une URL IPFS en URL HTTP
 * @param {string} ipfsUrl - L'URL IPFS à convertir
 * @param {string} gateway - Gateway IPFS à utiliser (optionnel)
 * @returns {string} URL HTTP
 */
export const ipfsToHttp = (ipfsUrl, gateway = DEFAULT_GATEWAY) => {
  if (!ipfsUrl || typeof ipfsUrl !== 'string') {
    return ipfsUrl;
  }

  // Si ce n'est pas une URL IPFS, retourner l'URL inchangée
  if (!isIpfsUrl(ipfsUrl)) {
    return ipfsUrl;
  }

  // Extraire le hash IPFS
  let hash = ipfsUrl;
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
  } else if (hash.startsWith('ipfs/')) {
    hash = hash.replace('ipfs/', '');
  }

  // Nettoyer le gateway (enlever http/https et trailing slashes)
  const cleanGateway = gateway.replace(/^https?:\/\//, '').replace(/\/+$/, '');

  // Retourner l'URL HTTP
  return `https://${cleanGateway}/ipfs/${hash}`;
};

/**
 * Convertit récursivement toutes les URLs IPFS dans un objet
 * @param {*} obj - L'objet à traiter
 * @param {string} gateway - Gateway IPFS à utiliser (optionnel)
 * @returns {*} Objet avec URLs converties
 */
export const convertIpfsUrls = (obj, gateway = DEFAULT_GATEWAY) => {
  if (!obj || typeof obj !== 'object') {
    // Si c'est une chaîne, vérifier si c'est une URL IPFS
    if (typeof obj === 'string' && isIpfsUrl(obj)) {
      return ipfsToHttp(obj, gateway);
    }
    return obj;
  }

  // Si c'est un tableau, traiter chaque élément
  if (Array.isArray(obj)) {
    return obj.map(item => convertIpfsUrls(item, gateway));
  }

  // Si c'est un objet, traiter chaque propriété
  const converted = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      // Conversion spéciale pour les propriétés "image"
      if (key === 'image' && typeof value === 'string' && isIpfsUrl(value)) {
        converted[key] = ipfsToHttp(value, gateway);
      } else if (typeof value === 'object' && value !== null) {
        converted[key] = convertIpfsUrls(value, gateway);
      } else {
        converted[key] = value;
      }
    }
  }

  return converted;
};

/**
 * Convertit toutes les URLs IPFS dans les données du graphique
 * @param {Object} graphData - { nodes: [], links: [] }
 * @param {string} gateway - Gateway IPFS à utiliser (optionnel)
 * @returns {Object} Graph data avec URLs converties
 */
export const convertGraphDataIpfs = (graphData, gateway = DEFAULT_GATEWAY) => {
  if (!graphData) {
    return graphData;
  }

  return {
    nodes: convertIpfsUrls(graphData.nodes || [], gateway),
    links: convertIpfsUrls(graphData.links || [], gateway),
  };
};
