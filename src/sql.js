'use strict';

const parser = require('./parser');
const constants = require('./constants');

const handeEq = (selectors, name, value) => {
  return `${selectors[name]} = ${value}`
};

const handeNotEq = (selectors, name, value) => {
  return `${selectors[name]} != ${value}`
};

const handleAnd = (selectors, lhs, rhs) => {
  return "(" + toSql(selectors, lhs) + " AND " + toSql(selectors, rhs) + ")"
};

const handleOr = (selectors, lhs, rhs) => {
  return "(" + toSql(selectors, lhs) + " OR " + toSql(selectors, rhs) + ")"
};

const handleLt = (selectors,name, value) => {
  return `${selectors[name]} < ${value}`
};

const handleLte = (selectors,name, value) => {
  return `${selectors[name]} <= ${value}`
};

const handleGt = (selectors,name, value) => {
  return `${selectors[name]} > ${value}`
};

const handleGte = (selectors,name, value) => {
  return `${selectors[name]} >= ${value}`
};

const handleOp = (selectors, name, value) => {
  value.unshift('');
  const inStr = value.reduce( (acc,item) => {
    const out = (typeof item === 'string') ? "'" + item + "'" : item;
    if (acc === '') {
      return out
    } else {
      return acc + "," + out
    }
  });
  return `${selectors[name]} IN (${inStr})`
};

const validateAst = (ast, selectorMap) => {
  return selectors(ast).map(selector => {
        if (!selectorMap.hasOwnProperty(selector))
            throw new Error(`${selector} is not a valid selector alias`)
      })
};

const validate = (q, selectorMap) => {
  return validateAst(parser.parse(q), selectorMap)
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
  if (ast.type === constants.NODE_TYPE.CONSTRAINT) {
    switch (ast.comparison) {
      case "=eq=":
        return handeEq(selectors, ast.selector, ast.argument);
        break;
      case "==":
        return handeEq(selectors, ast.selector, ast.argument);
        break;
      case "!=":
        return handeNotEq(selectors, ast.selector, ast.argument);
        break;
      case "=ne=":
        return handeNotEq(selectors, ast.selector, ast.argument);
        break;
      case "=op=":
        return handleOp(selectors, ast.selector, ast.argument);
        break;
      case '=lt=':
        return handleLt(selectors, ast.selector, ast.argument);
        break;
      case '=le=':
        return handleLte(selectors, ast.selector, ast.argument);
        break;
      case '=gt=':
        return handleGt(selectors, ast.selector, ast.argument);
        break;
      case '=ge=':
        return handleGte(selectors, ast.selector, ast.argument);
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

module.exports = {
  toSql: toSql,
  selectors: selectors,
  validateAst: validateAst,
  validate: validate,
  parseToSql: parseToSql
};
