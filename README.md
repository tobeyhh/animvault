# Anim Vault

A clean reference library for in-game animation commands — `/anim` and `/customanim`.

Browse by category, toggle previews, and copy commands instantly.

---

## Categories

- Sitting
- Eating
- Walking
- Standing
- *(more added over time)*

---

## How to use

Open the site, pick a category from the sidebar, and click **preview** on any animation to see the description and copy the command.

Use `Ctrl+K` to search across all animations in the active category.

---

## Adding animations

Animations are managed directly in `data.json`. Structure for each entry:

```json
{
  "id": "unique_id",
  "name": "Animation Name",
  "cmd": "/anim commandname",
  "notes": "What the animation looks like.",
  "img": "https://link-to-preview-image.gif"
}
```

Leave `img` as `""` if there's no preview image yet.
