"""Numba scalar RK4 for one trajectory (same model as physics.accel)."""
import numpy as np, numba as nb
from physics import FT, MPH, G, M_BALL, R_BALL, A_BALL

@nb.njit(cache=True)
def _acc(vx, vy, vz, rho, cd, om, wx, wy, wz, sphi, cphi):
    rx, ry, rz = vx - wx, vy - wy, vz - wz
    sp = np.sqrt(rx*rx + ry*ry + rz*rz) + 1e-12
    k = 0.5*rho*A_BALL/M_BALL
    S = R_BALL*om/sp
    cl = 1.5*S if S <= 0.1 else 0.09 + 0.6*S
    # axis = (sin phi, -cos phi, 0); lift dir = axis x unit(vr)
    ax, ay = sphi, -cphi
    ux, uy, uz = rx/sp, ry/sp, rz/sp
    lx = ay*uz; ly = -ax*uz; lz = ax*uy - ay*ux
    a_x = -k*cd*sp*rx + k*cl*sp*sp*lx
    a_y = -k*cd*sp*ry + k*cl*sp*sp*ly
    a_z = -k*cd*sp*rz + k*cl*sp*sp*lz - G
    return a_x, a_y, a_z

@nb.njit(cache=True)
def fly(ev_mph, la_deg, phi_deg, px, py, pz, rho, cd, rpm, wx, wy, wz, dt, tmax, stop_ground):
    n = int(tmax/dt) + 1
    out = np.empty((n, 7))
    ev = ev_mph*MPH; th = la_deg*np.pi/180; ph = phi_deg*np.pi/180
    sphi, cphi = np.sin(ph), np.cos(ph); om = rpm*np.pi/30
    x, y, z = px*1.0, py*1.0, pz*1.0
    vx, vy, vz = ev*np.cos(th)*cphi, ev*np.cos(th)*sphi, ev*np.sin(th)
    out[0, 0] = 0.0; out[0, 1] = x; out[0, 2] = y; out[0, 3] = z; out[0, 4] = vx; out[0, 5] = vy; out[0, 6] = vz
    for i in range(1, n):
        a1 = _acc(vx, vy, vz, rho, cd, om, wx*1.0, wy*1.0, wz*1.0, sphi, cphi)
        b = (vx + .5*dt*a1[0], vy + .5*dt*a1[1], vz + .5*dt*a1[2])
        a2 = _acc(b[0], b[1], b[2], rho, cd, om, wx*1.0, wy*1.0, wz*1.0, sphi, cphi)
        c = (vx + .5*dt*a2[0], vy + .5*dt*a2[1], vz + .5*dt*a2[2])
        a3 = _acc(c[0], c[1], c[2], rho, cd, om, wx*1.0, wy*1.0, wz*1.0, sphi, cphi)
        d = (vx + dt*a3[0], vy + dt*a3[1], vz + dt*a3[2])
        a4 = _acc(d[0], d[1], d[2], rho, cd, om, wx*1.0, wy*1.0, wz*1.0, sphi, cphi)
        x += dt/6*(vx + 2*b[0] + 2*c[0] + d[0]); y += dt/6*(vy + 2*b[1] + 2*c[1] + d[1]); z += dt/6*(vz + 2*b[2] + 2*c[2] + d[2])
        vx += dt/6*(a1[0] + 2*a2[0] + 2*a3[0] + a4[0]); vy += dt/6*(a1[1] + 2*a2[1] + 2*a3[1] + a4[1]); vz += dt/6*(a1[2] + 2*a2[2] + 2*a3[2] + a4[2])
        out[i, 0] = i*dt; out[i, 1] = x; out[i, 2] = y; out[i, 3] = z; out[i, 4] = vx; out[i, 5] = vy; out[i, 6] = vz
        if stop_ground and z < -0.3:
            return out[:i+1]
    return out
