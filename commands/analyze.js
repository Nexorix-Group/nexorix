import chalk from 'chalk';
import { analyzeProject } from '../analyzer/analyze.js';

export async function analyzeCommand(options) {
  console.log('');
  console.log(chalk.cyan('  🔎 Nexorix analisando projeto...'));
  console.log('');

  const result = await analyzeProject(process.cwd(), options.pro);

  // Score color
  let scoreColor = chalk.green;
  if (result.score < 60) scoreColor = chalk.red;
  else if (result.score < 80) scoreColor = chalk.yellow;

  console.log(`  Score: ${scoreColor.bold(`${result.score}/100`)}`);
  console.log('');

  if (result.issues.length > 0) {
    console.log(chalk.yellow.bold('  ⚠ Problemas:'));
    for (const issue of result.issues) {
      console.log(chalk.yellow(`    - ${issue}`));
    }
    console.log('');
  } else {
    console.log(chalk.green('  ✔ Nenhum problema encontrado!'));
    console.log('');
  }

  if (result.suggestions.length > 0) {
    console.log(chalk.cyan.bold('  💡 Sugestões:'));
    for (const suggestion of result.suggestions) {
      console.log(chalk.cyan(`    - ${suggestion}`));
    }
    console.log('');
  }

  if (options.pro && result.details) {
    console.log(chalk.gray.bold('  📊 Detalhes (Pro):'));
    for (const [key, val] of Object.entries(result.details)) {
      console.log(chalk.gray(`    ${key}: ${val}`));
    }
    console.log('');
  }
}
