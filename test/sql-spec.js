'use strict';

const parser = require('../src');
const sql = require('../src');

describe('to sql', function () {

  const parse = parser.parse;
  it('eq operator test', () => {
    const ast = parse('a=eq=b');
    const result = sql.toSql({"a":"table.a"}, ast)
    result.should.eql("table.a = b")
  });
  it('== operator test', () => {
    const ast = parse('a==b');
    const result = sql.toSql({"a":"table.a"}, ast)
    result.should.eql("table.a = b")
  });
  it('!= operator test', () => {
    const ast = parse('a!=b');
    const result = sql.toSql({"a":"table.a"}, ast)
    result.should.eql("table.a != b")
  });
  it('=gt= operator test', () => {
    const ast = parse('a=gt=b');
    const result = sql.toSql({"a":"table.a"}, ast)
    result.should.eql("table.a > b")
  });
  it('=ge= operator test', () => {
    const ast = parse('a=ge=b');
    const result = sql.toSql({"a":"table.a"}, ast)
    result.should.eql("table.a >= b")
  });

  it('basic AND test', () => {
    const ast = parse('a=eq=b;c!=d');
    const result = sql.toSql({"a":"table.a","c":"table.c"}, ast)
    result.should.eql("(table.a = b AND table.c != d)")
  });
  it('basic OR test', () => {
    const ast = parse('a=eq=b,c!=d');
    const result = sql.toSql({"a":"table.a","c":"table.c"}, ast)
    result.should.eql("(table.a = b OR table.c != d)")
  });
  it('nested combination test', () => {
    const ast = parse('t=eq=q;(a=eq=b,c!=d)');
    const result = sql.toSql({"a":"table.a","c":"table.c","t":"table.t"}, ast)
    result.should.eql("(table.t = q AND (table.a = b OR table.c != d))")
  });
  it('IN test', () => {
    const ast = parse('field=op=(item0,item1,item2)');
    const result = sql.toSql({"field":"table.field"}, ast)
    result.should.eql("table.field IN ('item0','item1','item2')")
  });
  it('test tablenames', () => {
    const ast = parse('a.b.c=eq=b;a==1,t.t.t=eq=1,werwerr.er=op=(1,2,3);a==1');
    const result = sql.selectors(ast);
    result.should.eql(["a","werwerr.er","t.t.t","a","a.b.c"])
  });
  it('test validate', () => {
    const ast = parse('a.b.c=eq=b;a==1,t.t.t=eq=1,w.r=op=(1,2,3);a==1');
    const selectorMap = {
        "a" :"bills.status",
        "a.b.c":"user.comment.date",
        "t.t.t":"totally.taking.time",
        "w.r":"where.are",
        "a":"advice"
    }
    sql.validate(ast, selectorMap);
  });

});