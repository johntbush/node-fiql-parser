'use strict';

const parser = require('../src');
const sql = require('../src');

describe('to sql', function () {

  const parse = parser.parse;
  it.only('eq operator test', () => {
    const ast = parse('a=eq=b');
    const result = sql.toSql('table', ast)
    result.should.eql("table.a = b")
  });
  it.only('== operator test', () => {
    const ast = parse('a==b');
    const result = sql.toSql('table', ast)
    result.should.eql("table.a = b")
  });
  it.only('!= operator test', () => {
    const ast = parse('a!=b');
    const result = sql.toSql('table', ast)
    result.should.eql("table.a != b")
  });
  it.only('=gt= operator test', () => {
    const ast = parse('a=gt=b');
    const result = sql.toSql('table', ast)
    result.should.eql("table.a > b")
  });
  it.only('=ge= operator test', () => {
    const ast = parse('a=ge=b');
    const result = sql.toSql('table', ast)
    result.should.eql("table.a >= b")
  });

  it.only('basic AND test', () => {
    const ast = parse('a=eq=b;c!=d');
    const result = sql.toSql('table', ast)
    result.should.eql("(table.a = b AND table.c != d)")
  });
  it.only('basic OR test', () => {
    const ast = parse('a=eq=b,c!=d');
    const result = sql.toSql('table', ast)
    result.should.eql("(table.a = b OR table.c != d)")
  });
  it.only('nested combination test', () => {
    const ast = parse('t=eq=q;(a=eq=b,c!=d)');
    const result = sql.toSql('table', ast)
    result.should.eql("(table.t = q AND (table.a = b OR table.c != d))")
  });
  it.only('IN test', () => {
    const ast = parse('field=op=(item0,item1,item2)');
    const result = sql.toSql('table', ast)
    result.should.eql("table.field IN ('item0','item1','item2')")
  });

});