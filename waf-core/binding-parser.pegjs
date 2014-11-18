start
  = datasource:identifier attribute:attribute formatters:formatters _ { return { datasource: datasource, attribute: attribute, formatters: formatters }; }

formatters
  = (formatter)*

formatter
  = _ "|" _ name:identifier values:values { return { formatter: name, arguments: values }; }

values
  = values:(_ value)* { return values.map(function(i) { return i[1]; }); }

value
  = expression:$(expression) {
        if(expression[0] === "'") {
            expression = '"' + expression.slice(1, -1).replace("\\'", "'").replace('"', '\\"') + '"';
        }
        return JSON.parse(expression);
    }
  / datasource:identifier attribute:attribute { return { datasource: datasource, attribute: attribute, formatters: [] }; }
  / "[" _ binding:start _ "]" { return binding; }

attribute "attribute"
  = attribute:("." identifier)* { return attribute.map(function(i) { return i.join(''); }).join('').substr(1); }

identifier "binding"
  = start:[$a-zA-Z_] end:[0-9a-zA-Z_$]* { return start + end.join('') }

expression
  = string
  / number
  / "true"
  / "false"
  / "null"

string "string"
  = '"' char_double* '"'
  / "'" char_simple* "'"

char_double
  // any Unicode character except " or \ or control character
  = [^"\\\0-\x1F\x7F]
  / char_escaped

char_simple
  // any Unicode character except ' or \ or control character
  = [^'\\\0-\x1F\x7F]
  / char_escaped

char_escaped
  = "\\" ['"\\bfnrt]
  / "\\u" hexDigit hexDigit hexDigit hexDigit

number "number"
  = int frac exp
  / int frac
  / int exp
  / int

int
  = digit19 digits
  / digit
  / "-" digit19 digits
  / "-" digit

frac
  = "." digits

exp
  = e digits

digits
  = digit+

e
  = [eE] [+-]?

digit
  = [0-9]

digit19
  = [1-9]

hexDigit
  = [0-9a-fA-F]

_ "whitespace"
  = [ \t\n\r]*
