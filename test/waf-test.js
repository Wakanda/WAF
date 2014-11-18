/*
 * This file is part of Wakanda software, licensed by 4D under
 *  (i) the GNU General Public License version 3 (GNU GPL v3), or
 *  (ii) the Affero General Public License version 3 (AGPL v3) or
 *  (iii) a commercial license.
 * This file remains the exclusive property of 4D and/or its licensors
 * and is protected by national and international legislations.
 * In any event, Licensee's compliance with the terms and conditions
 * of the applicable license constitutes a prerequisite to any use of this file.
 * Except as otherwise expressly stated in the applicable license,
 * such license does not include any other license or rights on this file,
 * 4D's and/or its licensors' trademarks and/or other proprietary rights.
 * Consequently, no title, copyright or other proprietary rights
 * other than those specified in the applicable license is granted.
 */

(function() {
    var def = WAF.behavior.define('test');
    def.addAttribute('_value');
    def.addMethod('setValue', function(v) {
        this._value = v;
    });
})();


WAF.behavior.define('test2',
{
    inherit: 'test',
    setValue: function(v) {
        this.Base(v);
        this.getValue();
    },
    getValue: function() {
        console.log('value =>', this._value);
        return this._value;
    }
});

(function() {

    var wid = WAF.define('myWidgetParent');

    wid.inherit('test2');
    wid.addAttribute('myVar', 'test', true);

    wid.addMethod('init', function() {
        console.log('Am alive');
        //this.domNode.appendChild(document.createTextNode('HELLO'));
    });

    wid.addMethod('watch', function(id, ev) {
        var that = this;
        this.observe({
            target: id,
            event: ev,
            fn: function(e) {
                console.log(e, 'from', that.id);
            }
        });
    });
})();