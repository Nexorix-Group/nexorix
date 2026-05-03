import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

export async function generateRoute(name) {
  const cwd = process.cwd();
  const routesDir = path.join(cwd, 'src', 'routes');

  await fs.ensureDir(routesDir);

  const routeFile = path.join(routesDir, `${name}.routes.js`);

  if (await fs.pathExists(routeFile)) {
    console.log(chalk.red(`  ✖ Route "${name}" already exists.`));
    console.log('');
    process.exit(1);
  }

  const content = `import { sendJson } from '../app/server.js';

/**
 * ${name} routes
 * Register these in src/app/routes.js
 */
export const ${name}Routes = {
  'GET /api/${name}': (req, res) => {
    sendJson(res, 200, { message: '${name} list endpoint', data: [] });
  },

  'GET /api/${name}/:id': (req, res) => {
    const { id } = req.params;
    sendJson(res, 200, { message: \`${name} detail: \${id}\`, data: { id } });
  },

  'POST /api/${name}': (req, res) => {
    const body = req.body;
    sendJson(res, 201, { message: '${name} created', data: body });
  },

  'PUT /api/${name}/:id': (req, res) => {
    const { id } = req.params;
    sendJson(res, 200, { message: \`${name} updated: \${id}\`, data: { id, ...req.body } });
  },

  'DELETE /api/${name}/:id': (req, res) => {
    const { id } = req.params;
    sendJson(res, 200, { message: \`${name} deleted: \${id}\` });
  },
};
`;

  await fs.writeFile(routeFile, content);

  console.log(chalk.green(`  ✔ Route generated: ${chalk.bold(name)}`));
  console.log('');
  console.log(chalk.gray('  File created:'));
  console.log(chalk.cyan(`    src/routes/${name}.routes.js`));
  console.log('');
  console.log(chalk.gray('  Register in src/app/routes.js:'));
  console.log(chalk.yellow(`    import { ${name}Routes } from '../routes/${name}.routes.js';`));
  console.log(chalk.yellow(`    // Spread into routes object: ...${name}Routes`));
  console.log('');
}
