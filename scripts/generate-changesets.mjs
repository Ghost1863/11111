#!/usr/bin/env node
/**
 * Generates .changeset/*.md files from conventional commits since the last release.
 *
 * Commit format:  type(scope): description
 * Breaking:       type(scope)!: description  OR  footer "BREAKING CHANGE: ..."
 *
 * Bump rules:
 *   BREAKING CHANGE / !   → major
 *   feat                  → minor
 *   fix | perf | refactor → patch
 *   everything else       → ignored
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'

// ─── Config ───────────────────────────────────────────────────────────────────

/** Maps commit scope (without "medusa-" prefix) → npm package name */
const SCOPE_TO_PACKAGE = {
  '1c':                  '@gorgo/medusa-1c',
  'feed-yandex':         '@gorgo/medusa-feed-yandex',
  'fulfillment-apiship': '@gorgo/medusa-fulfillment-apiship',
  'payment-robokassa':   '@gorgo/medusa-payment-robokassa',
  'payment-tkassa':      '@gorgo/medusa-payment-tkassa',
  'scrapper':            'plugin-scraper',
  'site':                'site',
  'test':                '@immortal1864/test-plugin',
}

const BUMP_BY_TYPE = {
  feat:     'minor',
  fix:      'patch',
  perf:     'patch',
  refactor: 'patch',
}

const CHANGESET_DIR = path.resolve('.changeset')

// ─── Git helpers ──────────────────────────────────────────────────────────────

/**
 * Base ref priority:
 *   1. Last "chore: release packages" commit — between releases, multiple pushes case
 *   2. Last git tag — right after a release
 *   3. null — very first run
 */
function getBaseRef() {
  try {
    const hash = execSync(
      'git log --format=%H --grep="^chore: release packages$" -1',
      { encoding: 'utf8' }
    ).trim()
    if (hash) return hash
  } catch { /* ignore */ }

  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim()
  } catch { /* ignore */ }

  return null
}

function getCommitsSince(ref) {
  const range = ref ? `${ref}..HEAD` : 'HEAD'
  const raw = execSync(
    `git log ${range} --format="---COMMIT---%n%H%n%s%n%b%n---END---"`,
    { encoding: 'utf8' }
  )
  return parseCommits(raw)
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

const SUBJECT_RE = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<desc>.+)$/

function parseCommits(raw) {
  return raw
    .split('---COMMIT---')
    .filter(b => b.includes('---END---'))
    .map(block => {
      const lines = block.replace('---END---', '').trim().split('\n')
      const [hash, subject, ...bodyLines] = lines
      const body = bodyLines.join('\n').trim()

      const match = subject?.match(SUBJECT_RE)
      if (!match) return null

      const { type, scope, breaking, desc } = match.groups
      const hasBreakingFooter = /^BREAKING CHANGE:/m.test(body)
      const breakingNote = hasBreakingFooter
        ? body.match(/^BREAKING CHANGE:\s*(.+)/m)?.[1]
        : null

      return {
        hash:      hash?.trim(),
        type:      type?.trim(),
        scope:     scope?.trim() ?? null,
        desc:      desc?.trim(),
        body:      body || null,
        isBreaking: !!breaking || hasBreakingFooter,
        breakingNote,
      }
    })
    .filter(Boolean)
}

// ─── Deduplication ────────────────────────────────────────────────────────────

/** Collects hashes from existing auto-*.md to avoid duplicates on re-runs. */
function getProcessedHashes() {
  const hashes = new Set()
  if (!existsSync(CHANGESET_DIR)) return hashes

  for (const file of readdirSync(CHANGESET_DIR)) {
    if (!file.startsWith('auto-') || !file.endsWith('.md')) continue
    const content = readFileSync(path.join(CHANGESET_DIR, file), 'utf8')
    // first non-frontmatter line contains the short hash we stored
    const match = content.match(/^<!-- hash:([0-9a-f]{7}) -->$/m)
    if (match) hashes.add(match[1])
  }
  return hashes
}

// ─── Changeset writer ─────────────────────────────────────────────────────────

function resolveBump(commit) {
  if (commit.isBreaking) return 'major'
  return BUMP_BY_TYPE[commit.type] ?? null
}

function buildContent(packageName, bump, commit) {
  const shortHash = commit.hash?.slice(0, 7) ?? ''
  const lines = [
    '---',
    `"${packageName}": ${bump}`,
    '---',
    '',
    `<!-- hash:${shortHash} -->`,  // used for deduplication, stripped by changeset
    commit.desc,
  ]

  if (commit.body) lines.push('', commit.body)
  if (commit.breakingNote) lines.push('', `BREAKING CHANGE: ${commit.breakingNote}`)

  return lines.join('\n') + '\n'
}

function writeChangeset(packageName, bump, commit) {
  const id = randomBytes(4).toString('hex')
  const filename = path.join(CHANGESET_DIR, `auto-${id}.md`)
  writeFileSync(filename, buildContent(packageName, bump, commit), 'utf8')
  console.log(`  ✔ ${filename}  [${packageName}: ${bump}]`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(CHANGESET_DIR)) mkdirSync(CHANGESET_DIR, { recursive: true })

  const baseRef = getBaseRef()
  console.log(`\nGenerating changesets since: ${baseRef ?? '(beginning of history)'}`)

  const commits = getCommitsSince(baseRef)
  console.log(`Found ${commits.length} conventional commit(s)`)

  const processed = getProcessedHashes()
  console.log(`Already processed: ${processed.size}\n`)

  let generated = 0

  for (const commit of commits) {
    const shortHash = commit.hash?.slice(0, 7) ?? ''

    if (processed.has(shortHash)) {
      console.log(`  – dup   [${shortHash}] ${commit.desc}`)
      continue
    }

    const bump = resolveBump(commit)
    if (!bump) {
      console.log(`  – skip  [${commit.type}(${commit.scope ?? ''}): ${commit.desc}]`)
      continue
    }

    const packageName = commit.scope ? SCOPE_TO_PACKAGE[commit.scope] : null
    if (!packageName) {
      console.log(`  – skip  unknown scope "${commit.scope}" in: ${commit.desc}`)
      continue
    }

    writeChangeset(packageName, bump, commit)
    generated++
  }

  console.log(`\nDone. Generated ${generated} changeset file(s).`)
}

main()
