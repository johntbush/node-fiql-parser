#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image]

> Library to parse FIQL query strings

## Description

Basic [node.js] library module to parse FIQL query expressions.

Implements only the basic [FIQL] standard draft without RSQL extensions like quoting of values.

## References

* https://tools.ietf.org/html/draft-nottingham-atompub-fiql-00
* https://gist.github.com/fdlk/63bac558fd02ada151730dc3375bb243

## Install

	npm install fiql-parser --save
	
## FIQL Overview


Feed Item Query Language (FIQL) was originally specified by Mark Nottingham as a language for querying Atom feeds. It appears the combination of FIQL and Atom has not become well referenced in the community. However the simplicity of FIQL and its capability to express complex queries in a compact and HTTP URI-friendly way makes it a good candidate for becoming a generic query language for searching REST endpoints.
FIQL Overview
FIQL introduces simple and composite operators which can be used to build basic and complex queries. The following table lists basic operators:

### Basic Operator	Description
- ==	Equal To
- !=	Not Equal To
- =gt=	Greater Than
- =ge=	Greater Or Equal To
- =lt=	Less Than
- =le=	Less Or Equal To 
- =op=	One of many options (IN clause) 

These six operators can be used to do all sort of simple queries, for example:
- “name==Barry”: find all people whose name is Barry
- “street!=central”: find all people who do not live at Central
- “age=gt=10”: find all people older than 10 (exclusive)
- “age=ge=10”: find all people older than 10 (inclusive)
- “children=lt=3”: find all people who have less than 3 children
- “children=le=3”: find all people who have less than or 3 children

The following table lists two joining operators:

| Composite Operator  | Description|
| ------------- | ------------- |
| ;  | AND |
| ,  | OR |



These two operators can be used to join the simple queries and build more involved queries which can be as complex as required. Here are some examples:
- “age=gt=10;age=lt=20”: find all people older than 10 and younger than 20
- “age=lt=5,age=gt=30”: find all people younger than 5 or older than 30
- “age=gt=10;age=lt=20;(str=park,str=central)”: find all people older than 10 and younger than 20 and living either at Park or Central Street.

Note that while the complexity of the queries can grow, the complete expression still remains in a form which is easy to understand and quite compact. The latter property becomes very useful when considering how to embed FIQL queries into HTTP URIs. 
	
## Usage
```
	const parser = require(fiql-parser);
	parser.parse(query);
```
	
## To SQL

Turn a FIQL query into a WHERE clause...

### Parse into SQL

```
    const sql = require(fiql-parser);
    // convert FIQL string to a sql where clause
    // first param is a list of objects mapping the field names in the FIQL to table.columns in the sql, these are called selectors
    const result = sql.parseToSql([{"name":"field","alias":"table.field"}], ast)
    // table.field IN ('item0','item1','item2')
```

### Custom Formats

If you need to apply any custom formatting to the value, selectors can take a function.
The default format will single quote strings and leave numbers alone

```
    const ast = parse('a=gt=2018-09-01T12:14:28Z;a=lt=2020-09-01T12:14:28Z');
    const ast = parse('a=gt=2018-09-01T12:14:28Z;a=lt=2020-09-01T12:14:28Z');
    const selectors = [{
                     	"name": "a",
                     	"alias": "table.a",
                     	"format": (x) => {
                     		return `'${x.split('T')[0]}'`
                     	}
                     }]
    const result = sql.toSql(selectors, ast)
    result.should.eql("(table.a > '2018-09-01' AND table.a < '2020-09-01')")
```

### Parse into AST

```
    const sql = require(fiql-parser);
    const ast = parse('t=eq=q;(a=eq=b,c!=d)');
    const result = sql.toSql([{
                             	"name": "a",
                             	"alias": "table.a"
                             }, {
                             	"name": "c",
                             	"alias": "table.c"
                             }, {
                             	"name": "t",
                             	"alias": "table.t"
                             }], ast)
```

AST looks like this...

```
{
	"type": "COMBINATION",
	"operator": "AND",
	"lhs": {
		"type": "CONSTRAINT",
		"selector": "t",
		"comparison": "=eq=",
		"argument": "q"
	},
	"rhs": {
		"type": "COMBINATION",
		"operator": "OR",
		"lhs": {
			"type": "CONSTRAINT",
			"selector": "a",
			"comparison": "=eq=",
			"argument": "b"
		},
		"rhs": {
			"type": "CONSTRAINT",
			"selector": "c",
			"comparison": "!=",
			"argument": "d"
		}
	}
}    
```

### Validate

The validate will happen automatically by toSql or parseToSql, but you can invoke it
directly if you like.  If any selector is missing, the validate will throw an error telling
you which selector is missing.

```
TODO
```    	
    

## License

MIT © [Volker Möbius]()

[npm-url]: https://npmjs.org/package/fiql-parser
[npm-image]: https://badge.fury.io/js/fiql-parser.svg
[travis-url]: https://travis-ci.org/vmoebius/node-fiql-parser
[travis-image]: https://travis-ci.org/vmoebius/node-fiql-parser.svg?branch=master
[daviddm-url]: https://david-dm.org/vmoebius/node-fiql-parser.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/vmoebius/node-fiql-parser
[node.js]: https://nodejs.org
[FIQL]: https://tools.ietf.org/html/draft-nottingham-atompub-fiql-00
