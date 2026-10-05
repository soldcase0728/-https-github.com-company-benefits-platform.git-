import numpy as np, json
from scipy.optimize import least_squares
import calib_aerial as CA, field as FD
from physics import FT; from fastfly import fly
X0 = np.array(json.load(open('/tmp/claude-0/ca_baseline_0.json')))
S_INF, S_USER = FD.scale_infield()[0], np.linalg.norm(FD.YELLOW_END - FD.PLATE)/250.0
UV0, P0 = CA.UV.copy(), dict(FD.POLES_PX)
def wind(spd, frm): to = np.radians(frm + 180 - 133.2); return np.array([spd*np.cos(to), spd*np.sin(to), 0])
NOM = dict(tc0=5.0, cd=0.33, rpm=1500., rho=1.221, wspd=2.0, wfrom=52., hc0=5.0, scale=S_INF, rc_shift=0.0, vbias=0.0)
SW = {'t_contact prior (4.958 / 5.042 s)': ('tc0', 4.958, 5.042), 'C_D (0.292 / 0.388)': ('cd', 0.292, 0.388),
      'Backspin (700 / 2300 rpm)': ('rpm', 700., 2300.), 'Air density (1.206 / 1.236)': ('rho', 1.206, 1.236),
      'Wind speed at ball height (0.7 / 3.3 m/s)': ('wspd', 0.72, 3.28), 'Wind direction from (20 / 84 deg)': ('wfrom', 20., 84.),
      'Camera height prior (4.5 / 5.5 ft)': ('hc0', 4.5, 5.5), 'Aerial scale (infield / 250-ft line)': ('scale', S_INF, S_USER),
      'RC pole aerial position (-5 / +5 px along CF)': ('rc_shift', -5., 5.), 'Track vertical bias (-0.9 / +0.9 px)': ('vbias', -0.9, 0.9)}
def solve(p):
    CA.S_INF = p['scale']; c = FD.C_HAT
    FD.POLES_PX = {'LC_pole': P0['LC_pole'], 'RC_pole': tuple(np.array(P0['RC_pole']) + p['rc_shift']*c)}
    CA.POLE = {k: FD.to_field(v, p['scale']) for k, v in FD.POLES_PX.items()}; CA.NET = [FD.to_field(q, p['scale']) for q in FD.BACKSTOP]
    CA.UV = UV0 + np.array([0, p['vbias']]); CA.TC0 = p['tc0']
    kw = dict(cd=p['cd'], rpm=p['rpm'], rho=p['rho'], wind=wind(p['wspd'], p['wfrom']), hc_prior=(p['hc0'], 0.5))
    s = least_squares(CA.residuals, X0, bounds=(CA.LB, CA.UB), kwargs=kw, x_scale='jac'); x = s.x
    o = fly(*x[10:13], *(np.array(x[14:17])*FT), p['rho'], p['cd'], p['rpm'], *kw['wind'], 0.002, 9., True)
    z = o[:, 3]; i = int(np.argmax(z < 0)); a = z[i-1]/(z[i-1]-z[i]); pe = o[i-1] + a*(o[i]-o[i-1])
    return dict(carry=float(np.hypot(pe[1], pe[2])/FT), ev=float(x[10]), la=float(x[11]), hang=float(pe[0]), f=float(x[6]), hc=float(x[2]))
base = solve(NOM); print('nominal', {k: round(v, 2) for k, v in base.items()})
out = dict(nominal=base, swings={})
for name, (key, lo, hi) in SW.items():
    a = solve({**NOM, key: lo}); b = solve({**NOM, key: hi}); out['swings'][name] = dict(lo=a, hi=b)
    print(f'{name:44s} carry {a["carry"]:6.1f}/{b["carry"]:6.1f}  EV {a["ev"]:5.1f}/{b["ev"]:5.1f}  LA {a["la"]:5.1f}/{b["la"]:5.1f}  hang {a["hang"]:.2f}/{b["hang"]:.2f}  f {a["f"]:.0f}/{b["f"]:.0f} hc {a["hc"]:.2f}/{b["hc"]:.2f}')
json.dump(out, open('../tornado.json', 'w'), indent=1)
