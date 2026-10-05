"""Step 8 Monte Carlo: parametric bootstrap of all measurements + sampling of assumed inputs,
full camera+trajectory refit per draw, then forward integration to the ground."""
import numpy as np, json, sys, time
from multiprocessing import Pool
from scipy.optimize import least_squares
import jointfit as J, calib2 as C
from physics import FT, MPH, project
from fastfly import fly
X3 = np.array(json.load(open('/tmp/claude-0/calib3.json'))['x'])
UV0, LM0, VA0, POLES0 = J.UV.copy(), dict(J.LM), C.VA.copy(), C.POLES
SEED, N = 20261005, int(sys.argv[1]) if len(sys.argv) > 1 else 5000
REFD = (150, 175, 200, 210, 220, 225, 250)

def draw(k):
    r = np.random.default_rng([SEED, k])
    phi_w = np.radians(9.0)
    w_along, w_lat = r.normal(0, 2.0), r.normal(0, 2.0)          # ASSUMED (no date/location -> no weather record)
    return dict(
        track_noise=r.normal(0, 0.7, UV0.shape),                # MEASURED centroid noise (blur/compression)
        lm_noise={k2: r.normal(0, v[2]*0.6, 2) for k2, v in LM0.items()},
        line_off=r.normal(0, 1.5), line_slope=r.normal(0, 0.004),
        pole_noise=r.normal(0, 0.006, 2), fence_v=r.normal(0, 2.0),
        tc0=r.normal(5.000, 0.033),                              # MEASURED bracket i140-i142
        cd=r.uniform(0.28, 0.40), rpm=r.uniform(500, 2500), rho=r.normal(1.18, 0.03),
        wind=np.array([w_along*np.cos(phi_w) - w_lat*np.sin(phi_w), w_along*np.sin(phi_w) + w_lat*np.cos(phi_w), 0.0]),
        w_along=w_along, w_head=r.uniform(0.0, 0.5), sig_line=r.uniform(2.0, 5.0), sig_pole=r.uniform(0.0105, 0.03),
        D_fence=r.uniform(250, 256) + r.normal(0, 4.0),          # USER-SUPPLIED 250 (yellow line) vs 256 (infield scale)
        H_fence=r.uniform(4.0, 8.0))                             # ASSUMED prior

def run(k):
    d = draw(k)
    J.UV = UV0 + d['track_noise']; J.TC0 = d['tc0']; J.FENCE_V = 458.0 + d['fence_v']
    J.LM = {k2: (g, tuple(np.array(px) + d['lm_noise'][k2]), s) for k2, (g, px, s) in LM0.items()}
    C.VA = VA0 + d['line_off'] + d['line_slope']*(C.UA - 1050)
    C.POLES = tuple((u, m + e) for (u, m), e in zip(POLES0, d['pole_noise']))
    kw = dict(cd=d['cd'], rpm=d['rpm'], rho=d['rho'], wind=d['wind'])
    def res(x):
        r = C.res2(x, w_pitch_head=d['w_head'], sig_line=d['sig_line'], **kw)
        return np.r_[r, C.pole_res(x, sig=d['sig_pole'])]
    try:
        s = least_squares(res, X3, bounds=(J.LB + [400], J.UB + [1600]), x_scale='jac', max_nfev=400)
    except Exception as e:
        return dict(k=k, ok=False, why=str(e))
    x = s.x; f = x[-1]; cam, ev, la, phi, tc, p0, dfen, yfen = J.unpack(x[:-1], f)
    rt = J.residuals(x[:-1], f, track_only=True, **kw)
    o = fly(ev, la, phi, *p0, d['rho'], d['cd'], d['rpm'], *d['wind'], 0.002, 9., True)
    z = o[:, 3]; i = int(np.argmax(z < 0)) if (z < 0).any() else len(z) - 1
    a = z[i-1]/(z[i-1] - z[i]); pe = o[i-1] + a*(o[i] - o[i-1])
    R = np.hypot(o[:, 1], o[:, 2])/FT; Z = z/FT
    carry = float(np.hypot(pe[1], pe[2])/FT); ja = int(np.argmax(Z))
    zat = {str(D): (float(np.interp(D, R[:i], Z[:i])) if carry > D else None) for D in REFD}
    sp = np.linalg.norm(pe[4:7]); desc = float(np.degrees(np.arctan2(-pe[6], np.hypot(pe[4], pe[5]))))
    Dd = d['D_fence']; z_fence = float(np.interp(Dd, R[:i], Z[:i])) if carry > Dd else None
    fly_to_fence = z_fence is not None and z_fence > 0
    return dict(k=k, ok=bool(s.success or s.status > 0), cost=float(s.cost), nfev=int(s.nfev),
                track_rms=float(np.sqrt(np.mean(rt**2))), f=float(f), b=float(x[0]), yc=float(x[1]), hc=float(x[2]),
                yaw=float(x[3]), pitch=float(x[4]), roll=float(x[5]), ev=float(ev), la=float(la), phi=float(phi), tc=float(tc),
                cx=float(x[10]), cy=float(x[11]), cz=float(x[12]),
                carry=carry, hang=float(pe[0]), t_land=float(tc + pe[0]), land_x=float(pe[1]/FT), land_y=float(pe[2]/FT),
                apex_z=float(Z[ja]), apex_r=float(R[ja]), apex_t=float(o[ja, 0]), v_land_mph=float(sp/MPH), descent_deg=desc,
                z_at=zat, D_fence=Dd, H_fence=d['H_fence'], z_fence=z_fence, fly_to_fence=fly_to_fence,
                cleared={str(D): (zat[str(D)] is not None and zat[str(D)] > d['H_fence']) for D in (200, 210, 220, 225)},
                cd=d['cd'], rpm=d['rpm'], rho=d['rho'], w_along=d['w_along'], tc0=d['tc0'],
                w_head=d['w_head'], sig_line=d['sig_line'], sig_pole=d['sig_pole'])
if __name__ == '__main__':
    t = time.time()
    with Pool(4) as p: out = p.map(run, range(N), chunksize=25)
    json.dump(out, open('../mc_samples.json', 'w'))
    print('N', N, 'seconds', round(time.time() - t, 1), 'ok', sum(o['ok'] for o in out))
