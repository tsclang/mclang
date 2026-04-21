# mclang — Документация

**mclang** (Math C Language) — компилятор математических формул в чистый Си-код без зависимостей.

Пишешь формулы в LaTeX-стиле → получаешь `.c` + `.h`, готовые к использованию в C, Python или JavaScript/WebAssembly.

---

## Быстрый старт

- [Установка и первый запуск](getting-started.md)
- [CLI: команды и флаги](cli.md)

---

## Язык

- [Обзор раздела](language/index.md)

### Синтаксис
- [Значимые отступы](language/syntax/indentation.md)
- [Автоматическая расстановка ; (ASI)](language/syntax/asi.md)
- [Комментарии](language/syntax/comments.md)
- [Перенос строк](language/syntax/line-continuation.md)

### Функции
- [Объявление функций](language/functions/declaration.md)
- [Многострочное тело](language/functions/multiline.md)
- [Неявный return](language/functions/implicit-return.md)
- [Приватные функции (_prefix)](language/functions/private.md)
- [Мутабельность](language/functions/mutability.md)
- [Множественный возврат](language/functions/multi-return.md)

### Типы
- [num — адаптивный числовой тип](language/types/num.md)
- [int — тип для индексов](language/types/int.md)
- [num[] — массивы](language/types/arrays.md)
- [num[][] — матрицы](language/types/matrices.md)
- [Срезы m[:,j] и m[i,:]](language/types/slices.md)

### Блок where
- [Определения переменных](language/where/definitions.md)
- [Guard-условия](language/where/guards.md)
- [Порядок вычислений](language/where/order.md)

### Импорты
- [Базовый импорт](language/imports/basic.md)
- [Неймспейсы](language/imports/namespaces.md)
- [Коллизии имён](language/imports/collisions.md)

### Константы
- [Встроенные константы](language/constants/builtin.md)
- [Глобальные константы](language/constants/global.md)
- [Constant Folding](language/constants/folding.md)
- [Приоритет констант](language/constants/priority.md)

### Unicode
- [Греческие буквы как идентификаторы](language/unicode/identifiers.md)
- [Транслитерация в ASCII](language/unicode/transliteration.md)
- [Нижние индексы](language/unicode/subscripts.md)

---

## Операторы

- [Обзор раздела](operators/index.md)

### Арифметика
- [+ сложение](operators/arithmetic/add.md)
- [- вычитание](operators/arithmetic/sub.md)
- [* умножение](operators/arithmetic/mul.md)
- [/ деление](operators/arithmetic/div.md)
- [^ степень](operators/arithmetic/pow.md)
- [mod остаток от деления](operators/arithmetic/mod.md)
- [n! факториал](operators/arithmetic/factorial.md)
- [Неявное умножение](operators/arithmetic/implicit-mul.md)

### Сравнение
- [== равенство](operators/comparison/eq.md)
- [!= неравенство](operators/comparison/neq.md)
- [< меньше](operators/comparison/lt.md)
- [> больше](operators/comparison/gt.md)
- [<= меньше или равно](operators/comparison/leq.md)
- [>= больше или равно](operators/comparison/geq.md)
- [Цепочки сравнений](operators/comparison/chaining.md)

### Логика
- [&& логическое И](operators/logical/and.md)
- [|| логическое ИЛИ](operators/logical/or.md)
- [! логическое НЕ](operators/logical/not.md)

### Специальные
- [|x| модуль числа](operators/special/abs.md)
- [⋅ скалярное/матричное умножение](operators/special/dot.md)
- [⨯ векторное произведение](operators/special/cross.md)
- [∈ принадлежность множеству](operators/special/set-in.md)
- [∉ непринадлежность множеству](operators/special/set-notin.md)
- [° угловые меры](operators/special/degrees.md)
- [\pm ± плюс-минус](operators/special/pm.md)

---

## Встроенные функции

- [Обзор раздела](functions/index.md)

### Тригонометрия
[sin](functions/trig/sin.md) ·
[cos](functions/trig/cos.md) ·
[tan](functions/trig/tan.md) ·
[cot](functions/trig/cot.md) ·
[arcsin](functions/trig/arcsin.md) ·
[arccos](functions/trig/arccos.md) ·
[arctan](functions/trig/arctan.md) ·
[arccot](functions/trig/arccot.md) ·
[sinh](functions/trig/sinh.md) ·
[cosh](functions/trig/cosh.md) ·
[tanh](functions/trig/tanh.md) ·
[coth](functions/trig/coth.md)

### Степени и логарифмы
[exp](functions/exp-log/exp.md) ·
[ln](functions/exp-log/ln.md) ·
[lg](functions/exp-log/lg.md) ·
[log_b](functions/exp-log/log-base.md) ·
[sqrt](functions/exp-log/sqrt.md) ·
[sqrt[n]](functions/exp-log/sqrt-n.md)

### Округление
[floor](functions/rounding/floor.md) ·
[ceil](functions/rounding/ceil.md) ·
[abs](functions/rounding/abs.md) ·
[sgn](functions/rounding/sgn.md) ·
[fmod](functions/rounding/fmod.md)

### Комбинаторика
[factorial](functions/combinatorics/factorial.md) ·
[binom](functions/combinatorics/binom.md) ·
[gcd](functions/combinatorics/gcd.md) ·
[lcm](functions/combinatorics/lcm.md)

### Специальные
[erf](functions/special/erf.md) ·
[gamma](functions/special/gamma.md)

### Агрегаторы массивов
[sum](functions/aggregators/sum.md) ·
[product](functions/aggregators/product.md) ·
[mean](functions/aggregators/mean.md) ·
[std](functions/aggregators/std.md) ·
[min](functions/aggregators/min.md) ·
[max](functions/aggregators/max.md)

### Векторные
[dot](functions/vector/dot.md) ·
[cross](functions/vector/cross.md) ·
[norm](functions/vector/norm.md)

### Матричные
[det](functions/matrix/det.md) ·
[inv](functions/matrix/inv.md) ·
[transpose](functions/matrix/transpose.md) ·
[zeros](functions/matrix/zeros.md) ·
[ones](functions/matrix/ones.md) ·
[identity](functions/matrix/identity.md) ·
[matmul](functions/matrix/matmul.md)

### Математический анализ
[integral](functions/calculus/integral.md) ·
[limit](functions/calculus/limit.md) ·
[derivative](functions/calculus/derivative.md)

### Прочее
[interp](functions/interp.md)

---

## LaTeX-справочник

- [Обзор раздела](latex/index.md)

### Арифметика
[\frac](latex/arithmetic/frac.md) ·
[\sqrt](latex/arithmetic/sqrt.md) ·
[\sqrt[n]](latex/arithmetic/sqrt-n.md) ·
[\abs](latex/arithmetic/abs.md) ·
[\lfloor](latex/arithmetic/floor.md) ·
[\lceil](latex/arithmetic/ceil.md) ·
[\pm](latex/arithmetic/pm.md) ·
[\mod](latex/arithmetic/mod.md) ·
[\binom](latex/arithmetic/binom.md)

### Тригонометрия
[\sin](latex/trig/sin.md) ·
[\cos](latex/trig/cos.md) ·
[\tan / \tg](latex/trig/tan.md) ·
[\cot / \ctg](latex/trig/cot.md) ·
[\arcsin](latex/trig/arcsin.md) ·
[\arccos](latex/trig/arccos.md) ·
[\arctan / \arctg](latex/trig/arctan.md) ·
[\arccot / \arcctg](latex/trig/arccot.md) ·
[\sinh / \sh](latex/trig/sinh.md) ·
[\cosh / \ch](latex/trig/cosh.md) ·
[\tanh / \th](latex/trig/tanh.md) ·
[\coth / \cth](latex/trig/coth.md)

### Логарифмы
[\ln](latex/exp-log/ln.md) ·
[\lg](latex/exp-log/lg.md) ·
[\log_b](latex/exp-log/log-base.md)

### Суммы и произведения
[\sum по диапазону](latex/sums/sum-range.md) ·
[\sum по массиву](latex/sums/sum-array.md) ·
[\prod по диапазону](latex/sums/prod-range.md) ·
[\prod по массиву](latex/sums/prod-array.md)

### Математический анализ
[\int](latex/calculus/integral.md) ·
[\lim](latex/calculus/limit.md) ·
[\frac{d}{dx}](latex/calculus/derivative.md)

### Матрицы
[\cdot](latex/matrix/cdot.md) ·
[\times](latex/matrix/times.md) ·
[\det](latex/matrix/det.md) ·
[\top](latex/matrix/transpose.md) ·
[^{-1}](latex/matrix/inv.md)

### Кусочные функции
[\begin{cases}](latex/cases.md)

### Греческие буквы
[строчные](latex/greek/lowercase.md) ·
[прописные](latex/greek/uppercase.md)

### Множества
[\in](latex/sets/in.md) ·
[\notin](latex/sets/notin.md) ·
[\mathbb{N}](latex/sets/naturals.md) ·
[\mathbb{Z}](latex/sets/integers.md) ·
[\mathbb{R}](latex/sets/reals.md) ·
[\mathbb{C}](latex/sets/complex.md)

### Операторы сравнения
[\neq](latex/comparison/neq.md) ·
[\leq](latex/comparison/leq.md) ·
[\geq](latex/comparison/geq.md) ·
[\lvert](latex/comparison/lvert.md)

### Константы
[\pi](latex/constants/pi.md) ·
[\tau](latex/constants/tau.md) ·
[\phi](latex/constants/phi.md) ·
[\infty](latex/constants/infty.md)

---

## Интеграция

### C / C++
- [Подключение заголовка](integration/c/include.md)
- [Компиляция](integration/c/compile.md)
- [Передача массивов](integration/c/arrays.md)
- [Shared library](integration/c/shared.md)

### Python
- [Загрузка библиотеки](integration/python/load.md)
- [Скалярные функции](integration/python/scalars.md)
- [Передача массивов](integration/python/arrays.md)
- [Множественный возврат](integration/python/multireturn.md)

### JavaScript / WebAssembly
- [Сборка через emcc](integration/js/emcc.md)
- [Module.cwrap](integration/js/cwrap.md)
- [Работа с wasm heap](integration/js/heap.md)
- [CJS vs ESM, package.json](integration/js/module.md)
