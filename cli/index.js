#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

import { initCommand } from '../commands/init.js';
import { generateCommand } from '../commands/generate.js';
import { addCommand } from '../commands/add.js';
import { analyzeCommand } from '../commands/analyze.js';
import { doctorCommand } from '../commands/doctor.js';
import { runCommand } from '../commands/run.js';

const program = new Command();

function showBanner() {
  console.log('');
  console.log(chalk.cyan.bold('  ███╗   ██╗███████╗██╗  ██╗ ██████╗ ██████╗ ██╗██╗  ██╗'));
  console.log(chalk.cyan.bold('  ████╗  ██║██╔════╝╚██╗██╔╝██╔═══██╗██╔══██╗██║╚██╗██╔╝'));
  console.log(chalk.cyan.bold('  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║██████╔╝██║ ╚███╔╝ '));
  console.log(chalk.cyan.bold('  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║██╔══██╗██║ ██╔██╗ '));
  console.log(chalk.cyan.bold('  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝██║  ██║██║██╔╝ ██╗'));
  console.log(chalk.cyan.bold('  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝'));
  console.log('');
  console.log(chalk.gray('  Structure, optimize and scale your backend.'));
  console.log(chalk.gray(`  v${pkg.version}`));
  console.log('');
}

program
  .name('nexorix')
  .description('Modern CLI for backend generation, standardization and analysis')
  .version(pkg.version, '-v, --version', 'Show version')
  .addHelpText('beforeAll', () => {
    showBanner();
    return '';
  });

// nexorix init
program
  .command('init [name]')
  .description('Create a new backend project with professional architecture')
  .option('--mysql', 'Use MySQL database')
  .option('--sqlite', 'Use SQLite database')
  .option('--auth', 'Include authentication plugin')
  .option('--cache', 'Include cache plugin')
  .option('--typescript', 'Use TypeScript')
  .option('--preset <type>', 'Use a preset (api, saas, micro)')
  .option('--yes', 'Skip prompts and use defaults')
  .option('--smart', 'Auto-select best configuration')
  .action(async (name, options) => {
    await initCommand(name, options);
  });

// nexorix generate
program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate a module, route or component')
  .action(async (type, name) => {
    await generateCommand(type, name);
  });

// nexorix add
program
  .command('add <plugin>')
  .description('Install a plugin (auth, mysql, cache, logger)')
  .action(async (plugin) => {
    await addCommand(plugin);
  });

// nexorix analyze
program
  .command('analyze')
  .description('Analyze project quality and generate a score')
  .option('--pro', 'Enable deep analysis mode')
  .action(async (options) => {
    await analyzeCommand(options);
  });

// nexorix doctor
program
  .command('doctor')
  .description('Check project health and environment')
  .action(async () => {
    await doctorCommand();
  });

// nexorix run
program
  .command('run')
  .description('Start the project server')
  .action(async () => {
    await runCommand();
  });

// nexorix version
program
  .command('version')
  .description('Show Nexorix version')
  .action(() => {
    showBanner();
    console.log(chalk.cyan(`  Version: ${chalk.bold(pkg.version)}`));
    console.log(chalk.gray(`  Node.js: ${process.version}`));
    console.log('');
  });

// nexorix help override
program
  .command('help')
  .description('Show help menu')
  .action(() => {
    showBanner();
    console.log(chalk.bold.white('  COMMANDS\n'));

    const commands = [
      ['  nexorix init [name]',           'Create a new backend project'],
      ['  nexorix run',                   'Start the project server'],
      ['  nexorix generate <type> <name>','Generate module or route'],
      ['  nexorix add <plugin>',          'Install a plugin'],
      ['  nexorix analyze [--pro]',       'Analyze project quality'],
      ['  nexorix doctor',                'Check project health'],
      ['  nexorix version',               'Show version'],
    ];

    for (const [cmd, desc] of commands) {
      console.log(`${chalk.cyan(cmd.padEnd(42))} ${chalk.gray(desc)}`);
    }

    console.log('');
    console.log(chalk.bold.white('  INIT FLAGS\n'));
    const flags = [
      ['  --mysql',          'Use MySQL database'],
      ['  --sqlite',         'Use SQLite database'],
      ['  --auth',           'Include authentication'],
      ['  --cache',          'Include cache layer'],
      ['  --typescript',     'Use TypeScript'],
      ['  --preset <type>',  'Preset: api | saas | micro'],
      ['  --yes',            'Skip prompts'],
      ['  --smart',          'Auto-configure project'],
    ];
    for (const [flag, desc] of flags) {
      console.log(`${chalk.yellow(flag.padEnd(24))} ${chalk.gray(desc)}`);
    }

    console.log('');
    console.log(chalk.bold.white('  GENERATE TYPES\n'));
    console.log(`${chalk.green('  module'.padEnd(24))} ${chalk.gray('controller + service + repository')}`);
    console.log(`${chalk.green('  route'.padEnd(24))}  ${chalk.gray('simple route file')}`);

    console.log('');
    console.log(chalk.bold.white('  PLUGINS\n'));
    const plugins = [
      ['  auth',   'JWT authentication middleware'],
      ['  mysql',  'MySQL connection pool'],
      ['  cache',  'In-memory cache layer'],
      ['  logger', 'Structured logging (replaces console.log)'],
    ];
    for (const [p, desc] of plugins) {
      console.log(`${chalk.magenta(p.padEnd(24))} ${chalk.gray(desc)}`);
    }

    console.log('');
    console.log(chalk.bold.white('  EXAMPLES\n'));
    const examples = [
      'nexorix init',
      'nexorix init api --mysql --auth --yes',
      'nexorix init --preset saas',
      'nexorix init --smart',
      'nexorix generate module product',
      'nexorix add auth',
      'nexorix analyze --pro',
    ];
    for (const ex of examples) {
      console.log(`  ${chalk.white('$')} ${chalk.cyan(ex)}`);
    }
    console.log('');
  });

program.parse(process.argv);

if (process.argv.length < 3) {
  showBanner();
  program.help();
}
