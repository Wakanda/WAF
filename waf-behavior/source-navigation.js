
WAF.define('waf-behavior/source-navigation', ['waf-core/behavior', 'waf-behavior/observable'], function(Behavior) {
	"use strict";
	
	var navigation = Behavior.create();
	
	navigation.addProperty('start', {
		defaultValue: 0,
		type: 'integer'
	});
	
	
	navigation.addProperty('currentPage', {
		defaultValue: 1,
		type: 'integer'
	});
	
	
	navigation.addProperty('pageSize', {
		defaultValue: 20,
		type: 'integer'
	});
	
	
	navigation.addProperty('nbPage', {
		type: 'integer'
	});
	
	
	navigation.addProperty('navigationMode', {
		defaultValue: 'pagination',
		'enum': ['loadmore', 'pagination']
	});
	
	
	WAF.extend(navigation.prototype, {
		_initBehavior: function() {
			this._defaultStep = this.pageSize();
		},


		_initPropertyEvent: function() {
			var source = this.getNavigationSource();
			source.onChange(function() {
				if (this._dsCollChgSubscriber && this._dsCollChgSubscriber.unsubscribe) {
					this._dsCollChgSubscriber.unsubscribe();
				}
				
				if (this._dsCurrEltSubscriber && this._dsCurrEltSubscriber.unsubscribe) {
					this._dsCurrEltSubscriber.unsubscribe();
				}
				
				this.renderElements();
				this._initDsEvent();
			});
			
			this._startSubscriber = this.start.onChange(function(val) {
				var modulo, pageSize, page, navigationType;
				
				pageSize = this.pageSize();
				navigationType = this.navigationMode();
				
				if (navigationType === 'pagination') {
					modulo = val % pageSize;
					page = Math.ceil(val / pageSize);
					
					if (modulo !== 0) {
						this._startSubscriber.pause();
						this.start((page - 1) * pageSize);
						this._startSubscriber.resume();
					} else {
						++page;
					}
					
					this._currentPageSubscriber.pause();
					this.currentPage(page);
					this._currentPageSubscriber.resume();
				}
				
				
				this.generateElements(this.start(), this.pageSize(), function(fragment) {
					var container = this.getNavigationContainer();
					container.innerHTML = '';
					container.insertAdjacentHTML('beforeend', fragment);
				}.bind(this));
			});


			this._currentPageSubscriber = this.currentPage.onChange(function(val) {
				var start = ((val - 1) * this.pageSize());
				this._startSubscriber.pause();
				this.start(start);
				this._startSubscriber.resume();
				
				this.generateElements(this.start(), this.pageSize(), function(fragment) {
					var container = this.getNavigationContainer();
					container.innerHTML = '';
					container.insertAdjacentHTML('beforeend', fragment);
				}.bind(this));
			});


			this._pageSizeSubscriber = this.pageSize.onChange(function(val, oldVal) {
				
				var length, start, sourceProperty, source;
				oldVal = oldVal || 0;
				
				sourceProperty = this.getNavigationSource();
				source = sourceProperty();

				if (val < oldVal) {
					length = val;
					start = this.start();
				} else {
					length = val - oldVal;
					start = this.start() + oldVal;
				}
				
				this.nbPage(Math.ceil(source.length / val));
				
				var fn = function(fragment) {
					var container = this.getNavigationContainer();
					if (val < oldVal) {
						container.innerHTML = '';
					}
					
					container.insertAdjacentHTML('beforeend', fragment);
					
				}.bind(this);

				this.generateElements(start, length, fn);
			});
		},
		
		
		linkDatasourcePropertyToNavigation: function(name) {
			var props = this.constructor.getProperties();
			if (props.indexOf(name) < 0) {
				throw 'Unknown property: "' + name + '"';
			}
			
			var property = this[name];
			
			this._datasourcePropertyToNavigation = property;
			
			this._initDsEvent();
			this._initPropertyEvent();
		},
		
		
		linkParentElementToNavigation: function(container) {
			if (container instanceof jQuery) {
				this._parentElementToNavigation = container.get(0);
			} else {
				if (container.nodeType) {
					this._parentElementToNavigation = container;
				} else {
					throw 'You have to return an html or jquery element';
				}
			}
		},
		
		
		_initDsEvent: function() {
			var sourceProperty = this.getNavigationSource();
			var source = sourceProperty();
			if (source) {
				this._dsCurrEltSubscriber = source.subscribe('currentElementChange', function(e) {
					var diff, navigationType, pos, start, pageSize, page, modulo;
					if (!e || !e.data || !e.data.dataSource) {
						return false;
					}
					navigationType = this.navigationMode();
					pos = e.data.dataSource.getPosition();

					start = this.start();
					pageSize = this.pageSize();

					if (navigationType === 'loadmore') {
						if (pos < start || pos > (start + pageSize - 1)) {
							if (start > pos && pos >= 0) {
								diff = start - pos;

								this._pageSizeSubscriber.pause();
								this.pageSize(pageSize + diff);
								this._pageSizeSubscriber.resume();

								this.start(pos);
							}

							if (pos > (start + pageSize - 1)) {
								diff = pos - (start + pageSize);
								this.pageSize(pageSize + diff + 1);
							}
						}
					} else if (navigationType === 'pagination') {
						modulo = pos % pageSize;
						page = Math.ceil(pos / pageSize);

						if (modulo !== 0 && page > 0) {
							--page;
						}
						
						this.start(page * pageSize);
					}
				}.bind(this));


				this._dsCollChgSubscriber = source.subscribe('collectionChange', function() {
					this.nbPage(Math.ceil(source.length / this.pageSize()));
					this.renderElements();
				}.bind(this));
				
				this.nbPage(Math.ceil(source.length / this.pageSize()));
			}
		},


		renderElements: function() {
			this.generateElements(this.start(), this.pageSize(), function(fragment) {
				this.getNavigationContainer().innerHTML = '';
				this.getNavigationContainer().insertAdjacentHTML('beforeend', fragment);
			}.bind(this));
		},


		generateElements: function(from, limit, fn) {
			var sourceProperty, frag, that, source;
			
			sourceProperty = this.getNavigationSource();
			source = sourceProperty();

			if (!source || source.length === 0) {
				return false;
			}

			that = this;
			frag = '';
			

			if (!this._rowsCount) {
				this._rowsCount = 0;
			}

			this.fire('beforeFetch', {from: from, limit: limit});
			
			source.getElements(from, limit, {
				onSuccess: function(result) {
					var element, elements, i, startPos;
					startPos = result.position;
					elements = result.elements;

					for (i = 0; i < elements.length; i++) {
						if (elements[i]) {
							element = that.renderElement(elements[i], (startPos + i));
							frag += element;
						}
					}

					if (that.navigationMode() === 'loadmore') {
						that._rowsCount += elements.length;
					} else {
						that._rowsCount = elements.length;
					}

					that.fire('afterFetch', {
						numRowsAdded: elements.length,
						totalRows: that._rowsCount,			
						dataSource: source
					});
					
					if (fn) {
						fn(frag);
					}
				},
				
				onError: function() {
					that.fire('fetchFailed');
				}
			});	
		},
		
		
		_getNavigationContainer: function() {
			var container = this.getNavigationContainer();
			if (container instanceof jQuery) {
				return container.get(0);
			} else {
				if (container.nodeType) {
					return container;
				} else {
					throw 'You have to return an html or jquery element';
				}
			}
		},


		getNavigationSource: function() {
			if (!this._datasourcePropertyToNavigation) {
				throw 'You have to call the linkDatasourcePropertyToNavigation method';				
			}
			
			return this._datasourcePropertyToNavigation;
		},


		renderElement: function() {
			throw 'You have to implement the renderElement method in your widget';
		},


		getNavigationContainer: function() {
			if (!this._parentElementToNavigation) {
				throw 'You have to call the linkParentElementToNavigation method';				
			}
			
			return this._parentElementToNavigation;
		},


		nextPage: function() {
			if (this.currentPage() < this.nbPage()) {
				this.currentPage(this.currentPage() + 1);
			}
		},


		prevPage: function() {
			if (this.currentPage() > 1) {
				this.currentPage(this.currentPage() - 1);
			}
		},


		loadMore: function() {
			this.pageSize(this.pageSize() + this._defaultStep);
		}
	});
	
	return navigation;
});