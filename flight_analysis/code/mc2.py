"""Step 8 Monte Carlo on the aerial-based calibration (calib_aerial). Fixed seed."""
import numpy as np, json, sys, time
from multiprocessing import Pool
from scipy.optimize import least_squares
import calib_aerial as CA, field as FD
from physics import FT, MPH
from fastfly import fly
X0 = np.array(json.load(open('/tmp/claude-0/ca_baseline_0.json')))
SEED, N = 20261003, int(sys.argv[1]) if len(sys.argv) > 1 else 5000
UV0, FO0, POLES0 = CA.UV.copy(), CA.FENCE_OBS.copy(), dict(FD.POLES_PX)
RCB0, RCT0, LCT0, LCS0, PF0, BF0 = CA.RC_BASE_PX, CA.RC_TOP_PX, CA.LC_TOP_PX, CA.LC_SHAFT, CA.PITCH_FEET, CA.BATTER_FOOT
S_INF, S_USER = FD.scale_infield()[0], np.linalg.norm(FD.YELLOW_END - FD.PLATE)/250.0
CF_BEARING = 133.2                                   # deg, plate->2B in north-up aerial (MEASURED)
REFD = (150, 175, 200, 210, 220, 225, 250)
def wind_vec(r):
    spd = max(0.0, r.normal(2.0, 1.0)); frm = r.normal(52.0, 25.0); to = np.radians(frm + 180 - CF_BEARING)
    return np.array([spd*np.cos(to), spd*np.sin(to), 0.0]), spd, frm
def run(k):
    r = np.random.default_rng([SEED, k])
    s = r.uniform(min(S_INF, S_USER), max(S_INF, S_USER))
    CA.S_INF = s
    FD.POLES_PX = {kk: tuple(np.array(v) + r.normal(0, 4.0, 2)) for kk, v in POLES0.items()}
    CA.POLE = {kk: FD.to_field(v, s) for kk, v in FD.POLES_PX.items()}
    CA.NET = [FD.to_field(p, s) for p in FD.BACKSTOP]
    CA.UV = UV0 + r.normal(0, 0.7, UV0.shape)
    CA.FENCE_OBS = FO0 + np.c_[np.zeros(len(FO0)), r.normal(0, 3.0, len(FO0))]
    CA.RC_BASE_PX = tuple(np.array(RCB0) + r.normal(0, [2, 4])); CA.RC_TOP_PX = tuple(np.array(RCT0) + r.normal(0, 2, 2))
    CA.LC_TOP_PX = tuple(np.array(LCT0) + r.normal(0, 2, 2)); CA.LC_SHAFT = (LCS0[0] + r.normal(0, 2), LCS0[1])
    CA.PITCH_FEET = (PF0[0], tuple(np.array(PF0[1]) + r.normal(0, 5, 2)), PF0[2])
    CA.BATTER_FOOT = (BF0[0], tuple(np.array(BF0[1]) + r.normal(0, 5, 2)), BF0[2])
    CA.TC0 = r.normal(5.000, 0.033)
    cd, rpm, rho = r.uniform(0.28, 0.40), r.uniform(500, 2500), r.normal(1.221, 0.012)
    wind, wspd, wfrom = wind_vec(r); H = r.uniform(4.0, 8.0)
    kw = dict(cd=cd, rpm=rpm, rho=rho, wind=wind)
    try:
        sol = least_squares(CA.residuals, X0, bounds=(CA.LB, CA.UB), kwargs=kw, x_scale='jac', max_nfev=600)
    except Exception as e:
        return dict(k=k, ok=False, why=str(e))
    x = sol.x; ev, la, phi, tc = x[10:14]; p0 = np.array(x[14:17])*FT
    parts = CA.residuals(x, parts=True, **kw)
    o = fly(ev, la, phi, *p0, rho, cd, rpm, *wind, 0.002, 9., True)
    z = o[:, 3]; i = int(np.argmax(z < 0)); a = z[i-1]/(z[i-1]-z[i]); pe = o[i-1] + a*(o[i]-o[i-1])
    R = np.hypot(o[:, 1], o[:, 2])/FT; Z = z/FT; carry = float(np.hypot(pe[1], pe[2])/FT); ja = int(np.argmax(Z))
    zat = {str(D): (float(np.interp(D, R[:i], Z[:i])) if carry > D else None) for D in REFD}
    land_phi = float(np.degrees(np.arctan2(pe[2], pe[1]))); Dl = float(FD.fence_D(land_phi, s))
    zf = float(np.interp(Dl, R[:i], Z[:i])) if carry > Dl else None
    return dict(k=k, ok=bool(sol.status > 0), cost=float(sol.cost), chi2_track=float(np.sum(parts['track']**2)),
                **{n: float(v) for n, v in zip(CA.NAMES, x)}, carry=carry, hang=float(pe[0]), t_land=float(tc + pe[0]),
                land_x=float(pe[1]/FT), land_y=float(pe[2]/FT), land_phi=land_phi, D_fence=Dl, roll_ft=Dl - carry,
                apex_z=float(Z[ja]), apex_r=float(R[ja]), apex_t=float(o[ja, 0]), v_land_mph=float(np.linalg.norm(pe[4:7])/MPH),
                vx_land_fps=float(np.hypot(pe[4], pe[5])/FT), descent_deg=float(np.degrees(np.arctan2(-pe[6], np.hypot(pe[4], pe[5])))),
                z_at=zat, z_fence=zf, fly_to_fence=bool(zf is not None and zf > 0), H_fence=H,
                cleared={str(D): bool(zat[str(D)] is not None and zat[str(D)] > H) for D in (200, 210, 220, 225)},
                in_cd=cd, in_rpm=rpm, in_rho=rho, in_wind_spd=wspd, in_wind_from=wfrom, in_tc0=CA.TC0, in_scale=s,
                in_wind_along=float(wind @ np.array([np.cos(np.radians(phi)), np.sin(np.radians(phi)), 0])))
if __name__ == '__main__':
    t = time.time()
    with Pool(4) as p: out = p.map(run, range(N), chunksize=20)
    json.dump(out, open('../mc2_samples.json', 'w'))
    print('N', N, 'sec', round(time.time()-t, 1), 'ok', sum(o.get('ok', False) for o in out))
