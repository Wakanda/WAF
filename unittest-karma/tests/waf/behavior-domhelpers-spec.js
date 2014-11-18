/* jshint strict:false,expr:true */
/* global describe, it, expect, beforeEach, sinon */
var Widget = WAF.require('waf-core/widget');

moduleDescribe('waf-behavior/domhelpers', function() {
    describe('.mapDomEvents(map)', function() {
        var W, w, s1, s2, s3, s4;
        beforeEach(function() {
            W = Widget.create('W');
            W.mapDomEvents({
                'click': 'E1',
                'plop plip': 'E2'
            });
            W.mapDomEvents({
                'plap': ['E3', 'E4']
            });
            w = new W();
            s1 = sinon.spy();
            s2 = sinon.spy();
            s3 = sinon.spy();
            s4 = sinon.spy();
            w.subscribe('E1', s1);
            w.subscribe('E2', s2);
            w.subscribe('E3', s3);
            w.subscribe('E4', s4);
        });
        it('should fire an event', function() {
            w.node.click();
            expect(s1).to.have.been.called;
        });
        it('should fire multiple event', function() {
            $(w.node).trigger('plop');
            expect(s2).to.have.been.called;
            $(w.node).trigger('plip');
            expect(s2).to.have.been.calledTwice;
        });
        it('should map multiple events', function() {
            $(w.node).trigger('plap');
            expect(s3).to.have.been.called;
            expect(s4).to.have.been.called;
        });
        it('should stop event propagation', function() {
            var $e = $('<div>');
            $e.append($(w.node));
            var s5 = sinon.spy();
            $e.on('click', s5);
            w.node.click();
            expect(s5).to.not.have.been.called;
            expect(s1).to.have.been.called;
        });
    });
    describe('.mapDomEvents(map, selector)', function() {
        var W, w, s1, s2, s3, s4;
        beforeEach(function() {
            W = Widget.create('W');
            W.prototype.init = function() {
                this.node.innerHTML = '<span></span>';
            };
            W.mapDomEvents({
                'click': 'E1',
                'plop plip': 'E2',
                'plap': ['E3', 'E4']
            }, '>span');
            w = new W();
            s1 = sinon.spy();
            s2 = sinon.spy();
            s3 = sinon.spy();
            s4 = sinon.spy();
            w.subscribe('E1', s1);
            w.subscribe('E2', s2);
            w.subscribe('E3', s3);
            w.subscribe('E4', s4);
        });
        it('should not fire an event on dom node', function() {
            w.node.click();
            expect(s1).to.have.not.been.called;
        });
        it('should fire an event', function() {
            $('>span', w.node).trigger('click');
            expect(s1).to.have.been.called;
        });
        it('should fire multiple event', function() {
            $('>span', w.node).trigger('plop');
            expect(s2).to.have.been.called;
            $('>span', w.node).trigger('plip');
            expect(s2).to.have.been.calledTwice;
        });
        it('should map multiple events', function() {
            $('>span', w.node).trigger('plap');
            expect(s3).to.have.been.called;
            expect(s4).to.have.been.called;
        });
    });
});

