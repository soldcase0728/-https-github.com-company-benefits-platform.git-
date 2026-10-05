import numpy as np, json, os, cv2
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from physics import FT, project
from fastfly import fly
import jointfit as J, calib2 as C
OUT = '..'; LIVE = '/tmp/claude-0/live'
F = {int(f[1:4]): f for f in sorted(os.listdir(LIVE))}
x = np.array(json.load(open('/tmp/claude-0/calib3.json'))['x']); f = x[-1]
cam, ev, la, phi, tc, p0, _, _ = J.unpack(x[:-1], f)
o = fly(ev, la, phi, *p0, 1.18, 0.33, 1500., 0., 0., 0., 0.002, 9., True)
uv = project(o[:, 1:4], cam); T = o[:, 0] + tc
tr = json.load(open(f'{OUT}/ball_track.json'))
S = json.load(open(f'{OUT}/mc_summary.json')); R = S['results']
# --- key frames
def lab(im, txt, y=30):
    cv2.rectangle(im, (0, y-24), (12+11*len(txt), y+8), (252, 252, 251), -1); cv2.putText(im, txt, (6, y), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (11, 11, 11), 2)
a = cv2.imread(f'{LIVE}/{F[141]}'); lab(a, 'Contact: bat in zone i140 (4.967 s) - i141 (5.000 s); follow-through i142 (5.034 s)')
cv2.rectangle(a, (620, 480), (760, 620), (214, 120, 42), 2)
b = cv2.imread(f'{LIVE}/{F[174]}')
for d in tr: cv2.circle(b, (int(round(d['u'])), int(round(d['v']))), 3, (214, 120, 42), -1)
k = (T > tr[-1]['t']); pts = np.round(uv[k]).astype(np.int32)
for p_ in pts[::10]: cv2.circle(b, tuple(p_), 2, (52, 104, 235), -1)
lp = tuple(np.round(uv[-1]).astype(int)); cv2.drawMarker(b, lp, (122, 175, 27), cv2.MARKER_TILTED_CROSS, 18, 2)
lab(b, f'Last tracked ball i174 (6.167 s). Blue = {len(tr)} measured detections; orange = modeled continuation (nominal fit)')
lab(b, f"Green X = modeled landing pixel, t = {R['t_land']['median']:.2f} s (not directly visible: ball < 1.5 px)", 62)
c = cv2.imread(f'{LIVE}/{F[min(F, key=lambda i: abs(float(F[i][6:-4]) - R["t_land"]["median"]))]}')
cv2.drawMarker(c, lp, (122, 175, 27), cv2.MARKER_TILTED_CROSS, 18, 2)
lab(c, f"Frame nearest modeled landing ({R['t_land']['median']:.2f} s). Fence arrival (after roll) not identifiable: no carom/fielder resolvable")
cv2.imwrite(f'{OUT}/fig_keyframes.png', np.vstack([cv2.resize(im, (960, 540)) for im in (a, b, c)]))
# zoomed track crop
z = cv2.imread(f'{LIVE}/{F[174]}')[250:460, 660:840]; z = cv2.resize(z, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
for d in tr: cv2.circle(z, (int((d['u']-660)*4), int((d['v']-250)*4)), 4, (214, 120, 42), 1)
for p_ in uv[k][::5]: cv2.circle(z, (int((p_[0]-660)*4), int((p_[1]-250)*4)), 2, (52, 104, 235), -1)
cv2.imwrite(f'{OUT}/crops/track_overlay_zoom.png', z)
# --- reprojection residuals
fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
tt = np.array([d['t'] for d in tr]); U = np.array([[d['u'], d['v']] for d in tr])
P = np.stack([np.interp(tt, T, uv[:, 0]), np.interp(tt, T, uv[:, 1])], -1)
ax[0].plot(U[:, 0], U[:, 1], 'o', ms=4, color='#2a78d6', label='Measured'); ax[0].plot(uv[T < 6.3, 0], uv[T < 6.3, 1], '-', color='#eb6834', lw=2, label='Model')
ax[0].invert_yaxis(); ax[0].set_xlabel('u (px)'); ax[0].set_ylabel('v (px)'); ax[0].legend(frameon=False); ax[0].set_title('Ball track in image', loc='left')
ax[1].plot(tt, U[:, 0]-P[:, 0], 'o-', ms=3, color='#2a78d6', label='u residual'); ax[1].plot(tt, U[:, 1]-P[:, 1], 's-', ms=3, color='#1baf7a', label='v residual')
ax[1].axhline(0, color='#52514e', lw=1); ax[1].set_xlabel('PTS (s)'); ax[1].set_ylabel('px'); ax[1].legend(frameon=False)
ax[1].set_title(f'Reprojection residuals (RMS {np.sqrt(np.mean((U-P)**2)):.2f} px)', loc='left')
fig.tight_layout(); fig.savefig(f'{OUT}/fig_track_reprojection.png', dpi=150); plt.close(fig)
# --- schematic spray (aerial not provided)
MC = json.load(open(f'{OUT}/mc_samples.json'))
lx = np.array([s['land_x'] for s in MC if s.get('ok')]); ly = np.array([s['land_y'] for s in MC if s.get('ok')])
fig, ax = plt.subplots(figsize=(6.4, 6.4))
a = np.radians(np.linspace(-45, 45, 200))
ax.plot(250*np.sin(a), 250*np.cos(a), color='#eb6834', lw=2, label='Fence, schematic 250 ft arc (true polyline unknown)')
ax.plot(200*np.sin(a), 200*np.cos(a), color='#52514e', lw=1, ls=':', label='200-ft reference arc')
for s_ in (-1, 1): ax.plot([0, s_*185], [0, 185], color='#52514e', lw=1)
bx = [0, 42.43, 0, -42.43, 0]; by = [0, 42.43, 84.85, 42.43, 0]; ax.plot(bx, by, color='#52514e', lw=1)
ax.plot([0, 256*np.sin(np.radians(12))], [0, 256*np.cos(np.radians(12))], color='#eda100', lw=2, label='User yellow line (~12° R, 250 ft) - approx.')
ph = np.radians(R['phi']['median']); ax.plot([0, 260*np.sin(ph)], [0, 260*np.cos(ph)], color='#2a78d6', lw=2, label=f"Spray line {R['phi']['median']:.1f}° R of center")
ax.scatter(ly[::5], lx[::5], s=3, color='#1baf7a', alpha=0.35, label='Modeled landing points (MC)')
ax.set_aspect('equal'); ax.set_xlim(-200, 200); ax.set_ylim(-15, 275); ax.set_xlabel('ft  (+ = right field)'); ax.set_ylabel('ft toward CF')
ax.set_title('Spray (schematic - aerial image was not provided)', loc='left', fontsize=11); ax.legend(fontsize=7.5, frameon=False, loc='lower center')
fig.tight_layout(); fig.savefig(f'{OUT}/fig_spray_schematic.png', dpi=150); plt.close(fig)
print('nominal', dict(f=f, ev=ev, la=la, phi=phi, tc=tc))
