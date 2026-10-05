"""Is 'landed then rolled ~0.4 s to the fence' compatible with the video track + aerial calibration?"""
import numpy as np, json
from scipy.optimize import least_squares
import calib_aerial as CA, field as FD
from physics import FT; from fastfly import fly
x0 = np.array(json.load(open('/tmp/claude-0/ca_baseline_0.json')))
def landing(x, cd, rpm, rho, wind):
    ev, la, phi, tc = x[10:14]
    o = fly(ev, la, phi, *(np.array(x[14:17])*FT), rho, cd, rpm, *wind, 0.002, 9., True)
    z = o[:, 3]; i = int(np.argmax(z < 0)); a = z[i-1]/(z[i-1]-z[i]); pe = o[i-1] + a*(o[i]-o[i-1])
    return float(np.hypot(pe[1], pe[2])/FT), float(pe[0]), float(o[:, 3].max()/FT)
out = {}
CASES = {'nominal (Cd .33, 1500 rpm)': dict(cd=0.33, rpm=1500.),
         'carry-favourable (Cd .28, 2500 rpm, +2 m/s tail)': dict(cd=0.28, rpm=2500., wind=2.0*np.array([np.cos(np.radians(13)), np.sin(np.radians(13)), 0]))}
for name, kw in CASES.items():
    kw = {'rho': 1.221, 'wind': np.zeros(3), **kw}
    free = least_squares(CA.residuals, x0, bounds=(CA.LB, CA.UB), kwargs=kw, x_scale='jac')
    D = FD.fence_D(free.x[12], CA.S_INF)
    def res_eye(x):
        L = landing(x, kw['cd'], kw['rpm'], kw['rho'], kw['wind'])[0]
        return np.r_[CA.residuals(x, **kw), (L - (FD.fence_D(x[12], CA.S_INF) - 20.0))/8.0]
    best = None
    for ev0, la0 in ((70, 25), (80, 18), (90, 12), (65, 30)):
        x = free.x.copy(); x[10] = ev0; x[11] = la0
        s = least_squares(res_eye, x, bounds=(CA.LB, CA.UB), x_scale='jac', max_nfev=3000)
        if best is None or s.cost < best.cost: best = s
    out[name] = {}
    for lab, s in (('video only', free), ('with eyewitness landing', best)):
        p = CA.residuals(s.x, parts=True, **kw); L, T, ap = landing(s.x, kw['cd'], kw['rpm'], kw['rho'], kw['wind'])
        out[name][lab] = dict(cost=float(s.cost), chi2_parts={k: float(np.sum(v**2)) for k, v in p.items()},
                              f=float(s.x[6]), hc=float(s.x[2]), ev=float(s.x[10]), la=float(s.x[11]), phi=float(s.x[12]),
                              landing_ft=L, hang_s=T, apex_ft=ap, fence_D_ft=float(FD.fence_D(s.x[12], CA.S_INF)))
        print(f'{name:48s} {lab:24s} cost={s.cost:6.1f} f={s.x[6]:5.0f} hc={s.x[2]:.2f} EV={s.x[10]:5.1f} LA={s.x[11]:5.1f} phi={s.x[12]:5.1f} '
              f'landing={L:5.1f} ft hang={T:.2f} apex={ap:.1f}  chi2: ' + ' '.join(f'{k}={np.sum(v**2):.1f}' for k, v in p.items()))
    out[name]['delta_chi2'] = float(2*(best.cost - free.cost)); print('   delta chi2 =', round(2*(best.cost - free.cost), 1))
json.dump(out, open('../eyewitness_test.json', 'w'), indent=1)
