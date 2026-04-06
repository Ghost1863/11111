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

function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim()
  } catch {
    return null // no tags yet → use all commits
  }
}

function getCommitsSince(ref) {
  const range = ref ? `${ref}..HEAD` : 'HEAD'
  const raw = execSync(
    `git log ${range} --format="---COMMIT---%n%H%n%s%n%b%n---END---"`,
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
      hash: hash?.trim(),
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

function buildChangesetContent(packageName, bump, commit) {
  const lines = ['---', `"${packageName}": ${bump}`, '---', '']

  lines.push(commit.desc)

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

  const lastTag = getLastTag()
  console.log(`\nGenerating changesets since: ${lastTag ?? '(beginning of history)'}`)

  const commits = getCommitsSince(lastTag)
  console.log(`Found ${commits.length} conventional commit(s)\n`)

  let generated = 0

  for (const commit of commits) {
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
