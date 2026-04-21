# \begin{cases} — кусочные функции

---

## Синтаксис

```latex
\begin{cases}
  expr_1 & \text{if} cond_1 \\
  expr_2 & \text{if} cond_2 \\
  expr_3 & \text{otherwise}
\end{cases}
```

---

## Трансляция

`\begin{cases}` разворачивается в `if/else if/else`:

```mc
sign(x) = \begin{cases}
    1  & \text{if} x > 0 \\
   -1  & \text{if} x < 0 \\
    0  & \text{otherwise}
\end{cases}
```

```c
mc_num sign(mc_num x) {
    if (x > 0.0) return 1.0;
    else if (x < 0.0) return -1.0;
    else return 0.0;
}
```

---

## Альтернативный синтаксис mclang

То же самое без LaTeX:

```mc
sign(x) =
    if (x > 0) 1
    else if (x < 0) -1
    else 0
```

---

## Пример: функция Хевисайда

```mc
heaviside(x) = \begin{cases}
    0   & \text{if} x < 0 \\
    0.5 & \text{if} x == 0 \\
    1   & \text{otherwise}
\end{cases}
```

---

## Ограничения

- Ветка `\text{otherwise}` необязательна — без неё возвращается `0` если ни одно условие не выполнено
- Нет поддержки `\text{else if}` — только `\text{if}` и `\text{otherwise}`

---

## Смотри aussi

- [Неявный return](../language/functions/implicit-return.md)
- [Синтаксис if](../language/functions/multiline.md)
