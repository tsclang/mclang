# Оператор and (логическое И)

---

## Синтаксис

```mc
a and b
a && b    // синоним
a ∧ b     // Unicode
```

---

## Пример

```mc
both_positive(x, y) = x > 0 and y > 0
```

```c
mc_num both_positive(mc_num x, mc_num y) {
    return ((x > 0.0) && (y > 0.0)) ? 1.0 : 0.0;
}
```

---

## Вычисление с коротким замыканием

Правый операнд вычисляется только если левый истинен (как `&&` в Си).

```mc
safe_log(x, base) =
    base > 0 and base != 1 and x > 0 and
    log(x) / log(base)
```

---

## В цепочках условий

```mc
valid_triangle(a, b, c) =
    a > 0 and b > 0 and c > 0 and
    a + b > c and b + c > a and a + c > b
```

---

## Смотри aussi

- [or](or.md)
- [not](not.md)
- [Цепочки сравнений](../comparison/chaining.md)
