import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export async function doctorCommand() {
  console.log('');
  console.log(chalk.cyan.bold('  🩺 Nexorix Doctor'));
  console.log('');

  const checks = [];

  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    const major = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (major >= 18) {
      checks.push({ ok: true, label: `Node.js ${nodeVersion}`, note: 'Compatible' });
    } else {
      checks.push({ ok: false, label: `Node.js ${nodeVersion}`, note: 'Requires v18+' });
    }
  } catch {
    checks.push({ ok: false, label: 'Node.js', note: 'Not found' });
  }

  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    checks.push({ ok: true, label: `npm v${npmVersion}`, note: 'Available' });
  } catch {
    checks.push({ ok: false, label: 'npm', note: 'Not found' });
  }

  // Check Docker (optional)
  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf-8' }).trim();
    const match = dockerVersion.match(/[\d.]+/);
    const ver = match ? match[0] : dockerVersion;
    checks.push({ ok: true, label: `Docker v${ver}`, note: 'Available' });
  } catch {
    checks.push({ ok: false, label: 'Docker', note: 'Not found (optional — needed for --docker preset)', optional: true });
  }

  // Check Docker Compose (optional)
  try {
    const composeOut = execSync('docker compose version 2>&1', { encoding: 'utf-8' }).trim();
    const match = composeOut.match(/[\d.]+/);
    const ver = match ? match[0] : '';
    checks.push({ ok: true, label: `Docker Compose v${ver}`, note: 'Available' });
  } catch {
    checks.push({ ok: false, label: 'Docker Compose', note: 'Not found (optional)', optional: true });
  }

  // Check project structure
  const cwd = process.cwd();
  const hasSrc = await fs.pathExists(path.join(cwd, 'src'));
  const hasPackage = await fs.pathExists(path.join(cwd, 'package.json'));
  const hasMain = (await fs.pathExists(path.join(cwd, 'src', 'main.js')))
    || (await fs.pathExists(path.join(cwd, 'src', 'main.ts')));
  const hasDockerfile = await fs.pathExists(path.join(cwd, 'Dockerfile'));

  checks.push({
    ok: hasPackage,
    label: 'package.json',
    note: hasPackage ? 'Found' : 'Not found — run nexorix init',
  });

  checks.push({
    ok: hasSrc,
    label: 'src/ directory',
    note: hasSrc ? 'Found' : 'Not found — run nexorix init',
  });

  checks.push({
    ok: hasMain,
    label: 'src/main.js or main.ts',
    note: hasMain ? 'Found' : 'Not found',
  });

  if (hasPackage) {
    const nodeModulesExists = await fs.pathExists(path.join(cwd, 'node_modules'));
    checks.push({
      ok: nodeModulesExists,
      label: 'node_modules',
      note: nodeModulesExists ? 'Installed' : 'Run npm install',
    });
  }

  if (hasDockerfile) {
    checks.push({ ok: true, label: 'Dockerfile', note: 'Found' });
    const hasCompose = await fs.pathExists(path.join(cwd, 'docker-compose.yml'));
    checks.push({
      ok: hasCompose,
      label: 'docker-compose.yml',
      note: hasCompose ? 'Found' : 'Not found',
    });
  }

  for (const check of checks) {
    const icon = check.ok ? chalk.green('  ✔') : check.optional ? chalk.gray('  ○') : chalk.red('  ✖');
    const label = check.ok ? chalk.white(check.label) : check.optional ? chalk.gray(check.label) : chalk.red(check.label);
    const note = check.ok ? chalk.gray(check.note) : check.optional ? chalk.gray(check.note) : chalk.yellow(check.note);
    console.log(`${icon} ${label} ${chalk.gray('—')} ${note}`);
  }

  console.log('');

  const requiredChecks = checks.filter((c) => !c.optional);
  const allOk = requiredChecks.every((c) => c.ok);
  if (allOk) {
    console.log(chalk.green.bold('  ✔ All checks passed. Project is healthy!'));
  } else {
    const failed = requiredChecks.filter((c) => !c.ok).length;
    console.log(chalk.yellow.bold(`  ⚠ ${failed} issue(s) found. Review the items above.`));
  }

  console.log('');
}
