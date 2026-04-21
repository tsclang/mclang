# Язык mclang

mclang — декларативный язык математических вычислений. Программа состоит из объявлений функций и глобальных констант. Компилятор транслирует их в чистый Си-код без зависимостей.

---

## Разделы

### Синтаксис

| Страница | Тема |
|----------|------|
| [Значимые отступы](syntax/indentation.md) | INDENT/DEDENT, правила вложенности |
| [Автоматические точки с запятой (ASI)](syntax/asi.md) | когда `;` вставляется автоматически |
| [Комментарии](syntax/comments.md) | `//` и `#` |
| [Перенос строк](syntax/line-continuation.md) | многострочные выражения |
| [if / else](syntax/if-else.md) | ветвление, `\begin{cases}` |
| [for](syntax/for.md) | цикл по диапазону `lo..hi` |
| [while](syntax/while.md) | цикл с условием |

### Функции

| Страница | Тема |
|----------|------|
| [Объявление](functions/declaration.md) | `f(x) = expr` |
| [Многострочное тело](functions/multiline.md) | блочный синтаксис |
| [Неявный return](functions/implicit-return.md) | последнее выражение |
| [Приватные функции](functions/private.md) | `_prefix` |
| [Мутабельность](functions/mutability.md) | параметры иммутабельны |
| [Множественный возврат](functions/multi-return.md) | `[a, b, c]`, `\pm` |

### Типы

| Страница | Тема |
|----------|------|
| [num](types/num.md) | основной числовой тип |
| [int](types/int.md) | целые, только для индексов |
| [num\[\]](types/arrays.md) | векторы |
| [num\[\]\[\]](types/matrices.md) | матрицы |
| [Срезы](types/slices.md) | `m[:,j]`, `m[i,:]` |

### Блок where

| Страница | Тема |
|----------|------|
| [Переменные](where/definitions.md) | локальные определения |
| [Guards](where/guards.md) | условия → `return NAN` |
| [Порядок](where/order.md) | топологическая сортировка |

### Импорты

| Страница | Тема |
|----------|------|
| [Базовый импорт](imports/basic.md) | `import "./file.mc"` |
| [Пространства имён](imports/namespaces.md) | `import as ns` |
| [Коллизии имён](imports/collisions.md) | разрешение конфликтов |

### Константы

| Страница | Тема |
|----------|------|
| [Встроенные константы](constants/builtin.md) | `π`, `e`, `τ`, `φ`, `∞`, `nan` |
| [Глобальные константы](constants/global.md) | `G = 6.67e-11` |
| [Constant folding](constants/folding.md) | свёртка константных выражений |
| [Приоритет](constants/priority.md) | local > global > builtin |

### Unicode

| Страница | Тема |
|----------|------|
| [Идентификаторы](unicode/identifiers.md) | греческие буквы как имена |
| [Транслитерация](unicode/transliteration.md) | `alpha` → `α` |
| [Нижние индексы](unicode/subscripts.md) | `x_{i}` |

---

## Смотри также

- [Операторы](../operators/index.md)
- [Встроенные функции](../functions/index.md)
- [LaTeX-справочник](../latex/index.md)
