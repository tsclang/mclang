# Оператор <= (меньше или равно)

---

## Синтаксис

```mc
a <= b
a \leq b   // LaTeX
a ≤ b      // Unicode
```

---

## Пример

```mc
non_positive(x) = x <= 0
```

```c
mc_num non_positive(mc_num x) { return (x <= 0.0) ? 1.0 : 0.0; }
```

---

## Типичное использование

```mc
clamp(x, lo, hi) =
    if (x <= lo) lo
    else if (x >= hi) hi
    else x

unit_interval(x) = 0 <= x <= 1
```

---

## Смотри aussi

- [Больше или равно](geq.md)
- [Цепочки сравнений](chaining.md)
