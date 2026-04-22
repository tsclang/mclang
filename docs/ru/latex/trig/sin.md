# \sin, \cos, \tan, \cot

---

## Синтаксис

```latex
\sin{x}    \cos{x}    \tan{x}    \cot{x}
\sin(x)    \cos(x)    \tan(x)    \cot(x)
\sin x     \cos x     \tan x               // один символ без скобок

// Русские синонимы
\tg{x}     \ctg{x}
```

---

## Трансляция

| LaTeX | mclang | Си |
|-------|--------|----|
| `\sin{x}` | `sin(x)` | `sin(x)` |
| `\cos{x}` | `cos(x)` | `cos(x)` |
| `\tan{x}`, `\tg{x}` | `tan(x)` | `tan(x)` |
| `\cot{x}`, `\ctg{x}` | `cot(x)` | `1.0/tan(x)` |

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

## Степень функции (`\sin^2 x`)

```latex
\sin^2 x         →  pow(sin(x), 2)
\cos^{2}(x)      →  pow(cos(x), 2)
\tan^{-1}(x)     →  pow(tan(x), -1)   // не arctan!
```

Синтаксис: `\имя^{степень}` или `\имя^степень` (для одной цифры). Применяется к следующему аргументу.

Работает для: `\sin`, `\cos`, `\tan`, `\cot`, `\sec`, `\csc`, `\arcsin`, `\arccos`, `\arctan`, `\sinh`, `\cosh`, `\tanh`, `\arsinh`, `\arcosh`, `\artanh`, `\ln`, `\log`, `\lg`, `\exp`, `\sqrt`.

---

## Смотри aussi

- [sin](../../functions/trig/sin.md) · [arcsin/arccos/arctan](arcsin.md)
