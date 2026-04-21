# Оператор > (больше)

---

## Синтаксис

```mc
a > b
```

---

## Пример

```mc
is_positive(x) = x > 0
```

```c
mc_num is_positive(mc_num x) { return (x > 0.0) ? 1.0 : 0.0; }
```

---

## В цепочке

```mc
descending(a, b, c) = a > b > c
```

Разворачивается в: `(a > b) and (b > c)`.

---

## Смотри aussi

- [Меньше](lt.md)
- [Больше или равно](geq.md)
- [Цепочки сравнений](chaining.md)
