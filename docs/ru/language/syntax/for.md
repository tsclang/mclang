# for

Цикл с итерацией по целочисленному диапазону.

---

## Синтаксис

```mc
for i in lo..hi
    тело
```

С шагом:

```mc
for i in lo..hi step s
    тело
```

---

## Примеры

### Накопление суммы

```mc
sum_range(n) =
    for i in 1..n
        acc = acc + i
    acc
    where
        acc = 0
```

```c
mc_num sum_range(mc_num n) {
    mc_num acc = 0.0;
    for (int i = (int)(1.0); i <= (int)(n); i += (int)(1)) {
        acc = acc + i;
    }
    return acc;
}
```

### Шаг 2

```mc
sum_even(n) =
    for i in 0..n step 2
        acc = acc + i
    acc
    where
        acc = 0
```

---

## Ограничения

- Переменная цикла `i` — целочисленная (`int`), генерируется как `for (int i = ...)`
- Границы `lo` и `hi` приводятся к `int` через `(int)(expr)`
- Тело цикла — блок операторов с отступом; неявный `return` внутри цикла не работает

---

## Смотри также

- [while](while.md)
- [if / else](if-else.md)
- [\sum — символьная сумма](../../latex/sum.md)
- [Значимые отступы](indentation.md)
