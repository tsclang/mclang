// Optics: interference, diffraction, Fabry-Pérot, resolution
// Imports wave_base.mc for Snell/Fresnel functions

import "./wave_base.mc"

// ── Private helpers ────────────────────────────────────────────────────────

// Unnormalised sinc: sinc(x) = sin(x)/x, sinc(0) = 1
_sinc(x) = if (|x| < 1e-10) 1.0 else \frac{\sin{x}}{x}

// Round-trip phase shift: δ = 2π·d·sin(θ)/λ
_phase(d, θ, λ) = \frac{2π * d * \sin{θ}}{λ}

// Fabry-Pérot round-trip phase: Φ = 4π·n·d·cos(θ)/λ
_fp_phase(n, d, θ, λ) = \frac{4π * n * d * \cos{θ}}{λ}

// Airy coefficient: F = 4R/(1−R)²
_airy_F(R) =
    \frac{4.0 * R}{(1.0 - R)^2}
    where
        R > 0.0
        R < 1.0

// ── Young's double-slit interference ──────────────────────────────────────

// Intensity: I(θ) = I₀·cos²(π·d·sin θ/λ)
young_intensity(I0, d, θ, λ) =
    I0 * \cos{\frac{_phase(d, θ, λ)}{2.0}}^2

// Fringe spacing at screen distance L: Δy = λ·L/d
young_fringe_spacing(λ, L, d) =
    \frac{λ * L}{d}

// Order of constructive maximum nearest to θ
young_order(d, θ, λ) =
    \frac{d * \sin{θ}}{λ}

// ── Single-slit diffraction ────────────────────────────────────────────────

// Intensity envelope: I(θ) = I₀·[sin(β)/β]²  where β = π·a·sin θ/λ
_beta(a, θ, λ) = \frac{π * a * \sin{θ}}{λ}

single_slit(I0, a, θ, λ) =
    I0 * _sinc(_beta(a, θ, λ))^2

// ── N-slit diffraction grating ─────────────────────────────────────────────

// Combined envelope × grating factor:
// I(θ) = I₀·sinc²(β)·[sin(N·δ/2)/sin(δ/2)]²
grating_intensity(I0, N, d, a, θ, λ) =
    single_slit(I0, a, θ, λ) *
    (\frac{\sin{N * _phase(d, θ, λ) / 2.0}}{\sin{_phase(d, θ, λ) / 2.0}})^2
    where
        \sin{_phase(d, θ, λ) / 2.0} != 0.0

// Grating resolving power: R = m·N
grating_resolving_power(m, N) = m * N

// Angular dispersion: dθ/dλ = m/(d·cos θ)
grating_dispersion(m, d, θ) =
    \frac{m}{d * \cos{θ}}

// ── Fabry-Pérot etalon ────────────────────────────────────────────────────

// Airy transmission: T(λ) = 1 / (1 + F·sin²(Φ/2))
fabry_perot_T(R, n, d, θ, λ) =
    \frac{1.0}{1.0 + _airy_F(R) * \sin{\frac{_fp_phase(n, d, θ, λ)}{2.0}}^2}

// Finesse: ℱ = π·√R/(1−R)
finesse(R) =
    \frac{π * \sqrt{R}}{1.0 - R}
    where
        R > 0.0
        R < 1.0

// Free spectral range: Δλ = λ²/(2·n·d)
fsr(λ, n, d) =
    \frac{λ^2}{2.0 * n * d}

// Spectral resolution: δλ = Δλ/ℱ
fp_resolution(λ, n, d, R) =
    \frac{fsr(λ, n, d)}{finesse(R)}

// ── Resolution criteria ────────────────────────────────────────────────────

// Rayleigh criterion: θ_min = 1.22·λ/D
rayleigh_angle(λ, D) =
    1.22 * \frac{λ}{D}

// Abbe diffraction limit: d_min = λ/(2·NA)
abbe_limit(λ, NA) =
    \frac{λ}{2.0 * NA}
    where
        NA > 0
