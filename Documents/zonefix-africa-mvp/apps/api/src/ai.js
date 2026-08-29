import OpenAI from 'openai';

const SYSTEM = `
Tu es ZoneFix AI, un assistant spécialisé dans le dépannage des Wi-Fi Zones africaines.
Domaines prioritaires: MikroTik, Starlink, LiteBeam/Ubiquiti, PoE et réseau IP.
Tu dois raisonner étape par étape et commencer par les vérifications simples.
Ne propose jamais de modification dangereuse sans avertissement et confirmation.
Quand des données MikroTik sont fournies, distingue clairement: faits observés, hypothèse, test à effectuer, action proposée.
Réponds en français.
`;

function localDiagnosis({ equipment, issue, snapshot = {} }) {
  const text = `${equipment} ${issue}`.toLowerCase();
  let summary = 'Anomalie réseau à investiguer.';
  let steps = [
    'Vérifier l’alimentation et les voyants.',
    'Vérifier l’état du lien WAN.',
    'Vérifier l’adresse IP et la route par défaut.',
    'Tester la résolution DNS.',
    'Tester ensuite l’accès Internet depuis un client.'
  ];
  let confidence = 58;

  if (text.includes('dns')) {
    summary = 'Le symptôme correspond à un problème DNS possible.';
    steps = [
      'Vérifier que le MikroTik possède des serveurs DNS configurés.',
      'Tester une résolution de nom depuis le routeur.',
      'Vérifier que les requêtes DNS des clients sont autorisées.',
      'Retester la navigation depuis un client.'
    ];
    confidence = 84;
  } else if (text.includes('connect') && text.includes('internet')) {
    summary = 'Les clients peuvent être connectés au Wi-Fi mais le chemin vers Internet semble défaillant.';
    steps = [
      'Vérifier le DHCP des clients.',
      'Vérifier la route par défaut.',
      'Vérifier le NAT masquerade.',
      'Tester le WAN puis un DNS.',
      'Comparer les résultats depuis le routeur et depuis un client.'
    ];
    confidence = 76;
  } else if (text.includes('lent') || text.includes('débit')) {
    summary = 'Le débit faible peut provenir du WAN, d’une saturation ou du lien radio.';
    steps = [
      'Mesurer le trafic entrant/sortant.',
      'Vérifier CPU et mémoire du MikroTik.',
      'Vérifier les erreurs d’interface.',
      'Pour un lien radio, vérifier signal, CCQ, bruit et largeur de canal.'
    ];
    confidence = 69;
  }

  const resource = snapshot.resource || {};
  const observed = [];
  if (resource['cpu-load'] !== undefined) observed.push(`CPU: ${resource['cpu-load']}%`);
  if (resource['free-memory'] && resource['total-memory']) observed.push('Mémoire système disponible détectée.');

  return {
    source: 'local-rule-engine',
    summary,
    confidence,
    steps,
    observed,
    warning: 'Les commandes de modification doivent être autorisées explicitement par le propriétaire.'
  };
}

export async function diagnose(input) {
  if (!process.env.OPENAI_API_KEY) return localDiagnosis(input);

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {})
  });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5.6',
    instructions: SYSTEM,
    input: JSON.stringify(input)
  });

  return {
    source: 'openai-responses',
    summary: response.output_text,
    confidence: null,
    steps: [],
    observed: [],
    warning: 'Une action de modification doit être confirmée avant exécution.'
  };
}
