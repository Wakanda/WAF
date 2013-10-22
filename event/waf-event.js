/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


WAF.Event = function(args) {
    this.target = args.target;
    this.property = args.property || null;
    this.eventType = args.eventType;
    this.eventKind = args.eventKind;
    this.event = args.event || {};
};