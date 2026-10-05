import numpy as np, json, time
from scipy.optimize import least_squares
import calib2 as C, jointfit as J
from physics import FT; from fastfly import fly
x3 = np.array(json.load(open('/tmp/claude-0/calib3.json'))['x'])
def z_at(x, D):
    cam, ev, la, phi, tc, p0, _, _ = J.unpack(x[:-1], x[-1])
    o = fly(ev, la, phi, *p0, 1.18, 0.33, 1500., 0., 0., 0., 0.002, 8., True)
    r = np.hypot(o[:, 1], o[:, 2])/FT; z = o[:, 3]/FT
    i = np.argmax(z < 0) if (z < 0).any() else len(z)-1
    return np.interp(D, r[:i+1], z[:i+1]) if r[i] >= D else z[i] - (D - r[i])*0.5  # penalise falling short
def res_fly(x, D=250., h=3.0, sh=2.5):
    return np.r_[C.res3(x), (z_at(x, D) - h)/sh]
t = time.time(); free = least_squares(C.res3, x3, bounds=(J.LB+[400], J.UB+[1600]), x_scale='jac'); print('warm fit s', round(time.time()-t, 2))
best = None
for ev0 in (70, 80, 90):
    for la0 in (15, 25, 35):
        x = x3.copy(); x[6] = ev0; x[7] = la0
        s = least_squares(res_fly, x, bounds=(J.LB+[400], J.UB+[1600]), x_scale='jac')
        if best is None or s.cost < best.cost: best = s
for name, s in (('free', free), ('forced fly to 250 ft @3 ft', best)):
    x = s.x; cam, ev, la, phi, tc, p0, _, _ = J.unpack(x[:-1], x[-1])
    rt = J.residuals(x[:-1], x[-1], track_only=True)
    print(f'{name:28s} cost={s.cost:8.1f}  chi2_track={np.sum(rt**2):8.1f}  trackRMS={np.sqrt(np.mean(rt**2)):.2f}px  maxres={np.abs(rt).max():.1f}px  f={x[-1]:.0f} EV={ev:.1f} LA={la:.1f} tc={tc:.3f} z250={z_at(x,250):.1f}')
json.dump(dict(free=free.x.tolist(), fly=best.x.tolist()), open('/tmp/claude-0/forcefly.json', 'w'))
