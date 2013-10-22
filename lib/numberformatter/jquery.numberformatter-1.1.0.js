/**
 * jquery.numberformatter - Formatting/Parsing Numbers in jQuery
 * Written by Michael Abernethy (mike@abernethysoft.com)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Date: 1/26/08
 *
 * @author Michael Abernethy
 * @version 1.1.0
 *
 *
 * This plugin can be used to format numbers as text and parse text as Numbers
 * Because we live in an international world, we cannot assume that everyone
 * uses "," to divide thousands, and "." as a decimal point.
 *
 * The format() function will take the text within any selector by calling
 * text() or val() on them, getting the String, and applying the specified format to it.
 * It will return the jQuery object
 *
 * The parse() function will take the text within any selector by calling text()
 * or val() on them, turning the String into a Number, and returning these
 * values in a Number array.
 * It WILL BREAK the jQuery chain, and return an Array of Numbers.
 *
 * The syntax for the formatting is:
 * 0 = Digit
 * # = Digit, zero shows as absent
 * . = Decimal separator
 * - = Negative sign
 * , = Grouping Separator
 * % = Percent (multiplies the number by 100)
 * For example, a format of "#,###.00" and text of 4500.20 will
 * display as "4.500,20" with a locale of "de", and "4,500.20" with a locale of "us"
 *
 *
 * As of now, the only acceptable locales are 
 * United States -> "us"
 * Arab Emirates -> "ae"
 * Egypt -> "eg"
 * Israel -> "il"
 * Japan -> "jp"
 * South Korea -> "kr"
 * Thailand -> "th"
 * China -> "cn"
 * Hong Kong -> "hk"
 * Taiwan -> "tw"
 * Australia -> "au"
 * Canada -> "ca"
 * Great Britain -> "gb"
 * India -> "in"
 * Germany -> "de"
 * Vietnam -> "vn"
 * Spain -> "es"
 * Denmark -> "dk"
 * Austria -> "at"
 * Greece -> "gr"
 * Brazil -> "br"
 * Czech -> "cz"
 * France  -> "fr"
 * Finland -> "fi"
 * Russia -> "ru"
 * Sweden -> "se"
 * Switzerland -> "ch"
 * 
 * TODO
 * Separate positive and negative patterns separated by a ":" (e.g. use (#,###) for accounting)
 * More options may come in the future (currency)
 **/
     
 (function(jQuery) {

     function FormatData(dec, group, neg) {
       this.dec = dec;
       this.group = group;
       this.neg = neg;
     };

     function formatCodes(locale) {

         // default values
         var dec = ".";
         var group = ",";
         var neg = "-";

         if (locale == "us" ||
             locale == "ae" ||
             locale == "eg" ||
             locale == "il" ||
             locale == "jp" ||
             locale == "sk" ||
             locale == "th" ||
             locale == "cn" ||
             locale == "hk" ||
             locale == "tw" ||
             locale == "au" ||
             locale == "ca" ||
             locale == "gb" ||
             locale == "in"
            )
         {
              dec = ".";
              group = ",";
         }

         else if (locale == "de" ||
             locale == "vn" ||
             locale == "es" ||
             locale == "dk" ||
             locale == "at" ||
             locale == "gr" ||
             locale == "br"
            )
         {
              dec = ",";
              group = ".";
         }
         else if (locale == "cz" ||
              locale == "fr" ||
             locale == "fi" ||
             locale == "ru" ||
             locale == "se"
            )
         {
              group = " ";
              dec = ",";
         }
         else if (locale == "ch")
          {
              group = "'";
              dec = ".";
          }
     
        return new FormatData(dec, group, neg);

    };

 jQuery.formatNumber = function(number, options) {
     var options = jQuery.extend({},jQuery.fn.parse.defaults, options);
     var formatData = formatCodes(options.locale.toLowerCase());

     var dec = formatData.dec;
     var group = formatData.group;
     var neg = formatData.neg;
     
     var numString = new String(number);
     numString = numString.replace(".",dec).replace("-",neg);
     return numString;
 };

 jQuery.fn.parse = function(options) {

     var options = jQuery.extend({},jQuery.fn.parse.defaults, options);

     var formatData = formatCodes(options.locale.toLowerCase());

     var dec = formatData.dec;
     var group = formatData.group;
     var neg = formatData.neg;

     var valid = "1234567890.-";

     var array = [];
     this.each(function(){

         var text = new String(jQuery(this).text());
         if (jQuery(this).is(":input"))
            text = new String(jQuery(this).val());

         // now we need to convert it into a number
         text = text.replace(group,'').replace(dec,".").replace(neg,"-");
         var validText = "";
         var hasPercent = false;
         if (text.charAt(text.length-1)=="%")
             hasPercent = true;
         for (var i=0; i<text.length; i++)
         {
            if (valid.indexOf(text.charAt(i))>-1)
               validText = validText + text.charAt(i);
         }
         var number = new Number(validText);
         if (hasPercent)
         {
            number = number / 100;
            number = number.toFixed(validText.length-1);
         }
         array.push(number);
     });

     return array;
 };

 jQuery.fn.format = function(options) {

     var options = jQuery.extend({},jQuery.fn.format.defaults, options);
     
     var formatData = formatCodes(options.locale.toLowerCase());

     var dec = formatData.dec;
     var group = formatData.group;
     var neg = formatData.neg;
     
     var validFormat = "0#-,.";

     return this.each(function(){
         var text = new String(jQuery(this).text());
         if (jQuery(this).is(":input"))
            text = new String(jQuery(this).val());

         // strip all the invalid characters at the beginning and the end
         // of the format, and we'll stick them back on at the end
         // make a special case for the negative sign "-" though, so 
         // we can have formats like -$23.32
         var prefix = "";
         var negativeInFront = false;
         for (var i=0; i<options.format.length; i++)
         {
            if (validFormat.indexOf(options.format.charAt(i))==-1)
                prefix = prefix + options.format.charAt(i);
            else if (i==0 && options.format.charAt(i)=='-')
            {
               negativeInFront = true;
               continue;
            }
            else
                break;
         }
         var suffix = "";
         for (var i=options.format.length-1; i>=0; i--)
         {
            if (validFormat.indexOf(options.format.charAt(i))==-1)
                suffix = options.format.charAt(i) + suffix;
            else
                break;
         }

         options.format = options.format.substring(prefix.length);
         options.format = options.format.substring(0, options.format.length - suffix.length);


        // now we need to convert it into a number
        var number = new Number(text.replace(group,'').replace(dec,".").replace(neg,"-"));

        // special case for percentages
        if (suffix == "%")
           number = number * 100;

        var returnString = "";
        
        var decimalValue = number % 1;
        if (options.format.indexOf(".") > -1)
        {
           var decimalPortion = dec;
           var decimalFormat = options.format.substring(options.format.lastIndexOf(".")+1);
           var decimalString = new String(decimalValue.toFixed(decimalFormat.length));
           decimalString = decimalString.substring(decimalString.lastIndexOf(".")+1);
           for (var i=0; i<decimalFormat.length; i++)
           {
              if (decimalFormat.charAt(i) == '#' && decimalString.charAt(i) != '0')
              {
                 decimalPortion += decimalString.charAt(i);
                 break;
              }
              else if (decimalFormat.charAt(i) == "0")
              {
                 decimalPortion += decimalString.charAt(i);
              }
           }
           returnString += decimalPortion
        }
        else
           number = Math.round(number);
        
        var ones = Math.floor(number);
        if (number < 0)
            ones = Math.ceil(number);

        var onePortion = "";
        if (ones == 0)
        {
           onePortion = "0";
        }
        else
        {
           // find how many digits are in the group
           var onesFormat = "";
           if (options.format.indexOf(".") == -1)
              onesFormat = options.format;
           else
              onesFormat = options.format.substring(0, options.format.indexOf("."));
           var oneText = new String(ones);
           var groupLength = 9999;
           if (onesFormat.lastIndexOf(",") != -1)
               groupLength = onesFormat.length - onesFormat.lastIndexOf(",")-1;
           var groupCount = 0;
           for (var i=oneText.length-1; i>-1; i--)
           {
             onePortion = oneText.charAt(i) + onePortion;

             groupCount++;

             if (groupCount == groupLength && i!=0)
             {
                 onePortion = group + onePortion;
                 groupCount = 0;
             }

           }
        }

        returnString = onePortion + returnString;

        // handle special case where negative is in front of the invalid
        // characters
        if (number < 0 && negativeInFront && prefix.length > 0)
        {
           returnString = returnString.substring(1);
           prefix = neg + prefix;
        }

        returnString = prefix + returnString + suffix;

        if (jQuery(this).is(":input"))
           jQuery(this).val(returnString);
        else
           jQuery(this).text(returnString);

     });
 };

 jQuery.fn.parse.defaults = {
      locale: "us"
 };

 jQuery.fn.format.defaults = {
      format: "#,###.00",
      locale: "us"
 };


 })(jQuery);