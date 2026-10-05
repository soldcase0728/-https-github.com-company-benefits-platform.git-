import numpy as np, json, cv2
import calib_aerial as CA, field as FD
from physics import FT
x = np.array(json.load(open('/tmp/claude-0/ca_baseline_0.json'))); cam = CA.cam_of(x)
im = cv2.imread('/tmp/claude-0/median.png'); sc = CA.S_INF
def poly(P, col, th=1):
    uv = CA.proj(np.asarray(P)*FT, cam); cv2.polylines(im, [np.round(uv).astype(np.int32)], False, col, th)
fen = FD.to_field(FD.FENCE_PX, sc); pts = np.vstack([a + w*(b - a) for a, b in zip(fen[:-1], fen[1:]) for w in np.linspace(0, 1, 40)])
poly(np.c_[pts, 0*pts[:, 0]], (122, 175, 27), 2); poly(np.c_[pts, 0*pts[:, 0] + 6.0], (122, 175, 27), 1)
s = np.linspace(0, 215, 100)
for sg in (1, -1): poly(np.c_[s/np.sqrt(2), sg*s/np.sqrt(2), 0*s], (52, 104, 235), 2)
for k, v in FD.POLES_PX.items():
    p = FD.to_field(v, sc); H = x[8] if k == 'LC_pole' else x[9]; poly([[p[0], p[1], 0], [p[0], p[1], H]], (0, 0, 255), 2)
for b in ('1B', '2B', '3B', 'rubber'):
    p = FD.to_field(FD.BASES[b], sc); uv = CA.proj(np.array([p[0], p[1], 0])*FT, cam); cv2.circle(im, tuple(np.round(uv).astype(int)), 4, (0, 255, 255), -1)
uv = CA.proj(np.zeros(3), cam); cv2.circle(im, tuple(np.round(uv).astype(int)), 5, (255, 0, 255), -1)
for u, v in CA.FENCE_OBS: cv2.circle(im, (int(u), int(v)), 3, (255, 255, 255), 1)
t = f"Projected from aerial + fitted camera (f={x[6]:.0f}px, h={x[2]:.1f}ft, {-x[0]:.1f}ft behind apex): green=fence base & 6-ft top, orange=foul lines (white chalk below 1B line is a different marking), red=light poles, yellow=bases/rubber, magenta=plate apex, white=measured fence rows"
cv2.rectangle(im, (0, 690), (1280, 720), (252, 252, 251), -1); cv2.putText(im, t, (6, 710), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (11, 11, 11), 1)
cv2.imwrite('../fig_camera_calibration.png', im)
