(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["compare~squads"],{"083f":function(t,e,n){"use strict";var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("base-selector",{attrs:{showCancelButton:t.showCancelButton,value:t.nameFilter,hasSelection:t.hasSelection,requiredModules:t.requiredModules,allEntryIds:t.allIds},on:{input:function(e){return t.nameFilter=(e||"").toLowerCase()},cancel:function(e){return t.$emit("cancel")}},scopedSlots:t._u([{key:"entries",fn:function(e){var r=e.entries;return n("v-layout",{attrs:{row:"",wrap:""}},t._l(r,function(e){return n("v-flex",{key:e,attrs:{xs12:"",sm6:"",md4:"",xl3:""}},[n("entry-card",{staticClass:"ma-2",staticStyle:{background:"var(--background-color)",cursor:"pointer",height:"auto"},attrs:{entry:t.pageDb[e]},nativeOn:{click:function(n){return t.sendEntry(e)}}})],1)}),1)}}])})},i=[],a=n("d939"),s=n("3e0d"),o={props:{showCancelButton:{type:Boolean,default:!0}},components:{BaseSelector:a["a"],EntryCard:s["a"]},computed:{requiredModules:function(){return["items"]},pageDb:function(){return this.$store.state.items.pageDb},allIds:function(){var t=this;return Object.keys(this.pageDb).filter(function(e){var n="sphere"===t.pageDb[e].type,r=!t.nameFilter||t.hasName(t.pageDb[e].name,t.nameFilter);return n&&r})}},data:function(){return{nameFilter:"",hasSelection:!1}},methods:{hasName:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";return t.toLowerCase().includes(e)},sendEntry:function(t){this.hasSelection=!0,this.$emit("input",{id:t})}}},u=o,c=n("2877"),l=Object(c["a"])(u,r,i,!1,null,null,null);e["a"]=l.exports},"0a43":function(t,e,n){"use strict";var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("base-entry-card",{staticStyle:{height:"100%"},attrs:{to:t.to}},[n("v-container",{staticClass:"pa-3",attrs:{fluid:""}},[n("v-layout",{attrs:{row:""}},[n("v-flex",{attrs:{xs9:""}},[n("div",{staticClass:"d-flex-container items-center"},[n("h1",{staticClass:"subheading d-inline-block",staticStyle:{"word-break":"break-word"}},[n("b",{domProps:{textContent:t._s(t.entry.name||"No Name")}})])])]),n("v-flex",{staticClass:"test-xs-right",attrs:{xs3:""}},[n("div",{staticClass:"d-flex-container items-center content-flex-end"},[t.rarity<8?n("span",[t._v(t._s(t.rarity))]):t._e(),n("rarity-icon",{class:{"ml-1":8!==t.rarity},attrs:{rarity:t.rarity,displaySize:18}})],1)])],1),n("v-layout",{attrs:{row:""}},[n("v-flex",{staticStyle:{"word-break":"break-word"}},[t.entry.desc&&"None"!==t.entry.desc&&"0"!==t.entry.desc?n("span",[t._v(t._s(t.entry.desc))]):n("span",[t._v("No description.")])])],1),t.showAssociatedUnits&&t.entry.associated_units?n("v-layout",{staticClass:"d-align-items-center",attrs:{row:"",wrap:""}},[n("v-flex",{staticClass:"text-xs-center",attrs:{xs5:"",sm4:""}},[t._v("\n        Associated Units:\n      ")]),n("v-flex",{staticClass:"text-xs-left",attrs:{xs7:""}},t._l(t.entry.associated_units,function(e,r){return n("unit-thumbnail",{key:r,attrs:{src:t.getImageUrls(e).ills_thum,rarity:t.getUnit(e).rarity,imageTitle:t.getUnit(e).name,displayWidth:t.thumbnailSize,displayHeight:t.thumbnailSize}})}),1)],1):t._e()],1)],1)},i=[],a=n("2f62"),s=n("50a6"),o=n("69c9"),u=n("ac4c");function c(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{},r=Object.keys(n);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(n).filter(function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),r.forEach(function(e){l(t,e,n[e])})}return t}function l(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var d={mixins:[s["a"]],props:{showAssociatedUnits:{type:Boolean,default:!0}},components:{RarityIcon:o["a"],UnitThumbnail:u["a"]},computed:c({},Object(a["e"])("units",["pageDb"]),Object(a["c"])("units",["getImageUrls"]),{rarity:function(){return+this.entry.rarity},thumbnailSize:function(){var t=this.$vuetify.breakpoint;return t.xlOnly?64:t.mdAndUp?56:48}}),methods:{getUnit:function(t){return this.pageDb[t]||{}}}},f=d,y=n("2877"),h=Object(y["a"])(f,r,i,!1,null,null,null);e["a"]=h.exports},"0e03":function(t,e,n){"use strict";var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("base-selector",{attrs:{showCancelButton:t.showCancelButton,value:t.nameFilter,hasSelection:t.hasSelection,requiredModules:t.requiredModules,allEntryIds:t.allIds},on:{input:function(e){return t.nameFilter=(e||"").toLowerCase()},cancel:function(e){return t.$emit("cancel")}},scopedSlots:t._u([{key:"entries",fn:function(e){var r=e.entries;return n("v-layout",{attrs:{row:"",wrap:""}},t._l(r,function(e){return n("v-flex",{key:e,attrs:{xs12:"",sm6:"",md4:"",xl3:""}},[n("entry-card",{staticClass:"ma-2",staticStyle:{background:"var(--background-color)",cursor:"pointer",height:"auto"},attrs:{entry:t.pageDb[e]},nativeOn:{click:function(n){return t.sendEntry(e)}}})],1)}),1)}}])})},i=[],a=n("d939"),s=n("0a43"),o={props:{showCancelButton:{type:Boolean,default:!0}},components:{BaseSelector:a["a"],EntryCard:s["a"]},computed:{requiredModules:function(){return["extraSkills","units"]},pageDb:function(){return this.$store.state.extraSkills.pageDb},allIds:function(){var t=this;return Object.keys(this.pageDb).filter(function(e){var n=!t.nameFilter||t.hasName(t.pageDb[e].name,t.nameFilter);return n})}},data:function(){return{nameFilter:"",hasSelection:!1}},methods:{hasName:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";return t.toLowerCase().includes(e)},sendEntry:function(t){this.hasSelection=!0,this.$emit("input",{id:t})}}},u=o,c=n("2877"),l=Object(c["a"])(u,r,i,!1,null,null,null);e["a"]=l.exports},"3e0d":function(t,e,n){"use strict";var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("base-entry-card",{staticStyle:{height:"100%"},attrs:{to:t.to}},[n("v-container",{staticClass:"pa-3",attrs:{fluid:""}},[n("v-layout",{attrs:{row:""}},[n("v-flex",[n("div",{staticClass:"d-flex-container items-center"},[t.hasSphereType?n("sphere-type-icon",{staticClass:"mr-1",attrs:{category:t.entry["sphere type"],displaySize:24}}):t._e(),n("h1",{staticClass:"subheading d-inline-block",staticStyle:{"word-break":"break-word"}},[n("b",{domProps:{textContent:t._s(t.entry.name)}})])],1)])],1),n("v-layout",{staticClass:"d-align-items-center",attrs:{row:""}},[n("v-flex",{staticClass:"text-xs-center pb-0",attrs:{xs3:""}},[n("item-thumbnail",{attrs:{src:t.getImageUrl(t.entry.id,t.entry),rarity:t.rarity,type:t.entry.type,isRaidItem:!!t.entry.raid,imageTitle:t.entry.name,displayWidth:t.thumbnailSize,displayHeight:t.thumbnailSize}})],1),n("v-flex",{staticClass:"pb-0",staticStyle:{"word-break":"break-word"},attrs:{xs9:""}},[t._v("\n        "+t._s(t.entry.desc)+"\n      ")])],1),n("v-layout",{staticClass:"d-align-items-center",attrs:{row:""}},[n("v-flex",{attrs:{xs6:""}},[n("h2",{staticClass:"subheading"},[t._v(t._s(t.itemType))])]),n("v-flex",{attrs:{xs3:""}},[t._v("\n        x"+t._s(t.entry.max_stack)+"\n      ")]),n("v-flex",{attrs:{xs3:""}},[n("div",{staticClass:"d-flex-container items-center content-flex-end"},[t.rarity<8?n("span",[t._v(t._s(t.rarity))]):t._e(),n("rarity-icon",{class:{"ml-1":8!==t.rarity},attrs:{rarity:t.rarity,displaySize:18}})],1)])],1)],1)],1)},i=[],a=n("2f62"),s=n("50a6"),o=n("aeb4"),u=n("69c9"),c=n("e4b9"),l=n("5ab2");function d(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{},r=Object.keys(n);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(n).filter(function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),r.forEach(function(e){f(t,e,n[e])})}return t}function f(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var y={mixins:[s["a"]],components:{SphereTypeIcon:o["a"],RarityIcon:u["a"],ItemThumbnail:c["a"]},computed:d({},Object(a["c"])("items",["getImageUrl"]),{rarity:function(){return this.entry.rarity},hasSphereType:function(){return Object(l["i"])(this.entry)},itemType:function(){return Object(l["g"])(this.entry)},thumbnailSize:function(){var t=this.$vuetify.breakpoint;return t.xlOnly?64:t.mdAndUp?56:48}})},h=y,p=n("2877"),m=Object(p["a"])(h,r,i,!1,null,null,null);e["a"]=m.exports},4764:function(t,e,n){"use strict";n.d(e,"d",function(){return m}),n.d(e,"e",function(){return w}),n.d(e,"c",function(){return x}),n.d(e,"b",function(){return S}),n.d(e,"a",function(){return O});var r=n("00e0"),i=n("5ab2"),a=n("34b9"),s=n("c7df");function o(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{},r=Object.keys(n);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(n).filter(function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),r.forEach(function(e){u(t,e,n[e])})}return t}function u(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function c(t){return c="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"===typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},c(t)}function l(t,e){if(null==t)return{};var n,r,i=d(t,e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);for(r=0;r<a.length;r++)n=a[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(i[n]=t[n])}return i}function d(t,e){if(null==t)return{};var n,r,i={},a=Object.keys(t);for(r=0;r<a.length;r++)n=a[r],e.indexOf(n)>=0||(i[n]=t[n]);return i}function f(t,e){return p(t)||h(t,e)||y()}function y(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function h(t,e){var n=[],r=!0,i=!1,a=void 0;try{for(var s,o=t[Symbol.iterator]();!(r=(s=o.next()).done);r=!0)if(n.push(s.value),e&&n.length===e)break}catch(u){i=!0,a=u}finally{try{r||null==o["return"]||o["return"]()}finally{if(i)throw a}}return n}function p(t){if(Array.isArray(t))return t}function m(t){var e={unit:[],item:[],sphereType:[]};return t.conditions&&0!==t.conditions.length?(t.conditions.forEach(function(t){void 0!==t["sphere category required"]?e.sphereType.push(t["sphere category required (raw)"]):void 0!==t["item required"]?Array.isArray(t["item required"])&&t["item required"].length>0?t["item required"].forEach(function(t){e.item.includes(t)||e.item.push(t)}):e.item.push(t["item required"]):void 0!==t["unit required"]?Array.isArray(t["unit required"])&&t["unit required"].length>0?t["unit required"].forEach(function(t){e.unit.includes(t)||e.unit.push(t)}):e.unit.push(t["unit required"]):void 0!==t.unknown&&e.item.push("unknown sphere type ".concat(t["unknown"]))}),e):e}function v(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(t){return{name:t,id:t}};return t.map(function(t){var n=[];if(t.name)n.push(t.name);else{var i=t.id?t.id.toString():t.toString();if(+i%10===0){var a=Object(r["l"])(+i,e)||{};n.push("any evolution of ".concat(a.name||i))}else{var s=e(i)||{};n.push(s.name||i)}}return n}).reduce(function(t,e){return t.concat(e)},[])}function b(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(t){return{name:t,id:t}};return t.map(function(t){var n=e(t.toString())||{};return n.name||t})}function g(t,e){var n=t.unit,r=void 0===n?[]:n,a=t.item,s=void 0===a?[]:a,o=t.sphereType,u=void 0===o?[]:o,c=e.unitById,l=e.itemById,d=[];if(r.length>0){var f=v(r,c);1===r.length&&1===f.length?d.push("".concat(f[0]," is in squad")):d.push("".concat(f.join(" or ")," are in squad"))}if(s.length>0){var y=b(s,l);1===s.length?d.push("".concat(y[0]," is equipped")):d.push("".concat(y.join(" or ")," are equipped"))}if(u.length>0){var h=u.map(function(t){return Object(i["h"])(+t)});1===u.length?d.push("".concat(h[0]," sphere is equipped")):d.push("".concat(h.join(" or ")," spheres are equipped"))}return d.join(" or ")}function w(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],e=arguments.length>1?arguments[1]:void 0,n=e.unitById,r=e.itemById,i={};return i["No Condition"]=t.filter(function(t){return 0===t.conditions.length}),t.filter(function(t){return t.conditions.length>0}).forEach(function(t){var e=g(m(t),{unitById:n,itemById:r});i[e]||(i[e]=[]),i[e].push(t)}),Object.entries(i).map(function(t){var e=f(t,2),n=e[0],r=e[1];return{condition:n,effects:r.map(function(t){t.conditions;var e=l(t,["conditions"]);return e})}}).filter(function(t){var e=t.effects;return e.length>0})}function x(t){var e=["rarity","name","id","desc"];return"object"===c(t)&&e.every(function(e){return void 0!==t[e]})}function S(){return{id:0,name:"None",desc:"No Extra Skill selected",rarity:0}}function k(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return t&&Array.isArray(t.effects)?Array.from(t.effects):[]}function O(t){var e=t.skill,n=void 0===e?{}:e,r=t.target,i=void 0===r?a["K"].PARTY:r,u=t.effectType,c=void 0===u?a["G"].PROC:u,l=k(n).map(function(t){return o({},t,{sourcePath:"es"})});return Object(s["b"])({elgifEffects:l,target:i,effectType:c})}},"4db1":function(t,e,n){"use strict";var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("base-selector",{attrs:{showCancelButton:t.showCancelButton,value:t.nameFilter,hasSelection:t.hasSelection,requiredModules:t.requiredModules,allEntryIds:t.allIds},on:{input:function(e){return t.nameFilter=(e||"").toLowerCase()},cancel:function(e){return t.$emit("cancel")}},scopedSlots:t._u([{key:"entries",fn:function(e){var r=e.entries;return n("v-layout",{attrs:{row:"",wrap:""}},t._l(r,function(e){return n("v-flex",{key:e,attrs:{xs12:"",sm6:"",md4:"",xl3:""}},[n("entry-card",{staticClass:"ma-2",staticStyle:{background:"var(--background-color)",cursor:"pointer"},attrs:{entry:t.pageDb[e]},nativeOn:{click:function(n){return t.sendEntry(e)}}})],1)}),1)}}])})},i=[],a=n("d939"),s=n("de7e"),o=n("de82"),u=Object(o["b"])("units"),c={props:{showCancelButton:{type:Boolean,default:!0}},components:{BaseSelector:a["a"],EntryCard:s["a"]},computed:{requiredModules:function(){return["units"]},pageDb:function(){return this.$store.state.units.pageDb},allIds:function(){var t=this,e=Object.keys(this.pageDb);return this.nameFilter?e.filter(function(e){return t.hasName(t.pageDb[e].name,t.nameFilter)}):e}},data:function(){return{nameFilter:"",hasSelection:!1}},methods:{hasName:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";return t.toLowerCase().includes(e)},sendEntry:function(t){this.hasSelection=!0,this.$emit("input",{id:t,data:u.getById({server:this.$store.state.settings.activeServer,id:t}).catch(function(){return{}})})}}},l=c,d=n("2877"),f=Object(d["a"])(l,r,i,!1,null,null,null);e["a"]=f.exports},d939:function(t,e,n){"use strict";var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-card",[n("module-checker",{attrs:{requiredModules:t.requiredModules,ensureDbSync:!0,useUpdateDialog:!1}},[n("v-container",{attrs:{fluid:""}},[t.hasSelection?n("v-layout",[n("loading-indicator",{attrs:{loadingMessage:"Processing selection..."}})],1):[n("v-layout",{attrs:{row:"","align-center":""}},[n("v-flex",[n("v-text-field",{attrs:{label:"Search","persistent-hint":"",hint:t.searchHint},on:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.sendQuery(e)}},model:{value:t.query,callback:function(e){t.query=e},expression:"query"}})],1),n("v-flex",{staticStyle:{"flex-grow":"0"}},[n("v-btn",{staticClass:"mr-0",attrs:{icon:"",flat:"",outline:t.hasDirtyQuery},on:{click:t.sendQuery}},[n("v-icon",[t._v("search")])],1)],1)],1),n("v-layout",{staticStyle:{"min-height":"0","max-height":"55vh",flex:"1"}},[n("div",{staticClass:"py-2 px-1",staticStyle:{overflow:"auto",flex:"1"}},[t._t("entries",[n("v-layout",{attrs:{row:"",wrap:""}},[t._v("\n                  "+t._s(t.entriesToShow)+"\n              ")])],{entries:t.entriesToShow})],2)]),t.numPages>1?n("v-layout",{attrs:{row:"","justify-center":"","align-center":""}},[n("v-pagination",{attrs:{"total-visible":t.$vuetify.breakpoint.mdAndUp?20:void 0,length:t.numPages},model:{value:t.currentPage,callback:function(e){t.currentPage=e},expression:"currentPage"}})],1):t._e()],t.showCancelButton?[n("v-layout",{directives:[{name:"show",rawName:"v-show",value:!t.hasSelection,expression:"!hasSelection"}],staticStyle:{"justify-content":"flex-end"},attrs:{row:""}},[n("v-flex",{staticStyle:{flex:"none"}},[n("v-btn",{attrs:{flat:""},on:{click:function(e){return t.$emit("cancel")}}},[t._v("Cancel")])],1)],1)]:t._e()],2)],1)],1)},i=[],a=n("b758"),s=n("88fe"),o={props:{allEntryIds:{type:Array,default:function(){return[]}},value:{type:String,default:""},entriesPerPage:{type:Number,default:24},hasSelection:{type:Boolean,default:!1},requiredModules:{type:Array,default:function(){return[]}},showCancelButton:{type:Boolean,default:!0}},components:{LoadingIndicator:a["a"],ModuleChecker:s["a"]},computed:{numPages:function(){return Math.ceil(this.allEntryIds.length/this.entriesPerPage)},entriesToShow:function(){var t=Math.max((this.currentPage-1)*this.entriesPerPage,0);return this.allEntryIds.slice(t,t+this.entriesPerPage)},hasDirtyQuery:function(){return this.query!==this.value},searchHint:function(){return["".concat(this.allEntryIds.length," results"),this.hasDirtyQuery&&"*"].filter(function(t){return t}).join("")}},data:function(){return{currentPage:1,query:""}},methods:{sendQuery:function(){this.$emit("input",this.query)}},watch:{value:{immediate:!0,handler:function(t){this.query=t||""}}}},u=o,c=n("2877"),l=Object(c["a"])(u,r,i,!1,null,null,null);e["a"]=l.exports}}]);
//# sourceMappingURL=compare~squads.fda3966b.js.map