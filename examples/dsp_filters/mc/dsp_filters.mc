// DSP — Window functions and FIR filter design

hann(n, N) = 0.5 * (1.0 - cos(2.0 * π * n / (N - 1.0)))
hamming(n, N) = 0.54 - 0.46 * cos(2.0 * π * n / (N - 1.0))
blackman(n, N) =
    0.42 - 0.5 * cos(2.0 * π * n / (N - 1.0)) + 0.08 * cos(4.0 * π * n / (N - 1.0))
flattop(n, N) =
    0.21557895 -
    0.41663158*cos(2.0*π*n/M) +
    0.277263158*cos(4.0*π*n/M) -
    0.083578947*cos(6.0*π*n/M) +
    0.006947368*cos(8.0*π*n/M)
    where
        M = N - 1.0

_sinc(x) = if (abs(x) < 1e-10) 1.0 else sin(π * x) / (π * x)

lp_ideal(n, N, fc) = 2.0 * fc * _sinc(2.0 * fc * (n - (N - 1.0) / 2.0))
lp_hann(n, N, fc) = lp_ideal(n, N, fc) * hann(n, N)
lp_hamming(n, N, fc) = lp_ideal(n, N, fc) * hamming(n, N)
lp_blackman(n, N, fc) = lp_ideal(n, N, fc) * blackman(n, N)

fir(h: num[], x: num[]) = dot(h, x)
signal_power(x: num[]) = dot(x, x)
signal_rms(x: num[], n) =
    sqrt(dot(x, x) / n)
    where
        n > 0
xcorr_norm(x: num[], y: num[]) =
    dot(x, y) / (norm(x) * norm(y))
    where
        norm(x) > 0
        norm(y) > 0
