# tanh — гиперболический тангенс

---

## Сигнатура

```mc
tanh(x: num) → num
th(x: num) → num   // синоним
```

```c
mc_num f(mc_num x) { return tanh(x); }
```

---

## Определение

`tanh(x) = sinh(x) / cosh(x)`

Значения: `(-1, 1)`. Используется как сигмоидная функция в ML.

---

## Применение

```mc
// Сглаживающая функция активации
activate(x) = tanh(x)

// Ограничение в диапазон (-1, 1)
soft_clamp(x) = tanh(x)
```

---

## Смотри aussi

- [sinh](sinh.md) · [cosh](cosh.md) · [coth](coth.md)
