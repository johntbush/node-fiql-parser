'use strict';

const parser = require('./parser');
const constants = require('./constants');

const handeEq = (name, value) => {
  return `${name} = ${value}`
};

const handeNotEq = (name, value) => {
  return `${name} != ${value}`
};

const handleAnd = (selectors, lhs, rhs) => {
  return "(" + toSql(selectors, lhs) + " AND " + toSql(selectors, rhs) + ")"
};

const handleOr = (selectors, lhs, rhs) => {
  return "(" + toSql(selectors, lhs) + " OR " + toSql(selectors, rhs) + ")"
};

const handleLt = (name, value) => {
  return `${name} < ${value}`
};

const handleLte = (name, value) => {
  return `${name} <= ${value}`
};

const handleGt = (name, value) => {
  return `${name} > ${value}`
};

const handleGte = (name, value) => {
  return `${name} >= ${value}`
};

const quoteValue = (value) => {
  return (isNaN(Number(value))) ? "'" + value + "'" : Number(value);
};

const handleOp = (name, format, value) => {
  value.unshift('');
  const inStr = value.reduce( (acc,item) => {
    const out = format(item);
    if (acc === '') {
      return out
    } else {
      return acc + "," + out
    }
  });
  return `${name} IN (${inStr})`
};

const validateAst = (ast, selectorMap) => {
  return selectors(ast).map(selector => {
        if (selectorMap.get(selector) == null)
            throw new Error(`${selector} is not a valid selector alias`)
      })
};

const validate = (q, selectors) => {
  return validateAst(parser.parse(q), selectors)
};

const selectors = (ast, acc) => {
  if (acc == null) acc = [];
  if (ast == null) return acc;
  if (ast.type === constants.NODE_TYPE.CONSTRAINT) {
    acc.push(ast.selector)
    return acc
  } else if (ast.type === constants.NODE_TYPE.COMBINATION) {
      acc = (selectors(ast.rhs, acc));
      acc = (selectors(ast.lhs, acc));
      return acc
  }
  return acc
};

const parseToSql = (q, selectors) => {
  return toSql(selectors, parser.parse(q));
};

const toSql = (selectors, ast) => {
  validateAst(ast, selectors)
  if (ast.type === constants.NODE_TYPE.CONSTRAINT) {
    const selector = selectors.get(ast.selector)
    const name = selector.alias
    switch (ast.comparison) {
      case "=eq=":
        return handeEq(name, selector.format(ast.argument));
        break;
      case "==":
        return handeEq(name, selector.format(ast.argument));
        break;
      case "!=":
        return handeNotEq(name, selector.format(ast.argument));
        break;
      case "=ne=":
        return handeNotEq(name, selector.format(ast.argument));
        break;
      case "=op=":
        return handleOp(name, selector.format, ast.argument);
        break;
      case '=lt=':
        return handleLt(name, selector.format(ast.argument));
        break;
      case '=le=':
        return handleLte(name, selector.format(ast.argument));
        break;
      case '=gt=':
        return handleGt(name, selector.format(ast.argument));
        break;
      case '=ge=':
        return handleGte(name, selector.format(ast.argument));
        break;
      default:
        throw new Error("unsupported operator")
    }
  }
  if (ast.type === constants.NODE_TYPE.COMBINATION) {
    switch (ast.operator) {
      case constants.OPERATOR.AND:
        return handleAnd(selectors, ast.lhs, ast.rhs);
        break;
      case constants.OPERATOR.OR:
        return handleOr(selectors, ast.lhs, ast.rhs);
        break;
      default:
        throw new Error("unsupported operator")
    }
  }
};

class Selectors {
    constructor(defaultFormat = quoteValue, selectors = {}) {
        this.defaultFormat = defaultFormat;
        this.selectors = selectors
    }
    add(name, alias, format) {
        if (format == null)
            format = this.defaultFormat
        this.selectors[name] = {alias: alias, format: format}
    }
    get(name) {
        console.log(`getSelector(${name})`)
        if (this.selectors[name] == null)
            return undefined
        return this.selectors[name]
    }
}

module.exports = {
  toSql: toSql,
  selectors: selectors,
  validateAst: validateAst,
  validate: validate,
  parseToSql: parseToSql,
  Selectors: Selectors
};
