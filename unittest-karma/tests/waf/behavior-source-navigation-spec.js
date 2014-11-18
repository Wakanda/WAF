var Widget = WAF.require('waf-core/widget');
var Observable = WAF.require('waf-behavior/observable');
/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, afterEach, sinon */

moduleDescribe('waf-behavior/source-navigation', function() {
	var W, w;
	describe('inherit behavior', function() {
		beforeEach(function() {
			W = Widget.create('W');
			W.inherit('waf-behavior/source-navigation');
			w = new W();
		});
		
		it('sould have property', function() {
			expect(w).to.have.a.property('start').to.be.a('function');
			expect(w).to.have.a.property('pageSize').to.be.a('function');
			expect(w).to.have.a.property('nbPage').to.be.a('function');
			expect(w).to.have.a.property('currentPage').to.be.a('function');
			expect(w).to.have.a.property('navigationMode').to.be.a('function');
		});
		
		it('sould have pagination methods', function() {
			expect(w).to.have.a.property('nextPage').to.be.a('function');
			expect(w).to.have.a.property('prevPage').to.be.a('function');
			expect(w).to.have.a.property('loadMore').to.be.a('function');
		});
	});
	
	
	describe('.nextPage', function() {
		beforeEach(function() {
			W = Widget.create('W');
			W.inherit('waf-behavior/source-navigation');
			w = new W();
		});
		
		it('should not throw an error', function() {
			expect(function() {
				w.nextPage();
			}).to.not.throw();
		});
	});
	
	describe('.prevPage', function() {
		beforeEach(function() {
			W = Widget.create('W');
			W.inherit('waf-behavior/source-navigation');
			w = new W();
		});
		
		it('should not throw an error', function() {
			expect(function() {
				w.prevPage();
			}).to.not.throw();
		});
	});
	
	describe('.loadMore', function() {
		beforeEach(function() {
			W = Widget.create('W');
			W.inherit('waf-behavior/source-navigation');
			w = new W();
		});
		
		it('should not throw an error', function() {
			expect(function() {
				w.loadMore();
			}).to.not.throw();
		});
	});
	
	describe('.linkDatasourcePropertyToNavigation', function() {
		beforeEach(function() {
			W = Widget.create('W', {
				prop: Widget.property()
			});
			W.inherit('waf-behavior/source-navigation');
			w = new W();
		});
		
		it("should throw an error if parameter is not an html or jquery object", function() {
			expect(function() {
				w.linkDatasourcePropertyToNavigation('unknown');
			}).to.throw();
		});
		
	});
	
	describe('.linkParentElementToNavigation', function() {
		beforeEach(function() {
			W = Widget.create('W', {
				prop: Widget.property()
			});
			
			W.inherit('waf-behavior/source-navigation');
			w = new W();
		});
		
		it("should throw an error if param is not a HTML element", function() {
			expect(function() {
				w.linkParentElementToNavigation('string');
			}).to.throw();
		});
		
		it("should not throw an error if param is a HTML element", function() {
			expect(function() {
				w.linkParentElementToNavigation(w.node);
			}).to.not.throw();
		});
		
		it("should not throw an error if param is a jQuery element", function() {
			expect(function() {
				w.linkParentElementToNavigation($(w.node));
			}).to.not.throw();
		});
	});
	
	describe('.renderElement', function() {
		var spy, data;
		
		beforeEach(function() {
			spy = sinon.spy();
			window.sources = window.source = {};
			
			data = [
				{ name: "name", num: 13 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 42 },
				{ name: "name", num: 7 }
			];
			
			source.datasource = new WAF.DataSourceVar({
				"variableReference": data,
				"data-attributes": 'name:string,num:number'
			});
			
			source.datasource2 = new WAF.DataSourceVar({
				"variableReference": data,
				"data-attributes": 'name:string,num:number'
			});
			
			W = Widget.create('W', {
				prop: Widget.property({
					type: 'datasource'
				}),
				
				renderElement: function() {
					spy();
				}
			});
			
			W.inherit('waf-behavior/source-navigation');
			
			w = new W();
			
			w.pageSize(5);
			w.prop(source.datasource);
			w.linkParentElementToNavigation(w.node);
			w.linkDatasourcePropertyToNavigation('prop');
		});
		
		
		it("should throw id renderElement is not implemented", function() {
			W = Widget.create('W', {
				prop: Widget.property({
					type: 'datasource'
				})
			});
			
			W.inherit('waf-behavior/source-navigation');
			w = new W();
			w.pageSize(5);
			w.prop(source.datasource);
			w.linkParentElementToNavigation(w.node);
			w.linkDatasourcePropertyToNavigation('prop');
			
			expect(function() {
				source.datasource.sync(); 
			}).to.throw();
		});
		
		
		it("should render elements on collection change", function() {
			source.datasource.sync();
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on page change", function() {
			w.nextPage();
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on page change", function() {
			w.renderElement = function() {};
			w.nextPage();
			w.renderElement = function() {spy();};
			w.prevPage();
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on current page change", function() {
			w.currentPage(3);
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on page size change", function() {
			w.pageSize(10);
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on page size change", function() {
			w.pageSize(3);
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on start change", function() {
			w.start(7);
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on loadMore call", function() {
			w.loadMore();
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on current element change", function() {
			source.datasource.select(10);
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on current element change", function() {
			w.navigationMode('loadmore');
			source.datasource.select(15);
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on current element change", function() {
			w.renderElement = function() {};
			w.start(10);
			w.renderElement = function() {spy();};
			source.datasource.select(2);
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on current element change with loadmore mode", function() {
			w.navigationMode('loadmore');
			w.renderElement = function() {};
			w.start(10);
			w.renderElement = function() {spy();};
			source.datasource.select(2);
			expect(spy).to.have.been.called;
		});
		
		it("should render elements on datasource change", function() {
			w.prop(source.datasource2);
			expect(spy).to.have.been.called;
		});
	});
});