# asinh, acosh, atanh — обратные гиперболические

---

## Сигнатуры

```mc
asinh(x: num) → num    // arcsh(x) — синоним
acosh(x: num) → num    // arcch(x) — синоним
atanh(x: num) → num    // arcth(x) — синоним

\arsinh{x}             // LaTeX (ISO)
\arcosh{x}             // LaTeX (ISO)
\artanh{x}             // LaTeX (ISO)
```

---

## Области и значения

| Функция | Область | Значения |
|---------|---------|----------|
| `asinh(x)` | ℝ | ℝ |
| `acosh(x)` | [1, +∞) | [0, +∞) |
| `atanh(x)` | (-1, 1) | ℝ |

---

## Генерируемый C-код

| mclang | C |
|--------|---|
| `asinh(x)` | `asinh(x)` |
| `acosh(x)` | `acosh(x)` |
| `atanh(x)` | `atanh(x)` |

Требует C99 — mclang компилирует с `-std=c99` по умолчанию.

---

## Примеры

```mc
f(x) = asinh(x)     // обратный sinh: asinh(sinh(x)) == x
g(x) = acosh(x)     // определена при x >= 1
h(x) = atanh(x)     // определена при |x| < 1
```

---

## Смотри также

- [sinh](sinh.md) · [cosh](cosh.md) · [tanh](tanh.md)
