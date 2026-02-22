#!/bin/bash
# ============================================================
# promote-recruiters.sh
# Run this AFTER recruiters have registered on the site.
# Promotes users from 'jobseeker' to 'recruiter' role in DB.
#
# USAGE:
#   cd "/c/Users/STAR Workforce/projects/sws-job-seeker-platform"
#   chmod +x scripts/promote-recruiters.sh
#   ./scripts/promote-recruiters.sh
#
# ADD RECRUITER EMAILS BELOW before running.
# ============================================================

PROJECT_DIR="/c/Users/STAR Workforce/projects/sws-job-seeker-platform"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$HOME/Downloads/promote-recruiters-${TIMESTAMP}.log"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "============================================================"
echo "  Recruiter Promotion Script"
echo "  $(date)"
echo "  Log: $LOG_FILE"
echo "============================================================"
echo ""

cd "$PROJECT_DIR"

# ── ADD YOUR 5 RECRUITER EMAILS HERE ─────────────────────────
# Format: "email@starworkforcesolutions.com"
# Add one per line inside the parentheses.
RECRUITER_EMAILS=(
  # "recruiter1@starworkforcesolutions.com"
  # "recruiter2@starworkforcesolutions.com"
  # "recruiter3@starworkforcesolutions.com"
  # "recruiter4@starworkforcesolutions.com"
  # "recruiter5@starworkforcesolutions.com"
)

if [ ${#RECRUITER_EMAILS[@]} -eq 0 ]; then
  echo "❌ ERROR: No recruiter emails configured."
  echo "   Open scripts/promote-recruiters.sh and add emails to RECRUITER_EMAILS array."
  exit 1
fi

echo "Recruiter emails to promote:"
for email in "${RECRUITER_EMAILS[@]}"; do
  echo "  - $email"
done
echo ""

# ── Write promotion query script ─────────────────────────────
cat > "$PROJECT_DIR/tmp-promote-recruiters.mjs" << 'NODESCRIPT'
import { readFileSync } from 'fs'

function loadEnv(filePath) {
  try {
    const lines = readFileSync(filePath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {}
}

loadEnv('.env.local')
loadEnv('.env')

const { neon } = await import('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

const emails = JSON.parse(process.env.RECRUITER_EMAILS_JSON)

console.log(`Processing ${emails.length} recruiter email(s)...`)
console.log('')

for (const email of emails) {
  // Check if user exists
  const existing = await sql`
    SELECT id, name, email, role FROM users WHERE email = ${email}
  `

  if (existing.length === 0) {
    console.log(`  ⚠ NOT FOUND: ${email} — has this recruiter registered yet?`)
    continue
  }

  const user = existing[0]

  if (user.role === 'recruiter') {
    console.log(`  ✔ ALREADY RECRUITER: ${email} (${user.name}) — skipped`)
    continue
  }

  // Promote to recruiter
  await sql`
    UPDATE users SET role = 'recruiter', updated_at = NOW()
    WHERE email = ${email}
  `
  console.log(`  ✅ PROMOTED: ${email} (${user.name}) → role: recruiter`)
}

console.log('')
console.log('--- Final recruiter list ---')
const recruiters = await sql`
  SELECT name, email, role FROM users
  WHERE role = 'recruiter'
  ORDER BY name ASC
`
if (recruiters.length === 0) {
  console.log('  (no recruiters in system yet)')
} else {
  recruiters.forEach(r => console.log(`  ${r.name} | ${r.email}`))
}
NODESCRIPT

# Pass emails as JSON env var
EMAILS_JSON=$(printf '%s\n' "${RECRUITER_EMAILS[@]}" | node -e "
const lines = [];
process.stdin.on('data', d => lines.push(...d.toString().split('\n')));
process.stdin.on('end', () => {
  const emails = lines.map(l => l.trim()).filter(Boolean);
  console.log(JSON.stringify(emails));
});
")

RECRUITER_EMAILS_JSON="$EMAILS_JSON" node "$PROJECT_DIR/tmp-promote-recruiters.mjs"
rm -f "$PROJECT_DIR/tmp-promote-recruiters.mjs"

echo ""
echo "============================================================"
echo "  PROMOTION COMPLETE"
echo "  Log: $LOG_FILE"
echo "============================================================"
