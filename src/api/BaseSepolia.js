import { gql, GraphQLClient } from "graphql-request";

// Hardcoded Endpoints with display names
export const ENDPOINTS = {
  baseSepolia: {
    url: "https://testnet.intuition.sh/v1/graphql",
    displayName: "Intuition Testnet",
  },
  base: {
    url: "https://testnet.intuition.sh/v1/graphql",
    displayName: "Intuition Testnet",
  },
};

// Create GraphQL client based on endpoint
export const createClient = (endpoint) => {
  return new GraphQLClient(ENDPOINTS[endpoint].url);
};

const transformTripleData = (triple) => ({
  id: triple.term_id,
  subject: {
    id: triple.subject.term_id,
    label: triple.subject.label,
    type: triple.subject.type,
    image: triple.subject.image,
  },
  predicate: {
    id: triple.predicate.term_id,
    label: triple.predicate.label,
    type: triple.predicate.type,
  },
  object: {
    id: triple.object.term_id,
    label: triple.object.label,
    type: triple.object.type,
    image: triple.object.image,
  },
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
    return data.atoms[0]; // Retourner le premier atom trouvé
  } catch (error) {
    console.error("Error fetching atom details:", error);
    throw error;
  }
};

// Fetch Triples Details
export const fetchTriples = async (endpoint = "base") => {
  const client = createClient(endpoint);
  let query, data;
  query = gql`
    query {
      triples(limit: 1000) {
        term_id
        subject {
          label
          term_id
          creator_id
          type
          image
        }
        predicate {
          label
          term_id
          creator_id
          type
        }
        object {
          label
          term_id
          creator_id
          type
          image
        }
      }
    }
  `;
  data = await client.request(query);
  return {
    items: data.triples,
  }.items;
};

// Fetch Embedded triples Details
export const fetchTriplesForNode = async (nodeId, endpoint = "base") => {
  const client = createClient(endpoint);
  let query, data, variables;
  query = gql`
    query Triples($where: triples_bool_exp) {
      triples(where: $where) {
        term_id
        subject {
          label
          term_id
          creator_id
          type
          image
        }
        predicate {
          label
          term_id
          creator_id
          type
        }
        object {
          label
          term_id
          creator_id
          type
          image
        }
      }
    }
  `;
  variables = {
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
  data = await client.request(query, variables);

  return data.triples.map(transformTripleData);
};

// Search Triples
export const searchTriples = async (filters, endpoint = "base") => {
  const client = createClient(endpoint);
  const query = gql`
    query SearchTriples($where: triples_bool_exp) {
      triples(where: $where) {
        term_id
        subject {
          label
          term_id
          creator_id
          type
          image
        }
        predicate {
          label
          term_id
          creator_id
          type
        }
        object {
          label
          term_id
          creator_id
          type
          image
        }
      }
    }
  `;

  const where = {
    _and: [],
  };

  if (filters.subject) {
    where._and.push({
      subject: {
        label: {
          _ilike: `%${filters.subject}%`,
        },
      },
    });
  }

  if (filters.predicate) {
    where._and.push({
      predicate: {
        label: {
          _ilike: `%${filters.predicate}%`,
        },
      },
    });
  }

  if (filters.object) {
    where._and.push({
      object: {
        label: {
          _ilike: `%${filters.object}%`,
        },
      },
    });
  }

  const variables = {
    where: where._and.length > 0 ? where : {},
  };

  try {
    const data = await client.request(query, variables);

    return data.triples.map(transformTripleData);
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

  // Requête principale : récupérer les triples où Agent est objet
  const mainQuery = gql`
    query Triples_for_Agent($objectId: String!, $batchSize: Int!) {
      triples(limit: $batchSize, where: { object_id: { _eq: $objectId } }) {
        term_id
        subject {
          term_id
          label
          type
          image
        }
        predicate {
          term_id
          label
          type
          image
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

  // Requête secondaire : récupérer les relations de chaque sujet trouvé
  const relationsQuery = gql`
    query Relations_for_Subject($subjectId: String!) {
      triples(where: { subject_id: { _eq: $subjectId } }) {
        term_id
        subject {
          term_id
          label
          type
          image
        }
        predicate {
          term_id
          label
          type
          image
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

  const variables = {
    batchSize,
    objectId: String(objectId),
  };

  try {
    // 1. Récupérer les triples principaux
    const mainData = await client.request(mainQuery, variables);
    const mainTriples = mainData.triples;

    // 2. Récupérer les relations de chaque sujet
    const subjectIds = [...new Set(mainTriples.map(triple => triple.subject.term_id))];

    const relationsPromises = subjectIds.map(subjectId =>
      client.request(relationsQuery, { subjectId })
    );

    const relationsResults = await Promise.all(relationsPromises);
    const allRelations = relationsResults.flatMap(result => result.triples);

    // 3. Combiner et transformer les données
    const allTriples = [...mainTriples, ...allRelations];

    return allTriples.map(transformTripleData);

  } catch (error) {
    console.error("Error fetching agent-specific triples:", error);
    // En cas d'erreur, essayer une approche alternative
    return fetchTriples(endpoint)
      .then((triples) => {
        return triples.filter(
          (triple) =>
            triple.subject.term_id === objectId ||
            triple.object.term_id === objectId ||
            triple.predicate.term_id === objectId
        );
      })
      .catch((fallbackError) => {
        console.error("Fallback fetch also failed:", fallbackError);
        throw error;
      });
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
