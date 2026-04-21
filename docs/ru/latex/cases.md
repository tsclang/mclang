# \begin{cases} — кусочные функции

---

## Синтаксис

```mc
f(x) = \begin{cases}
    expr_1 & \text{if} cond_1 \\
    expr_2 & \text{if} cond_2 \\
    expr_3 & \text{otherwise}
\end{cases}
```

Разделитель строк `\\` необязателен — перевод строки тоже работает:

```mc
f(x) = \begin{cases}
    expr_1 & \text{if} cond_1
    expr_2 & \text{otherwise}
\end{cases}
```

---

## Альтернативный разделитель: &&

Вместо `& \text{if}` можно писать `&&`:

```mc
sign(x) = \begin{cases}
    1  && x > 0 \\
    -1 && x < 0 \\
    0
\end{cases}
```

Последняя строка без разделителя — ветка `otherwise`.

---

## Пример и генерируемый C-код

```mc
sign(x) = \begin{cases}
    1  & \text{if} x > 0 \\
    -1 & \text{if} x < 0 \\
    0  & \text{otherwise}
\end{cases}
```

```c
mc_num sign(mc_num x) {
    if ((x) > (0.0)) {
        return 1.0;
    } else if ((x) < (0.0)) {
        return (-(1.0));
    } else {
        return 0.0;
    }
}
```

---

## Пример: функция Хевисайда

```mc
heaviside(x) = \begin{cases}
    0   & \text{if} x < 0  \\
    0.5 & \text{if} x == 0 \\
    1   & \text{otherwise}
\end{cases}
```

---

## Инлайн-форма

```mc
f(x) = \begin{cases} 1 && x > 0 \\ -1 \end{cases}
```

---

## Ограничения

- Без ветки `\text{otherwise}` последний `else` возвращает `NAN`
- Ветки вычисляются сверху вниз, первое совпавшее условие побеждает

---

## Смотри также

- [if / else](../language/syntax/if-else.md)
- [Неявный return](../language/functions/implicit-return.md)
