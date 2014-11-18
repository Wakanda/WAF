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
WAF.Widget.provide(

    /**
     *      
     * @class TODO: give a name to this class (ex: WAF.widget.DataGrid)
     * @extends WAF.Widget
     */
    'Login',   
    {        
    },
    /**
     * @constructor
     * @param {Object} inConfig configuration of the widget
     */

    /**
     * The constructor of the widget
     *
     * @shared
     * @property constructor
     * @type Function
     **/
    function WAFWidget(config, data, shared) {        
        var loginManager = this;
        var htmlObject = $(this.containerNode);
		
		loginManager.labels = {};
		loginManager.labels.userLabel = config['data-user-label'] || "";
		loginManager.labels.passwordLabel = config['data-password-label'] || "";
		loginManager.labels.loginButton = config['data-login-button'] || "";
		loginManager.labels.loginTitle = config['data-login-title'] || "";
		loginManager.labels.userDisplay = config['data-user-display'] || "";
		loginManager.labels.noUserDisplay = config['data-no-user-display'] || "";
		loginManager.labels.loginAction = config['data-login-action'] || "";
		loginManager.labels.logoutAction = config['data-logout-action'] || "";
		
		loginManager.inDesign = config.inDesign || false;
		loginManager.dialogWidget = null;
		loginManager.dialog = null;
				
		if (loginManager.inDesign)
			loginManager.refresh();
		else
			setTimeout( function() { loginManager.refresh() }, 100 );
                
    },{
        showLoginDialog: function login_show_login_dialog() {
			var loginManager = this;
			var htmlObject  = $(this.containerNode);
			var html = "";
			
			
			function loginButton(event)
			{
				var userNameRef = $(".waf-login-dialog-user input", loginManager.dialog);
				var userName = userNameRef.val();
				var passwordRef = $(".waf-login-dialog-password input", loginManager.dialog);
				var password = passwordRef.val();
				passwordRef.val("");
				loginManager.dialog.dialog("close");
				loginManager.login(userName, password);
			}
			
			if (loginManager.dialog == null)
			{
				var dataTheme = "";
				var existingClasses = htmlObject.prop('class')+" waf-login-dialog";
				 existingClasses.split(" ").forEach(function(className) {
			        if (className != "inherit" && className.substr(0,4) != "waf-") {
			                dataTheme += className+" ";
			        }
			    });

				html += '<div class="waf-widget-body waf-login-body '+dataTheme+'" title="'+loginManager.labels.loginTitle+'">';
				
				html += '<form class="waf-login-form" action="#" methos="POST">';
				html += '<div class="waf-login-div waf-login-dialog-user">';
				html += '<label class="waf-widget waf-label waf-login-label '+dataTheme+'">' + loginManager.labels.userLabel + '</label>';
				html += '<div><input id="name_login_'+loginManager.divID+'" type="text" data-type="textField" data-lib="WAF" class="waf-widget waf-textField '+dataTheme+'" size="20"/></div>';
				html += '</div>';
		
				html += '<div class="waf-login-div waf-login-dialog-password">';
				html += '<label class="waf-widget waf-label waf-login-label '+dataTheme+'">' + loginManager.labels.passwordLabel + '</label>';
				html += '<div>';
				html += '<input id="password_login_'+loginManager.divID+'" type="password" data-type="textField" data-lib="WAF" class="waf-widget waf-textField '+dataTheme+'" size="20"/>';			
				html += '<button id="button_login_'+loginManager.divID+'" class="waf-login-button waf-widget waf-button '+dataTheme+'" data-lib="WAF" data-type="button" data-text="'+loginManager.labels.loginButton+'">';
				html += '<span>' + loginManager.labels.loginButton + '</span>';
				html += '</button>';
				html += '</div>';
				html += '</form>';
				html += '</div>';
				
				
				html += '</div>';
				
				var $html = $(html);
				
				$html.addClass(existingClasses);
				$html.removeClass("waf-login");
				$html.dialog({modal: true, resizable: false});
				var dialogWidget = $html.dialog("widget");
				dialogWidget
					.addClass(dataTheme+" waf-widget waf-login-dialog ")
					.find('.ui-widget-header').addClass("waf-widget-header").removeClass('ui-corner-all');
				dialogWidget.removeClass("waf-login");
				
				var tabDom      = $('[data-type]', $html);
 
        		for (var i = 0, nbComponent = tabDom.length; i < nbComponent; i++)  {
            		var domobj  = tabDom[i];
            
		            WAF.tags.createComponent(domobj, false);  
        		}

				loginManager.dialog = $html;
				loginManager.dialogWidget = dialogWidget;
				$(".waf-login-button", $html).bind("click", function (event) {
					event.preventDefault();
					loginButton(event);
				});
				$(".waf-login-form", $html).bind("submit", function (event) {
					event.preventDefault();
					loginButton(event);
				});
			}
			else
			{
				loginManager.dialog.dialog("open");
			}
		},
		
                /*
                 * DEPRECATED
                 */
                showLogin : function(){
                    this.showLoginDialog();
                },
                
		login: function login_login(userName, password)
		{
			var loginManager = this;
			WAF.directory.login({onSuccess:function(event) {
				loginManager.refresh();
				if (event.result === true)
				{
					if (loginManager.onlogin != null)
					{
						loginManager.onlogin();
					}
				} else {
                                    alert("Wrong user or password");
                                    if (loginManager.onloginError != null) {
                                            loginManager.onloginError();
                                    };
				}
			}}, userName, password)
		},
		
		logout: function login_logout() {
			var loginManager = this;
			WAF.directory.logout({onSuccess:function(event) {
				loginManager.refresh();
				if (loginManager.onlogout != null)
				{
					loginManager.onlogout();
				}
			}});
		},
		
		refresh : function login_refresh () {
        	var  htmlObject  = $(this.containerNode);
			var loginManager = this;
			
			function displayLoggedUser(user)
			{
				var html = "";
				if (user == null)
				{
					html += '<div class="waf-login-user">' + loginManager.labels.noUserDisplay + '</div>'
					html += '<div class="waf-login-login"> <a>' + loginManager.labels.loginAction + '</a> </div>';
				}
				else
				{
					var text = user.fullName;
					if (text == null || text === "")
						text = user.userName;
					html += '<div class="waf-login-user">' + loginManager.labels.userDisplay + text + '</div>'
					html += '<div class="waf-login-logout"><a>' + loginManager.labels.logoutAction + '</a> </div>';
				}
				
				htmlObject.html(html);
			}
			
			if (loginManager.inDesign)
			{
				displayLoggedUser({userName:'"userName"', fullName:'"userName"'});
			}
			else
			{
	       		WAF.directory.currentUser({onSuccess:function(event)
				{
					var user = event.result;
					displayLoggedUser(user);
					var aaa = $('a', htmlObject);
				
					function installClickHandler()
					{
						aaa = $('a', htmlObject);
						if (user == null)
						{
							aaa.click(function(event) {
								loginManager.showLoginDialog();
								return false;
							});
						}
						else
						{
							aaa.click(function(event) {
								loginManager.logout();
								return false;
							});
						}
					}
					
					if (aaa.length == 0)
					{
						var xdebug = 1;
						setTimeout(installClickHandler, 10);
					}
					else
					{
						installClickHandler();
					}
				}});
			}
			
        }
    }
);