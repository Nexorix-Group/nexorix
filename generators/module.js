import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

export async function generateModule(name) {
  const cwd = process.cwd();
  const modulesDir = path.join(cwd, 'src', 'modules');

  if (!(await fs.pathExists(modulesDir))) {
    console.log(chalk.red('  ✖ src/modules/ not found.'));
    console.log(chalk.gray('  Make sure you are inside a Nexorix project.'));
    console.log('');
    process.exit(1);
  }

  const modulePath = path.join(modulesDir, name);

  if (await fs.pathExists(modulePath)) {
    console.log(chalk.red(`  ✖ Module "${name}" already exists.`));
    console.log('');
    process.exit(1);
  }

  await fs.ensureDir(modulePath);

  const pascal = toPascalCase(name);

  // Controller
  const controller = `import { sendJson } from '../../app/server.js';
import { ${pascal}Service } from './${name}.service.js';

const service = new ${pascal}Service();

export const ${name}Controller = {
  async list(req, res) {
    try {
      const data = await service.findAll();
      sendJson(res, 200, { data, total: data.length });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
  },

  async findById(req, res) {
    try {
      const item = await service.findById(req.params.id);
      if (!item) return sendJson(res, 404, { error: 'Not found' });
      sendJson(res, 200, { data: item });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
  },

  async create(req, res) {
    try {
      const item = await service.create(req.body);
      sendJson(res, 201, { data: item, message: 'Created successfully' });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
  },

  async update(req, res) {
    try {
      const item = await service.update(req.params.id, req.body);
      if (!item) return sendJson(res, 404, { error: 'Not found' });
      sendJson(res, 200, { data: item, message: 'Updated successfully' });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await service.remove(req.params.id);
      sendJson(res, 200, { message: 'Deleted successfully' });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
  },
};
`;

  // Service
  const service = `import { ${pascal}Repository } from './${name}.repository.js';

export class ${pascal}Service {
  constructor() {
    this.repository = new ${pascal}Repository();
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id) {
    if (!id) throw new Error('ID is required');
    return this.repository.findById(id);
  }

  async create(data) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Data is required');
    }
    return this.repository.create(data);
  }

  async update(id, data) {
    if (!id) throw new Error('ID is required');
    return this.repository.update(id, data);
  }

  async remove(id) {
    if (!id) throw new Error('ID is required');
    return this.repository.remove(id);
  }
}
`;

  // Repository
  const repository = `// In-memory repository — replace with real DB layer
const store = [];
let nextId = 1;

export class ${pascal}Repository {
  async findAll() {
    return [...store];
  }

  async findById(id) {
    return store.find((item) => item.id === String(id)) || null;
  }

  async create(data) {
    const item = {
      id: String(nextId++),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.push(item);
    return item;
  }

  async update(id, data) {
    const index = store.findIndex((item) => item.id === String(id));
    if (index === -1) return null;
    store[index] = { ...store[index], ...data, updatedAt: new Date().toISOString() };
    return store[index];
  }

  async remove(id) {
    const index = store.findIndex((item) => item.id === String(id));
    if (index === -1) throw new Error('Item not found');
    store.splice(index, 1);
  }
}
`;

  await fs.writeFile(path.join(modulePath, `${name}.controller.js`), controller);
  await fs.writeFile(path.join(modulePath, `${name}.service.js`), service);
  await fs.writeFile(path.join(modulePath, `${name}.repository.js`), repository);

  console.log(chalk.green(`  ✔ Module generated: ${chalk.bold(name)}`));
  console.log('');
  console.log(chalk.gray('  Files created:'));
  console.log(chalk.cyan(`    src/modules/${name}/${name}.controller.js`));
  console.log(chalk.cyan(`    src/modules/${name}/${name}.service.js`));
  console.log(chalk.cyan(`    src/modules/${name}/${name}.repository.js`));
  console.log('');
  console.log(chalk.gray('  Register routes in src/app/routes.js:'));
  console.log(chalk.yellow(`    import { ${name}Controller } from '../modules/${name}/${name}.controller.js';`));
  console.log(chalk.yellow(`    'GET /api/${name}s': ${name}Controller.list,`));
  console.log(chalk.yellow(`    'POST /api/${name}s': ${name}Controller.create,`));
  console.log('');
}

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}
