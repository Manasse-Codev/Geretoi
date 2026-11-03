Add a MOTION DESIGN layer to all DayFlow screens (Today, Planner, Lists, Stats, Focus, New Task, Settings). Keep the same neumorphic soft-UI look. The motion must feel soft, physical and calm, like pressing real soft buttons. Describe or implement the interactions with CSS transitions/animations when possible.

MOTION PRINCIPLES
- Purposeful: every animation explains a change (appear, complete, move, press). No decorative looping animation.
- Soft and fast: 120–400 ms. Default easing cubic-bezier(0.22, 1, 0.36, 1). Springs (stiffness 300, damping 30) for sheets and drag.
- Tactile: pressing a raised element animates its shadow from raised to inset in 120 ms and scales it to 0.98. Releasing returns it with a gentle spring.

PER-SCREEN MOTION
1. App launch: logo in a raised circle fades and scales from 0.9 to 1 (300 ms), then the Today content slides up with a stagger.
2. TODAY
   - List entrance: task cards fade in and rise 12 px, staggered by 40 ms (max 8 items), 320 ms each.
   - Progress ring: the arc animates from 0 to its value in 800 ms, the end knob follows the arc, and the percentage counts up in sync.
   - Completing a task: the round checkbox fills with orange (160 ms), the checkmark draws itself with a stroke animation (240 ms), the title gets a strikethrough that sweeps left to right (200 ms), then the card slides and collapses out of the active list (280 ms). A brief haptic-style pulse on the ring updates its value.
   - At 100% completion: the ring does one soft pulse (scale 1 → 1.06 → 1) and the banner message crossfades to "Journée terminée". One time only, no confetti.
   - Swipe actions: card follows the finger, action icons scale in as the threshold approaches, snapping with a spring.
   - Hero banner: illustration floats very subtly (translateY ±3 px over 4 s), only while the screen is visible.
3. TAB NAVIGATION: tab bar icons crossfade to the filled/violet state (180 ms) with a small raised "pill" that slides under the selected icon (shared-element glide, 250 ms). Screen content crossfades with a 12 px horizontal shift in the direction of the tab.
4. NEW TASK SHEET: opens from the "+" button with the button morphing into the sheet (spring), background dims to 40%. Sections of "Plus de détails" expand with a height animation (260 ms) while the chevron rotates 180°. Selecting a chip animates its surface from raised to inset (120 ms). On submit, the check button turns into a checkmark, the sheet drops down (240 ms) and the new task card appears in the list with a soft highlight pulse (violet glow fading in 600 ms).
5. PLANNER: day switching slides the timeline horizontally; dragging a task lifts it (scale 1.03, bigger shadow) and snaps to the 15-minute grid with a spring; the current-time line moves smoothly.
6. LISTS: cards rise in with a stagger; progress bars fill from 0 in 600 ms; tapping a card expands it into the list view (shared-element transition).
7. STATS: rings and bars animate from 0 when the screen enters the viewport (800 ms, staggered by 100 ms); the three number badges count up; accordion rows expand with the chevron rotation.
8. FOCUS MODE: the Pomodoro ring depletes smoothly each second (linear), the pause button morphs between pause and play icons (200 ms), the background slowly dims to reduce distraction.
9. SETTINGS: rows fade in with a 30 ms stagger; toggles animate their knob with a spring (200 ms) and the track color crossfades; the theme switch (Clair/Sombre/Auto) cross-fades the whole app over 300 ms.
10. LOADING / EMPTY / ERROR: skeleton cards as inset shapes with a very soft shimmer; empty state message fades in with a small float; offline banner slides down from the top (240 ms) and "Synchronisé" status gets a quick check animation when back online.

REDUCED MOTION (mandatory)
When "prefers-reduced-motion" is enabled: remove stagger, count-up, floating, springs and shared-element transitions. Replace everything with a simple 120 ms opacity fade; the progress ring and bars appear directly at their final value.

PERFORMANCE: animate only transform and opacity (and stroke-dashoffset for rings); never animate layout properties; keep 60 fps on mid-range phones.