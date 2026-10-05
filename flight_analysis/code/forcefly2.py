"""Fly-vs-bounce likelihood test under nominal and most-favourable-for-carry assumptions."""
import numpy as np, json
from scipy.optimize import least_squares
import calib2 as C, jointfit as J
from physics import FT; from fastfly import fly
x3 = np.array(json.load(open('/tmp/claude-0/calib3.json'))['x'])
CASES = {'nominal': dict(cd=0.33, rpm=1500., rho=1.18, wind=np.zeros(3)),
         'favourable (Cd .28, 2500 rpm, rho 1.14, 4 m/s tailwind)': dict(cd=0.28, rpm=2500., rho=1.14,
              wind=4.0*np.array([np.cos(np.radians(9)), np.sin(np.radians(9)), 0]))}
def z_at(x, D, kw):
    cam, ev, la, phi, tc, p0, _, _ = J.unpack(x[:-1], x[-1])
    o = fly(ev, la, phi, *p0, kw['rho'], kw['cd'], kw['rpm'], *kw['wind'], 0.002, 9., True)
    r = np.hypot(o[:, 1], o[:, 2])/FT; z = o[:, 3]/FT; i = int(np.argmax(z < 0)) if (z < 0).any() else len(z)-1
    return float(np.interp(D, r[:i+1], z[:i+1])) if r[i] >= D else float(z[i] - (D - r[i])*0.5), float(r[i])
out = {}
for name, kw in CASES.items():
    base = lambda x: np.r_[C.res2(x, w_pitch_head=0.35, sig_line=3.0, **kw), C.pole_res(x)]
    free = least_squares(base, x3, bounds=(J.LB+[400], J.UB+[1600]), x_scale='jac')
    best = None
    for ev0 in (70, 80, 90):
        for la0 in (15, 25, 35):
            x = x3.copy(); x[6] = ev0; x[7] = la0
            s = least_squares(lambda x: np.r_[base(x), (z_at(x, 250., kw)[0] - 3.0)/2.5], x,
                              bounds=(J.LB+[400], J.UB+[1600]), x_scale='jac')
            if best is None or s.cost < best.cost: best = s
    out[name] = {}
    for lab, s in (('free', free), ('forced fly 250 ft', best)):
        x = s.x; cam, ev, la, phi, tc, p0, _, _ = J.unpack(x[:-1], x[-1]); z250, carry = z_at(x, 250., kw)
        rt = J.residuals(x[:-1], x[-1], track_only=True, **kw)
        out[name][lab] = dict(cost=s.cost, chi2_track=float(np.sum(rt**2)), track_rms=float(np.sqrt(np.mean(rt**2))),
                              f=float(x[-1]), ev=float(ev), la=float(la), carry=carry, z250=z250)
        print(f'{name:58s} {lab:18s} cost={s.cost:6.1f} chi2_track={np.sum(rt**2):6.1f} f={x[-1]:5.0f} EV={ev:5.1f} LA={la:5.1f} carry={carry:5.1f} z@250={z250:6.1f}')
    print(f'   delta chi2 (2*delta cost) = {2*(best.cost-free.cost):.1f}')
    out[name]['delta_chi2'] = float(2*(best.cost-free.cost))
json.dump(out, open('../fly_vs_bounce_test.json', 'w'), indent=1)
