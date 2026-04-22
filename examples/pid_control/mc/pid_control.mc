// PID controller: discrete and continuous formulations

// Proportional term
pid_p(Kp, e) = Kp * e

// Integral increment (trapezoidal rule)
pid_i_step(Ki, e_prev, e_curr, dt) = Ki * (e_prev + e_curr) * 0.5 * dt

// Derivative term (backward difference)
pid_d(Kd, e_curr, e_prev, dt) =
    Kd * (e_curr - e_prev) / dt
    where
        dt > 0

// Full PID output (one step, accumulated integral passed in)
pid_out(Kp, Ki, Kd, e, e_prev, integral, dt) =
    pid_p(Kp, e) + integral + pid_d(Kd, e, e_prev, dt)

// Anti-windup: clamp updated integral to [i_min, i_max]
pid_integral_clamped(Ki, e_prev, e_curr, integral, dt, i_min, i_max) =
    min(max(integral + pid_i_step(Ki, e_prev, e_curr, dt), i_min), i_max)

// Setpoint weighting — modified error for proportional (avoids derivative kick on setpoint change)
sp_error(b, r, y) = b * r - y

// Velocity (incremental) form: Δu given three consecutive errors and dt
pid_delta(Kp, Ki, Kd, e0, e1, e2, dt) =
    Kp * (e0 - e1) + Ki * e0 * dt + Kd * (e0 - 2.0 * e1 + e2) / dt
    where
        dt > 0

// Approximate closed-loop bandwidth for first-order plant K/(τs+1) with proportional gain Kc
crossover_freq(Kp, Kc, tau) = Kp * Kc / tau

// Ziegler-Nichols tuning from ultimate gain Ku and ultimate period Pu
zn_kp(Ku) = 0.6 * Ku
zn_ki(Ku, Pu) = 1.2 * Ku / Pu
zn_kd(Ku, Pu) = 3.0 * Ku * Pu / 40.0

// ITAE optimum gains (first-order + dead time, θ/τ ≈ 0.1)
itae_kp(Kc, theta, tau) = 0.586 * (theta / tau)^(-0.916) / Kc
itae_ki(Kc, theta, tau) = (theta / tau)^(0.738) / (0.974 * tau * Kc)
itae_kd(Kc, theta, tau) = 0.348 * (theta / tau)^(0.929) * tau / Kc
