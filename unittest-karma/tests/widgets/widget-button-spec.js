(function() {
    
    console.warn("SHOULD HAVE LOADED jQUERY !!!");

    console.log('before describe');
    describe("the window object", function() {
        console.log('inside describe', it);
        it("should be present", function() {
            console.log('inside it1');
            expect(window).to.not.equal(undefined);
        });
        it("should contain onclick", function() {
            console.log('inside it2');
            expect(window).to.have.property("onclick");
        });
    });

    describe("DOM access", function() {
        before(function() {
            testHelper.setInlineCss(__html__['unittest-karma/tests/widgets/widget-button-style.css']);
            document.body.innerHTML = __html__['unittest-karma/tests/widgets/widget-button-fixture.html'];
        });
        it("h1 present", function() {
            expect(document.getElementsByTagName('h1').length > 0);
        });
        it("h1 is red", function() {
            expect($('h1').css('color') === "rgb(255, 0, 0)");
        });
        after(function(){
            testHelper.removeInlineCss();
            document.body.innerHTML = "";
        });
    });

    describe("Check for jQuery", function() {
        it("should be present", function() {
            expect(jQuery).to.not.be.an('undefined');
        });
    });

})();