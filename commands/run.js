import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';

export async function runCommand() {
  console.log('');
  console.log(chalk.cyan.bold('  ▶ Nexorix Run'));
  console.log('');

  const cwd = process.cwd();
  const mainFile = path.join(cwd, 'src', 'main.js');
  const packageFile = path.join(cwd, 'package.json');

  if (!(await fs.pathExists(mainFile))) {
    console.log(chalk.red('  ✖ src/main.js not found.'));
    console.log(chalk.gray('  Make sure you are inside a Nexorix project directory.'));
    console.log(chalk.gray('  Run: nexorix init to create a new project.'));
    console.log('');
    process.exit(1);
  }

  let useScript = false;
  if (await fs.pathExists(packageFile)) {
    const pkg = await fs.readJson(packageFile);
    if (pkg.scripts && pkg.scripts.start) {
      useScript = true;
    }
  }

  console.log(chalk.gray(`  Starting server from: ${chalk.white('src/main.js')}`));
  console.log(chalk.gray('  Press Ctrl+C to stop\n'));

  const child = useScript
    ? spawn('npm', ['run', 'start'], { cwd, stdio: 'inherit', shell: true })
    : spawn('node', ['src/main.js'], { cwd, stdio: 'inherit', shell: true });

  child.on('error', (err) => {
    console.log(chalk.red(`\n  ✖ Failed to start server: ${err.message}`));
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(chalk.red(`\n  ✖ Server exited with code ${code}`));
    }
  });
}
