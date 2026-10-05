import numpy as np, json
from scipy.optimize import least_squares
from physics import *
TR = [d for d in json.load(open('../ball_track.json')) if d['idx'] not in (175, 176)]
tt = np.array([d['t'] for d in TR]); UV = np.array([[d['u'], d['v']] for d in TR])
SIG_TRACK = 1.0
TC0, TCS = 5.000, 0.033   # MEASURED: bat in zone i140-i141, follow-through i142
# landmarks: (ground point ft, pixel, sigma px)
LM = dict(batter=((-0.5, 2.5, 0.0), (695, 618), 7.0),   # back-foot cleat, i120-i139
          pitcher_feet=((43.5, 0.0, 0.0), (655, 512), 8.0),
          pitcher_head=((43.5, 0.0, 5.3), (655, 463), 5.0))
FENCE_V, FENCE_U = 458.0, 700.0

def unpack(x, f):
    b, yc, hc, yaw, pitch, roll, ev, la, phi, tc, cx, cy, cz, dfen, yfen = x
    cam = dict(f=f, u0=640., v0=360., C=np.array([-b, yc, hc])*FT, yaw=np.radians(yaw),
               pitch=np.radians(pitch), roll=np.radians(roll))
    return cam, ev, la, phi, tc, np.array([cx, cy, cz])*FT, dfen, yfen

from fastfly import fly
def simulate(ev, la, phi, p0, rho=1.18, cd=0.33, rpm=1500., wind=np.zeros(3), tmax=1.4, dt=0.002):
    o = fly(float(ev), float(la), float(phi), float(p0[0]), float(p0[1]), float(p0[2]), float(rho), float(cd),
            float(rpm), float(wind[0]), float(wind[1]), float(wind[2]), dt, tmax, False)
    return o[:, 0], o[:, 1:4], o[:, 4:7]

def residuals(x, f, cd=0.33, rpm=1500., rho=1.18, wind=np.zeros(3), track_only=False):
    cam, ev, la, phi, tc, p0, dfen, yfen = unpack(x, f)
    t, P, _ = simulate(ev, la, phi, p0, rho, cd, rpm, wind)
    Pi = np.stack([np.interp(tt - tc, t, P[:, k]) for k in range(3)], -1)
    r = [((project(Pi, cam) - UV)/SIG_TRACK).ravel()]
    if track_only: return np.concatenate(r)
    for g, px, s in LM.values():
        r.append((project(np.array(g)*FT, cam) - px)/s)
    # fence base: ground point at distance dfen (ft) and lateral yfen must image at (700, 458)
    pf = project(np.array([dfen, yfen, 0.])*FT, cam); r.append([(pf[0]-FENCE_U)/5, (pf[1]-FENCE_V)/3])
    b, yc, hc, yaw, pitch, roll = x[:6]
    r.append([(b-30)/15, yc/8, (hc-6)/3, roll/2.0, (tc-TC0)/TCS,
              (x[10]-2.0)/0.75, (x[11]-0.3)/0.7, (x[12]-2.5)/0.5, (dfen-240)/20])
    return np.concatenate([np.ravel(a) for a in r])

X0 = np.array([30, 0, 7, 0, -6, 0, 70, 28, 12, 5.00, 2.0, 0.3, 2.5, 240, 40])
LB = [5, -30, 2, -30, -25, -8, 35, 0, -40, 4.90, -1, -3, 0.5, 150, -150]
UB = [80, 30, 20, 30, 15, 8, 110, 60, 45, 5.15, 5, 3, 4.5, 330, 150]

def fit(f, x0=X0, **kw):
    best = None
    for la0 in (15, 25, 35, 45):
        for ev0 in (55, 70, 85):
            x = x0.copy(); x[7] = la0; x[6] = ev0
            s = least_squares(residuals, x, bounds=(LB, UB), args=(f,), kwargs=kw, x_scale='jac')
            if best is None or s.cost < best.cost: best = s
    return best
if __name__ == '__main__':
    out = []
    for f in (550, 650, 750, 850, 950, 1050, 1150):
        s = fit(f); rt = residuals(s.x, f, track_only=True)*SIG_TRACK
        cam, ev, la, phi, tc, p0, dfen, yfen = unpack(s.x, f)
        print(f'f={f:5d} cost={s.cost:8.1f} trackRMS={np.sqrt(np.mean(rt**2)):.2f}px  b={s.x[0]:.1f} yc={s.x[1]:.1f} hc={s.x[2]:.1f} '
              f'yaw={s.x[3]:.1f} pitch={s.x[4]:.1f} roll={s.x[5]:.1f} | EV={ev:.1f} LA={la:.1f} phi={phi:.1f} tc={tc:.3f} dfen={dfen:.0f}')
        out.append(dict(f=f, cost=s.cost, x=s.x.tolist()))
    json.dump(out, open('/tmp/claude-0/fscan.json', 'w'))
