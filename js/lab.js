/* n8n Workflow Simulator: runs a workflow described in YAML the way n8n does: items flow
   through nodes, {{ expressions }} are evaluated per item, If/Switch have several outputs,
   Merge waits for its inputs, HTTP Request calls a set of mock APIs, errors can stop the
   run, continue, or go to an error output. Everything runs in your browser; nothing is sent anywhere. */
window.N8N = (function () {
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const clone = v => v === undefined ? v : JSON.parse(JSON.stringify(v));
  class WErr extends Error { constructor(msg, node) { super(msg); this.node = node; } }

  /* ---------- node type names (n8n display names and short names) ---------- */
  const ALIAS = {
    manual: 'manual', manualtrigger: 'manual', "when clicking 'execute workflow'": 'manual',
    webhook: 'webhook', schedule: 'schedule', scheduletrigger: 'schedule', cron: 'schedule',
    form: 'webhook', formtrigger: 'webhook', chattrigger: 'webhook',
    executeworkflowtrigger: 'subtrigger', subtrigger: 'subtrigger',
    set: 'set', editfields: 'set', 'edit fields': 'set', 'edit fields (set)': 'set',
    filter: 'filter', if: 'if', switch: 'switch', merge: 'merge', sort: 'sort', limit: 'limit',
    removeduplicates: 'dedupe', 'remove duplicates': 'dedupe', dedupe: 'dedupe',
    splitout: 'splitout', 'split out': 'splitout', aggregate: 'aggregate', summarize: 'summarize',
    code: 'code', http: 'http', httprequest: 'http', 'http request': 'http',
    respond: 'respond', respondtowebhook: 'respond', 'respond to webhook': 'respond',
    noop: 'noop', 'no operation': 'noop', wait: 'noop', stickynote: 'noop',
    stopanderror: 'stop', 'stop and error': 'stop', stop: 'stop',
    executeworkflow: 'execwf', 'execute workflow': 'execwf', 'execute sub-workflow': 'execwf',
    agent: 'agent', aiagent: 'agent', 'ai agent': 'agent',
    vectorstore: 'vector', 'vector store': 'vector', vector: 'vector',
    loopoveritems: 'loop', splitinbatches: 'loop', 'loop over items': 'loop'
  };
  const TRIGGERS = ['manual', 'webhook', 'schedule', 'subtrigger'];
  const MULTI_OUT = { if: ['true', 'false'], loop: ['done', 'loop'] };

  /* ---------- fixed clock so runs are repeatable ---------- */
  const NOW = new Date('2026-11-14T09:00:00+08:00');
  function dt(d) {
    const pad = n => String(n).padStart(2, '0');
    const local = new Date(d.getTime() + 8 * 3600e3);
    const iso = local.toISOString().slice(0, 19) + '+08:00';
    return {
      toISO: () => iso, toISODate: () => iso.slice(0, 10), toString: () => iso, toJSON: () => iso, valueOf: () => d.getTime(),
      toFormat: f => f.replace('yyyy', local.getUTCFullYear()).replace('MM', pad(local.getUTCMonth() + 1)).replace('dd', pad(local.getUTCDate())).replace('HH', pad(local.getUTCHours())).replace('mm', pad(local.getUTCMinutes())),
      plus: o => dt(new Date(d.getTime() + ((o.days || 0) * 864e5) + ((o.hours || 0) * 36e5) + ((o.minutes || 0) * 6e4))),
      minus: o => dt(new Date(d.getTime() - ((o.days || 0) * 864e5) - ((o.hours || 0) * 36e5) - ((o.minutes || 0) * 6e4))),
      weekday: ((local.getUTCDay() + 6) % 7) + 1, hour: local.getUTCHours()
    };
  }

  /* ---------- expressions: {{ ... }} ---------- */
  function evalExpr(src, ctx, node) {
    try {
      const f = new Function('$json', '$input', '$', '$now', '$today', '$execution', '$workflow', '$env', '$runIndex', '$itemIndex', '"use strict"; return (' + src + ');');
      return f(ctx.$json, ctx.$input, ctx.$, ctx.$now, ctx.$today, ctx.$execution, ctx.$workflow, ctx.$env, 0, ctx.$itemIndex);
    } catch (e) {
      if (e instanceof WErr) throw e;
      throw new WErr(`Expression error in {{ ${src.trim()} }}: ${e.message}`, node);
    }
  }
  function resolve(v, ctx, node) {
    if (typeof v === 'string') {
      const m = v.match(/^\s*\{\{([\s\S]*?)\}\}\s*$/);
      if (m && v.indexOf('{{', 2) < 0) return evalExpr(m[1], ctx, node);
      if (v.indexOf('{{') < 0) return v.startsWith('=') ? resolve(v.slice(1), ctx, node) : v;
      return v.replace(/\{\{([\s\S]*?)\}\}/g, (_, e) => { const r = evalExpr(e, ctx, node); return r === undefined || r === null ? '' : (typeof r === 'object' ? JSON.stringify(r) : String(r)); });
    }
    if (Array.isArray(v)) return v.map(x => resolve(x, ctx, node));
    if (isObj(v)) { const o = {}; for (const k in v) o[k] = resolve(v[k], ctx, node); return o; }
    return v;
  }
  function setPath(obj, path, val) { const ks = String(path).split('.'); let o = obj; ks.slice(0, -1).forEach(k => { if (!isObj(o[k])) o[k] = {}; o = o[k]; }); o[ks[ks.length - 1]] = val; }
  function getPath(obj, path) { return String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj); }

  /* ---------- mock APIs for the HTTP Request node ---------- */
  const DB = {
    customers: { 1: { id: 1, name: 'Ana Reyes', email: 'ana@bakeshop.ph', plan: 'pro', city: 'Tuguegarao' }, 2: { id: 2, name: 'Ben Cruz', email: 'ben@hardware.ph', plan: 'free', city: 'Manila' }, 3: { id: 3, name: 'Carla Lim', email: 'carla@clinic.ph', plan: 'pro', city: 'Cebu' } },
    orders: [{ id: 101, customer_id: 1, total: 2500, status: 'paid' }, { id: 102, customer_id: 2, total: 480, status: 'pending' }, { id: 103, customer_id: 1, total: 1200, status: 'paid' }, { id: 104, customer_id: 3, total: 9800, status: 'paid' }, { id: 105, customer_id: 2, total: 150, status: 'refunded' }]
  };
  function api(req, state) {
    const u = new URL(req.url); const host = u.host, p = u.pathname, q = Object.fromEntries(u.searchParams);
    const auth = (req.headers || {})['Authorization'] || (req.headers || {})['authorization'] || '';
    if (host === 'api.shop.example') {
      let m;
      if (req.method === 'GET' && (m = p.match(/^\/customers\/(\d+)$/))) { const c = DB.customers[m[1]]; return c ? [200, clone(c)] : [404, { error: 'customer not found' }]; }
      if (req.method === 'GET' && p === '/orders') {
        const page = +(q.page || 1), per = +(q.limit || 2); const rows = DB.orders.slice((page - 1) * per, page * per);
        return [200, { data: clone(rows), page, next_page: page * per < DB.orders.length ? page + 1 : null }];
      }
      if (req.method === 'GET' && p === '/flaky') { state.flaky = (state.flaky || 0) + 1; return state.flaky < 3 ? [503, { error: 'Service Unavailable' }] : [200, { ok: true, attempt: state.flaky }]; }
      if (req.method === 'GET' && p === '/rates') return [200, { base: 'USD', PHP: 58.2, EUR: 0.92 }];
      return [404, { error: `no route ${req.method} ${p}` }];
    }
    if (host === 'crm.example') {
      if (!/^Bearer \S+/.test(auth)) return [401, { error: 'Unauthorized: missing Bearer token' }];
      if (req.method === 'POST' && p === '/contacts') { const b = req.body || {}; if (!b.email) return [422, { error: 'email is required' }]; return [201, { id: 'c_' + (state.crm = (state.crm || 0) + 1), ...clone(b) }]; }
      if (req.method === 'GET' && p === '/contacts') { const e = q.email; return [200, { results: e === 'ana@bakeshop.ph' ? [{ id: 'c_9', email: e, owner: 'raul' }] : [] }]; }
      return [404, { error: 'no route' }];
    }
    if (host === 'hooks.slack.example') return req.method === 'POST' && (req.body || {}).text ? [200, { ok: true }] : [400, { ok: false, error: 'no_text' }];
    if (host === 'mail.example' && req.method === 'POST') return (req.body || {}).to ? [202, { queued: true }] : [400, { error: 'to is required' }];
    return [502, { error: `cannot reach ${host} (only the lab's mock APIs exist: api.shop.example, crm.example, hooks.slack.example, mail.example)` }];
  }

  /* ---------- mock AI model (deterministic, so challenges are checkable) ---------- */
  const KW = {
    billing: ['invoice', 'refund', 'charged', 'charge', 'payment', 'billing', 'receipt', 'overcharged'],
    technical: ['error', 'bug', 'login', 'crash', 'down', "can't", 'cannot', 'broken', 'password'],
    sales: ['price', 'pricing', 'demo', 'quote', 'buy', 'plan', 'upgrade', 'discount']
  };
  function aiThink(text, schema) {
    const t = String(text || '').toLowerCase(); const out = {};
    const inj = /ignore (all )?(previous|prior|your) instructions|system prompt|you are now/.test(t);
    const score = k => KW[k].reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
    const cat = inj ? 'needs_review' : (['billing', 'technical', 'sales'].map(k => [k, score(k)]).sort((a, b) => b[1] - a[1])[0][1] ? ['billing', 'technical', 'sales'].map(k => [k, score(k)]).sort((a, b) => b[1] - a[1])[0][0] : 'other');
    const urgent = /urgent|asap|immediately|down|angry|!!/.test(t);
    const sentiment = /angry|terrible|worst|disappointed|!!/.test(t) ? 'negative' : /thank|great|love|salamat/.test(t) ? 'positive' : 'neutral';
    const fields = { category: cat, urgency: urgent ? 'high' : 'low', sentiment, summary: String(text || '').replace(/\s+/g, ' ').slice(0, 80) };
    if (!schema) return `Category: ${cat}. Urgency: ${fields.urgency}. ${fields.summary}`;
    (Array.isArray(schema) ? schema : Object.keys(schema)).forEach(k => {
      let v = fields[k]; const allowed = isObj(schema) ? schema[k] : null;
      if (Array.isArray(allowed) && !allowed.includes(v) && v !== 'needs_review') v = allowed.includes('other') ? 'other' : allowed[allowed.length - 1];
      out[k] = v;
    });
    return out;
  }

  /* ---------- tiny vector store for RAG lessons ---------- */
  const words = s => String(s).toLowerCase().match(/[a-z0-9]+/g) || [];
  function chunk(text, size, overlap) { const w = words(text); const out = []; for (let i = 0; i < w.length; i += Math.max(1, size - overlap)) { out.push(w.slice(i, i + size).join(' ')); if (i + size >= w.length) break; } return out; }
  function sim(a, b) { const A = new Set(words(a)), B = words(b); if (!A.size || !B.length) return 0; let n = 0; B.forEach(x => { if (A.has(x)) n++; }); return n / Math.sqrt(A.size * B.length); }

  /* ---------- parse the YAML workflow ---------- */
  function parse(text) {
    let wf;
    try { wf = YAML.parse(String(text)); } catch (e) { throw new WErr('YAML error: ' + e.message); }
    if (!isObj(wf) || !Array.isArray(wf.nodes) || !wf.nodes.length) throw new WErr('A workflow needs a nodes: list (each node has a name and a type)');
    return normalize(wf);
  }
  function normalize(wf, label) {
    const nodes = {}, order = [];
    wf.nodes.forEach((n, i) => {
      if (!isObj(n) || !n.name) throw new WErr(`${label ? label + ': ' : ''}node #${i + 1} needs a name`);
      const t = ALIAS[String(n.type || '').toLowerCase()];
      if (!t) throw new WErr(`Unknown node type "${n.type}" on "${n.name}". Known: ${[...new Set(Object.values(ALIAS))].join(', ')}`);
      if (nodes[n.name]) throw new WErr(`Two nodes are named "${n.name}". Node names must be unique.`);
      nodes[n.name] = Object.assign({}, n, { type: t }); order.push(n.name);
    });
    const conns = (wf.connections || []).map(c => {
      if (isObj(c)) { const k = Object.keys(c)[0]; c = k + ':' + c[k]; }
      const m = String(c).match(/^\s*(.+?)\s*->\s*(.+?)\s*$/);
      if (!m) throw new WErr(`Bad connection "${c}". Use "From -> To", "If:true -> To", "Switch:billing -> To", "Merge input: A -> Merge:2"`);
      const [from, fo] = splitPort(m[1]), [to, ti] = splitPort(m[2]);
      if (!nodes[from]) throw new WErr(`Connection "${c}": no node named "${from}"`);
      if (!nodes[to]) throw new WErr(`Connection "${c}": no node named "${to}"`);
      return { from, out: fo, to, in: ti ? +ti : 1 };
    });
    return { nodes, order, conns, sub: wf.subworkflows || {}, name: wf.name || 'My workflow' };
  }
  function splitPort(s) { const i = s.lastIndexOf(':'); if (i > 0 && !/\s/.test(s.slice(i + 1)) && s.slice(i + 1).length) return [s.slice(0, i).trim(), s.slice(i + 1).trim()]; return [s.trim(), null]; }
  function outIndex(node, port) {
    if (port == null || port === '' ) return 0;
    if (port === 'error') return 'error';
    if (/^\d+$/.test(port)) return +port;
    const names = MULTI_OUT[node.type] || (node.type === 'switch' ? (node.rules || []).map((r, i) => String(r.output || i)).concat(['fallback']) : []);
    const i = names.indexOf(port);
    if (i < 0) throw new WErr(`"${node.name}" has no output named "${port}" (outputs: ${names.join(', ') || 'main'})`, node.name);
    return i;
  }

  /* ---------- run ---------- */
  function run(text, opts) {
    opts = opts || {};
    const res = { ok: false, error: null, errorNode: null, runs: {}, order: [], calls: [], response: null, logs: [], ai: [] };
    let wf;
    res.text = String(text); res.conns = []; res.nodes = {};
    try { wf = parse(text); } catch (e) { res.error = e.message; return finish(res); }
    res.conns = wf.conns; res.nodes = wf.nodes;
    res.linked = (from, port, toType) => wf.conns.some(c => c.from === from && (port == null || c.out === port) && (!toType || wf.nodes[c.to].type === toType || c.to === toType));
    const state = {};
    try { execute(wf, null, res, state, opts); res.ok = true; }
    catch (e) { res.error = e.message; res.errorNode = e.node || null; }
    return finish(res);
  }
  function finish(res) {
    res.out = (name, i) => ((res.runs[name] || {}).outputs || [])[i || 0] ? res.runs[name].outputs[i || 0].map(x => x.json) : [];
    res.ran = name => !!(res.runs[name] && !res.runs[name].skipped);
    res.http = (host) => res.calls.filter(c => !host || c.url.includes(host));
    return res;
  }

  function execute(wf, inputItems, res, state, opts, prefix) {
    const P = prefix || '';
    const incoming = {}; wf.order.forEach(n => incoming[n] = {});
    const inc = {}; wf.conns.forEach(c => { (inc[c.to] = inc[c.to] || []).push(c); });
    const trig = wf.order.filter(n => TRIGGERS.includes(wf.nodes[n].type));
    if (!trig.length) throw new WErr('The workflow has no trigger node (manual, webhook, schedule or an Execute Workflow Trigger)');
    const done = {}; const outputs = {};
    // topological order from the order nodes were listed, respecting connections
    const pending = new Set(wf.order); let guard = 0, lastItems = [];
    while (pending.size && guard++ < 500) {
      let progressed = false;
      for (const name of wf.order) {
        if (!pending.has(name)) continue;
        const ins = (inc[name] || []);
        if (ins.some(c => !done[c.from])) continue;          // wait for every upstream node
        pending.delete(name); progressed = true;
        const node = wf.nodes[name];
        let items;
        if (TRIGGERS.includes(node.type) && !ins.length) {
          if (node.type === 'subtrigger' && !inputItems) { done[name] = true; outputs[name] = [[]]; res.runs[P + name] = { skipped: true, outputs: [[]] }; continue; }
          if (trig.length > 1 && node.type !== 'subtrigger' && opts.trigger && opts.trigger !== name) { done[name] = true; outputs[name] = [[]]; res.runs[P + name] = { skipped: true, outputs: [[]] }; continue; }
          items = startItems(node, inputItems, res);
        } else {
          const byIn = {};
          ins.forEach(c => { const o = (outputs[c.from] || [])[c.out === 'error' ? 'error' : outIndex(wf.nodes[c.from], c.out)] || []; (byIn[c.in] = byIn[c.in] || []).push(...o); });
          if (node.type === 'merge') items = byIn;
          else items = [].concat(...Object.values(byIn));
          const total = node.type === 'merge' ? Object.values(byIn).reduce((n, a) => n + a.length, 0) : items.length;
          if (!total && !node.always_output) { done[name] = true; outputs[name] = [[]]; res.runs[P + name] = { skipped: true, input: 0, outputs: [[]] }; continue; }
        }
        let out;
        const perItem = ['continue', 'output'].includes(node.on_error) && Array.isArray(items) && !['merge', 'aggregate', 'summarize', 'sort', 'limit', 'dedupe', 'loop'].includes(node.type) && !(node.type === 'code' && (node.mode || 'all') === 'all');
        if (perItem) {
          // like n8n: each item succeeds or fails on its own; failed items go to the error output (or continue as data)
          out = null; const errs = [];
          items.forEach(it => {
            try { const o = runNode(node, [it], wf, outputs, res, state, opts, P); if (!out) out = o.map(() => []); o.forEach((arr, k) => { (out[k] = out[k] || []).push(...arr); }); }
            catch (e) { const ej = Object.assign({}, node.on_error === 'output' ? it.json : {}, { error: e.message, node: name }); if (node.on_error === 'output') errs.push({ json: ej }); else { if (!out) out = [[]]; out[0].push({ json: ej }); } }
          });
          out = out || [[]]; if (node.on_error === 'output') out.error = errs;
        } else
        try { out = runNode(node, items, wf, outputs, res, state, opts, P); }
        catch (e) {
          const mode = node.on_error || 'stop';
          const err = { error: e.message, node: name };
          if (mode === 'continue') out = [(Array.isArray(items) ? items : []).map(() => ({ json: clone(err) }))];
          else if (mode === 'output') { out = [[]]; out.error = (Array.isArray(items) ? items : [{}]).map(it => ({ json: Object.assign({}, it.json, err) })); }
          else { res.runs[P + name] = { input: Array.isArray(items) ? items.length : 0, outputs: [[]], error: e.message }; res.order.push(P + name); throw e instanceof WErr ? Object.assign(e, { node: e.node || name }) : new WErr(e.message, name); }
        }
        outputs[name] = out; done[name] = true;
        res.runs[P + name] = { input: Array.isArray(items) ? items.length : Object.values(items).reduce((n, a) => n + a.length, 0), outputs: out.map(o => o.map(x => ({ json: x.json }))), errorOut: out.error ? out.error.map(x => ({ json: x.json })) : undefined };
        res.order.push(P + name);
        if (out[0] && out[0].length) lastItems = out[0];
      }
      if (!progressed) break;
    }
    if (pending.size) throw new WErr('Some nodes could never run (check for loops or missing connections): ' + [...pending].join(', '));
    return lastItems;
  }

  function startItems(node, inputItems, res) {
    if (node.type === 'subtrigger') return inputItems.map(x => ({ json: clone(x.json) }));
    if (node.type === 'webhook') {
      const r = node.request || node.test_request || {};
      const list = Array.isArray(r) ? r : [r];
      return list.map(x => ({ json: { headers: clone(x.headers || {}), params: {}, query: clone(x.query || {}), body: clone(x.body !== undefined ? x.body : {}) } }));
    }
    if (node.type === 'schedule') return [{ json: { timestamp: dt(NOW).toISO(), 'Readable date': 'November 14th 2026, 9:00:00 am', 'Day of week': 'Saturday', Timezone: 'Asia/Manila (UTC+08:00)' } }];
    const it = node.items || node.data || node.output;
    if (Array.isArray(it)) return it.map(x => ({ json: isObj(x) ? clone(x) : { value: x } }));
    if (isObj(it)) return [{ json: clone(it) }];
    return [{ json: {} }];
  }

  function makeCtx(items, i, outputs, wf, node) {
    const it = items[i] || { json: {} };
    const ref = name => {
      if (!(name in wf.nodes)) throw new WErr(`Referenced node "${name}" doesn't exist`, node.name);
      const o = (outputs[name] || [[]])[0] || [];
      if (!outputs[name]) throw new WErr(`Referenced node "${name}" hasn't run yet (it must be before "${node.name}" on the same path)`, node.name);
      return { item: { json: (o[i] || o[0] || { json: {} }).json }, first: () => ({ json: (o[0] || { json: {} }).json }), last: () => ({ json: (o[o.length - 1] || { json: {} }).json }), all: () => o.map(x => ({ json: x.json })), json: (o[i] || o[0] || { json: {} }).json };
    };
    return {
      $json: it.json, $itemIndex: i,
      $input: { item: { json: it.json }, all: () => items.map(x => ({ json: x.json })), first: () => ({ json: (items[0] || { json: {} }).json }), last: () => ({ json: (items[items.length - 1] || { json: {} }).json }) },
      $: ref, $now: dt(NOW), $today: dt(new Date('2026-11-14T00:00:00+08:00')),
      $execution: { id: 'exec_812', mode: 'manual' }, $workflow: { name: wf.name, active: false },
      $env: new Proxy({}, { get() { throw new WErr('access to env vars denied (n8n 2.x blocks $env in expressions and Code by default)', node.name); } })
    };
  }
  const truthy = v => !(v === false || v === 0 || v === '' || v === null || v === undefined || v === 'false');
  function cond(node, items, i, outputs, wf) {
    const ctx = makeCtx(items, i, outputs, wf, node);
    const list = node.conditions || (node.condition !== undefined ? [node.condition] : null);
    if (!list) throw new WErr(`"${node.name}" needs condition: "{{ … }}" (or conditions: [ … ])`, node.name);
    const vals = [].concat(list).map(c => truthy(resolve(c, ctx, node.name)));
    return (node.combine || 'and') === 'or' ? vals.some(Boolean) : vals.every(Boolean);
  }

  function runNode(node, items, wf, outputs, res, state, opts, P) {
    const N = node.name; const each = fn => items.map((it, i) => fn(it, i, makeCtx(items, i, outputs, wf, node)));
    switch (node.type) {
      case 'manual': case 'webhook': case 'schedule': case 'subtrigger': case 'noop':
        return [items.map(x => ({ json: clone(x.json) }))];
      case 'set': {
        if (!isObj(node.fields) && !Array.isArray(node.fields)) throw new WErr(`"${N}" needs fields: (name: value or "{{ expression }}")`, N);
        const fields = Array.isArray(node.fields) ? Object.assign({}, ...node.fields) : node.fields;
        return [each((it, i, ctx) => { const j = node.include_other ? clone(it.json) : {}; for (const k in fields) setPath(j, k, resolve(fields[k], ctx, N)); return { json: j }; })];
      }
      case 'filter': return [items.filter((it, i) => cond(node, items, i, outputs, wf)).map(x => ({ json: clone(x.json) }))];
      case 'if': { const t = [], f = []; items.forEach((it, i) => (cond(node, items, i, outputs, wf) ? t : f).push({ json: clone(it.json) })); return [t, f]; }
      case 'switch': {
        const rules = node.rules || []; if (!rules.length) throw new WErr(`"${N}" needs rules: (each with output and condition)`, N);
        const outs = rules.map(() => []).concat([[]]);
        items.forEach((it, i) => { const ctx = makeCtx(items, i, outputs, wf, node); let hit = false;
          for (let r = 0; r < rules.length; r++) { if (truthy(resolve(rules[r].condition, ctx, N))) { outs[r].push({ json: clone(it.json) }); hit = true; if (!node.all_matching) break; } }
          if (!hit && node.fallback !== 'none') outs[rules.length].push({ json: clone(it.json) }); });
        return outs;
      }
      case 'merge': {
        const a = items[1] || [], b = items[2] || []; const mode = node.mode || 'append';
        if (mode === 'append') return [a.concat(b).map(x => ({ json: clone(x.json) }))];
        if (mode === 'combine' || mode === 'combineByFields' || mode === 'match') {
          const f1 = node.field1 || node.field, f2 = node.field2 || node.field; if (!f1) throw new WErr(`"${N}" (combine) needs field: (or field1 / field2)`, N);
          const out = []; a.forEach(x => { const y = b.find(y => getPath(y.json, f2) === getPath(x.json, f1)); if (y) out.push({ json: Object.assign({}, clone(x.json), clone(y.json)) }); else if (node.keep_unmatched) out.push({ json: clone(x.json) }); });
          return [out];
        }
        if (mode === 'position') return [a.map((x, i) => ({ json: Object.assign({}, clone(x.json), clone((b[i] || { json: {} }).json)) }))];
        if (mode === 'chooseBranch') return [(node.output === 2 ? b : a).map(x => ({ json: clone(x.json) }))];
        throw new WErr(`"${N}": unknown merge mode "${mode}" (append, combine, position, chooseBranch)`, N);
      }
      case 'sort': { const f = node.field; if (!f) throw new WErr(`"${N}" needs field:`, N); const d = (node.order || 'asc') === 'desc' ? -1 : 1;
        return [items.map(x => ({ json: clone(x.json) })).sort((x, y) => { const p = getPath(x.json, f), q = getPath(y.json, f); return (p > q ? 1 : p < q ? -1 : 0) * d; })]; }
      case 'limit': return [items.slice(node.from === 'end' ? -(+node.max || 1) : 0, node.from === 'end' ? undefined : (+node.max || 1)).map(x => ({ json: clone(x.json) }))];
      case 'dedupe': { const seen = new Set(); return [items.filter(x => { const k = node.field ? JSON.stringify(getPath(x.json, node.field)) : JSON.stringify(x.json); if (seen.has(k)) return false; seen.add(k); return true; }).map(x => ({ json: clone(x.json) }))]; }
      case 'splitout': { const f = node.field; if (!f) throw new WErr(`"${N}" needs field: (the list to split)`, N); const out = [];
        items.forEach(x => { const arr = getPath(x.json, f); if (!Array.isArray(arr)) throw new WErr(`"${N}": field "${f}" is not a list`, N);
          arr.forEach(v => { const base = node.include ? Object.assign({}, clone(x.json)) : {}; if (node.include) delete base[f.split('.')[0]]; out.push({ json: isObj(v) ? Object.assign(base, clone(v)) : Object.assign(base, { [f.split('.').pop()]: v }) }); }); });
        return [out]; }
      case 'aggregate': {
        if (node.all || !node.field) return [[{ json: { [node.output || 'data']: items.map(x => clone(x.json)) } }]];
        const fs = [].concat(node.field); const j = {}; fs.forEach(f => { j[node.output && fs.length === 1 ? node.output : f.split('.').pop()] = items.map(x => getPath(x.json, f)).filter(v => v !== undefined); });
        return [[{ json: j }]];
      }
      case 'summarize': {
        const by = node.split_by, groups = {}; items.forEach(x => { const k = by ? getPath(x.json, by) : '_all'; (groups[k] = groups[k] || []).push(x.json); });
        return [Object.entries(groups).map(([k, g]) => { const j = by ? { [by]: g[0][by] } : {}; [].concat(node.sum || []).forEach(f => j['sum_' + f] = g.reduce((n, r) => n + (+getPath(r, f) || 0), 0)); [].concat(node.count || []).forEach(f => j['count_' + f] = g.filter(r => getPath(r, f) !== undefined).length); if (!node.sum && !node.count) j.count = g.length; return { json: j }; })];
      }
      case 'code': return [runCode(node, items, wf, outputs)];
      case 'http': {
        const out = [];
        items.forEach((it, i) => {
          const ctx = makeCtx(items, i, outputs, wf, node);
          const req = { method: String(resolve(node.method || 'GET', ctx, N)).toUpperCase(), url: resolve(node.url, ctx, N), headers: resolve(node.headers || {}, ctx, N), body: node.body !== undefined ? resolve(node.body, ctx, N) : undefined, query: resolve(node.query || {}, ctx, N) };
          if (!req.url) throw new WErr(`"${N}" needs url:`, N);
          try { const u = new URL(req.url); Object.entries(req.query).forEach(([k, v]) => u.searchParams.set(k, v)); req.url = u.toString(); } catch (e) { throw new WErr(`"${N}": invalid URL "${req.url}"`, N); }
          if (node.credential) { const c = (opts.credentials || {})[node.credential]; if (!c) throw new WErr(`"${N}": credential "${node.credential}" not found (add it under credentials:)`, N); req.headers = Object.assign({}, req.headers, c); }
          const tries = node.retry ? Math.max(1, +node.retry) : 1; let st, body, attempt = 0;
          while (attempt < tries) { attempt++; [st, body] = api(req, state); res.calls.push({ node: P + N, method: req.method, url: req.url, headers: req.headers, body: req.body, status: st, attempt }); if (st < 500 && st !== 429) break; }
          if (st >= 400) throw new WErr(`"${N}": ${req.method} ${req.url} → ${st} ${JSON.stringify(body)}${tries > 1 ? ` (after ${attempt} tries)` : ''}`, N);
          if (node.split && Array.isArray(getPath(body, node.split))) getPath(body, node.split).forEach(r => out.push({ json: r }));
          else out.push({ json: body });
        });
        return [out];
      }
      case 'respond': {
        const ctx = makeCtx(items, 0, outputs, wf, node);
        res.response = { status: +(node.code || 200), body: node.body !== undefined ? resolve(node.body, ctx, N) : (items[0] || { json: {} }).json };
        return [items.map(x => ({ json: clone(x.json) }))];
      }
      case 'stop': { const ctx = makeCtx(items, 0, outputs, wf, node); throw new WErr(String(resolve(node.message || 'Workflow stopped', ctx, N)), N); }
      case 'execwf': {
        const sub = wf.sub[node.workflow]; if (!sub) throw new WErr(`"${N}": sub-workflow "${node.workflow}" not found under subworkflows:`, N);
        const swf = normalize(sub, node.workflow); if (!swf.order.some(n => swf.nodes[n].type === 'subtrigger')) throw new WErr(`Sub-workflow "${node.workflow}" must start with an Execute Workflow Trigger (type: subtrigger)`, N);
        const out = execute(swf, items.map(x => ({ json: clone(x.json) })), res, state, opts, node.workflow + ' › ');
        return [out.map(x => ({ json: clone(x.json) }))];
      }
      case 'agent': {
        return [each((it, i, ctx) => {
          const prompt = resolve(node.prompt || '{{ $json.chatInput }}', ctx, N);
          const out = aiThink(prompt, node.structured_output);
          const call = { node: P + N, prompt: String(prompt), system: node.system || '', tools: [].concat(node.tools || []), output: clone(out) };
          // tools: the mock model calls a tool when the prompt clearly needs it
          if (call.tools.includes('crm_lookup')) { const m = String(prompt).match(/[\w.+-]+@[\w-]+\.[\w.]+/); if (m) { const req = { method: 'GET', url: 'https://crm.example/contacts?email=' + encodeURIComponent(m[0]), headers: { Authorization: 'Bearer tool-scoped' } }; const [st, b] = api(req, state); res.calls.push({ node: P + N + ' (tool)', method: 'GET', url: req.url, headers: req.headers, status: st }); call.toolResult = b; } }
          res.ai.push(call);
          if (node.max_tokens && String(prompt).length > node.max_tokens * 4) throw new WErr(`"${N}": prompt too long for max_tokens ${node.max_tokens}`, N);
          return { json: Object.assign(node.include_input ? clone(it.json) : {}, { output: out }) };
        })];
      }
      case 'vector': {
        state.vec = state.vec || [];
        if ((node.mode || 'retrieve') === 'insert') {
          const size = +node.chunk_size || 40, ov = +node.chunk_overlap || 0;
          return [each((it, i, ctx) => { const text = resolve(node.text || '{{ $json.text }}', ctx, N); const cs = chunk(text, size, ov); cs.forEach(c => state.vec.push({ text: c, source: it.json.source || it.json.title || 'doc' })); return { json: { inserted: cs.length, source: it.json.source || it.json.title || 'doc' } }; })];
        }
        return [each((it, i, ctx) => { const q = resolve(node.query || '{{ $json.question }}', ctx, N); const k = +node.top_k || 3;
          const hits = state.vec.map(d => ({ text: d.text, source: d.source, score: +sim(q, d.text).toFixed(3) })).sort((a, b) => b.score - a.score).slice(0, k);
          return { json: { question: q, context: hits } }; })];
      }
      case 'loop': {
        // Loop Over Items: the simulator processes every batch and reports them on both outputs, tagged with their batch number
        const size = +node.batch_size || 1;
        const tagged = items.map((x, i) => ({ json: Object.assign(clone(x.json), { batch: Math.floor(i / size) + 1 }) }));
        return [tagged, tagged.map(x => ({ json: clone(x.json) }))];
      }
    }
    throw new WErr(`Node type "${node.type}" is not implemented`, N);
  }

  function runCode(node, items, wf, outputs) {
    const N = node.name; const src = node.code || node.jsCode;
    if (!src) throw new WErr(`"${N}" needs code: |  (JavaScript)`, N);
    if ((node.language || 'javascript').toLowerCase().startsWith('py')) throw new WErr(`"${N}": this simulator runs JavaScript Code nodes. (In n8n 2.x, Python Code nodes run natively through task runners.)`, N);
    const wrap = r => { if (r === undefined || r === null) throw new WErr(`"${N}": the code must return items (an array of { json: {...} })`, N);
      const arr = Array.isArray(r) ? r : [r]; return arr.map(x => (isObj(x) && isObj(x.json)) ? { json: clone(x.json) } : isObj(x) ? { json: clone(x) } : (() => { throw new WErr(`"${N}": each returned item must be an object, got ${JSON.stringify(x)}`, N); })()); };
    const exec = (ctx) => { try { const f = new Function('$input', '$json', '$', '$now', '$today', '$execution', '$workflow', '$env', 'items', 'console', '"use strict";\n' + src); return f(ctx.$input, ctx.$json, ctx.$, ctx.$now, ctx.$today, ctx.$execution, ctx.$workflow, ctx.$env, ctx.$input.all(), { log: () => {} }); } catch (e) { if (e instanceof WErr) throw e; throw new WErr(`"${N}" (Code): ${e.message}`, N); } };
    if ((node.mode || 'all') === 'each') return [].concat(...items.map((it, i) => wrap(exec(makeCtx(items, i, outputs, wf, node)))));
    return wrap(exec(makeCtx(items, 0, outputs, wf, node)));
  }

  return { run, parse, aiThink, ALIAS, NOW };
})();

window.LAB = (function () {
  const DEFAULT = `name: Hello n8n
nodes:
  - name: Start
    type: manual
    items:
      - first_name: raul
        city: Lasam
  - name: Greet
    type: set
    fields:
      greeting: "Hi {{ $json.first_name }} from {{ $json.city }}!"
connections:
  - Start -> Greet
`;
  function render(body, l, api) {
    const ch = l.challenge || {}; const esc = api.esc;
    const saved = api.drafts[l.id]; const text = saved != null ? saved : (ch.starter != null ? ch.starter : DEFAULT);
    body.innerHTML = `<div class="lab cfn"><div class="col"><div class="lh">WORKFLOW <span>YAML · nodes + connections</span></div><textarea id="labText" spellcheck="false">${esc(text)}</textarea></div>
      <div class="col"><div class="lh">EXECUTION</div>
        <div class="btnrow"><button class="btn" id="runBtn">▶ EXECUTE WORKFLOW</button><button class="btn ghost" id="resetBtn">RESET</button><button class="btn ghost" id="refBtn">NODES</button></div>
        <div id="labOut" class="labout"><span class="cm">EXECUTE runs the workflow like n8n: each node receives items, evaluates {{ expressions }} per item and passes its output on. Click a node in the result to see its items. Press NODES for every node type and its settings.</span></div></div></div>` + api.taskBar(l);
    const ta = body.querySelector('#labText');
    ta.oninput = () => api.drafts[l.id] = ta.value;
    ta.onkeydown = e => { if (e.key === 'Tab') { e.preventDefault(); const p = ta.selectionStart; ta.value = ta.value.slice(0, p) + '  ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = p + 2; api.drafts[l.id] = ta.value; }
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); body.querySelector('#runBtn').click(); }
      else if (e.key === 'Enter') { const p = ta.selectionStart; const line = ta.value.slice(0, p).split('\n').pop(); let ind = (line.match(/^\s*/) || [''])[0]; if (/:\s*(\|)?\s*$/.test(line)) ind += '  '; e.preventDefault(); ta.value = ta.value.slice(0, p) + '\n' + ind + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = p + 1 + ind.length; api.drafts[l.id] = ta.value; }
      e.stopPropagation(); };
    const out = body.querySelector('#labOut');
    body.querySelector('#refBtn').onclick = () => {
      const R = [['manual', 'items: [ {...} ] test data'], ['webhook', 'request: { headers, query, body }  → $json.body / $json.headers'], ['schedule', 'outputs one item with timestamp'], ['set (Edit Fields)', 'fields: { name: "{{ expr }}" }, include_other: true'], ['filter', 'condition: "{{ … }}" or conditions: [ … ], combine: and|or'], ['if', 'condition → outputs true / false'], ['switch', 'rules: [ { output: name, condition } ], fallback'], ['merge', 'mode: append | combine (field / field1 / field2) | position | chooseBranch; inputs "A -> Merge:1", "B -> Merge:2"'], ['sort / limit / removeDuplicates', 'field, order · max · field'], ['splitOut / aggregate / summarize', 'field (list) · field or all · split_by, sum, count'], ['code', 'language: javascript, mode: all|each, code: |  return $input.all()…'], ['http', 'method, url, headers, query, body, credential, retry, split'], ['respond', 'body, code (Respond to Webhook)'], ['stopAndError', 'message'], ['executeWorkflow', 'workflow: name (under subworkflows:), sub starts with type: subtrigger'], ['agent (AI Agent)', 'prompt, system, structured_output: { category: [..] }, tools, max_tokens'], ['vectorStore', 'mode: insert (text, chunk_size, chunk_overlap) | retrieve (query, top_k)']];
      out.innerHTML = `<div class="lh">NODE TYPES</div>` + R.map(([a, b]) => `<div class="tr skip"><b>${esc(a)}</b> · ${esc(b)}</div>`).join('') + `<div class="lh" style="margin-top:6px">EVERY NODE</div><div class="tr skip">on_error: stop | continue | output  (then "Node:error -> Next") · always_output: true</div><div class="lh" style="margin-top:6px">EXPRESSIONS</div><div class="tr skip">{{ $json.field }} · {{ $('Node').item.json.x }} · {{ $input.all().length }} · {{ $now.toISO() }} · plain JavaScript inside {{ }}</div><div class="lh" style="margin-top:6px">MOCK APIS</div><div class="tr skip">GET https://api.shop.example/customers/1 · /orders?page=1&limit=2 · /rates · /flaky  ·  POST https://crm.example/contacts (needs Authorization: Bearer …) · GET https://crm.example/contacts?email=  ·  POST https://hooks.slack.example/… { text } · POST https://mail.example/send { to }</div>`;
    };
    body.querySelector('#runBtn').onclick = () => {
      const r = N8N.run(ta.value, { credentials: ch.credentials });
      const show = name => { const x = r.runs[name]; if (!x) return '';
        const outs = (x.outputs || []).map((o, k) => `<div class="lh" style="margin:6px 0 2px">${esc(name)} · output ${k}${o.length ? '' : ' (empty)'}</div>` + o.slice(0, 6).map(it => `<div class="tr ok"><code>${esc(JSON.stringify(it.json))}</code></div>`).join('') + (o.length > 6 ? `<div class="tr skip">… ${o.length - 6} more</div>` : '')).join('');
        const eo = x.errorOut ? `<div class="lh" style="margin:6px 0 2px">${esc(name)} · error output</div>` + x.errorOut.map(it => `<div class="tr bad"><code>${esc(JSON.stringify(it.json))}</code></div>`).join('') : '';
        return outs + eo; };
      let h = r.ok ? `<div class="dec allow">✓ Workflow executed successfully</div>` : `<div class="dec err">✕ ${r.errorNode ? 'Node "' + esc(r.errorNode) + '": ' : ''}${esc(r.error)}</div>`;
      const names = Object.keys(r.runs);
      if (names.length) h += `<div class="lh" style="margin:6px 0 2px">NODES (click one)</div>` + names.map(n => { const x = r.runs[n]; const cnt = (x.outputs || []).map(o => o.length).join(' / '); return `<div class="tr ${x.error ? 'bad' : x.skipped ? 'skip' : 'ok'} nn" data-n="${esc(n)}" style="cursor:pointer">${x.error ? '✕' : x.skipped ? '○' : '●'} ${esc(n)} ${x.skipped ? '<span class="cm">(no items → not executed)</span>' : `<span class="cm">${x.input} in → ${cnt} out${x.errorOut ? ' · ' + x.errorOut.length + ' error' : ''}</span>`}${x.error ? ` <i>${esc(x.error)}</i>` : ''}</div>`; }).join('');
      if (r.calls.length) h += `<div class="lh" style="margin:6px 0 2px">HTTP CALLS</div>` + r.calls.map(c => `<div class="tr ${c.status < 400 ? 'ok' : 'bad'}">${esc(c.method)} ${esc(c.url)} → ${c.status}${c.attempt > 1 ? ' (try ' + c.attempt + ')' : ''}</div>`).join('');
      if (r.ai.length) h += `<div class="lh" style="margin:6px 0 2px">AI AGENT</div>` + r.ai.slice(0, 6).map(a => `<div class="tr ok">${esc(a.prompt.slice(0, 70))} → <code>${esc(JSON.stringify(a.output))}</code></div>`).join('');
      if (r.response) h += `<div class="lh" style="margin:6px 0 2px">WEBHOOK RESPONSE</div><div class="tr ok">${r.response.status} <code>${esc(JSON.stringify(r.response.body))}</code></div>`;
      const last = [...names].reverse().find(n => !r.runs[n].skipped && !r.runs[n].error);
      h += `<div id="nodeView">${last ? show(last) : ''}</div>`;
      let checkMsg = '';
      if (ch.check) { let res; try { res = ch.check(r); } catch (e) { res = 'check error: ' + e.message; }
        if (res === true) { api.solve(l.id); checkMsg = `<div class="dec allow" style="margin-top:6px">✓ Challenge requirements met</div>`; }
        else checkMsg = `<div class="dec imp" style="margin-top:6px">Challenge: ${esc(typeof res === 'string' ? res : 'not met yet')}</div>`; }
      out.innerHTML = h + checkMsg;
      out.querySelectorAll('.nn').forEach(el => el.onclick = () => { out.querySelector('#nodeView').innerHTML = show(el.dataset.n); });
    };
    body.querySelector('#resetBtn').onclick = () => { api.drafts[l.id] = null; render(body, l, api); };
  }
  return { render };
})();
