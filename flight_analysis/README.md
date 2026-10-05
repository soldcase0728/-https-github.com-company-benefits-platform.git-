# Flight analysis — Triple vs. Indiana Gators Premier Oezer 16U

Grand Park (Westfield, IN), Field 13 · 3 Oct 2026, ≈8:30 AM EDT · left-handed batter, ball to right-center.

## Headline

**The ball landed in right-center about 166 ft out (80% interval 144–190 ft), 2.95 s after contact. It then bounced and rolled ≈86 ft to the ≈252-ft fence; it did not reach the fence on the fly.**

- **Launch:** EV ≈ 55 mph (80%: 48–63) at LA ≈ 27° (80%: 26–28).
- **Direction:** 12.6° right of straightaway center (80%: 11.7–13.4°).
- **Not measurable from this clip:** when the ball reached the fence, and how high on the fence it hit.

Tags: **MEASURED** = taken from the video, aerial or weather record. **ASSUMED** = model prior. **USER-SUPPLIED** = provided by you.

## Answers to the five questions

| # | Question | Answer | Tag / basis |
|---|---|---|---|
| 1 | Fly or bounce? | **Bounce.** P(fly to fence) = 0/5,000 Monte Carlo draws. Forcing a landing within 20 ft of the fence raises track misfit by Δχ² = 58–71. | MEASURED track + aerial calibration |
| 2a | Where did it reach the fence? | Spray 12.6° R (80%: 11.7–13.4°). Landing azimuth 13.7° (crosswind drift). This is the yellow-line fence bend, **D = 252 ft** (80%: 249–255). | MEASURED (aerial D(φ)) |
| 2b | When did it reach the fence? | Landing at PTS 7.98 s (80%: 7.91–8.06), hang time **2.95 s** (80%: 2.87–3.02). Fence arrival = landing + roll time, and the roll was **not observable**. ~86 ft of turf roll from ~47 ft/s plausibly takes 2–3 s, so arrival ≈ 10–11 s. That figure is a rough model estimate, not a measurement. | MEASURED landing time; roll time unmeasured |
| 2c | How high on the fence? | Not measurable. The ball arrived bouncing or rolling, so near ground level. | — |
| 3 | Trajectory | EV **55.1 mph** (48.4–63.2) · LA **26.8°** (25.8–27.8) · apex **27.3 ft** (24.5–30.5) at 89 ft, 1.41 s after contact · hang **2.95 s** · lands at 40 mph, descending 36° | Method B fit; spin-limited (see §Uncertainty) |
| 4 | Carry with no fence | **166 ft** (80%: 144–190; 90%: 139–196), from the plate apex | Model + MEASURED track |
| 5 | Height at 200 / 210 / 220 / 225 ft | Reached 200 ft in flight in only 3% of draws (then ~3 ft high); 210 ft 1%; 220/225 ft 0%. **P(clearing a 4–8 ft fence)** at 200 ft 0.9%, 210 ft 0.1%, 220 ft 0%, 225 ft 0%. **Not a home run over any standard 16U fence.** | MC |

> **For public use** (highlight or recruiting graphic), quote only the measured facts plus the 10th-percentile carry, rounded down: *"Line drive into the right-center gap (~13° right of center), landed ~140+ ft out and rolled to the 250-ft fence for a triple."* Don't quote EV as a measured number; it depends mainly on assumed spin.

## Your 0.4 s roll estimate vs. the video

A 0.4 s roll implies landing ≈20 ft short of the fence (≈230–235 ft). The video says otherwise, robustly:

| Case | Free fit landing | Forced landing (D − 20 ± 8 ft) | Track χ² free → forced | Δχ² |
|---|---|---|---|---|
| Nominal aero | 156 ft | only reaches 192 ft | 3.6 → 29.1 | **58** |
| Most carry-friendly (C_D 0.28, 2,500 rpm, tailwind) | 149 ft | only reaches 185 ft | 4.0 → 30.7 | **71** |

The camera sees the ball's elevation peak about 0.95 s after contact, at only ≈12° above the horizon. A ball that carries 230+ ft would still be climbing in the image well past that point.

A possible reconciliation, not measured: a ball landing at ~40 mph and a 36° descent on turf takes a long, high first hop. The last big hop near the wall can look like "the landing" from the stands. See `eyewitness_test.json`.

## Inputs

| Input | Value | σ / range | Tag | Source |
|---|---|---|---|---|
| Frame timing | VFR, ~30 fps with 14 gaps of 66–67 ms | — | MEASURED | `frame_pts.csv` (per-frame PTS) |
| Visual contact | 5.000 s | ±0.033 | MEASURED | bat in zone i140–i141, follow-through i142 (`crops/contact_strip.png`) |
| Bat-crack audio | 5.086 s | ±0.002 | MEASURED | cross-check only |
| Ball track | 28 points, 5.200–6.167 s | 0.5–1 px | MEASURED | `ball_track.json`, `crops/track/` |
| Aerial scale | 2.616 px/ft (infield) / 2.686 (250-ft line) | 2.7% apart → sampled | MEASURED / USER-SUPPLIED | `aerial.png` |
| Fence D(φ) | 249–257 ft over φ = −15…+15° | scale spread | MEASURED | aerial polyline (`code/field.py`) |
| Camera position | 27.3 ft behind apex, on backstop netting | ±1 ft | MEASURED | aerial |
| Camera height | prior 5.0 ft → fitted **5.7 ft** (5.35–6.03) | ±0.5 prior | USER-SUPPLIED prior | "about 60 in" |
| Light poles | 2 bases from aerial shadows; heights fitted 56–57 ft | ±4 px | MEASURED | aerial + video poles u = 342, 1019 |
| Air density | 1.221 kg/m³ | ±0.012 | MEASURED (reanalysis) | Open-Meteo: 9.2 °C, RH 92%, 993.8 hPa, 268 m |
| Wind | 2.7 m/s (10 m) from 52° → ~2 m/s crosswind toward RF at ball height | ±1 m/s, ±25° | MEASURED (reanalysis) | Open-Meteo archive, 08:00–09:00 EDT |
| C_D | 0.33 | U(0.28, 0.40) | ASSUMED | Kensrud & Smith 2010 |
| Backspin | 1,500 rpm | U(500, 2,500) | ASSUMED | not documented for batted softballs |
| C_L(S) | 1.5S (S ≤ 0.1); 0.09 + 0.6S | — | ASSUMED | baseball-derived, Nathan 2008 |
| Ball | 12.0 in, 0.184 kg | legal range | ASSUMED | absorbed in C_D range |
| Contact point | 2.0 ft fwd, 0.3 ft lateral, 2.5 ft high (priors) | 0.75 / 0.7 / 0.5 | ASSUMED | fitted 2.2 / 0.3 / 2.1 ft |
| Fence height | 4–8 ft | uniform | ASSUMED | only used for the "cleared?" test |
| Eyewitness roll | 0.4 s | — | USER-SUPPLIED | tested; inconsistent; not used |

## Results (5,000-draw Monte Carlo, seed 20261003, rejection rate 0.0%)

| Quantity | Median | 10th–90th | 5th–95th |
|---|---|---|---|
| Exit velocity (mph) | 55.1 | 48.4–63.2 | 47.3–64.7 |
| Launch angle (°) | 26.8 | 25.8–27.8 | 25.5–28.1 |
| Spray angle (° R of center) | 12.6 | 11.7–13.4 | 11.4–13.6 |
| Contact time, fit (PTS s) | 5.039 | 5.03–5.05 | 5.03–5.05 |
| Hang time to landing (s) | 2.95 | 2.87–3.02 | 2.85–3.04 |
| Landing distance / carry, no fence (ft) | 165.8 | 143.5–190.3 | 138.8–196.2 |
| Fence distance at landing azimuth (ft) | 251.9 | 249.1–254.5 | 248.7–255.0 |
| Bounce/roll distance to fence (ft) | 85.9 | 61.0–108.7 | 55.2–113.2 |
| Apex height (ft) | 27.3 | 24.5–30.5 | 24.0–31.2 |
| Apex distance (ft) / time after contact (s) | 88.9 / 1.41 | 76–103 / 1.37–1.45 | — |
| Landing speed (mph) / descent angle (°) | 39.9 / 36.0 | 36.7–43.6 / 34.4–37.6 | — |
| Camera focal length (px) | 770 | 750–789 | 746–794 |

Rejection rule: fit failed, EV > 100 mph, cost > 3× median, or track χ² > 112.

## Method summary

1. **Timing.** I built a per-frame PTS table; all times come from PTS, never frame index ÷ fps.
   - **Contact:** bracketed visually at 5.000 ± 0.033 s. The trajectory fit puts it at 5.039 s.
   - **Audio check:** the crack (5.086 s) minus 0.024 s of sound travel over 27 ft gives ≈0.02 s of residual A/V lag.
   - **Correction to the preliminary notes:** their ≈0.1 s audio lag came from a contact time that was too early.
   - **Encoder artifacts:** H.264 skip-blocks freeze the tiny ball in some B-frames. Those frames (i175–176) are excluded.
2. **Field geometry.** Plate, bases and rubber from the aerial give the scale. The infield scale and your 250-ft line disagree by 2.7%, which is more than 1.5%, so both are sampled. The fence polyline gives D(φ). The painted arc (~196 ft) is visible in the video only as paint; no portable fence was up.
3. **Camera calibration.** Bases and plate are hidden by netting, glare and players, so a ≥6-point PnP was impossible. Instead I ran a joint least-squares fit of camera and trajectory to:
   - both light poles (base, shaft and lamp head)
   - 12 fence-base rows checked against the aerial polyline
   - the pitcher's feet at the rubber and the batter's back foot
   - the camera constrained to the aerial backstop line, with your height prior
   - a radial-distortion term
   - the ball track

   Every landmark residual is ≤ 1.9σ (`fig_camera_calibration.png`). A white chalk line I had first taken for the 1B foul line is inconsistent (Δχ² ≈ 40). It's a different marking and is excluded.
4. **Track and fit.** Method B: fit EV, LA, spray, contact time and contact point to the 28 rays plus all landmarks. Track residual RMS is 0.27 px (`fig_track_reprojection.png`).
   - Method A (shooting to a fence impact) is not applicable: the ball never reached the fence in flight, and the fence-arrival time is unobservable.
   - The integrator is RK4 at dt = 2 ms (numba), checked against `solve_ivp` (rtol 1e-8): carry within 0.01 ft, hang time within 0.1 ms.
5. **Uncertainty.** Each of the 5,000 draws resamples:
   - all pixel measurements and the aerial pole positions
   - the aerial scale and your camera-height prior
   - contact time
   - C_D, spin, ρ, and wind speed and direction

   Every draw is a full camera + trajectory refit.

## Uncertainty: what drives what

**Spearman rank correlations** (from the MC draws):
- **Carry:** spin −0.87, wind (along-flight) +0.29, everything else under 0.1.
- **EV:** spin −0.93.
- **LA:** wind speed −0.65.
- **Hang time:** spin −0.58, wind +0.45.

**Tornado** (`fig_tornado_carry.png`):
- Spin 700 → 2,300 rpm moves carry +23 / −20 ft.
- Wind direction and speed move it ±5–8 ft.
- C_D: ±2 ft.
- All calibration inputs (scale, pole position, camera height, track bias): < 1 ft each.

**These are not the drivers you predicted.** You expected carry to be driven by D_impact and h, and EV and LA by T and aero. That pattern would hold for a ball that hit the fence on the fly. Here the ball landed, so carry is set by the observed flight shape plus how much lift backspin adds to its descent. Spin, which the video can't observe, dominates.

## What would cut the uncertainty most (ranked)

1. **A measured exit velocity**, e.g. a radar gun or Pocket Radar behind the plate, or GameChanger/Rapsodo EV if this team uses it. This would collapse the spin–EV degeneracy that sets most of the carry spread.
2. **A second camera from the 1B or 3B side.** Triangulation removes the depth ambiguity and lets the descent be observed rather than extrapolated, which also constrains spin.
3. **Higher resolution or frame rate, and a camera not behind netting.** The ball is lost at 6.17 s (< 1.5 px). Tracking it to landing would make carry a direct measurement.
4. **A marked landing spot.** An eyewitness or video still of the first bounce, taped to the plate apex.
5. **On-field wind** (a handheld anemometer), replacing the 10-m reanalysis.
6. **A tape-measured camera position and height.** Minor now; the aerial and poles already pin it.

## Files

| File | Contents |
|---|---|
| `results.json` | every input (tagged) and output, with percentiles |
| `mc_summary.json`, `mc2_samples.json` (git-ignored, regenerable) | MC summary / raw draws |
| `fig_side_view_trajectory.png` | side-view band with reference fences at 200/220/225 ft and the actual fence |
| `fig_spray_on_aerial.png` | spray line and MC landing points on the aerial |
| `fig_keyframes.png` | contact, last tracked ball with modeled continuation, frame at modeled landing |
| `fig_timing_diagram.png` | timing diagram |
| `fig_tornado_carry.png` | tornado chart |
| `fig_camera_calibration.png` | aerial geometry projected through the fitted camera |
| `fig_track_reprojection.png` | track fit residuals |
| `reference_grid.json` | carry and hang for EV 60–90 × LA 10–45 (sanity grid) |
| `eyewitness_test.json`, `fly_vs_bounce_test_v1calib.json` | consistency tests (the second used the earlier, superseded calibration) |
| `frame_pts.csv`, `ball_track*.json`, `crops/` | timing table, detections, crops |
| `code/` | `physics.py`, `fastfly.py`, `field.py`, `calib_aerial.py`, `mc2.py`, `tornado2.py`, `summarize.py`, `figs2.py`, `fig_calib.py`, `make_results.py`. Earlier exploratory fits: `jointfit.py`, `calib2.py`, `mc.py` |

## References

- Clark, Greer & Semon (2015), "Modeling pitch trajectories in fastpitch softball," *Sports Engineering* 18:157–164 — https://www.bates.edu/physics-astronomy/files/2013/09/SoftballFinalPublishedHardcopy.pdf
- Kensrud & Smith (2010), "In situ drag measurements of sports balls," *Procedia Engineering* 2:2437–2442 — https://doi.org/10.1016/j.proeng.2010.04.012
- Nathan (2008), "The effect of spin on the flight of a baseball," *Am. J. Phys.* 76:119–124 — https://baseball.physics.illinois.edu/ajpfeb08.pdf
- Nathan, Fastpitch Softball Research — https://baseball.physics.illinois.edu/softball.html
- Nathan, fitting a trajectory to known distance, height and time — https://legacy.baseballprospectus.com/a/23864
- USA Softball field-dimension table (older reprint; verify current rule) — https://img.athleticbusiness.com/files/base/abmedia/all/document/2007/03/softball-specs.pdf
- Open-Meteo Historical Weather API (ERA5-based) — https://open-meteo.com/en/docs/historical-weather-api
