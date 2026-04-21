# Пространства имён

`import as` позволяет импортировать файл под псевдонимом — все его функции становятся доступны с префиксом `alias.`.

---

## Синтаксис

```mc
import "./vectors.mc" as vec
```

---

## Пример

`vectors.mc`:
```mc
dot(a: num[], b: num[]) = sum(a .* b)
norm(v: num[]) = sqrt(sum(v .* v))
```

`physics.mc`:
```mc
import "./vectors.mc" as vec

kinetic_energy(m, v: num[]) =
    0.5 * m * vec.norm(v)^2

projection(a: num[], b: num[]) =
    vec.dot(a, b) / vec.norm(b)
```

---

## Когда использовать

- Когда два файла экспортируют функции с одинаковыми именами
- Когда имя функции слишком общее (`norm`, `sum`, `distance`)
- Для явного указания источника

---

## Смешение стилей

Можно импортировать один файл дважды (с псевдонимом и без):

```mc
import "./math.mc"           // прямой доступ
import "./math.mc" as m      // также через m.

result = sin(x) + m.cos(x)   // обе формы работают
```

---

## Выборочный импорт без псевдонима

```mc
from "./geometry.mc" import circle_area
```

Импортирует только `circle_area`, без псевдонима.

---

## Ошибки

### Псевдоним совпадает с существующим именем

```mc
import "./math.mc" as sin   // ошибка: sin — встроенная функция
```

---

## Смотри aussi

- [Базовый импорт](basic.md)
- [Коллизии имён](collisions.md)
