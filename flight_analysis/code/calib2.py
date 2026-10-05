"""Joint fit with free focal length + 1B chalk line constraint."""
import numpy as np, json
from scipy.optimize import least_squares
from physics import *
import jointfit as J
UA = np.linspace(830, 1270, 12); VA = -0.16315*UA + 722.15     # MEASURED chalk line A (RANSAC, rms 0.8 px)
def res2(x, w_pitch_head=1.0, sig_line=2.0, **kw):
    f = x[-1]; r = J.residuals(x[:-1], f, **kw)
    cam = J.unpack(x[:-1], f)[0]
    s = np.linspace(15, 160, 300); uv = project(np.c_[s/np.sqrt(2), s/np.sqrt(2), 0*s]*FT, cam)
    o = np.argsort(uv[:, 0]); vpred = np.interp(UA, uv[o, 0], uv[o, 1])
    rl = (vpred - VA)/sig_line
    if w_pitch_head != 1.0:   # down-weight the pitcher-head landmark (index of its 2 residuals)
        n = 2*len(J.TR); r = r.copy(); r[n+4:n+6] *= w_pitch_head
    return np.r_[r, rl]
def fit2(**kw):
    best = None
    for f0 in (700, 900, 1100):
        for la0 in (20, 30, 40):
            x = np.r_[J.X0, f0]; x[7] = la0; x[6] = 60
            s = least_squares(res2, x, bounds=(J.LB + [400], J.UB + [1600]), kwargs=kw, x_scale='jac')
            if best is None or s.cost < best.cost: best = s
    return best
if __name__ == '__main__':
    for w in (1.0, 0.0):
        s = fit2(w_pitch_head=w); x = s.x; f = x[-1]
        cam, ev, la, phi, tc, p0, dfen, yfen = J.unpack(x[:-1], f)
        rt = J.residuals(x[:-1], f, track_only=True)
        n = 2*len(J.TR); rr = J.residuals(x[:-1], f)
        print(f'pitcher-head weight {w}: cost {s.cost:.1f}  f={f:.0f}  b={x[0]:.1f} yc={x[1]:.1f} hc={x[2]:.1f} yaw={x[3]:.1f} pitch={x[4]:.1f} roll={x[5]:.1f}')
        print(f'   EV={ev:.1f} LA={la:.1f} phi={phi:.1f} tc={tc:.3f} contact=({x[10]:.1f},{x[11]:.1f},{x[12]:.1f}) ft  trackRMS={np.sqrt(np.mean(rt**2)):.2f}px')
        print('   landmark residuals (sigma units): batter', rr[n:n+2].round(2), 'p.feet', rr[n+2:n+4].round(2), 'p.head', rr[n+4:n+6].round(2), 'fence', rr[n+6:n+8].round(2))
        print('   1B-line residual px:', (res2(x, w_pitch_head=w)[-12:]*2).round(1))
        hp = project(np.array([43.5, 0, 0])*FT, cam)[1] - project(np.array([43.5, 0, 5.3])*FT, cam)[1]
        print(f'   implied pitcher height for 5.3 ft: {hp:.1f}px (measured ~49);  implied height for measured 49 px: {5.3*49/hp:.2f} ft')
        json.dump(dict(x=x.tolist(), f=f), open(f'/tmp/claude-0/calib2_w{int(w)}.json', 'w'))

POLES = ((1017., 0.0117), (338., 0.0084))     # MEASURED du/dv of light poles (weak; glare/netting)
def pole_res(x, sig=0.0105):
    cam = J.unpack(x[:-1], x[-1])[0]; out = []
    for uc, m in POLES:
        r = ray(np.array([uc, 455.]), cam); base = cam['C'] + r*(-cam['C'][2]/r[2])
        uv = project(np.array([base, base + np.array([0, 0, 15.])]), cam)
        out.append(((uv[1, 0]-uv[0, 0])/(uv[1, 1]-uv[0, 1]) - m)/sig)
    return np.array(out)
def res3(x, **kw):
    return np.r_[res2(x, w_pitch_head=kw.pop('w_pitch_head', 0.35), sig_line=kw.pop('sig_line', 3.0), **kw), pole_res(x)]
def fit3(x0=None, starts=None, **kw):
    best = None
    starts = starts or [(f0, la0) for f0 in (700, 900, 1100) for la0 in (20, 32)]
    for f0, la0 in starts:
        x = np.r_[J.X0, f0] if x0 is None else x0.copy()
        if x0 is None: x[7] = la0; x[6] = 60
        s = least_squares(res3, x, bounds=(J.LB + [400], J.UB + [1600]), kwargs=kw, x_scale='jac')
        if best is None or s.cost < best.cost: best = s
    return best
