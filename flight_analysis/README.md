# Flight analysis — Triple vs. Indiana Gators Premier Oezer 16U

Grand Park (Westfield, IN), Field 13 · 3 Oct 2026, ≈8:30 AM EDT · left-handed batter, ball to right-center.

## Headline

**The ball landed in right-center about 164 ft out (80% interval 142–190 ft), 2.93 s after contact. It then bounced and rolled ≈88 ft to the ≈252-ft fence; it did not reach the fence on the fly.**

- **Launch:** EV ≈ 55 mph (80%: 48–63) at LA ≈ 27° (80%: 26–28).
- **Direction:** 12.4° right of straightaway center (80%: 11.5–13.2°).
- **Not measurable from this clip:** when the ball reached the fence, and how high on the fence it hit.

Tags: **MEASURED** = taken from the video, aerial or weather record. **ASSUMED** = model prior. **USER-SUPPLIED** = provided by you.

## Answers to the five questions

| # | Question | Answer | Tag / basis |
|---|---|---|---|
| 1 | Fly or bounce? | **Bounce.** P(fly to fence) = 0/5,000 Monte Carlo draws. Forcing a landing within 20 ft of the fence raises track misfit by Δχ² = 60–75. | MEASURED track + aerial calibration |
| 2a | Where did it reach the fence? | Spray 12.4° R (80%: 11.5–13.2°). Landing azimuth 13.6° (crosswind drift). This is the yellow-line fence bend, **D = 252 ft** (80%: 249–255). | MEASURED (aerial D(φ)) |
| 2b | When did it reach the fence? | Landing at PTS 7.97 s (80%: 7.90–8.05), hang time **2.93 s** (80%: 2.85–3.01). With your **3.6 s roll**, it reached the fence at **PTS ≈ 11.6 s** (80%: 11.3–11.8), **≈6.5 s after contact**. The ball isn't visible at that moment, but from ~11.2 s two fielders are seen stationary at the wall on the spray line. | Landing from model + track; roll time USER-SUPPLIED |
| 2c | How high on the fence? | Not measurable. The ball arrived bouncing or rolling, so near ground level. | — |
| 3 | Trajectory | EV **54.9 mph** (48.0–63.1) · LA **26.7°** (25.7–27.8) · apex **27.2 ft** (24.4–30.5) at 88 ft, 1.40 s after contact · hang **2.93 s** · lands at 40 mph, descending 36° | Method B fit; spin-limited (see §Uncertainty) |
| 4 | Carry with no fence | **164 ft** (80%: 142–190; 90%: 137–196), from the plate apex | Model + MEASURED track |
| 5 | Height at 200 / 210 / 220 / 225 ft | Reached 200 ft in flight in only 3% of draws (then ~3 ft high); 210 ft 1%; 220/225 ft 0%. **P(clearing a 4–8 ft fence)** at 200 ft 0.7%, 210 ft 0.1%, 220 ft 0%, 225 ft 0%. **Not a home run over any standard 16U fence.** | MC |

> **For public use** (highlight or recruiting graphic), quote only the measured facts plus the 10th-percentile carry, rounded down: *"Line drive into the right-center gap (~13° right of center), landed ~140+ ft out and rolled to the 250-ft fence for a triple."* Don't quote EV as a measured number; it depends mainly on assumed spin.

## Roll time: your 3.6 s vs. the earlier 0.4 s

**3.6 s is consistent with the video.** The model lands the ball ≈88 ft (62–111) short of the fence, so 3.6 s means an average roll speed of ≈24 ft/s (17–31). The ball lands moving ≈47 ft/s horizontally. A first bounce that keeps 55–80% of that (≈32 ft/s), then a turf deceleration of ≈4 ft/s² (rolling friction ≈0.13), covers 88 ft in 3.6 s and reaches the wall at ≈17 ft/s. Those are physically ordinary numbers.

The earlier **0.4 s** estimate was not consistent. It implied landing ≈20 ft short of the fence (≈230–235 ft), and the video robustly rules that out:

| Case | Free fit landing | Forced landing (D − 20 ± 8 ft) | Track χ² free → forced | Δχ² |
|---|---|---|---|---|
| Nominal aero | 155 ft | only reaches 191 ft | 3.7 → 28.5 | **60** |
| Most carry-friendly (C_D 0.28, 2,500 rpm, tailwind) | 147 ft | only reaches 184 ft | 5.1 → 30.2 | **75** |

The camera sees the ball's elevation peak about 0.95 s after contact, at only ≈12° above the horizon. A ball that carries 230+ ft would still be climbing in the image well past that point.

A possible reconciliation, not measured: a ball landing at ~40 mph and a 36° descent on turf takes a long, high first hop. The last big hop near the wall can look like "the landing" from the stands. See `eyewitness_test.json`.

## Apex check: could the apex be over the edge of the infield dirt (~120–128 ft)?

The edge of the maroon infield arc along the spray line is **119 ft** from the plate apex (the grey marker on your yellow line is at 128 ft). I re-fitted with the apex forced to 122 ± 5 ft (`apex_test.json`):

| Spin assumption | Free-fit apex | Forced fit reaches | Track misfit increase (Δχ²) |
|---|---|---|---|
| 1,500 rpm (nominal) | 27 ft high at **88 ft** | only 100 ft | 28 |
| 500 rpm (low lift) | 31 ft high at **106 ft** | only 113 ft | 5 |
| 2,500 rpm, low drag | 24 ft high at **73 ft** | only 86 ft | 69 |

The apex distance depends on spin: 74–103 ft in the Monte Carlo (80%), reaching ~106–113 ft only with very low spin. **No setting reaches 120 ft** while still matching the tracked ball.

It's also inconsistent with the 3.6 s roll. With drag, the apex sits at about 53% of the carry (88 of 165 ft here). An apex at ~122 ft implies landing at ~220–230 ft, leaving only ~25–30 ft to roll in 3.6 s, about 8 ft/s, for a ball that lands moving ~50+ ft/s.

**Why it can look farther out on video.** From behind the plate the ball is seen against the sky, so the eye places it over the distant outfield behind it. The ball is highest *in the image* at ≈5.95 s (≈0.9 s after contact). At that moment it is actually ≈55–60 ft from the plate and ≈23 ft up. In the image that point sits directly above the outfield fence line.

## Inputs

| Input | Value | σ / range | Tag | Source |
|---|---|---|---|---|
| Frame timing | VFR, ~30 fps with 14 gaps of 66–67 ms | — | MEASURED | `frame_pts.csv` (per-frame PTS) |
| Visual contact | 5.000 s | ±0.033 | MEASURED | bat in zone i140–i141, follow-through i142 (`crops/contact_strip.png`) |
| Bat-crack audio | 5.086 s | ±0.002 | MEASURED | cross-check only |
| Ball track | 28 points, 5.200–6.167 s | 0.5–1 px | MEASURED | `ball_track.json`, `crops/track/` |
| Aerial scale | 2.616 px/ft (infield) / 2.686 (250-ft line) | 2.7% apart → sampled | MEASURED / USER-SUPPLIED | `aerial.png` |
| Fence D(φ) | 249–257 ft over φ = −15…+15° | scale spread | MEASURED | aerial polyline (`code/field.py`) |
| Camera position | backstop netting 27.3 ft behind apex (aerial) + ~2 ft behind the fence → fitted **28.5 ft** (27.7–29.4) | ±0.75 ft | MEASURED + USER-SUPPLIED | aerial; "about 2 ft from the fence line" |
| Camera height | prior 5.0 ft → fitted **5.8 ft** (5.5–6.1) | ±0.5 prior | USER-SUPPLIED prior | "about 60 in" |
| Light poles | 2 bases from aerial shadows; heights fitted 56–57 ft | ±4 px | MEASURED | aerial + video poles u = 342, 1019 |
| Air density | 1.221 kg/m³ | ±0.012 | MEASURED (reanalysis) | Open-Meteo: 9.2 °C, RH 92%, 993.8 hPa, 268 m |
| Wind | 2.7 m/s (10 m) from 52° → ~2 m/s crosswind toward RF at ball height | ±1 m/s, ±25° | MEASURED (reanalysis) | Open-Meteo archive, 08:00–09:00 EDT |
| C_D | 0.33 | U(0.28, 0.40) | ASSUMED | Kensrud & Smith 2010 |
| Backspin | 1,500 rpm | U(500, 2,500) | ASSUMED | not documented for batted softballs |
| C_L(S) | 1.5S (S ≤ 0.1); 0.09 + 0.6S | — | ASSUMED | baseball-derived, Nathan 2008 |
| Ball | 12.0 in, 0.184 kg | legal range | ASSUMED | absorbed in C_D range |
| Contact point | 2.0 ft fwd, 0.3 ft lateral, 2.5 ft high (priors) | 0.75 / 0.7 / 0.5 | ASSUMED | fitted 2.2 / 0.3 / 2.1 ft |
| Fence height | 4–8 ft | uniform | ASSUMED | only used for the "cleared?" test |
| Roll time, landing → fence | 3.6 s | ±0.2 assumed | USER-SUPPLIED | used for fence-arrival time; consistent with model (an earlier 0.4 s was not) |

## Results (5,000-draw Monte Carlo, seed 20261003, rejection rate 0.0%)

| Quantity | Median | 10th–90th | 5th–95th |
|---|---|---|---|
| Exit velocity (mph) | 54.9 | 48.0–63.1 | 46.9–64.6 |
| Launch angle (°) | 26.7 | 25.7–27.8 | 25.4–28.0 |
| Spray angle (° R of center) | 12.4 | 11.5–13.2 | 11.2–13.4 |
| Contact time, fit (PTS s) | 5.04 | 5.03–5.05 | 5.03–5.06 |
| Hang time to landing (s) | 2.93 | 2.85–3.01 | 2.83–3.03 |
| Landing distance / carry, no fence (ft) | 164.5 | 141.6–189.6 | 136.8–195.6 |
| Fence distance at landing azimuth (ft) | 252.1 | 249.3–254.7 | 248.9–255.2 |
| Bounce/roll distance to fence (ft) | 87.5 | 61.9–110.8 | 55.9–115.3 |
| Apex height (ft) | 27.2 | 24.4–30.5 | 23.9–31.1 |
| Apex distance (ft) / time after contact (s) | 87.8 / 1.40 | 74–103 / 1.36–1.44 | — |
| Landing speed (mph) / descent angle (°) | 39.9 / 35.9 | 36.7–43.6 / 34.3–37.6 | — |
| Camera focal length (px) | 783 | 761–803 | 756–809 |

Rejection rule: fit failed, EV > 100 mph, cost > 3× median, or track χ² > 112.

## Method summary

1. **Timing.** I built a per-frame PTS table; all times come from PTS, never frame index ÷ fps.
   - **Contact:** bracketed visually at 5.000 ± 0.033 s. The trajectory fit puts it at 5.04 s.
   - **Audio check:** the crack (5.086 s) minus 0.024 s of sound travel over 27 ft gives ≈0.02 s of residual A/V lag.
   - **Correction to the preliminary notes:** their ≈0.1 s audio lag came from a contact time that was too early.
   - **Encoder artifacts:** H.264 skip-blocks freeze the tiny ball in some B-frames. Those frames (i175–176) are excluded.
2. **Field geometry.** Plate, bases and rubber from the aerial give the scale. The infield scale and your 250-ft line disagree by 2.7%, which is more than 1.5%, so both are sampled. The fence polyline gives D(φ). The painted arc (~196 ft) is visible in the video only as paint; no portable fence was up.
3. **Camera calibration.** Bases and plate are hidden by netting, glare and players, so a ≥6-point PnP was impossible. Instead I ran a joint least-squares fit of camera and trajectory to:
   - both light poles (base, shaft and lamp head)
   - 12 fence-base rows checked against the aerial polyline
   - the pitcher's feet at the rubber and the batter's back foot
   - the camera constrained to ~2 ft behind the aerial backstop line (your note), with your height prior
   - a radial-distortion term
   - the ball track

   Every landmark residual is ≤ 1.9σ (`fig_camera_calibration.png`). A white chalk line I had first taken for the 1B foul line is inconsistent (Δχ² ≈ 40). It's a different marking and is excluded.
4. **Track and fit.** Method B: fit EV, LA, spray, contact time and contact point to the 28 rays plus all landmarks. Track residual RMS is 0.29 px (`fig_track_reprojection.png`).
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
- **Carry:** spin −0.88, wind (along-flight) +0.29, everything else under 0.1.
- **EV:** spin −0.94.
- **LA:** wind speed −0.65.
- **Hang time:** spin −0.64, wind +0.41.

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
| `apex_test.json`, `eyewitness_test.json`, `fly_vs_bounce_test_v1calib.json` | consistency tests (the second used the earlier, superseded calibration) |
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
