# Astronaut artwork

## Status: finished asset integrated

Generated on November 16, 2026 using the built-in OpenAI image generation tool.
This is AI-generated artwork art-directed for Mateus Queiroz's portfolio. It is
not a commissioned painting, a NASA asset, or a third-party stock purchase.
No specific human creator, public-domain status, or Creative Commons license is
claimed. Use is subject to the applicable OpenAI service terms.

- Original transparent PNG: `docs/art/astronaut-source.png` (1254 × 1254).
- Desktop WebP: `public/art/astronaut-1280.webp` (161,954 bytes).
- Mobile WebP: `public/art/astronaut-800.webp` (82,778 bytes).
- Registry and visible credit: `src/data/art.ts`.
- Responsive loader: `src/components/Figure.tsx`.
- Placement: `src/styles/classical.css`.

The browser's WebP encoder created the two delivery sizes at quality 0.86,
preserving alpha. The original source is retained above. The larger delivery
file uses a standard 1280px square, slightly above the generated dimensions.
The figure costs no additional WebGL draws. Only the landing loads it; CSS
handles drift and departure, with motion disabled under reduced motion.
The previous SVG in `Astronaut.tsx` is now solely an image-load-error fallback.

The landing epigraph, “Beyond the known, there is more to discover,” is original
site copy, without attribution to a historical person.

## Final generation prompt

```text
Use case: stylized-concept.
Asset type: transparent painted astronaut cutout for a dark classical cosmic portfolio website.
Create one exquisite dimensional astronaut, combining believable sculpted anatomy and spacesuit construction with Renaissance oil painting, dramatic chiaroscuro, and the grace of Greek/Roman sculpture. Ivory woven fabric, convincing folds and seams, restrained aged-gold wrist cuff and helmet trim, no logos or flags. Dark violet reflective visor with a warm gold reflection. Warm ivory-gold key light from the upper RIGHT and a faint violet-blue fill from left, deep indigo shadows. Fine painterly surface, convincing volume, elegant and contemplative, not cartoon shapes.
Composition: square transparent canvas. Partial figure seen three-quarter FROM BEHIND over the LEFT shoulder, positioned in lower LEFT. Helmet centered near x=30%, y=65%, shoulder and upper torso extend through the bottom left edge. The RIGHT arm reaches diagonally upward toward the RIGHT: shoulder near (45%,80%), elbow near (62%,64%), wrist near (78%,53%), graceful anatomically correct glove with index fingertip near (95%,43%). The other fingers relax naturally. Head turns toward upper right. Complete reaching hand and arm remain inside frame. This gesture guides the eye to a galaxy that will be placed outside the image to the right. Keep the upper third mostly transparent. No galaxy or stars or scenery inside this asset; no text, pedestal, framing, or halo. Actual transparent background with clean alpha and soft painted edges.
```
