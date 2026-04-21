# lcm — наименьшее общее кратное

---

## Сигнатура

```mc
lcm(a: num, b: num) → num
```

---

## Пример

```mc
f(a, b) = lcm(a, b)
// lcm(4, 6) → 12
// lcm(12, 18) → 36
```

```c
static inline mc_num mc_lcm(mc_num a, mc_num b) {
    mc_num g = mc_gcd(a, b);
    return (g == 0.0) ? 0.0 : fabs(a * b) / g;
}
```

---

## Применение

```mc
// Общий знаменатель
common_denom(a, b) = lcm(a, b)

// Период суперпозиции двух периодических сигналов
beat_period(T1, T2) = lcm(T1, T2)
```

---

## Смотри aussi

- [gcd](gcd.md)
