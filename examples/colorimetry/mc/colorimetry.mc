// Colorimetry: sRGB ↔ linear ↔ CIE XYZ ↔ CIE Lab

// sRGB electro-optical transfer function (IEC 61966-2-1)
srgb_to_linear(c) =
    if (c <= 0.04045) c / 12.92 else ((c + 0.055) / 1.055)^2.4

linear_to_srgb(c) =
    if (c <= 0.0031308) c * 12.92 else 1.055 * c^(1.0 / 2.4) - 0.055

// sRGB → CIE XYZ (D65 illuminant, IEC matrix)
xyz_x(r, g, b) =
    0.4124564 * srgb_to_linear(r) + 0.3575761 * srgb_to_linear(g) + 0.1804375 * srgb_to_linear(b)

xyz_y(r, g, b) =
    0.2126729 * srgb_to_linear(r) + 0.7151522 * srgb_to_linear(g) + 0.0721750 * srgb_to_linear(b)

xyz_z(r, g, b) =
    0.0193339 * srgb_to_linear(r) + 0.1191920 * srgb_to_linear(g) + 0.9503041 * srgb_to_linear(b)

// CIE Lab f() function (cube root with linear segment)
_f_lab(t) = if (t > 0.008856) t^(1.0 / 3.0) else 7.787 * t + 16.0 / 116.0

// CIE XYZ → CIE L*a*b* (D65: Xn=0.95047, Yn=1.0, Zn=1.08883)
lab_L(r, g, b) = 116.0 * _f_lab(xyz_y(r, g, b)) - 16.0
lab_a(r, g, b) = 500.0 * (_f_lab(xyz_x(r, g, b) / 0.95047) - _f_lab(xyz_y(r, g, b)))
lab_b(r, g, b) = 200.0 * (_f_lab(xyz_y(r, g, b)) - _f_lab(xyz_z(r, g, b) / 1.08883))

// CIE76 ΔE* (Euclidean distance in Lab)
delta_e76(L1, a1, b1, L2, a2, b2) =
    sqrt((L2 - L1)^2 + (a2 - a1)^2 + (b2 - b1)^2)

// Chroma C* = sqrt(a*² + b*²)
chroma(a, b) = sqrt(a^2 + b^2)

// Hue angle h*ab (radians, 0 = +a* axis)
hue_angle(a, b) = arctan2(b, a)

// CIE94 ΔE* (graphic-arts parametric factors kL=1, K1=0.045, K2=0.015)
delta_e94(L1, a1, b1, L2, a2, b2) =
    sqrt(((L2 - L1))^2 + ((a2 - a1) / (1.0 + 0.045 * C1))^2 + ((b2 - b1) / (1.0 + 0.015 * C1))^2)
    where
        C1 = chroma(a1, b1)

// WCAG relative luminance (Y channel of XYZ, already linear)
wcag_lum(r, g, b) = xyz_y(r, g, b)

// WCAG 2.x contrast ratio between two colours (pass R/G/B in [0,1])
contrast_ratio(r1, g1, b1, r2, g2, b2) =
    (lhi + 0.05) / (llo + 0.05)
    where
        L1  = wcag_lum(r1, g1, b1)
        L2  = wcag_lum(r2, g2, b2)
        lhi = max(L1, L2)
        llo = min(L1, L2)
