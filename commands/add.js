import chalk from 'chalk';
import { installPlugin } from '../plugins/installer.js';

const PLUGINS = ['auth', 'mysql', 'cache', 'logger'];

export async function addCommand(plugin) {
  console.log('');

  if (!PLUGINS.includes(plugin)) {
    console.log(chalk.red(`  ✖ Unknown plugin: "${plugin}"`));
    console.log(chalk.gray(`  Available plugins: ${PLUGINS.join(', ')}`));
    console.log('');
    process.exit(1);
  }

  await installPlugin(plugin);
}
