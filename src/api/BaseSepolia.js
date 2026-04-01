import { gql, GraphQLClient } from "graphql-request";
import { getAtomVerificationStatus, GREEN_SQUARE_PLACEHOLDER } from "../config/verifiedAtoms";

// Hardcoded Endpoints with display names
export const ENDPOINTS = {
  baseSepolia: {
    url: "https://testnet.intuition.sh/v1/graphql",
    displayName: "Intuition Testnet",
  },
  base: {
    url: "https://proxy.agent-bossfighters.com/graphql",
    displayName: "Intuition Mainnet",
  },
};

// Create GraphQL client based on endpoint
export const createClient = (endpoint) => {
  return new GraphQLClient(ENDPOINTS[endpoint].url);
};

// Filtrer les images pour les atomes non-vérifiés
const filterImageForAtom = (atom) => {
  if (!atom || !atom.id) return atom;
  
  const verification = getAtomVerificationStatus(atom.id);
  
  // Si l'atome est non-vérifié, remplacer par un carré vert
  if (verification.status === "not-verified") {
    return { ...atom, image: GREEN_SQUARE_PLACEHOLDER };
  }
  
  return atom;
};

const transformTripleData = (triple) => ({
  id: triple.term_id,
  subject: filterImageForAtom({
    id: triple.subject.term_id,
    label: triple.subject.label,
    type: triple.subject.type,
    image: triple.subject.image,
  }),
  predicate: {
    id: triple.predicate.term_id,
    label: triple.predicate.label,
    type: triple.predicate.type,
  },
  object: filterImageForAtom({
    id: triple.object.term_id,
    label: triple.object.label,
    type: triple.object.type,
    image: triple.object.image,
  }),
});

// Fetch Atom Details
export const fetchAtomDetails = async (atomId, endpoint = "base") => {
  const client = createClient(endpoint);
  let query;
  query = gql`
    query GetAtom($atomId: String!) {
      atoms(where: { term_id: { _eq: $atomId } }) {
        term_id
        image
        label
        emoji
        type
        creator_id
        term {
          total_market_cap
        }
      }
    }
  `;

  const variables = { atomId };

  try {
    const data = await client.request(query, variables);
    const atom = data.atoms[0];
    
    // Appliquer le filtre d'image
    if (atom) {
      const verification = getAtomVerificationStatus(atom.term_id);
      if (verification.status === "not-verified") {
        atom.image = GREEN_SQUARE_PLACEHOLDER;
      }
    }
    
    return atom;
  } catch (error) {
    console.error("Error fetching atom details:", error);
    throw error;
  }
};

// Fetch Triples Details
export const fetchTriples = async (endpoint = "base") => {
  const client = createClient(endpoint);
  
  try {
    // Étape 1: Récupérer les triples avec seulement les IDs
    const query = gql`
      query {
        triples(limit: 1000) {
          term_id
          subject_id
          predicate_id
          object_id
        }
      }
    `;
    
    const data = await client.request(query);
    const triples = data.triples || [];
    
    if (triples.length === 0) {
      return [];
    }

    // Étape 2: Récupérer les détails des subjects, predicates et objects
    const subjectIds = [...new Set(triples.map(t => t.subject_id).filter(Boolean))];
    const predicateIds = [...new Set(triples.map(t => t.predicate_id).filter(Boolean))];
    const objectIds = [...new Set(triples.map(t => t.object_id).filter(Boolean))];

    const atomsQuery = gql`
      query GetAtoms($subjectIds: [String!]!, $predicateIds: [String!]!, $objectIds: [String!]!) {
        subjects: atoms(where: { term_id: { _in: $subjectIds } }) {
          term_id
          label
          creator_id
          type
          image
        }
        predicates: atoms(where: { term_id: { _in: $predicateIds } }) {
          term_id
          label
          creator_id
          type
        }
        objects: atoms(where: { term_id: { _in: $objectIds } }) {
          term_id
          label
          creator_id
          type
          image
        }
      }
    `;

    const atomsData = await client.request(atomsQuery, {
      subjectIds,
      predicateIds,
      objectIds,
    });

    // Appliquer le filtre de vérification aux atoms (fetchTriples)
    const subjectsMap = new Map(
      (atomsData.subjects || []).map(atom => {
        const verification = getAtomVerificationStatus(atom.term_id);
        if (verification.status === "not-verified") {
          atom.image = GREEN_SQUARE_PLACEHOLDER;
        }
        return [atom.term_id, atom];
      })
    );
    const predicatesMap = new Map(
      (atomsData.predicates || []).map(atom => [atom.term_id, atom])
    );
    const objectsMap = new Map(
      (atomsData.objects || []).map(atom => {
        const verification = getAtomVerificationStatus(atom.term_id);
        if (verification.status === "not-verified") {
          atom.image = GREEN_SQUARE_PLACEHOLDER;
        }
        return [atom.term_id, atom];
      })
    );

    // Étape 3: Enrichir les triples avec les détails
    const enrichedTriples = triples.map(triple => ({
      term_id: triple.term_id,
      subject: subjectsMap.get(triple.subject_id) || {
        term_id: triple.subject_id,
        label: '',
        creator_id: '',
        type: '',
        image: null,
      },
      predicate: predicatesMap.get(triple.predicate_id) || {
        term_id: triple.predicate_id,
        label: '',
        creator_id: '',
        type: '',
      },
      object: objectsMap.get(triple.object_id) || {
        term_id: triple.object_id,
        label: '',
        creator_id: '',
        type: '',
        image: null,
      },
    }));

    return enrichedTriples;
  } catch (error) {
    console.error("Error fetching triples:", error);
    return [];
  }
};

// Fetch Embedded triples Details
export const fetchTriplesForNode = async (nodeId, endpoint = "base") => {
  const client = createClient(endpoint);
  
  try {
    // Étape 1: Récupérer les triples avec seulement les IDs
    const query = gql`
      query Triples($where: triples_bool_exp) {
        triples(where: $where) {
          term_id
          subject_id
          predicate_id
          object_id
        }
      }
    `;
    
    const variables = {
      where: {
        _or: [
          {
            predicate_id: {
              _eq: nodeId,
            },
          },
          {
            subject_id: {
              _eq: nodeId,
            },
          },
          {
            object_id: {
              _eq: nodeId,
            },
          },
        ],
      },
    };

    const data = await client.request(query, variables);
    const triples = data.triples || [];
    
    if (triples.length === 0) {
      return [];
    }

    // Étape 2: Récupérer les détails des subjects, predicates et objects
    const subjectIds = [...new Set(triples.map(t => t.subject_id).filter(Boolean))];
    const predicateIds = [...new Set(triples.map(t => t.predicate_id).filter(Boolean))];
    const objectIds = [...new Set(triples.map(t => t.object_id).filter(Boolean))];

    const atomsQuery = gql`
      query GetAtoms($subjectIds: [String!]!, $predicateIds: [String!]!, $objectIds: [String!]!) {
        subjects: atoms(where: { term_id: { _in: $subjectIds } }) {
          term_id
          label
          creator_id
          type
          image
        }
        predicates: atoms(where: { term_id: { _in: $predicateIds } }) {
          term_id
          label
          creator_id
          type
        }
        objects: atoms(where: { term_id: { _in: $objectIds } }) {
          term_id
          label
          creator_id
          type
          image
        }
      }
    `;

    const atomsData = await client.request(atomsQuery, {
      subjectIds,
      predicateIds,
      objectIds,
    });

    // Appliquer le filtre de vérification aux atoms (fetchTriplesForNode)
    const subjectsMap = new Map(
      (atomsData.subjects || []).map(atom => {
        const verification = getAtomVerificationStatus(atom.term_id);
        if (verification.status === "not-verified") {
          atom.image = GREEN_SQUARE_PLACEHOLDER;
        }
        return [atom.term_id, atom];
      })
    );
    const predicatesMap = new Map(
      (atomsData.predicates || []).map(atom => [atom.term_id, atom])
    );
    const objectsMap = new Map(
      (atomsData.objects || []).map(atom => {
        const verification = getAtomVerificationStatus(atom.term_id);
        if (verification.status === "not-verified") {
          atom.image = GREEN_SQUARE_PLACEHOLDER;
        }
        return [atom.term_id, atom];
      })
    );

    // Étape 3: Enrichir les triples avec les détails
    const enrichedTriples = triples.map(triple => ({
      term_id: triple.term_id,
      subject: subjectsMap.get(triple.subject_id) || {
        term_id: triple.subject_id,
        label: '',
        creator_id: '',
        type: '',
        image: null,
      },
      predicate: predicatesMap.get(triple.predicate_id) || {
        term_id: triple.predicate_id,
        label: '',
        creator_id: '',
        type: '',
      },
      object: objectsMap.get(triple.object_id) || {
        term_id: triple.object_id,
        label: '',
        creator_id: '',
        type: '',
        image: null,
      },
    }));

    return enrichedTriples.map(transformTripleData);
  } catch (error) {
    console.error("Error fetching triples for node:", error);
    return [];
  }
};

// Search Triples
export const searchTriples = async (filters, endpoint = "base") => {
  const client = createClient(endpoint);
  
  try {
    // Étape 1: Rechercher les atoms par label si des filtres sont fournis
    const subjectIds = [];
    const predicateIds = [];
    const objectIds = [];

    if (filters.subject) {
      const subjectQuery = gql`
        query SearchSubjects($label: String!) {
          atoms(where: { label: { _ilike: $label } }) {
            term_id
          }
        }
      `;
      const subjectData = await client.request(subjectQuery, {
        label: `%${filters.subject}%`,
      });
      subjectIds.push(...(subjectData.atoms || []).map(a => a.term_id));
    }

    if (filters.predicate) {
      const predicateQuery = gql`
        query SearchPredicates($label: String!) {
          atoms(where: { label: { _ilike: $label } }) {
            term_id
          }
        }
      `;
      const predicateData = await client.request(predicateQuery, {
        label: `%${filters.predicate}%`,
      });
      predicateIds.push(...(predicateData.atoms || []).map(a => a.term_id));
    }

    if (filters.object) {
      const objectQuery = gql`
        query SearchObjects($label: String!) {
          atoms(where: { label: { _ilike: $label } }) {
            term_id
          }
        }
      `;
      const objectData = await client.request(objectQuery, {
        label: `%${filters.object}%`,
      });
      objectIds.push(...(objectData.atoms || []).map(a => a.term_id));
    }

    // Étape 2: Construire le where pour les triples
    const where = {
      _and: [],
    };

    if (subjectIds.length > 0) {
      where._and.push({
        subject_id: {
          _in: subjectIds,
        },
      });
    }

    if (predicateIds.length > 0) {
      where._and.push({
        predicate_id: {
          _in: predicateIds,
        },
      });
    }

    if (objectIds.length > 0) {
      where._and.push({
        object_id: {
          _in: objectIds,
        },
      });
    }

    // Si aucun filtre, retourner un tableau vide
    if (where._and.length === 0) {
      return [];
    }

    // Étape 3: Récupérer les triples avec seulement les IDs
    const query = gql`
      query SearchTriples($where: triples_bool_exp) {
        triples(where: $where) {
          term_id
          subject_id
          predicate_id
          object_id
        }
      }
    `;

    const variables = {
      where,
    };

    const data = await client.request(query, variables);
    const triples = data.triples || [];

    if (triples.length === 0) {
      return [];
    }

    // Étape 4: Récupérer les détails des subjects, predicates et objects
    const allSubjectIds = [...new Set(triples.map(t => t.subject_id).filter(Boolean))];
    const allPredicateIds = [...new Set(triples.map(t => t.predicate_id).filter(Boolean))];
    const allObjectIds = [...new Set(triples.map(t => t.object_id).filter(Boolean))];

    const atomsQuery = gql`
      query GetAtoms($subjectIds: [String!]!, $predicateIds: [String!]!, $objectIds: [String!]!) {
        subjects: atoms(where: { term_id: { _in: $subjectIds } }) {
          term_id
          label
          creator_id
          type
          image
        }
        predicates: atoms(where: { term_id: { _in: $predicateIds } }) {
          term_id
          label
          creator_id
          type
        }
        objects: atoms(where: { term_id: { _in: $objectIds } }) {
          term_id
          label
          creator_id
          type
          image
        }
      }
    `;

    const atomsData = await client.request(atomsQuery, {
      subjectIds: allSubjectIds,
      predicateIds: allPredicateIds,
      objectIds: allObjectIds,
    });

    const subjectsMap = new Map(
      (atomsData.subjects || []).map(atom => [atom.term_id, atom])
    );
    const predicatesMap = new Map(
      (atomsData.predicates || []).map(atom => [atom.term_id, atom])
    );
    const objectsMap = new Map(
      (atomsData.objects || []).map(atom => [atom.term_id, atom])
    );

    // Étape 5: Enrichir les triples avec les détails
    const enrichedTriples = triples.map(triple => ({
      term_id: triple.term_id,
      subject: subjectsMap.get(triple.subject_id) || {
        term_id: triple.subject_id,
        label: '',
        creator_id: '',
        type: '',
        image: null,
      },
      predicate: predicatesMap.get(triple.predicate_id) || {
        term_id: triple.predicate_id,
        label: '',
        creator_id: '',
        type: '',
      },
      object: objectsMap.get(triple.object_id) || {
        term_id: triple.object_id,
        label: '',
        creator_id: '',
        type: '',
        image: null,
      },
    }));

    return enrichedTriples.map(transformTripleData);
  } catch (error) {
    console.error("Error executing search query:", error);
    throw error;
  }
};

// // Fetch Triples (Positions) by Creator
// export const fetchTriplesByCreator = async (
//   creatorId,
//   endpoint = "base"
// ) => {
//   const client = createClient(endpoint);
//   const query = gql`
//     query TriplesByCreator($creatorId: String!) {
//       triples(where: { creator_id: { _eq: $creatorId } }) {
//         term_id
//         subject {
//           label
//           term_id
//         }
//         predicate {
//           label
//           term_id
//         }
//         object {
//           label
//           term_id
//         }
//       }
//     }
//   `;
//   const variables = { creatorId };
//   const data = await client.request(query, variables);
//   return data.triples;
// };

// Fetch Triples filtered for Agent view
export const fetchTriplesForAgent = async (
  objectId,
  endpoint = "base",
  batchSize = 1000
) => {
  const client = createClient(endpoint);

  try {
    // Étape 1: Récupérer les triples avec seulement les IDs (sans relations subject/predicate/object)
    const mainQuery = gql`
      query Triples_for_Agent($objectId: String!, $batchSize: Int!) {
        triples(limit: $batchSize, where: { object_id: { _eq: $objectId } }) {
          term_id
          subject_id
          predicate_id
          object_id
        }
      }
    `;

    const variables = {
      batchSize,
      objectId: String(objectId),
    };

    const mainData = await client.request(mainQuery, variables);
    const mainTriples = mainData.triples;

    if (mainTriples.length === 0) {
      return [];
    }

    // Étape 2: Récupérer les détails des subjects, predicates et objects
    const subjectIds = [...new Set(mainTriples.map(triple => triple.subject_id).filter(Boolean))];
    const predicateIds = [...new Set(mainTriples.map(triple => triple.predicate_id).filter(Boolean))];
    const objectIds = [...new Set(mainTriples.map(triple => triple.object_id).filter(Boolean))];

    const atomsQuery = gql`
      query GetAtoms($subjectIds: [String!]!, $predicateIds: [String!]!, $objectIds: [String!]!) {
        subjects: atoms(where: { term_id: { _in: $subjectIds } }) {
          term_id
          label
          type
          image
        }
        predicates: atoms(where: { term_id: { _in: $predicateIds } }) {
          term_id
          label
          type
          image
        }
        objects: atoms(where: { term_id: { _in: $objectIds } }) {
          term_id
          label
          type
          image
        }
      }
    `;

    const atomsData = await client.request(atomsQuery, {
      subjectIds,
      predicateIds,
      objectIds,
    });

    const subjectsMap = new Map(
      (atomsData.subjects || []).map(atom => [atom.term_id, atom])
    );
    const predicatesMap = new Map(
      (atomsData.predicates || []).map(atom => [atom.term_id, atom])
    );
    const objectsMap = new Map(
      (atomsData.objects || []).map(atom => [atom.term_id, atom])
    );

    // Étape 3: Enrichir les triples avec les détails
    const enrichedTriples = mainTriples.map(triple => ({
      term_id: triple.term_id,
      subject: subjectsMap.get(triple.subject_id) || {
        term_id: triple.subject_id,
        label: '',
        type: '',
        image: null,
      },
      predicate: predicatesMap.get(triple.predicate_id) || {
        term_id: triple.predicate_id,
        label: '',
        type: '',
        image: null,
      },
      object: objectsMap.get(triple.object_id) || {
        term_id: triple.object_id,
        label: '',
        type: '',
        image: null,
      },
    }));

    // Étape 4: Récupérer les relations de chaque sujet trouvé (sans relations dans la requête)
    const relationSubjectIds = [...new Set(enrichedTriples.map(triple => triple.subject.term_id))];
    
    if (relationSubjectIds.length > 0) {
      const relationsQuery = gql`
        query Relations_for_Subject($subjectIds: [String!]!) {
          triples(where: { subject_id: { _in: $subjectIds } }) {
            term_id
            subject_id
            predicate_id
            object_id
          }
        }
      `;

      const relationsData = await client.request(relationsQuery, {
        subjectIds: relationSubjectIds,
      });

      const relationTriples = relationsData.triples || [];
      
      // Récupérer les détails des relations si nécessaire
      if (relationTriples.length > 0) {
        const relPredicateIds = [...new Set(relationTriples.map(t => t.predicate_id).filter(Boolean))];
        const relObjectIds = [...new Set(relationTriples.map(t => t.object_id).filter(Boolean))];

        if (relPredicateIds.length > 0 || relObjectIds.length > 0) {
          const relAtomsQuery = gql`
            query GetRelationAtoms($predicateIds: [String!]!, $objectIds: [String!]!) {
              predicates: atoms(where: { term_id: { _in: $predicateIds } }) {
                term_id
                label
                type
                image
              }
              objects: atoms(where: { term_id: { _in: $objectIds } }) {
                term_id
                label
                type
                image
              }
            }
          `;

          const relAtomsData = await client.request(relAtomsQuery, {
            predicateIds: relPredicateIds,
            objectIds: relObjectIds,
          });

          const relPredicatesMap = new Map(
            (relAtomsData.predicates || []).map(atom => [atom.term_id, atom])
          );
          const relObjectsMap = new Map(
            (relAtomsData.objects || []).map(atom => [atom.term_id, atom])
          );

          const enrichedRelations = relationTriples.map(triple => ({
            term_id: triple.term_id,
            subject: subjectsMap.get(triple.subject_id) || {
              term_id: triple.subject_id,
              label: '',
              type: '',
              image: null,
            },
            predicate: relPredicatesMap.get(triple.predicate_id) || {
              term_id: triple.predicate_id,
              label: '',
              type: '',
              image: null,
            },
            object: relObjectsMap.get(triple.object_id) || {
              term_id: triple.object_id,
              label: '',
              type: '',
              image: null,
            },
          }));

          // Combiner les triples principaux et les relations
          const allTriples = [...enrichedTriples, ...enrichedRelations];
          return allTriples.map(transformTripleData);
        }
      }
    }

    // Retourner seulement les triples principaux si pas de relations
    return enrichedTriples.map(transformTripleData);

  } catch (error) {
    console.error("Error fetching agent-specific triples:", error);
    // En cas d'erreur, retourner un tableau vide plutôt que d'essayer fetchTriples qui a aussi des problèmes
    return [];
  }
};

// Fetch triples for PlayerMap using constants config (PLAYER_TRIPLE_TYPES + OFFICIAL_GUILDS)
// 2 requêtes : (1) outer triples, (2) résolution subjects (nested vs atom) en query combinée
// IS_PLAYER_OF sans subject imbriqué → exclu (seuls les [account-has_alias-pseudo] -is_player_of- game passent)
export const fetchTriplesForPlayerMap = async (constants, endpoint = "base") => {
  const client = createClient(endpoint);
  const { PLAYER_TRIPLE_TYPES, OFFICIAL_GUILDS, COMMON_IDS, PREDEFINED_CLAIM_IDS } = constants;

  // Build OR conditions from PLAYER_TRIPLE_TYPES
  // Supporte objectId (filtre sur l'objet) et subjectId (filtre sur le sujet)
  const orConditions = Object.values(PLAYER_TRIPLE_TYPES)
    .filter(type => type.objectId !== null || !!type.subjectId)
    .map(type => {
      const conditions = [{ predicate_id: { _eq: type.predicateId } }];
      if (type.objectId) conditions.push({ object_id: { _eq: type.objectId } });
      if (type.subjectId) conditions.push({ subject_id: { _eq: type.subjectId } });
      return { _and: conditions };
    });

  // Add guild conditions (predicat "is member of" depuis PLAYER_GUILD + chaque guild ID)
  const guildPredicateId = PLAYER_TRIPLE_TYPES.PLAYER_GUILD?.predicateId;
  if (OFFICIAL_GUILDS && OFFICIAL_GUILDS.length > 0 && guildPredicateId) {
    OFFICIAL_GUILDS.forEach(guild => {
      orConditions.push({
        _and: [
          { predicate_id: { _eq: guildPredicateId } },
          { object_id: { _eq: guild.id } },
        ],
      });
    });
  }

  // Add predefined claim IDs (fetch by term_id directly)
  if (PREDEFINED_CLAIM_IDS && PREDEFINED_CLAIM_IDS.length > 0) {
    orConditions.push({ term_id: { _in: PREDEFINED_CLAIM_IDS } });
  }

  if (orConditions.length === 0) return [];

  const applyVerification = (atom) => {
    if (!atom?.term_id) return atom;
    const verification = getAtomVerificationStatus(atom.term_id);
    if (verification.status === "not-verified") return { ...atom, image: GREEN_SQUARE_PLACEHOLDER };
    return atom;
  };

  try {
    // Requête 1 : outer triples avec predicate/object
    const outerQuery = gql`
      query PlayerMapOuterTriples($where: triples_bool_exp!) {
        triples(where: $where, limit: 1000) {
          term_id
          subject_id
          predicate_id
          predicate {
            term_id
            label
            type
          }
          object {
            term_id
            label
            type
            image
          }
        }
      }
    `;

    const outerData = await client.request(outerQuery, { where: { _or: orConditions } });
    const outerTriples = outerData.triples || [];
    if (outerTriples.length === 0) return [];

    // Requête 2 : résoudre les subjects en une seule query combinée
    // - nestedTriples : subject_id qui est lui-même le term_id d'un triple (→ triple imbriqué)
    // - subjectAtoms  : subject_id qui est un atom classique
    const subjectIds = [...new Set(outerTriples.map(t => t.subject_id).filter(Boolean))];

    const resolveQuery = gql`
      query ResolveSubjects($subjectIds: [String!]!) {
        nestedTriples: triples(where: { term_id: { _in: $subjectIds } }) {
          term_id
          subject_id
          object_id
          object {
            term_id
            label
            type
            image
            creator_id
          }
        }
        subjectAtoms: atoms(where: { term_id: { _in: $subjectIds } }) {
          term_id
          label
          type
          image
          creator_id
        }
      }
    `;

    const resolveData = await client.request(resolveQuery, { subjectIds });
    const nestedMap = new Map((resolveData.nestedTriples || []).map(t => [t.term_id, t]));
    const atomsMap = new Map((resolveData.subjectAtoms || []).map(a => [a.term_id, a]));

    // Requête 3 : alias lookup pour résoudre account → pseudo
    // Couvre deux cas :
    //   - inner.subject_id : account d'un triple imbriqué (ex: [account-has_alias-pseudo]-IS_PLAYER_OF-game)
    //   - subject_id direct : account non-nested d'un triple IS (ex: account-IS-fairplay)
    const innerSubjectIds = [...new Set(
      (resolveData.nestedTriples || []).map(t => t.subject_id).filter(Boolean)
    )];
    const directIsSubjectIds = outerTriples
      .filter(t => t.predicate_id === COMMON_IDS.IS && !nestedMap.has(t.subject_id))
      .map(t => t.subject_id)
      .filter(Boolean);
    const allAccountIds = [...new Set([...innerSubjectIds, ...directIsSubjectIds])];

    let accountToPseudoMap = new Map();
    if (allAccountIds.length > 0 && COMMON_IDS.HAS_ALIAS) {
      const aliasQuery = gql`
        query AliasLookup($accountIds: [String!]!, $hasAlias: String!) {
          triples(where: {
            predicate_id: { _eq: $hasAlias },
            subject_id: { _in: $accountIds }
          }) {
            subject_id
            object_id
            object {
              term_id
              label
              type
              image
              creator_id
            }
          }
        }
      `;
      const aliasData = await client.request(aliasQuery, {
        accountIds: allAccountIds,
        hasAlias: COMMON_IDS.HAS_ALIAS,
      });
      accountToPseudoMap = new Map(
        (aliasData.triples || []).map(t => [
          t.subject_id,
          t.object || { term_id: t.object_id, label: '', type: '', image: null, creator_id: '' }
        ])
      );
    }

    const predefinedSet = new Set(constants.PREDEFINED_CLAIM_IDS || []);

    const result = [];
    for (const triple of outerTriples) {
      const isNested = nestedMap.has(triple.subject_id);

      let rawSubject;
      if (isNested) {
        const inner = nestedMap.get(triple.subject_id);
        if (triple.predicate_id === COMMON_IDS.IN) {
          // IN nested : sujet = l'atom qualité (inner.object, ex: fairplay)
          // → crée la chaîne : pseudo → IS → fairplay → IN → BossFighters
          rawSubject = inner.object
            || { term_id: inner.object_id, label: '', type: '', image: null, creator_id: '' };
        } else {
          // Autres nested (IS_PLAYER_OF...) : remonter vers le pseudo via alias
          rawSubject = accountToPseudoMap.get(inner.subject_id)
            || inner.object
            || { term_id: inner.object_id, label: '', type: '', image: null, creator_id: '' };
        }
      } else if (triple.predicate_id === COMMON_IDS.IS && !predefinedSet.has(triple.term_id)) {
        // IS non-nested (ex: account-IS-fairplay) : résoudre vers pseudo via alias
        // Si pas d'alias → filtrer (évite d'afficher l'atom account brut)
        const pseudo = accountToPseudoMap.get(triple.subject_id);
        if (!pseudo) continue;
        rawSubject = pseudo;
      } else if (
        (triple.predicate_id === COMMON_IDS.IS_PLAYER_OF || triple.predicate_id === COMMON_IDS.IN) &&
        !isNested
      ) {
        // IS_PLAYER_OF et IN non-nested → toujours exclus
        continue;
      } else {
        rawSubject = atomsMap.get(triple.subject_id) || { term_id: triple.subject_id, label: '', type: '', image: null, creator_id: '' };
      }

      result.push(transformTripleData({
        term_id: triple.term_id,
        subject: applyVerification(rawSubject),
        predicate: triple.predicate || { term_id: triple.predicate_id, label: '', type: '' },
        object: triple.object || { term_id: '', label: '', type: '', image: null },
      }));
    }

    return result;
  } catch (error) {
    console.error("Error fetching PlayerMap triples:", error);
    return [];
  }
};

// export const fetchAtomIdByCreator = async (creatorAddress, endpoint = "base") => {
//   const client = createClient(endpoint);

//   console.log('🔍 fetchAtomIdByCreator - creatorAddress:', creatorAddress);
//   console.log('🔍 fetchAtomIdByCreator - endpoint:', endpoint);

//   const query = gql`
//     query GetAtomByCreator($creatorAddress: String!) {
//       atoms(where: { creator_id: { _eq: $creatorAddress } }) {
//         term_id
//         label
//         creator_id
//       }
//     }
//   `;

//   const variables = { creatorAddress };
//   console.log('🔍 fetchAtomIdByCreator - variables:', variables);

//   try {
//     const data = await client.request(query, variables);
//     console.log('🔍 fetchAtomIdByCreator - data reçue:', data);
//     console.log('�� fetchAtomIdByCreator - nombre d\'atoms trouvés:', data.atoms.length);

//     if (data.atoms.length > 0) {
//       console.log('�� fetchAtomIdByCreator - premier atom:', data.atoms[0]);
//       return data.atoms[0].term_id;
//     }

//     console.warn('⚠️ fetchAtomIdByCreator - Aucun atom trouvé');
//     return null;
//   } catch (error) {
//     console.error('❌ fetchAtomIdByCreator - Erreur:', error);
//     throw error;
//   }
// };
