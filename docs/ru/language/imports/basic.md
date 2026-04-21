# Базовый импорт

`import` позволяет включить функции и константы из другого `.mc`-файла.

---

## Синтаксис

### Импорт всего файла

```mc
import "./utils.mc"
```

Все публичные функции и константы из `utils.mc` становятся доступны в текущем файле.

### Выборочный импорт

```mc
from "./geometry.mc" import circle_area, circle_perimeter
```

Импортируются только указанные имена.

---

## Пример

`utils.mc`:
```mc
PI_APPROX = 355 / 113

approx_circle(r) = PI_APPROX * r^2
```

`main.mc`:
```mc
import "./utils.mc"

total_area(r1, r2) =
    approx_circle(r1) + approx_circle(r2)
```

---

## Пути

Путь всегда указывается **относительно текущего файла**:

```mc
import "./lib/vectors.mc"      // в подпапке
import "../shared/constants.mc" // в родительской папке
```

Абсолютные пути не поддерживаются.

---

## Как работает импорт

При наличии `import` в файле компилятор:
1. Читает все импортируемые файлы рекурсивно
2. Объединяет AST в один граф
3. Генерирует единый `.c`-файл

Циклические импорты не поддерживаются.

---

## Генерируемый Си-код

Все импортированные функции объединяются в один `.c` файл:

```c
// main.c — содержит код из utils.mc и main.mc
#include "main.h"

static mc_num _approx_circle(...) { ... }    // если _prefix

mc_num total_area(mc_num r1, mc_num r2) {
    return _approx_circle(r1) + _approx_circle(r2);
}
```

---

## Ошибки

### Файл не найден

```mc
import "./nonexistent.mc"
```

```
Error E060: cannot read file './nonexistent.mc'
```

### Циклический импорт

```
// a.mc
import "./b.mc"

// b.mc
import "./a.mc"   // ошибка: циклический импорт
```

```
Error E061: circular import detected: a.mc → b.mc → a.mc
```

---

## Смотри также

- [Пространства имён](namespaces.md)
- [Коллизии имён](collisions.md)
