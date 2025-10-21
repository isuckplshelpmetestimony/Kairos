# Feature Flags

This document explains how to enable/disable features in the Kairos application using feature flags.

## Property Type Dropdown

The "Select Property Type" dropdown has been temporarily hidden but can be easily re-enabled.

### How to Turn On Property Type Dropdown

1. **Open the file**: `Kairos/src/App.tsx`
2. **Find the feature flags section** (around line 33):
   ```typescript
   const FEATURE_FLAGS = {
     PROPERTY_TYPE_DROPDOWN: false, // Set to true to show property type selection
     COMPARISONS_DROPDOWN: true, // Enable when 5+ clients request this feature
   };
   ```
3. **Change the value** from `false` to `true`:
   ```typescript
   const FEATURE_FLAGS = {
     PROPERTY_TYPE_DROPDOWN: true, // Set to true to show property type selection
     COMPARISONS_DROPDOWN: true, // Enable when 5+ clients request this feature
   };
   ```
4. **Save the file** - the property type dropdown will immediately appear

### How to Turn Off Property Type Dropdown

1. **Open the file**: `Kairos/src/App.tsx`
2. **Find the feature flags section** (around line 33)
3. **Change the value** from `true` to `false`:
   ```typescript
   PROPERTY_TYPE_DROPDOWN: false, // Set to true to show property type selection
   ```
4. **Save the file** - the property type dropdown will be hidden

## Other Feature Flags

### Comparisons Dropdown
- **File**: `Kairos/src/App.tsx`
- **Flag**: `COMPARISONS_DROPDOWN`
- **Purpose**: Controls the entire comparisons dropdown panel
- **Current Status**: `true` (enabled)

## Notes

- Feature flags are located at the top of `App.tsx` for easy access
- Changes take effect immediately after saving the file
- No code deletion is required - features are simply hidden/shown
- All feature flag logic is contained within the `FEATURE_FLAGS` object
