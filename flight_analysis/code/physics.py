"""Batted-softball flight model (SI units). Origin at plate apex; X toward CF line,
Y toward 1B side (+ = right field), Z up. Spray angle phi: 0 = straightaway CF, + toward RF."""
import numpy as np
FT = 0.3048; MPH = 0.44704; G = 9.80665
M_BALL = 0.184; R_BALL = 0.0485; A_BALL = np.pi * R_BALL**2

def cl_of_s(S):
    S = np.asarray(S, float)
    return np.where(S <= 0.1, 1.5 * S, 0.09 + 0.6 * S)

def accel(v, rho, cd, omega, wind, phi):
    """v: (...,3). omega: rad/s backspin magnitude; spin axis horizontal, perpendicular to the
    flight plane (azimuth phi), oriented so backspin gives upward lift."""
    vr = v - wind
    sp = np.linalg.norm(vr, axis=-1, keepdims=True)
    k = 0.5 * rho * A_BALL / M_BALL
    # unit spin axis for backspin when flying along +x' (x' = spray direction): axis = -y'
    ax = np.stack([np.sin(phi), -np.cos(phi), np.zeros_like(phi)], -1) * np.ones_like(v)
    S = R_BALL * np.asarray(omega)[..., None] / np.maximum(sp, 1e-6)
    cl = cl_of_s(S)
    lift_dir = np.cross(ax, vr / np.maximum(sp, 1e-9))
    a = -k * cd[..., None] * sp * vr + k * cl * sp**2 * lift_dir
    a[..., 2] -= G
    return a

def rk4(p0, v0, rho, cd, omega, wind, phi, dt=0.002, tmax=6.0, stop_ground=True):
    """Vectorised fixed-step RK4. p0,v0: (N,3). Returns times (K,), P (K,N,3), V (K,N,3)."""
    p, v = p0.copy(), v0.copy(); n = int(tmax / dt) + 1
    P = np.empty((n,) + p.shape); V = np.empty_like(P); P[0], V[0] = p, v
    for i in range(1, n):
        a1 = accel(v, rho, cd, omega, wind, phi); k1p, k1v = v, a1
        a2 = accel(v + 0.5*dt*k1v, rho, cd, omega, wind, phi); k2p, k2v = v + 0.5*dt*k1v, a2
        a3 = accel(v + 0.5*dt*k2v, rho, cd, omega, wind, phi); k3p, k3v = v + 0.5*dt*k2v, a3
        a4 = accel(v + dt*k3v, rho, cd, omega, wind, phi); k4p, k4v = v + dt*k3v, a4
        p = p + dt/6*(k1p + 2*k2p + 2*k3p + k4p); v = v + dt/6*(k1v + 2*k2v + 2*k3v + k4v)
        P[i], V[i] = p, v
        if stop_ground and np.all(p[:, 2] < -0.5):
            return np.arange(i+1)*dt, P[:i+1], V[:i+1]
    return np.arange(n)*dt, P, V

def launch(ev_mph, la_deg, phi_deg):
    ev = np.asarray(ev_mph, float) * MPH; th = np.radians(la_deg); ph = np.radians(phi_deg)
    return np.stack([ev*np.cos(th)*np.cos(ph), ev*np.cos(th)*np.sin(ph), ev*np.sin(th)], -1)

def ivp_single(p0, v0, rho, cd, omega, wind, phi, tmax=6.0):
    from scipy.integrate import solve_ivp
    def f(t, y):
        a = accel(y[None, 3:], rho, np.array([cd]), np.array([omega]), wind[None], np.array([phi]))[0]
        return np.r_[y[3:], a]
    ev = lambda t, y: y[2] + 0.0; ev.terminal = True; ev.direction = -1
    return solve_ivp(f, (0, tmax), np.r_[p0, v0], rtol=1e-8, atol=1e-9, events=ev, dense_output=True)

def camera_basis(yaw, pitch, roll):
    F = np.array([np.cos(pitch)*np.cos(yaw), np.cos(pitch)*np.sin(yaw), np.sin(pitch)])
    R0 = np.array([-np.sin(yaw), np.cos(yaw), 0.0]); U0 = np.cross(F, R0)
    R = R0*np.cos(roll) + U0*np.sin(roll); U = U0*np.cos(roll) - R0*np.sin(roll)
    return F, R, U

def project(P, cam):
    """P (...,3) metres -> pixel (u,v). cam dict: f, u0, v0, C(3,), yaw, pitch, roll."""
    F, R, U = camera_basis(cam['yaw'], cam['pitch'], cam['roll'])
    d = P - cam['C']; z = d @ F
    return np.stack([cam['u0'] + cam['f']*(d @ R)/z, cam['v0'] - cam['f']*(d @ U)/z], -1)

def ray(uv, cam):
    F, R, U = camera_basis(cam['yaw'], cam['pitch'], cam['roll'])
    x = (uv[..., 0] - cam['u0'])/cam['f']; y = -(uv[..., 1] - cam['v0'])/cam['f']
    d = F + x[..., None]*R + y[..., None]*U
    return d/np.linalg.norm(d, axis=-1, keepdims=True)
