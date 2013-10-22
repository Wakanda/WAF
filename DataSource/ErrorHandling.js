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
WAF.ErrorManager = {
	
	defaultErrorDiv: null,
	dialogAlreadyOpened: false
		
};


WAF.ErrorManager.displayError = function(event, div)
{
	function handleOneError(err)
	{
		if (err.message != null)
		{
			html += '<tr class="waf-error-div-table-row">';
			
			html += '<td class="waf-error-div-table-message">';
			html += err.message;
			html += '</td>';
			
			html += '<td class="waf-error-div-table-errnum">';
			if (err.errCode != null)
				html += err.errCode;
			html += '</td>';
			
			html += '<td class="waf-error-div-table-component">';
			if (err.componentSignature != null)
				html += err.componentSignature;
			html += '</td>';
			
			html += '</tr>';
		}
	}
	
	var isInDialog = false;
	var html = "";
	if (div == null)
	{
		div = this.getDefaultErrorDiv();
		isInDialog = true;
	}
	
	var error = event.error;
	if (error == null)
	{
		div.html("");
		if (isInDialog)
		{
			div.dialog("close");
		}
	}
	else
	{
		div.addClass("waf-error-div");
		div.addClass("waf-widget");
		html += '<div class="waf-error-div-body waf-widget-body">';
		
		if (event.message != null)
		{
			html += '<div class="waf-error-div-message-outside">';
			html += '<div class="waf-error-div-message-inside">';
			html += event.message;
			html += '</div>';
			html += '</div>';
		}
		
		html += '<table class="waf-error-div-table">';
		html += '<tbody class="waf-error-div-table-body">';
		if (error.length == null)
			error = [error];
		error.forEach(handleOneError);
		html += '</tbody>';
		html += '</table>';
		
		html += '</div>';
		div.html(html);
		if (isInDialog)
		{
			if (!this.dialogAlreadyOpened)
			{
				this.dialogAlreadyOpened = true;
				div.dialog();
				var dataTheme = $("body").data("theme");
				if (dataTheme != null)
				{
					div.dialog("widget").addClass(dataTheme);
					div.addClass(dataTheme);
				}
			}
			else
				div.dialog("open");
		}
	}
}


WAF.ErrorManager.getDefaultErrorDiv = function()
{
	if (this.defaultErrorDiv == null)
	{
		this.defaultErrorDiv = $('<div class="waf-error-div waf-widget"></div>').appendTo($('body'));
		//this.defaultErrorDiv.dialog("option", "autoOpen", false);
	}
	return this.defaultErrorDiv;
}
