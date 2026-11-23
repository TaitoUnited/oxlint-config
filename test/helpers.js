import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const oxlintBin = join(repositoryRoot, 'node_modules/oxlint/bin/oxlint');

/**
 * Lint fixture files with a real `oxlint.config.ts` in a temporary project.
 *
 * The project lives inside this repository so the config can import the
 * presets through the package's own `exports` (`@taito/oxlint-config/...`),
 * exactly like a consumer would.
 */
export function lintProject({ config, files }) {
  const projectRoot = mkdtempSync(join(repositoryRoot, 'test/.tmp-'));

  try {
    writeProjectFile({
      projectRoot,
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          strict: true,
          module: 'preserve',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          noEmit: true,
          skipLibCheck: true,
        },
        include: ['**/*'],
      }),
    });

    writeProjectFile({
      projectRoot,
      path: 'oxlint.config.ts',
      content: config,
    });

    for (const [path, content] of Object.entries(files)) {
      writeProjectFile({ projectRoot, path, content: `${content}\n` });
    }

    const result = spawnSync(
      process.execPath,
      [oxlintBin, '--format', 'json', ...Object.keys(files)],
      {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 50_000,
        maxBuffer: 16 * 1024 * 1024,
      }
    );

    if (result.error) {
      throw result.error;
    }

    let output;

    try {
      output = JSON.parse(result.stdout);
    } catch {
      throw new Error(
        `Oxlint did not produce JSON output.\n${result.stderr}\n${result.stdout}`
      );
    }

    return {
      status: result.status,
      numberOfFiles: output.number_of_files,
      diagnostics: output.diagnostics.map(diagnostic => ({
        file: relative(projectRoot, join(projectRoot, diagnostic.filename)),
        code: diagnostic.code,
        severity: diagnostic.severity,
      })),
    };
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
}

/** Diagnostic codes reported for one fixture file. */
export function codesFor({ diagnostics, file }) {
  return diagnostics
    .filter(diagnostic => diagnostic.file === file)
    .map(diagnostic => diagnostic.code);
}

function writeProjectFile({ projectRoot, path, content }) {
  const filename = join(projectRoot, path);
  mkdirSync(dirname(filename), { recursive: true });
  writeFileSync(filename, content);
}
