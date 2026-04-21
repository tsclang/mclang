# \sin, \cos, \tan, \cot

---

## Синтаксис

```latex
\sin{x}    \cos{x}    \tan{x}    \cot{x}
\sin(x)    \cos(x)    \tan(x)    \cot(x)
\sin x     \cos x     \tan x               // один символ без скобок
```

---

## Трансляция

| LaTeX | mclang | Си |
|-------|--------|----|
| `\sin{x}` | `sin(x)` | `sin(x)` |
| `\cos{x}` | `cos(x)` | `cos(x)` |
| `\tan{x}` | `tan(x)` | `tan(x)` |
| `\cot{x}` | `cot(x)` | `1.0/tan(x)` |

---

## Примеры

```mc
f(θ) = \sin{θ}^2 + \cos{θ}^2   // → 1 (тождество)
g(x) = \tan{x} / \cos{x}

// Без скобок: применяется к одному следующему символу
h(x) = \sin x + \cos x   // = sin(x) + cos(x)
// Не то же самое, что \sin{x + y}!
```

---

## Смотри aussi

- [sin](../../functions/trig/sin.md) · [arcsin/arccos/arctan](arcsin.md)
