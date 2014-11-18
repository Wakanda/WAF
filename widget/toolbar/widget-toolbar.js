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
//// "use strict";

/*global WAF,window*/

/*jslint white: true, browser: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */

WAF.widget.Toolbar = function(elements) {

    var toolbarNode = $('<ul class="waf-toolbar"></ul>');
    
    $(elements).each(function(i, element) {
        var elementNode = $('<li class="waf-toolbar-element ' + [].concat(element.className).join(' ') + '" title="' + element.title + '"></li>');
        
        if (element.icon) {
            var icon = new WAF.widget.Icon(element.icon);
            elementNode.append(icon.containerNode);
        }
        
        if (element.text) {
            elementNode.append(element.text);
        }
        
        if (element.click) {
            elementNode.click(element.click);
        }
        
        toolbarNode.append(elementNode);
    });
    
    return toolbarNode;
};
