'use strict';

const parser = require('../src');
const sql = require('../src');

describe('to sql', function () {

  const parse = parser.parse;
  it('eq operator test', () => {
    const ast = parse('a=eq=b');
    const result = sql.toSql([{"name":"a","alias":"table.a"}], ast)
    result.should.eql("table.a = 'b'")
  });
  it('int operator test', () => {
    const ast = parse('a=eq=1');
    const result = sql.toSql([{"name":"a","alias":"table.a"}], ast)
    result.should.eql("table.a = 1")
  });
  it('float operator test', () => {
    const ast = parse('a=eq=-1.123');
    const result = sql.toSql([{"name":"a","alias":"table.a"}], ast)
    result.should.eql("table.a = -1.123")
  });
  it('date operator test', () => {
    const ast = parse('a=gt=2018-09-01;a=lt=2020-09-01');
    const result = sql.toSql([{"name":"a","alias":"table.a"}], ast)
    result.should.eql("(table.a > '2018-09-01' AND table.a < '2020-09-01')")
  });
  it('datetime operator test with custom format function', () => {
    const ast = parse('a=gt=2018-09-01T12:14:28Z;a=lt=2020-09-01T12:14:28Z');
    const result = sql.toSql([{"name":"a","alias":"table.a","format":(x) => {return `'${x.split('T')[0]}'`}}], ast)
    result.should.eql("(table.a > '2018-09-01' AND table.a < '2020-09-01')")
  });
  it('== operator test', () => {
    const ast = parse('a==b');
    const result = sql.toSql([{"name":"a","alias":"table.a"}], ast)
    result.should.eql("table.a = 'b'")
  });
  it('!= operator test', () => {
    const ast = parse('a!=b');
    const result = sql.toSql([{"name":"a","alias":"table.a"}], ast)
    result.should.eql("table.a != 'b'")
  });
  it('=gt= operator test', () => {
    const ast = parse('a=gt=b');
    const result = sql.toSql([{"name":"a","alias":"table.a"}], ast)
    result.should.eql("table.a > 'b'")
  });
  it('=ge= operator test', () => {
    const ast = parse('a=ge=b');
    const result = sql.toSql([{"name":"a","alias":"table.a"}], ast)
    result.should.eql("table.a >= 'b'")
  });

  it('basic AND test', () => {
    const ast = parse('a=eq=b;c!=d');
    const result = sql.toSql([{"name":"a","alias":"table.a"},{"name":"c","alias":"table.c"}], ast)
    result.should.eql("(table.a = 'b' AND table.c != 'd')")
  });
  it('basic OR test', () => {
    const ast = parse('a=eq=b,c!=d');
    const result = sql.toSql([{"name":"a","alias":"table.a"},{"name":"c","alias":"table.c"}], ast)
    result.should.eql("(table.a = 'b' OR table.c != 'd')")
  });
  it('nested combination test', () => {
    const ast = parse('t=eq=q;(a=eq=b,c!=d)');
    const result = sql.toSql([{"name":"a","alias":"table.a"},{"name":"c","alias":"table.c"},{"name":"t","alias":"table.t"}], ast)
    result.should.eql("(table.t = 'q' AND (table.a = 'b' OR table.c != 'd'))")
  });
  it('IN test', () => {
    const ast = parse('field=op=(item0,item1,item2)');
    const result = sql.toSql([{"name":"field","alias":"table.field"}], ast)
    result.should.eql("table.field IN ('item0','item1','item2')")
  });
  it('parseToSql test', () => {
    const result = sql.parseToSql('field=op=(item0,item1,item2)', [{"name":"field","alias":"table.field"}]);
    result.should.eql("table.field IN ('item0','item1','item2')")
  });

  it('test tablenames', () => {
    const ast = parse('a.b.c=eq=b;a==1,t.t.t=eq=1,werwerr.er=op=(1,2,3);a==1');
    const result = sql.selectors(ast);
    result.should.eql(["a","werwerr.er","t.t.t","a","a.b.c"])
  });
  it('test validate', () => {
    const selectors = [
        {"name":"a", "alias":"bills.status"},
        {"name":"a" ,"alias":"bills.status"},
        {"name":"a.b.c","alias":"user.comment.date"},
        {"name":"t.t.t","alias":"totally.taking.time"},
        {"name":"w.r","alias":"where.are"},
        {"name":"a","alias":"advice"}
    ]
    sql.validate('a.b.c=eq=b;a==1,t.t.t=eq=1,w.r=op=(1,2,3);a==1', selectors);
  });

});