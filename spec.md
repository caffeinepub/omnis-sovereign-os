# Omnis Sovereign OS — Step B: Network Mode Selector

## Current State

The platform has no concept of deployment network mode. All users see identical UI terminology regardless of whether they are a military unit (NIPR/SIPR) or a corporate organization (Standard/Secure). Network mode was discussed in planning as a key differentiator but has never been implemented.

The codebase has:
- No NetworkMode type or context
- No first-run setup flow for selecting mode
- All classification/clearance labels hardcoded as UNCLASSIFIED, CUI, SECRET, TOP SECRET, TS/SCI
- No storage or retrieval of mode preference
- Settings page has a static "Display" section with no mode control
- Governance and Settings pages are functional stubs

## Requested Changes (Diff)

### Add
- `NetworkModeContext` — React context providing the current network mode (`military-nipr` | `military-sipr` | `corporate-standard` | `corporate-secure`) and a setter. Persisted to `localStorage` under `omnis_network_mode`.
- `NetworkModeSetupPage` — A first-run/S2-accessible page (`/network-mode-setup`) where an S2 admin or the system owner can select the deployment network mode. Shows the four options with descriptions, visual distinction between Military and Corporate groups. Not nested under AuthenticatedLayout (accessible during initial setup). Also accessible from Settings for S2 admins post-setup.
- Network mode display badge in `TopNav` — a small pill badge next to the OMNIS wordmark showing the current mode (e.g., `NIPR`, `SIPR`, `STANDARD`, `SECURE`). Hidden if mode is not yet set.
- `useNetworkMode` hook — convenience wrapper for the context.
- Network mode card in `SettingsPage` — shows the current mode, what it means, and (for S2 admins) a link to change it.

### Modify
- `constants.ts` — Add `NETWORK_MODE_LABELS`, `NETWORK_MODE_DESCRIPTIONS`, and a `getNetworkModeConfig(mode)` helper that returns the adapted terminology for classification labels, jargon, and monitoring sensitivity.
- `SettingsPage` — Replace the static Display section content with a live Network Mode section showing mode-aware terminology. Add "Change Mode" link for S2 admins.
- `Router.tsx` — Add `/network-mode-setup` route (outside of authRoute, like `/register`).
- `LoginPage.tsx` / first-run flow — After completing registration, if no network mode is set, route to `/network-mode-setup` before onboarding. S2 admins can also access it from Settings.
- `HubPage.tsx` — Show a one-time banner prompting S2 admin to set network mode if it hasn't been configured yet.

### Remove
- Nothing removed

## Implementation Plan

1. Add `NetworkModeContext.tsx` with four mode values, descriptions, localStorage persistence, and a `useNetworkMode` hook.
2. Update `constants.ts` to add `NETWORK_MODE_CONFIGS` with Military NIPR, Military SIPR, Corporate Standard, Corporate Secure configs — each containing a label, short code, description, and classification terminology override.
3. Build `NetworkModeSetupPage.tsx` — clean selection UI with two groups (Military, Corporate), mode cards, and a confirm button. Routes to `/onboarding` on completion.
4. Add `/network-mode-setup` route to `Router.tsx` (outside authRoute).
5. Add network mode badge to `TopNav` (beside OMNIS wordmark).
6. Add network mode section to `SettingsPage` with current mode display and S2 admin change link.
7. Add hub banner to `HubPage.tsx` prompting S2 admin to configure network mode if unset.
8. Validate and build.
