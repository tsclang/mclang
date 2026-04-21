# while

Цикл с проверкой условия перед каждой итерацией.

---

## Синтаксис

```mc
while условие
    тело
```

---

## Пример

### Итерация метода Ньютона

```mc
newton_sqrt(x) =
    while abs(guess^2 - x) > 1e-10
        guess = (guess + x / guess) / 2
    guess
    where
        guess = x / 2
```

```c
mc_num newton_sqrt(mc_num x) {
    mc_num guess = x / 2.0;
    while (fabs((guess * guess) - x) > 1e-10) {
        guess = (guess + x / guess) / 2.0;
    }
    return guess;
}
```

### Подсчёт цифр

```mc
digit_count(n) =
    while n > 0
        count = count + 1
        n = n / 10
    count
    where
        count = 0
```

---

## Ограничения

- Условие — произвольное выражение типа `num`; ноль считается ложью
- Тело — блок операторов с отступом; неявный `return` внутри цикла не работает
- Бесконечный цикл (`while 1`) возможен — нет защиты от зависания

---

## Смотри также

- [for](for.md)
- [if / else](if-else.md)
- [Значимые отступы](indentation.md)
