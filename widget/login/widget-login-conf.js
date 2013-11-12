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
WAF.addWidget({
    packageName: 'Widget/login',
    type: 'login',
    lib: 'WAF',
    description: 'Login Dialog',
    category: 'Automatic Controls',
    img: '/walib/WAF/widget/login/icons/widget-login.png',
    attributes: [
        {
            name: 'data-user-label',
            description: 'User label',
            defaultValue: 'User: ',
            category: 'Login Dialog'
        },
        {
            name: 'data-password-label',
            description: 'Password label',
            defaultValue: 'Password: ',
            category: 'Login Dialog'
        },
        {
            name: 'data-login-button',
            description: 'Login button',
            defaultValue: 'Login',
            category: 'Login Dialog'
        },
        {
            name: 'data-login-title',
            description: 'Login dialog title',
            defaultValue: 'Login Dialog',
            category: 'Login Dialog'
        },
        {
            name: 'data-user-display',
            description: 'Current user display',
            defaultValue: 'Signed in as ',
            category: 'Login Status'
        },
        {
            name: 'data-no-user-display',
            description: 'Not logged in display',
            defaultValue: '',
            category: 'Login Status'
        },
        {
            name: 'data-login-action',
            description: 'Login text',
            defaultValue: 'Login',
            category: 'Login Status'
        },
        {
            name: 'data-logout-action',
            description: 'Logout text',
            defaultValue: 'Logout',
            category: 'Login Status'
        }],
    events: [
        {
            name: 'login',
            description: 'On Login',
            category: 'Login Events'
        },
        {
            name: 'logout',
            description: 'On Logout',
            category: 'Login Events'
        }/*,
         {
         name       : 'onReady',
         description: 'On Ready',
         category   : 'UI Events'
         }*/],
    style: [
        {
            name: 'width',
            defaultValue: '185px'
        },
        {
            name: 'height',
            defaultValue: '80px'
        }],
    properties: {
        style: {
            theme: true,
            fClass: true,
            text: true,
            background: true,
            border: true,
            sizePosition: true,
            label: true,
            shadow: true
        }
    },
    onInit: function(config) {
        var login = new WAF.widget.Login(config);
        return login;
    },
    onDesign: function(config, designer, tag, catalog, isResize) {
        if (!isResize)
        {
            config.inDesign = true;
            var login = new WAF.widget.Login(config);
        }
    }
});
