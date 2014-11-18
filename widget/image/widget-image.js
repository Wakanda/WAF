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
    'Image',   
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
        var
        that,
        xsrc,
        txtHtml,
        txtHmlImg,
        htmlImg,
        htmlObject,
        sourceAtt;

        that        = this;
        htmlObject  = $(this.containerNode);        
        xsrc        = data.src;
        sourceAtt   = this.sourceAtt;
        
        if (xsrc == null || xsrc == "") {
            xsrc = this._empty;
        }
        
        txtHmlImg = '<img src="' + xsrc + '" />';
        
        /*
         * IMAGE NAVIGATION
         */
        if (data.link) {
            txtHtml = '<a href="' + data.link + '" target="' + data.target + '">' + txtHmlImg + '</a>';
            htmlObject.removeAttr('data-link');
        } else {
            txtHtml = txtHmlImg;
        }
        
        htmlObject.html(txtHtml);
        
        htmlImg = htmlObject.find('img');
        
        /*
         * For binded image
         */
        if (sourceAtt) {
            sourceAtt.addListener(function(e) { 
                var
                url;
                
                url = e.data.widget.getFormattedValue();
                htmlImg = htmlObject.find('img');
                if (url == null || url == "") {
                    url = "/walib/WAF/widget/css/images/emptyImage.png";
                }
                
                htmlImg.attr('src', url);
            },{
                id : config.id,
                listenerID      : config.id,
                listenerType    : 'image',
                subID           : config.subID ? config.subID : null
            }, {
                widget:this
            });
            
            /*
             * Useful when matrix is resized
             */
            if (this.source.getPosition() != -1) {
                this.source.getElement(this.source.getPosition(), {
                    onSuccess:function(e) {
                        var
                        value;
                        
                        value = sourceAtt.getValue();
                        htmlImg = htmlObject.find('img');
                        if (value) {
                            if (value.__deferred) {
                                htmlImg.attr('src', value.__deferred.uri);
                            } else {
                                htmlImg.attr('src', value);
                            }
                        }
                    }
                })
            }
        }
        
        that.refresh();
    },{
        _empty : '/walib/WAF/widget/css/images/emptyImage.png',

        /**
         * Custom getValue function
         * @method getValue
         * @return {string} value
         */
         getValue : function image_get_value () {
            return this.$domNode.children()[0].src;
         },

        /**
         * Custom setValue function
         * @method setValue
         * @param {string} value
         */
         setValue : function image_set_value (value) {
            this.$domNode.children()[0].src = value;
         },

        /**
         * Custom clear function
         * @method 
         */
         clear : function image_clear (argument) {
            this.$domNode.find('img').attr('src', this._empty);
         },

        /**
         * Refresh the image widget
         * @method refresh
         */
        refresh : function image_refresh () {
            var
            imgWidth,
            imgHeight,
            padding,
            alignType,
            thisHeight,
            thisWidth,
            htmlImg,
            htmlObject;
            
            htmlObject  = $(this.containerNode);
            htmlImg     = htmlObject.find('img');
            
            /*
             * Resize image
             */
            switch (this.config['data-fit']) {
                case '0':
                    htmlImg.width('100%').height('100%');
                    break;

                case '1':
                    htmlImg.width('100%');
                    break;

                case '2':
                    htmlImg.height('100%');
                    break;

                case '4':
                    thisHeight  = parseInt(htmlObject.css('height'));
                    thisWidth   = parseInt(htmlObject.css('width'));

                    htmlImg.css({
                        'max-width'     : thisWidth + 'px',
                        'max-height'    : thisHeight + 'px'
                    });
                    
                    htmlObject.prop('align', 'center');
                    
                    htmlObject.css({
                        'line-height' : htmlObject.css('height')
                    });
                    
                    htmlImg.css({
                        'vertical-align'    : 'middle',
                        'display'           : 'inline-block'
                    });       

                    break;

                case '3':
                default :
                    htmlImg.load(function() {
                        var
                        htmlImg;
                        
                        htmlImg = $(this);
                        
                        htmlObject.css({
                            width   : htmlImg.width() + 'px',
                            height  : htmlImg.height() + 'px'
                        });
                    });
                    break;
            }  
        },
        setURL : function(link, target) {
            var txtHtml, txtHmlImg,
            htmlObject = this.$domNode;
            
            if (target) {
                this.$domNode.attr('data-target', target);
            }
            target = this.$domNode.attr('data-target');
            
            if (htmlObject.get(0).tagName.toLowerCase() !== 'img') {
                txtHmlImg = htmlObject.find('img').first().parent().html();
            } else {
                txtHmlImg = htmlObject.parent().html();
            }
            
            this.$domNode.attr('data-link', link);
            
            if (link) {
                txtHtml = '<a href="' + link + '" target="' + target + '">' + txtHmlImg + '</a>';
            } else {
                txtHtml = txtHmlImg;
            }
            
            htmlObject.html(txtHtml);
            
        },
        
        getURL : function() {
            return this.$domNode.attr('data-link');
        }
        
    }
);