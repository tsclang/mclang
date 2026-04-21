# Оператор >= (больше или равно)

---

## Синтаксис

```mc
a >= b
a \geq b   // LaTeX
a ≥ b      // Unicode
```

---

## Пример

```mc
non_negative(x) = x >= 0
```

```c
mc_num non_negative(mc_num x) { return (x >= 0.0) ? 1.0 : 0.0; }
```

---

## Guard-условие

```mc
safe_sqrt(x) =
    sqrt(x)
    where x >= 0
```

---

## Смотри aussi

- [Меньше или равно](leq.md)
- [Цепочки сравнений](chaining.md)
