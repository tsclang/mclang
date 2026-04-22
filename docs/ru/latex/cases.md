# \begin{cases} — кусочные функции

---

## Синтаксис

```mc
f(x) = \begin{cases}
    expr_1 & cond_1 \\
    expr_2 & cond_2 \\
    expr_3
\end{cases}
```

Формат каждого случая: `выражение & условие \\`. Последний случай без `&` — ветка `else`.

Разделитель строк `\\` необязателен — перевод строки тоже работает:

```mc
f(x) = \begin{cases}
    expr_1 & cond_1
    expr_2
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
    1  & x > 0 \\
    -1 & x < 0 \\
    0
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
    0   & x < 0  \\
    0.5 & x == 0 \\
    1
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
