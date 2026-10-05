import numpy as np, json, os, cv2
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from scipy.stats import spearmanr
from physics import FT, MPH, project
from fastfly import fly
import jointfit as J
OUT = '..'
S = json.load(open(f'{OUT}/mc2_samples.json'))
SURF, INK, INK2, GRID = '#fcfcfb', '#0b0b0b', '#52514e', '#e4e3df'
C1, C2, C3 = '#2a78d6', '#eb6834', '#1baf7a'
plt.rcParams.update({'figure.facecolor': SURF, 'axes.facecolor': SURF, 'axes.edgecolor': GRID, 'axes.labelcolor': INK2,
                     'xtick.color': INK2, 'ytick.color': INK2, 'text.color': INK, 'axes.grid': True, 'grid.color': GRID,
                     'grid.linewidth': 0.6, 'font.size': 10, 'axes.spines.top': False, 'axes.spines.right': False})
ok = [s for s in S if s.get('ok')]
med_cost = np.median([s['cost'] for s in ok])
acc = [s for s in ok if s['ev'] <= 100 and s['cost'] <= 3*med_cost and s['chi2_track'] <= 4*56*0.5]
rej = 1 - len(acc)/len(S)
A = lambda k: np.array([s[k] for s in acc], float)
def pct(x): x = np.asarray(x, float); x = x[np.isfinite(x)]; return dict(median=float(np.median(x)), p10=float(np.percentile(x, 10)), p90=float(np.percentile(x, 90)), p5=float(np.percentile(x, 5)), p95=float(np.percentile(x, 95)), n=int(len(x)))
R = {k: pct(A(k)) for k in ('ev', 'la', 'phi', 'tc', 'hang', 't_land', 'carry', 'land_x', 'land_y', 'land_phi', 'D_fence', 'roll_ft', 'apex_z', 'apex_r', 'apex_t', 'v_land_mph', 'vx_land_fps', 'descent_deg', 'f', 'Xc', 'Yc', 'hc', 'pitch', 'roll', 'yaw', 'k1', 'Hl', 'Hr', 'cx', 'cy', 'cz')}
R['apex_t_after_contact'] = R.pop('apex_t')
heights = {}
for D in ('150', '175', '200', '210', '220', '225', '250'):
    z = np.array([s['z_at'][D] if s['z_at'][D] is not None else np.nan for s in acc])
    heights[D] = dict(p_reached_in_flight=float(np.mean(np.isfinite(z))), **(pct(z) if np.isfinite(z).sum() > 20 else {}))
cleared = {D: float(np.mean([s['cleared'][D] for s in acc])) for D in ('200', '210', '220', '225')}
p_fly = float(np.mean([s['fly_to_fence'] for s in acc]))
# rank sensitivities (Spearman) of outputs on sampled inputs
IN = ['in_tc0', 'in_cd', 'in_rpm', 'in_rho', 'in_wind_along', 'in_wind_spd', 'in_scale']
sens = {o: {i: float(spearmanr(A(i), A(o))[0]) for i in IN} for o in ('carry', 'ev', 'la', 'hang')}
summary = dict(n_samples=len(S), n_accepted=len(acc), rejection_rate=rej, reject_rule='fit failed, EV>100 mph, cost>3x median, or track RMS>2 px',
               results=R, height_at_distance_ft=heights, p_cleared_fence_if_at=cleared, p_fly_to_actual_fence=p_fly,
               spearman_sensitivity=sens)
json.dump(summary, open(f'{OUT}/mc_summary.json', 'w'), indent=1)
print(json.dumps(dict(n=len(S), acc=len(acc), rej=round(rej, 4), p_fly=p_fly, cleared=cleared), indent=0))
for k, v in R.items(): print(f"{k:24s} med {v['median']:8.2f}  10-90 [{v['p10']:.2f}, {v['p90']:.2f}]  5-95 [{v['p5']:.2f}, {v['p95']:.2f}]")
for D, v in heights.items(): print(D, {k: (round(x, 2) if isinstance(x, float) else x) for k, x in v.items() if k in ('p_reached_in_flight', 'median', 'p10', 'p90')})
for o, d in sens.items(): print('spearman', o, {k: round(v, 2) for k, v in d.items()})

# ---------- Figure: side-view trajectory band ----------
rng = np.random.default_rng(1); pick = rng.choice(len(acc), 400, replace=False)
grid = np.linspace(0, 260, 261); Zs = []
for j in pick:
    s = acc[j]; to = np.radians(s['in_wind_from'] + 180 - 133.2)
    w = s['in_wind_spd']*np.array([np.cos(to), np.sin(to), 0])
    o = fly(s['ev'], s['la'], s['phi'], s['cx']*FT, s['cy']*FT, s['cz']*FT, s['in_rho'], s['in_cd'], s['in_rpm'], *w, 0.002, 9., True)
    r = np.hypot(o[:, 1], o[:, 2])/FT; z = o[:, 3]/FT
    Zs.append(np.where(grid <= r[-1], np.interp(grid, r, z), np.nan))
Zs = np.array(Zs)
fig, ax = plt.subplots(figsize=(10, 4.6))
lo, mid, hi = (np.nanpercentile(np.where(np.isnan(Zs), -1, Zs), q, axis=0) for q in (10, 50, 90))
ax.fill_between(grid, np.clip(lo, 0, None), np.clip(hi, 0, None), color=C1, alpha=0.22, lw=0, label='10th–90th pct trajectory band')
ax.plot(grid, np.where(mid > 0, mid, np.nan), color=C1, lw=2, label='Median trajectory')
for D, lab, ty in ((200, '200', 9), (220, '220', 16), (225, '225', 9)):
    ax.add_patch(plt.Rectangle((D-0.8, 0), 1.6, 6, color=INK2, alpha=0.35, lw=0)); ax.plot([D, D], [6, ty-0.5], color=INK2, lw=0.8, ls=':')
    ax.text(D + (3 if D == 225 else 0), ty, f'{lab} ft' + ('\nref. fences\n(4–8 ft tall)' if D == 220 else ''), ha='center', va='bottom', fontsize=8, color=INK2)
dlo, dhi = R['D_fence']['p10'], R['D_fence']['p90']; ax.add_patch(plt.Rectangle((dlo, 0), dhi-dlo, 6, color=C2, alpha=0.6, lw=0)); ax.text((dlo+dhi)/2, 9, f'Actual fence\n{dlo:.0f}–{dhi:.0f} ft', ha='center', fontsize=8, color=INK)
cv = A('carry'); ax.hist(cv, bins=60, range=(100, 260), weights=np.full(len(cv), 300/len(cv)), color=C3, alpha=0.7, label='Landing distance (MC density, scaled)')
ax.set_xlim(0, 262)
ax.annotate('', xy=(R['D_fence']['median'], 1.0), xytext=(R['carry']['median'], 1.0), arrowprops=dict(arrowstyle='->', color=INK2, lw=1.2))
ax.text((R['D_fence']['median']+R['carry']['median'])/2, 2.0, f"bounce/roll ≈{R['roll_ft']['median']:.0f} ft", ha='center', fontsize=8, color=INK2); ax.set_ylim(0, 40); ax.set_xlabel('Horizontal distance from plate apex along spray line (ft)'); ax.set_ylabel('Height (ft)')
ax.set_title('Side view along the spray line: lands in the outfield, then bounces/rolls to the fence', loc='left', fontsize=12, color=INK)
ax.legend(loc='upper left', frameon=False, fontsize=9); fig.tight_layout(); fig.savefig(f'{OUT}/fig_side_view_trajectory.png', dpi=150); plt.close(fig)

# ---------- Figure: tornado (carry) ----------
T = json.load(open(f'{OUT}/tornado.json')); base = T['nominal']['carry']
items = sorted(T['swings'].items(), key=lambda kv: abs(kv[1]['hi']['carry'] - kv[1]['lo']['carry']))
fig, ax = plt.subplots(figsize=(9, 4.8))
for y, (name, d) in enumerate(items):
    a, b = d['lo']['carry'] - base, d['hi']['carry'] - base
    ax.barh(y, a, color=C1, height=0.6); ax.barh(y, b, color=C2, height=0.6)
ax.set_yticks(range(len(items))); ax.set_yticklabels([n for n, _ in items], fontsize=8.5)
ax.axvline(0, color=INK2, lw=1); ax.set_xlabel(f'Change in projected carry vs nominal ({base:.0f} ft)')
ax.set_title('Tornado: one-at-a-time swings (full refit each)', loc='left', fontsize=12)
from matplotlib.patches import Patch
ax.legend(handles=[Patch(color=C1, label='low value of input'), Patch(color=C2, label='high value of input')], frameon=False, loc='lower right', fontsize=9)
fig.tight_layout(); fig.savefig(f'{OUT}/fig_tornado_carry.png', dpi=150); plt.close(fig)

# ---------- Figure: timing diagram ----------
fig, ax = plt.subplots(figsize=(10, 3.4))
tc = R['tc']; tl = R['t_land']
ax.axvspan(4.967, 5.034, color=C1, alpha=0.25, lw=0); ax.text(5.0, 3.3, 'Visual contact\nbracket i140–i142', ha='center', fontsize=8)
ax.axvline(5.086, color=C2, lw=1.5); ax.text(5.10, 2.4, 'Bat-crack audio\n5.086 s', fontsize=8, color=INK)
tr = json.load(open(f'{OUT}/ball_track.json')); tt = [d['t'] for d in tr]
ax.plot(tt, [1.6]*len(tt), '|', color=C1, ms=10); ax.text(5.2, 1.85, f'Ball tracked: {len(tt)} frames, {tt[0]:.3f}–{tt[-1]:.3f} s', fontsize=8)
ax.axvspan(tl['p10'], tl['p90'], color=C3, alpha=0.3, lw=0); ax.text((tl['p10']+tl['p90'])/2, 0.9, f"Modeled landing\n{tl['median']:.2f} s (10–90%)", ha='center', fontsize=8)
fa0, fa1 = tl['p10'] + 3.6, tl['p90'] + 3.6
ax.axvspan(fa0 - 0.2, fa1 + 0.2, color=C2, alpha=0.25, lw=0); ax.text((fa0+fa1)/2, 2.6, f"Fence arrival\n≈{tl['median']+3.6:.1f} s\n(landing + 3.6 s roll,\nuser-supplied)", ha='center', fontsize=8)
ax.annotate('', xy=(fa0, 1.9), xytext=(tl['median']+0.1, 1.9), arrowprops=dict(arrowstyle='->', color=INK2, lw=1)); ax.text((tl['median']+fa0)/2, 2.05, 'bounce/roll ≈88 ft', ha='center', fontsize=8, color=INK2)
pts = json.load(open('/tmp/claude-0/pts_live.json')) if os.path.exists('/tmp/claude-0/pts_live.json') else None
ax.set_xlim(4.6, 12.6); ax.set_ylim(0, 4); ax.set_yticks([]); ax.set_xlabel('Video PTS (s)')
ax.set_title(f"Timing: contact {tc['median']:.2f} s, landing {tl['median']:.2f} s (hang {R['hang']['median']:.2f} s), fence ≈{tl['median']+3.6:.1f} s", loc='left', fontsize=12)
fig.tight_layout(); fig.savefig(f'{OUT}/fig_timing_diagram.png', dpi=150); plt.close(fig)
