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

class Tables {
  constructor(table, children = {}) {
    this._root = table;
    this.children = children;
  }

  get root() {
    return this._root;
  }

  tableName(alias) {
    return children[alias];
  }

  addChild(alias, table) {
    this.children[alias] = table
  }

  isValid(alias) {
    return this.children[alias] != null;
  }
}

const validate = (ast, tables) => {
  return tableNames(ast)
      .map(table => {
        if (!tables.isValid(table))
            throw new Error(`${table} is not a valid table alias`)
      })
};

const tableNames = (ast, acc) => {
  if (acc == null) acc = [];
  if (ast == null) return acc;
  if (ast.type === constants.NODE_TYPE.CONSTRAINT) {
    acc.push(ast.selector)
    return acc
  } else if (ast.type === constants.NODE_TYPE.COMBINATION) {
      acc = (tableNames(ast.rhs, acc));
      acc = (tableNames(ast.lhs, acc));
      return acc
  }
  return acc
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
  toSql: toSql,
  tableNames: tableNames,
  validate: validate,
  Tables: Tables
};
