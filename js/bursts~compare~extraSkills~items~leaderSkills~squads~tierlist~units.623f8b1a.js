(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["bursts~compare~extraSkills~items~leaderSkills~squads~tierlist~units"],{"00e0":function(e,t,n){"use strict";n.d(t,"j",(function(){return p})),n.d(t,"n",(function(){return m})),n.d(t,"r",(function(){return y})),n.d(t,"o",(function(){return v})),n.d(t,"w",(function(){return k})),n.d(t,"x",(function(){return O})),n.d(t,"v",(function(){return S})),n.d(t,"q",(function(){return j})),n.d(t,"p",(function(){return _})),n.d(t,"c",(function(){return P})),n.d(t,"d",(function(){return A})),n.d(t,"t",(function(){return z})),n.d(t,"i",(function(){return C})),n.d(t,"g",(function(){return H})),n.d(t,"m",(function(){return I})),n.d(t,"a",(function(){return T})),n.d(t,"b",(function(){return q})),n.d(t,"e",(function(){return B})),n.d(t,"f",(function(){return D})),n.d(t,"l",(function(){return N})),n.d(t,"u",(function(){return L})),n.d(t,"k",(function(){return R})),n.d(t,"h",(function(){return Y})),n.d(t,"s",(function(){return $}));var r=n("a34a"),i=n.n(r),a=n("e3d2"),c=n("34b9"),f=n("801b"),o=n("c7df"),u=n("080f");function s(e,t,n,r,i,a,c){try{var f=e[a](c),o=f.value}catch(u){return void n(u)}f.done?t(o):Promise.resolve(o).then(r,i)}function l(e){return function(){var t=this,n=arguments;return new Promise((function(r,i){var a=e.apply(t,n);function c(e){s(a,r,i,c,f,"next",e)}function f(e){s(a,r,i,c,f,"throw",e)}c(void 0)}))}}function d(e){return d="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},d(e)}function h(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function g(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?h(Object(n),!0).forEach((function(t){b(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):h(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function b(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function p(e){var t={bb:[],sbb:[],ubb:[]};if(!e)return t;var n=[],r=function(e){return"66"===e["passive id"]&&e["triggered effect"].some((function(e){return a["a"].includes(e["proc id"]||e["unknown proc id"])}))},i=function(e,t){e["triggered effect"].filter((function(e){return a["a"].includes(e["proc id"]||e["unknown proc id"])})).forEach((function(r){n.push(g({},r,{source:t,"trigger on bb":e["trigger on bb"],"trigger on sbb":e["trigger on sbb"],"trigger on ubb":e["trigger on ubb"]}))}))};if(e["extra skill"]){var c=e["extra skill"].effects,f=void 0===c?[]:c;f.filter(r).forEach((function(e){return i(e,"ES")}))}return e.feskills&&e.feskills.map((function(e){return e.skill.effects})).reduce((function(e,t){return e.concat(t)}),[]).filter((function(e){return e.passive&&r(e.passive)})).map((function(e){return e.passive})).forEach((function(e){return i(e,"SP")})),n.forEach((function(e){var n=Object.keys(t);n.forEach((function(n){e["trigger on ".concat(n)]&&t[n].push(e)}))})),t}function m(e){return c["F"][+e]}function y(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=[];return e.skill.effects.forEach((function(e){Object.keys(e).forEach((function(n){var r=e[n];t.push(g({sp_type:n},r))}))})),t}function v(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=Array.isArray(e)&&e.length>0;return n&&t?t.split("").map((function(t){return e[k(t)]})).filter((function(e){return e})).reduce((function(e,t){return e+ +t.skill.bp}),0):0}function k(e){return e.charCodeAt(0)-(e<"a"?"A".charCodeAt(0):"a".charCodeAt(0))+(e<"a"?0:26)}function O(e){return String.fromCharCode(e>=26?e-26+"a".charCodeAt(0):e+"A".charCodeAt(0))}function S(e,t){return e&&Array.isArray(t)?e.split("").map((function(e){return t[k(e)]})).filter((function(e){return e})):[]}function w(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=e;return"object"===d(t)&&(t=e.id),e.includes("@")?e.split("@")[1]:e}function x(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=w(e);return t.find((function(e){return w(e.id).toString()===n}))}function j(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.skill,n=t.desc,r=void 0===n?"":n,i=t.name,a=void 0===i?"":i;return r.trim()===a.trim()?r||"No Description":r.length>a.length?r:[a,r?"(".concat(r,")"):""].filter((function(e){return e})).join(" ")}function _(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=x(e.dependency,t);return n?'Requires "'.concat(j(n),'"'):e["dependency comment"]||"Requires another enhancement"}function P(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=[];if(e.dependency){var r=w(e.dependency),i=t.findIndex((function(e){return w(e.id).toString()===r}));if(i>-1){n.push(O(i));var a=P(t[i],t);a.forEach((function(e){n.push(e)}))}}return n}function A(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=t.map((function(e,t){return{entry:e,index:t}})).filter((function(t){var n=t.entry;return n.dependency&&n.dependency.includes(e.id)})).map((function(e){var t=e.index;return O(t)})),r=n.map((function(e){return A(t[k(e)],t)})).reduce((function(e,t){return e.concat(t)}),[]);return Array.from(new Set(n.concat(r)))}function z(e){return e&&!!(e.prev||e.next||e.evo_mats)}function C(){return E.apply(this,arguments)}function E(){return E=l(i.a.mark((function e(){var t,n,r,a,c=arguments;return i.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(t=c.length>0&&void 0!==c[0]?c[0]:{},n=c.length>1&&void 0!==c[1]?c[1]:function(e){return{id:e}},z(t)){e.next=4;break}return e.abrupt("return",[]);case 4:r=[],a=t;case 6:if(!a.prev){e.next=12;break}return e.next=9,Promise.resolve(n(a.prev.toString()));case 9:a=e.sent,e.next=6;break;case 12:if(!a.next){e.next=19;break}return r.push({current:a.id.toString(),next:a.next,mats:a.evo_mats,cost:a.evo_cost}),e.next=16,Promise.resolve(n(a.next.toString()));case 16:a=e.sent,e.next=12;break;case 19:return e.abrupt("return",r);case 20:case"end":return e.stop()}}),e)}))),E.apply(this,arguments)}function H(e){var t=e&&e["damage frames"]&&e["damage frames"].hits>0;if(!t)return{hits:0,dropchecks:0};var n=+e["damage frames"].hits,r=+e["drop check count"]||0;return{hits:n,dropchecks:r*n}}function I(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=Object(u["j"])(e,["movement",t?"attack":"skill","move type"]);return c["B"][+n]}function W(e){var t=e.condition,n=void 0===t?"":t,r=e.target,i=void 0===r?"":r,a="party"===i;switch(n){case"hp_50pr_over":return"topHalf";case"hp_50pr_under":case"hp_75pr_under":return a?"beforeHealers":"middleAndBelow";case"hp_25pr_under":return a?"beforeHealers":"bottomHalf";default:break}if(!a)return"anywhere";switch(n){case"hp_max":return"afterHealers";case"hp_min":return"beforeHealers";default:return"anywhere"}}function T(e){var t={topHalf:"Top Half",anywhere:"Anywhere",middleAndBelow:"Middle or Lower Half",beforeHealers:"Anywhere Before Healers",bottomHalf:"Bottom Half",afterHealers:"Anywhere After Healers"};return t[e]}function q(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t="".concat(e["chance%"],"% chance"),n=c["i"][e.action]||e.action,r=c["k"][e["target type"]]||e["target type"],i=c["j"][e["target conditions"]]||e["target conditions"];return"".concat(t," to ").concat(n," ").concat(r," ").concat(i)}function B(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t="anywhere";if(!Array.isArray(e.ai))return[t];var n=e.ai.filter((function(e){return"skill"===e.action}));if(0===n.length)return[t];var r={};n.forEach((function(e){var t=e["target conditions"],n=e["chance%"],i=e["target type"];r[n]||(r[n]=[]),r[n].push({condition:t,target:i})}));var i=Object.keys(r).sort((function(e,t){return+t-+e})).map((function(e){return r[e]}))[0],a=Array.from(new Set(i.map(W)));return a}function D(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return[(e<=32&&t||e<=14&&!t)&&"Warrior",(e<=46&&t||e<=19&&!t)&&"Gladiator",(e<=52&&t||e<=35&&!t)&&"Conqueror","Hero"].filter((function(e){return e}))}function N(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(e){return{name:e}},n=9;n>=0;--n){var r="".concat(+e+n),i=t(r);if(i)return i}}function L(e){var t=["element","name","id"];return"object"===d(e)&&t.every((function(t){return void 0!==e[t]}))}function R(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"fire";return{id:0,name:e?c["I"].EMPTY:c["I"].ANY,rarity:1,element:t,cost:0,gender:"other",guide_id:0,kind:"normal"}}function U(e){var t,n=e.unit,r=void 0===n?{}:n,i=e.enhancements,a=(t={ls:[],es:[]},b(t,c["J"].BB,[]),b(t,c["J"].SBB,[]),b(t,c["J"].UBB,[]),b(t,"sp",[]),t);if(r["leader skill"]&&Array.isArray(r["leader skill"].effects)&&(a.ls=Array.from(r["leader skill"].effects).map((function(e){return g({},e,{sourcePath:"unit.ls"})}))),r["extra skill"]&&Array.isArray(r["extra skill"].effects)&&(a.es=Array.from(r["extra skill"].effects).map((function(e){return g({},e,{sourcePath:"unit.es"})}))),c["n"].forEach((function(e){var t=r[e]&&Array.isArray(r[e].levels)?Object(f["c"])(r[e]):{};Array.isArray(t.effects)&&(a[e]=Array.from(t.effects).map((function(t){return g({},t,{sourcePath:"unit.".concat(e)})})))})),Array.isArray(r.feskills)){var o="string"===typeof i&&i.length>0?Array.from(new Set(S(i,r.feskills))):r.feskills;a.sp=o.reduce((function(e,t){return e.concat(y(t).map((function(e){return g({},e,{sourcePath:"unit.sp",sourceSpCode:O(r.feskills.indexOf(t))})})))}),[])}return a}function Y(e){var t=e.unit,n=void 0===t?{}:t,r=e.target,i=void 0===r?c["L"].PARTY:r,a=e.effectType,f=void 0===a?c["H"].PROC:a,u=e.enhancements,s=e.whitelistedSources,l=void 0===s?["ls","es","bb","sbb","ubb","sp"]:s,d=U({unit:n,enhancements:u}),h=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];return l.includes(e)?t:[]};return Object(o["b"])({leaderSkillEffects:h("ls",d.ls),extraSkillEffects:h("es",d.es),nonUbbBurstEffects:h("bb",d.bb).concat(h("sbb",d.sbb)),ubbBurstEffects:h("ubb",d.ubb),spEnhancementEffects:h("sp",d.sp),target:i,effectType:f})}function $(e){var t=e.id,n=e.server,r=e.suffix,i=void 0===r?"":r,a="".concat(c["d"][n]||c["d"].gl,"/unit/img");return{ills_full:"".concat(a,"/unit_ills_full_").concat(t).concat(i,".png"),ills_thum:"".concat(a,"/unit_ills_thum_").concat(t).concat(i,".png"),anime:"".concat(a,"/unit_thum_").concat(t).concat(i,".png"),ills_battle:"".concat(a,"/unit_ills_battle_").concat(t).concat(i,".png")}}},"11b4":function(e,t,n){"use strict";var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("svg",{attrs:{width:e.displayWidth||e.imageWidth,height:e.displayHeight||e.imageHeight,viewBox:"0 0 "+e.imageWidth+" "+e.imageHeight,xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink"}},[e.imageTitle?n("title",{domProps:{textContent:e._s(e.imageTitle)}}):e._e(),e._t("before-image"),n("g",{staticClass:"lazy--placeholder",style:e.placeholderImageStyle,attrs:{imageWidth:e.imageWidth,imageHeight:e.imageHeight}},[e._t("placeholder",[n("image",{staticClass:"lazy--placeholder",attrs:{width:e.imageWidth,height:e.imageHeight,"xlink:href":e.placeholderSrc,href:e.placeholderSrc}})])],2),n("image",{staticClass:"lazy--actual",style:e.actualImageStyle,attrs:{width:e.imageWidth,height:e.imageHeight,"xlink:href":e.imageSource,href:e.imageSource}}),e._t("after-image")],2)},i=[],a={props:{imageTitle:{type:String,default:""},displayWidth:{type:Number,default:0},displayHeight:{type:Number,default:0},imageWidth:{type:Number,required:!0},imageHeight:{type:Number,required:!0},placeholderSrc:{type:String},src:{type:String,required:!0},isVisible:{default:!0}},computed:{placeholderImageStyle:function(){return"display: ".concat(this.imageLoaded?"none":"initial")},actualImageStyle:function(){return"display: ".concat(this.imageLoaded?"initial":"none")}},data:function(){return{imageLoaded:!1,imageSource:""}},mounted:function(){var e=this,t=this.$el.querySelector("image.lazy--actual");t.onload=function(){e.imageSource&&(e.imageLoaded=!0)},this.isVisible&&(this.imageSource=this.src)},watch:{isVisible:function(e){if(e&&!this.imageSource){var t=this.$el.querySelector("image.lazy--actual");t&&(this.imageSource=this.src)}}}},c=a,f=n("2877"),o=Object(f["a"])(c,r,i,!1,null,null,null),u=o.exports;t["a"]={props:{displayWidth:{type:Number,default:0},displayHeight:{type:Number,default:0},isVisible:{required:!1}},components:{LazyLoadImage:u}}},4427:function(e,t,n){"use strict";var r=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("generic-sprite-icon",{attrs:{iconTitle:e.spCategory,iconWidth:e.iconSize,iconHeight:e.iconSize,sheetWidth:e.sheetSize[0],sheetHeight:e.sheetSize[1],displayWidth:e.displaySize,displayHeight:e.displaySize,src:n("c487"),iconX:e.xCoord,iconY:e.yCoord}})},i=[],a=n("ef0e"),c=n("00e0"),f={props:{category:{type:Number,required:!0},displaySize:{type:Number,default:32}},components:{GenericSpriteIcon:a["a"]},computed:{spCategory:function(){return Object(c["n"])(this.category)},iconSize:function(){return 32},sheetSize:function(){return[192,64]},xCoord:function(){var e=this.category<=6?this.category-1:this.category-7;return e*this.iconSize},yCoord:function(){return this.iconSize*(this.category<=6?0:1)}}},o=f,u=n("2877"),s=Object(u["a"])(o,r,i,!1,null,null,null);t["a"]=s.exports},"801b":function(e,t,n){"use strict";n.d(t,"c",(function(){return b})),n.d(t,"b",(function(){return p})),n.d(t,"g",(function(){return m})),n.d(t,"f",(function(){return y})),n.d(t,"e",(function(){return O})),n.d(t,"i",(function(){return w})),n.d(t,"a",(function(){return x})),n.d(t,"j",(function(){return _})),n.d(t,"h",(function(){return P})),n.d(t,"d",(function(){return A}));var r=n("a34a"),i=n.n(r),a=n("e3d2"),c=n("34b9"),f=n("625a"),o=n("c7df");function u(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?u(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function d(e,t,n,r,i,a,c){try{var f=e[a](c),o=f.value}catch(u){return void n(u)}f.done?t(o):Promise.resolve(o).then(r,i)}function h(e){return function(){var t=this,n=arguments;return new Promise((function(r,i){var a=e.apply(t,n);function c(e){d(a,r,i,c,f,"next",e)}function f(e){d(a,r,i,c,f,"throw",e)}c(void 0)}))}}function g(e){return g="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},g(e)}function b(e,t){var n=Array.isArray(e.levels)?e.levels:[],r=void 0!==t?t:n.length-1;return n[r]}function p(e){if(!e)return{cost:0,hits:0,dropchecks:0};var t=b(e),n=t.effects.map((function(t,n){return{"proc id":t["proc id"]||t["unknown proc id"],hits:t.hits||(e["damage frames"][n]||{}).hits||0}})).filter((function(e){return a["a"].indexOf(e["proc id"])>-1})),r=n.reduce((function(e,t){return e+ +t.hits}),0),i=r*+e["drop check count"];return{cost:t["bc cost"],hits:r,dropchecks:i}}function m(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(e){return a["a"].includes(e.id)};if("object"!==g(e)||0===Object.keys(e).length)return[];var n=b(e);return e["damage frames"].map((function(e,t){var r=n.effects[t];return{target:c["K"][r["random attack"]?"random":r["target area"]],id:(e["proc id"]||e["unknown proc id"]).toString(),frames:e,delay:r["effect delay time(ms)/frame"],effects:r}})).filter(t)}function y(e){return m(e,(function(e){return"2"===e.id}))}function v(e){return k.apply(this,arguments)}function k(){return k=h(i.a.mark((function e(t){var n,r,a;return i.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return n=m(t).map((function(e){return e.frames})),r=y(t).map((function(e){return e.frames})),e.next=4,f["a"].run((function(e,t){var n=[],r=[];e.forEach((function(e,t){var i=0===t;n=n.concat(e["frame times"].slice(i?0:1)),r=r.concat(e["hit dmg% distribution"].slice(i?0:1))})),t.forEach((function(t,i){var a=0===i&&0===e.length;n=n.concat(t["frame times"].slice(a?0:1)),r=r.concat(t["hit dmg% distribution"].slice(a?0:1))}));var i=[];n.forEach((function(e,t){i.push({time:e,dmg:r[t]})}));var a={"frame times":[],"hit dmg% distribution":[]};return i.sort((function(e,t){return e.time-t.time})).forEach((function(e){var t=e.time,n=e.dmg;a["frame times"].push(t),a["hit dmg% distribution"].push(n)})),a}),[n,r]);case 4:return a=e.sent,e.abrupt("return",a);case 6:case"end":return e.stop()}}),e)}))),k.apply(this,arguments)}function O(e){return S.apply(this,arguments)}function S(){return S=h(i.a.mark((function e(t){var n,r,a,f,o=arguments;return i.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(n=o.length>1&&void 0!==o[1]?o[1]:[],r=!(o.length>2&&void 0!==o[2])||o[2],t){e.next=4;break}return e.abrupt("return",[]);case 4:return a=n.slice(),e.next=7,v(t);case 7:return f=e.sent,r&&a.push({"target area":"single","proc id":"1","effect delay time(ms)/frame":"0.0/0",source:"Wiles Sphere"}),e.abrupt("return",a.map((function(e){return{target:c["K"][e["random attack"]?"random":e["target area"]],id:(e["proc id"]||e["unknown proc id"]).toString(),frames:f,effects:e,delay:e["effect delay time(ms)/frame"],source:e.source}})));case 10:case"end":return e.stop()}}),e)}))),S.apply(this,arguments)}function w(e){return e["hit dmg% distribution"].reduce((function(e,t){return e+t}),0)}function x(e,t){return j.apply(this,arguments)}function j(){return j=h(i.a.mark((function e(t,n){var r;return i.a.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,f["a"].run((function(e,t){var n={},r=function(e,t,r){var i=e.toString();n[i]||(n[i]=[]),n[i].push({index:t,type:r})};e.forEach((function(e,t){var n=+e.delay.split("/")[1],i=e.frames["frame times"];i.forEach((function(e){r(+e+n,t,"native")}))})),t.forEach((function(e,t){var n=+e.delay.split("/")[1],i=e.frames["frame times"];i.forEach((function(e){r(+e+n,t,"extra")}))}));var i={};for(var a in n){var c=n[a];c.length>1&&(i[a]=c.slice())}return i}),[t,n]);case 2:return r=e.sent,e.abrupt("return",r);case 4:case"end":return e.stop()}}),e)}))),j.apply(this,arguments)}function _(e,t,n){var r=+t.split("/")[1];return n&&e["frame times"].some((function(e){return!!n[(+e+r).toString()]}))}function P(e,t,n){if(!n)return 0;var r=+t.split("/")[1];return e["frame times"].filter((function(e){return(n[+e+r]||[]).length>0})).length}function A(e){var t=e.burst,n=void 0===t?{}:t,r=e.target,i=void 0===r?c["L"].PARTY:r,a=e.effectType,f=void 0===a?c["H"].PROC:a,u=b(n)||{},l=(Array.isArray(u.effects)?u.effects:[]).map((function(e){return s({},e,{sourcePath:"Burst: ".concat(n.name||"(No name found)"," (").concat(n.id,")")})}));return Object(o["b"])({nonUbbBurstEffects:l,target:i,effectType:f})}},"9b77":function(e,t,n){e.exports=n.p+"img/question_frame_2.61153f81.png"},a604:function(e,t,n){e.exports=n.p+"img/question_frame_3.70b4f3e1.png"},ac4c:function(e,t,n){"use strict";var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("lazy-load-image",{attrs:{imageTitle:e.imageTitle,displayWidth:e.displayWidth,displayHeight:e.displayHeight,imageWidth:e.imageDimensions[0],imageHeight:e.imageDimensions[1],placeholderSrc:e.placeHolderSrc,src:e.hasActualImage&&e.src||"",isVisible:e.isVisible}},[n("g",{attrs:{slot:"before-image"},slot:"before-image"},[e._t("before-image")],2),n("g",{attrs:{slot:"after-image"},slot:"after-image"},[e._t("after-image")],2)])},i=[],a=n("11b4"),c=n("34b9"),f={mixins:[a["a"]],props:{src:{type:String,required:!0},imageTitle:{type:String,default:""},rarity:{type:Number,default:1}},computed:{placeHolderSrc:function(){return this.rarity>=5?n("b4d1"):4===this.rarity?n("a604"):3===this.rarity?n("9b77"):n("fc1b")},imageDimensions:function(){return[102,102]},hasActualImage:function(){var e=this,t=function(e){return"".concat(e,".png")};return![c["I"].EMPTY,c["I"].ANY].some((function(n){return e.src.endsWith(t(n))}))}}},o=f,u=n("2877"),s=Object(u["a"])(o,r,i,!1,null,null,null);t["a"]=s.exports},b4d1:function(e,t,n){e.exports=n.p+"img/question_frame_4.6f047951.png"},c0a4:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.freeze({base:"#f44336",lighten5:"#ffebee",lighten4:"#ffcdd2",lighten3:"#ef9a9a",lighten2:"#e57373",lighten1:"#ef5350",darken1:"#e53935",darken2:"#d32f2f",darken3:"#c62828",darken4:"#b71c1c",accent1:"#ff8a80",accent2:"#ff5252",accent3:"#ff1744",accent4:"#d50000"}),i=Object.freeze({base:"#e91e63",lighten5:"#fce4ec",lighten4:"#f8bbd0",lighten3:"#f48fb1",lighten2:"#f06292",lighten1:"#ec407a",darken1:"#d81b60",darken2:"#c2185b",darken3:"#ad1457",darken4:"#880e4f",accent1:"#ff80ab",accent2:"#ff4081",accent3:"#f50057",accent4:"#c51162"}),a=Object.freeze({base:"#9c27b0",lighten5:"#f3e5f5",lighten4:"#e1bee7",lighten3:"#ce93d8",lighten2:"#ba68c8",lighten1:"#ab47bc",darken1:"#8e24aa",darken2:"#7b1fa2",darken3:"#6a1b9a",darken4:"#4a148c",accent1:"#ea80fc",accent2:"#e040fb",accent3:"#d500f9",accent4:"#aa00ff"}),c=Object.freeze({base:"#673ab7",lighten5:"#ede7f6",lighten4:"#d1c4e9",lighten3:"#b39ddb",lighten2:"#9575cd",lighten1:"#7e57c2",darken1:"#5e35b1",darken2:"#512da8",darken3:"#4527a0",darken4:"#311b92",accent1:"#b388ff",accent2:"#7c4dff",accent3:"#651fff",accent4:"#6200ea"}),f=Object.freeze({base:"#3f51b5",lighten5:"#e8eaf6",lighten4:"#c5cae9",lighten3:"#9fa8da",lighten2:"#7986cb",lighten1:"#5c6bc0",darken1:"#3949ab",darken2:"#303f9f",darken3:"#283593",darken4:"#1a237e",accent1:"#8c9eff",accent2:"#536dfe",accent3:"#3d5afe",accent4:"#304ffe"}),o=Object.freeze({base:"#2196f3",lighten5:"#e3f2fd",lighten4:"#bbdefb",lighten3:"#90caf9",lighten2:"#64b5f6",lighten1:"#42a5f5",darken1:"#1e88e5",darken2:"#1976d2",darken3:"#1565c0",darken4:"#0d47a1",accent1:"#82b1ff",accent2:"#448aff",accent3:"#2979ff",accent4:"#2962ff"}),u=Object.freeze({base:"#03a9f4",lighten5:"#e1f5fe",lighten4:"#b3e5fc",lighten3:"#81d4fa",lighten2:"#4fc3f7",lighten1:"#29b6f6",darken1:"#039be5",darken2:"#0288d1",darken3:"#0277bd",darken4:"#01579b",accent1:"#80d8ff",accent2:"#40c4ff",accent3:"#00b0ff",accent4:"#0091ea"}),s=Object.freeze({base:"#00bcd4",lighten5:"#e0f7fa",lighten4:"#b2ebf2",lighten3:"#80deea",lighten2:"#4dd0e1",lighten1:"#26c6da",darken1:"#00acc1",darken2:"#0097a7",darken3:"#00838f",darken4:"#006064",accent1:"#84ffff",accent2:"#18ffff",accent3:"#00e5ff",accent4:"#00b8d4"}),l=Object.freeze({base:"#009688",lighten5:"#e0f2f1",lighten4:"#b2dfdb",lighten3:"#80cbc4",lighten2:"#4db6ac",lighten1:"#26a69a",darken1:"#00897b",darken2:"#00796b",darken3:"#00695c",darken4:"#004d40",accent1:"#a7ffeb",accent2:"#64ffda",accent3:"#1de9b6",accent4:"#00bfa5"}),d=Object.freeze({base:"#4caf50",lighten5:"#e8f5e9",lighten4:"#c8e6c9",lighten3:"#a5d6a7",lighten2:"#81c784",lighten1:"#66bb6a",darken1:"#43a047",darken2:"#388e3c",darken3:"#2e7d32",darken4:"#1b5e20",accent1:"#b9f6ca",accent2:"#69f0ae",accent3:"#00e676",accent4:"#00c853"}),h=Object.freeze({base:"#8bc34a",lighten5:"#f1f8e9",lighten4:"#dcedc8",lighten3:"#c5e1a5",lighten2:"#aed581",lighten1:"#9ccc65",darken1:"#7cb342",darken2:"#689f38",darken3:"#558b2f",darken4:"#33691e",accent1:"#ccff90",accent2:"#b2ff59",accent3:"#76ff03",accent4:"#64dd17"}),g=Object.freeze({base:"#cddc39",lighten5:"#f9fbe7",lighten4:"#f0f4c3",lighten3:"#e6ee9c",lighten2:"#dce775",lighten1:"#d4e157",darken1:"#c0ca33",darken2:"#afb42b",darken3:"#9e9d24",darken4:"#827717",accent1:"#f4ff81",accent2:"#eeff41",accent3:"#c6ff00",accent4:"#aeea00"}),b=Object.freeze({base:"#ffeb3b",lighten5:"#fffde7",lighten4:"#fff9c4",lighten3:"#fff59d",lighten2:"#fff176",lighten1:"#ffee58",darken1:"#fdd835",darken2:"#fbc02d",darken3:"#f9a825",darken4:"#f57f17",accent1:"#ffff8d",accent2:"#ffff00",accent3:"#ffea00",accent4:"#ffd600"}),p=Object.freeze({base:"#ffc107",lighten5:"#fff8e1",lighten4:"#ffecb3",lighten3:"#ffe082",lighten2:"#ffd54f",lighten1:"#ffca28",darken1:"#ffb300",darken2:"#ffa000",darken3:"#ff8f00",darken4:"#ff6f00",accent1:"#ffe57f",accent2:"#ffd740",accent3:"#ffc400",accent4:"#ffab00"}),m=Object.freeze({base:"#ff9800",lighten5:"#fff3e0",lighten4:"#ffe0b2",lighten3:"#ffcc80",lighten2:"#ffb74d",lighten1:"#ffa726",darken1:"#fb8c00",darken2:"#f57c00",darken3:"#ef6c00",darken4:"#e65100",accent1:"#ffd180",accent2:"#ffab40",accent3:"#ff9100",accent4:"#ff6d00"}),y=Object.freeze({base:"#ff5722",lighten5:"#fbe9e7",lighten4:"#ffccbc",lighten3:"#ffab91",lighten2:"#ff8a65",lighten1:"#ff7043",darken1:"#f4511e",darken2:"#e64a19",darken3:"#d84315",darken4:"#bf360c",accent1:"#ff9e80",accent2:"#ff6e40",accent3:"#ff3d00",accent4:"#dd2c00"}),v=Object.freeze({base:"#795548",lighten5:"#efebe9",lighten4:"#d7ccc8",lighten3:"#bcaaa4",lighten2:"#a1887f",lighten1:"#8d6e63",darken1:"#6d4c41",darken2:"#5d4037",darken3:"#4e342e",darken4:"#3e2723"}),k=Object.freeze({base:"#607d8b",lighten5:"#eceff1",lighten4:"#cfd8dc",lighten3:"#b0bec5",lighten2:"#90a4ae",lighten1:"#78909c",darken1:"#546e7a",darken2:"#455a64",darken3:"#37474f",darken4:"#263238"}),O=Object.freeze({base:"#9e9e9e",lighten5:"#fafafa",lighten4:"#f5f5f5",lighten3:"#eeeeee",lighten2:"#e0e0e0",lighten1:"#bdbdbd",darken1:"#757575",darken2:"#616161",darken3:"#424242",darken4:"#212121"}),S=Object.freeze({black:"#000000",white:"#ffffff",transparent:"transparent"});t.default=Object.freeze({red:r,pink:i,purple:a,deepPurple:c,indigo:f,blue:o,lightBlue:u,cyan:s,teal:l,green:d,lightGreen:h,lime:g,yellow:b,amber:p,orange:m,deepOrange:y,brown:v,blueGrey:k,grey:O,shades:S})},c487:function(e,t,n){e.exports=n.p+"img/sphere_icon_hexa.a7e7dac2.png"},de7e:function(e,t,n){"use strict";var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("base-entry-card",{attrs:{to:e.to||void 0}},[n("v-container",{staticClass:"pa-3",attrs:{fluid:""}},[n("v-layout",{attrs:{row:""}},[n("v-flex",{staticClass:"text-xs-center d-align-self-center pb-0",attrs:{xs3:""}},[n("unit-thumbnail",{attrs:{src:e.getImageUrls(e.entry.id).ills_thum,rarity:e.rarity,imageTitle:e.entry.name,displayWidth:e.thumbnailSize,displayHeight:e.thumbnailSize}})],1),n("v-flex",{staticClass:"pb-0",attrs:{xs9:""}},[n("v-container",{staticClass:"pa-0",attrs:{fluid:""}},[n("v-layout",{attrs:{row:""}},[n("v-flex",[n("div",{staticClass:"d-flex-container items-center"},[e.entry.element?n("element-icon",{staticClass:"mr-1",attrs:{element:e.entry.element,displaySize:20}}):e._e(),n("h1",{staticClass:"subheading d-inline-block",staticStyle:{"word-break":"break-word"}},[n("b",{domProps:{textContent:e._s(e.entry.name||e.entry.id)}})])],1)])],1),n("v-layout",{attrs:{row:""}},[n("v-flex",{attrs:{xs4:""}},[n("h2",{staticClass:"subheading",staticStyle:{"white-space":"nowrap"}},[e._v("# "+e._s(e.entry.guide_id))])]),n("v-flex",{staticClass:"text-xs-center",attrs:{xs4:""}},[n("v-icon",{attrs:{color:e.genderIconInfo.color}},[e._v("fas "+e._s(e.genderIconInfo.icon))])],1),n("v-flex",{staticClass:"text-xs-right d-align-self-center",attrs:{xs4:""}},[n("div",{staticClass:"d-flex-container items-center content-flex-end"},[e.rarity<8?n("span",[e._v(e._s(e.rarity))]):e._e(),n("rarity-icon",{class:{"ml-1":8!==e.rarity},attrs:{rarity:e.rarity,displaySize:18}})],1)])],1),e.sp&&e.getSpCost(e.entry)>0?n("v-layout",[n("v-flex",{staticClass:"mr-1",staticStyle:{"flex-grow":"0"}},[e._v("\n              "+e._s(e.getSpCost(e.entry))+" SP:\n            ")]),e._l(e.getSpCategories(e.entry),(function(t){return n("v-flex",{key:t+"-"+e.entry.id,staticStyle:{"flex-grow":"0"}},[n("sp-icon",{attrs:{category:t,displaySize:22}})],1)}))],2):e._e()],1)],1)],1)],1)],1)},i=[],a=n("2f62"),c=n("080f"),f=n("00e0"),o=n("50a6"),u=n("2918"),s=n("69c9"),l=n("4427"),d=n("ac4c");function h(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function g(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?h(Object(n),!0).forEach((function(t){b(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):h(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function b(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var p={mixins:[o["a"]],props:{sp:{type:String,default:""}},components:{ElementIcon:u["a"],RarityIcon:s["a"],UnitThumbnail:d["a"],SpIcon:l["a"]},computed:g({},Object(a["c"])("units",["getImageUrls"]),{genderIconInfo:function(){return Object(c["i"])(this.entry.gender)},rarity:function(){return this.entry.rarity},thumbnailSize:function(){var e=this.$vuetify.breakpoint;return e.xlOnly?64:e.mdAndUp?56:48}}),methods:{getSpCategories:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.feskills,n=this.sp;if(!t||!n)return[];var r=Object(f["v"])(n,t).map((function(e){return+e.category}));return Array.from(new Set(r))},getSpCost:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.feskills,n=this.sp;return t&&n?n.split("").map((function(e){return t[Object(f["w"])(e)]})).filter((function(e){return e})).reduce((function(e,t){return e+ +t.skill.bp}),0):0}}},m=p,y=n("2877"),v=Object(y["a"])(m,r,i,!1,null,null,null);t["a"]=v.exports},fc1b:function(e,t,n){e.exports=n.p+"img/question_frame_1.ddabf6eb.png"}}]);
//# sourceMappingURL=bursts~compare~extraSkills~items~leaderSkills~squads~tierlist~units.623f8b1a.js.map