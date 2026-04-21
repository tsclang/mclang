# Оператор or (логическое ИЛИ)

---

## Синтаксис

```mc
a or b
a || b   // синоним
a ∨ b    // Unicode
```

---

## Пример

```mc
either_zero(x, y) = x == 0 or y == 0
```

```c
mc_num either_zero(mc_num x, mc_num y) {
    return ((x == 0.0) || (y == 0.0)) ? 1.0 : 0.0;
}
```

---

## Вычисление с коротким замыканием

Правый операнд вычисляется только если левый ложен.

---

## Пример: ограничение области

```mc
outside_range(x, lo, hi) = x < lo or x > hi
```

---

## Смотри aussi

- [and](and.md)
- [not](not.md)
