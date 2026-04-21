# log2 — логарифм по основанию 2

---

## Сигнатура

```mc
log2(x: num) → num
```

Область: `x > 0`.

---

## Пример

```mc
f(x) = log2(x)
```

```c
mc_num f(mc_num x) { return log2(x); }
```

---

## Применение

```mc
// Количество бит для хранения n значений
bits_needed(n) = ceil(log2(n))

// Октавы в частотном диапазоне
octaves(f_lo, f_hi) = log2(f_hi / f_lo)
```

---

## Смотри также

- [ln](ln.md) · [lg](lg.md) · [log-base](log-base.md)
