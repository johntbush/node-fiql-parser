'use strict';

const parser = require('./parser');
const constants = require('./constants');

const handeEq = (table, name, value) => {
  return `${table}.${name} = ${value}`
};

const handeNotEq = (table, name, value) => {
  return `${table}.${name} != ${value}`
};

const handleAnd = (table, lhs, rhs) => {
  return "(" + toSql(table, lhs) + " AND " + toSql(table, rhs) + ")"
};

const handleOr = (table, lhs, rhs) => {
  return "(" + toSql(table, lhs) + " OR " + toSql(table, rhs) + ")"
};

const handleLt = (table,name, value) => {
  return `${table}.${name} < ${value}`
};

const handleLte = (table,name, value) => {
  return `${table}.${name} <= ${value}`
};

const handleGt = (table,name, value) => {
  return `${table}.${name} > ${value}`
};

const handleGte = (table,name, value) => {
  return `${table}.${name} >= ${value}`
};

const handleOp = (table, name, value) => {
  value.unshift('');
  const inStr = value.reduce( (acc,item) => {
    const out = (typeof item === 'string') ? "'" + item + "'" : item;
    if (acc === '') {
      return out
    } else {
      return acc + "," + out
    }
  });
  return `${table}.${name} IN (${inStr})`
};


const toSql = (table, ast) => {
  if (ast.type === constants.NODE_TYPE.CONSTRAINT) {
    switch (ast.comparison) {
      case "=eq=":
        return handeEq(table, ast.selector, ast.argument);
        break;
      case "==":
        return handeEq(table, ast.selector, ast.argument);
        break;
      case "!=":
        return handeNotEq(table, ast.selector, ast.argument);
        break;
      case "=ne=":
        return handeNotEq(table, ast.selector, ast.argument);
        break;
      case "=op=":
        return handleOp(table, ast.selector, ast.argument);
        break;
      case '=lt=':
        return handleLt(table, ast.selector, ast.argument);
        break;
      case '=le=':
        return handleLte(table, ast.selector, ast.argument);
        break;
      case '=gt=':
        return handleGt(table, ast.selector, ast.argument);
        break;
      case '=ge=':
        return handleGte(table, ast.selector, ast.argument);
        break;
      default:
        throw new Error("unsupported operator")
    }
  }
  if (ast.type === constants.NODE_TYPE.COMBINATION) {
    switch (ast.operator) {
      case constants.OPERATOR.AND:
        return handleAnd(table, ast.lhs, ast.rhs);
        break;
      case constants.OPERATOR.OR:
        return handleOr(table, ast.lhs, ast.rhs);
        break;
      default:
        throw new Error("unsupported operator")
    }
  }
};

module.exports = {
  toSql: toSql
};
