# sgn — знак числа

---

## Сигнатура

```mc
sgn(x: num) → num
sign(x: num) → num   // синоним
```

---

## Возвращает

- `1.0` если `x > 0`
- `-1.0` если `x < 0`
- `0.0` если `x == 0`

---

## Пример

```mc
f(x) = sgn(x)
```

```c
static inline mc_num mc_sgn(mc_num x) {
    return (x > 0.0) ? 1.0 : (x < 0.0) ? -1.0 : 0.0;
}
mc_num f(mc_num x) { return mc_sgn(x); }
```

---

## Применение

```mc
// Шаг алгоритма
direction(current, target) = sgn(target - current)

// Signed abs
signed_abs(x, s) = abs(x) * sgn(s)
```

---

## Смотри aussi

- [abs](abs.md)
