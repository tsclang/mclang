// Wave Base: physical constants and fundamental wave optics
// Imported by optics.mc

c_light  = 2.99792458e8     // speed of light, m/s
h_planck = 6.62607015e-34   // Planck constant, J·s
k_B      = 1.380649e-23     // Boltzmann constant, J/K

// ── Fundamental wave quantities ────────────────────────────────────────────

// Angular wavenumber: k = 2π/λ
wavenumber(λ) = \frac{2π}{λ}

// Angular frequency: ω = 2πf
angular_freq(f) = 2π * f

// Photon energy: E = hf
photon_energy(f) = h_planck * f

// de Broglie wavelength: λ = h/(m·v)
de_broglie(m, v) =
    \frac{h_planck}{m * v}
    where
        m > 0
        v > 0

// ── Snell's law ────────────────────────────────────────────────────────────

// Refracted angle: θ₂ = arcsin(n₁·sin θ₁ / n₂)
snell_angle(n1, θ1, n2) =
    \arcsin{\frac{n1 * \sin{θ1}}{n2}}
    where
        |n1 * \sin{θ1}| <= n2   // total internal reflection guard

// Brewster angle: θ_B = arctan(n₂/n₁)
brewster_angle(n1, n2) =
    \arctan{\frac{n2}{n1}}

// Critical angle for TIR: θ_c = arcsin(n₂/n₁)
critical_angle(n1, n2) =
    \arcsin{\frac{n2}{n1}}
    where
        n1 > n2

// ── Fresnel equations ──────────────────────────────────────────────────────

// Cosine of transmitted angle (private): cos θ_t = √(1 − (n₁/n₂)²·sin²θ_i)
_cos_t(n1, θ1, n2) =
    \sqrt{1.0 - \frac{n1^2 * \sin{θ1}^2}{n2^2}}

// s-polarisation reflectance: Rs = ((n₁cosθᵢ − n₂cosθₜ)/(n₁cosθᵢ + n₂cosθₜ))²
R_s(n1, θ1, n2) =
    (\frac{n1*\cos{θ1} - n2*_cos_t(n1, θ1, n2)}{n1*\cos{θ1} + n2*_cos_t(n1, θ1, n2)})^2

// p-polarisation reflectance: Rp = ((n₂cosθᵢ − n₁cosθₜ)/(n₂cosθᵢ + n₁cosθₜ))²
R_p(n1, θ1, n2) =
    (\frac{n2*\cos{θ1} - n1*_cos_t(n1, θ1, n2)}{n2*\cos{θ1} + n1*_cos_t(n1, θ1, n2)})^2

// Unpolarised reflectance: R = (Rs + Rp)/2
R_unpol(n1, θ1, n2) =
    \frac{R_s(n1, θ1, n2) + R_p(n1, θ1, n2)}{2.0}

// Transmittance (energy conservation): T = 1 − R
T_s(n1, θ1, n2) = 1.0 - R_s(n1, θ1, n2)
T_p(n1, θ1, n2) = 1.0 - R_p(n1, θ1, n2)
