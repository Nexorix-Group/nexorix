import fs from 'fs-extra';
import path from 'path';

const MAX_LINES = 300;

export async function analyzeProject(cwd, pro = false) {
  const srcPath = path.join(cwd, 'src');

  if (!(await fs.pathExists(srcPath))) {
    return {
      score: 0,
      issues: ['src/ directory not found — not a Nexorix project'],
      suggestions: ['Run nexorix init to create a project'],
      details: {},
    };
  }

  const files = await collectFiles(srcPath);
  const issues = [];
  const suggestions = [];
  const details = {};

  let score = 100;
  let consoleLogs = 0;
  let largeFiles = 0;
  let heavyControllers = 0;
  let missingServices = 0;
  let totalFiles = files.length;
  let totalLines = 0;

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');
    totalLines += lines.length;

    const relativePath = path.relative(cwd, file);

    const consoleMatches = lines.filter((l) => /console\.log\s*\(/.test(l));
    if (consoleMatches.length > 0) {
      consoleLogs += consoleMatches.length;
    }

    if (lines.length > MAX_LINES) {
      largeFiles++;
      issues.push(`Arquivo grande (${lines.length} linhas): ${relativePath}`);
      score -= 5;
    }

    if (file.includes('controller') && lines.length > 80) {
      heavyControllers++;
      issues.push(`Controller muito grande (${lines.length} linhas): ${relativePath}`);
      score -= 8;
    }

    if (file.includes('controller')) {
      const serviceFile = file.replace('controller', 'service');
      if (!(await fs.pathExists(serviceFile))) {
        missingServices++;
        issues.push(`Controller sem service layer: ${relativePath}`);
        score -= 10;
      }
    }
  }

  if (consoleLogs > 0) {
    issues.push(`uso de console.log (${consoleLogs} ocorrências)`);
    score -= Math.min(consoleLogs * 2, 15);
  }

  const hasModules = await fs.pathExists(path.join(srcPath, 'modules'));
  const hasConfig = await fs.pathExists(path.join(srcPath, 'config'));
  const hasCore = await fs.pathExists(path.join(srcPath, 'core'));

  if (!hasModules) {
    issues.push('Estrutura modules/ ausente');
    score -= 10;
  }
  if (!hasConfig) {
    issues.push('Estrutura config/ ausente');
    score -= 5;
  }
  if (!hasCore) {
    issues.push('Estrutura core/ ausente');
    score -= 5;
  }

  if (consoleLogs > 0) {
    suggestions.push('usar logger estruturado (nexorix add logger)');
  }
  if (heavyControllers > 0) {
    suggestions.push('mover lógica de negócio para a camada service');
  }
  if (largeFiles > 0) {
    suggestions.push('dividir arquivos grandes em módulos menores');
  }
  if (missingServices > 0) {
    suggestions.push('criar service layer para cada controller');
  }
  if (!hasCore) {
    suggestions.push('criar estrutura core/ com middleware e utils');
  }

  score = Math.max(0, Math.min(100, score));

  if (pro) {
    details['Total de arquivos'] = totalFiles;
    details['Total de linhas'] = totalLines;
    details['console.log encontrados'] = consoleLogs;
    details['Arquivos grandes (>300 linhas)'] = largeFiles;
    details['Controllers pesados'] = heavyControllers;
    details['Controllers sem service'] = missingServices;
    details['Estrutura modules/'] = hasModules ? 'OK' : 'Ausente';
    details['Estrutura config/'] = hasConfig ? 'OK' : 'Ausente';
    details['Estrutura core/'] = hasCore ? 'OK' : 'Ausente';
  }

  return { score, issues, suggestions, details };
}

async function collectFiles(dir, collected = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, collected);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      collected.push(fullPath);
    }
  }

  return collected;
}
