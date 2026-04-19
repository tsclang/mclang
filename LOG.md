# MClang — Лог реализации

**Язык реализации:** TypeScript (Node.js)

## Формат записи

```
### [YYYY-MM-DD] Фаза N — Название
**Статус:** в процессе / готово
- [ ] задача
- [x] выполненная задача
**Заметки:** ...
```

---

## Фаза 0 — Инициализация проекта

### [2026-04-15] Фаза 0 — Инициализация проекта
**Статус:** готово

- [x] `npm init` + `tsconfig.json`
- [x] Зависимости: `typescript`, `ts-node`, `@types/node`
- [x] Тест-фреймворк: `vitest`
- [x] Структура папок: `src/lexer`, `src/parser`, `src/ast`, `src/codegen`, `src/math`, `src/types`, `src/cli`
- [x] CLI-точка входа: `src/cli/index.ts`
- [x] Скрипты: `build`, `test`, `dev`

**Заметки:** `"type": "module"` + `moduleResolution: NodeNext`. `npx tsc` работает через `node_modules/.bin/tsc`.

---

## Фаза 1 — Лексер

### [2026-04-15] Фаза 1 — Лексер
**Статус:** готово

- [x] Токенизация чисел (целые, дробные, `1e-9`)
- [x] Токенизация ASCII-идентификаторов
- [x] Токенизация Unicode-идентификаторов
- [x] Трансляция LaTeX-команд в токены (`\lfloor` → `⌊`, …)
- [x] Таблица синонимов trig-функций
- [x] Disambiguation `|` vs `||`
- [x] Lookahead `\sigma{` vs `\sigma`
- [x] `INDENT` / `DEDENT`
- [x] Символ `°` → токен `DEGREE`
- [x] Постфикс `!` → токен `FACTORIAL`
- [x] Пропуск комментариев `//`

**Заметки:** 45 тестов проходят. Реализован в `src/lexer/lexer.ts` + `token.ts` + `error.ts`. Форматирование ошибок в Rust-стиле через `formatDiagnostic`.

---

## Фаза 2 — Парсер и AST

### [2026-04-18] Фаза 2 — Парсер и AST
**Статус:** готово

- [x] Рекурсивный нисходящий PEG-парсер
- [x] Узлы AST: `NumberLit`, `BoolLit`, `IdentExpr`, `BinaryExpr`, `UnaryExpr`, `FuncCallExpr`
- [x] Узлы AST: `FuncDef`, `ConstDef`, `ImportDef`, `IfNode`, `ForStmt`, `WhileStmt`
- [x] Узлы AST: `WhereBlock`, `IndexExpr`, `SliceExpr`, `MemberExpr`, `ArrayLit`, `MatrixLit`
- [x] Узлы AST: `FracExpr`, `SqrtExpr`, `AbsExpr`, `NormExpr`, `FloorExpr`, `CeilExpr`
- [x] Узлы AST: `PmExpr`, `CasesExpr`, `SumExpr`, `PostfixExpr`, `ChainCmpExpr`, `IfExpr`
- [x] Объявление функций с параметрами и типами (`num[]`, `int`)
- [x] Глобальные константы
- [x] Параметры по умолчанию
- [x] `where`-блок: определения (WhereDef) + guard-и (WhereGuard)
- [x] Неявный `return` — последний ExprStmt в теле
- [x] Значимые отступы (через INDENT/DEDENT от лексера)
- [x] Обновлён `token.ts`: `Period`, `KwAnd/Or/Not/Xor/Step/Mod/Import/From/As`
- [x] Обновлён `lexer.ts`: токены `Period` (`.`), `∑`→Sum, `∏`→Prod

**Заметки:** 33 новых теста + 93 всего проходят. Критерий готовности выполнен: полный пример из раздела 22 SPEC.md парсируется без ошибок. Реализовано в `src/parser/parser.ts` + `src/ast/nodes.ts`.

---

## Фаза 3 — Базовый генератор Си

### [2026-04-18] Фаза 3 — Базовый генератор Си
**Статус:** готово

- [x] Генерация `mc_num f(mc_num x) { return ...; }`
- [x] Генерация `.h`-файла (публичные функции, include guard, `mc_num` typedef)
- [x] Макрос `mc_num` (double / float / int16_t по флагу)
- [x] Трансляция бинарных операций: `+`, `-`, `*`, `/`, `%`→`fmod`, `^`→`pow`
- [x] Трансляция сравнений → `1.0 / 0.0`, логических → `&&`, `||`
- [x] Трансляция унарных операций
- [x] Трансляция вызовов функций (таблица `FUNC_MAP` → math.h)
- [x] Трансляция inline `if`→ternary, block `if/else`
- [x] Трансляция `\begin{cases}` → вложенный тернарный
- [x] Трансляция `for..in` и `while`
- [x] Трансляция `where`-блоков (guards → `if (!cond) return NAN;`, defs → `mc_num name = ...`)
- [x] Трансляция `\frac` → деление, `\sqrt` → `sqrt()`/`pow()`
- [x] Трансляция `|x|` → `fabs()`, `\lfloor` → `floor()`, `\lceil` → `ceil()`
- [x] Трансляция `∑(i=a,b)` → `for`-цикл с аккумулятором
- [x] Трансляция `°` → `* (M_PI / 180.0)`
- [x] Трансляция цепочек сравнений → `&&`
- [x] Unicode-транслитерация идентификаторов → `__uni_name`
- [x] Встроенные константы: `π`→`M_PI`, `e`→`M_E`, `τ`, `φ`, `inf`, `nan`
- [x] Типизированные параметры `num[]` → `mc_num* v, int v_len`; `num[][]` → `mc_num* m, int m_rows, int m_cols`
- [x] Приватные функции (`_name`) не попадают в `.h`

**Заметки:** 45 новых тестов + 138 всего проходят. Реализовано в `src/codegen/codegen.ts`. Полный пример §22 генерирует корректный Си-код.

---

## Фаза 4 — Математический движок

### [2026-04-18] Фаза 4 — Математический движок
**Статус:** готово

- [x] Неявное умножение (`2x` → `2*x`, `2πr` → `2*π*r`, граница по `Newline`)
- [x] `\frac`, `\sqrt`, `\sqrt[n]` — реализованы в парсере и кодогене
- [x] Степень `x^n` → `pow(x, n)`
- [x] Trig-функции + синонимы (`arcsin` → `asin`, и т.д.)
- [x] Логарифмы: `\log_{base}{x}` → `log(x) / log(base)`, `\ln` → `log`, `\lg` → `log`
- [x] `|x|` → `fabs()`, `\lfloor` → `floor()`, `\lceil` → `ceil()`, `‖v‖` → `mc_norm()`
- [x] Встроенные константы: `π`→`M_PI`, `e`→`M_E`, `τ`, `φ`, `inf`, `nan`
- [x] Constant folding: числовые литералы, алгебраические тождества (`x+0`, `x*1`, и т.д.)
- [x] Unicode-транслитерация идентификаторов → `__uni_name`
- [x] Цепочки сравнений `0 < x < 10` → `&&`
- [x] `\sigma{v}` → `std(v)`, `\Gamma{x}` → `tgamma(x)`, `\bar{v}` → `mean(v)`
- [x] Символ `°` → `* (M_PI / 180.0)`, `\neq` → `!=`, `\leq` → `<=`, `\geq` → `>=`
- [x] AST-трансформ: `e^x` → `exp(x)`

**Заметки:** 26 новых тестов + 164 всего проходят. Реализовано в `src/math/implicit-mul.ts`, `src/math/transforms.ts`, `src/math/const-fold.ts`, `src/math/index.ts`. Критерий готовности выполнен: Гауссова функция, гравитация Ньютона, квадратное уравнение компилируются корректно.

---

## Фаза 5 — Массивы и матрицы

### [2026-04-18] Фаза 5 — Массивы и матрицы
**Статус:** готово

- [x] Типы `num[]`, `num[][]` → `mc_num*` + `_len` / `_rows` / `_cols`
- [x] Неявные параметры `_len`, `_rows`, `_cols` в подписи функции
- [x] `.length` → `_len`, `.rows` → `_rows`, `.cols` → `_cols`
- [x] Литерал `[a, b, c]` → C99 compound literal `(mc_num[]){a, b, c}`
- [x] Литерал `[[...], [...]]` → flat compound literal row-major
- [x] Индексация `v[i]` → `v[(int)(i)]`
- [x] 2D-индексация `m[i][j]` → `m[(int)(i)*m_cols+(int)(j)]` (с TypeEnv)
- [x] Срез `v[a..b]` → `v + (int)(a)` (pointer offset)
- [x] Dispatch `⋅` по типу: `num[]` → `mc_dot(v,w,len)`, scalar → `*`
- [x] Произведение `⨯` → `mc_cross()` runtime helper
- [x] `norm(v)` / `‖v‖` → `mc_norm(v, v_len)`
- [x] Матричное умножение A⋅B → `mc_matmul()` helper (заготовка)
- [x] `\pm expr` → `(mc_num[]){+(x), -(x)}`
- [x] TypeEnv: трекинг типов параметров внутри функции
- [x] Runtime helpers: `mc_dot`, `mc_cross`, `mc_matmul` — inline в .c

**Заметки:** 17 новых тестов + 181 всего проходят. Реализовано в `src/codegen/codegen.ts`. Критерий: dot product, vector norm, 2D-индексация матриц компилируются корректно.

---

## Фаза 6 — Агрегаторы

### [2026-04-18] Фаза 6 — Агрегаторы и специальные операторы
**Статус:** готово

- [x] `\sum`, `\prod` по диапазону — генерируют `for`-цикл с аккумулятором
- [x] `\sum_{x \in v}`, `\prod_{x \in v}` — итерация по массиву (SumExpr iterKind='array')
- [x] `\min_{i=a}^{b}`, `\max_{i=a}^{b}` — min/max по диапазону
- [x] `sum(v)`, `product(v)`, `mean(v)`, `std(v)` — dispatch для typed array param → mc_*
- [x] `min(a,b)` → `fmin`, `min(v)` → `mc_min_arr(v, v_len)` (dispatch по числу аргументов и типу)
- [x] `max(a,b)` → `fmax`, `max(v)` → `mc_max_arr(v, v_len)`
- [x] `n!` → `mc_factorial()` — lookup-таблица до 20
- [x] `\binom{n}{k}` → `mc_binom(n, k)` — итеративный алгоритм
- [x] `\gcd{a}{b}` → `mc_gcd(a, b)` — алгоритм Евклида
- [x] `\lcm{a}{b}` → `mc_lcm(a, b)` — через gcd
- [x] `sgn(x)` → `mc_sgn(x)`; `erf(x)` → `erf(x)`; `\Gamma{x}` → `tgamma(x)`
- [x] Все runtime helpers — `static inline` в начале `.c` файла (DCE-дружественные)
- [x] Парсер: `\binom{n}{k}`, `\gcd{a}{b}`, `\lcm{a}{b}` — two-brace form

**Заметки:** 27 новых тестов + 208 всего проходят. Критерий: факториал, биномиальный коэффициент, статистика массива компилируются корректно.

---

## Фаза 7 — Численные методы

### [2026-04-18] Фаза 7 — Численные методы
**Статус:** готово

- [x] `\lim_{x \to a} expr` → вычисление в `a + 1e-9`; `\lim_{x \to ∞}` → `x = 1e15`
- [x] `\frac{d}{dx} expr` → конечные разности `(f(x+h) - f(x)) / 1e-7` через `varOverride`
- [x] `\int{lo}{hi} expr dx` → метод Симпсона (N=1000 шагов, h/3 масштаб)
- [x] `\int{lo}{hi}{var} body` — трёх-скобочная форма с явным именем переменной
- [x] `solve(x, lo, hi) { expr }` → бисекция (100 итераций, точность `1e-9`)
- [x] `is_nan(x)` → `isnan(x)`, `is_inf(x)` → `isinf(x)`, `is_finite(x)` → `isfinite(x)`
- [x] `atan2`, `hypot` добавлены в FUNC_MAP
- [x] AST-ноды: `LimExpr`, `DerivExpr`, `IntegralExpr`, `SolveExpr`
- [x] `varOverride` в кодогене для подстановки переменных при генерации кода
- [x] Парсер: `\infty` (как `∞` identifier) распознаётся в lim как `toInf=true`

**Заметки:** 24 новых теста + 232 всего проходят. Критерий: интеграл sin(x) от 0 до π, производная x² (≈6 в точке 3), solve x²-2=0 (≈√2) — все компилируются корректно.

---

## Фаза 8 — Таблицы

### [2026-04-18] Фаза 8 — Таблицы
**Статус:** готово

- [x] Синтаксис `table { key -> value, ... }` — числовые и строковые ключи
- [x] Числовые таблицы → `static const mc_num _name_xs[]`, `_name_ys[]`, `_name_n`
- [x] Строковые таблицы → функция со цепочкой `strcmp`, возвращает `NAN` при отсутствии ключа
- [x] Вызов числовой таблицы `t(x)` → `mc_interp(x, _t_xs, _t_ys, _t_n)` (линейная интерполяция)
- [x] Вызов строковой таблицы `t("key")` → прямой вызов сгенерированной функции
- [x] `mc_interp` — `static inline` runtime helper (clamp + линейная интерполяция)
- [x] `#include <string.h>` добавлен в заголовок
- [x] `StringLitExpr` в лексере (`"..."`, `'...'`) и кодогене → `"value"` в Си
- [x] Парсер: `parseTable()` — парсит `table { ... }` как первичное выражение
- [x] `TableExpr` / `StringLitExpr` — рекурсия в `transforms.ts`

**Заметки:** 13 новых тестов + 245 всего проходят. Реализовано в `src/lexer/lexer.ts` (исправлен `scanString`), `src/parser/parser.ts` (`parseTable`), `src/codegen/codegen.ts` (`genTableDef`, `mc_interp`).

---

## Фаза 9 — Таргеты

### [2026-04-18] Фаза 9 — Таргеты и сборка
**Статус:** готово

- [x] `CgenOptions` — `{ target, precision }` в `generateC(ast, opts?)`
- [x] `--precision f64` — дефолт, без дефайнов
- [x] `--precision f32` → `#define MC_USE_FAST_FLOAT` в `.c` и `.h`
- [x] `--precision fixed` → `#define MC_USE_8BIT` в `.c` и `.h`
- [x] `--target c` — финальная полировка `.c` + `.h`
- [x] `--target wasm` → `#include <emscripten.h>` + `EMSCRIPTEN_KEEPALIVE` перед публичными функциями
- [x] `--target shared` → `.c` + `.h` + Python ctypes-stub `_loader.py`
- [x] Физические константы: `G`, `c`, `h`, `k_B`, `N_A`, `R` — встроены в `BUILTIN_CONSTS`
- [x] CLI (`src/cli/index.ts`) полностью реализован: чтение `.mc`, парсинг, кодоген, запись файлов
- [x] CLI флаги: `--target`, `--precision`, `--out`, `--tokens`, `--explain`, `--no-color`

**Заметки:** 17 новых тестов + 262 всего проходят. CLI записывает `basename.c` + `basename.h` рядом с источником (или в `--out`). Shared-таргет дополнительно генерирует Python ctypes-заглушку.

---

## MVP — остаток (не вошло в фазы 1–9)

**Статус:** не начато

Пункты из MVP.md, заявленные как часть MVP, но ещё не реализованные.

### [2026-04-19] MVP — остаток
**Статус:** готово

#### Синтаксис

- [x] `num[N]` — параметр статического размера: нет неявных `_len`/`_rows`/`_cols`, `.length` → константа
- [x] `num[N][M]` — 2D: `m[i][j]` → `m[i*N+j]` со статической шириной
- [ ] Продолжение строки через открытую скобку / завершающий оператор (ASI) — отложено

#### Операторы

- [x] `<>` — алиас `!=` (лексер, два символа)
- [x] `∧` → `&&`, `∨` → `||`, `⊕` → `xor`, `¬` → `!` (Unicode в `scanUnicode`)
- [x] `x in [a, b]` → `x >= a && x <= b` (закрытый диапазон)
- [x] `x in (a, b)` → `x > a && x < b` (открытый диапазон)
- [x] `x !in [a, b]` → `!(x >= a && x <= b)` (токен `BangIn`)
- [x] `.*` — Hadamard-произведение как оператор (токен `DotStar`)

#### Векторы и матрицы

- [x] `a + b`, `a - b` для `num[]` параметров → `mc_add_arr` / `mc_sub_arr`
- [x] `a .* b` → `mc_mul_arr` (поэлементное)
- [x] `scalar * array` → `mc_scale`
- [x] `transpose(m)` → `mc_transpose` runtime helper
- [x] `det(m)` → `mc_det` (1×1, 2×2, 3×3)
- [x] `inv(m)` → `mc_inv` (3×3 через аналитическую формулу)
- [x] `I(n)` → `mc_identity`, `zeros(r,c)` → `mc_zeros`, `ones(r,c)` → `mc_ones`

**Заметки:** 48 новых тестов + 310 всего проходят. Изменения в `lexer.ts` (DotStar, BangIn, `∧∨⊕¬`, `<>`), `token.ts`, `parser.ts` (`parseRangeMembership`, `DotStar` в `isMulOp`), `codegen.ts` (genElemWise, genFuncCall матричные функции, staticSize в buildParamList/genIndex/genMember).

---

## ASI — продолжение строки

### [2026-04-19] ASI — продолжение строки
**Статус:** готово

- [x] Внутри открытых скобок `(`, `[`, `{` — NEWLINE не эмитируется (track `parenDepth`)
- [x] После завершающего оператора (`+`, `-`, `*`, `/`, `==`, `!=`, …) — NEWLINE не эмитируется (через VALUE_TOKENS)
- [x] Тесты: 14 тестов — многострочные вызовы функций, многострочные выражения, вложенные скобки

**Заметки:** `parenDepth` счётчик в `Lexer`. Инкремент/декремент в `emitToken`. Проверка в `handleNewline`.

---

## Импорты

### [2026-04-19] Система импортов
**Статус:** готово

- [x] `import "./file.mc"` — полный импорт всех публичных определений
- [x] `from "./file.mc" import name [, name2]` — именованный импорт (статическая DCE)
- [x] `import "./file.mc" as alias` — алиас; функции переименуются в `alias__name`
- [x] `alias.func(x)` → `QualifiedCallExpr { ns, name, args }` (новый AST-узел)
- [x] Кодоген: `QualifiedCallExpr` → `alias__func(args)` (мангл через `__`)
- [x] Inline expansion: все импорты сливаются в один AST до кодогена
- [x] Dependency graph + топологическая сортировка (dep-before-entry)
- [x] Кэш (`included` Set): diamond-зависимость включается ровно один раз
- [x] Cycle detection: `ImportCycleError` с цепочкой цикла
- [x] `ImportNotFoundError` при отсутствии файла
- [x] Приватные функции (`_`) не импортируются
- [x] `readFile: (absPath) => string` — абстракция I/O для тестируемости без диска
- [x] Parser: `from "path" import a, b` — именованный список
- [x] Parser: `import "path"` принимает и `StringLit`, и `Identifier` как путь
- [x] POSIX-пути в резолвере (`path.posix`) — кроссплатформенность
- [x] 23 теста — все сценарии + error cases + codegen integration
- [x] SPEC.md §15.1 обновлена

**Заметки:** Реализовано в `src/import/resolver.ts`. `QualifiedCallExpr` добавлен в `ast/nodes.ts`, `parser.ts`, `codegen.ts`, `math/transforms.ts`, `types/checker.ts`. Стратегия: inline expansion — единственный правильный выбор для embedded-платформ.

---

## Типизатор

### [2026-04-19] Типизатор — базовая проверка типов
**Статус:** готово

- [x] Сбор сигнатур всех user-defined функций (первый проход, до обхода тел)
- [x] Проверка количества аргументов при вызове user-defined функции
- [x] Проверка попытки переназначить параметр функции (иммутабельность)
- [x] Обнаружение вызова неопределённой функции (с таблицей встроенных)
- [x] Взаимная и само-рекурсия не дают ошибок
- [x] `TypeError` с полем `message` и `span` (line/col)
- [x] 18 тестов — все случаи ошибок + корректный код без ошибок

**Заметки:** Реализован в `src/types/checker.ts`. Две фазы: сбор сигнатур → обход. Встроенные (`sin`, `cos`, `sqrt`, …) в `BUILTINS` Set.

---

## Рекурсия

### [2026-04-19] Рекурсия
**Статус:** готово

- [x] Самовызов — C поддерживает нативно
- [x] Взаимная рекурсия (`even/odd`) — forward-declaration всех функций до тел
- [x] `genFuncProto` — эмит `retType name(params);` до всех реализаций в `.c`
- [x] 8 тестов — факториал, Фибоначчи, even/odd, приватная рекурсия

**Заметки:** `genFile` теперь: сначала все прототипы, потом все тела. Реализовано в `src/codegen/codegen.ts`. Заголовок (`.h`) не меняется.
