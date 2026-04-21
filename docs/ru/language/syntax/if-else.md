# if / else

---

## Однострочная форма

```mc
f(x) = if (x > 0) x else -x
```

Скобки вокруг условия необязательны:

```mc
f(x) = if x > 0 then x else -x
```

Цепочка:

```mc
sign(x) = if x > 0 then 1 else if x < 0 then -1 else 0
```

---

## Блочная форма

Тело начинается с отступа после условия:

```mc
clamp(x, lo, hi) =
    if x < lo
        lo
    else if x > hi
        hi
    else
        x
```

Блочная форма допускает несколько операторов в ветке:

```mc
process(x) =
    if x < 0
        y = -x
        y * 2
    else
        x * 2
```

---

## LaTeX-стиль: \begin{cases}

Альтернативная запись через `\begin{cases}`:

```mc
sign(x) = \begin{cases}
    1  & \text{if} x > 0 \\
    -1 & \text{if} x < 0 \\
    0  & \text{otherwise}
\end{cases}
```

Вместо `&` и `\text{if}` можно использовать `&&`:

```mc
sign(x) = \begin{cases}
    1  && x > 0 \\
    -1 && x < 0 \\
    0
\end{cases}
```

---

## Генерируемый C-код

```mc
sign(x) = if x > 0 then 1 else if x < 0 then -1 else 0
```

```c
mc_num sign(mc_num x) {
    if ((x) > (0.0)) {
        return 1.0;
    } else if ((x) < (0.0)) {
        return -1.0;
    } else {
        return 0.0;
    }
}
```

---

## Смотри также

- [\begin{cases}](../../latex/cases.md)
- [for](for.md)
- [while](while.md)
- [Значимые отступы](indentation.md)
