'use strict';

const parser = require('../src');
const sql = require('../src');

describe('to sql', function () {

  const parse = parser.parse;
  it('eq operator test', () => {
    const ast = parse('a=eq=b');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    const result = sql.toSql(selectors, ast)
    result.should.eql("table.a = 'b'")
  });
  it('int operator test', () => {
    const ast = parse('a=eq=1');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    const result = sql.toSql(selectors, ast)
    result.should.eql("table.a = 1")
  });
  it('float operator test', () => {
    const ast = parse('a=eq=-1.123');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    const result = sql.toSql(selectors, ast)
    result.should.eql("table.a = -1.123")
  });
  it('date operator test', () => {
    const ast = parse('a=gt=2018-09-01;a=lt=2020-09-01');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    const result = sql.toSql(selectors, ast)
    result.should.eql("(table.a > '2018-09-01' AND table.a < '2020-09-01')")
  });
  it('datetime operator test with custom format function', () => {
    const ast = parse('a=gt=2018-09-01T12:14:28Z;a=lt=2020-09-01T12:14:28Z');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a", (x) => {return `'${x.split('T')[0]}'`})
    const result = sql.toSql(selectors, ast)
    result.should.eql("(table.a > '2018-09-01' AND table.a < '2020-09-01')")
  });
  it('== operator test', () => {
    const ast = parse('a==b');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    const result = sql.toSql(selectors, ast)
    result.should.eql("table.a = 'b'")
  });
  it('!= operator test', () => {
    const ast = parse('a!=b');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    const result = sql.toSql(selectors, ast)
    result.should.eql("table.a != 'b'")
  });
  it('=gt= operator test', () => {
    const ast = parse('a=gt=b');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    const result = sql.toSql(selectors, ast)
    result.should.eql("table.a > 'b'")
  });
  it('=ge= operator test', () => {
    const ast = parse('a=ge=b');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    const result = sql.toSql(selectors, ast)
    result.should.eql("table.a >= 'b'")
  });

  it('basic AND test', () => {
    const ast = parse('a=eq=b;c!=d');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    selectors.add("c", "table.c")
    const result = sql.toSql(selectors, ast)
    result.should.eql("(table.a = 'b' AND table.c != 'd')")
  });
  it('basic OR test', () => {
    const ast = parse('a=eq=b,c!=d');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    selectors.add("c", "table.c")
    const result = sql.toSql(selectors, ast)
    result.should.eql("(table.a = 'b' OR table.c != 'd')")
  });
  it('nested combination test', () => {
    const ast = parse('t=eq=q;(a=eq=b,c!=d)');
    const selectors = new sql.Selectors()
    selectors.add("a", "table.a")
    selectors.add("c", "table.c")
    selectors.add("t", "table.t")
    const result = sql.toSql(selectors, ast)
    result.should.eql("(table.t = 'q' AND (table.a = 'b' OR table.c != 'd'))")
  });
  it('IN test', () => {
    const ast = parse('field=op=(item0,item1,item2)');
    const selectors = new sql.Selectors()
    selectors.add("field", "table.field")
    const result = sql.toSql(selectors, ast)
    result.should.eql("table.field IN ('item0','item1','item2')")
  });
  it('parseToSql test', () => {
    const selectors = new sql.Selectors()
    selectors.add("field", "table.field")
    const result = sql.parseToSql('field=op=(item0,item1,item2)', selectors);
    result.should.eql("table.field IN ('item0','item1','item2')")
  });

  it('test tablenames', () => {
    const ast = parse('a.b.c=eq=b;a==1,t.t.t=eq=1,werwerr.er=op=(1,2,3);a==1');
    const result = sql.selectors(ast);
    result.should.eql(["a","werwerr.er","t.t.t","a","a.b.c"])
  });
  it('test validate', () => {
    const ast = parse('a.b.c=eq=b;a==1,t.t.t=eq=1,w.r=op=(1,2,3);a==1');
    const selectors = new sql.Selectors()
    selectors.add("a", "bills.status")
    selectors.add("a" ,"bills.status")
    selectors.add("a.b.c","user.comment.date")
    selectors.add("t.t.t","totally.taking.time")
    selectors.add("w.r","where.are")
    selectors.add("a","advice")
    sql.validateAst(ast, selectors);
    sql.validate('a.b.c=eq=b;a==1,t.t.t=eq=1,w.r=op=(1,2,3);a==1', selectors);

  });

});