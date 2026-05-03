import chalk from 'chalk';
import { generateModule } from '../generators/module.js';
import { generateRoute } from '../generators/route.js';

const TYPES = ['module', 'route'];

export async function generateCommand(type, name) {
  console.log('');

  if (!TYPES.includes(type)) {
    console.log(chalk.red(`  ✖ Unknown type: "${type}"`));
    console.log(chalk.gray(`  Available types: ${TYPES.join(', ')}`));
    console.log('');
    process.exit(1);
  }

  if (!name || name.trim().length === 0) {
    console.log(chalk.red('  ✖ Name is required'));
    console.log('');
    process.exit(1);
  }

  const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');

  switch (type) {
    case 'module':
      await generateModule(cleanName);
      break;
    case 'route':
      await generateRoute(cleanName);
      break;
  }
}
