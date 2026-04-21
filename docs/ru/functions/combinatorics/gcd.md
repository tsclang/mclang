# gcd — наибольший общий делитель

---

## Сигнатура

```mc
gcd(a: num, b: num) → num
```

---

## Пример

```mc
f(a, b) = gcd(a, b)
// gcd(48, 18) → 6
// gcd(100, 75) → 25
```

```c
static inline mc_num mc_gcd(mc_num a, mc_num b) {
    int ia = (int)fabs(a), ib = (int)fabs(b);
    while (ib) { int t = ib; ib = ia % ib; ia = t; }
    return (mc_num)ia;
}
```

---

## Применение

```mc
// Сокращение дроби
simplify(num, den) =
    [num / g, den / g]
    where g = gcd(num, den)

// Наименьшее общее кратное
lcm(a, b) = a * b / gcd(a, b)
```

---

## Смотри aussi

- [lcm](lcm.md)
