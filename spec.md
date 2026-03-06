# Omnis Sovereign OS

## Current State

- Registration form has a single "Full Name" text input (placeholder: "SMITH, John A") and a branch → rank cascading dropdown.
- Rank dropdown shows ALL ranks for a branch in one flat list (25+ items for Army).
- PersonnelPage EditModal has a single "Name" text input for the profile name field and a single "Rank" text input.
- Name is stored/displayed as a single concatenated string (e.g. "SGT SMITH, John A").
- Branch rank data (`BRANCH_RANKS`) is defined only in RegistrationGatePage.tsx.

## Requested Changes (Diff)

### Add
- `BRANCH_RANK_CATEGORIES` data structure in constants.ts: maps each branch to categories (Enlisted, Officer, Warrant Officer where applicable), and each category to its rank list.
- Three separate name inputs everywhere a name is entered: Last Name, First Name, Middle Initial (max 1 char).
- Category dropdown between Branch and Rank dropdowns: filters rank list by selected category.
- Auto-format utility: given `{ rank, lastName, firstName, mi }` produces `RANK LAST, First MI` (e.g. `SGT SMITH, John A`). MI is omitted if blank.
- Display name auto-formatted on: profile cards (PersonnelPage), TopNav display name, email directory, onboarding page.

### Modify
- RegistrationGatePage.tsx:
  - Replace single "Full Name" input with three inputs: Last Name, First Name, Middle Initial.
  - Replace flat rank dropdown with three-dropdown flow: Branch → Category → Rank.
  - Concatenate name on submit using format utility before passing to `registerProfile`.
- PersonnelPage.tsx EditModal:
  - Replace single "Name" input with three split inputs: Last Name, First Name, MI.
  - Replace single "Rank" text input with three-dropdown flow: Branch → Category → Rank (same component).
  - On save, concatenate name using format utility.
  - LockedField for name shows the formatted display name (single read-only field).
- constants.ts: add `BRANCH_RANK_CATEGORIES` export replacing the inline `BRANCH_RANKS` in RegistrationGatePage.

### Remove
- Inline `BRANCH_RANKS` constant from RegistrationGatePage.tsx (moved to constants.ts as part of `BRANCH_RANK_CATEGORIES`).

## Implementation Plan

1. Add `BRANCH_RANK_CATEGORIES` to `constants.ts` — structure: `Record<branch, Record<category, string[]>>`. Derive flat `BRANCH_RANKS` from it for backward compat if needed.
2. Create shared `RankSelector` component (`src/frontend/src/components/shared/RankSelector.tsx`) — three Select dropdowns: Branch, Category, Rank. Props: `branch`, `category`, `rank`, onChange handlers for each, disabled state.
3. Create `formatDisplayName(rank, lastName, firstName, mi)` utility in `lib/utils.ts` — returns `RANK LAST, First MI` string.
4. Update `RegistrationGatePage.tsx`:
   - Replace single name input with Last/First/MI inputs.
   - Use `RankSelector` component.
   - On submit, format name via utility before API call.
5. Update `PersonnelPage.tsx` EditModal:
   - Split name state into `lastName`, `firstName`, `mi`.
   - Parse existing `profile.name` back into parts on modal open (best-effort split on comma and space).
   - Use `RankSelector` for rank editing (S2 admin always can edit).
   - On save, format name via utility.
   - LockedField renders formatted display name.
6. Validate: typecheck, lint, build.
