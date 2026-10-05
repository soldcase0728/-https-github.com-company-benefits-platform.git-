"""One-at-a-time swings (10th/90th pct of each sampled input), full refit each time."""
import numpy as np, json
from scipy.optimize import least_squares
import calib2 as C, jointfit as J
from physics import FT; from fastfly import fly
x3 = np.array(json.load(open('/tmp/claude-0/calib3.json'))['x'])
NOM = dict(tc0=5.000, cd=0.33, rpm=1500., rho=1.18, w_along=0.0, w_head=0.35, sig_line=3.0, sig_pole=0.0105,
           line_off=0.0, track_bias_v=0.0, contact_x=2.0)
SW = {'t_contact (4.958 / 5.042 s)': ('tc0', 4.958, 5.042),
      'C_D (0.292 / 0.388)': ('cd', 0.292, 0.388),
      'Backspin (700 / 2300 rpm)': ('rpm', 700., 2300.),
      'Air density (1.142 / 1.218 kg/m3)': ('rho', 1.142, 1.218),
      'Wind along spray (-2.6 / +2.6 m/s)': ('w_along', -2.56, 2.56),
      'Pitcher-height cue weight (0 / 0.5)': ('w_head', 0.0, 0.5),
      '1B chalk-line sigma (2 / 5 px)': ('sig_line', 2.0, 5.0),
      'Light-pole tilt sigma (0.6 / 1.7 deg)': ('sig_pole', 0.0105, 0.03),
      '1B chalk-line offset (-2 / +2 px)': ('line_off', -1.9, 1.9),
      'Track vertical bias (-0.9 / +0.9 px)': ('track_bias_v', -0.9, 0.9),
      'Contact point fwd (1.0 / 3.0 ft)': ('contact_x', 1.0, 3.0)}
UV0, VA0, X0c = J.UV.copy(), C.VA.copy(), None
def solve(p):
    J.TC0 = p['tc0']; J.UV = UV0 + np.array([0, p['track_bias_v']]); C.VA = VA0 + p['line_off']
    ph = np.radians(9.); wind = p['w_along']*np.array([np.cos(ph), np.sin(ph), 0])
    kw = dict(cd=p['cd'], rpm=p['rpm'], rho=p['rho'], wind=wind)
    def res(x):
        r = np.r_[C.res2(x, w_pitch_head=p['w_head'], sig_line=p['sig_line'], **kw), C.pole_res(x, sig=p['sig_pole'])]
        return np.r_[r, (x[10] - p['contact_x'])/0.3]
    s = least_squares(res, x3, bounds=(J.LB+[400], J.UB+[1600]), x_scale='jac')
    x = s.x; cam, ev, la, phi, tc, p0, _, _ = J.unpack(x[:-1], x[-1])
    o = fly(ev, la, phi, *p0, p['rho'], p['cd'], p['rpm'], *wind, 0.002, 9., True)
    z = o[:, 3]; i = int(np.argmax(z < 0)); a = z[i-1]/(z[i-1]-z[i]); pe = o[i-1] + a*(o[i]-o[i-1])
    return dict(carry=float(np.hypot(pe[1], pe[2])/FT), ev=float(ev), la=float(la), hang=float(pe[0]), f=float(x[-1]))
base = solve(NOM); print('nominal', base)
out = dict(nominal=base, swings={})
for name, (key, lo, hi) in SW.items():
    a = solve({**NOM, key: lo}); b = solve({**NOM, key: hi}); out['swings'][name] = dict(lo=a, hi=b)
    print(f'{name:40s} carry {a["carry"]:6.1f} / {b["carry"]:6.1f}   EV {a["ev"]:5.1f} / {b["ev"]:5.1f}   LA {a["la"]:5.1f} / {b["la"]:5.1f}   hang {a["hang"]:.2f}/{b["hang"]:.2f}  f {a["f"]:.0f}/{b["f"]:.0f}')
json.dump(out, open('../tornado.json', 'w'), indent=1)
