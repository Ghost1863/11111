#!/usr/bin/env node
/**
 * Generates .changeset/*.md files from conventional commits since the last git tag.
 *
 * Commit format:  type(scope): description
 * Breaking:       type(scope)!: description  OR  footer "BREAKING CHANGE: ..."
 *
 * Bump rules:
 *   BREAKING CHANGE / !  → major
 *   feat                 → minor
 *   fix | perf | refactor → patch
 *   everything else      → ignored (no changeset)
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'

// ─── Config ──────────────────────────────────────────────────────────────────

/** Maps commit scope (without "medusa-" prefix) → npm package name */
const SCOPE_TO_PACKAGE = {
  '1c':                    '@gorgo/medusa-1c',
  'feed-yandex':           '@gorgo/medusa-feed-yandex',
  'fulfillment-apiship':   '@gorgo/medusa-fulfillment-apiship',
  'payment-robokassa':     '@gorgo/medusa-payment-robokassa',
  'payment-tkassa':        '@gorgo/medusa-payment-tkassa',
  'scrapper':              'plugin-scraper',
  'site':                  'site',
  'test':                  '@immortal1864/test-plugin',
}

/** Commit types that produce a changeset */
const BUMP_BY_TYPE = {
  feat:     'minor',
  fix:      'patch',
  perf:     'patch',
  refactor: 'patch',
}

const CHANGESET_DIR = path.resolve('.changeset')

// ─── Git helpers ─────────────────────────────────────────────────────────────

/**
 * Base ref priority:
 *   1. Last release commit "chore: release packages" — covers the case where
 *      multiple pushes happen before the release PR is merged.
 *   2. Last git tag — fallback after a real release.
 *   3. null — very first run, take all commits.
 */
function getBaseRef() {
  // 1. find last release commit by message
  try {
    const hash = execSync(
      'git log --format=%H --grep="^chore: release packages$" -1',
      { encoding: 'utf8' }
    ).trim()
    if (hash) return hash
  } catch { /* ignore */ }

  // 2. last tag
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim()
  } catch { /* ignore */ }

  return null
}

import { readdirSync, readFileSync } from 'node:fs'

/**
 * Reads commit hashes already recorded in existing auto-*.md changeset files
 * so we never create a duplicate for the same commit.
 */
function getAlreadyProcessedHashes() {
  const hashes = new Set()
  if (!existsSync(CHANGESET_DIR)) return hashes

  for (const file of readdirSync(CHANGESET_DIR)) {
    if (!file.startsWith('auto-') || !file.endsWith('.md')) continue
    const content = readFileSync(path.join(CHANGESET_DIR, file), 'utf8')
    // attribution line starts with the linked short hash: "[`3fba154`](...)"
    const match = content.match(/^\[`([0-9a-f]{7})`\]/m)
    if (match) hashes.add(match[1])
  }
  return hashes
}

function getCommitsSince(ref) {
  const range = ref ? `${ref}..HEAD` : 'HEAD'
  // %H = full hash, %an = author name, %ae = author email, %s = subject, %b = body
  const raw = execSync(
    `git log ${range} --format="---COMMIT---%n%H%n%an%n%ae%n%s%n%b%n---END---"`,
    { encoding: 'utf8' }
  )
  return parseCommits(raw)
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

const SUBJECT_RE = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<desc>.+)$/

function parseCommits(raw) {
  const blocks = raw.split('---COMMIT---').filter(b => b.includes('---END---'))
  return blocks.map(block => {
    const lines = block.replace('---END---', '').trim().split('\n')
    const [hash, authorName, authorEmail, subject, ...bodyLines] = lines
    const body = bodyLines.join('\n').trim()

    const match = subject?.match(SUBJECT_RE)
    if (!match) return null

    const { type, scope, breaking, desc } = match.groups
    const hasBreakingFooter = /^BREAKING CHANGE:/m.test(body)
    const breakingNote = hasBreakingFooter
      ? body.match(/^BREAKING CHANGE:\s*(.+)/m)?.[1]
      : null

    return {
      hash: hash?.trim(),
      authorName: authorName?.trim(),
      authorEmail: authorEmail?.trim(),
      type: type?.trim(),
      scope: scope?.trim() ?? null,
      desc: desc?.trim(),
      body: body || null,
      isBreaking: !!breaking || hasBreakingFooter,
      breakingNote,
    }
  }).filter(Boolean)
}

// ─── Bump resolution ─────────────────────────────────────────────────────────

function resolveBump(commit) {
  if (commit.isBreaking) return 'major'
  return BUMP_BY_TYPE[commit.type] ?? null
}

// ─── Changeset writer ─────────────────────────────────────────────────────────

const GITHUB_REPO = 'Ghost1863/11111'

/** Derives a GitHub username from the author email (works for noreply GitHub emails). */
function resolveGithubHandle(authorEmail) {
  // GitHub noreply format: 12345678+username@users.noreply.github.com
  const noreplyMatch = authorEmail?.match(/^\d+\+([^@]+)@users\.noreply\.github\.com$/)
  if (noreplyMatch) return noreplyMatch[1]
  return null
}

function buildChangesetContent(packageName, bump, commit) {
  const lines = ['---', `"${packageName}": ${bump}`, '---', '']

  // Attribution line matching @changesets/changelog-github format:
  // [`b67e30a`](https://github.com/owner/repo/commit/fullhash) Thanks [@Ghost1863](https://github.com/Ghost1863)! - description
  const shortHash = commit.hash?.slice(0, 7) ?? ''
  const commitUrl = `https://github.com/${GITHUB_REPO}/commit/${commit.hash}`
  const handle = resolveGithubHandle(commit.authorEmail)
  const authorPart = handle
    ? `[@${handle}](https://github.com/${handle})`
    : commit.authorName

  lines.push(`[\`${shortHash}\`](${commitUrl}) Thanks ${authorPart}! - ${commit.desc}`)

  if (commit.body) {
    lines.push('', commit.body)
  }

  if (commit.breakingNote) {
    lines.push('', `BREAKING CHANGE: ${commit.breakingNote}`)
  }

  return lines.join('\n') + '\n'
}

function writeChangeset(packageName, bump, commit) {
  const id = randomBytes(4).toString('hex')
  const filename = path.join(CHANGESET_DIR, `auto-${id}.md`)
  const content = buildChangesetContent(packageName, bump, commit)
  writeFileSync(filename, content, 'utf8')
  console.log(`  ✔ ${filename}  [${packageName}: ${bump}]`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(CHANGESET_DIR)) {
    mkdirSync(CHANGESET_DIR, { recursive: true })
  }

  const baseRef = getBaseRef()
  console.log(`\nGenerating changesets since: ${baseRef ?? '(beginning of history)'}`)

  const commits = getCommitsSince(baseRef)
  console.log(`Found ${commits.length} conventional commit(s)`)

  const processed = getAlreadyProcessedHashes()
  console.log(`Already processed hashes: ${processed.size}\n`)

  let generated = 0

  for (const commit of commits) {
    const shortHash = commit.hash?.slice(0, 7) ?? ''

    // skip commits already recorded in an existing auto-*.md
    if (processed.has(shortHash)) {
      console.log(`  – dup   [${shortHash}] ${commit.desc}`)
      continue
    }

    const bump = resolveBump(commit)
    if (!bump) {
      console.log(`  – skip  [${commit.type}(${commit.scope}): ${commit.desc}]`)
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
