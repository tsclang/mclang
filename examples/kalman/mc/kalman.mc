// Kalman filter — 1D scalar state estimation

kf_predict_x(x, a, u, b) = a * x + b * u
kf_predict_p(p, a, q) = a^2 * p + q

kf_gain(p, h, r) =
    p * h / (h^2 * p + r)
    where
        h^2 * p + r > 0

kf_update_x(x, k, z, h) = x + k * (z - h * x)
kf_update_p(p, k, h) = (1.0 - k * h) * p

kf_innov(z, x, h) = z - h * x
kf_innov_cov(p, h, r) = h^2 * p + r

kf_nis(z, x, h, p, r) =
    kf_innov(z, x, h)^2 / kf_innov_cov(p, h, r)
    where
        kf_innov_cov(p, h, r) > 0

snr_db(signal, noise) =
    20.0 * ln(abs(signal) / abs(noise)) / ln(10.0)
    where
        abs(noise) > 0
        abs(signal) > 0

comp_tau(dt, T_cross) =
    T_cross / (T_cross + dt)
    where
        T_cross > 0
        dt > 0

comp_filter(prev, gyro_rate, accel_angle, alpha, dt) =
    alpha * (prev + gyro_rate * dt) + (1.0 - alpha) * accel_angle
    where
        alpha ≥ 0
        alpha ≤ 1.0
