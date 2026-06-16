#!/usr/bin/env node
'use strict';

/*
 * Lifecycle manager for the plugins in this marketplace.
 *
 *   npx odoo-technical-plugins                 # interactive install
 *   npx odoo-technical-plugins install ...     # install (flags below)
 *   npx odoo-technical-plugins update          # refresh installed plugins
 *   npx odoo-technical-plugins uninstall       # remove installed plugins
 *   npx odoo-technical-plugins status          # what's installed where
 *   npx odoo-technical-plugins list            # available plugins
 *
 * Tracks installs in a manifest (.odoo-technical-plugins.json per project,
 * or ~/.odoo-technical-plugins.json for --global) so update/uninstall are
 * clean. Zero runtime dependencies (Node built-ins only).
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const MARKETPLACE = 'odoo-technical-plugins';
const MANIFEST_FILE = '.odoo-technical-plugins.json';
const VERSION = readJSON(path.join(ROOT, 'package.json')).version;

const C = {
  g: (s) => `\x1b[32m${s}\x1b[0m`,
  b: (s) => `\x1b[34m${s}\x1b[0m`,
  y: (s) => `\x1b[33m${s}\x1b[0m`,
  r: (s) => `\x1b[31m${s}\x1b[0m`,
  d: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadPlugins() {
  const data = readJSON(path.join(ROOT, '.claude-plugin', 'marketplace.json'));
  return (data.plugins || []).map((p) => ({
    name: p.name,
    dir: path.resolve(ROOT, p.source),
    description: p.description || '',
  }));
}

function findPlugin(name) {
  return loadPlugins().find((p) => p.name === name);
}

/* ----------------------------- arg parsing ------------------------------ */

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--yes' || a === '-y') args.yes = true;
    else if (a === '--global' || a === '-g') args.global = true;
    else if (a === '--list') args.list = true;
    else if (a === '--agent') args.agent = argv[++i];
    else if (a === '--plugin') args.plugin = argv[++i];
    else if (a === '--dir') args.dir = argv[++i];
    else if (a.startsWith('--agent=')) args.agent = a.slice(8);
    else if (a.startsWith('--plugin=')) args.plugin = a.slice(9);
    else if (a.startsWith('--dir=')) args.dir = a.slice(6);
    else args._.push(a);
  }
  return args;
}

function help() {
  console.log(`
${C.bold('Odoo Technical Plugins')} ${C.d('v' + VERSION)}

${C.bold('Usage')}
  npx ${MARKETPLACE} [command] [flags]

${C.bold('Commands')}
  install        Install plugin(s) for an agent ${C.d('(default; interactive if no flags)')}
  update         Re-copy the latest files for everything already installed
  uninstall      Remove installed plugin(s) and clean the manifest
  status         Show what is installed (project + global)
  list           List available plugins
  help           Show this help

${C.bold('Flags')}
  --agent <claude|codex|cursor|all>   target agent(s)
  --plugin <name>                     plugin to act on (default: all)
  --dir <path>                        project directory (default: current dir)
  --global                            act at user level instead of a project
  -y, --yes                           skip confirmation prompts
  -h, --help                          show this help

${C.bold('Examples')}
  npx ${MARKETPLACE}                              ${C.d('# interactive install')}
  npx ${MARKETPLACE} install --agent all
  npx ${MARKETPLACE} update --global
  npx ${MARKETPLACE} uninstall --agent cursor
  npx ${MARKETPLACE} status
`);
}

/* ------------------------------ fs helpers ------------------------------ */

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function findSkillDir(pluginDir) {
  const skillsRoot = path.join(pluginDir, 'skills');
  if (!fs.existsSync(skillsRoot)) return null;
  const dirs = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter((e) => e.isDirectory());
  return dirs.length ? path.join(skillsRoot, dirs[0].name) : null;
}

function home(...parts) {
  return path.join(os.homedir(), ...parts);
}

/* ----------------------- per-agent write / remove ----------------------- */
/* Each writer returns a descriptor: { paths:[...], blocks:[{file,marker}] }
 * - paths:  files/dirs we fully own (safe to delete on uninstall)
 * - blocks: marker-wrapped insertions inside a shared file (e.g. AGENTS.md) */

function writeClaude(plugin, target, isGlobal) {
  const skillDir = findSkillDir(plugin.dir);
  if (!skillDir) {
    console.log(C.y('  Claude Code: no skill found, skipped.'));
    return null;
  }
  const dest = isGlobal
    ? home('.claude', 'skills', path.basename(skillDir))
    : path.join(target, '.claude', 'skills', path.basename(skillDir));
  rmrf(dest);
  copyDir(skillDir, dest);
  console.log(C.g(`  Claude Code: skill → ${dest}`));
  return { paths: [dest], blocks: [] };
}

function codexBlock(plugin) {
  const src = path.join(plugin.dir, 'dist', 'codex', 'AGENTS.md');
  if (!fs.existsSync(src)) return null;
  const body = fs.readFileSync(src, 'utf8').trim();
  return `<!-- BEGIN ${plugin.name} -->\n${body}\n<!-- END ${plugin.name} -->\n`;
}

function stripBlock(text, marker) {
  const re = new RegExp(`\\n*<!-- BEGIN ${marker} -->[\\s\\S]*?<!-- END ${marker} -->\\n*`, 'g');
  return text.replace(re, '\n');
}

function writeCodex(plugin, target, isGlobal) {
  const block = codexBlock(plugin);
  if (!block) {
    console.log(C.y('  Codex: no AGENTS.md, skipped.'));
    return null;
  }
  const dest = isGlobal ? home('.codex', 'AGENTS.md') : path.join(target, 'AGENTS.md');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const existed = fs.existsSync(dest);
  const cur = existed ? fs.readFileSync(dest, 'utf8') : '';
  const had = cur.includes(`<!-- BEGIN ${plugin.name} -->`);
  const stripped = stripBlock(cur, plugin.name).trim();
  const next = stripped ? `${stripped}\n\n${block}` : block;
  fs.writeFileSync(dest, next);
  console.log(C.g(`  Codex: ${had ? 'updated' : existed ? 'appended' : 'created'} → ${dest}`));
  return { paths: [], blocks: [{ file: dest, marker: plugin.name }] };
}

function writeCursor(plugin, target, isGlobal) {
  const srcDir = path.join(plugin.dir, 'dist', 'cursor', '.cursor', 'rules');
  if (!fs.existsSync(srcDir)) {
    console.log(C.y('  Cursor: no rules, skipped.'));
    return null;
  }
  const destDir = isGlobal ? home('.cursor', 'rules') : path.join(target, '.cursor', 'rules');
  fs.mkdirSync(destDir, { recursive: true });
  const paths = [];
  for (const f of fs.readdirSync(srcDir)) {
    const dest = path.join(destDir, f);
    fs.copyFileSync(path.join(srcDir, f), dest);
    paths.push(dest);
    console.log(C.g(`  Cursor: rule → ${dest}`));
  }
  return { paths, blocks: [] };
}

const WRITERS = { claude: writeClaude, codex: writeCodex, cursor: writeCursor };

function removeDescriptor(entry) {
  for (const p of entry.paths || []) {
    if (fs.existsSync(p)) {
      rmrf(p);
      console.log(C.g(`  removed → ${p}`));
    }
  }
  for (const blk of entry.blocks || []) {
    if (!fs.existsSync(blk.file)) continue;
    const stripped = stripBlock(fs.readFileSync(blk.file, 'utf8'), blk.marker).trim();
    if (stripped) {
      fs.writeFileSync(blk.file, stripped + '\n');
      console.log(C.g(`  removed block from → ${blk.file}`));
    } else {
      fs.unlinkSync(blk.file);
      console.log(C.g(`  removed → ${blk.file}`));
    }
  }
}

/* ------------------------------ manifest -------------------------------- */

function manifestPath(target, isGlobal) {
  return isGlobal ? home(MANIFEST_FILE) : path.join(target, MANIFEST_FILE);
}

function loadManifest(p) {
  return fs.existsSync(p) ? readJSON(p) : { name: MARKETPLACE, scope: null, installs: [] };
}

function saveManifest(p, m) {
  m.updatedAt = new Date().toISOString();
  if (!m.installs.length) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
    return;
  }
  fs.writeFileSync(p, JSON.stringify(m, null, 2) + '\n');
}

function upsertInstall(m, entry) {
  m.installs = (m.installs || []).filter((e) => !(e.plugin === entry.plugin && e.agent === entry.agent));
  m.installs.push(entry);
}

/* ------------------------------ prompts --------------------------------- */

const KEY = { up: '\x1b[A', down: '\x1b[B', enter1: '\r', enter2: '\n', space: ' ', ctrlc: '\x03' };

function renderMenu(message, choices, idx, selected, multi) {
  const head =
    C.bold(message) +
    C.d(multi ? '   (↑/↓ move · space select · enter confirm)' : '   (↑/↓ move · enter select)');
  const body = choices.map((c, i) => {
    const cur = i === idx;
    const pointer = cur ? C.g('❯') : ' ';
    const box = multi ? (selected.has(i) ? C.g('◉') : '◯') + ' ' : '';
    const label = cur ? C.g(c.label) : c.label;
    const hint = c.hint ? '  ' + C.d(c.hint) : '';
    return `${pointer} ${box}${label}${hint}`;
  });
  return [head, ...body];
}

function menu(message, choices, { multi = false } = {}) {
  return new Promise((resolve) => {
    const input = process.stdin;
    const out = process.stdout;
    let idx = 0;
    let prev = 0;
    const selected = new Set();

    const draw = () => {
      if (prev) out.write(`\x1b[${prev}A`);
      out.write('\x1b[J');
      const lines = renderMenu(message, choices, idx, selected, multi);
      out.write(lines.join('\n') + '\n');
      prev = lines.length;
    };
    const finish = (val) => {
      input.setRawMode(false);
      input.pause();
      input.removeListener('data', onData);
      out.write('\x1b[?25h');
      resolve(val);
    };
    const onData = (buf) => {
      const s = buf.toString();
      if (s === KEY.ctrlc) {
        finish();
        out.write('\n');
        process.exit(130);
      } else if (s === KEY.up || s === 'k') {
        idx = (idx - 1 + choices.length) % choices.length;
        draw();
      } else if (s === KEY.down || s === 'j') {
        idx = (idx + 1) % choices.length;
        draw();
      } else if (multi && s === KEY.space) {
        if (selected.has(idx)) selected.delete(idx);
        else selected.add(idx);
        draw();
      } else if (s === KEY.enter1 || s === KEY.enter2) {
        if (multi) {
          if (!selected.size) return;
          finish([...selected].sort((a, b) => a - b).map((i) => choices[i].value));
        } else finish(choices[idx].value);
      }
    };

    out.write('\x1b[?25l');
    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
    draw();
  });
}

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(q, (a) => { rl.close(); res(a.trim()); }));
}

async function confirm(message, yes) {
  if (yes) return true;
  if (!process.stdin.isTTY) return false;
  const a = await ask(`${message} ${C.d('[y/N]')} `);
  return /^y(es)?$/i.test(a);
}

function resolveAgents(arg) {
  return arg === 'all' ? ['claude', 'codex', 'cursor'] : [arg];
}

/* ------------------------------ commands -------------------------------- */

function cmdList() {
  console.log(C.bold('Available plugins:'));
  loadPlugins().forEach((p) => console.log(`  • ${p.name} ${C.d('— ' + p.description)}`));
}

function showManifest(label, p) {
  if (!fs.existsSync(p)) return;
  const m = loadManifest(p);
  if (!m.installs.length) return;
  console.log(C.bold(`\n${label}`) + C.d(`  (${p})`));
  for (const e of m.installs) {
    console.log(`  • ${e.plugin} ${C.d('→')} ${e.agent} ${C.d('v' + (e.version || '?'))}`);
  }
}

function cmdStatus() {
  let any = false;
  for (const [label, p] of [
    ['Global', manifestPath(null, true)],
    [`Project (${process.cwd()})`, manifestPath(process.cwd(), false)],
  ]) {
    if (fs.existsSync(p) && loadManifest(p).installs.length) {
      any = true;
      showManifest(label, p);
    }
  }
  if (!any) console.log(C.d('Nothing installed in the global or current-project manifest.'));
}

async function cmdInstall(args) {
  const plugins = loadPlugins();
  let chosenPlugins;
  let agents;
  let isGlobal = !!args.global;
  let target = path.resolve(args.dir || '.');

  const nonInteractive = args.agent && (args.plugin || plugins.length === 1);

  if (nonInteractive) {
    chosenPlugins = args.plugin ? plugins.filter((p) => p.name === args.plugin) : plugins;
    if (!chosenPlugins.length) {
      console.error(C.y(`Unknown plugin: ${args.plugin}`));
      process.exit(1);
    }
    agents = resolveAgents(args.agent);
  } else {
    if (!process.stdin.isTTY) {
      console.log(C.y('No interactive terminal. Pass flags, e.g. --agent all. Try --help.'));
      process.exit(1);
    }
    console.log(C.bold('\n📦 Odoo Technical Plugins installer'));
    let chosen;
    if (plugins.length === 1) {
      chosen = plugins[0];
      console.log(C.d(`\nPlugin: ${chosen.name} — ${chosen.description}`));
    } else {
      chosen = await menu('Which plugin?', plugins.map((p) => ({ label: p.name, hint: p.description, value: p })));
    }
    chosenPlugins = [chosen];
    agents = await menu(
      'Which AI agent(s)?',
      [
        { label: 'Claude Code', value: 'claude' },
        { label: 'Codex', value: 'codex' },
        { label: 'Cursor', value: 'cursor' },
      ],
      { multi: true }
    );
    isGlobal = await menu('Install scope?', [
      { label: 'This project', hint: process.cwd(), value: false },
      { label: 'Global (all projects)', value: true },
    ]);
    if (!isGlobal) {
      const d = await ask(`Project directory ${C.d('[' + process.cwd() + ']')}: `);
      target = path.resolve(d || '.');
    }
  }

  const mp = manifestPath(target, isGlobal);
  const manifest = loadManifest(mp);
  manifest.scope = isGlobal ? 'global' : 'project';

  console.log('');
  for (const p of chosenPlugins) {
    console.log(C.bold(`Installing ${p.name}:`));
    for (const a of agents) {
      const writer = WRITERS[a];
      if (!writer) {
        console.log(C.y(`  Unknown agent: ${a}`));
        continue;
      }
      const desc = writer(p, target, isGlobal);
      if (desc) upsertInstall(manifest, { plugin: p.name, agent: a, version: VERSION, ...desc });
    }
  }
  saveManifest(mp, manifest);
  console.log('\n' + C.g('Done.') + ' ' + C.d(`Tracked in ${mp}. Reload your AI agent.`));
}

function cmdUpdate(args) {
  const isGlobal = !!args.global;
  const target = path.resolve(args.dir || '.');
  const mp = manifestPath(target, isGlobal);
  const manifest = loadManifest(mp);
  if (!manifest.installs.length) {
    console.log(C.y(`Nothing installed ${isGlobal ? 'globally' : 'in ' + target}. Run install first.`));
    return;
  }
  console.log(C.bold(`Updating ${manifest.installs.length} install(s) → v${VERSION}`));
  for (const e of [...manifest.installs]) {
    if (args.plugin && e.plugin !== args.plugin) continue;
    if (args.agent && args.agent !== 'all' && e.agent !== args.agent) continue;
    const plugin = findPlugin(e.plugin);
    if (!plugin) {
      console.log(C.y(`  ${e.plugin}: no longer in marketplace, skipped.`));
      continue;
    }
    const writer = WRITERS[e.agent];
    const desc = writer && writer(plugin, target, isGlobal);
    if (desc) upsertInstall(manifest, { plugin: e.plugin, agent: e.agent, version: VERSION, ...desc });
  }
  saveManifest(mp, manifest);
  console.log('\n' + C.g('Updated.'));
}

async function cmdUninstall(args) {
  const isGlobal = !!args.global;
  const target = path.resolve(args.dir || '.');
  const mp = manifestPath(target, isGlobal);
  const manifest = loadManifest(mp);
  if (!manifest.installs.length) {
    console.log(C.y(`Nothing installed ${isGlobal ? 'globally' : 'in ' + target}.`));
    return;
  }
  const toRemove = manifest.installs.filter(
    (e) =>
      (!args.plugin || e.plugin === args.plugin) &&
      (!args.agent || args.agent === 'all' || e.agent === args.agent)
  );
  if (!toRemove.length) {
    console.log(C.y('No matching install for the given --plugin/--agent.'));
    return;
  }
  console.log(C.bold('Will remove:'));
  toRemove.forEach((e) => console.log(`  • ${e.plugin} → ${e.agent}`));
  if (!(await confirm('Proceed?', args.yes))) {
    console.log(C.d('Cancelled.'));
    return;
  }
  console.log('');
  for (const e of toRemove) removeDescriptor(e);
  manifest.installs = manifest.installs.filter((e) => !toRemove.includes(e));
  saveManifest(mp, manifest);
  console.log('\n' + C.g('Uninstalled.'));
}

/* -------------------------------- main ---------------------------------- */

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return help();

  let cmd = (args._[0] || 'install').toLowerCase();
  if (cmd === 'upgrade') cmd = 'update';
  if (cmd === 'remove' || cmd === 'rm') cmd = 'uninstall';
  if (args.list) cmd = 'list';

  switch (cmd) {
    case 'list':
      return cmdList();
    case 'status':
      return cmdStatus();
    case 'update':
      return cmdUpdate(args);
    case 'uninstall':
      return cmdUninstall(args);
    case 'install':
      return cmdInstall(args);
    default:
      console.error(C.y(`Unknown command: ${cmd}`));
      help();
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(C.r('Error: ') + e.message);
  process.exit(1);
});
