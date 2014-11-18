/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


(function() {
	"use strict";
	var Navigation = WAF.require('waf-behavior/source-navigation');
	
	Navigation.customizeProperty('nbPage', {display: false, sourceDisplay: false});
	Navigation.customizeProperty('currentPage', {display: false, sourceDisplay: false});
	Navigation.customizeProperty('navigationMode', {sourceDisplay: false});
	
})();