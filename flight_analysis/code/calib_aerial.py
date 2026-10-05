"""Camera + trajectory joint fit using aerial-derived geometry (Step 3 v2)."""
import numpy as np, json
from scipy.optimize import least_squares
from physics import FT, camera_basis
from fastfly import fly
import field as FD
S_INF = FD.scale_infield()[0]
TR = [d for d in json.load(open('../ball_track.json'))]
tt = np.array([d['t'] for d in TR]); UV = np.array([[d['u'], d['v']] for d in TR])
POLE = {k: FD.to_field(v, S_INF) for k, v in FD.POLES_PX.items()}
NET = [FD.to_field(p, S_INF) for p in FD.BACKSTOP]
FENCE_OBS = np.array([(580, 457), (620, 463), (660, 463), (700, 456), (780, 461), (820, 456), (860, 463), (900, 465),
                      (940, 462), (980, 464), (1060, 468), (1100, 470)], float)        # MEASURED fence-base rows
PITCH_FEET = ((43.5, 0.0, 0.0), (655, 512), 8.0)
BATTER_FOOT = ((-1.5, 2.5, 0.0), (695, 618), 9.0)
RC_BASE_PX, RC_TOP_PX = (1019.0, 477.5), (1020.0, 282.0)
LC_TOP_PX, LC_SHAFT = (342.0, 273.0), (332.5, 400.0)
NAMES = ['Xc', 'Yc', 'hc', 'yaw', 'pitch', 'roll', 'f', 'k1', 'Hl', 'Hr', 'ev', 'la', 'phi', 'tc', 'cx', 'cy', 'cz']
X0 = np.array([-27.3, 0.0, 5.0, 0.0, 5.0, 0.0, 800., 0.0, 65., 65., 60., 22., 10., 5.03, 2.0, 0.3, 2.6])
LB = [-40, -20, 2.5, -20, -10, -8, 400, -0.6, 30, 30, 35, 0, -40, 4.9, -1, -3, 0.5]
UB = [-15, 20, 10, 20, 20, 8, 1600, 0.6, 120, 120, 110, 60, 45, 5.15, 5, 3, 4.5]
def cam_of(x):
    return dict(C=np.array([x[0], x[1], x[2]])*FT, yaw=np.radians(x[3]), pitch=np.radians(x[4]), roll=np.radians(x[5]), f=x[6], k1=x[7])
def proj(P, cam):
    F, R, U = camera_basis(cam['yaw'], cam['pitch'], cam['roll'])
    d = np.asarray(P) - cam['C']; z = d @ F; xn = (d @ R)/z; yn = (d @ U)/z
    s = 1 + cam['k1']*(xn**2 + yn**2)
    return np.stack([640 + cam['f']*xn*s, 360 - cam['f']*yn*s], -1)
def ft3(p, z=0.0): return np.array([p[0], p[1], z])*FT
def fence_v_at_u(cam, u_obs):
    P = FD.to_field(FD.FENCE_PX, S_INF); pts = []
    for a, b in zip(P[:-1], P[1:]):
        w = np.linspace(0, 1, 60)[:, None]; pts.append(a + w*(b - a))
    pts = np.vstack(pts); uv = proj(np.c_[pts, np.zeros(len(pts))]*FT, cam)
    ok = (uv[:, 0] > 300) & (uv[:, 0] < 1280); uv = uv[ok]; o = np.argsort(uv[:, 0])
    return np.interp(u_obs, uv[o, 0], uv[o, 1])
def residuals(x, cd=0.33, rpm=1500., rho=1.221, wind=np.zeros(3), hc_prior=(5.0, 0.5), use_line=False, parts=False):
    cam = cam_of(x); ev, la, phi, tc = x[10:14]; p0 = np.array(x[14:17])*FT
    o = fly(ev, la, phi, *p0, rho, cd, rpm, *wind, 0.002, 1.4, False)
    Pi = np.stack([np.interp(tt - tc, o[:, 0], o[:, k]) for k in (1, 2, 3)], -1)
    r = {}
    r['track'] = ((proj(Pi, cam) - UV)/1.0).ravel()
    # poles
    rb = proj(ft3(POLE['RC_pole']), cam); rt = proj(ft3(POLE['RC_pole'], x[9]), cam)
    r['rc_pole'] = np.r_[(rb - RC_BASE_PX)/np.array([3.0, 5.0]), (rt - RC_TOP_PX)/2.5]
    lb = proj(ft3(POLE['LC_pole']), cam); lt = proj(ft3(POLE['LC_pole'], x[8]), cam)
    w = (LC_SHAFT[1] - lt[1])/(lb[1] - lt[1]); ushaft = lt[0] + w*(lb[0] - lt[0])
    r['lc_pole'] = np.r_[(lt - LC_TOP_PX)/2.5, (ushaft - LC_SHAFT[0])/2.5]
    r['fence'] = (fence_v_at_u(cam, FENCE_OBS[:, 0]) - FENCE_OBS[:, 1])/4.0
    for k, (g, px, s) in (('pitcher', PITCH_FEET), ('batter', BATTER_FOOT)):
        r[k] = (proj(np.array(g)*FT, cam) - px)/s
    # camera on the backstop netting line (aerial), +-1 ft
    a, b = NET; n = np.array([-(b - a)[1], (b - a)[0]]); n /= np.linalg.norm(n)
    s0 = np.sign((np.zeros(2) - a) @ n)          # sign of the field side of the netting
    d = (np.array([x[0], x[1]]) - a) @ n
    r['net'] = np.array([(d + s0*NET_OFFSET)/NET_SIG])
    r['priors'] = np.array([(x[2] - hc_prior[0])/hc_prior[1], x[5]/3.0, x[7]/0.15, (tc - TC0)/0.033,
                            (x[14] - 2.0)/0.75, (x[15] - 0.3)/0.7, (x[16] - 2.5)/0.5])
    if use_line:
        s = np.linspace(15, 160, 300); uv = proj(np.c_[s/np.sqrt(2), s/np.sqrt(2), 0*s]*FT, cam)
        o2 = np.argsort(uv[:, 0]); UA = np.linspace(830, 1270, 12)
        r['line'] = (np.interp(UA, uv[o2, 0], uv[o2, 1]) - (-0.16315*UA + 722.15))/3.0
    return r if parts else np.concatenate([np.ravel(v) for v in r.values()])
TC0 = 5.000
NET_OFFSET, NET_SIG = 2.0, 0.75   # USER-SUPPLIED: camera ~2 ft behind the backstop fence line
def fit(x0=X0, **kw):
    best = None
    for f0 in (650, 850, 1050):
        for la0 in (18, 28):
            x = x0.copy(); x[6] = f0; x[11] = la0
            s = least_squares(residuals, x, bounds=(LB, UB), kwargs=kw, x_scale='jac', max_nfev=2000)
            if best is None or s.cost < best.cost: best = s
    return best
def report(s, **kw):
    x = s.x; p = residuals(x, parts=True, **{k: v for k, v in kw.items() if k != 'parts'})
    print('cost %.1f' % s.cost, ' '.join(f'{n}={v:.2f}' for n, v in zip(NAMES, x)))
    for k, v in p.items(): print(f'   {k:8s} chi2={np.sum(v**2):7.2f}  n={v.size}  max|r|={np.abs(v).max():.2f}')
if __name__ == '__main__':
    for name, kw in (('baseline (hc 5.0+-0.5, no chalk line)', {}), ('hc free (prior 5+-3)', dict(hc_prior=(5.0, 3.0))),
                     ('baseline + chalk line A', dict(use_line=True))):
        s = fit(**kw); print('==', name); report(s, **kw)
        json.dump(s.x.tolist(), open(f'/tmp/claude-0/ca_{name.split()[0]}_{len(kw)}.json', 'w'))
