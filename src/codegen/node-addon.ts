import type { File, FuncDef, Param, McType, Expr } from '../ast/nodes.js';
import type { CgenPrecision } from './codegen.js';

// ── Type helpers ──────────────────────────────────────────────────────────────

function isArray(ty: McType | undefined): boolean {
  return ty?.kind === 'NumType' && (ty.dims ?? 0) === 1;
}

function isMatrix(ty: McType | undefined): boolean {
  return ty?.kind === 'NumType' && (ty.dims ?? 0) >= 2;
}

function isInt(ty: McType | undefined): boolean {
  return ty?.kind === 'IntType';
}

// Number of JS arguments a parameter occupies
function jsArgCount(p: Param): number {
  if (isMatrix(p.type)) return 3; // flat TypedArray, rows, cols
  return 1;
}

function totalArgc(params: Param[]): number {
  return params.reduce((s, p) => s + jsArgCount(p), 0);
}

// ── Return type analysis ──────────────────────────────────────────────────────

const ARRAY_RETURNING_FNS = new Set(['cross', 'transpose', 'inv', 'I', 'zeros', 'ones']);

function lastExpr(node: FuncDef): Expr | null {
  const last = node.body[node.body.length - 1];
  return last?.kind === 'ExprStmt' ? last.expr : null;
}

function returnsArray(node: FuncDef): boolean {
  const e = lastExpr(node);
  if (!e) return false;
  switch (e.kind) {
    case 'MatrixSlice':
    case 'SliceExpr':
    case 'PmExpr':
    case 'ArrayLit':
      return true;
    case 'FuncCallExpr':
      return ARRAY_RETURNING_FNS.has(e.name);
    default:
      return false;
  }
}

// Returns static array size if determinable at compile time, else null (needs extra param)
function staticReturnSize(node: FuncDef): number | null {
  const e = lastExpr(node);
  if (!e) return null;
  switch (e.kind) {
    case 'PmExpr':       return 2;
    case 'ArrayLit':     return e.elements.length;
    case 'FuncCallExpr': return e.name === 'cross' ? 3 : null;
    default:             return null;
  }
}

// ── Public function list ──────────────────────────────────────────────────────

type FuncVariant = {
  cName: string;   // C function name
  jsName: string;  // exported JS property name
  params: Param[];
  returnsArr: boolean;
  staticSize: number | null;
};

function collectVariants(ast: File): FuncVariant[] {
  const variants: FuncVariant[] = [];

  for (const node of ast.body) {
    if (node.kind !== 'FuncDef') continue;
    if (node.name.startsWith('_')) continue;

    const base = node.name;
    const arr = returnsArray(node);
    const sz = arr ? staticReturnSize(node) : null;
    const hasDefaults = node.params.some(p => p.default !== undefined);

    if (!hasDefaults) {
      variants.push({ cName: base, jsName: base, params: node.params, returnsArr: arr, staticSize: sz });
    } else {
      const reqCount = node.params.findIndex(p => p.default !== undefined);
      const defaultCount = node.params.length - reqCount;

      // _impl — all params explicit
      variants.push({
        cName: `_${base}_impl`, jsName: `${base}_impl`,
        params: node.params, returnsArr: arr, staticSize: sz,
      });

      // _d1 … _dN wrappers
      for (let d = 1; d <= defaultCount; d++) {
        const provided = node.params.length - d;
        variants.push({
          cName: `_${base}_d${d}`, jsName: d === defaultCount ? base : `${base}_d${d}`,
          params: node.params.slice(0, provided), returnsArr: arr, staticSize: sz,
        });
      }
    }
  }

  return variants;
}

// ── N-API C wrapper generator ─────────────────────────────────────────────────

function genParamExtract(params: Param[], outLines: string[]): void {
  let argIdx = 0;
  for (const p of params) {
    const n = p.name;
    if (isMatrix(p.type)) {
      outLines.push(`  size_t _${n}_cnt; void* _${n}_ptr;`);
      outLines.push(`  napi_get_typedarray_info(env, argv[${argIdx}], NULL, &_${n}_cnt, &_${n}_ptr, NULL, NULL);`);
      outLines.push(`  mc_num* ${n} = (mc_num*)_${n}_ptr;`);
      argIdx++;
      outLines.push(`  double _${n}_r; napi_get_value_double(env, argv[${argIdx}], &_${n}_r);`);
      outLines.push(`  int ${n}_rows = (int)_${n}_r;`);
      argIdx++;
      outLines.push(`  double _${n}_c; napi_get_value_double(env, argv[${argIdx}], &_${n}_c);`);
      outLines.push(`  int ${n}_cols = (int)_${n}_c;`);
      argIdx++;
    } else if (isArray(p.type)) {
      outLines.push(`  size_t _${n}_cnt; void* _${n}_ptr;`);
      outLines.push(`  napi_get_typedarray_info(env, argv[${argIdx}], NULL, &_${n}_cnt, &_${n}_ptr, NULL, NULL);`);
      outLines.push(`  mc_num* ${n} = (mc_num*)_${n}_ptr;`);
      outLines.push(`  int ${n}_len = (int)_${n}_cnt;`);
      argIdx++;
    } else if (isInt(p.type)) {
      outLines.push(`  double _${n}_d; napi_get_value_double(env, argv[${argIdx}], &_${n}_d);`);
      outLines.push(`  int ${n} = (int)_${n}_d;`);
      argIdx++;
    } else {
      outLines.push(`  double _${n}_d; napi_get_value_double(env, argv[${argIdx}], &_${n}_d);`);
      outLines.push(`  mc_num ${n} = (mc_num)_${n}_d;`);
      argIdx++;
    }
  }
}

function genCallArgs(params: Param[]): string {
  return params.map(p => {
    if (isMatrix(p.type))  return `${p.name}, ${p.name}_rows, ${p.name}_cols`;
    if (isArray(p.type))   return `${p.name}, ${p.name}_len`;
    return p.name;
  }).join(', ');
}

function genWrapperFn(v: FuncVariant): string {
  const argc = v.staticSize === null && v.returnsArr
    ? totalArgc(v.params) + 1
    : totalArgc(v.params);

  const lines: string[] = [];
  const wrapName = `_js_${v.jsName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  lines.push(`static napi_value ${wrapName}(napi_env env, napi_callback_info info) {`);
  lines.push(`  size_t argc = ${argc};`);

  if (argc > 0) {
    lines.push(`  napi_value argv[${argc}];`);
    lines.push(`  napi_get_cb_info(env, info, &argc, argv, NULL, NULL);`);
  } else {
    lines.push(`  napi_get_cb_info(env, info, &argc, NULL, NULL, NULL);`);
  }

  const paramLines: string[] = [];
  genParamExtract(v.params, paramLines);
  lines.push(...paramLines);

  const callArgs = genCallArgs(v.params);

  if (v.returnsArr) {
    if (v.staticSize !== null) {
      // Known static size
      lines.push(`  mc_num* _rp = ${v.cName}(${callArgs});`);
      lines.push(`  napi_value _buf, _ret;`);
      lines.push(`  void* _bd;`);
      lines.push(`  napi_create_arraybuffer(env, ${v.staticSize} * sizeof(double), &_bd, &_buf);`);
      lines.push(`  for (int _i = 0; _i < ${v.staticSize}; _i++) ((double*)_bd)[_i] = (double)_rp[_i];`);
      lines.push(`  napi_create_typedarray(env, napi_float64_array, ${v.staticSize}, _buf, 0, &_ret);`);
    } else {
      // Dynamic: extra outSize param
      const sizeArgIdx = argc - 1;
      lines.push(`  double _sz_d; napi_get_value_double(env, argv[${sizeArgIdx}], &_sz_d);`);
      lines.push(`  int _sz = (int)_sz_d;`);
      lines.push(`  mc_num* _rp = ${v.cName}(${callArgs});`);
      lines.push(`  napi_value _buf, _ret;`);
      lines.push(`  void* _bd;`);
      lines.push(`  napi_create_arraybuffer(env, (size_t)_sz * sizeof(double), &_bd, &_buf);`);
      lines.push(`  for (int _i = 0; _i < _sz; _i++) ((double*)_bd)[_i] = (double)_rp[_i];`);
      lines.push(`  napi_create_typedarray(env, napi_float64_array, (size_t)_sz, _buf, 0, &_ret);`);
    }
  } else {
    lines.push(`  mc_num _r = ${v.cName}(${callArgs});`);
    lines.push(`  napi_value _ret;`);
    lines.push(`  napi_create_double(env, (double)_r, &_ret);`);
  }

  lines.push(`  return _ret;`);
  lines.push(`}`);
  return lines.join('\n');
}

export function generateNapiC(ast: File, baseName: string, _precision: CgenPrecision = 'f64'): string {
  const variants = collectVariants(ast);
  const parts: string[] = [];

  parts.push(`/* Auto-generated by mclang — do not edit */`);
  parts.push(`#include <node_api.h>`);
  parts.push(`#include <string.h>`);
  parts.push(`#include "${baseName}.h"`);
  parts.push('');

  for (const v of variants) {
    parts.push(genWrapperFn(v));
    parts.push('');
  }

  // Init
  parts.push(`static napi_value _Init(napi_env env, napi_value exports) {`);
  parts.push(`  napi_value _fn;`);
  for (const v of variants) {
    const wrapName = `_js_${v.jsName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    parts.push(`  napi_create_function(env, NULL, 0, ${wrapName}, NULL, &_fn);`);
    parts.push(`  napi_set_named_property(env, exports, "${v.jsName}", _fn);`);
  }
  parts.push(`  return exports;`);
  parts.push(`}`);
  parts.push('');
  parts.push(`NAPI_MODULE(NODE_GYP_MODULE_NAME, _Init)`);
  parts.push('');

  return parts.join('\n');
}

// ── binding.gyp ──────────────────────────────────────────────────────────────

export function generateBindingGyp(baseName: string): string {
  return JSON.stringify(
    {
      targets: [
        {
          target_name: baseName,
          sources: [`${baseName}.c`, `${baseName}_napi.c`],
          conditions: [["OS!='win'", { libraries: ['-lm'] }]],
        },
      ],
    },
    null, 2,
  ) + '\n';
}

// ── JS loader module ──────────────────────────────────────────────────────────

export function generateNodeBindings(ast: File, baseName: string): string {
  const variants = collectVariants(ast);
  const names = variants.map(v => v.jsName);

  // Build JSDoc comment blocks for each function
  const fnDocs = variants.map(v => {
    const paramList = v.params.map(p => {
      if (isMatrix(p.type)) return `${p.name}: Float64Array, ${p.name}_rows: number, ${p.name}_cols: number`;
      if (isArray(p.type))  return `${p.name}: Float64Array`;
      return `${p.name}: number`;
    }).join(', ');
    const extraSize = v.returnsArr && v.staticSize === null ? ', outSize: number' : '';
    const retType = v.returnsArr ? 'Float64Array' : 'number';
    return `/** @type {(${paramList}${extraSize}) => ${retType}} */\nexports.${v.jsName} = _addon.${v.jsName};`;
  }).join('\n');

  return `// Auto-generated by mclang — do not edit
'use strict';

let _addon;
try {
  _addon = require('./build/Release/${baseName}');
} catch {
  _addon = require('./build/Debug/${baseName}');
}

${fnDocs}

// Re-export all
Object.assign(exports, _addon);
`;
}
