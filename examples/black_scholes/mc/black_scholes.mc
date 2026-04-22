// Black-Scholes option pricing and Greeks

_norm_cdf(x) = 0.5 * (1.0 + erf(x / sqrt(2.0)))
_norm_pdf(x) = exp(-0.5 * x^2) / sqrt(2.0 * π)

_d1(S, K, r, σ, T) =
    (ln(S / K) + (r + 0.5 * σ^2) * T) / (σ * sqrt(T))
    where
        S > 0
        K > 0
        σ > 0
        T > 0

_d2(S, K, r, σ, T) = _d1(S, K, r, σ, T) - σ * sqrt(T)

call_price(S, K, r, σ, T) =
    S * _norm_cdf(d1v) - K * exp(-r * T) * _norm_cdf(d2v)
    where
        d1v = _d1(S, K, r, σ, T)
        d2v = _d2(S, K, r, σ, T)

put_price(S, K, r, σ, T) =
    K * exp(-r * T) * _norm_cdf(-d2v) - S * _norm_cdf(-d1v)
    where
        d1v = _d1(S, K, r, σ, T)
        d2v = _d2(S, K, r, σ, T)

call_delta(S, K, r, σ, T) = _norm_cdf(_d1(S, K, r, σ, T))
put_delta(S, K, r, σ, T) = _norm_cdf(_d1(S, K, r, σ, T)) - 1.0

bs_gamma(S, K, r, σ, T) =
    _norm_pdf(_d1(S, K, r, σ, T)) / (S * σ * sqrt(T))
    where
        S > 0
        σ > 0
        T > 0

bs_vega(S, K, r, σ, T) =
    S * _norm_pdf(_d1(S, K, r, σ, T)) * sqrt(T)

call_theta(S, K, r, σ, T) =
    -S * _norm_pdf(d1v) * σ / (2.0 * sqrt(T)) - r * K * exp(-r * T) * _norm_cdf(d2v)
    where
        d1v = _d1(S, K, r, σ, T)
        d2v = _d2(S, K, r, σ, T)

call_rho(S, K, r, σ, T) =
    K * T * exp(-r * T) * _norm_cdf(_d2(S, K, r, σ, T))

put_rho(S, K, r, σ, T) =
    -K * T * exp(-r * T) * _norm_cdf(-_d2(S, K, r, σ, T))

iv_seed(S, K, T) =
    sqrt(2.0 * π / T) * abs(S - K) / (S + K)
    where
        S > 0
        K > 0
        T > 0
