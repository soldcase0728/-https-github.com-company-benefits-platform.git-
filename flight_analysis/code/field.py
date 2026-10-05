"""Aerial-image field geometry (Step 2). Pixel coords in aerial.png (892x822)."""
import numpy as np
PLATE = np.array([181.0, 151.0])
BASES = {'1B': (184.0, 307.5), '2B': (342.5, 306.0), '3B': (337.5, 148.0), 'rubber': (262.5, 228.0)}
NOMINAL_FT = {'1B': 60.0, '2B': 84.853, '3B': 60.0, 'rubber': 43.0}
FENCE_PX = np.array([(740, 112), (802, 300), (753, 497), (550, 711), (366, 766), (169, 722), (116, 406)], float)
YELLOW_END = np.array([550.0, 712.0])
POLES_PX = {'LC_pole': (755.0, 340.0), 'RC_pole': (360.0, 735.0)}   # shaft-shadow convergence points
BACKSTOP = (np.array([112.0, 122.0]), np.array([148.0, 80.0]))
def scale_infield():
    s = [np.linalg.norm(np.array(BASES[k]) - PLATE)/NOMINAL_FT[k] for k in BASES]
    return float(np.mean(s)), float(np.std(s)), s
C_HAT = (np.array(BASES['2B']) - PLATE)/np.linalg.norm(np.array(BASES['2B']) - PLATE)
Y_HAT = np.array([-C_HAT[1], C_HAT[0]])
if np.dot(np.array(BASES['1B']) - PLATE, Y_HAT) < 0: Y_HAT = -Y_HAT   # +Y toward 1B / right field
def to_field(px, s):
    d = np.asarray(px, float) - PLATE
    return np.stack([d @ C_HAT, d @ Y_HAT], -1)/s
def fence_D(phi_deg, s):
    """Distance (ft) from plate apex to the fence polyline along spray angle phi (+ = RF)."""
    P = to_field(FENCE_PX, s); ph = np.radians(phi_deg); u = np.array([np.cos(ph), np.sin(ph)])
    best = np.inf
    for a, b in zip(P[:-1], P[1:]):
        M = np.array([u, a - b]).T
        try: t, w = np.linalg.solve(M, a)
        except np.linalg.LinAlgError: continue
        if t > 0 and -1e-9 <= w <= 1 + 1e-9: best = min(best, t)
    return best
def camera_back(s):
    a, b = BACKSTOP; d = -C_HAT
    t, w = np.linalg.solve(np.array([d, a - b]).T, a - PLATE)
    return t/s
if __name__ == '__main__':
    s, ss, all_s = scale_infield()
    yl = np.linalg.norm(YELLOW_END - PLATE)
    print('infield scale px/ft', round(s, 4), '+/-', round(ss, 4), [round(x, 3) for x in all_s])
    print('yellow line: %.1f px = %.1f ft at infield scale; user 250 ft -> %.4f px/ft (diff %.1f%%)' % (yl, yl/s, yl/250, 100*(yl/s/250 - 1)))
    ye = to_field(YELLOW_END, s); print('yellow line spray angle %.1f deg' % np.degrees(np.arctan2(ye[1], ye[0])))
    for k, v in POLES_PX.items():
        p = to_field(v, s); print(k, 'field ft', p.round(1), 'phi %.1f' % np.degrees(np.arctan2(p[1], p[0])), 'dist %.0f' % np.hypot(*p))
    print('camera behind apex (ft): %.1f' % camera_back(s))
    for ph in range(-45, 46, 5): print(f'phi {ph:+3d}  D = {fence_D(ph, s):6.1f} ft (infield scale)  {fence_D(ph, np.linalg.norm(YELLOW_END-PLATE)/250):6.1f} ft (250-ft scale)')
    print('fence vertices (field ft):'); [print('  ', np.round(p, 1), 'phi %.1f' % np.degrees(np.arctan2(p[1], p[0]))) for p in to_field(FENCE_PX, s)]
