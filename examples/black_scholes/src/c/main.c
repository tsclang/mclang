#include <stdio.h>
#include <math.h>
#include "../../mc/black_scholes.h"

int main(void) {
    /* Base parameters: ATM option, 1-year expiry */
    double S = 100.0;   /* spot price */
    double K = 100.0;   /* strike price */
    double r = 0.05;    /* risk-free rate */
    double sig = 0.20;  /* volatility (σ) */
    double T = 1.0;     /* time to expiry (years) */

    printf("=== Black-Scholes Option Pricing ===\n");
    printf("S=%.0f, K=%.0f, r=%.2f, σ=%.2f, T=%.1f yr\n\n", S, K, r, sig, T);

    double cp = call_price(S, K, r, sig, T);
    double pp = put_price(S, K, r, sig, T);
    printf("Call price: $%.4f\n", cp);
    printf("Put  price: $%.4f\n", pp);
    printf("Put-Call parity check (C - P - S + K*e^-rT = 0): %.6f\n\n",
           cp - pp - S + K * exp(-r * T));

    printf("=== Greeks (ATM, σ=0.20) ===\n");
    printf("Call Delta: %+.4f\n",  call_delta(S, K, r, sig, T));
    printf("Put  Delta: %+.4f\n",  put_delta(S, K, r, sig, T));
    printf("Gamma:       %.6f\n",  bs_gamma(S, K, r, sig, T));
    printf("Vega:        %.4f  (per 1%% vol move: $%.4f)\n",
           bs_vega(S, K, r, sig, T), bs_vega(S, K, r, sig, T) / 100.0);
    printf("Call Theta:  %.4f  (per day: $%.4f)\n",
           call_theta(S, K, r, sig, T), call_theta(S, K, r, sig, T) / 365.0);
    printf("Call Rho:    %.4f  (per 1%% rate move: $%.4f)\n",
           call_rho(S, K, r, sig, T), call_rho(S, K, r, sig, T) / 100.0);
    printf("Put  Rho:    %.4f\n",  put_rho(S, K, r, sig, T));
    printf("IV seed:     %.4f\n\n", iv_seed(S, K, T));

    /* Table: call prices for different strikes and volatilities */
    double strikes[5] = {80.0, 90.0, 100.0, 110.0, 120.0};
    double vols[3]    = {0.10, 0.20, 0.30};

    printf("=== Call Price Table (S=%.0f, r=%.2f, T=%.1f) ===\n", S, r, T);
    printf("%-8s", "K \\ σ");
    for (int j = 0; j < 3; j++)
        printf("   σ=%.0f%%  ", vols[j] * 100.0);
    printf("\n");

    for (int i = 0; i < 5; i++) {
        printf("K=%-5.0f  ", strikes[i]);
        for (int j = 0; j < 3; j++)
            printf("  %7.4f ", call_price(S, strikes[i], r, vols[j], T));
        printf("\n");
    }

    printf("\n=== Put Price Table (S=%.0f, r=%.2f, T=%.1f) ===\n", S, r, T);
    printf("%-8s", "K \\ σ");
    for (int j = 0; j < 3; j++)
        printf("   σ=%.0f%%  ", vols[j] * 100.0);
    printf("\n");

    for (int i = 0; i < 5; i++) {
        printf("K=%-5.0f  ", strikes[i]);
        for (int j = 0; j < 3; j++)
            printf("  %7.4f ", put_price(S, strikes[i], r, vols[j], T));
        printf("\n");
    }

    return 0;
}
