# Hero Video Script — "House of Heirloom Childhood"

**Placement:** Full-screen background loop behind the homepage headline
**Length:** 20 seconds, seamless loop (last frame dissolves into the first)
**Format:** 16:9 at 1920×1080 (plus a 9:16 crop at 1080×1920 for mobile), 24 fps
**Audio:** None. The video autoplays muted on the site, so every beat must work without sound.
**Export:** `assets/video/hero.mp4` (H.264, ~6–8 Mbps, under 8 MB) + `assets/video/hero.webm` (VP9) + `assets/images/hero-poster.jpg` (frame from Shot 1)

## Creative direction
- **Mood:** slow, warm, dreamy. Golden hour in an English-style cottage garden. Think *picture-book memory*, not *advert*.
- **Palette:** blush, cream, butter-yellow, sage, powder blue. No saturated primaries. Lift the shadows slightly, keep highlights warm, add soft film grain.
- **Camera:** gimbal or dolly only, very slow. Shallow depth of field (f/1.8–2.8). Nothing fast or shaky.
- **Safe zone:** keep the **bottom-left 45%** of the frame calm and darker-toned. The headline, intro text and signature sit there.
- **Kids:** never show faces head-on and close up. Use backs, profiles, hands and silhouettes. This feels editorial and avoids model-release problems.

## Shot list

| # | Time | Shot | Action | Camera | Notes |
|---|------|------|--------|--------|-------|
| 1 | 0:00–0:04 | **Macro: needle & thread** | A needle pulls blush-pink thread through linen, finishing a French-knot rosebud on a smocked dress. | Locked macro, very slow push-in | Opening frame and poster image. Warm window light from the right. |
| 2 | 0:04–0:08 | **Garden: the twirl** | A little girl (about 4 years old) in the Rosebud Smock Dress twirls in tall grass and wildflowers, filmed from behind/side. The hem flares. | Low angle, 60 fps slowed to 24 | Sun flare behind her. Petals or dandelion seeds drift through the frame. |
| 3 | 0:08–0:11 | **Detail: small hands** | Small hands pick a daisy and tuck it into the brim of a Daisy Chain Bonnet sitting on a picnic blanket. | Top-down, slow slide | Cream and sage tones. Linen texture visible. |
| 4 | 0:11–0:15 | **Siblings running** | Two children, one in the Buttercup Romper and one in the Honeybee Cardigan, run hand-in-hand away from camera along a garden path. | Tracking behind, slow | Keep this wide. They become small figures in the frame. The motion reads as freedom. |
| 5 | 0:15–0:18 | **Atelier table** | A grandmother's hands fold a finished dress into a linen keepsake box with tissue paper and a dried flower. | Side angle, slow pull-out | Connects to the brand's heritage story. |
| 6 | 0:18–0:20 | **Loop out: fabric close-up** | Embroidered fabric moves in a breeze, soft focus, and a light leak washes the frame warm cream. | Static | Cross-dissolve (12 frames) into Shot 1 for a seamless loop. |

## On-screen text
**None in the video.** The site adds the headline over it as live HTML:
> *House of Tarigai • est. 2024* — **House of Heirloom Childhood**

Keeping the text in HTML keeps it sharp, translatable and readable by search engines.

## If you generate it with AI video (Runway, Sora, Kling, Veo, etc.)
Generate each shot separately as a 4–5 s clip, then edit them together. Base prompt to prepend to every shot:

> *Cinematic 35mm film look, golden hour, soft pastel palette of blush pink, cream, butter yellow and sage green, shallow depth of field, gentle slow camera movement, dreamy and nostalgic, light film grain, no text, no logos.*

Shot prompts:
1. *Extreme macro of a needle pulling blush-pink embroidery thread through cream linen, forming a tiny rosebud French knot on a child's smocked dress, warm window light, slow push-in.*
2. *A 4-year-old girl seen from behind twirling in a meadow of wildflowers at golden hour, wearing a peach and cream hand-smocked cotton dress, hem flaring, sun flare, drifting petals, slow motion.*
3. *Top-down view of a child's small hands placing a daisy into the brim of a white embroidered cotton bonnet on a sage linen picnic blanket.*
4. *Two small children seen from behind running hand-in-hand down a garden path between lavender and roses, one in a pale yellow romper and one in an oat-coloured knit cardigan, wide shot, slow tracking.*
5. *An elderly woman's hands folding a tiny embroidered dress into a linen keepsake box with tissue paper and a dried flower, on a wooden atelier table, soft side light.*
6. *Close-up of embroidered pastel cotton fabric moving gently in a breeze, soft focus, warm light leak washing the frame.*

**Negative prompt:** *faces in close-up, distorted hands, extra fingers, text, watermark, harsh shadows, saturated colours, fast motion.*

## Edit & grade checklist
- [ ] Total length 20 s ±0.5. Cuts land roughly every 3–4 s.
- [ ] Use cross-dissolves (8–12 frames), never hard cuts. The site loops the video, so it must feel continuous.
- [ ] Bottom-left area stays calm for the text overlay.
- [ ] Mobile 9:16 version recentred on the subject.
- [ ] Compress: `ffmpeg -i master.mov -vcodec libx264 -crf 24 -preset slow -an -movflags +faststart assets/video/hero.mp4`
- [ ] WebM: `ffmpeg -i master.mov -c:v libvpx-vp9 -crf 34 -b:v 0 -an assets/video/hero.webm`
- [ ] Poster: `ffmpeg -i assets/video/hero.mp4 -ss 00:00:01 -frames:v 1 assets/images/hero-poster.jpg`
