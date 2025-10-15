# Font Synthesis Change Documentation

## Issue
The italic button in the TipTap editor was not displaying text in italics visually, even though it correctly added `<em>` tags to the HTML.

## Root Cause
The global CSS file (`src/style.css`) had `font-synthesis: none;` set on the `:root` selector. This CSS property prevents the browser from synthesizing font styles when the specified font family doesn't have native italic or bold variants.

The font stack used is: `system-ui, Avenir, Helvetica, Arial, sans-serif`
- Some of these fonts may not have italic variants loaded or available
- When `font-synthesis: none` is set, the browser will NOT create a synthetic italic style
- This caused `<em>` and `<i>` tags to appear as regular text

## Solution
Changed `font-synthesis: none;` to `font-synthesis: weight style;` in `src/style.css`.

This allows the browser to synthesize:
- **weight**: Bold font variants (for `<b>` and `<strong>` tags)
- **style**: Italic font variants (for `<i>` and `<em>` tags)

## Risks and Side Effects

### 1. Visual Quality
**Risk Level: Low**
- Synthesized italics are created by slanting the regular font (oblique transformation)
- True italic fonts have different letterforms designed specifically for italic text
- **Impact**: Text may look slightly different from "true" italic fonts, but the difference is minimal and acceptable for most use cases

### 2. Performance
**Risk Level: Very Low**
- Synthesizing font styles has a minimal performance cost
- Modern browsers handle this efficiently
- **Impact**: Negligible performance difference in practice

### 3. Global Scope
**Risk Level: Medium**
- This change affects ALL text across the entire application
- Any `<em>`, `<i>`, `<b>`, or `<strong>` tags throughout the app will now display with synthesized styles
- **Impact**: This is actually the desired behavior - it ensures consistency across the application

### 4. Browser Support
**Risk Level: Very Low**
- `font-synthesis: weight style;` is well-supported in all modern browsers
- Chrome, Firefox, Safari, Edge all support this property
- **Impact**: No compatibility issues expected

### 5. Font Loading
**Risk Level: Low**
- If custom fonts with italic variants are loaded in the future, they will take precedence over synthesized styles
- **Impact**: The change is forward-compatible and won't interfere with true italic fonts

## Benefits

1. **Fixes the immediate issue**: Italic button in TipTap editor now works correctly
2. **Improves UX**: Text formatting is now visually consistent with user expectations
3. **No breaking changes**: Existing functionality remains intact
4. **Future-proof**: If italic font variants are added later, they will automatically be used instead of synthesized versions

## Alternative Solutions Considered

### 1. Load italic font variants explicitly
- **Pros**: Better visual quality
- **Cons**: Increases page weight, requires font hosting/management, overkill for this application

### 2. Add CSS specifically to editor content
- **Pros**: More targeted fix
- **Cons**: Inconsistent behavior across the app, doesn't fix the root cause

### 3. Use a different font stack
- **Pros**: Could ensure italic variants are available
- **Cons**: Changes the entire visual design, unnecessary when synthesis works well

## Recommendation

✅ **Proceed with the change**

The benefits outweigh the minimal risks. The change:
- Solves the immediate problem
- Has negligible side effects
- Improves consistency across the application
- Follows modern best practices for web typography

The original `font-synthesis: none` setting was likely cargo-culted from Vite's default template and is overly restrictive for most applications.

## Testing

After making this change, verify:
1. Italic button works in the TipTap editor
2. Text with `<em>` and `<i>` tags appears italicized
3. Bold text still works correctly
4. No visual regressions in other parts of the application
5. Build process completes without errors

## References

- [MDN: font-synthesis](https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis)
- [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4/#font-synthesis)
