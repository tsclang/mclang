// Number Theory — GCD, LCM, divisibility, integer checks

gcd(a, b) = if (b == 0) a else gcd(b, a mod b)
  where
    a ∈ ℕ
    b ∈ ℕ

lcm(a, b) = a * b / gcd(a, b)
  where
    gcd(a, b) > 0

is_even(n) = n mod 2 == 0

is_odd(n) = n mod 2 != 0

is_divisible(n, d) = n mod d == 0
  where
    d != 0

is_integer(x) = x ∈ ℤ

is_natural(x) = x ∈ ℕ

// Triangular number: T(n) = 1+2+...+n
triangular(n) = n * (n + 1) / 2
  where
    n ∈ ℕ

// Digital root (iterated digit sum until single digit)
// For positive integers: dr(n) = 1 + (n-1) mod 9
digital_root(n) = if (n == 0) 0 else 1 + (n - 1) mod 9
  where
    n ∈ ℕ
