(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["bursts~units"],{"00e0":function(t,e,r){"use strict";r.d(e,"f",function(){return d}),r.d(e,"i",function(){return p}),r.d(e,"j",function(){return h}),r.d(e,"l",function(){return m}),r.d(e,"m",function(){return v}),r.d(e,"k",function(){return b}),r.d(e,"e",function(){return g}),r.d(e,"d",function(){return x}),r.d(e,"h",function(){return k}),r.d(e,"a",function(){return _}),r.d(e,"b",function(){return S}),r.d(e,"c",function(){return O}),r.d(e,"g",function(){return C});var n=r("a34a"),a=r.n(n),i=r("e3d2"),u=r("34b9"),o=r("080f");function c(t,e,r,n,a,i,u){try{var o=t[i](u),c=o.value}catch(s){return void r(s)}o.done?e(c):Promise.resolve(c).then(n,a)}function s(t){return function(){var e=this,r=arguments;return new Promise(function(n,a){var i=t.apply(e,r);function u(t){c(i,n,a,u,o,"next",t)}function o(t){c(i,n,a,u,o,"throw",t)}u(void 0)})}}function f(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{},n=Object.keys(r);"function"===typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),n.forEach(function(e){l(t,e,r[e])})}return t}function l(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function d(t){var e={bb:[],sbb:[],ubb:[]};if(!t)return e;var r=[],n=function(t){return"66"===t["passive id"]&&t["triggered effect"].some(function(t){return i["a"].includes(t["proc id"]||t["unknown proc id"])})},a=function(t,e){t["triggered effect"].filter(function(t){return i["a"].includes(t["proc id"]||t["unknown proc id"])}).forEach(function(n){r.push(f({},n,{source:e,"trigger on bb":t["trigger on bb"],"trigger on sbb":t["trigger on sbb"],"trigger on ubb":t["trigger on ubb"]}))})};if(t["extra skill"]){var u=t["extra skill"].effects,o=void 0===u?[]:u;o.filter(n).forEach(function(t){return a(t,"ES")})}return t.feskills&&t.feskills.map(function(t){return t.skill.effects}).reduce(function(t,e){return t.concat(e)},[]).filter(function(t){return t.passive&&n(t.passive)}).map(function(t){return t.passive}).forEach(function(t){return a(t,"SP")}),r.forEach(function(t){var r=Object.keys(e);r.forEach(function(r){t["trigger on ".concat(r)]&&e[r].push(t)})}),e}function p(t){return u["u"][+t]}function h(t){var e=[];return t.skill.effects.forEach(function(t){Object.keys(t).forEach(function(r){var n=t[r];e.push(f({sp_type:r},n))})}),e}function m(t){return t.charCodeAt(0)-(t<"a"?"A".charCodeAt(0):"a".charCodeAt(0))+(t<"a"?0:26)}function v(t){return String.fromCharCode(t>=26?t-26+"a".charCodeAt(0):t+"A".charCodeAt(0))}function b(t){return t&&!!(t.prev||t.next||t.evo_mats)}function g(){return y.apply(this,arguments)}function y(){return y=s(a.a.mark(function t(){var e,r,n,i,u=arguments;return a.a.wrap(function(t){while(1)switch(t.prev=t.next){case 0:if(e=u.length>0&&void 0!==u[0]?u[0]:{},r=u.length>1&&void 0!==u[1]?u[1]:function(t){return{id:t}},b(e)){t.next=4;break}return t.abrupt("return",[]);case 4:n=[],i=e;case 6:if(!i.prev){t.next=12;break}return t.next=9,Promise.resolve(r(i.prev.toString()));case 9:i=t.sent,t.next=6;break;case 12:if(!i.next){t.next=19;break}return n.push({current:i.id.toString(),next:i.next,mats:i.evo_mats,cost:i.evo_cost}),t.next=16,Promise.resolve(r(i.next.toString()));case 16:i=t.sent,t.next=12;break;case 19:return t.abrupt("return",n);case 20:case"end":return t.stop()}},t,this)})),y.apply(this,arguments)}function x(t){var e=t&&t["damage frames"]&&t["damage frames"].hits>0;if(!e)return{hits:0,dropchecks:0};var r=+t["damage frames"].hits,n=+t["drop check count"]||0;return{hits:r,dropchecks:n*r}}function k(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],r=Object(o["i"])(t,["movement",e?"attack":"skill","move type"]);return u["q"][+r]}function w(t){var e=t.condition,r=void 0===e?"":e,n=t.target,a=void 0===n?"":n,i="party"===a;switch(r){case"hp_50pr_over":return"topHalf";case"hp_50pr_under":case"hp_75pr_under":return i?"beforeHealers":"middleAndBelow";case"hp_25pr_under":return i?"beforeHealers":"bottomHalf";default:break}if(!i)return"anywhere";switch(r){case"hp_max":return"afterHealers";case"hp_min":return"beforeHealers";default:return"anywhere"}}function _(t){var e={topHalf:"Top Half",anywhere:"Anywhere",middleAndBelow:"Middle or Lower Half",beforeHealers:"Anywhere Before Healers",bottomHalf:"Bottom Half",afterHealers:"Anywhere After Healers"};return e[t]}function S(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e="anywhere";if(!Array.isArray(t.ai))return[e];var r=t.ai.filter(function(t){return"skill"===t.action});if(0===r.length)return[e];var n={};r.forEach(function(t){var e=t["target conditions"],r=t["chance%"],a=t["target type"];n[r]||(n[r]=[]),n[r].push({condition:e,target:a})});var a=Object.keys(n).sort(function(t,e){return+e-+t}).map(function(t){return n[t]})[0],i=Array.from(new Set(a.map(w)));return i}function O(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return[(t<=32&&e||t<=14&&!e)&&"Warrior",(t<=46&&e||t<=19&&!e)&&"Gladiator",(t<=52&&e||t<=35&&!e)&&"Conqueror","Hero"].filter(function(t){return t})}function C(){for(var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(t){return{name:t}},r=9;r>=0;--r){var n="".concat(+t+r),a=e(n);if(a)return a}}},"4e02":function(t,e,r){"use strict";var n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("v-container",{staticClass:"hitcount-table",attrs:{fluid:""}},[t.hasSparks?r("v-layout",{attrs:{row:"",wrap:""}},[r("v-flex",{attrs:{xs12:""}},[r("b",[t._v("Note:")]),t._v(" No delays are added to these visible values, but sparked rows are calculated using unit delays.\n    ")]),t._l(t.legendColors,function(e,n){return r("v-flex",{key:n,class:{"pr-1":t.$vuetify.breakpoint.smAndUp},attrs:{xs12:"",sm6:"",md3:""}},[r("b",{class:e.class},[t._v(t._s(e.label)+": ")]),r("span",{domProps:{innerHTML:t._s(e.desc)}})])})],2):t._e(),r("v-layout",{staticClass:"hitcount-table--headers d-align-items-center",attrs:{row:""}},t._l(t.headers,function(e,n){return r("v-flex",{key:n,staticClass:"text-xs-center",attrs:{xs4:""}},[r("b",[t._v(t._s(e.text))])])})),r("v-layout",{attrs:{row:""}},[r("v-flex",t._l(t.items,function(e,n){return r("v-layout",{key:n,class:{"text-xs-center hitcount-table--row d-align-items-center":!0,"blue--text":"native"===t.selfSparkType(e),"orange--text":"extra"===t.selfSparkType(e),"purple--text text--lighten-2":"both"===t.selfSparkType(e)},attrs:{row:""}},t._l(t.headers,function(n,a){return r("v-flex",{key:a,staticClass:"text-xs-center",attrs:{xs4:""}},[t._v("\n          "+t._s(e[n.value])+"\n        ")])}))}))],1)],1)},a=[],i={props:{attack:{type:Object},sparkedFrames:{type:Object,default:function(){}},attackIndex:{type:Number,default:0},attackType:{type:String,default:""},delay:{type:Number,default:0}},computed:{headers:function(){return[{text:"Hit #",sortable:!1,value:"hitNum",align:"center"},{text:"Frame #",sortable:!1,value:"frameNum",align:"center"},{text:"DMG% per hit",sortable:!1,value:"damage",align:"center"},{text:"Frame Diff",sortable:!1,value:"diff",align:"center"}]},items:function(){var t=this;return this.attack["frame times"].map(function(e,r){return{hitNum:r+1,frameNum:e,damage:t.attack["hit dmg% distribution"][r],diff:0===r?0:e-t.attack["frame times"][r-1]}})},legendColors:function(){return[{label:"Default Color Text",desc:"No sparks"},{label:"Blue Text",desc:'Sparks with an attack that <u>is not</u> from ES/SP/Items (i.e. "native" attacks)',class:"blue--text"},{label:"Orange Text",desc:'Sparks with an attack that <u>is</u> from ES/SP/Items (i.e. "extra" attacks)',class:"orange--text"},{label:"Purple Text",desc:"Sparks with at least one native attack and one extra attack",class:"purple--text text--lighten-2"}]}},data:function(){return{hasSparks:!1}},methods:{selfSparkType:function(t){var e=this,r=(this.sparkedFrames||{})[(t.frameNum+this.delay).toString()];if(!r)return"";this.hasSparks=!0;var n=r.filter(function(t){var r=t.index,n=t.type;return!(r===e.attackIndex&&n===e.attackType)}).map(function(t){var e=t.type;return e}),a=n.some(function(t){return"native"===t}),i=n.some(function(t){return"extra"===t});return a&&i?"both":a?"native":"extra"}}},u=i,o=(r("e259"),r("2877")),c=Object(o["a"])(u,n,a,!1,null,null,null);e["a"]=c.exports},"801b":function(t,e,r){"use strict";r.d(e,"b",function(){return l}),r.d(e,"d",function(){return d}),r.d(e,"c",function(){return v}),r.d(e,"f",function(){return g}),r.d(e,"a",function(){return y}),r.d(e,"g",function(){return k}),r.d(e,"e",function(){return w});var n=r("a34a"),a=r.n(n),i=r("e3d2"),u=r("34b9"),o=r("625a");function c(t,e,r,n,a,i,u){try{var o=t[i](u),c=o.value}catch(s){return void r(s)}o.done?e(c):Promise.resolve(c).then(n,a)}function s(t){return function(){var e=this,r=arguments;return new Promise(function(n,a){var i=t.apply(e,r);function u(t){c(i,n,a,u,o,"next",t)}function o(t){c(i,n,a,u,o,"throw",t)}u(void 0)})}}function f(t,e){var r=void 0!==e?e:t.levels.length-1;return t.levels[r]}function l(t){if(!t)return{cost:0,hits:0,dropchecks:0};var e=f(t),r=e.effects.map(function(e,r){return{"proc id":e["proc id"]||e["unknown proc id"],hits:e.hits||(t["damage frames"][r]||{}).hits||0}}).filter(function(t){return i["a"].indexOf(t["proc id"])>-1}),n=r.reduce(function(t,e){return t+ +e.hits},0),a=n*+t["drop check count"];return{cost:e["bc cost"],hits:n,dropchecks:a}}function d(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(t){return i["a"].includes(t.id)};if(!t)return[];var r=f(t);return t["damage frames"].map(function(t,e){var n=r.effects[e];return{target:u["w"][n["random attack"]?"random":n["target area"]],id:(t["proc id"]||t["unknown proc id"]).toString(),frames:t,delay:n["effect delay time(ms)/frame"],effects:n}}).filter(e)}function p(t){return d(t,function(t){return"2"===t.id})}function h(t){return m.apply(this,arguments)}function m(){return m=s(a.a.mark(function t(e){var r,n,i;return a.a.wrap(function(t){while(1)switch(t.prev=t.next){case 0:return r=d(e).map(function(t){return t.frames}),n=p(e).map(function(t){return t.frames}),t.next=4,o["a"].run(function(t,e){var r=[],n=[];t.forEach(function(t,e){var a=0===e;r=r.concat(t["frame times"].slice(a?0:1)),n=n.concat(t["hit dmg% distribution"].slice(a?0:1))}),e.forEach(function(e,a){var i=0===a&&0===t.length;r=r.concat(e["frame times"].slice(i?0:1)),n=n.concat(e["hit dmg% distribution"].slice(i?0:1))});var a=[];r.forEach(function(t,e){a.push({time:t,dmg:n[e]})});var i={"frame times":[],"hit dmg% distribution":[]};return a.sort(function(t,e){return t.time-e.time}).forEach(function(t){var e=t.time,r=t.dmg;i["frame times"].push(e),i["hit dmg% distribution"].push(r)}),i},[r,n]);case 4:return i=t.sent,t.abrupt("return",i);case 6:case"end":return t.stop()}},t,this)})),m.apply(this,arguments)}function v(t){return b.apply(this,arguments)}function b(){return b=s(a.a.mark(function t(e){var r,n,i,o,c=arguments;return a.a.wrap(function(t){while(1)switch(t.prev=t.next){case 0:if(r=c.length>1&&void 0!==c[1]?c[1]:[],n=!(c.length>2&&void 0!==c[2])||c[2],e){t.next=4;break}return t.abrupt("return",[]);case 4:return i=r.slice(),t.next=7,h(e);case 7:return o=t.sent,n&&i.push({"target area":"single","proc id":"1","effect delay time(ms)/frame":"0.0/0",source:"Wiles Sphere"}),t.abrupt("return",i.map(function(t){return{target:u["w"][t["random attack"]?"random":t["target area"]],id:(t["proc id"]||t["unknown proc id"]).toString(),frames:o,effects:t,delay:t["effect delay time(ms)/frame"],source:t.source}}));case 10:case"end":return t.stop()}},t,this)})),b.apply(this,arguments)}function g(t){return t["hit dmg% distribution"].reduce(function(t,e){return t+e},0)}function y(t,e){return x.apply(this,arguments)}function x(){return x=s(a.a.mark(function t(e,r){var n;return a.a.wrap(function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,o["a"].run(function(t,e){var r={},n=function(t,e,n){var a=t.toString();r[a]||(r[a]=[]),r[a].push({index:e,type:n})};t.forEach(function(t,e){var r=+t.delay.split("/")[1],a=t.frames["frame times"];a.forEach(function(t){n(+t+r,e,"native")})}),e.forEach(function(t,e){var r=+t.delay.split("/")[1],a=t.frames["frame times"];a.forEach(function(t){n(+t+r,e,"extra")})});var a={};for(var i in r){var u=r[i];u.length>1&&(a[i]=u.slice())}return a},[e,r]);case 2:return n=t.sent,t.abrupt("return",n);case 4:case"end":return t.stop()}},t,this)})),x.apply(this,arguments)}function k(t,e,r){var n=+e.split("/")[1];return r&&t["frame times"].some(function(t){return!!r[(+t+n).toString()]})}function w(t,e,r){if(!r)return 0;var n=+e.split("/")[1];return t["frame times"].filter(function(t){return(r[+t+n]||[]).length>0}).length}},de7e:function(t,e,r){"use strict";var n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("base-entry-card",{attrs:{to:t.to}},[r("v-container",{staticClass:"pa-3",attrs:{fluid:""}},[r("v-layout",{attrs:{row:""}},[r("v-flex",{staticClass:"text-xs-center d-align-self-center pb-0",attrs:{xs3:""}},[r("unit-thumbnail",{attrs:{src:t.getImageUrls(t.entry.id).ills_thum,rarity:t.rarity,imageTitle:t.entry.name,displayWidth:t.thumbnailSize,displayHeight:t.thumbnailSize}})],1),r("v-flex",{staticClass:"pb-0",attrs:{xs9:""}},[r("v-container",{staticClass:"pa-0",attrs:{fluid:""}},[r("v-layout",{attrs:{row:""}},[r("v-flex",[r("div",{staticClass:"d-flex-container items-center"},[r("element-icon",{staticClass:"mr-1",attrs:{element:t.entry.element,displaySize:20}}),r("h1",{staticClass:"subheading d-inline-block",staticStyle:{"word-break":"break-word"}},[r("b",{domProps:{textContent:t._s(t.entry.name)}})])],1)])],1),r("v-layout",{attrs:{row:""}},[r("v-flex",{attrs:{xs4:""}},[r("h2",{staticClass:"subheading",staticStyle:{"white-space":"nowrap"}},[t._v("# "+t._s(t.entry.guide_id))])]),r("v-flex",{staticClass:"text-xs-center",attrs:{xs4:""}},[r("v-icon",{attrs:{color:t.genderIconInfo.color}},[t._v("fas "+t._s(t.genderIconInfo.icon))])],1),r("v-flex",{staticClass:"text-xs-right d-align-self-center",attrs:{xs4:""}},[r("div",{staticClass:"d-flex-container items-center content-flex-end"},[t.rarity<8?r("span",[t._v(t._s(t.rarity))]):t._e(),r("rarity-icon",{class:{"ml-1":8!==t.rarity},attrs:{rarity:t.rarity,displaySize:18}})],1)])],1)],1)],1)],1)],1)],1)},a=[],i=r("2f62"),u=r("080f"),o=r("50a6"),c=r("2918"),s=r("69c9"),f=r("ac4c");function l(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{},n=Object.keys(r);"function"===typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),n.forEach(function(e){d(t,e,r[e])})}return t}function d(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}var p={mixins:[o["a"]],components:{ElementIcon:c["a"],RarityIcon:s["a"],UnitThumbnail:f["a"]},computed:l({},Object(i["c"])("units",["getImageUrls"]),{genderIconInfo:function(){return Object(u["h"])(this.entry.gender)},rarity:function(){return this.entry.rarity},thumbnailSize:function(){var t=this.$vuetify.breakpoint;return t.xlOnly?64:t.mdAndUp?56:48}})},h=p,m=r("2877"),v=Object(m["a"])(h,n,a,!1,null,null,null);e["a"]=v.exports},e259:function(t,e,r){"use strict";var n=r("ff2c"),a=r.n(n);a.a},ff2c:function(t,e,r){}}]);
//# sourceMappingURL=bursts~units.2ad53d53.js.map