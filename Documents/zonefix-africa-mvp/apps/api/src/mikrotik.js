import { Routeros } from 'routeros-node';

function normalize(rows) {
  return Array.isArray(rows) ? rows : [];
}

async function withRouter(config, fn) {
  const router = new Routeros({
    host: config.host,
    port: Number(config.port || 8728),
    user: config.username,
    password: config.password
  });

  try {
    const conn = await router.connect();
    return await fn(conn);
  } finally {
    try { router.destroy(); } catch {}
  }
}

async function print(conn, command) {
  return normalize(await conn.write([command]));
}

export async function testConnection(config) {
  const result = await withRouter(config, async (conn) => {
    const resource = await print(conn, '/system/resource/print');
    const identity = await print(conn, '/system/identity/print');
    return {
      online: true,
      resource: resource[0] || {},
      identity: identity[0] || {}
    };
  });
  return result;
}

export async function collectSnapshot(config) {
  return withRouter(config, async (conn) => {
    const safe = async (command) => {
      try { return await print(conn, command); } catch { return []; }
    };

    const [resource, identity, interfaces, routes, dhcp, dns, nat, hotspot] = await Promise.all([
      safe('/system/resource/print'),
      safe('/system/identity/print'),
      safe('/interface/print'),
      safe('/ip/route/print'),
      safe('/ip/dhcp-client/print'),
      safe('/ip/dns/print'),
      safe('/ip/firewall/nat/print'),
      safe('/ip/hotspot/active/print')
    ]);

    const r = resource[0] || {};
    return {
      identity: identity[0] || {},
      resource: r,
      interfaces,
      routes,
      dhcp,
      dns,
      nat,
      hotspot,
      clients: hotspot.length,
      capturedAt: new Date().toISOString()
    };
  });
}

/**
 * Only whitelisted remote actions are allowed.
 * Never expose arbitrary RouterOS command execution through an HTTP endpoint.
 */
export async function runSafeAction(config, action) {
  return withRouter(config, async (conn) => {
    switch (action.type) {
      case 'reboot':
        return conn.write(['/system/reboot']);
      case 'disable_hotspot_user':
        if (!action.id) throw new Error('Identifiant utilisateur manquant');
        return conn.write(['/ip/hotspot/user/disable', `=.id=${action.id}`]);
      case 'enable_hotspot_user':
        if (!action.id) throw new Error('Identifiant utilisateur manquant');
        return conn.write(['/ip/hotspot/user/enable', `=.id=${action.id}`]);
      default:
        throw new Error('Action MikroTik non autorisée');
    }
  });
}
