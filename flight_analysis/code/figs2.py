import numpy as np, json, os, cv2
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from physics import FT, project
from fastfly import fly
import calib_aerial as CA, field as FD
OUT = '..'; LIVE = '/tmp/claude-0/live'
F = {int(f[1:4]): f for f in sorted(os.listdir(LIVE))}
x = np.array(json.load(open('/tmp/claude-0/ca_baseline_0.json'))); f = x[6]
cam = CA.cam_of(x); ev, la, phi, tc = x[10:14]; p0 = np.array(x[14:17])*FT
_to = np.radians(52 + 180 - 133.2); _w = 2.0*np.array([np.cos(_to), np.sin(_to), 0])
o = fly(ev, la, phi, *p0, 1.221, 0.33, 1500., *_w, 0.002, 9., True)
uv = CA.proj(o[:, 1:4], cam); T = o[:, 0] + tc
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
# --- spray line on the aerial
MC = json.load(open(f'{OUT}/mc2_samples.json'))
A_ = cv2.imread(f'{OUT}/aerial.png'); sc = FD.scale_infield()[0]
def to_px(X, Y): return FD.PLATE + (np.asarray(X)[..., None]*FD.C_HAT + np.asarray(Y)[..., None]*FD.Y_HAT)*sc
ph = np.radians(R['phi']['median']); Df = FD.fence_D(R['phi']['median'], sc)
p_end = to_px(Df*np.cos(ph), Df*np.sin(ph)); cv2.line(A_, tuple(FD.PLATE.astype(int)), tuple(p_end.astype(int)), (214, 120, 42), 3)
for s_ in MC[::4]:
    if s_.get('ok'): cv2.circle(A_, tuple(to_px(s_['land_x'], s_['land_y']).astype(int)), 1, (122, 175, 27), -1)
L_ = to_px(R['land_x']['median'], R['land_y']['median']); cv2.circle(A_, tuple(L_.astype(int)), 7, (122, 175, 27), 2)
for k_, v_ in FD.POLES_PX.items(): cv2.drawMarker(A_, tuple(np.array(v_).astype(int)), (0, 0, 255), cv2.MARKER_SQUARE, 10, 2)
cam_px = to_px(R['Xc']['median'], R['Yc']['median']); cv2.drawMarker(A_, tuple(cam_px.astype(int)), (0, 0, 255), cv2.MARKER_DIAMOND, 12, 2)
for t_, y_ in ((f"Spray {R['phi']['median']:.1f} deg R of center (blue); fence here ~{Df:.0f} ft", 20),
               (f"Green: modeled landing points (MC); circle = median {R['carry']['median']:.0f} ft", 42),
               ("Red squares: light-pole bases used for calibration; red diamond: camera", 64)):
    cv2.rectangle(A_, (4, y_-16), (8+9*len(t_), y_+6), (252, 252, 251), -1); cv2.putText(A_, t_, (6, y_), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (11, 11, 11), 1)
cv2.imwrite(f'{OUT}/fig_spray_on_aerial.png', A_)
print('nominal', dict(f=f, ev=ev, la=la, phi=phi, tc=tc))
