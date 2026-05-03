import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createProject } from '../generators/project.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PRESETS = {
  api: {
    database: 'none',
    auth: false,
    cache: false,
    type: 'api',
    typescript: false,
    docker: false,
    smart: false,
  },
  saas: {
    database: 'mysql',
    auth: true,
    cache: true,
    type: 'api',
    typescript: false,
    docker: false,
    smart: false,
  },
  micro: {
    database: 'none',
    auth: false,
    cache: false,
    type: 'microservice',
    typescript: false,
    docker: false,
    smart: false,
  },
  docker: {
    database: 'mysql',
    auth: true,
    cache: true,
    type: 'api',
    typescript: false,
    docker: true,
    smart: false,
  },
};

export async function initCommand(name, options) {
  console.log('');
  console.log(chalk.cyan.bold('  🚀 Nexorix Init'));
  console.log('');

  let config = {};

  if (options.smart) {
    console.log(chalk.yellow('  🧠 Smart mode activated — auto-selecting best configuration...\n'));
    config = {
      name: name || 'my-backend',
      database: 'mysql',
      auth: true,
      cache: true,
      type: 'api',
      typescript: false,
      docker: false,
      optimizations: true,
    };
    printConfig(config);
    await createProject(config);
    return;
  }

  if (options.preset) {
    const preset = PRESETS[options.preset];
    if (!preset) {
      console.log(chalk.red(`  ✖ Unknown preset: "${options.preset}". Use: api, saas, micro, docker`));
      process.exit(1);
    }
    config = {
      name: name || `my-${options.preset}-app`,
      ...preset,
      optimizations: true,
    };
    console.log(chalk.yellow(`  📦 Using preset: ${chalk.bold(options.preset)}\n`));
    printConfig(config);
    await createProject(config);
    return;
  }

  if (options.yes) {
    config = {
      name: name || 'my-backend',
      database: options.mysql ? 'mysql' : options.sqlite ? 'sqlite' : 'none',
      auth: !!options.auth,
      cache: !!options.cache,
      type: 'api',
      typescript: !!options.typescript,
      docker: !!options.docker,
      optimizations: true,
    };
    printConfig(config);
    await createProject(config);
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: chalk.white('  Project name:'),
      default: name || 'my-backend',
      validate: (v) => v.trim().length > 0 || 'Name cannot be empty',
    },
    {
      type: 'list',
      name: 'language',
      message: chalk.white('  Language:'),
      choices: [
        { name: 'JavaScript (ESM)', value: 'js' },
        { name: 'TypeScript', value: 'ts' },
      ],
      default: options.typescript ? 'ts' : 'js',
    },
    {
      type: 'list',
      name: 'database',
      message: chalk.white('  Database:'),
      choices: [
        { name: 'MySQL', value: 'mysql' },
        { name: 'SQLite', value: 'sqlite' },
        { name: 'None', value: 'none' },
      ],
      default: options.mysql ? 'mysql' : options.sqlite ? 'sqlite' : 'none',
    },
    {
      type: 'confirm',
      name: 'auth',
      message: chalk.white('  Include authentication?'),
      default: !!options.auth,
    },
    {
      type: 'confirm',
      name: 'cache',
      message: chalk.white('  Include cache layer?'),
      default: !!options.cache,
    },
    {
      type: 'list',
      name: 'type',
      message: chalk.white('  Project type:'),
      choices: [
        { name: 'API REST', value: 'api' },
        { name: 'Microservice', value: 'microservice' },
      ],
      default: 'api',
    },
    {
      type: 'confirm',
      name: 'optimizations',
      message: chalk.white('  Enable automatic optimizations?'),
      default: true,
    },
    {
      type: 'confirm',
      name: 'docker',
      message: chalk.white('  Generate Docker files?'),
      default: !!options.docker,
    },
  ]);

  config = {
    ...answers,
    typescript: answers.language === 'ts',
  };
  console.log('');
  await createProject(config);
}

function printConfig(config) {
  console.log(chalk.gray('  Configuration:'));
  console.log(chalk.gray(`    Name:          ${chalk.white(config.name)}`));
  console.log(chalk.gray(`    Language:      ${chalk.white(config.typescript ? 'TypeScript' : 'JavaScript')}`));
  console.log(chalk.gray(`    Database:      ${chalk.white(config.database)}`));
  console.log(chalk.gray(`    Auth:          ${chalk.white(config.auth ? 'Yes' : 'No')}`));
  console.log(chalk.gray(`    Cache:         ${chalk.white(config.cache ? 'Yes' : 'No')}`));
  console.log(chalk.gray(`    Type:          ${chalk.white(config.type || 'api')}`));
  console.log(chalk.gray(`    Docker:        ${chalk.white(config.docker ? 'Yes' : 'No')}`));
  console.log('');
}
