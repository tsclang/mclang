# \sinh, \cosh, \tanh, \coth

---

## Синтаксис

```latex
\sinh{x}    \cosh{x}    \tanh{x}    \coth{x}

// Русские синонимы
\sh{x}      \ch{x}      \th{x}      \cth{x}
```

---

## Трансляция

| LaTeX | Си |
|-------|----|
| `\sinh{x}`, `\sh{x}` | `sinh(x)` |
| `\cosh{x}`, `\ch{x}` | `cosh(x)` |
| `\tanh{x}`, `\th{x}` | `tanh(x)` |
| `\coth{x}`, `\cth{x}` | `(1.0/tanh(x))` |

---

## Смотри aussi

- [sinh](../../functions/trig/sinh.md) · [tanh](../../functions/trig/tanh.md)
