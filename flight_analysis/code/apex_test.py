"""Can the apex be over the infield-arc edge (~119-128 ft) and still fit the video track?"""
import numpy as np, json
from scipy.optimize import least_squares
import calib_aerial as CA
from physics import FT; from fastfly import fly
x0 = np.array(json.load(open('/tmp/claude-0/ca_baseline_0.json')))
to = np.radians(52 + 180 - 133.2); W = 2.0*np.array([np.cos(to), np.sin(to), 0])
def traj(x, kw):
    return fly(*x[10:13], *(np.array(x[14:17])*FT), kw['rho'], kw['cd'], kw['rpm'], *kw['wind'], 0.002, 9., True)
def stats(x, kw):
    o = traj(x, kw); z = o[:, 3]/FT; j = int(np.argmax(z)); r = np.hypot(o[:, 1], o[:, 2])/FT
    i = int(np.argmax(o[:, 3] < 0)); return dict(apex_ft=z[j], apex_dist=r[j], apex_t=o[j, 0], carry=r[i], hang=o[i, 0])
out = {}
for name, kw in {'nominal (1500 rpm)': dict(cd=0.33, rpm=1500., rho=1.221, wind=W),
                 'low spin (500 rpm)': dict(cd=0.33, rpm=500., rho=1.221, wind=W),
                 'high spin, low drag (2500 rpm, Cd .28)': dict(cd=0.28, rpm=2500., rho=1.221, wind=W)}.items():
    free = least_squares(CA.residuals, x0, bounds=(CA.LB, CA.UB), kwargs=kw, x_scale='jac')
    best = None
    for ev0, la0 in ((65, 30), (75, 28), (85, 25), (70, 35)):
        x = free.x.copy(); x[10] = ev0; x[11] = la0
        s = least_squares(lambda x: np.r_[CA.residuals(x, **kw), (stats(x, kw)['apex_dist'] - 122.0)/5.0], x,
                          bounds=(CA.LB, CA.UB), x_scale='jac', max_nfev=3000)
        if best is None or s.cost < best.cost: best = s
    out[name] = {}
    for lab, s in (('free fit', free), ('apex forced to 122 ft', best)):
        p = CA.residuals(s.x, parts=True, **kw); st = stats(s.x, kw)
        tr = p['track']; rms = np.sqrt(np.mean(tr**2))
        out[name][lab] = dict(cost=float(s.cost), track_chi2=float(np.sum(tr**2)), track_rms_px=float(rms), max_track_res_px=float(np.abs(tr).max()),
                              ev=float(s.x[10]), la=float(s.x[11]), f=float(s.x[6]), **{k: float(v) for k, v in st.items()})
        print(f"{name:40s} {lab:22s} apex {st['apex_ft']:5.1f} ft at {st['apex_dist']:6.1f} ft (t+{st['apex_t']:.2f}s)  EV {s.x[10]:5.1f} LA {s.x[11]:5.1f}  "
              f"carry {st['carry']:6.1f}  track RMS {rms:.2f}px max {np.abs(tr).max():.1f}px  chi2_track {np.sum(tr**2):6.1f}  total cost {s.cost:6.1f}")
    out[name]['delta_chi2'] = float(2*(best.cost - free.cost)); print('   delta chi2 =', round(2*(best.cost-free.cost), 1))
json.dump(out, open('../apex_test.json', 'w'), indent=1)
