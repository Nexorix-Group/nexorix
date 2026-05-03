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

  const cwd = process.cwd();
  const hasSrc = await fs.pathExists(path.join(cwd, 'src'));
  const hasPackage = await fs.pathExists(path.join(cwd, 'package.json'));
  const hasMain = await fs.pathExists(path.join(cwd, 'src', 'main.js'));

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
    label: 'src/main.js',
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

  for (const check of checks) {
    const icon = check.ok ? chalk.green('  ✔') : chalk.red('  ✖');
    const label = check.ok ? chalk.white(check.label) : chalk.red(check.label);
    const note = check.ok ? chalk.gray(check.note) : chalk.yellow(check.note);
    console.log(`${icon} ${label} ${chalk.gray('—')} ${note}`);
  }

  console.log('');

  const allOk = checks.every((c) => c.ok);
  if (allOk) {
    console.log(chalk.green.bold('  ✔ All checks passed. Project is healthy!'));
  } else {
    const failed = checks.filter((c) => !c.ok).length;
    console.log(chalk.yellow.bold(`  ⚠ ${failed} issue(s) found. Review the items above.`));
  }

  console.log('');
}
