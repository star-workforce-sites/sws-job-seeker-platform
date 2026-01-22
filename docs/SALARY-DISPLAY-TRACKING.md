# Salary Display Tracking

## Current Status: HOURLY RATE (Temporary)

**Last Updated:** January 21, 2026  
**Changed By:** System Update  
**Status:** ⚠️ TEMPORARY CONVERSION

---

## Current Implementation

### Display Format
Jobs are currently displayed with **HOURLY RATES** calculated from annual salaries.

**Conversion Formula:**
```
Hourly Rate = Annual Salary / 2080 hours
(2080 = 52 weeks × 40 hours)
```

**Example:**
- Database: `salaryMin: 150000, salaryMax: 180000`
- Display: "$72.12/hr - $86.54/hr"

### Code Location
**File:** `app/api/jobs/list/route.ts`  
**Lines:** SQL query CASE statement for salary field

```sql
CASE 
  WHEN j."salaryMin" IS NOT NULL AND j."salaryMax" IS NOT NULL 
  THEN '$' || ROUND(j."salaryMin"::numeric / 2080, 2) || '/hr - $' || ROUND(j."salaryMax"::numeric / 2080, 2) || '/hr'
  WHEN j."salaryMin" IS NOT NULL 
  THEN '$' || ROUND(j."salaryMin"::numeric / 2080, 2) || '/hr+'
  ELSE 'Competitive'
END as salary
```

---

## Why This Change Was Made

1. **Consulting/Contract Jobs** - Hourly rates are more relevant than annual salaries
2. **Industry Standard** - Contractors typically work on hourly basis
3. **Database Limitation** - Current schema stores annual salaries only
4. **User Experience** - More accurate representation for contract work

---

## TODO: Revert to Annual OR Update Database

### Option A: Revert to Annual Display

**When:** If annual salaries are more appropriate

**Steps:**
1. Edit `app/api/jobs/list/route.ts`
2. Replace salary CASE statement with:
```sql
CASE 
  WHEN j."salaryMin" IS NOT NULL AND j."salaryMax" IS NOT NULL 
  THEN '$' || j."salaryMin" || ' - $' || j."salaryMax"
  WHEN j."salaryMin" IS NOT NULL 
  THEN '$' || j."salaryMin" || '+'
  ELSE 'Competitive'
END as salary
```
3. Commit with message: "revert: Display annual salary instead of hourly rate"
4. Delete or update this tracking document

---

### Option B: Update Database Schema (Recommended)

**When:** For permanent hourly rate support

**Steps:**

1. **Add new columns to jobs table:**
```sql
ALTER TABLE jobs 
  ADD COLUMN hourly_min DECIMAL(10,2),
  ADD COLUMN hourly_max DECIMAL(10,2);
```

2. **Migrate existing data:**
```sql
UPDATE jobs 
SET 
  hourly_min = ROUND(salary_min::numeric / 2080, 2),
  hourly_max = ROUND(salary_max::numeric / 2080, 2)
WHERE salary_min IS NOT NULL;
```

3. **Update API to use new columns:**
```sql
CASE 
  WHEN j."hourlyMin" IS NOT NULL AND j."hourlyMax" IS NOT NULL 
  THEN '$' || j."hourlyMin" || '/hr - $' || j."hourlyMax" || '/hr'
  WHEN j."hourlyMin" IS NOT NULL 
  THEN '$' || j."hourlyMin" || '/hr+'
  ELSE 'Competitive'
END as salary
```

4. **Update job posting forms** to accept hourly rates
5. **Update Prisma schema:**
```prisma
model jobs {
  // ... existing fields ...
  salaryMin   Int?
  salaryMax   Int?
  hourlyMin   Decimal? @db.Decimal(10, 2)
  hourlyMax   Decimal? @db.Decimal(10, 2)
}
```

6. **Run migration:**
```bash
npx prisma db push
npx prisma generate
```

---

## Related Files

- **API Route:** `app/api/jobs/list/route.ts`
- **Database Schema:** `prisma/schema.prisma`
- **Jobs Page:** `app/jobs/page.tsx`
- **Sample Jobs Script:** `scripts/add-sample-jobs.sql`

---

## Testing Checklist

After making changes, verify:

- [ ] Jobs display correct salary format
- [ ] Filters still work (industry, location, type)
- [ ] Salary displays for all job types
- [ ] "Competitive" shows when no salary data
- [ ] Mobile display looks correct
- [ ] Search functionality works

---

## Change Log

| Date | Change | Reason | Changed By |
|------|--------|--------|------------|
| 2026-01-21 | Implemented hourly rate calculation (annual / 2080) | Contract/consulting jobs need hourly rates | Automated Script |
| TBD | Revert or migrate to database column | Decision pending | TBD |

---

**IMPORTANT:** Update this document when salary display logic changes!
