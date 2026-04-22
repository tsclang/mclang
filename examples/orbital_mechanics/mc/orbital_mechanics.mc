// Orbital mechanics — Kepler's laws and orbit calculations

μ = 3.986004418e14

vis_viva(r, a) =
    sqrt(μ * (2.0 / r - 1.0 / a))
    where
        r > 0
        a > 0

period(a) =
    2.0 * π * sqrt(a^3 / μ)
    where
        a > 0

_kepler_step(E, M, e) = E - (E - e * sin(E) - M) / (1.0 - e * cos(E))

ecc_anomaly(M, e) =
    e5
    where
        e0 = M + e * sin(M)
        e1 = _kepler_step(e0, M, e)
        e2 = _kepler_step(e1, M, e)
        e3 = _kepler_step(e2, M, e)
        e4 = _kepler_step(e3, M, e)
        e5 = _kepler_step(e4, M, e)
        abs(e) < 1.0

true_anomaly(E, e) =
    2.0 * arctan(sqrt((1.0 + e) / (1.0 - e)) * tan(E / 2.0))
    where
        abs(e) < 1.0

orbit_radius(a, e, ν) =
    a * (1.0 - e^2) / (1.0 + e * cos(ν))
    where
        a > 0
        abs(e) < 1.0

orbit_x(a, e, ν) = orbit_radius(a, e, ν) * cos(ν)
orbit_y(a, e, ν) = orbit_radius(a, e, ν) * sin(ν)

v_escape(r) =
    sqrt(2.0 * μ / r)
    where
        r > 0

v_circular(r) =
    sqrt(μ / r)
    where
        r > 0

dv1_hohmann(r1, r2) =
    sqrt(μ / r1) * (sqrt(2.0 * r2 / (r1 + r2)) - 1.0)
    where
        r1 > 0
        r2 > 0

dv2_hohmann(r1, r2) =
    sqrt(μ / r2) * (1.0 - sqrt(2.0 * r1 / (r1 + r2)))
    where
        r1 > 0
        r2 > 0

dv_total_hohmann(r1, r2) =
    abs(dv1_hohmann(r1, r2)) + abs(dv2_hohmann(r1, r2))
