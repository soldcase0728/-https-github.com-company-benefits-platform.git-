import numpy as np, json
from physics import FT; from fastfly import fly
EV = [60, 65, 70, 75, 80, 85, 90]; LA = [10, 15, 20, 25, 30, 35, 40, 45]
grid = {}
print('Reference grid (rho 1.18, Cd 0.33, 1500 rpm backspin, no wind, contact 2 ft fwd/2.5 ft high): carry ft / hang s')
print('EV\\LA ' + ''.join(f'{l:>12d}' for l in LA))
for ev in EV:
    row = []
    for la in LA:
        o = fly(float(ev), float(la), 0., 2*FT, 0., 2.5*FT, 1.18, 0.33, 1500., 0., 0., 0., 0.002, 9., True)
        z = o[:, 3]; i = int(np.argmax(z < 0)); a = z[i-1]/(z[i-1]-z[i]); pe = o[i-1] + a*(o[i]-o[i-1])
        c = float(np.hypot(pe[1], pe[2])/FT); row.append(f'{c:6.0f}/{pe[0]:4.2f}'); grid[f'{ev},{la}'] = dict(carry_ft=c, hang_s=float(pe[0]), apex_ft=float(z.max()/FT))
    print(f'{ev:5d} ' + ''.join(f'{r:>12s}' for r in row))
json.dump(grid, open('../reference_grid.json', 'w'), indent=1)
