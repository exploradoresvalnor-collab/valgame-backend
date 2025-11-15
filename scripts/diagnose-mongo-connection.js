#!/usr/bin/env node
require('dotenv').config();
const dns = require('dns').promises;
const net = require('net');
const { URL } = require('url');
const mongoose = require('mongoose');

function shortLog(...args) {
  console.log('[diag]', ...args);
}

function timeoutPromise(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function checkTcp(host, port = 27017, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      done = true;
      socket.destroy();
      resolve({ ok: true });
    });
    socket.once('timeout', () => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve({ ok: false, reason: 'timeout' });
    });
    socket.once('error', (err) => {
      if (done) return;
      done = true;
      resolve({ ok: false, reason: err.message });
    });
    socket.connect(port, host);
  });
}

async function resolveSrvAndHosts(srvBase) {
  try {
    const srvName = `_mongodb._tcp.${srvBase}`;
    shortLog('Resolving SRV', srvName);
    const records = await dns.resolveSrv(srvName);
    const hosts = [];
    for (const r of records) {
      hosts.push({ host: r.name, port: r.port });
    }
    return { ok: true, hosts };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function resolveA(host) {
  try {
    const addrs = await dns.resolve(host);
    return { ok: true, addrs };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: no hay `MONGODB_URI` en el entorno. Ponla y vuelve a ejecutar.');
    console.error('Ejemplo: export MONGODB_URI="mongodb+srv://user:pass@cluster0.example.net/dbname"');
    process.exit(1);
  }

  shortLog('MONGODB_URI (hidden) present. Analizando...');

  // parse minimal to extract host(s)
  try {
    if (uri.startsWith('mongodb+srv://')) {
      // extract host after @ and before /
      const afterAt = uri.split('@')[1] || uri.replace('mongodb+srv://', '');
      const hostPart = afterAt.split('/')[0];
      const srvBase = hostPart.split(':')[0];
      shortLog('Detected SRV connection to', srvBase);

      const srv = await resolveSrvAndHosts(srvBase);
      if (!srv.ok) {
        console.error('SRV lookup failed:', srv.error);
      } else {
        shortLog('SRV records:', srv.hosts.map(h=>`${h.host}:${h.port}`).join(', '));
        for (const h of srv.hosts) {
          const r = await resolveA(h.host);
          if (!r.ok) shortLog(`DNS A lookup ${h.host} failed:`, r.error);
          else shortLog(`DNS A ${h.host}:`, r.addrs.join(', '));
          shortLog(`TCP ${h.host}:${h.port} ->`, (await checkTcp(h.host, h.port)).ok ? 'OK' : 'FAIL');
        }
      }
    } else if (uri.startsWith('mongodb://')) {
      // parse host list
      const middle = uri.replace('mongodb://', '');
      const afterAt = middle.includes('@') ? middle.split('@')[1] : middle;
      const hostPart = afterAt.split('/')[0];
      const hosts = hostPart.split(',');
      shortLog('Detected direct hosts:', hosts.join(', '));
      for (const h of hosts) {
        const [hostOnly, port] = h.split(':');
        const portNum = port ? parseInt(port,10) : 27017;
        const r = await resolveA(hostOnly);
        if (!r.ok) shortLog(`DNS A lookup ${hostOnly} failed:`, r.error);
        else shortLog(`DNS A ${hostOnly}:`, r.addrs.join(', '));
        shortLog(`TCP ${hostOnly}:${portNum} ->`, (await checkTcp(hostOnly, portNum)).ok ? 'OK' : 'FAIL');
      }
    } else {
      console.error('Cadena MONGODB_URI con formato desconocido. Debe empezar por mongodb:// o mongodb+srv://');
    }
  } catch (err) {
    console.error('Error al analizar MONGODB_URI:', err.message);
  }

  shortLog('Intentando conexión rápida con Mongoose (timeout 5s)...');
  try {
    // intenta conectar con timeout corto
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    shortLog('Conexión Mongoose: OK');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Conexión Mongoose fallida:', err.message);
  }

  shortLog('Diagnóstico finalizado. Si tienes conectividad inestable, repite varias veces desde tu red.');
}

run();
