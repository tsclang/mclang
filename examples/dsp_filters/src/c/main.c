#include <stdio.h>
#include <math.h>
#include "../../mc/dsp_filters.h"

#define N_TAPS   9
#define N_SIG   64

static double dot_c(const double *a, const double *b, int n) {
    double s = 0.0;
    for (int i = 0; i < n; i++) s += a[i] * b[i];
    return s;
}

static double rms_c(const double *x, int n) {
    return sqrt(dot_c(x, x, n) / n);
}

int main(void) {
    int    N  = N_TAPS;
    double fc = 0.2;   /* normalized cutoff frequency */

    /* ---- 1. Window coefficients for N=9 ---- */
    printf("=== Window Coefficients (N=%d) ===\n", N);
    printf("%-5s  %10s  %10s  %10s  %10s\n", "tap", "Hann", "Hamming", "Blackman", "Flat-top");
    for (int n = 0; n < N; n++) {
        printf("%-5d  %10.6f  %10.6f  %10.6f  %10.6f\n",
               n,
               hann(n, N),
               hamming(n, N),
               blackman(n, N),
               flattop(n, N));
    }

    /* ---- 2. 9-tap low-pass FIR (Hann window, fc=0.2) ---- */
    double h[N_TAPS];
    printf("\n=== 9-tap LPF coefficients (Hann, fc=%.1f) ===\n", fc);
    for (int n = 0; n < N; n++) {
        h[n] = lp_hann(n, N, fc);
        printf("  h[%d] = %10.6f\n", n, h[n]);
    }

    /* Verify gain at DC should equal 1 (sum of coefficients) */
    double dc_gain = 0.0;
    for (int n = 0; n < N; n++) dc_gain += h[n];
    printf("  DC gain (sum): %.6f\n", dc_gain);

    /* ---- 3. Build test signal: mix of 0.1 and 0.4 normalized freq ---- */
    double signal[N_SIG];
    double M_PI_local = 3.14159265358979323846;
    for (int i = 0; i < N_SIG; i++) {
        signal[i] = sin(2.0 * M_PI_local * 0.1 * i)   /* passband */
                  + sin(2.0 * M_PI_local * 0.4 * i);  /* stopband */
    }

    double rms_in = rms_c(signal, N_SIG);
    printf("\n=== Signal Analysis ===\n");
    printf("Input signal RMS:  %.6f  (low-freq + high-freq components)\n", rms_in);

    /* ---- 4. Apply FIR filter using overlapping windows ---- */
    int n_out = N_SIG - N_TAPS + 1;
    double filtered[N_SIG];
    for (int i = 0; i < n_out; i++) {
        /* Use the compiled dot() via fir() — pass window of signal */
        filtered[i] = fir(h, N_TAPS, signal + i, N_TAPS);
    }
    double rms_out = rms_c(filtered, n_out);
    printf("Output signal RMS: %.6f  (high-freq attenuated)\n", rms_out);
    printf("Attenuation ratio: %.2f dB\n",
           20.0 * log10(rms_out / rms_in));

    /* Show first 12 samples */
    printf("\nFirst 12 filtered samples:\n");
    for (int i = 0; i < 12 && i < n_out; i++) {
        printf("  y[%2d] = %8.5f\n", i, filtered[i]);
    }

    /* ---- Window comparison for same FIR design ---- */
    printf("\n=== LPF tap comparison (fc=%.1f, n=4 centre tap) ===\n", fc);
    int centre = N / 2;
    printf("  lp_ideal:   %.6f\n", lp_ideal(centre, N, fc));
    printf("  lp_hann:    %.6f\n", lp_hann(centre, N, fc));
    printf("  lp_hamming: %.6f\n", lp_hamming(centre, N, fc));
    printf("  lp_blackman:%.6f\n", lp_blackman(centre, N, fc));

    return 0;
}
