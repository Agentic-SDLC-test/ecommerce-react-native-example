#!/usr/bin/env node
// Turns the result of `eas build --json` into the build record that CI publishes:
// a manifest, release notes, a shell-sourceable env file, and optionally an npm
// package directory. GitHub Actions and Bitbucket Pipelines both call this so the
// two providers cannot drift in what they record about an EAS build.
//
// The binary itself stays on expo.dev; this record links back to it and carries
// the digest so an archived copy can be verified against the real build.
//
// Usage:
//   node scripts/eas-build-manifest.mjs --build-output eas-build-output.json \
//     --eas-config eas-config.json --apk build-artifacts/app.apk \
//     --platform android --profile staging --provider github \
//     --commit "$SHA" --branch main --run-url "$URL" [--package-name @scope/name]
//   node scripts/eas-build-manifest.mjs --self-check

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

const SCHEMA_VERSION = 1;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return '';
}

// `eas build --json` emits an array of build objects; a single-platform build has one.
function readBuild(buildOutputPath) {
  const parsed = JSON.parse(readFileSync(buildOutputPath, 'utf8'));
  const build = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!build || typeof build !== 'object') {
    throw new Error(`No build object found in ${buildOutputPath}`);
  }
  return build;
}

function digestFile(path) {
  const contents = readFileSync(path);
  return {
    digest: `sha256:${createHash('sha256').update(contents).digest('hex')}`,
    sizeBytes: statSync(path).size,
  };
}

function expoProject(build) {
  return {
    account: firstString(build.project?.ownerAccount?.name, build.project?.ownerAccount?.username),
    slug: firstString(build.project?.slug, build.project?.name),
  };
}

function buildPageUrl(build) {
  const { account, slug } = expoProject(build);
  const id = firstString(build.id);
  if (!account || !slug || !id) return '';
  return `https://expo.dev/accounts/${account}/projects/${slug}/builds/${id}`;
}

function buildManifest({ build, apkPath, platform, profile, provider, commit, branch, runUrl, now }) {
  const appVersion = firstString(build.appVersion, 'unknown');
  const buildNumber = firstString(build.appBuildVersion, String(build.buildNumber ?? ''), 'unknown');
  const resolvedProfile = firstString(profile, build.buildProfile, 'unknown');
  const artifact = apkPath ? digestFile(apkPath) : { digest: '', sizeBytes: 0 };

  return {
    schemaVersion: SCHEMA_VERSION,
    // Valid semver prerelease, unique per EAS build, usable as both a package
    // version and (prefixed with v) a git tag.
    version: `${appVersion}-${resolvedProfile}.${buildNumber}`,
    app: {
      version: appVersion,
      buildNumber,
      platform: firstString(platform, build.platform).toLowerCase(),
      profile: resolvedProfile,
    },
    easBuild: {
      id: firstString(build.id),
      status: firstString(build.status),
      project: expoProject(build),
      pageUrl: buildPageUrl(build),
      applicationArchiveUrl: firstString(
        build.artifacts?.applicationArchiveUrl,
        build.artifacts?.buildUrl,
      ),
      completedAt: firstString(build.completedAt, build.updatedAt),
    },
    // The archived copy of the binary, if CI downloaded one. digest lets anyone
    // verify an archived file really is the artifact expo.dev produced.
    archivedArtifact: apkPath
      ? { fileName: basename(apkPath), digest: artifact.digest, sizeBytes: artifact.sizeBytes }
      : null,
    source: {
      commit: firstString(commit, build.gitCommitHash),
      branch: firstString(branch, build.gitRef),
    },
    ci: { provider: firstString(provider), runUrl: firstString(runUrl) },
    recordedAt: now,
  };
}

function releaseNotes(manifest) {
  const lines = [
    `EAS ${manifest.app.platform} build \`${manifest.app.profile}\` — app version ${manifest.app.version}, build ${manifest.app.buildNumber}.`,
    '',
    'The binary is produced and hosted by EAS. Expo deletes build artifacts after 90 days,',
    'so the copy attached here is the long-term archive.',
    '',
    `- EAS build ID: \`${manifest.easBuild.id || 'unknown'}\``,
  ];
  if (manifest.easBuild.pageUrl) lines.push(`- Build on expo.dev: ${manifest.easBuild.pageUrl}`);
  if (manifest.easBuild.applicationArchiveUrl) {
    lines.push(`- Artifact URL: ${manifest.easBuild.applicationArchiveUrl}`);
  }
  if (manifest.archivedArtifact) {
    lines.push(`- Archived artifact: \`${manifest.archivedArtifact.fileName}\``);
    lines.push(`- Digest: \`${manifest.archivedArtifact.digest}\``);
  }
  if (manifest.source.commit) lines.push(`- Commit: \`${manifest.source.commit}\``);
  if (manifest.ci.runUrl) lines.push(`- CI run: ${manifest.ci.runUrl}`);
  return `${lines.join('\n')}\n`;
}

function envFile(manifest) {
  const entries = {
    BUILD_RECORD_VERSION: manifest.version,
    BUILD_RECORD_TAG: `v${manifest.version}`,
    APP_VERSION: manifest.app.version,
    APP_BUILD_NUMBER: manifest.app.buildNumber,
    APP_PLATFORM: manifest.app.platform,
    APP_PROFILE: manifest.app.profile,
    EAS_BUILD_ID: manifest.easBuild.id,
    EAS_PROJECT_SLUG: manifest.easBuild.project.slug,
    EAS_BUILD_PAGE_URL: manifest.easBuild.pageUrl,
    EAS_ARTIFACT_URL: manifest.easBuild.applicationArchiveUrl,
    ARCHIVED_ARTIFACT_FILE: manifest.archivedArtifact?.fileName ?? '',
    ARCHIVED_ARTIFACT_DIGEST: manifest.archivedArtifact?.digest ?? '',
  };
  return `${Object.entries(entries)
    .map(([key, value]) => `${key}='${String(value).replace(/'/g, "'\\''")}'`)
    .join('\n')}\n`;
}

function writePackageDir({
  dir,
  packageName,
  packageRegistry,
  manifest,
  manifestPath,
  buildOutputPath,
  easConfigPath,
}) {
  mkdirSync(dir, { recursive: true });
  const files = ['build-manifest.json', 'eas-build-output.json', 'eas-config.json', 'README.md'];
  writeFileSync(
    join(dir, 'package.json'),
    `${JSON.stringify(
      {
        name: packageName,
        version: manifest.version,
        description: `Build record for ${manifest.app.platform} ${manifest.app.profile} build ${manifest.app.buildNumber} (app ${manifest.app.version})`,
        // No binaries: this package points at the artifact hosted on expo.dev.
        files,
        easBuild: manifest.easBuild,
        // Pinning the registry here is what lets CI publish with a bare
        // `npm publish` and an auth-only .npmrc, with no scope mapping to keep
        // in sync with the package name.
        publishConfig: { access: 'restricted', ...(packageRegistry ? { registry: packageRegistry } : {}) },
      },
      null,
      2,
    )}\n`,
  );
  copyFileSync(manifestPath, join(dir, 'build-manifest.json'));
  copyFileSync(buildOutputPath, join(dir, 'eas-build-output.json'));
  if (easConfigPath) copyFileSync(easConfigPath, join(dir, 'eas-config.json'));
  writeFileSync(join(dir, 'README.md'), releaseNotes(manifest));
  return dir;
}

function generate(args) {
  const outDir = typeof args['out-dir'] === 'string' ? args['out-dir'] : '.';
  const buildOutputPath = typeof args['build-output'] === 'string' ? args['build-output'] : 'eas-build-output.json';
  const easConfigPath = typeof args['eas-config'] === 'string' ? args['eas-config'] : undefined;
  const apkPath = typeof args.apk === 'string' ? args.apk : undefined;

  const manifest = buildManifest({
    build: readBuild(buildOutputPath),
    apkPath,
    platform: typeof args.platform === 'string' ? args.platform : '',
    profile: typeof args.profile === 'string' ? args.profile : '',
    provider: typeof args.provider === 'string' ? args.provider : '',
    commit: typeof args.commit === 'string' ? args.commit : '',
    branch: typeof args.branch === 'string' ? args.branch : '',
    runUrl: typeof args['run-url'] === 'string' ? args['run-url'] : '',
    now: new Date().toISOString(),
  });

  mkdirSync(outDir, { recursive: true });
  const manifestPath = join(outDir, 'build-manifest.json');
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(join(outDir, 'RELEASE_NOTES.md'), releaseNotes(manifest));
  writeFileSync(join(outDir, 'build-record.env'), envFile(manifest));

  if (typeof args['package-name'] === 'string') {
    writePackageDir({
      dir: join(outDir, typeof args['package-dir'] === 'string' ? args['package-dir'] : 'build-record-package'),
      packageName: args['package-name'],
      packageRegistry: typeof args['package-registry'] === 'string' ? args['package-registry'] : '',
      manifest,
      manifestPath,
      buildOutputPath,
      easConfigPath,
    });
  }

  return manifest;
}

function selfCheck() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`self-check failed: ${message}`);
  };

  const dir = mkdtempSync(join(tmpdir(), 'eas-manifest-'));
  writeFileSync(
    join(dir, 'eas-build-output.json'),
    JSON.stringify([
      {
        id: 'build-abc',
        status: 'FINISHED',
        platform: 'ANDROID',
        appVersion: '1.2.3',
        appBuildVersion: '42',
        buildProfile: 'staging',
        project: { slug: 'easybuy', ownerAccount: { name: 'acme' } },
        // Signed EAS URLs carry query strings; the env file must survive `source`.
        artifacts: { applicationArchiveUrl: 'https://expo.dev/artifacts/eas/xyz.apk?sig=a&exp=1' },
      },
    ]),
  );
  writeFileSync(join(dir, 'eas-config.json'), '{"android":{}}');
  mkdirSync(join(dir, 'build-artifacts'));
  writeFileSync(join(dir, 'build-artifacts', 'app.apk'), 'not-a-real-apk');

  const manifest = generate({
    'build-output': join(dir, 'eas-build-output.json'),
    'eas-config': join(dir, 'eas-config.json'),
    apk: join(dir, 'build-artifacts', 'app.apk'),
    platform: 'android',
    profile: 'staging',
    provider: 'github',
    commit: 'deadbeef',
    branch: 'main',
    'run-url': 'https://example.test/run/1',
    'out-dir': join(dir, 'out'),
    'package-name': '@acme/easybuy-android-build',
    'package-registry': 'https://npm.apkg.io/acme/',
  });

  assert(manifest.version === '1.2.3-staging.42', `version was ${manifest.version}`);
  assert(
    manifest.easBuild.pageUrl === 'https://expo.dev/accounts/acme/projects/easybuy/builds/build-abc',
    `page url was ${manifest.easBuild.pageUrl}`,
  );
  const artifactUrl = 'https://expo.dev/artifacts/eas/xyz.apk?sig=a&exp=1';
  assert(manifest.easBuild.applicationArchiveUrl === artifactUrl, 'artifact url missing');
  assert(/^sha256:[0-9a-f]{64}$/.test(manifest.archivedArtifact.digest), 'digest malformed');
  assert(manifest.archivedArtifact.sizeBytes === 14, `size was ${manifest.archivedArtifact.sizeBytes}`);
  assert(manifest.source.commit === 'deadbeef' && manifest.ci.provider === 'github', 'source/ci missing');

  const env = readFileSync(join(dir, 'out', 'build-record.env'), 'utf8');
  assert(env.includes("BUILD_RECORD_TAG='v1.2.3-staging.42'"), 'env tag missing');
  assert(env.includes("EAS_BUILD_ID='build-abc'"), 'env build id missing');
  assert(env.includes("EAS_PROJECT_SLUG='easybuy'"), 'env project slug missing');

  const sourced = execFileSync('bash', [
    '-c',
    `set -u; . "${join(dir, 'out', 'build-record.env')}"; printf %s "$EAS_ARTIFACT_URL"`,
  ]).toString();
  assert(sourced === artifactUrl, `sourcing the env file mangled the url: ${sourced}`);

  const pkg = JSON.parse(readFileSync(join(dir, 'out', 'build-record-package', 'package.json'), 'utf8'));
  assert(pkg.name === '@acme/easybuy-android-build', 'package name wrong');
  assert(pkg.version === '1.2.3-staging.42', 'package version wrong');
  assert(!JSON.stringify(pkg.files).includes('.apk'), 'package must not ship binaries');
  assert(pkg.publishConfig.registry === 'https://npm.apkg.io/acme/', 'publishConfig registry missing');

  const notes = readFileSync(join(dir, 'out', 'RELEASE_NOTES.md'), 'utf8');
  assert(notes.includes('app version 1.2.3, build 42'), 'notes missing version line');

  // A build whose artifact URL never arrived must still produce a usable record.
  writeFileSync(join(dir, 'empty-build.json'), JSON.stringify([{ id: 'b2', appVersion: '9.9.9' }]));
  const partial = generate({
    'build-output': join(dir, 'empty-build.json'),
    profile: 'staging',
    'out-dir': join(dir, 'out2'),
  });
  assert(partial.version === '9.9.9-staging.unknown', `partial version was ${partial.version}`);
  assert(partial.archivedArtifact === null, 'archivedArtifact should be null without an apk');

  console.log('self-check passed');
}

const args = parseArgs(process.argv.slice(2));
if (args['self-check']) {
  selfCheck();
} else {
  const manifest = generate(args);
  console.log(`build record ${manifest.version} written`);
}
