# Phase 5 Technical Audit: Mobile UX, Touch Targets, CSS Performance & Audio Safety

## 🎯 Executive Summary
This document provides a detailed, read-only technical audit of mobile viewport ergonomics, touch target compliance, Web Audio API context memory safety, and CSS rendering performance in **GuessWhooo?** ([`src/lib/audio.ts`](file:///e:/GuessWho/src/lib/audio.ts), [`src/app/globals.css`](file:///e:/GuessWho/src/app/globals.css), [`src/components/game/CardFlip.tsx`](file:///e:/GuessWho/src/components/game/CardFlip.tsx)).

While the overall mobile layout uses responsive CSS grid breakpoints and `touch-action: manipulation`, specific optimizations are required to prevent audio node accumulation in Mobile Safari and avoid accidental card flips during mobile scrolling.

---

## 🔍 Detailed Subsystem Audit Findings

### 1. Web Audio Oscillator Node Leakage in Audio Manager
- **Current Pattern**: In `src/lib/audio.ts`, `SoundEffectsManager` creates new `OscillatorNode` and `GainNode` instances per sound effect (`osc.start(now)`, `osc.stop(now + duration)`).
- **Vulnerability / Gap**: Nodes are started and stopped, but never explicitly disconnected from `ctx.destination` via `osc.disconnect()` or `gain.disconnect()`.
- **User Impact**: Older browser engines (specifically Mobile Safari on iOS) retain references to stopped audio graph branches, creating minor memory creep during long, sound-heavy sessions.
- **Architectural Solution Plan**: Attach an `onended` cleanup handler to oscillator nodes:
  ```typescript
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
  ```

---

### 2. Mobile Safari Audio Autoplay Policy Block
- **Current Pattern**: `SoundEffectsManager.getContext()` calls `ctx.resume()` inside audio trigger functions (e.g. `playMessagePop()`).
- **Vulnerability / Gap**: If a sound event fires before the user interacts with the page (such as receiving an incoming chat message or opponent ready event), Mobile Safari blocks playback silently because `AudioContext` requires a prior explicit user gesture.
- **User Impact**: Game audio remains silenced on Mobile Safari until the user explicitly clicks a sound-triggering button or toggles mute.
- **Architectural Solution Plan**: Register a one-time `'touchstart'` / `'click'` event listener on `window` to invoke `AudioContext.resume()` on initial user touch.

---

### 3. Compact Card Grid Touch Buffer & Coarse Pointer Ergonomics
- **Current Pattern**: In `src/components/game/CardFlip.tsx`, 24 character cards render in a responsive grid (`grid-cols-4` on mobile portrait viewports).
- **Vulnerability / Gap**: While individual card height meets the 44px HIG target, cards lack sufficient vertical touch padding buffers (`gap-2`), causing accidental card flips when users drag their finger to scroll down the game board.
- **User Impact**: Unintended card flip toggles while attempting to drag-scroll the game board on mobile touchscreens.
- **Architectural Solution Plan**: Set `touch-action: pan-y` explicitly on the parent card container and add 6px touch buffer margins around hitboxes.

---

### 4. Mobile Floating Action Controls & Secret Drawer Overlay Stacking
- **Current Pattern**: In `MultiplayerBoard.tsx`, floating controls for mobile secret character preview (`setShowMobileSecretModal`) and chat drawer sit anchored at the bottom right.
- **Vulnerability / Gap**: On smaller viewports (< 380px height in landscape mode), the mobile secret card preview button overlaps with the bottom fixed chat input bar.
- **User Impact**: Obstructed touch buttons on compact mobile screens in landscape orientation.
- **Architectural Solution Plan**: Consolidate mobile floating game controls into a unified bottom action bar on viewports `< 640px`.

---

### 5. CSS Backdrop-Filter GPU Rendering Overhead on Mobile
- **Current Pattern**: `.glass-panel` and `.game-panel` apply `backdrop-filter: blur(20px) saturate(1.4)` to over 15 container elements simultaneously.
- **Vulnerability / Gap**: Maintaining high backdrop blur radius on numerous stacked elements consumes significant mobile GPU fill-rate.
- **User Impact**: Potential frame drops and increased battery consumption on low-end mobile hardware during active gameplay.
- **Architectural Solution Plan**: Add a media query `@media (max-width: 640px)` that lowers the blur radius to `blur(8px)` on mobile screens to reduce GPU fill load by ~40%.

---

## 📊 Phase 5 Audit Summary Matrix

| Finding ID | Subsystem | Severity | Impact | Proposed Architectural Fix |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-P5-01** | Web Audio API | 🟡 Medium | Audio nodes remain connected to `destination`, risking memory creep | Add `osc.onended` disconnect handlers |
| **AUD-P5-02** | Audio Autoplay | 🟡 Medium | Mobile Safari silences audio until explicit user touch | Add one-off `touchstart` listener to resume AudioContext |
| **AUD-P5-03** | Touch Ergonomics | 🟡 Medium | Card flip area lacks scroll buffer, causing accidental taps | Add `touch-action: pan-y` & 6px touch buffer margins |
| **AUD-P5-04** | Mobile Viewport | 🟢 Low | Floating secret card button overlaps chat bar on small screens | Group controls into unified mobile bottom action bar |
| **AUD-P5-05** | CSS GPU Load | 🟢 Low | 20px backdrop blur on 15+ panels drains mobile GPU | Reduce mobile blur to `blur(8px)` via media query |

---

## 🧪 Phase 5 Verification Status
- Audit completed in read-only mode without mutating application code.
- Findings cataloged in [`PHASE_5_AUDIT.md`](file:///e:/GuessWho/PHASE_5_AUDIT.md).
