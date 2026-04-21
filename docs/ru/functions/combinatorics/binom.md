# binom — биномиальный коэффициент

---

## Сигнатура

```mc
binom(n: num, k: num) → num
\binom{n}{k}               // LaTeX
C(n, k)                    // альтернативная нотация (не синоним)
```

---

## Определение

`binom(n, k) = n! / (k! * (n-k)!)`

Реализован без факториалов (устойчив к переполнению):

```c
static inline mc_num mc_binom(mc_num n, mc_num k) {
    int in = (int)n, ik = (int)k;
    if (ik < 0 || ik > in) return 0.0;
    if (ik > in - ik) ik = in - ik;
    mc_num r = 1.0;
    for (int i = 0; i < ik; i++) r = r * (in - i) / (i + 1);
    return r;
}
```

---

## Пример

```mc
pascal(n, k) = binom(n, k)

// Коэффициенты разложения (a+b)^4
row4(k) = binom(4, k)
// k=0..4: 1, 4, 6, 4, 1
```

---

## Вероятность

```mc
// Биномиальное распределение
binom_prob(n, k, p) =
    binom(n, k) * p^k * (1-p)^(n-k)
```

---

## Смотри aussi

- [factorial](factorial.md)
- [LaTeX: \binom](../../latex/arithmetic/binom.md)
