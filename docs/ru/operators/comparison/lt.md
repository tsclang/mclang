# Оператор < (меньше)

---

## Синтаксис

```mc
a < b
```

---

## Пример

```mc
is_negative(x) = x < 0
```

```c
mc_num is_negative(mc_num x) { return (x < 0.0) ? 1.0 : 0.0; }
```

---

## В цепочке сравнений

```mc
in_range(x, lo, hi) = lo < x < hi
```

Разворачивается в: `(lo < x) and (x < hi)`.

```c
mc_num in_range(mc_num x, mc_num lo, mc_num hi) {
    return ((lo < x) && (x < hi)) ? 1.0 : 0.0;
}
```

---

## Смотри aussi

- [Больше](gt.md)
- [Меньше или равно](leq.md)
- [Цепочки сравнений](chaining.md)
