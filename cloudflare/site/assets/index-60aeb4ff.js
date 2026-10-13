function CE(e,t){for(var n=0;n<t.length;n++){const r=t[n];if(typeof r!="string"&&!Array.isArray(r)){for(const o in r)if(o!=="default"&&!(o in e)){const i=Object.getOwnPropertyDescriptor(r,o);i&&Object.defineProperty(e,o,i.get?i:{enumerable:!0,get:()=>r[o]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();function Hu(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function Jr(e){if(e.__esModule)return e;var t=e.default;if(typeof t=="function"){var n=function r(){return this instanceof r?Reflect.construct(t,arguments,this.constructor):t.apply(this,arguments)};n.prototype=t.prototype}else n={};return Object.defineProperty(n,"__esModule",{value:!0}),Object.keys(e).forEach(function(r){var o=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(n,r,o.get?o:{enumerable:!0,get:function(){return e[r]}})}),n}var $E={exports:{}},op={},RE={exports:{}},Me={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Vu=Symbol.for("react.element"),Tk=Symbol.for("react.portal"),Ok=Symbol.for("react.fragment"),Ik=Symbol.for("react.strict_mode"),Nk=Symbol.for("react.profiler"),Ak=Symbol.for("react.provider"),Mk=Symbol.for("react.context"),Lk=Symbol.for("react.forward_ref"),Fk=Symbol.for("react.suspense"),Dk=Symbol.for("react.memo"),Bk=Symbol.for("react.lazy"),Ib=Symbol.iterator;function zk(e){return e===null||typeof e!="object"?null:(e=Ib&&e[Ib]||e["@@iterator"],typeof e=="function"?e:null)}var kE={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},PE=Object.assign,TE={};function Ls(e,t,n){this.props=e,this.context=t,this.refs=TE,this.updater=n||kE}Ls.prototype.isReactComponent={};Ls.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Ls.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function OE(){}OE.prototype=Ls.prototype;function Wg(e,t,n){this.props=e,this.context=t,this.refs=TE,this.updater=n||kE}var Hg=Wg.prototype=new OE;Hg.constructor=Wg;PE(Hg,Ls.prototype);Hg.isPureReactComponent=!0;var Nb=Array.isArray,IE=Object.prototype.hasOwnProperty,Vg={current:null},NE={key:!0,ref:!0,__self:!0,__source:!0};function AE(e,t,n){var r,o={},i=null,a=null;if(t!=null)for(r in t.ref!==void 0&&(a=t.ref),t.key!==void 0&&(i=""+t.key),t)IE.call(t,r)&&!NE.hasOwnProperty(r)&&(o[r]=t[r]);var s=arguments.length-2;if(s===1)o.children=n;else if(1<s){for(var l=Array(s),u=0;u<s;u++)l[u]=arguments[u+2];o.children=l}if(e&&e.defaultProps)for(r in s=e.defaultProps,s)o[r]===void 0&&(o[r]=s[r]);return{$$typeof:Vu,type:e,key:i,ref:a,props:o,_owner:Vg.current}}function jk(e,t){return{$$typeof:Vu,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function Gg(e){return typeof e=="object"&&e!==null&&e.$$typeof===Vu}function Uk(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Ab=/\/+/g;function Kh(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Uk(""+e.key):t.toString(36)}function Pd(e,t,n,r,o){var i=typeof e;(i==="undefined"||i==="boolean")&&(e=null);var a=!1;if(e===null)a=!0;else switch(i){case"string":case"number":a=!0;break;case"object":switch(e.$$typeof){case Vu:case Tk:a=!0}}if(a)return a=e,o=o(a),e=r===""?"."+Kh(a,0):r,Nb(o)?(n="",e!=null&&(n=e.replace(Ab,"$&/")+"/"),Pd(o,t,n,"",function(u){return u})):o!=null&&(Gg(o)&&(o=jk(o,n+(!o.key||a&&a.key===o.key?"":(""+o.key).replace(Ab,"$&/")+"/")+e)),t.push(o)),1;if(a=0,r=r===""?".":r+":",Nb(e))for(var s=0;s<e.length;s++){i=e[s];var l=r+Kh(i,s);a+=Pd(i,t,n,l,o)}else if(l=zk(e),typeof l=="function")for(e=l.call(e),s=0;!(i=e.next()).done;)i=i.value,l=r+Kh(i,s++),a+=Pd(i,t,n,l,o);else if(i==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return a}function kc(e,t,n){if(e==null)return e;var r=[],o=0;return Pd(e,r,"","",function(i){return t.call(n,i,o++)}),r}function Wk(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var yn={current:null},Td={transition:null},Hk={ReactCurrentDispatcher:yn,ReactCurrentBatchConfig:Td,ReactCurrentOwner:Vg};function ME(){throw Error("act(...) is not supported in production builds of React.")}Me.Children={map:kc,forEach:function(e,t,n){kc(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return kc(e,function(){t++}),t},toArray:function(e){return kc(e,function(t){return t})||[]},only:function(e){if(!Gg(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Me.Component=Ls;Me.Fragment=Ok;Me.Profiler=Nk;Me.PureComponent=Wg;Me.StrictMode=Ik;Me.Suspense=Fk;Me.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Hk;Me.act=ME;Me.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=PE({},e.props),o=e.key,i=e.ref,a=e._owner;if(t!=null){if(t.ref!==void 0&&(i=t.ref,a=Vg.current),t.key!==void 0&&(o=""+t.key),e.type&&e.type.defaultProps)var s=e.type.defaultProps;for(l in t)IE.call(t,l)&&!NE.hasOwnProperty(l)&&(r[l]=t[l]===void 0&&s!==void 0?s[l]:t[l])}var l=arguments.length-2;if(l===1)r.children=n;else if(1<l){s=Array(l);for(var u=0;u<l;u++)s[u]=arguments[u+2];r.children=s}return{$$typeof:Vu,type:e.type,key:o,ref:i,props:r,_owner:a}};Me.createContext=function(e){return e={$$typeof:Mk,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Ak,_context:e},e.Consumer=e};Me.createElement=AE;Me.createFactory=function(e){var t=AE.bind(null,e);return t.type=e,t};Me.createRef=function(){return{current:null}};Me.forwardRef=function(e){return{$$typeof:Lk,render:e}};Me.isValidElement=Gg;Me.lazy=function(e){return{$$typeof:Bk,_payload:{_status:-1,_result:e},_init:Wk}};Me.memo=function(e,t){return{$$typeof:Dk,type:e,compare:t===void 0?null:t}};Me.startTransition=function(e){var t=Td.transition;Td.transition={};try{e()}finally{Td.transition=t}};Me.unstable_act=ME;Me.useCallback=function(e,t){return yn.current.useCallback(e,t)};Me.useContext=function(e){return yn.current.useContext(e)};Me.useDebugValue=function(){};Me.useDeferredValue=function(e){return yn.current.useDeferredValue(e)};Me.useEffect=function(e,t){return yn.current.useEffect(e,t)};Me.useId=function(){return yn.current.useId()};Me.useImperativeHandle=function(e,t,n){return yn.current.useImperativeHandle(e,t,n)};Me.useInsertionEffect=function(e,t){return yn.current.useInsertionEffect(e,t)};Me.useLayoutEffect=function(e,t){return yn.current.useLayoutEffect(e,t)};Me.useMemo=function(e,t){return yn.current.useMemo(e,t)};Me.useReducer=function(e,t,n){return yn.current.useReducer(e,t,n)};Me.useRef=function(e){return yn.current.useRef(e)};Me.useState=function(e){return yn.current.useState(e)};Me.useSyncExternalStore=function(e,t,n){return yn.current.useSyncExternalStore(e,t,n)};Me.useTransition=function(){return yn.current.useTransition()};Me.version="18.3.1";RE.exports=Me;var x=RE.exports;const En=Hu(x),rf=CE({__proto__:null,default:En},[x]);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Vk=x,Gk=Symbol.for("react.element"),Kk=Symbol.for("react.fragment"),Xk=Object.prototype.hasOwnProperty,Yk=Vk.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,qk={key:!0,ref:!0,__self:!0,__source:!0};function LE(e,t,n){var r,o={},i=null,a=null;n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),t.ref!==void 0&&(a=t.ref);for(r in t)Xk.call(t,r)&&!qk.hasOwnProperty(r)&&(o[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)o[r]===void 0&&(o[r]=t[r]);return{$$typeof:Gk,type:e,key:i,ref:a,props:o,_owner:Yk.current}}op.Fragment=Kk;op.jsx=LE;op.jsxs=LE;$E.exports=op;var Kg=$E.exports;const ur=Kg.Fragment,_=Kg.jsx,G=Kg.jsxs,Qk=Object.freeze(Object.defineProperty({__proto__:null,Fragment:ur,jsx:_,jsxs:G},Symbol.toStringTag,{value:"Module"}));var _0={},FE={exports:{}},Gn={},DE={exports:{}},BE={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function t(I,z){var H=I.length;I.push(z);e:for(;0<H;){var le=H-1>>>1,ae=I[le];if(0<o(ae,z))I[le]=z,I[H]=ae,H=le;else break e}}function n(I){return I.length===0?null:I[0]}function r(I){if(I.length===0)return null;var z=I[0],H=I.pop();if(H!==z){I[0]=H;e:for(var le=0,ae=I.length,ye=ae>>>1;le<ye;){var J=2*(le+1)-1,he=I[J],V=J+1,me=I[V];if(0>o(he,H))V<ae&&0>o(me,he)?(I[le]=me,I[V]=H,le=V):(I[le]=he,I[J]=H,le=J);else if(V<ae&&0>o(me,H))I[le]=me,I[V]=H,le=V;else break e}}return z}function o(I,z){var H=I.sortIndex-z.sortIndex;return H!==0?H:I.id-z.id}if(typeof performance=="object"&&typeof performance.now=="function"){var i=performance;e.unstable_now=function(){return i.now()}}else{var a=Date,s=a.now();e.unstable_now=function(){return a.now()-s}}var l=[],u=[],c=1,d=null,f=3,h=!1,v=!1,y=!1,b=typeof setTimeout=="function"?setTimeout:null,p=typeof clearTimeout=="function"?clearTimeout:null,m=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function g(I){for(var z=n(u);z!==null;){if(z.callback===null)r(u);else if(z.startTime<=I)r(u),z.sortIndex=z.expirationTime,t(l,z);else break;z=n(u)}}function w(I){if(y=!1,g(I),!v)if(n(l)!==null)v=!0,j(C);else{var z=n(u);z!==null&&B(w,z.startTime-I)}}function C(I,z){v=!1,y&&(y=!1,p(R),R=-1),h=!0;var H=f;try{for(g(z),d=n(l);d!==null&&(!(d.expirationTime>z)||I&&!N());){var le=d.callback;if(typeof le=="function"){d.callback=null,f=d.priorityLevel;var ae=le(d.expirationTime<=z);z=e.unstable_now(),typeof ae=="function"?d.callback=ae:d===n(l)&&r(l),g(z)}else r(l);d=n(l)}if(d!==null)var ye=!0;else{var J=n(u);J!==null&&B(w,J.startTime-z),ye=!1}return ye}finally{d=null,f=H,h=!1}}var S=!1,$=null,R=-1,k=5,P=-1;function N(){return!(e.unstable_now()-P<k)}function F(){if($!==null){var I=e.unstable_now();P=I;var z=!0;try{z=$(!0,I)}finally{z?L():(S=!1,$=null)}}else S=!1}var L;if(typeof m=="function")L=function(){m(F)};else if(typeof MessageChannel<"u"){var D=new MessageChannel,M=D.port2;D.port1.onmessage=F,L=function(){M.postMessage(null)}}else L=function(){b(F,0)};function j(I){$=I,S||(S=!0,L())}function B(I,z){R=b(function(){I(e.unstable_now())},z)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(I){I.callback=null},e.unstable_continueExecution=function(){v||h||(v=!0,j(C))},e.unstable_forceFrameRate=function(I){0>I||125<I?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):k=0<I?Math.floor(1e3/I):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_getFirstCallbackNode=function(){return n(l)},e.unstable_next=function(I){switch(f){case 1:case 2:case 3:var z=3;break;default:z=f}var H=f;f=z;try{return I()}finally{f=H}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(I,z){switch(I){case 1:case 2:case 3:case 4:case 5:break;default:I=3}var H=f;f=I;try{return z()}finally{f=H}},e.unstable_scheduleCallback=function(I,z,H){var le=e.unstable_now();switch(typeof H=="object"&&H!==null?(H=H.delay,H=typeof H=="number"&&0<H?le+H:le):H=le,I){case 1:var ae=-1;break;case 2:ae=250;break;case 5:ae=1073741823;break;case 4:ae=1e4;break;default:ae=5e3}return ae=H+ae,I={id:c++,callback:z,priorityLevel:I,startTime:H,expirationTime:ae,sortIndex:-1},H>le?(I.sortIndex=H,t(u,I),n(l)===null&&I===n(u)&&(y?(p(R),R=-1):y=!0,B(w,H-le))):(I.sortIndex=ae,t(l,I),v||h||(v=!0,j(C))),I},e.unstable_shouldYield=N,e.unstable_wrapCallback=function(I){var z=f;return function(){var H=f;f=z;try{return I.apply(this,arguments)}finally{f=H}}}})(BE);DE.exports=BE;var Jk=DE.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Zk=x,Hn=Jk;function W(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var zE=new Set,hu={};function aa(e,t){as(e,t),as(e+"Capture",t)}function as(e,t){for(hu[e]=t,e=0;e<t.length;e++)zE.add(t[e])}var go=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),E0=Object.prototype.hasOwnProperty,e5=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Mb={},Lb={};function t5(e){return E0.call(Lb,e)?!0:E0.call(Mb,e)?!1:e5.test(e)?Lb[e]=!0:(Mb[e]=!0,!1)}function n5(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function r5(e,t,n,r){if(t===null||typeof t>"u"||n5(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function bn(e,t,n,r,o,i,a){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=o,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=i,this.removeEmptyString=a}var en={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){en[e]=new bn(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];en[t]=new bn(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){en[e]=new bn(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){en[e]=new bn(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){en[e]=new bn(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){en[e]=new bn(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){en[e]=new bn(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){en[e]=new bn(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){en[e]=new bn(e,5,!1,e.toLowerCase(),null,!1,!1)});var Xg=/[\-:]([a-z])/g;function Yg(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Xg,Yg);en[t]=new bn(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Xg,Yg);en[t]=new bn(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Xg,Yg);en[t]=new bn(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){en[e]=new bn(e,1,!1,e.toLowerCase(),null,!1,!1)});en.xlinkHref=new bn("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){en[e]=new bn(e,1,!1,e.toLowerCase(),null,!0,!0)});function qg(e,t,n,r){var o=en.hasOwnProperty(t)?en[t]:null;(o!==null?o.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(r5(t,n,o,r)&&(n=null),r||o===null?t5(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):o.mustUseProperty?e[o.propertyName]=n===null?o.type===3?!1:"":n:(t=o.attributeName,r=o.attributeNamespace,n===null?e.removeAttribute(t):(o=o.type,n=o===3||o===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var $o=Zk.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Pc=Symbol.for("react.element"),Ta=Symbol.for("react.portal"),Oa=Symbol.for("react.fragment"),Qg=Symbol.for("react.strict_mode"),C0=Symbol.for("react.profiler"),jE=Symbol.for("react.provider"),UE=Symbol.for("react.context"),Jg=Symbol.for("react.forward_ref"),$0=Symbol.for("react.suspense"),R0=Symbol.for("react.suspense_list"),Zg=Symbol.for("react.memo"),Do=Symbol.for("react.lazy"),WE=Symbol.for("react.offscreen"),Fb=Symbol.iterator;function al(e){return e===null||typeof e!="object"?null:(e=Fb&&e[Fb]||e["@@iterator"],typeof e=="function"?e:null)}var Et=Object.assign,Xh;function Dl(e){if(Xh===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);Xh=t&&t[1]||""}return`
`+Xh+e}var Yh=!1;function qh(e,t){if(!e||Yh)return"";Yh=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(u){var r=u}Reflect.construct(e,[],t)}else{try{t.call()}catch(u){r=u}e.call(t.prototype)}else{try{throw Error()}catch(u){r=u}e()}}catch(u){if(u&&r&&typeof u.stack=="string"){for(var o=u.stack.split(`
`),i=r.stack.split(`
`),a=o.length-1,s=i.length-1;1<=a&&0<=s&&o[a]!==i[s];)s--;for(;1<=a&&0<=s;a--,s--)if(o[a]!==i[s]){if(a!==1||s!==1)do if(a--,s--,0>s||o[a]!==i[s]){var l=`
`+o[a].replace(" at new "," at ");return e.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",e.displayName)),l}while(1<=a&&0<=s);break}}}finally{Yh=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?Dl(e):""}function o5(e){switch(e.tag){case 5:return Dl(e.type);case 16:return Dl("Lazy");case 13:return Dl("Suspense");case 19:return Dl("SuspenseList");case 0:case 2:case 15:return e=qh(e.type,!1),e;case 11:return e=qh(e.type.render,!1),e;case 1:return e=qh(e.type,!0),e;default:return""}}function k0(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Oa:return"Fragment";case Ta:return"Portal";case C0:return"Profiler";case Qg:return"StrictMode";case $0:return"Suspense";case R0:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case UE:return(e.displayName||"Context")+".Consumer";case jE:return(e._context.displayName||"Context")+".Provider";case Jg:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Zg:return t=e.displayName||null,t!==null?t:k0(e.type)||"Memo";case Do:t=e._payload,e=e._init;try{return k0(e(t))}catch{}}return null}function i5(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return k0(t);case 8:return t===Qg?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function oi(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function HE(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function a5(e){var t=HE(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,i=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(a){r=""+a,i.call(this,a)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(a){r=""+a},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Tc(e){e._valueTracker||(e._valueTracker=a5(e))}function VE(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=HE(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function of(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function P0(e,t){var n=t.checked;return Et({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function Db(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=oi(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function GE(e,t){t=t.checked,t!=null&&qg(e,"checked",t,!1)}function T0(e,t){GE(e,t);var n=oi(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?O0(e,t.type,n):t.hasOwnProperty("defaultValue")&&O0(e,t.type,oi(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function Bb(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function O0(e,t,n){(t!=="number"||of(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var Bl=Array.isArray;function Ga(e,t,n,r){if(e=e.options,t){t={};for(var o=0;o<n.length;o++)t["$"+n[o]]=!0;for(n=0;n<e.length;n++)o=t.hasOwnProperty("$"+e[n].value),e[n].selected!==o&&(e[n].selected=o),o&&r&&(e[n].defaultSelected=!0)}else{for(n=""+oi(n),t=null,o=0;o<e.length;o++){if(e[o].value===n){e[o].selected=!0,r&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function I0(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(W(91));return Et({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function zb(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(W(92));if(Bl(n)){if(1<n.length)throw Error(W(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:oi(n)}}function KE(e,t){var n=oi(t.value),r=oi(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function jb(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function XE(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function N0(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?XE(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var Oc,YE=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,o){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,o)})}:e}(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(Oc=Oc||document.createElement("div"),Oc.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=Oc.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function mu(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var ql={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},s5=["Webkit","ms","Moz","O"];Object.keys(ql).forEach(function(e){s5.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),ql[t]=ql[e]})});function qE(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||ql.hasOwnProperty(e)&&ql[e]?(""+t).trim():t+"px"}function QE(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,o=qE(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,o):e[n]=o}}var l5=Et({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function A0(e,t){if(t){if(l5[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(W(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(W(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(W(61))}if(t.style!=null&&typeof t.style!="object")throw Error(W(62))}}function M0(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var L0=null;function e1(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var F0=null,Ka=null,Xa=null;function Ub(e){if(e=Xu(e)){if(typeof F0!="function")throw Error(W(280));var t=e.stateNode;t&&(t=up(t),F0(e.stateNode,e.type,t))}}function JE(e){Ka?Xa?Xa.push(e):Xa=[e]:Ka=e}function ZE(){if(Ka){var e=Ka,t=Xa;if(Xa=Ka=null,Ub(e),t)for(e=0;e<t.length;e++)Ub(t[e])}}function eC(e,t){return e(t)}function tC(){}var Qh=!1;function nC(e,t,n){if(Qh)return e(t,n);Qh=!0;try{return eC(e,t,n)}finally{Qh=!1,(Ka!==null||Xa!==null)&&(tC(),ZE())}}function vu(e,t){var n=e.stateNode;if(n===null)return null;var r=up(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(W(231,t,typeof n));return n}var D0=!1;if(go)try{var sl={};Object.defineProperty(sl,"passive",{get:function(){D0=!0}}),window.addEventListener("test",sl,sl),window.removeEventListener("test",sl,sl)}catch{D0=!1}function u5(e,t,n,r,o,i,a,s,l){var u=Array.prototype.slice.call(arguments,3);try{t.apply(n,u)}catch(c){this.onError(c)}}var Ql=!1,af=null,sf=!1,B0=null,c5={onError:function(e){Ql=!0,af=e}};function d5(e,t,n,r,o,i,a,s,l){Ql=!1,af=null,u5.apply(c5,arguments)}function f5(e,t,n,r,o,i,a,s,l){if(d5.apply(this,arguments),Ql){if(Ql){var u=af;Ql=!1,af=null}else throw Error(W(198));sf||(sf=!0,B0=u)}}function sa(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function rC(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Wb(e){if(sa(e)!==e)throw Error(W(188))}function p5(e){var t=e.alternate;if(!t){if(t=sa(e),t===null)throw Error(W(188));return t!==e?null:e}for(var n=e,r=t;;){var o=n.return;if(o===null)break;var i=o.alternate;if(i===null){if(r=o.return,r!==null){n=r;continue}break}if(o.child===i.child){for(i=o.child;i;){if(i===n)return Wb(o),e;if(i===r)return Wb(o),t;i=i.sibling}throw Error(W(188))}if(n.return!==r.return)n=o,r=i;else{for(var a=!1,s=o.child;s;){if(s===n){a=!0,n=o,r=i;break}if(s===r){a=!0,r=o,n=i;break}s=s.sibling}if(!a){for(s=i.child;s;){if(s===n){a=!0,n=i,r=o;break}if(s===r){a=!0,r=i,n=o;break}s=s.sibling}if(!a)throw Error(W(189))}}if(n.alternate!==r)throw Error(W(190))}if(n.tag!==3)throw Error(W(188));return n.stateNode.current===n?e:t}function oC(e){return e=p5(e),e!==null?iC(e):null}function iC(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=iC(e);if(t!==null)return t;e=e.sibling}return null}var aC=Hn.unstable_scheduleCallback,Hb=Hn.unstable_cancelCallback,h5=Hn.unstable_shouldYield,m5=Hn.unstable_requestPaint,It=Hn.unstable_now,v5=Hn.unstable_getCurrentPriorityLevel,t1=Hn.unstable_ImmediatePriority,sC=Hn.unstable_UserBlockingPriority,lf=Hn.unstable_NormalPriority,g5=Hn.unstable_LowPriority,lC=Hn.unstable_IdlePriority,ip=null,Vr=null;function y5(e){if(Vr&&typeof Vr.onCommitFiberRoot=="function")try{Vr.onCommitFiberRoot(ip,e,void 0,(e.current.flags&128)===128)}catch{}}var kr=Math.clz32?Math.clz32:S5,b5=Math.log,x5=Math.LN2;function S5(e){return e>>>=0,e===0?32:31-(b5(e)/x5|0)|0}var Ic=64,Nc=4194304;function zl(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function uf(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,o=e.suspendedLanes,i=e.pingedLanes,a=n&268435455;if(a!==0){var s=a&~o;s!==0?r=zl(s):(i&=a,i!==0&&(r=zl(i)))}else a=n&~o,a!==0?r=zl(a):i!==0&&(r=zl(i));if(r===0)return 0;if(t!==0&&t!==r&&!(t&o)&&(o=r&-r,i=t&-t,o>=i||o===16&&(i&4194240)!==0))return t;if(r&4&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-kr(t),o=1<<n,r|=e[n],t&=~o;return r}function w5(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function _5(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,o=e.expirationTimes,i=e.pendingLanes;0<i;){var a=31-kr(i),s=1<<a,l=o[a];l===-1?(!(s&n)||s&r)&&(o[a]=w5(s,t)):l<=t&&(e.expiredLanes|=s),i&=~s}}function z0(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function uC(){var e=Ic;return Ic<<=1,!(Ic&4194240)&&(Ic=64),e}function Jh(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Gu(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-kr(t),e[t]=n}function E5(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var o=31-kr(n),i=1<<o;t[o]=0,r[o]=-1,e[o]=-1,n&=~i}}function n1(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-kr(n),o=1<<r;o&t|e[r]&t&&(e[r]|=t),n&=~o}}var et=0;function cC(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var dC,r1,fC,pC,hC,j0=!1,Ac=[],qo=null,Qo=null,Jo=null,gu=new Map,yu=new Map,Uo=[],C5="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Vb(e,t){switch(e){case"focusin":case"focusout":qo=null;break;case"dragenter":case"dragleave":Qo=null;break;case"mouseover":case"mouseout":Jo=null;break;case"pointerover":case"pointerout":gu.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":yu.delete(t.pointerId)}}function ll(e,t,n,r,o,i){return e===null||e.nativeEvent!==i?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:i,targetContainers:[o]},t!==null&&(t=Xu(t),t!==null&&r1(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function $5(e,t,n,r,o){switch(t){case"focusin":return qo=ll(qo,e,t,n,r,o),!0;case"dragenter":return Qo=ll(Qo,e,t,n,r,o),!0;case"mouseover":return Jo=ll(Jo,e,t,n,r,o),!0;case"pointerover":var i=o.pointerId;return gu.set(i,ll(gu.get(i)||null,e,t,n,r,o)),!0;case"gotpointercapture":return i=o.pointerId,yu.set(i,ll(yu.get(i)||null,e,t,n,r,o)),!0}return!1}function mC(e){var t=Pi(e.target);if(t!==null){var n=sa(t);if(n!==null){if(t=n.tag,t===13){if(t=rC(n),t!==null){e.blockedOn=t,hC(e.priority,function(){fC(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Od(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=U0(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);L0=r,n.target.dispatchEvent(r),L0=null}else return t=Xu(n),t!==null&&r1(t),e.blockedOn=n,!1;t.shift()}return!0}function Gb(e,t,n){Od(e)&&n.delete(t)}function R5(){j0=!1,qo!==null&&Od(qo)&&(qo=null),Qo!==null&&Od(Qo)&&(Qo=null),Jo!==null&&Od(Jo)&&(Jo=null),gu.forEach(Gb),yu.forEach(Gb)}function ul(e,t){e.blockedOn===t&&(e.blockedOn=null,j0||(j0=!0,Hn.unstable_scheduleCallback(Hn.unstable_NormalPriority,R5)))}function bu(e){function t(o){return ul(o,e)}if(0<Ac.length){ul(Ac[0],e);for(var n=1;n<Ac.length;n++){var r=Ac[n];r.blockedOn===e&&(r.blockedOn=null)}}for(qo!==null&&ul(qo,e),Qo!==null&&ul(Qo,e),Jo!==null&&ul(Jo,e),gu.forEach(t),yu.forEach(t),n=0;n<Uo.length;n++)r=Uo[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<Uo.length&&(n=Uo[0],n.blockedOn===null);)mC(n),n.blockedOn===null&&Uo.shift()}var Ya=$o.ReactCurrentBatchConfig,cf=!0;function k5(e,t,n,r){var o=et,i=Ya.transition;Ya.transition=null;try{et=1,o1(e,t,n,r)}finally{et=o,Ya.transition=i}}function P5(e,t,n,r){var o=et,i=Ya.transition;Ya.transition=null;try{et=4,o1(e,t,n,r)}finally{et=o,Ya.transition=i}}function o1(e,t,n,r){if(cf){var o=U0(e,t,n,r);if(o===null)lm(e,t,r,df,n),Vb(e,r);else if($5(o,e,t,n,r))r.stopPropagation();else if(Vb(e,r),t&4&&-1<C5.indexOf(e)){for(;o!==null;){var i=Xu(o);if(i!==null&&dC(i),i=U0(e,t,n,r),i===null&&lm(e,t,r,df,n),i===o)break;o=i}o!==null&&r.stopPropagation()}else lm(e,t,r,null,n)}}var df=null;function U0(e,t,n,r){if(df=null,e=e1(r),e=Pi(e),e!==null)if(t=sa(e),t===null)e=null;else if(n=t.tag,n===13){if(e=rC(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return df=e,null}function vC(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(v5()){case t1:return 1;case sC:return 4;case lf:case g5:return 16;case lC:return 536870912;default:return 16}default:return 16}}var Ho=null,i1=null,Id=null;function gC(){if(Id)return Id;var e,t=i1,n=t.length,r,o="value"in Ho?Ho.value:Ho.textContent,i=o.length;for(e=0;e<n&&t[e]===o[e];e++);var a=n-e;for(r=1;r<=a&&t[n-r]===o[i-r];r++);return Id=o.slice(e,1<r?1-r:void 0)}function Nd(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Mc(){return!0}function Kb(){return!1}function Kn(e){function t(n,r,o,i,a){this._reactName=n,this._targetInst=o,this.type=r,this.nativeEvent=i,this.target=a,this.currentTarget=null;for(var s in e)e.hasOwnProperty(s)&&(n=e[s],this[s]=n?n(i):i[s]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?Mc:Kb,this.isPropagationStopped=Kb,this}return Et(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Mc)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Mc)},persist:function(){},isPersistent:Mc}),t}var Fs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},a1=Kn(Fs),Ku=Et({},Fs,{view:0,detail:0}),T5=Kn(Ku),Zh,em,cl,ap=Et({},Ku,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:s1,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==cl&&(cl&&e.type==="mousemove"?(Zh=e.screenX-cl.screenX,em=e.screenY-cl.screenY):em=Zh=0,cl=e),Zh)},movementY:function(e){return"movementY"in e?e.movementY:em}}),Xb=Kn(ap),O5=Et({},ap,{dataTransfer:0}),I5=Kn(O5),N5=Et({},Ku,{relatedTarget:0}),tm=Kn(N5),A5=Et({},Fs,{animationName:0,elapsedTime:0,pseudoElement:0}),M5=Kn(A5),L5=Et({},Fs,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),F5=Kn(L5),D5=Et({},Fs,{data:0}),Yb=Kn(D5),B5={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},z5={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},j5={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function U5(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=j5[e])?!!t[e]:!1}function s1(){return U5}var W5=Et({},Ku,{key:function(e){if(e.key){var t=B5[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Nd(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?z5[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:s1,charCode:function(e){return e.type==="keypress"?Nd(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Nd(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),H5=Kn(W5),V5=Et({},ap,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),qb=Kn(V5),G5=Et({},Ku,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:s1}),K5=Kn(G5),X5=Et({},Fs,{propertyName:0,elapsedTime:0,pseudoElement:0}),Y5=Kn(X5),q5=Et({},ap,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Q5=Kn(q5),J5=[9,13,27,32],l1=go&&"CompositionEvent"in window,Jl=null;go&&"documentMode"in document&&(Jl=document.documentMode);var Z5=go&&"TextEvent"in window&&!Jl,yC=go&&(!l1||Jl&&8<Jl&&11>=Jl),Qb=String.fromCharCode(32),Jb=!1;function bC(e,t){switch(e){case"keyup":return J5.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function xC(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Ia=!1;function eP(e,t){switch(e){case"compositionend":return xC(t);case"keypress":return t.which!==32?null:(Jb=!0,Qb);case"textInput":return e=t.data,e===Qb&&Jb?null:e;default:return null}}function tP(e,t){if(Ia)return e==="compositionend"||!l1&&bC(e,t)?(e=gC(),Id=i1=Ho=null,Ia=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return yC&&t.locale!=="ko"?null:t.data;default:return null}}var nP={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Zb(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!nP[e.type]:t==="textarea"}function SC(e,t,n,r){JE(r),t=ff(t,"onChange"),0<t.length&&(n=new a1("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var Zl=null,xu=null;function rP(e){IC(e,0)}function sp(e){var t=Ma(e);if(VE(t))return e}function oP(e,t){if(e==="change")return t}var wC=!1;if(go){var nm;if(go){var rm="oninput"in document;if(!rm){var e2=document.createElement("div");e2.setAttribute("oninput","return;"),rm=typeof e2.oninput=="function"}nm=rm}else nm=!1;wC=nm&&(!document.documentMode||9<document.documentMode)}function t2(){Zl&&(Zl.detachEvent("onpropertychange",_C),xu=Zl=null)}function _C(e){if(e.propertyName==="value"&&sp(xu)){var t=[];SC(t,xu,e,e1(e)),nC(rP,t)}}function iP(e,t,n){e==="focusin"?(t2(),Zl=t,xu=n,Zl.attachEvent("onpropertychange",_C)):e==="focusout"&&t2()}function aP(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return sp(xu)}function sP(e,t){if(e==="click")return sp(t)}function lP(e,t){if(e==="input"||e==="change")return sp(t)}function uP(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Or=typeof Object.is=="function"?Object.is:uP;function Su(e,t){if(Or(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var o=n[r];if(!E0.call(t,o)||!Or(e[o],t[o]))return!1}return!0}function n2(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function r2(e,t){var n=n2(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=n2(n)}}function EC(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?EC(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function CC(){for(var e=window,t=of();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=of(e.document)}return t}function u1(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function cP(e){var t=CC(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&EC(n.ownerDocument.documentElement,n)){if(r!==null&&u1(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var o=n.textContent.length,i=Math.min(r.start,o);r=r.end===void 0?i:Math.min(r.end,o),!e.extend&&i>r&&(o=r,r=i,i=o),o=r2(n,i);var a=r2(n,r);o&&a&&(e.rangeCount!==1||e.anchorNode!==o.node||e.anchorOffset!==o.offset||e.focusNode!==a.node||e.focusOffset!==a.offset)&&(t=t.createRange(),t.setStart(o.node,o.offset),e.removeAllRanges(),i>r?(e.addRange(t),e.extend(a.node,a.offset)):(t.setEnd(a.node,a.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var dP=go&&"documentMode"in document&&11>=document.documentMode,Na=null,W0=null,eu=null,H0=!1;function o2(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;H0||Na==null||Na!==of(r)||(r=Na,"selectionStart"in r&&u1(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),eu&&Su(eu,r)||(eu=r,r=ff(W0,"onSelect"),0<r.length&&(t=new a1("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Na)))}function Lc(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Aa={animationend:Lc("Animation","AnimationEnd"),animationiteration:Lc("Animation","AnimationIteration"),animationstart:Lc("Animation","AnimationStart"),transitionend:Lc("Transition","TransitionEnd")},om={},$C={};go&&($C=document.createElement("div").style,"AnimationEvent"in window||(delete Aa.animationend.animation,delete Aa.animationiteration.animation,delete Aa.animationstart.animation),"TransitionEvent"in window||delete Aa.transitionend.transition);function lp(e){if(om[e])return om[e];if(!Aa[e])return e;var t=Aa[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in $C)return om[e]=t[n];return e}var RC=lp("animationend"),kC=lp("animationiteration"),PC=lp("animationstart"),TC=lp("transitionend"),OC=new Map,i2="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function pi(e,t){OC.set(e,t),aa(t,[e])}for(var im=0;im<i2.length;im++){var am=i2[im],fP=am.toLowerCase(),pP=am[0].toUpperCase()+am.slice(1);pi(fP,"on"+pP)}pi(RC,"onAnimationEnd");pi(kC,"onAnimationIteration");pi(PC,"onAnimationStart");pi("dblclick","onDoubleClick");pi("focusin","onFocus");pi("focusout","onBlur");pi(TC,"onTransitionEnd");as("onMouseEnter",["mouseout","mouseover"]);as("onMouseLeave",["mouseout","mouseover"]);as("onPointerEnter",["pointerout","pointerover"]);as("onPointerLeave",["pointerout","pointerover"]);aa("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));aa("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));aa("onBeforeInput",["compositionend","keypress","textInput","paste"]);aa("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));aa("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));aa("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var jl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),hP=new Set("cancel close invalid load scroll toggle".split(" ").concat(jl));function a2(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,f5(r,t,void 0,e),e.currentTarget=null}function IC(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],o=r.event;r=r.listeners;e:{var i=void 0;if(t)for(var a=r.length-1;0<=a;a--){var s=r[a],l=s.instance,u=s.currentTarget;if(s=s.listener,l!==i&&o.isPropagationStopped())break e;a2(o,s,u),i=l}else for(a=0;a<r.length;a++){if(s=r[a],l=s.instance,u=s.currentTarget,s=s.listener,l!==i&&o.isPropagationStopped())break e;a2(o,s,u),i=l}}}if(sf)throw e=B0,sf=!1,B0=null,e}function ft(e,t){var n=t[Y0];n===void 0&&(n=t[Y0]=new Set);var r=e+"__bubble";n.has(r)||(NC(t,e,2,!1),n.add(r))}function sm(e,t,n){var r=0;t&&(r|=4),NC(n,e,r,t)}var Fc="_reactListening"+Math.random().toString(36).slice(2);function wu(e){if(!e[Fc]){e[Fc]=!0,zE.forEach(function(n){n!=="selectionchange"&&(hP.has(n)||sm(n,!1,e),sm(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Fc]||(t[Fc]=!0,sm("selectionchange",!1,t))}}function NC(e,t,n,r){switch(vC(t)){case 1:var o=k5;break;case 4:o=P5;break;default:o=o1}n=o.bind(null,t,n,e),o=void 0,!D0||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),r?o!==void 0?e.addEventListener(t,n,{capture:!0,passive:o}):e.addEventListener(t,n,!0):o!==void 0?e.addEventListener(t,n,{passive:o}):e.addEventListener(t,n,!1)}function lm(e,t,n,r,o){var i=r;if(!(t&1)&&!(t&2)&&r!==null)e:for(;;){if(r===null)return;var a=r.tag;if(a===3||a===4){var s=r.stateNode.containerInfo;if(s===o||s.nodeType===8&&s.parentNode===o)break;if(a===4)for(a=r.return;a!==null;){var l=a.tag;if((l===3||l===4)&&(l=a.stateNode.containerInfo,l===o||l.nodeType===8&&l.parentNode===o))return;a=a.return}for(;s!==null;){if(a=Pi(s),a===null)return;if(l=a.tag,l===5||l===6){r=i=a;continue e}s=s.parentNode}}r=r.return}nC(function(){var u=i,c=e1(n),d=[];e:{var f=OC.get(e);if(f!==void 0){var h=a1,v=e;switch(e){case"keypress":if(Nd(n)===0)break e;case"keydown":case"keyup":h=H5;break;case"focusin":v="focus",h=tm;break;case"focusout":v="blur",h=tm;break;case"beforeblur":case"afterblur":h=tm;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":h=Xb;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":h=I5;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":h=K5;break;case RC:case kC:case PC:h=M5;break;case TC:h=Y5;break;case"scroll":h=T5;break;case"wheel":h=Q5;break;case"copy":case"cut":case"paste":h=F5;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":h=qb}var y=(t&4)!==0,b=!y&&e==="scroll",p=y?f!==null?f+"Capture":null:f;y=[];for(var m=u,g;m!==null;){g=m;var w=g.stateNode;if(g.tag===5&&w!==null&&(g=w,p!==null&&(w=vu(m,p),w!=null&&y.push(_u(m,w,g)))),b)break;m=m.return}0<y.length&&(f=new h(f,v,null,n,c),d.push({event:f,listeners:y}))}}if(!(t&7)){e:{if(f=e==="mouseover"||e==="pointerover",h=e==="mouseout"||e==="pointerout",f&&n!==L0&&(v=n.relatedTarget||n.fromElement)&&(Pi(v)||v[yo]))break e;if((h||f)&&(f=c.window===c?c:(f=c.ownerDocument)?f.defaultView||f.parentWindow:window,h?(v=n.relatedTarget||n.toElement,h=u,v=v?Pi(v):null,v!==null&&(b=sa(v),v!==b||v.tag!==5&&v.tag!==6)&&(v=null)):(h=null,v=u),h!==v)){if(y=Xb,w="onMouseLeave",p="onMouseEnter",m="mouse",(e==="pointerout"||e==="pointerover")&&(y=qb,w="onPointerLeave",p="onPointerEnter",m="pointer"),b=h==null?f:Ma(h),g=v==null?f:Ma(v),f=new y(w,m+"leave",h,n,c),f.target=b,f.relatedTarget=g,w=null,Pi(c)===u&&(y=new y(p,m+"enter",v,n,c),y.target=g,y.relatedTarget=b,w=y),b=w,h&&v)t:{for(y=h,p=v,m=0,g=y;g;g=ba(g))m++;for(g=0,w=p;w;w=ba(w))g++;for(;0<m-g;)y=ba(y),m--;for(;0<g-m;)p=ba(p),g--;for(;m--;){if(y===p||p!==null&&y===p.alternate)break t;y=ba(y),p=ba(p)}y=null}else y=null;h!==null&&s2(d,f,h,y,!1),v!==null&&b!==null&&s2(d,b,v,y,!0)}}e:{if(f=u?Ma(u):window,h=f.nodeName&&f.nodeName.toLowerCase(),h==="select"||h==="input"&&f.type==="file")var C=oP;else if(Zb(f))if(wC)C=lP;else{C=aP;var S=iP}else(h=f.nodeName)&&h.toLowerCase()==="input"&&(f.type==="checkbox"||f.type==="radio")&&(C=sP);if(C&&(C=C(e,u))){SC(d,C,n,c);break e}S&&S(e,f,u),e==="focusout"&&(S=f._wrapperState)&&S.controlled&&f.type==="number"&&O0(f,"number",f.value)}switch(S=u?Ma(u):window,e){case"focusin":(Zb(S)||S.contentEditable==="true")&&(Na=S,W0=u,eu=null);break;case"focusout":eu=W0=Na=null;break;case"mousedown":H0=!0;break;case"contextmenu":case"mouseup":case"dragend":H0=!1,o2(d,n,c);break;case"selectionchange":if(dP)break;case"keydown":case"keyup":o2(d,n,c)}var $;if(l1)e:{switch(e){case"compositionstart":var R="onCompositionStart";break e;case"compositionend":R="onCompositionEnd";break e;case"compositionupdate":R="onCompositionUpdate";break e}R=void 0}else Ia?bC(e,n)&&(R="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(R="onCompositionStart");R&&(yC&&n.locale!=="ko"&&(Ia||R!=="onCompositionStart"?R==="onCompositionEnd"&&Ia&&($=gC()):(Ho=c,i1="value"in Ho?Ho.value:Ho.textContent,Ia=!0)),S=ff(u,R),0<S.length&&(R=new Yb(R,e,null,n,c),d.push({event:R,listeners:S}),$?R.data=$:($=xC(n),$!==null&&(R.data=$)))),($=Z5?eP(e,n):tP(e,n))&&(u=ff(u,"onBeforeInput"),0<u.length&&(c=new Yb("onBeforeInput","beforeinput",null,n,c),d.push({event:c,listeners:u}),c.data=$))}IC(d,t)})}function _u(e,t,n){return{instance:e,listener:t,currentTarget:n}}function ff(e,t){for(var n=t+"Capture",r=[];e!==null;){var o=e,i=o.stateNode;o.tag===5&&i!==null&&(o=i,i=vu(e,n),i!=null&&r.unshift(_u(e,i,o)),i=vu(e,t),i!=null&&r.push(_u(e,i,o))),e=e.return}return r}function ba(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function s2(e,t,n,r,o){for(var i=t._reactName,a=[];n!==null&&n!==r;){var s=n,l=s.alternate,u=s.stateNode;if(l!==null&&l===r)break;s.tag===5&&u!==null&&(s=u,o?(l=vu(n,i),l!=null&&a.unshift(_u(n,l,s))):o||(l=vu(n,i),l!=null&&a.push(_u(n,l,s)))),n=n.return}a.length!==0&&e.push({event:t,listeners:a})}var mP=/\r\n?/g,vP=/\u0000|\uFFFD/g;function l2(e){return(typeof e=="string"?e:""+e).replace(mP,`
`).replace(vP,"")}function Dc(e,t,n){if(t=l2(t),l2(e)!==t&&n)throw Error(W(425))}function pf(){}var V0=null,G0=null;function K0(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var X0=typeof setTimeout=="function"?setTimeout:void 0,gP=typeof clearTimeout=="function"?clearTimeout:void 0,u2=typeof Promise=="function"?Promise:void 0,yP=typeof queueMicrotask=="function"?queueMicrotask:typeof u2<"u"?function(e){return u2.resolve(null).then(e).catch(bP)}:X0;function bP(e){setTimeout(function(){throw e})}function um(e,t){var n=t,r=0;do{var o=n.nextSibling;if(e.removeChild(n),o&&o.nodeType===8)if(n=o.data,n==="/$"){if(r===0){e.removeChild(o),bu(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=o}while(n);bu(t)}function Zo(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function c2(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var Ds=Math.random().toString(36).slice(2),jr="__reactFiber$"+Ds,Eu="__reactProps$"+Ds,yo="__reactContainer$"+Ds,Y0="__reactEvents$"+Ds,xP="__reactListeners$"+Ds,SP="__reactHandles$"+Ds;function Pi(e){var t=e[jr];if(t)return t;for(var n=e.parentNode;n;){if(t=n[yo]||n[jr]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=c2(e);e!==null;){if(n=e[jr])return n;e=c2(e)}return t}e=n,n=e.parentNode}return null}function Xu(e){return e=e[jr]||e[yo],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Ma(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(W(33))}function up(e){return e[Eu]||null}var q0=[],La=-1;function hi(e){return{current:e}}function ht(e){0>La||(e.current=q0[La],q0[La]=null,La--)}function dt(e,t){La++,q0[La]=e.current,e.current=t}var ii={},un=hi(ii),$n=hi(!1),Hi=ii;function ss(e,t){var n=e.type.contextTypes;if(!n)return ii;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var o={},i;for(i in n)o[i]=t[i];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=o),o}function Rn(e){return e=e.childContextTypes,e!=null}function hf(){ht($n),ht(un)}function d2(e,t,n){if(un.current!==ii)throw Error(W(168));dt(un,t),dt($n,n)}function AC(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var o in r)if(!(o in t))throw Error(W(108,i5(e)||"Unknown",o));return Et({},n,r)}function mf(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||ii,Hi=un.current,dt(un,e),dt($n,$n.current),!0}function f2(e,t,n){var r=e.stateNode;if(!r)throw Error(W(169));n?(e=AC(e,t,Hi),r.__reactInternalMemoizedMergedChildContext=e,ht($n),ht(un),dt(un,e)):ht($n),dt($n,n)}var ao=null,cp=!1,cm=!1;function MC(e){ao===null?ao=[e]:ao.push(e)}function wP(e){cp=!0,MC(e)}function mi(){if(!cm&&ao!==null){cm=!0;var e=0,t=et;try{var n=ao;for(et=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}ao=null,cp=!1}catch(o){throw ao!==null&&(ao=ao.slice(e+1)),aC(t1,mi),o}finally{et=t,cm=!1}}return null}var Fa=[],Da=0,vf=null,gf=0,nr=[],rr=0,Vi=null,uo=1,co="";function wi(e,t){Fa[Da++]=gf,Fa[Da++]=vf,vf=e,gf=t}function LC(e,t,n){nr[rr++]=uo,nr[rr++]=co,nr[rr++]=Vi,Vi=e;var r=uo;e=co;var o=32-kr(r)-1;r&=~(1<<o),n+=1;var i=32-kr(t)+o;if(30<i){var a=o-o%5;i=(r&(1<<a)-1).toString(32),r>>=a,o-=a,uo=1<<32-kr(t)+o|n<<o|r,co=i+e}else uo=1<<i|n<<o|r,co=e}function c1(e){e.return!==null&&(wi(e,1),LC(e,1,0))}function d1(e){for(;e===vf;)vf=Fa[--Da],Fa[Da]=null,gf=Fa[--Da],Fa[Da]=null;for(;e===Vi;)Vi=nr[--rr],nr[rr]=null,co=nr[--rr],nr[rr]=null,uo=nr[--rr],nr[rr]=null}var zn=null,Dn=null,bt=!1,Rr=null;function FC(e,t){var n=sr(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function p2(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,zn=e,Dn=Zo(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,zn=e,Dn=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=Vi!==null?{id:uo,overflow:co}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=sr(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,zn=e,Dn=null,!0):!1;default:return!1}}function Q0(e){return(e.mode&1)!==0&&(e.flags&128)===0}function J0(e){if(bt){var t=Dn;if(t){var n=t;if(!p2(e,t)){if(Q0(e))throw Error(W(418));t=Zo(n.nextSibling);var r=zn;t&&p2(e,t)?FC(r,n):(e.flags=e.flags&-4097|2,bt=!1,zn=e)}}else{if(Q0(e))throw Error(W(418));e.flags=e.flags&-4097|2,bt=!1,zn=e}}}function h2(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;zn=e}function Bc(e){if(e!==zn)return!1;if(!bt)return h2(e),bt=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!K0(e.type,e.memoizedProps)),t&&(t=Dn)){if(Q0(e))throw DC(),Error(W(418));for(;t;)FC(e,t),t=Zo(t.nextSibling)}if(h2(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(W(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){Dn=Zo(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}Dn=null}}else Dn=zn?Zo(e.stateNode.nextSibling):null;return!0}function DC(){for(var e=Dn;e;)e=Zo(e.nextSibling)}function ls(){Dn=zn=null,bt=!1}function f1(e){Rr===null?Rr=[e]:Rr.push(e)}var _P=$o.ReactCurrentBatchConfig;function dl(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(W(309));var r=n.stateNode}if(!r)throw Error(W(147,e));var o=r,i=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===i?t.ref:(t=function(a){var s=o.refs;a===null?delete s[i]:s[i]=a},t._stringRef=i,t)}if(typeof e!="string")throw Error(W(284));if(!n._owner)throw Error(W(290,e))}return e}function zc(e,t){throw e=Object.prototype.toString.call(t),Error(W(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function m2(e){var t=e._init;return t(e._payload)}function BC(e){function t(p,m){if(e){var g=p.deletions;g===null?(p.deletions=[m],p.flags|=16):g.push(m)}}function n(p,m){if(!e)return null;for(;m!==null;)t(p,m),m=m.sibling;return null}function r(p,m){for(p=new Map;m!==null;)m.key!==null?p.set(m.key,m):p.set(m.index,m),m=m.sibling;return p}function o(p,m){return p=ri(p,m),p.index=0,p.sibling=null,p}function i(p,m,g){return p.index=g,e?(g=p.alternate,g!==null?(g=g.index,g<m?(p.flags|=2,m):g):(p.flags|=2,m)):(p.flags|=1048576,m)}function a(p){return e&&p.alternate===null&&(p.flags|=2),p}function s(p,m,g,w){return m===null||m.tag!==6?(m=gm(g,p.mode,w),m.return=p,m):(m=o(m,g),m.return=p,m)}function l(p,m,g,w){var C=g.type;return C===Oa?c(p,m,g.props.children,w,g.key):m!==null&&(m.elementType===C||typeof C=="object"&&C!==null&&C.$$typeof===Do&&m2(C)===m.type)?(w=o(m,g.props),w.ref=dl(p,m,g),w.return=p,w):(w=zd(g.type,g.key,g.props,null,p.mode,w),w.ref=dl(p,m,g),w.return=p,w)}function u(p,m,g,w){return m===null||m.tag!==4||m.stateNode.containerInfo!==g.containerInfo||m.stateNode.implementation!==g.implementation?(m=ym(g,p.mode,w),m.return=p,m):(m=o(m,g.children||[]),m.return=p,m)}function c(p,m,g,w,C){return m===null||m.tag!==7?(m=Di(g,p.mode,w,C),m.return=p,m):(m=o(m,g),m.return=p,m)}function d(p,m,g){if(typeof m=="string"&&m!==""||typeof m=="number")return m=gm(""+m,p.mode,g),m.return=p,m;if(typeof m=="object"&&m!==null){switch(m.$$typeof){case Pc:return g=zd(m.type,m.key,m.props,null,p.mode,g),g.ref=dl(p,null,m),g.return=p,g;case Ta:return m=ym(m,p.mode,g),m.return=p,m;case Do:var w=m._init;return d(p,w(m._payload),g)}if(Bl(m)||al(m))return m=Di(m,p.mode,g,null),m.return=p,m;zc(p,m)}return null}function f(p,m,g,w){var C=m!==null?m.key:null;if(typeof g=="string"&&g!==""||typeof g=="number")return C!==null?null:s(p,m,""+g,w);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Pc:return g.key===C?l(p,m,g,w):null;case Ta:return g.key===C?u(p,m,g,w):null;case Do:return C=g._init,f(p,m,C(g._payload),w)}if(Bl(g)||al(g))return C!==null?null:c(p,m,g,w,null);zc(p,g)}return null}function h(p,m,g,w,C){if(typeof w=="string"&&w!==""||typeof w=="number")return p=p.get(g)||null,s(m,p,""+w,C);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Pc:return p=p.get(w.key===null?g:w.key)||null,l(m,p,w,C);case Ta:return p=p.get(w.key===null?g:w.key)||null,u(m,p,w,C);case Do:var S=w._init;return h(p,m,g,S(w._payload),C)}if(Bl(w)||al(w))return p=p.get(g)||null,c(m,p,w,C,null);zc(m,w)}return null}function v(p,m,g,w){for(var C=null,S=null,$=m,R=m=0,k=null;$!==null&&R<g.length;R++){$.index>R?(k=$,$=null):k=$.sibling;var P=f(p,$,g[R],w);if(P===null){$===null&&($=k);break}e&&$&&P.alternate===null&&t(p,$),m=i(P,m,R),S===null?C=P:S.sibling=P,S=P,$=k}if(R===g.length)return n(p,$),bt&&wi(p,R),C;if($===null){for(;R<g.length;R++)$=d(p,g[R],w),$!==null&&(m=i($,m,R),S===null?C=$:S.sibling=$,S=$);return bt&&wi(p,R),C}for($=r(p,$);R<g.length;R++)k=h($,p,R,g[R],w),k!==null&&(e&&k.alternate!==null&&$.delete(k.key===null?R:k.key),m=i(k,m,R),S===null?C=k:S.sibling=k,S=k);return e&&$.forEach(function(N){return t(p,N)}),bt&&wi(p,R),C}function y(p,m,g,w){var C=al(g);if(typeof C!="function")throw Error(W(150));if(g=C.call(g),g==null)throw Error(W(151));for(var S=C=null,$=m,R=m=0,k=null,P=g.next();$!==null&&!P.done;R++,P=g.next()){$.index>R?(k=$,$=null):k=$.sibling;var N=f(p,$,P.value,w);if(N===null){$===null&&($=k);break}e&&$&&N.alternate===null&&t(p,$),m=i(N,m,R),S===null?C=N:S.sibling=N,S=N,$=k}if(P.done)return n(p,$),bt&&wi(p,R),C;if($===null){for(;!P.done;R++,P=g.next())P=d(p,P.value,w),P!==null&&(m=i(P,m,R),S===null?C=P:S.sibling=P,S=P);return bt&&wi(p,R),C}for($=r(p,$);!P.done;R++,P=g.next())P=h($,p,R,P.value,w),P!==null&&(e&&P.alternate!==null&&$.delete(P.key===null?R:P.key),m=i(P,m,R),S===null?C=P:S.sibling=P,S=P);return e&&$.forEach(function(F){return t(p,F)}),bt&&wi(p,R),C}function b(p,m,g,w){if(typeof g=="object"&&g!==null&&g.type===Oa&&g.key===null&&(g=g.props.children),typeof g=="object"&&g!==null){switch(g.$$typeof){case Pc:e:{for(var C=g.key,S=m;S!==null;){if(S.key===C){if(C=g.type,C===Oa){if(S.tag===7){n(p,S.sibling),m=o(S,g.props.children),m.return=p,p=m;break e}}else if(S.elementType===C||typeof C=="object"&&C!==null&&C.$$typeof===Do&&m2(C)===S.type){n(p,S.sibling),m=o(S,g.props),m.ref=dl(p,S,g),m.return=p,p=m;break e}n(p,S);break}else t(p,S);S=S.sibling}g.type===Oa?(m=Di(g.props.children,p.mode,w,g.key),m.return=p,p=m):(w=zd(g.type,g.key,g.props,null,p.mode,w),w.ref=dl(p,m,g),w.return=p,p=w)}return a(p);case Ta:e:{for(S=g.key;m!==null;){if(m.key===S)if(m.tag===4&&m.stateNode.containerInfo===g.containerInfo&&m.stateNode.implementation===g.implementation){n(p,m.sibling),m=o(m,g.children||[]),m.return=p,p=m;break e}else{n(p,m);break}else t(p,m);m=m.sibling}m=ym(g,p.mode,w),m.return=p,p=m}return a(p);case Do:return S=g._init,b(p,m,S(g._payload),w)}if(Bl(g))return v(p,m,g,w);if(al(g))return y(p,m,g,w);zc(p,g)}return typeof g=="string"&&g!==""||typeof g=="number"?(g=""+g,m!==null&&m.tag===6?(n(p,m.sibling),m=o(m,g),m.return=p,p=m):(n(p,m),m=gm(g,p.mode,w),m.return=p,p=m),a(p)):n(p,m)}return b}var us=BC(!0),zC=BC(!1),yf=hi(null),bf=null,Ba=null,p1=null;function h1(){p1=Ba=bf=null}function m1(e){var t=yf.current;ht(yf),e._currentValue=t}function Z0(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function qa(e,t){bf=e,p1=Ba=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&t&&(Cn=!0),e.firstContext=null)}function pr(e){var t=e._currentValue;if(p1!==e)if(e={context:e,memoizedValue:t,next:null},Ba===null){if(bf===null)throw Error(W(308));Ba=e,bf.dependencies={lanes:0,firstContext:e}}else Ba=Ba.next=e;return t}var Ti=null;function v1(e){Ti===null?Ti=[e]:Ti.push(e)}function jC(e,t,n,r){var o=t.interleaved;return o===null?(n.next=n,v1(t)):(n.next=o.next,o.next=n),t.interleaved=n,bo(e,r)}function bo(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var Bo=!1;function g1(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function UC(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function po(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function ei(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,Ve&2){var o=r.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),r.pending=t,bo(e,n)}return o=r.interleaved,o===null?(t.next=t,v1(r)):(t.next=o.next,o.next=t),r.interleaved=t,bo(e,n)}function Ad(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,n1(e,n)}}function v2(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var o=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var a={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};i===null?o=i=a:i=i.next=a,n=n.next}while(n!==null);i===null?o=i=t:i=i.next=t}else o=i=t;n={baseState:r.baseState,firstBaseUpdate:o,lastBaseUpdate:i,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function xf(e,t,n,r){var o=e.updateQueue;Bo=!1;var i=o.firstBaseUpdate,a=o.lastBaseUpdate,s=o.shared.pending;if(s!==null){o.shared.pending=null;var l=s,u=l.next;l.next=null,a===null?i=u:a.next=u,a=l;var c=e.alternate;c!==null&&(c=c.updateQueue,s=c.lastBaseUpdate,s!==a&&(s===null?c.firstBaseUpdate=u:s.next=u,c.lastBaseUpdate=l))}if(i!==null){var d=o.baseState;a=0,c=u=l=null,s=i;do{var f=s.lane,h=s.eventTime;if((r&f)===f){c!==null&&(c=c.next={eventTime:h,lane:0,tag:s.tag,payload:s.payload,callback:s.callback,next:null});e:{var v=e,y=s;switch(f=t,h=n,y.tag){case 1:if(v=y.payload,typeof v=="function"){d=v.call(h,d,f);break e}d=v;break e;case 3:v.flags=v.flags&-65537|128;case 0:if(v=y.payload,f=typeof v=="function"?v.call(h,d,f):v,f==null)break e;d=Et({},d,f);break e;case 2:Bo=!0}}s.callback!==null&&s.lane!==0&&(e.flags|=64,f=o.effects,f===null?o.effects=[s]:f.push(s))}else h={eventTime:h,lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},c===null?(u=c=h,l=d):c=c.next=h,a|=f;if(s=s.next,s===null){if(s=o.shared.pending,s===null)break;f=s,s=f.next,f.next=null,o.lastBaseUpdate=f,o.shared.pending=null}}while(1);if(c===null&&(l=d),o.baseState=l,o.firstBaseUpdate=u,o.lastBaseUpdate=c,t=o.shared.interleaved,t!==null){o=t;do a|=o.lane,o=o.next;while(o!==t)}else i===null&&(o.shared.lanes=0);Ki|=a,e.lanes=a,e.memoizedState=d}}function g2(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],o=r.callback;if(o!==null){if(r.callback=null,r=n,typeof o!="function")throw Error(W(191,o));o.call(r)}}}var Yu={},Gr=hi(Yu),Cu=hi(Yu),$u=hi(Yu);function Oi(e){if(e===Yu)throw Error(W(174));return e}function y1(e,t){switch(dt($u,t),dt(Cu,e),dt(Gr,Yu),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:N0(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=N0(t,e)}ht(Gr),dt(Gr,t)}function cs(){ht(Gr),ht(Cu),ht($u)}function WC(e){Oi($u.current);var t=Oi(Gr.current),n=N0(t,e.type);t!==n&&(dt(Cu,e),dt(Gr,n))}function b1(e){Cu.current===e&&(ht(Gr),ht(Cu))}var St=hi(0);function Sf(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var dm=[];function x1(){for(var e=0;e<dm.length;e++)dm[e]._workInProgressVersionPrimary=null;dm.length=0}var Md=$o.ReactCurrentDispatcher,fm=$o.ReactCurrentBatchConfig,Gi=0,_t=null,jt=null,Gt=null,wf=!1,tu=!1,Ru=0,EP=0;function nn(){throw Error(W(321))}function S1(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Or(e[n],t[n]))return!1;return!0}function w1(e,t,n,r,o,i){if(Gi=i,_t=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Md.current=e===null||e.memoizedState===null?kP:PP,e=n(r,o),tu){i=0;do{if(tu=!1,Ru=0,25<=i)throw Error(W(301));i+=1,Gt=jt=null,t.updateQueue=null,Md.current=TP,e=n(r,o)}while(tu)}if(Md.current=_f,t=jt!==null&&jt.next!==null,Gi=0,Gt=jt=_t=null,wf=!1,t)throw Error(W(300));return e}function _1(){var e=Ru!==0;return Ru=0,e}function Fr(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Gt===null?_t.memoizedState=Gt=e:Gt=Gt.next=e,Gt}function hr(){if(jt===null){var e=_t.alternate;e=e!==null?e.memoizedState:null}else e=jt.next;var t=Gt===null?_t.memoizedState:Gt.next;if(t!==null)Gt=t,jt=e;else{if(e===null)throw Error(W(310));jt=e,e={memoizedState:jt.memoizedState,baseState:jt.baseState,baseQueue:jt.baseQueue,queue:jt.queue,next:null},Gt===null?_t.memoizedState=Gt=e:Gt=Gt.next=e}return Gt}function ku(e,t){return typeof t=="function"?t(e):t}function pm(e){var t=hr(),n=t.queue;if(n===null)throw Error(W(311));n.lastRenderedReducer=e;var r=jt,o=r.baseQueue,i=n.pending;if(i!==null){if(o!==null){var a=o.next;o.next=i.next,i.next=a}r.baseQueue=o=i,n.pending=null}if(o!==null){i=o.next,r=r.baseState;var s=a=null,l=null,u=i;do{var c=u.lane;if((Gi&c)===c)l!==null&&(l=l.next={lane:0,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),r=u.hasEagerState?u.eagerState:e(r,u.action);else{var d={lane:c,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null};l===null?(s=l=d,a=r):l=l.next=d,_t.lanes|=c,Ki|=c}u=u.next}while(u!==null&&u!==i);l===null?a=r:l.next=s,Or(r,t.memoizedState)||(Cn=!0),t.memoizedState=r,t.baseState=a,t.baseQueue=l,n.lastRenderedState=r}if(e=n.interleaved,e!==null){o=e;do i=o.lane,_t.lanes|=i,Ki|=i,o=o.next;while(o!==e)}else o===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function hm(e){var t=hr(),n=t.queue;if(n===null)throw Error(W(311));n.lastRenderedReducer=e;var r=n.dispatch,o=n.pending,i=t.memoizedState;if(o!==null){n.pending=null;var a=o=o.next;do i=e(i,a.action),a=a.next;while(a!==o);Or(i,t.memoizedState)||(Cn=!0),t.memoizedState=i,t.baseQueue===null&&(t.baseState=i),n.lastRenderedState=i}return[i,r]}function HC(){}function VC(e,t){var n=_t,r=hr(),o=t(),i=!Or(r.memoizedState,o);if(i&&(r.memoizedState=o,Cn=!0),r=r.queue,E1(XC.bind(null,n,r,e),[e]),r.getSnapshot!==t||i||Gt!==null&&Gt.memoizedState.tag&1){if(n.flags|=2048,Pu(9,KC.bind(null,n,r,o,t),void 0,null),Kt===null)throw Error(W(349));Gi&30||GC(n,t,o)}return o}function GC(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=_t.updateQueue,t===null?(t={lastEffect:null,stores:null},_t.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function KC(e,t,n,r){t.value=n,t.getSnapshot=r,YC(t)&&qC(e)}function XC(e,t,n){return n(function(){YC(t)&&qC(e)})}function YC(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Or(e,n)}catch{return!0}}function qC(e){var t=bo(e,1);t!==null&&Pr(t,e,1,-1)}function y2(e){var t=Fr();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:ku,lastRenderedState:e},t.queue=e,e=e.dispatch=RP.bind(null,_t,e),[t.memoizedState,e]}function Pu(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=_t.updateQueue,t===null?(t={lastEffect:null,stores:null},_t.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function QC(){return hr().memoizedState}function Ld(e,t,n,r){var o=Fr();_t.flags|=e,o.memoizedState=Pu(1|t,n,void 0,r===void 0?null:r)}function dp(e,t,n,r){var o=hr();r=r===void 0?null:r;var i=void 0;if(jt!==null){var a=jt.memoizedState;if(i=a.destroy,r!==null&&S1(r,a.deps)){o.memoizedState=Pu(t,n,i,r);return}}_t.flags|=e,o.memoizedState=Pu(1|t,n,i,r)}function b2(e,t){return Ld(8390656,8,e,t)}function E1(e,t){return dp(2048,8,e,t)}function JC(e,t){return dp(4,2,e,t)}function ZC(e,t){return dp(4,4,e,t)}function e3(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function t3(e,t,n){return n=n!=null?n.concat([e]):null,dp(4,4,e3.bind(null,t,e),n)}function C1(){}function n3(e,t){var n=hr();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&S1(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function r3(e,t){var n=hr();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&S1(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function o3(e,t,n){return Gi&21?(Or(n,t)||(n=uC(),_t.lanes|=n,Ki|=n,e.baseState=!0),t):(e.baseState&&(e.baseState=!1,Cn=!0),e.memoizedState=n)}function CP(e,t){var n=et;et=n!==0&&4>n?n:4,e(!0);var r=fm.transition;fm.transition={};try{e(!1),t()}finally{et=n,fm.transition=r}}function i3(){return hr().memoizedState}function $P(e,t,n){var r=ni(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},a3(e))s3(t,n);else if(n=jC(e,t,n,r),n!==null){var o=vn();Pr(n,e,r,o),l3(n,t,r)}}function RP(e,t,n){var r=ni(e),o={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(a3(e))s3(t,o);else{var i=e.alternate;if(e.lanes===0&&(i===null||i.lanes===0)&&(i=t.lastRenderedReducer,i!==null))try{var a=t.lastRenderedState,s=i(a,n);if(o.hasEagerState=!0,o.eagerState=s,Or(s,a)){var l=t.interleaved;l===null?(o.next=o,v1(t)):(o.next=l.next,l.next=o),t.interleaved=o;return}}catch{}finally{}n=jC(e,t,o,r),n!==null&&(o=vn(),Pr(n,e,r,o),l3(n,t,r))}}function a3(e){var t=e.alternate;return e===_t||t!==null&&t===_t}function s3(e,t){tu=wf=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function l3(e,t,n){if(n&4194240){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,n1(e,n)}}var _f={readContext:pr,useCallback:nn,useContext:nn,useEffect:nn,useImperativeHandle:nn,useInsertionEffect:nn,useLayoutEffect:nn,useMemo:nn,useReducer:nn,useRef:nn,useState:nn,useDebugValue:nn,useDeferredValue:nn,useTransition:nn,useMutableSource:nn,useSyncExternalStore:nn,useId:nn,unstable_isNewReconciler:!1},kP={readContext:pr,useCallback:function(e,t){return Fr().memoizedState=[e,t===void 0?null:t],e},useContext:pr,useEffect:b2,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Ld(4194308,4,e3.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Ld(4194308,4,e,t)},useInsertionEffect:function(e,t){return Ld(4,2,e,t)},useMemo:function(e,t){var n=Fr();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=Fr();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=$P.bind(null,_t,e),[r.memoizedState,e]},useRef:function(e){var t=Fr();return e={current:e},t.memoizedState=e},useState:y2,useDebugValue:C1,useDeferredValue:function(e){return Fr().memoizedState=e},useTransition:function(){var e=y2(!1),t=e[0];return e=CP.bind(null,e[1]),Fr().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=_t,o=Fr();if(bt){if(n===void 0)throw Error(W(407));n=n()}else{if(n=t(),Kt===null)throw Error(W(349));Gi&30||GC(r,t,n)}o.memoizedState=n;var i={value:n,getSnapshot:t};return o.queue=i,b2(XC.bind(null,r,i,e),[e]),r.flags|=2048,Pu(9,KC.bind(null,r,i,n,t),void 0,null),n},useId:function(){var e=Fr(),t=Kt.identifierPrefix;if(bt){var n=co,r=uo;n=(r&~(1<<32-kr(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=Ru++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=EP++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},PP={readContext:pr,useCallback:n3,useContext:pr,useEffect:E1,useImperativeHandle:t3,useInsertionEffect:JC,useLayoutEffect:ZC,useMemo:r3,useReducer:pm,useRef:QC,useState:function(){return pm(ku)},useDebugValue:C1,useDeferredValue:function(e){var t=hr();return o3(t,jt.memoizedState,e)},useTransition:function(){var e=pm(ku)[0],t=hr().memoizedState;return[e,t]},useMutableSource:HC,useSyncExternalStore:VC,useId:i3,unstable_isNewReconciler:!1},TP={readContext:pr,useCallback:n3,useContext:pr,useEffect:E1,useImperativeHandle:t3,useInsertionEffect:JC,useLayoutEffect:ZC,useMemo:r3,useReducer:hm,useRef:QC,useState:function(){return hm(ku)},useDebugValue:C1,useDeferredValue:function(e){var t=hr();return jt===null?t.memoizedState=e:o3(t,jt.memoizedState,e)},useTransition:function(){var e=hm(ku)[0],t=hr().memoizedState;return[e,t]},useMutableSource:HC,useSyncExternalStore:VC,useId:i3,unstable_isNewReconciler:!1};function Er(e,t){if(e&&e.defaultProps){t=Et({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function ev(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:Et({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var fp={isMounted:function(e){return(e=e._reactInternals)?sa(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=vn(),o=ni(e),i=po(r,o);i.payload=t,n!=null&&(i.callback=n),t=ei(e,i,o),t!==null&&(Pr(t,e,o,r),Ad(t,e,o))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=vn(),o=ni(e),i=po(r,o);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=ei(e,i,o),t!==null&&(Pr(t,e,o,r),Ad(t,e,o))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=vn(),r=ni(e),o=po(n,r);o.tag=2,t!=null&&(o.callback=t),t=ei(e,o,r),t!==null&&(Pr(t,e,r,n),Ad(t,e,r))}};function x2(e,t,n,r,o,i,a){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,i,a):t.prototype&&t.prototype.isPureReactComponent?!Su(n,r)||!Su(o,i):!0}function u3(e,t,n){var r=!1,o=ii,i=t.contextType;return typeof i=="object"&&i!==null?i=pr(i):(o=Rn(t)?Hi:un.current,r=t.contextTypes,i=(r=r!=null)?ss(e,o):ii),t=new t(n,i),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=fp,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=o,e.__reactInternalMemoizedMaskedChildContext=i),t}function S2(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&fp.enqueueReplaceState(t,t.state,null)}function tv(e,t,n,r){var o=e.stateNode;o.props=n,o.state=e.memoizedState,o.refs={},g1(e);var i=t.contextType;typeof i=="object"&&i!==null?o.context=pr(i):(i=Rn(t)?Hi:un.current,o.context=ss(e,i)),o.state=e.memoizedState,i=t.getDerivedStateFromProps,typeof i=="function"&&(ev(e,t,i,n),o.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof o.getSnapshotBeforeUpdate=="function"||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(t=o.state,typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount(),t!==o.state&&fp.enqueueReplaceState(o,o.state,null),xf(e,n,o,r),o.state=e.memoizedState),typeof o.componentDidMount=="function"&&(e.flags|=4194308)}function ds(e,t){try{var n="",r=t;do n+=o5(r),r=r.return;while(r);var o=n}catch(i){o=`
Error generating stack: `+i.message+`
`+i.stack}return{value:e,source:t,stack:o,digest:null}}function mm(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function nv(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var OP=typeof WeakMap=="function"?WeakMap:Map;function c3(e,t,n){n=po(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){Cf||(Cf=!0,fv=r),nv(e,t)},n}function d3(e,t,n){n=po(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var o=t.value;n.payload=function(){return r(o)},n.callback=function(){nv(e,t)}}var i=e.stateNode;return i!==null&&typeof i.componentDidCatch=="function"&&(n.callback=function(){nv(e,t),typeof r!="function"&&(ti===null?ti=new Set([this]):ti.add(this));var a=t.stack;this.componentDidCatch(t.value,{componentStack:a!==null?a:""})}),n}function w2(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new OP;var o=new Set;r.set(t,o)}else o=r.get(t),o===void 0&&(o=new Set,r.set(t,o));o.has(n)||(o.add(n),e=VP.bind(null,e,t,n),t.then(e,e))}function _2(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function E2(e,t,n,r,o){return e.mode&1?(e.flags|=65536,e.lanes=o,e):(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=po(-1,1),t.tag=2,ei(n,t,1))),n.lanes|=1),e)}var IP=$o.ReactCurrentOwner,Cn=!1;function fn(e,t,n,r){t.child=e===null?zC(t,null,n,r):us(t,e.child,n,r)}function C2(e,t,n,r,o){n=n.render;var i=t.ref;return qa(t,o),r=w1(e,t,n,r,i,o),n=_1(),e!==null&&!Cn?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,xo(e,t,o)):(bt&&n&&c1(t),t.flags|=1,fn(e,t,r,o),t.child)}function $2(e,t,n,r,o){if(e===null){var i=n.type;return typeof i=="function"&&!N1(i)&&i.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=i,f3(e,t,i,r,o)):(e=zd(n.type,null,r,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(i=e.child,!(e.lanes&o)){var a=i.memoizedProps;if(n=n.compare,n=n!==null?n:Su,n(a,r)&&e.ref===t.ref)return xo(e,t,o)}return t.flags|=1,e=ri(i,r),e.ref=t.ref,e.return=t,t.child=e}function f3(e,t,n,r,o){if(e!==null){var i=e.memoizedProps;if(Su(i,r)&&e.ref===t.ref)if(Cn=!1,t.pendingProps=r=i,(e.lanes&o)!==0)e.flags&131072&&(Cn=!0);else return t.lanes=e.lanes,xo(e,t,o)}return rv(e,t,n,r,o)}function p3(e,t,n){var r=t.pendingProps,o=r.children,i=e!==null?e.memoizedState:null;if(r.mode==="hidden")if(!(t.mode&1))t.memoizedState={baseLanes:0,cachePool:null,transitions:null},dt(ja,Mn),Mn|=n;else{if(!(n&1073741824))return e=i!==null?i.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,dt(ja,Mn),Mn|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=i!==null?i.baseLanes:n,dt(ja,Mn),Mn|=r}else i!==null?(r=i.baseLanes|n,t.memoizedState=null):r=n,dt(ja,Mn),Mn|=r;return fn(e,t,o,n),t.child}function h3(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function rv(e,t,n,r,o){var i=Rn(n)?Hi:un.current;return i=ss(t,i),qa(t,o),n=w1(e,t,n,r,i,o),r=_1(),e!==null&&!Cn?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,xo(e,t,o)):(bt&&r&&c1(t),t.flags|=1,fn(e,t,n,o),t.child)}function R2(e,t,n,r,o){if(Rn(n)){var i=!0;mf(t)}else i=!1;if(qa(t,o),t.stateNode===null)Fd(e,t),u3(t,n,r),tv(t,n,r,o),r=!0;else if(e===null){var a=t.stateNode,s=t.memoizedProps;a.props=s;var l=a.context,u=n.contextType;typeof u=="object"&&u!==null?u=pr(u):(u=Rn(n)?Hi:un.current,u=ss(t,u));var c=n.getDerivedStateFromProps,d=typeof c=="function"||typeof a.getSnapshotBeforeUpdate=="function";d||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(s!==r||l!==u)&&S2(t,a,r,u),Bo=!1;var f=t.memoizedState;a.state=f,xf(t,r,a,o),l=t.memoizedState,s!==r||f!==l||$n.current||Bo?(typeof c=="function"&&(ev(t,n,c,r),l=t.memoizedState),(s=Bo||x2(t,n,s,r,f,l,u))?(d||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=u,r=s):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,UC(e,t),s=t.memoizedProps,u=t.type===t.elementType?s:Er(t.type,s),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,typeof l=="object"&&l!==null?l=pr(l):(l=Rn(n)?Hi:un.current,l=ss(t,l));var h=n.getDerivedStateFromProps;(c=typeof h=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(s!==d||f!==l)&&S2(t,a,r,l),Bo=!1,f=t.memoizedState,a.state=f,xf(t,r,a,o);var v=t.memoizedState;s!==d||f!==v||$n.current||Bo?(typeof h=="function"&&(ev(t,n,h,r),v=t.memoizedState),(u=Bo||x2(t,n,u,r,f,v,l)||!1)?(c||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(r,v,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(r,v,l)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=v),a.props=r,a.state=v,a.context=l,r=u):(typeof a.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return ov(e,t,n,r,i,o)}function ov(e,t,n,r,o,i){h3(e,t);var a=(t.flags&128)!==0;if(!r&&!a)return o&&f2(t,n,!1),xo(e,t,i);r=t.stateNode,IP.current=t;var s=a&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&a?(t.child=us(t,e.child,null,i),t.child=us(t,null,s,i)):fn(e,t,s,i),t.memoizedState=r.state,o&&f2(t,n,!0),t.child}function m3(e){var t=e.stateNode;t.pendingContext?d2(e,t.pendingContext,t.pendingContext!==t.context):t.context&&d2(e,t.context,!1),y1(e,t.containerInfo)}function k2(e,t,n,r,o){return ls(),f1(o),t.flags|=256,fn(e,t,n,r),t.child}var iv={dehydrated:null,treeContext:null,retryLane:0};function av(e){return{baseLanes:e,cachePool:null,transitions:null}}function v3(e,t,n){var r=t.pendingProps,o=St.current,i=!1,a=(t.flags&128)!==0,s;if((s=a)||(s=e!==null&&e.memoizedState===null?!1:(o&2)!==0),s?(i=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(o|=1),dt(St,o&1),e===null)return J0(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(t.mode&1?e.data==="$!"?t.lanes=8:t.lanes=1073741824:t.lanes=1,null):(a=r.children,e=r.fallback,i?(r=t.mode,i=t.child,a={mode:"hidden",children:a},!(r&1)&&i!==null?(i.childLanes=0,i.pendingProps=a):i=mp(a,r,0,null),e=Di(e,r,n,null),i.return=t,e.return=t,i.sibling=e,t.child=i,t.child.memoizedState=av(n),t.memoizedState=iv,e):$1(t,a));if(o=e.memoizedState,o!==null&&(s=o.dehydrated,s!==null))return NP(e,t,a,r,s,o,n);if(i){i=r.fallback,a=t.mode,o=e.child,s=o.sibling;var l={mode:"hidden",children:r.children};return!(a&1)&&t.child!==o?(r=t.child,r.childLanes=0,r.pendingProps=l,t.deletions=null):(r=ri(o,l),r.subtreeFlags=o.subtreeFlags&14680064),s!==null?i=ri(s,i):(i=Di(i,a,n,null),i.flags|=2),i.return=t,r.return=t,r.sibling=i,t.child=r,r=i,i=t.child,a=e.child.memoizedState,a=a===null?av(n):{baseLanes:a.baseLanes|n,cachePool:null,transitions:a.transitions},i.memoizedState=a,i.childLanes=e.childLanes&~n,t.memoizedState=iv,r}return i=e.child,e=i.sibling,r=ri(i,{mode:"visible",children:r.children}),!(t.mode&1)&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function $1(e,t){return t=mp({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function jc(e,t,n,r){return r!==null&&f1(r),us(t,e.child,null,n),e=$1(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function NP(e,t,n,r,o,i,a){if(n)return t.flags&256?(t.flags&=-257,r=mm(Error(W(422))),jc(e,t,a,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(i=r.fallback,o=t.mode,r=mp({mode:"visible",children:r.children},o,0,null),i=Di(i,o,a,null),i.flags|=2,r.return=t,i.return=t,r.sibling=i,t.child=r,t.mode&1&&us(t,e.child,null,a),t.child.memoizedState=av(a),t.memoizedState=iv,i);if(!(t.mode&1))return jc(e,t,a,null);if(o.data==="$!"){if(r=o.nextSibling&&o.nextSibling.dataset,r)var s=r.dgst;return r=s,i=Error(W(419)),r=mm(i,r,void 0),jc(e,t,a,r)}if(s=(a&e.childLanes)!==0,Cn||s){if(r=Kt,r!==null){switch(a&-a){case 4:o=2;break;case 16:o=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:o=32;break;case 536870912:o=268435456;break;default:o=0}o=o&(r.suspendedLanes|a)?0:o,o!==0&&o!==i.retryLane&&(i.retryLane=o,bo(e,o),Pr(r,e,o,-1))}return I1(),r=mm(Error(W(421))),jc(e,t,a,r)}return o.data==="$?"?(t.flags|=128,t.child=e.child,t=GP.bind(null,e),o._reactRetry=t,null):(e=i.treeContext,Dn=Zo(o.nextSibling),zn=t,bt=!0,Rr=null,e!==null&&(nr[rr++]=uo,nr[rr++]=co,nr[rr++]=Vi,uo=e.id,co=e.overflow,Vi=t),t=$1(t,r.children),t.flags|=4096,t)}function P2(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),Z0(e.return,t,n)}function vm(e,t,n,r,o){var i=e.memoizedState;i===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:o}:(i.isBackwards=t,i.rendering=null,i.renderingStartTime=0,i.last=r,i.tail=n,i.tailMode=o)}function g3(e,t,n){var r=t.pendingProps,o=r.revealOrder,i=r.tail;if(fn(e,t,r.children,n),r=St.current,r&2)r=r&1|2,t.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&P2(e,n,t);else if(e.tag===19)P2(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(dt(St,r),!(t.mode&1))t.memoizedState=null;else switch(o){case"forwards":for(n=t.child,o=null;n!==null;)e=n.alternate,e!==null&&Sf(e)===null&&(o=n),n=n.sibling;n=o,n===null?(o=t.child,t.child=null):(o=n.sibling,n.sibling=null),vm(t,!1,o,n,i);break;case"backwards":for(n=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Sf(e)===null){t.child=o;break}e=o.sibling,o.sibling=n,n=o,o=e}vm(t,!0,n,null,i);break;case"together":vm(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Fd(e,t){!(t.mode&1)&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function xo(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Ki|=t.lanes,!(n&t.childLanes))return null;if(e!==null&&t.child!==e.child)throw Error(W(153));if(t.child!==null){for(e=t.child,n=ri(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=ri(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function AP(e,t,n){switch(t.tag){case 3:m3(t),ls();break;case 5:WC(t);break;case 1:Rn(t.type)&&mf(t);break;case 4:y1(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,o=t.memoizedProps.value;dt(yf,r._currentValue),r._currentValue=o;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(dt(St,St.current&1),t.flags|=128,null):n&t.child.childLanes?v3(e,t,n):(dt(St,St.current&1),e=xo(e,t,n),e!==null?e.sibling:null);dt(St,St.current&1);break;case 19:if(r=(n&t.childLanes)!==0,e.flags&128){if(r)return g3(e,t,n);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),dt(St,St.current),r)break;return null;case 22:case 23:return t.lanes=0,p3(e,t,n)}return xo(e,t,n)}var y3,sv,b3,x3;y3=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};sv=function(){};b3=function(e,t,n,r){var o=e.memoizedProps;if(o!==r){e=t.stateNode,Oi(Gr.current);var i=null;switch(n){case"input":o=P0(e,o),r=P0(e,r),i=[];break;case"select":o=Et({},o,{value:void 0}),r=Et({},r,{value:void 0}),i=[];break;case"textarea":o=I0(e,o),r=I0(e,r),i=[];break;default:typeof o.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=pf)}A0(n,r);var a;n=null;for(u in o)if(!r.hasOwnProperty(u)&&o.hasOwnProperty(u)&&o[u]!=null)if(u==="style"){var s=o[u];for(a in s)s.hasOwnProperty(a)&&(n||(n={}),n[a]="")}else u!=="dangerouslySetInnerHTML"&&u!=="children"&&u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&u!=="autoFocus"&&(hu.hasOwnProperty(u)?i||(i=[]):(i=i||[]).push(u,null));for(u in r){var l=r[u];if(s=o!=null?o[u]:void 0,r.hasOwnProperty(u)&&l!==s&&(l!=null||s!=null))if(u==="style")if(s){for(a in s)!s.hasOwnProperty(a)||l&&l.hasOwnProperty(a)||(n||(n={}),n[a]="");for(a in l)l.hasOwnProperty(a)&&s[a]!==l[a]&&(n||(n={}),n[a]=l[a])}else n||(i||(i=[]),i.push(u,n)),n=l;else u==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,s=s?s.__html:void 0,l!=null&&s!==l&&(i=i||[]).push(u,l)):u==="children"?typeof l!="string"&&typeof l!="number"||(i=i||[]).push(u,""+l):u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&(hu.hasOwnProperty(u)?(l!=null&&u==="onScroll"&&ft("scroll",e),i||s===l||(i=[])):(i=i||[]).push(u,l))}n&&(i=i||[]).push("style",n);var u=i;(t.updateQueue=u)&&(t.flags|=4)}};x3=function(e,t,n,r){n!==r&&(t.flags|=4)};function fl(e,t){if(!bt)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function rn(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags&14680064,r|=o.flags&14680064,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags,r|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function MP(e,t,n){var r=t.pendingProps;switch(d1(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return rn(t),null;case 1:return Rn(t.type)&&hf(),rn(t),null;case 3:return r=t.stateNode,cs(),ht($n),ht(un),x1(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(Bc(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Rr!==null&&(mv(Rr),Rr=null))),sv(e,t),rn(t),null;case 5:b1(t);var o=Oi($u.current);if(n=t.type,e!==null&&t.stateNode!=null)b3(e,t,n,r,o),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(W(166));return rn(t),null}if(e=Oi(Gr.current),Bc(t)){r=t.stateNode,n=t.type;var i=t.memoizedProps;switch(r[jr]=t,r[Eu]=i,e=(t.mode&1)!==0,n){case"dialog":ft("cancel",r),ft("close",r);break;case"iframe":case"object":case"embed":ft("load",r);break;case"video":case"audio":for(o=0;o<jl.length;o++)ft(jl[o],r);break;case"source":ft("error",r);break;case"img":case"image":case"link":ft("error",r),ft("load",r);break;case"details":ft("toggle",r);break;case"input":Db(r,i),ft("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!i.multiple},ft("invalid",r);break;case"textarea":zb(r,i),ft("invalid",r)}A0(n,i),o=null;for(var a in i)if(i.hasOwnProperty(a)){var s=i[a];a==="children"?typeof s=="string"?r.textContent!==s&&(i.suppressHydrationWarning!==!0&&Dc(r.textContent,s,e),o=["children",s]):typeof s=="number"&&r.textContent!==""+s&&(i.suppressHydrationWarning!==!0&&Dc(r.textContent,s,e),o=["children",""+s]):hu.hasOwnProperty(a)&&s!=null&&a==="onScroll"&&ft("scroll",r)}switch(n){case"input":Tc(r),Bb(r,i,!0);break;case"textarea":Tc(r),jb(r);break;case"select":case"option":break;default:typeof i.onClick=="function"&&(r.onclick=pf)}r=o,t.updateQueue=r,r!==null&&(t.flags|=4)}else{a=o.nodeType===9?o:o.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=XE(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=a.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=a.createElement(n,{is:r.is}):(e=a.createElement(n),n==="select"&&(a=e,r.multiple?a.multiple=!0:r.size&&(a.size=r.size))):e=a.createElementNS(e,n),e[jr]=t,e[Eu]=r,y3(e,t,!1,!1),t.stateNode=e;e:{switch(a=M0(n,r),n){case"dialog":ft("cancel",e),ft("close",e),o=r;break;case"iframe":case"object":case"embed":ft("load",e),o=r;break;case"video":case"audio":for(o=0;o<jl.length;o++)ft(jl[o],e);o=r;break;case"source":ft("error",e),o=r;break;case"img":case"image":case"link":ft("error",e),ft("load",e),o=r;break;case"details":ft("toggle",e),o=r;break;case"input":Db(e,r),o=P0(e,r),ft("invalid",e);break;case"option":o=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},o=Et({},r,{value:void 0}),ft("invalid",e);break;case"textarea":zb(e,r),o=I0(e,r),ft("invalid",e);break;default:o=r}A0(n,o),s=o;for(i in s)if(s.hasOwnProperty(i)){var l=s[i];i==="style"?QE(e,l):i==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&YE(e,l)):i==="children"?typeof l=="string"?(n!=="textarea"||l!=="")&&mu(e,l):typeof l=="number"&&mu(e,""+l):i!=="suppressContentEditableWarning"&&i!=="suppressHydrationWarning"&&i!=="autoFocus"&&(hu.hasOwnProperty(i)?l!=null&&i==="onScroll"&&ft("scroll",e):l!=null&&qg(e,i,l,a))}switch(n){case"input":Tc(e),Bb(e,r,!1);break;case"textarea":Tc(e),jb(e);break;case"option":r.value!=null&&e.setAttribute("value",""+oi(r.value));break;case"select":e.multiple=!!r.multiple,i=r.value,i!=null?Ga(e,!!r.multiple,i,!1):r.defaultValue!=null&&Ga(e,!!r.multiple,r.defaultValue,!0);break;default:typeof o.onClick=="function"&&(e.onclick=pf)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return rn(t),null;case 6:if(e&&t.stateNode!=null)x3(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(W(166));if(n=Oi($u.current),Oi(Gr.current),Bc(t)){if(r=t.stateNode,n=t.memoizedProps,r[jr]=t,(i=r.nodeValue!==n)&&(e=zn,e!==null))switch(e.tag){case 3:Dc(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Dc(r.nodeValue,n,(e.mode&1)!==0)}i&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[jr]=t,t.stateNode=r}return rn(t),null;case 13:if(ht(St),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(bt&&Dn!==null&&t.mode&1&&!(t.flags&128))DC(),ls(),t.flags|=98560,i=!1;else if(i=Bc(t),r!==null&&r.dehydrated!==null){if(e===null){if(!i)throw Error(W(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(W(317));i[jr]=t}else ls(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;rn(t),i=!1}else Rr!==null&&(mv(Rr),Rr=null),i=!0;if(!i)return t.flags&65536?t:null}return t.flags&128?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,t.mode&1&&(e===null||St.current&1?Ut===0&&(Ut=3):I1())),t.updateQueue!==null&&(t.flags|=4),rn(t),null);case 4:return cs(),sv(e,t),e===null&&wu(t.stateNode.containerInfo),rn(t),null;case 10:return m1(t.type._context),rn(t),null;case 17:return Rn(t.type)&&hf(),rn(t),null;case 19:if(ht(St),i=t.memoizedState,i===null)return rn(t),null;if(r=(t.flags&128)!==0,a=i.rendering,a===null)if(r)fl(i,!1);else{if(Ut!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(a=Sf(e),a!==null){for(t.flags|=128,fl(i,!1),r=a.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)i=n,e=r,i.flags&=14680066,a=i.alternate,a===null?(i.childLanes=0,i.lanes=e,i.child=null,i.subtreeFlags=0,i.memoizedProps=null,i.memoizedState=null,i.updateQueue=null,i.dependencies=null,i.stateNode=null):(i.childLanes=a.childLanes,i.lanes=a.lanes,i.child=a.child,i.subtreeFlags=0,i.deletions=null,i.memoizedProps=a.memoizedProps,i.memoizedState=a.memoizedState,i.updateQueue=a.updateQueue,i.type=a.type,e=a.dependencies,i.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return dt(St,St.current&1|2),t.child}e=e.sibling}i.tail!==null&&It()>fs&&(t.flags|=128,r=!0,fl(i,!1),t.lanes=4194304)}else{if(!r)if(e=Sf(a),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),fl(i,!0),i.tail===null&&i.tailMode==="hidden"&&!a.alternate&&!bt)return rn(t),null}else 2*It()-i.renderingStartTime>fs&&n!==1073741824&&(t.flags|=128,r=!0,fl(i,!1),t.lanes=4194304);i.isBackwards?(a.sibling=t.child,t.child=a):(n=i.last,n!==null?n.sibling=a:t.child=a,i.last=a)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=It(),t.sibling=null,n=St.current,dt(St,r?n&1|2:n&1),t):(rn(t),null);case 22:case 23:return O1(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&t.mode&1?Mn&1073741824&&(rn(t),t.subtreeFlags&6&&(t.flags|=8192)):rn(t),null;case 24:return null;case 25:return null}throw Error(W(156,t.tag))}function LP(e,t){switch(d1(t),t.tag){case 1:return Rn(t.type)&&hf(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return cs(),ht($n),ht(un),x1(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return b1(t),null;case 13:if(ht(St),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(W(340));ls()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return ht(St),null;case 4:return cs(),null;case 10:return m1(t.type._context),null;case 22:case 23:return O1(),null;case 24:return null;default:return null}}var Uc=!1,an=!1,FP=typeof WeakSet=="function"?WeakSet:Set,re=null;function za(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Pt(e,t,r)}else n.current=null}function lv(e,t,n){try{n()}catch(r){Pt(e,t,r)}}var T2=!1;function DP(e,t){if(V0=cf,e=CC(),u1(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var o=r.anchorOffset,i=r.focusNode;r=r.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var a=0,s=-1,l=-1,u=0,c=0,d=e,f=null;t:for(;;){for(var h;d!==n||o!==0&&d.nodeType!==3||(s=a+o),d!==i||r!==0&&d.nodeType!==3||(l=a+r),d.nodeType===3&&(a+=d.nodeValue.length),(h=d.firstChild)!==null;)f=d,d=h;for(;;){if(d===e)break t;if(f===n&&++u===o&&(s=a),f===i&&++c===r&&(l=a),(h=d.nextSibling)!==null)break;d=f,f=d.parentNode}d=h}n=s===-1||l===-1?null:{start:s,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(G0={focusedElem:e,selectionRange:n},cf=!1,re=t;re!==null;)if(t=re,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,re=e;else for(;re!==null;){t=re;try{var v=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(v!==null){var y=v.memoizedProps,b=v.memoizedState,p=t.stateNode,m=p.getSnapshotBeforeUpdate(t.elementType===t.type?y:Er(t.type,y),b);p.__reactInternalSnapshotBeforeUpdate=m}break;case 3:var g=t.stateNode.containerInfo;g.nodeType===1?g.textContent="":g.nodeType===9&&g.documentElement&&g.removeChild(g.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(W(163))}}catch(w){Pt(t,t.return,w)}if(e=t.sibling,e!==null){e.return=t.return,re=e;break}re=t.return}return v=T2,T2=!1,v}function nu(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var o=r=r.next;do{if((o.tag&e)===e){var i=o.destroy;o.destroy=void 0,i!==void 0&&lv(t,n,i)}o=o.next}while(o!==r)}}function pp(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function uv(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function S3(e){var t=e.alternate;t!==null&&(e.alternate=null,S3(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[jr],delete t[Eu],delete t[Y0],delete t[xP],delete t[SP])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function w3(e){return e.tag===5||e.tag===3||e.tag===4}function O2(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||w3(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function cv(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=pf));else if(r!==4&&(e=e.child,e!==null))for(cv(e,t,n),e=e.sibling;e!==null;)cv(e,t,n),e=e.sibling}function dv(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(dv(e,t,n),e=e.sibling;e!==null;)dv(e,t,n),e=e.sibling}var qt=null,Cr=!1;function Oo(e,t,n){for(n=n.child;n!==null;)_3(e,t,n),n=n.sibling}function _3(e,t,n){if(Vr&&typeof Vr.onCommitFiberUnmount=="function")try{Vr.onCommitFiberUnmount(ip,n)}catch{}switch(n.tag){case 5:an||za(n,t);case 6:var r=qt,o=Cr;qt=null,Oo(e,t,n),qt=r,Cr=o,qt!==null&&(Cr?(e=qt,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):qt.removeChild(n.stateNode));break;case 18:qt!==null&&(Cr?(e=qt,n=n.stateNode,e.nodeType===8?um(e.parentNode,n):e.nodeType===1&&um(e,n),bu(e)):um(qt,n.stateNode));break;case 4:r=qt,o=Cr,qt=n.stateNode.containerInfo,Cr=!0,Oo(e,t,n),qt=r,Cr=o;break;case 0:case 11:case 14:case 15:if(!an&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){o=r=r.next;do{var i=o,a=i.destroy;i=i.tag,a!==void 0&&(i&2||i&4)&&lv(n,t,a),o=o.next}while(o!==r)}Oo(e,t,n);break;case 1:if(!an&&(za(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(s){Pt(n,t,s)}Oo(e,t,n);break;case 21:Oo(e,t,n);break;case 22:n.mode&1?(an=(r=an)||n.memoizedState!==null,Oo(e,t,n),an=r):Oo(e,t,n);break;default:Oo(e,t,n)}}function I2(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new FP),t.forEach(function(r){var o=KP.bind(null,e,r);n.has(r)||(n.add(r),r.then(o,o))})}}function _r(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var o=n[r];try{var i=e,a=t,s=a;e:for(;s!==null;){switch(s.tag){case 5:qt=s.stateNode,Cr=!1;break e;case 3:qt=s.stateNode.containerInfo,Cr=!0;break e;case 4:qt=s.stateNode.containerInfo,Cr=!0;break e}s=s.return}if(qt===null)throw Error(W(160));_3(i,a,o),qt=null,Cr=!1;var l=o.alternate;l!==null&&(l.return=null),o.return=null}catch(u){Pt(o,t,u)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)E3(t,e),t=t.sibling}function E3(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(_r(t,e),Lr(e),r&4){try{nu(3,e,e.return),pp(3,e)}catch(y){Pt(e,e.return,y)}try{nu(5,e,e.return)}catch(y){Pt(e,e.return,y)}}break;case 1:_r(t,e),Lr(e),r&512&&n!==null&&za(n,n.return);break;case 5:if(_r(t,e),Lr(e),r&512&&n!==null&&za(n,n.return),e.flags&32){var o=e.stateNode;try{mu(o,"")}catch(y){Pt(e,e.return,y)}}if(r&4&&(o=e.stateNode,o!=null)){var i=e.memoizedProps,a=n!==null?n.memoizedProps:i,s=e.type,l=e.updateQueue;if(e.updateQueue=null,l!==null)try{s==="input"&&i.type==="radio"&&i.name!=null&&GE(o,i),M0(s,a);var u=M0(s,i);for(a=0;a<l.length;a+=2){var c=l[a],d=l[a+1];c==="style"?QE(o,d):c==="dangerouslySetInnerHTML"?YE(o,d):c==="children"?mu(o,d):qg(o,c,d,u)}switch(s){case"input":T0(o,i);break;case"textarea":KE(o,i);break;case"select":var f=o._wrapperState.wasMultiple;o._wrapperState.wasMultiple=!!i.multiple;var h=i.value;h!=null?Ga(o,!!i.multiple,h,!1):f!==!!i.multiple&&(i.defaultValue!=null?Ga(o,!!i.multiple,i.defaultValue,!0):Ga(o,!!i.multiple,i.multiple?[]:"",!1))}o[Eu]=i}catch(y){Pt(e,e.return,y)}}break;case 6:if(_r(t,e),Lr(e),r&4){if(e.stateNode===null)throw Error(W(162));o=e.stateNode,i=e.memoizedProps;try{o.nodeValue=i}catch(y){Pt(e,e.return,y)}}break;case 3:if(_r(t,e),Lr(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{bu(t.containerInfo)}catch(y){Pt(e,e.return,y)}break;case 4:_r(t,e),Lr(e);break;case 13:_r(t,e),Lr(e),o=e.child,o.flags&8192&&(i=o.memoizedState!==null,o.stateNode.isHidden=i,!i||o.alternate!==null&&o.alternate.memoizedState!==null||(P1=It())),r&4&&I2(e);break;case 22:if(c=n!==null&&n.memoizedState!==null,e.mode&1?(an=(u=an)||c,_r(t,e),an=u):_r(t,e),Lr(e),r&8192){if(u=e.memoizedState!==null,(e.stateNode.isHidden=u)&&!c&&e.mode&1)for(re=e,c=e.child;c!==null;){for(d=re=c;re!==null;){switch(f=re,h=f.child,f.tag){case 0:case 11:case 14:case 15:nu(4,f,f.return);break;case 1:za(f,f.return);var v=f.stateNode;if(typeof v.componentWillUnmount=="function"){r=f,n=f.return;try{t=r,v.props=t.memoizedProps,v.state=t.memoizedState,v.componentWillUnmount()}catch(y){Pt(r,n,y)}}break;case 5:za(f,f.return);break;case 22:if(f.memoizedState!==null){A2(d);continue}}h!==null?(h.return=f,re=h):A2(d)}c=c.sibling}e:for(c=null,d=e;;){if(d.tag===5){if(c===null){c=d;try{o=d.stateNode,u?(i=o.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"):(s=d.stateNode,l=d.memoizedProps.style,a=l!=null&&l.hasOwnProperty("display")?l.display:null,s.style.display=qE("display",a))}catch(y){Pt(e,e.return,y)}}}else if(d.tag===6){if(c===null)try{d.stateNode.nodeValue=u?"":d.memoizedProps}catch(y){Pt(e,e.return,y)}}else if((d.tag!==22&&d.tag!==23||d.memoizedState===null||d===e)&&d.child!==null){d.child.return=d,d=d.child;continue}if(d===e)break e;for(;d.sibling===null;){if(d.return===null||d.return===e)break e;c===d&&(c=null),d=d.return}c===d&&(c=null),d.sibling.return=d.return,d=d.sibling}}break;case 19:_r(t,e),Lr(e),r&4&&I2(e);break;case 21:break;default:_r(t,e),Lr(e)}}function Lr(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(w3(n)){var r=n;break e}n=n.return}throw Error(W(160))}switch(r.tag){case 5:var o=r.stateNode;r.flags&32&&(mu(o,""),r.flags&=-33);var i=O2(e);dv(e,i,o);break;case 3:case 4:var a=r.stateNode.containerInfo,s=O2(e);cv(e,s,a);break;default:throw Error(W(161))}}catch(l){Pt(e,e.return,l)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function BP(e,t,n){re=e,C3(e)}function C3(e,t,n){for(var r=(e.mode&1)!==0;re!==null;){var o=re,i=o.child;if(o.tag===22&&r){var a=o.memoizedState!==null||Uc;if(!a){var s=o.alternate,l=s!==null&&s.memoizedState!==null||an;s=Uc;var u=an;if(Uc=a,(an=l)&&!u)for(re=o;re!==null;)a=re,l=a.child,a.tag===22&&a.memoizedState!==null?M2(o):l!==null?(l.return=a,re=l):M2(o);for(;i!==null;)re=i,C3(i),i=i.sibling;re=o,Uc=s,an=u}N2(e)}else o.subtreeFlags&8772&&i!==null?(i.return=o,re=i):N2(e)}}function N2(e){for(;re!==null;){var t=re;if(t.flags&8772){var n=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:an||pp(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!an)if(n===null)r.componentDidMount();else{var o=t.elementType===t.type?n.memoizedProps:Er(t.type,n.memoizedProps);r.componentDidUpdate(o,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var i=t.updateQueue;i!==null&&g2(t,i,r);break;case 3:var a=t.updateQueue;if(a!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}g2(t,a,n)}break;case 5:var s=t.stateNode;if(n===null&&t.flags&4){n=s;var l=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&n.focus();break;case"img":l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var u=t.alternate;if(u!==null){var c=u.memoizedState;if(c!==null){var d=c.dehydrated;d!==null&&bu(d)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(W(163))}an||t.flags&512&&uv(t)}catch(f){Pt(t,t.return,f)}}if(t===e){re=null;break}if(n=t.sibling,n!==null){n.return=t.return,re=n;break}re=t.return}}function A2(e){for(;re!==null;){var t=re;if(t===e){re=null;break}var n=t.sibling;if(n!==null){n.return=t.return,re=n;break}re=t.return}}function M2(e){for(;re!==null;){var t=re;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{pp(4,t)}catch(l){Pt(t,n,l)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var o=t.return;try{r.componentDidMount()}catch(l){Pt(t,o,l)}}var i=t.return;try{uv(t)}catch(l){Pt(t,i,l)}break;case 5:var a=t.return;try{uv(t)}catch(l){Pt(t,a,l)}}}catch(l){Pt(t,t.return,l)}if(t===e){re=null;break}var s=t.sibling;if(s!==null){s.return=t.return,re=s;break}re=t.return}}var zP=Math.ceil,Ef=$o.ReactCurrentDispatcher,R1=$o.ReactCurrentOwner,cr=$o.ReactCurrentBatchConfig,Ve=0,Kt=null,Bt=null,Zt=0,Mn=0,ja=hi(0),Ut=0,Tu=null,Ki=0,hp=0,k1=0,ru=null,_n=null,P1=0,fs=1/0,oo=null,Cf=!1,fv=null,ti=null,Wc=!1,Vo=null,$f=0,ou=0,pv=null,Dd=-1,Bd=0;function vn(){return Ve&6?It():Dd!==-1?Dd:Dd=It()}function ni(e){return e.mode&1?Ve&2&&Zt!==0?Zt&-Zt:_P.transition!==null?(Bd===0&&(Bd=uC()),Bd):(e=et,e!==0||(e=window.event,e=e===void 0?16:vC(e.type)),e):1}function Pr(e,t,n,r){if(50<ou)throw ou=0,pv=null,Error(W(185));Gu(e,n,r),(!(Ve&2)||e!==Kt)&&(e===Kt&&(!(Ve&2)&&(hp|=n),Ut===4&&Wo(e,Zt)),kn(e,r),n===1&&Ve===0&&!(t.mode&1)&&(fs=It()+500,cp&&mi()))}function kn(e,t){var n=e.callbackNode;_5(e,t);var r=uf(e,e===Kt?Zt:0);if(r===0)n!==null&&Hb(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&Hb(n),t===1)e.tag===0?wP(L2.bind(null,e)):MC(L2.bind(null,e)),yP(function(){!(Ve&6)&&mi()}),n=null;else{switch(cC(r)){case 1:n=t1;break;case 4:n=sC;break;case 16:n=lf;break;case 536870912:n=lC;break;default:n=lf}n=N3(n,$3.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function $3(e,t){if(Dd=-1,Bd=0,Ve&6)throw Error(W(327));var n=e.callbackNode;if(Qa()&&e.callbackNode!==n)return null;var r=uf(e,e===Kt?Zt:0);if(r===0)return null;if(r&30||r&e.expiredLanes||t)t=Rf(e,r);else{t=r;var o=Ve;Ve|=2;var i=k3();(Kt!==e||Zt!==t)&&(oo=null,fs=It()+500,Fi(e,t));do try{WP();break}catch(s){R3(e,s)}while(1);h1(),Ef.current=i,Ve=o,Bt!==null?t=0:(Kt=null,Zt=0,t=Ut)}if(t!==0){if(t===2&&(o=z0(e),o!==0&&(r=o,t=hv(e,o))),t===1)throw n=Tu,Fi(e,0),Wo(e,r),kn(e,It()),n;if(t===6)Wo(e,r);else{if(o=e.current.alternate,!(r&30)&&!jP(o)&&(t=Rf(e,r),t===2&&(i=z0(e),i!==0&&(r=i,t=hv(e,i))),t===1))throw n=Tu,Fi(e,0),Wo(e,r),kn(e,It()),n;switch(e.finishedWork=o,e.finishedLanes=r,t){case 0:case 1:throw Error(W(345));case 2:_i(e,_n,oo);break;case 3:if(Wo(e,r),(r&130023424)===r&&(t=P1+500-It(),10<t)){if(uf(e,0)!==0)break;if(o=e.suspendedLanes,(o&r)!==r){vn(),e.pingedLanes|=e.suspendedLanes&o;break}e.timeoutHandle=X0(_i.bind(null,e,_n,oo),t);break}_i(e,_n,oo);break;case 4:if(Wo(e,r),(r&4194240)===r)break;for(t=e.eventTimes,o=-1;0<r;){var a=31-kr(r);i=1<<a,a=t[a],a>o&&(o=a),r&=~i}if(r=o,r=It()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*zP(r/1960))-r,10<r){e.timeoutHandle=X0(_i.bind(null,e,_n,oo),r);break}_i(e,_n,oo);break;case 5:_i(e,_n,oo);break;default:throw Error(W(329))}}}return kn(e,It()),e.callbackNode===n?$3.bind(null,e):null}function hv(e,t){var n=ru;return e.current.memoizedState.isDehydrated&&(Fi(e,t).flags|=256),e=Rf(e,t),e!==2&&(t=_n,_n=n,t!==null&&mv(t)),e}function mv(e){_n===null?_n=e:_n.push.apply(_n,e)}function jP(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var o=n[r],i=o.getSnapshot;o=o.value;try{if(!Or(i(),o))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Wo(e,t){for(t&=~k1,t&=~hp,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-kr(t),r=1<<n;e[n]=-1,t&=~r}}function L2(e){if(Ve&6)throw Error(W(327));Qa();var t=uf(e,0);if(!(t&1))return kn(e,It()),null;var n=Rf(e,t);if(e.tag!==0&&n===2){var r=z0(e);r!==0&&(t=r,n=hv(e,r))}if(n===1)throw n=Tu,Fi(e,0),Wo(e,t),kn(e,It()),n;if(n===6)throw Error(W(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,_i(e,_n,oo),kn(e,It()),null}function T1(e,t){var n=Ve;Ve|=1;try{return e(t)}finally{Ve=n,Ve===0&&(fs=It()+500,cp&&mi())}}function Xi(e){Vo!==null&&Vo.tag===0&&!(Ve&6)&&Qa();var t=Ve;Ve|=1;var n=cr.transition,r=et;try{if(cr.transition=null,et=1,e)return e()}finally{et=r,cr.transition=n,Ve=t,!(Ve&6)&&mi()}}function O1(){Mn=ja.current,ht(ja)}function Fi(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,gP(n)),Bt!==null)for(n=Bt.return;n!==null;){var r=n;switch(d1(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&hf();break;case 3:cs(),ht($n),ht(un),x1();break;case 5:b1(r);break;case 4:cs();break;case 13:ht(St);break;case 19:ht(St);break;case 10:m1(r.type._context);break;case 22:case 23:O1()}n=n.return}if(Kt=e,Bt=e=ri(e.current,null),Zt=Mn=t,Ut=0,Tu=null,k1=hp=Ki=0,_n=ru=null,Ti!==null){for(t=0;t<Ti.length;t++)if(n=Ti[t],r=n.interleaved,r!==null){n.interleaved=null;var o=r.next,i=n.pending;if(i!==null){var a=i.next;i.next=o,r.next=a}n.pending=r}Ti=null}return e}function R3(e,t){do{var n=Bt;try{if(h1(),Md.current=_f,wf){for(var r=_t.memoizedState;r!==null;){var o=r.queue;o!==null&&(o.pending=null),r=r.next}wf=!1}if(Gi=0,Gt=jt=_t=null,tu=!1,Ru=0,R1.current=null,n===null||n.return===null){Ut=1,Tu=t,Bt=null;break}e:{var i=e,a=n.return,s=n,l=t;if(t=Zt,s.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var u=l,c=s,d=c.tag;if(!(c.mode&1)&&(d===0||d===11||d===15)){var f=c.alternate;f?(c.updateQueue=f.updateQueue,c.memoizedState=f.memoizedState,c.lanes=f.lanes):(c.updateQueue=null,c.memoizedState=null)}var h=_2(a);if(h!==null){h.flags&=-257,E2(h,a,s,i,t),h.mode&1&&w2(i,u,t),t=h,l=u;var v=t.updateQueue;if(v===null){var y=new Set;y.add(l),t.updateQueue=y}else v.add(l);break e}else{if(!(t&1)){w2(i,u,t),I1();break e}l=Error(W(426))}}else if(bt&&s.mode&1){var b=_2(a);if(b!==null){!(b.flags&65536)&&(b.flags|=256),E2(b,a,s,i,t),f1(ds(l,s));break e}}i=l=ds(l,s),Ut!==4&&(Ut=2),ru===null?ru=[i]:ru.push(i),i=a;do{switch(i.tag){case 3:i.flags|=65536,t&=-t,i.lanes|=t;var p=c3(i,l,t);v2(i,p);break e;case 1:s=l;var m=i.type,g=i.stateNode;if(!(i.flags&128)&&(typeof m.getDerivedStateFromError=="function"||g!==null&&typeof g.componentDidCatch=="function"&&(ti===null||!ti.has(g)))){i.flags|=65536,t&=-t,i.lanes|=t;var w=d3(i,s,t);v2(i,w);break e}}i=i.return}while(i!==null)}T3(n)}catch(C){t=C,Bt===n&&n!==null&&(Bt=n=n.return);continue}break}while(1)}function k3(){var e=Ef.current;return Ef.current=_f,e===null?_f:e}function I1(){(Ut===0||Ut===3||Ut===2)&&(Ut=4),Kt===null||!(Ki&268435455)&&!(hp&268435455)||Wo(Kt,Zt)}function Rf(e,t){var n=Ve;Ve|=2;var r=k3();(Kt!==e||Zt!==t)&&(oo=null,Fi(e,t));do try{UP();break}catch(o){R3(e,o)}while(1);if(h1(),Ve=n,Ef.current=r,Bt!==null)throw Error(W(261));return Kt=null,Zt=0,Ut}function UP(){for(;Bt!==null;)P3(Bt)}function WP(){for(;Bt!==null&&!h5();)P3(Bt)}function P3(e){var t=I3(e.alternate,e,Mn);e.memoizedProps=e.pendingProps,t===null?T3(e):Bt=t,R1.current=null}function T3(e){var t=e;do{var n=t.alternate;if(e=t.return,t.flags&32768){if(n=LP(n,t),n!==null){n.flags&=32767,Bt=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{Ut=6,Bt=null;return}}else if(n=MP(n,t,Mn),n!==null){Bt=n;return}if(t=t.sibling,t!==null){Bt=t;return}Bt=t=e}while(t!==null);Ut===0&&(Ut=5)}function _i(e,t,n){var r=et,o=cr.transition;try{cr.transition=null,et=1,HP(e,t,n,r)}finally{cr.transition=o,et=r}return null}function HP(e,t,n,r){do Qa();while(Vo!==null);if(Ve&6)throw Error(W(327));n=e.finishedWork;var o=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(W(177));e.callbackNode=null,e.callbackPriority=0;var i=n.lanes|n.childLanes;if(E5(e,i),e===Kt&&(Bt=Kt=null,Zt=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Wc||(Wc=!0,N3(lf,function(){return Qa(),null})),i=(n.flags&15990)!==0,n.subtreeFlags&15990||i){i=cr.transition,cr.transition=null;var a=et;et=1;var s=Ve;Ve|=4,R1.current=null,DP(e,n),E3(n,e),cP(G0),cf=!!V0,G0=V0=null,e.current=n,BP(n),m5(),Ve=s,et=a,cr.transition=i}else e.current=n;if(Wc&&(Wc=!1,Vo=e,$f=o),i=e.pendingLanes,i===0&&(ti=null),y5(n.stateNode),kn(e,It()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)o=t[n],r(o.value,{componentStack:o.stack,digest:o.digest});if(Cf)throw Cf=!1,e=fv,fv=null,e;return $f&1&&e.tag!==0&&Qa(),i=e.pendingLanes,i&1?e===pv?ou++:(ou=0,pv=e):ou=0,mi(),null}function Qa(){if(Vo!==null){var e=cC($f),t=cr.transition,n=et;try{if(cr.transition=null,et=16>e?16:e,Vo===null)var r=!1;else{if(e=Vo,Vo=null,$f=0,Ve&6)throw Error(W(331));var o=Ve;for(Ve|=4,re=e.current;re!==null;){var i=re,a=i.child;if(re.flags&16){var s=i.deletions;if(s!==null){for(var l=0;l<s.length;l++){var u=s[l];for(re=u;re!==null;){var c=re;switch(c.tag){case 0:case 11:case 15:nu(8,c,i)}var d=c.child;if(d!==null)d.return=c,re=d;else for(;re!==null;){c=re;var f=c.sibling,h=c.return;if(S3(c),c===u){re=null;break}if(f!==null){f.return=h,re=f;break}re=h}}}var v=i.alternate;if(v!==null){var y=v.child;if(y!==null){v.child=null;do{var b=y.sibling;y.sibling=null,y=b}while(y!==null)}}re=i}}if(i.subtreeFlags&2064&&a!==null)a.return=i,re=a;else e:for(;re!==null;){if(i=re,i.flags&2048)switch(i.tag){case 0:case 11:case 15:nu(9,i,i.return)}var p=i.sibling;if(p!==null){p.return=i.return,re=p;break e}re=i.return}}var m=e.current;for(re=m;re!==null;){a=re;var g=a.child;if(a.subtreeFlags&2064&&g!==null)g.return=a,re=g;else e:for(a=m;re!==null;){if(s=re,s.flags&2048)try{switch(s.tag){case 0:case 11:case 15:pp(9,s)}}catch(C){Pt(s,s.return,C)}if(s===a){re=null;break e}var w=s.sibling;if(w!==null){w.return=s.return,re=w;break e}re=s.return}}if(Ve=o,mi(),Vr&&typeof Vr.onPostCommitFiberRoot=="function")try{Vr.onPostCommitFiberRoot(ip,e)}catch{}r=!0}return r}finally{et=n,cr.transition=t}}return!1}function F2(e,t,n){t=ds(n,t),t=c3(e,t,1),e=ei(e,t,1),t=vn(),e!==null&&(Gu(e,1,t),kn(e,t))}function Pt(e,t,n){if(e.tag===3)F2(e,e,n);else for(;t!==null;){if(t.tag===3){F2(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(ti===null||!ti.has(r))){e=ds(n,e),e=d3(t,e,1),t=ei(t,e,1),e=vn(),t!==null&&(Gu(t,1,e),kn(t,e));break}}t=t.return}}function VP(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=vn(),e.pingedLanes|=e.suspendedLanes&n,Kt===e&&(Zt&n)===n&&(Ut===4||Ut===3&&(Zt&130023424)===Zt&&500>It()-P1?Fi(e,0):k1|=n),kn(e,t)}function O3(e,t){t===0&&(e.mode&1?(t=Nc,Nc<<=1,!(Nc&130023424)&&(Nc=4194304)):t=1);var n=vn();e=bo(e,t),e!==null&&(Gu(e,t,n),kn(e,n))}function GP(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),O3(e,n)}function KP(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,o=e.memoizedState;o!==null&&(n=o.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(W(314))}r!==null&&r.delete(t),O3(e,n)}var I3;I3=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||$n.current)Cn=!0;else{if(!(e.lanes&n)&&!(t.flags&128))return Cn=!1,AP(e,t,n);Cn=!!(e.flags&131072)}else Cn=!1,bt&&t.flags&1048576&&LC(t,gf,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Fd(e,t),e=t.pendingProps;var o=ss(t,un.current);qa(t,n),o=w1(null,t,r,e,o,n);var i=_1();return t.flags|=1,typeof o=="object"&&o!==null&&typeof o.render=="function"&&o.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Rn(r)?(i=!0,mf(t)):i=!1,t.memoizedState=o.state!==null&&o.state!==void 0?o.state:null,g1(t),o.updater=fp,t.stateNode=o,o._reactInternals=t,tv(t,r,e,n),t=ov(null,t,r,!0,i,n)):(t.tag=0,bt&&i&&c1(t),fn(null,t,o,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Fd(e,t),e=t.pendingProps,o=r._init,r=o(r._payload),t.type=r,o=t.tag=YP(r),e=Er(r,e),o){case 0:t=rv(null,t,r,e,n);break e;case 1:t=R2(null,t,r,e,n);break e;case 11:t=C2(null,t,r,e,n);break e;case 14:t=$2(null,t,r,Er(r.type,e),n);break e}throw Error(W(306,r,""))}return t;case 0:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Er(r,o),rv(e,t,r,o,n);case 1:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Er(r,o),R2(e,t,r,o,n);case 3:e:{if(m3(t),e===null)throw Error(W(387));r=t.pendingProps,i=t.memoizedState,o=i.element,UC(e,t),xf(t,r,null,n);var a=t.memoizedState;if(r=a.element,i.isDehydrated)if(i={element:r,isDehydrated:!1,cache:a.cache,pendingSuspenseBoundaries:a.pendingSuspenseBoundaries,transitions:a.transitions},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){o=ds(Error(W(423)),t),t=k2(e,t,r,n,o);break e}else if(r!==o){o=ds(Error(W(424)),t),t=k2(e,t,r,n,o);break e}else for(Dn=Zo(t.stateNode.containerInfo.firstChild),zn=t,bt=!0,Rr=null,n=zC(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(ls(),r===o){t=xo(e,t,n);break e}fn(e,t,r,n)}t=t.child}return t;case 5:return WC(t),e===null&&J0(t),r=t.type,o=t.pendingProps,i=e!==null?e.memoizedProps:null,a=o.children,K0(r,o)?a=null:i!==null&&K0(r,i)&&(t.flags|=32),h3(e,t),fn(e,t,a,n),t.child;case 6:return e===null&&J0(t),null;case 13:return v3(e,t,n);case 4:return y1(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=us(t,null,r,n):fn(e,t,r,n),t.child;case 11:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Er(r,o),C2(e,t,r,o,n);case 7:return fn(e,t,t.pendingProps,n),t.child;case 8:return fn(e,t,t.pendingProps.children,n),t.child;case 12:return fn(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,o=t.pendingProps,i=t.memoizedProps,a=o.value,dt(yf,r._currentValue),r._currentValue=a,i!==null)if(Or(i.value,a)){if(i.children===o.children&&!$n.current){t=xo(e,t,n);break e}}else for(i=t.child,i!==null&&(i.return=t);i!==null;){var s=i.dependencies;if(s!==null){a=i.child;for(var l=s.firstContext;l!==null;){if(l.context===r){if(i.tag===1){l=po(-1,n&-n),l.tag=2;var u=i.updateQueue;if(u!==null){u=u.shared;var c=u.pending;c===null?l.next=l:(l.next=c.next,c.next=l),u.pending=l}}i.lanes|=n,l=i.alternate,l!==null&&(l.lanes|=n),Z0(i.return,n,t),s.lanes|=n;break}l=l.next}}else if(i.tag===10)a=i.type===t.type?null:i.child;else if(i.tag===18){if(a=i.return,a===null)throw Error(W(341));a.lanes|=n,s=a.alternate,s!==null&&(s.lanes|=n),Z0(a,n,t),a=i.sibling}else a=i.child;if(a!==null)a.return=i;else for(a=i;a!==null;){if(a===t){a=null;break}if(i=a.sibling,i!==null){i.return=a.return,a=i;break}a=a.return}i=a}fn(e,t,o.children,n),t=t.child}return t;case 9:return o=t.type,r=t.pendingProps.children,qa(t,n),o=pr(o),r=r(o),t.flags|=1,fn(e,t,r,n),t.child;case 14:return r=t.type,o=Er(r,t.pendingProps),o=Er(r.type,o),$2(e,t,r,o,n);case 15:return f3(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Er(r,o),Fd(e,t),t.tag=1,Rn(r)?(e=!0,mf(t)):e=!1,qa(t,n),u3(t,r,o),tv(t,r,o,n),ov(null,t,r,!0,e,n);case 19:return g3(e,t,n);case 22:return p3(e,t,n)}throw Error(W(156,t.tag))};function N3(e,t){return aC(e,t)}function XP(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function sr(e,t,n,r){return new XP(e,t,n,r)}function N1(e){return e=e.prototype,!(!e||!e.isReactComponent)}function YP(e){if(typeof e=="function")return N1(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Jg)return 11;if(e===Zg)return 14}return 2}function ri(e,t){var n=e.alternate;return n===null?(n=sr(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function zd(e,t,n,r,o,i){var a=2;if(r=e,typeof e=="function")N1(e)&&(a=1);else if(typeof e=="string")a=5;else e:switch(e){case Oa:return Di(n.children,o,i,t);case Qg:a=8,o|=8;break;case C0:return e=sr(12,n,t,o|2),e.elementType=C0,e.lanes=i,e;case $0:return e=sr(13,n,t,o),e.elementType=$0,e.lanes=i,e;case R0:return e=sr(19,n,t,o),e.elementType=R0,e.lanes=i,e;case WE:return mp(n,o,i,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case jE:a=10;break e;case UE:a=9;break e;case Jg:a=11;break e;case Zg:a=14;break e;case Do:a=16,r=null;break e}throw Error(W(130,e==null?e:typeof e,""))}return t=sr(a,n,t,o),t.elementType=e,t.type=r,t.lanes=i,t}function Di(e,t,n,r){return e=sr(7,e,r,t),e.lanes=n,e}function mp(e,t,n,r){return e=sr(22,e,r,t),e.elementType=WE,e.lanes=n,e.stateNode={isHidden:!1},e}function gm(e,t,n){return e=sr(6,e,null,t),e.lanes=n,e}function ym(e,t,n){return t=sr(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function qP(e,t,n,r,o){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Jh(0),this.expirationTimes=Jh(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Jh(0),this.identifierPrefix=r,this.onRecoverableError=o,this.mutableSourceEagerHydrationData=null}function A1(e,t,n,r,o,i,a,s,l){return e=new qP(e,t,n,s,l),t===1?(t=1,i===!0&&(t|=8)):t=0,i=sr(3,null,null,t),e.current=i,i.stateNode=e,i.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},g1(i),e}function QP(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Ta,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function A3(e){if(!e)return ii;e=e._reactInternals;e:{if(sa(e)!==e||e.tag!==1)throw Error(W(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Rn(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(W(171))}if(e.tag===1){var n=e.type;if(Rn(n))return AC(e,n,t)}return t}function M3(e,t,n,r,o,i,a,s,l){return e=A1(n,r,!0,e,o,i,a,s,l),e.context=A3(null),n=e.current,r=vn(),o=ni(n),i=po(r,o),i.callback=t??null,ei(n,i,o),e.current.lanes=o,Gu(e,o,r),kn(e,r),e}function vp(e,t,n,r){var o=t.current,i=vn(),a=ni(o);return n=A3(n),t.context===null?t.context=n:t.pendingContext=n,t=po(i,a),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=ei(o,t,a),e!==null&&(Pr(e,o,a,i),Ad(e,o,a)),a}function kf(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function D2(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function M1(e,t){D2(e,t),(e=e.alternate)&&D2(e,t)}function JP(){return null}var L3=typeof reportError=="function"?reportError:function(e){console.error(e)};function L1(e){this._internalRoot=e}gp.prototype.render=L1.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(W(409));vp(e,t,null,null)};gp.prototype.unmount=L1.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Xi(function(){vp(null,e,null,null)}),t[yo]=null}};function gp(e){this._internalRoot=e}gp.prototype.unstable_scheduleHydration=function(e){if(e){var t=pC();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Uo.length&&t!==0&&t<Uo[n].priority;n++);Uo.splice(n,0,e),n===0&&mC(e)}};function F1(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function yp(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function B2(){}function ZP(e,t,n,r,o){if(o){if(typeof r=="function"){var i=r;r=function(){var u=kf(a);i.call(u)}}var a=M3(t,r,e,0,null,!1,!1,"",B2);return e._reactRootContainer=a,e[yo]=a.current,wu(e.nodeType===8?e.parentNode:e),Xi(),a}for(;o=e.lastChild;)e.removeChild(o);if(typeof r=="function"){var s=r;r=function(){var u=kf(l);s.call(u)}}var l=A1(e,0,!1,null,null,!1,!1,"",B2);return e._reactRootContainer=l,e[yo]=l.current,wu(e.nodeType===8?e.parentNode:e),Xi(function(){vp(t,l,n,r)}),l}function bp(e,t,n,r,o){var i=n._reactRootContainer;if(i){var a=i;if(typeof o=="function"){var s=o;o=function(){var l=kf(a);s.call(l)}}vp(t,a,e,o)}else a=ZP(n,t,e,o,r);return kf(a)}dC=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=zl(t.pendingLanes);n!==0&&(n1(t,n|1),kn(t,It()),!(Ve&6)&&(fs=It()+500,mi()))}break;case 13:Xi(function(){var r=bo(e,1);if(r!==null){var o=vn();Pr(r,e,1,o)}}),M1(e,1)}};r1=function(e){if(e.tag===13){var t=bo(e,134217728);if(t!==null){var n=vn();Pr(t,e,134217728,n)}M1(e,134217728)}};fC=function(e){if(e.tag===13){var t=ni(e),n=bo(e,t);if(n!==null){var r=vn();Pr(n,e,t,r)}M1(e,t)}};pC=function(){return et};hC=function(e,t){var n=et;try{return et=e,t()}finally{et=n}};F0=function(e,t,n){switch(t){case"input":if(T0(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var o=up(r);if(!o)throw Error(W(90));VE(r),T0(r,o)}}}break;case"textarea":KE(e,n);break;case"select":t=n.value,t!=null&&Ga(e,!!n.multiple,t,!1)}};eC=T1;tC=Xi;var eT={usingClientEntryPoint:!1,Events:[Xu,Ma,up,JE,ZE,T1]},pl={findFiberByHostInstance:Pi,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},tT={bundleType:pl.bundleType,version:pl.version,rendererPackageName:pl.rendererPackageName,rendererConfig:pl.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:$o.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=oC(e),e===null?null:e.stateNode},findFiberByHostInstance:pl.findFiberByHostInstance||JP,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Hc=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Hc.isDisabled&&Hc.supportsFiber)try{ip=Hc.inject(tT),Vr=Hc}catch{}}Gn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=eT;Gn.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!F1(t))throw Error(W(200));return QP(e,t,null,n)};Gn.createRoot=function(e,t){if(!F1(e))throw Error(W(299));var n=!1,r="",o=L3;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),t=A1(e,1,!1,null,null,n,!1,r,o),e[yo]=t.current,wu(e.nodeType===8?e.parentNode:e),new L1(t)};Gn.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(W(188)):(e=Object.keys(e).join(","),Error(W(268,e)));return e=oC(t),e=e===null?null:e.stateNode,e};Gn.flushSync=function(e){return Xi(e)};Gn.hydrate=function(e,t,n){if(!yp(t))throw Error(W(200));return bp(null,e,t,!0,n)};Gn.hydrateRoot=function(e,t,n){if(!F1(e))throw Error(W(405));var r=n!=null&&n.hydratedSources||null,o=!1,i="",a=L3;if(n!=null&&(n.unstable_strictMode===!0&&(o=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onRecoverableError!==void 0&&(a=n.onRecoverableError)),t=M3(t,null,e,1,n??null,o,!1,i,a),e[yo]=t.current,wu(e),r)for(e=0;e<r.length;e++)n=r[e],o=n._getVersion,o=o(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,o]:t.mutableSourceEagerHydrationData.push(n,o);return new gp(t)};Gn.render=function(e,t,n){if(!yp(t))throw Error(W(200));return bp(null,e,t,!1,n)};Gn.unmountComponentAtNode=function(e){if(!yp(e))throw Error(W(40));return e._reactRootContainer?(Xi(function(){bp(null,null,e,!1,function(){e._reactRootContainer=null,e[yo]=null})}),!0):!1};Gn.unstable_batchedUpdates=T1;Gn.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!yp(n))throw Error(W(200));if(e==null||e._reactInternals===void 0)throw Error(W(38));return bp(e,t,n,!1,r)};Gn.version="18.3.1-next-f1338f8080-20240426";function F3(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(F3)}catch(e){console.error(e)}}F3(),FE.exports=Gn;var xp=FE.exports;const Ul=Hu(xp),nT=CE({__proto__:null,default:Ul},[xp]);var z2=xp;_0.createRoot=z2.createRoot,_0.hydrateRoot=z2.hydrateRoot;function E(){return E=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},E.apply(null,arguments)}var D3={exports:{}},rT="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED",oT=rT,iT=oT;function B3(){}function z3(){}z3.resetWarningCache=B3;var aT=function(){function e(r,o,i,a,s,l){if(l!==iT){var u=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw u.name="Invariant Violation",u}}e.isRequired=e;function t(){return e}var n={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:z3,resetWarningCache:B3};return n.PropTypes=n,n};D3.exports=aT();var sT=D3.exports;const ve=Hu(sT);function ps(e,t){const n=E({},t);return Object.keys(e).forEach(r=>{if(r.toString().match(/^(components|slots)$/))n[r]=E({},e[r],n[r]);else if(r.toString().match(/^(componentsProps|slotProps)$/)){const o=e[r]||{},i=t[r];n[r]={},!i||!Object.keys(i)?n[r]=o:!o||!Object.keys(o)?n[r]=i:(n[r]=E({},i),Object.keys(o).forEach(a=>{n[r][a]=ps(o[a],i[a])}))}else n[r]===void 0&&(n[r]=e[r])}),n}const j3=x.createContext(void 0);function lT({value:e,children:t}){return _(j3.Provider,{value:e,children:t})}function uT(e){const{theme:t,name:n,props:r}=e;if(!t||!t.components||!t.components[n])return r;const o=t.components[n];return o.defaultProps?ps(o.defaultProps,r):!o.styleOverrides&&!o.variants?ps(o,r):r}function cT({props:e,name:t}){const n=x.useContext(j3);return uT({props:e,name:t,theme:{components:n}})}function Ee(e){return cT(e)}function So(e){let t="https://mui.com/production-error/?code="+e;for(let n=1;n<arguments.length;n+=1)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified MUI error #"+e+"; visit "+t+" for the full message."}const dT=Object.freeze(Object.defineProperty({__proto__:null,default:So},Symbol.toStringTag,{value:"Module"}));function U3(e){var t=Object.create(null);return function(n){return t[n]===void 0&&(t[n]=e(n)),t[n]}}var fT=/^((children|dangerouslySetInnerHTML|key|ref|autoFocus|defaultValue|defaultChecked|innerHTML|suppressContentEditableWarning|suppressHydrationWarning|valueLink|abbr|accept|acceptCharset|accessKey|action|allow|allowUserMedia|allowPaymentRequest|allowFullScreen|allowTransparency|alt|async|autoComplete|autoPlay|capture|cellPadding|cellSpacing|challenge|charSet|checked|cite|classID|className|cols|colSpan|content|contentEditable|contextMenu|controls|controlsList|coords|crossOrigin|data|dateTime|decoding|default|defer|dir|disabled|disablePictureInPicture|disableRemotePlayback|download|draggable|encType|enterKeyHint|fetchpriority|fetchPriority|form|formAction|formEncType|formMethod|formNoValidate|formTarget|frameBorder|headers|height|hidden|high|href|hrefLang|htmlFor|httpEquiv|id|inputMode|integrity|is|keyParams|keyType|kind|label|lang|list|loading|loop|low|marginHeight|marginWidth|max|maxLength|media|mediaGroup|method|min|minLength|multiple|muted|name|nonce|noValidate|open|optimum|pattern|placeholder|playsInline|poster|preload|profile|radioGroup|readOnly|referrerPolicy|rel|required|reversed|role|rows|rowSpan|sandbox|scope|scoped|scrolling|seamless|selected|shape|size|sizes|slot|span|spellCheck|src|srcDoc|srcLang|srcSet|start|step|style|summary|tabIndex|target|title|translate|type|useMap|value|width|wmode|wrap|about|datatype|inlist|prefix|property|resource|typeof|vocab|autoCapitalize|autoCorrect|autoSave|color|incremental|fallback|inert|itemProp|itemScope|itemType|itemID|itemRef|on|option|results|security|unselectable|accentHeight|accumulate|additive|alignmentBaseline|allowReorder|alphabetic|amplitude|arabicForm|ascent|attributeName|attributeType|autoReverse|azimuth|baseFrequency|baselineShift|baseProfile|bbox|begin|bias|by|calcMode|capHeight|clip|clipPathUnits|clipPath|clipRule|colorInterpolation|colorInterpolationFilters|colorProfile|colorRendering|contentScriptType|contentStyleType|cursor|cx|cy|d|decelerate|descent|diffuseConstant|direction|display|divisor|dominantBaseline|dur|dx|dy|edgeMode|elevation|enableBackground|end|exponent|externalResourcesRequired|fill|fillOpacity|fillRule|filter|filterRes|filterUnits|floodColor|floodOpacity|focusable|fontFamily|fontSize|fontSizeAdjust|fontStretch|fontStyle|fontVariant|fontWeight|format|from|fr|fx|fy|g1|g2|glyphName|glyphOrientationHorizontal|glyphOrientationVertical|glyphRef|gradientTransform|gradientUnits|hanging|horizAdvX|horizOriginX|ideographic|imageRendering|in|in2|intercept|k|k1|k2|k3|k4|kernelMatrix|kernelUnitLength|kerning|keyPoints|keySplines|keyTimes|lengthAdjust|letterSpacing|lightingColor|limitingConeAngle|local|markerEnd|markerMid|markerStart|markerHeight|markerUnits|markerWidth|mask|maskContentUnits|maskUnits|mathematical|mode|numOctaves|offset|opacity|operator|order|orient|orientation|origin|overflow|overlinePosition|overlineThickness|panose1|paintOrder|pathLength|patternContentUnits|patternTransform|patternUnits|pointerEvents|points|pointsAtX|pointsAtY|pointsAtZ|preserveAlpha|preserveAspectRatio|primitiveUnits|r|radius|refX|refY|renderingIntent|repeatCount|repeatDur|requiredExtensions|requiredFeatures|restart|result|rotate|rx|ry|scale|seed|shapeRendering|slope|spacing|specularConstant|specularExponent|speed|spreadMethod|startOffset|stdDeviation|stemh|stemv|stitchTiles|stopColor|stopOpacity|strikethroughPosition|strikethroughThickness|string|stroke|strokeDasharray|strokeDashoffset|strokeLinecap|strokeLinejoin|strokeMiterlimit|strokeOpacity|strokeWidth|surfaceScale|systemLanguage|tableValues|targetX|targetY|textAnchor|textDecoration|textRendering|textLength|to|transform|u1|u2|underlinePosition|underlineThickness|unicode|unicodeBidi|unicodeRange|unitsPerEm|vAlphabetic|vHanging|vIdeographic|vMathematical|values|vectorEffect|version|vertAdvY|vertOriginX|vertOriginY|viewBox|viewTarget|visibility|widths|wordSpacing|writingMode|x|xHeight|x1|x2|xChannelSelector|xlinkActuate|xlinkArcrole|xlinkHref|xlinkRole|xlinkShow|xlinkTitle|xlinkType|xmlBase|xmlns|xmlnsXlink|xmlLang|xmlSpace|y|y1|y2|yChannelSelector|z|zoomAndPan|for|class|autofocus)|(([Dd][Aa][Tt][Aa]|[Aa][Rr][Ii][Aa]|x)-.*))$/,pT=U3(function(e){return fT.test(e)||e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&e.charCodeAt(2)<91}),hT=!1;function mT(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]}function vT(e){var t=document.createElement("style");return t.setAttribute("data-emotion",e.key),e.nonce!==void 0&&t.setAttribute("nonce",e.nonce),t.appendChild(document.createTextNode("")),t.setAttribute("data-s",""),t}var gT=function(){function e(n){var r=this;this._insertTag=function(o){var i;r.tags.length===0?r.insertionPoint?i=r.insertionPoint.nextSibling:r.prepend?i=r.container.firstChild:i=r.before:i=r.tags[r.tags.length-1].nextSibling,r.container.insertBefore(o,i),r.tags.push(o)},this.isSpeedy=n.speedy===void 0?!hT:n.speedy,this.tags=[],this.ctr=0,this.nonce=n.nonce,this.key=n.key,this.container=n.container,this.prepend=n.prepend,this.insertionPoint=n.insertionPoint,this.before=null}var t=e.prototype;return t.hydrate=function(r){r.forEach(this._insertTag)},t.insert=function(r){this.ctr%(this.isSpeedy?65e3:1)===0&&this._insertTag(vT(this));var o=this.tags[this.tags.length-1];if(this.isSpeedy){var i=mT(o);try{i.insertRule(r,i.cssRules.length)}catch{}}else o.appendChild(document.createTextNode(r));this.ctr++},t.flush=function(){this.tags.forEach(function(r){var o;return(o=r.parentNode)==null?void 0:o.removeChild(r)}),this.tags=[],this.ctr=0},e}(),on="-ms-",Pf="-moz-",Ke="-webkit-",W3="comm",D1="rule",B1="decl",yT="@import",H3="@keyframes",bT="@layer",xT=Math.abs,Sp=String.fromCharCode,ST=Object.assign;function wT(e,t){return Jt(e,0)^45?(((t<<2^Jt(e,0))<<2^Jt(e,1))<<2^Jt(e,2))<<2^Jt(e,3):0}function V3(e){return e.trim()}function _T(e,t){return(e=t.exec(e))?e[0]:e}function Xe(e,t,n){return e.replace(t,n)}function vv(e,t){return e.indexOf(t)}function Jt(e,t){return e.charCodeAt(t)|0}function Ou(e,t,n){return e.slice(t,n)}function Dr(e){return e.length}function z1(e){return e.length}function Vc(e,t){return t.push(e),e}function ET(e,t){return e.map(t).join("")}var wp=1,hs=1,G3=0,On=0,Dt=0,Bs="";function _p(e,t,n,r,o,i,a){return{value:e,root:t,parent:n,type:r,props:o,children:i,line:wp,column:hs,length:a,return:""}}function hl(e,t){return ST(_p("",null,null,"",null,null,0),e,{length:-e.length},t)}function CT(){return Dt}function $T(){return Dt=On>0?Jt(Bs,--On):0,hs--,Dt===10&&(hs=1,wp--),Dt}function jn(){return Dt=On<G3?Jt(Bs,On++):0,hs++,Dt===10&&(hs=1,wp++),Dt}function Kr(){return Jt(Bs,On)}function jd(){return On}function qu(e,t){return Ou(Bs,e,t)}function Iu(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function K3(e){return wp=hs=1,G3=Dr(Bs=e),On=0,[]}function X3(e){return Bs="",e}function Ud(e){return V3(qu(On-1,gv(e===91?e+2:e===40?e+1:e)))}function RT(e){for(;(Dt=Kr())&&Dt<33;)jn();return Iu(e)>2||Iu(Dt)>3?"":" "}function kT(e,t){for(;--t&&jn()&&!(Dt<48||Dt>102||Dt>57&&Dt<65||Dt>70&&Dt<97););return qu(e,jd()+(t<6&&Kr()==32&&jn()==32))}function gv(e){for(;jn();)switch(Dt){case e:return On;case 34:case 39:e!==34&&e!==39&&gv(Dt);break;case 40:e===41&&gv(e);break;case 92:jn();break}return On}function PT(e,t){for(;jn()&&e+Dt!==47+10;)if(e+Dt===42+42&&Kr()===47)break;return"/*"+qu(t,On-1)+"*"+Sp(e===47?e:jn())}function TT(e){for(;!Iu(Kr());)jn();return qu(e,On)}function OT(e){return X3(Wd("",null,null,null,[""],e=K3(e),0,[0],e))}function Wd(e,t,n,r,o,i,a,s,l){for(var u=0,c=0,d=a,f=0,h=0,v=0,y=1,b=1,p=1,m=0,g="",w=o,C=i,S=r,$=g;b;)switch(v=m,m=jn()){case 40:if(v!=108&&Jt($,d-1)==58){vv($+=Xe(Ud(m),"&","&\f"),"&\f")!=-1&&(p=-1);break}case 34:case 39:case 91:$+=Ud(m);break;case 9:case 10:case 13:case 32:$+=RT(v);break;case 92:$+=kT(jd()-1,7);continue;case 47:switch(Kr()){case 42:case 47:Vc(IT(PT(jn(),jd()),t,n),l);break;default:$+="/"}break;case 123*y:s[u++]=Dr($)*p;case 125*y:case 59:case 0:switch(m){case 0:case 125:b=0;case 59+c:p==-1&&($=Xe($,/\f/g,"")),h>0&&Dr($)-d&&Vc(h>32?U2($+";",r,n,d-1):U2(Xe($," ","")+";",r,n,d-2),l);break;case 59:$+=";";default:if(Vc(S=j2($,t,n,u,c,o,s,g,w=[],C=[],d),i),m===123)if(c===0)Wd($,t,S,S,w,i,d,s,C);else switch(f===99&&Jt($,3)===110?100:f){case 100:case 108:case 109:case 115:Wd(e,S,S,r&&Vc(j2(e,S,S,0,0,o,s,g,o,w=[],d),C),o,C,d,s,r?w:C);break;default:Wd($,S,S,S,[""],C,0,s,C)}}u=c=h=0,y=p=1,g=$="",d=a;break;case 58:d=1+Dr($),h=v;default:if(y<1){if(m==123)--y;else if(m==125&&y++==0&&$T()==125)continue}switch($+=Sp(m),m*y){case 38:p=c>0?1:($+="\f",-1);break;case 44:s[u++]=(Dr($)-1)*p,p=1;break;case 64:Kr()===45&&($+=Ud(jn())),f=Kr(),c=d=Dr(g=$+=TT(jd())),m++;break;case 45:v===45&&Dr($)==2&&(y=0)}}return i}function j2(e,t,n,r,o,i,a,s,l,u,c){for(var d=o-1,f=o===0?i:[""],h=z1(f),v=0,y=0,b=0;v<r;++v)for(var p=0,m=Ou(e,d+1,d=xT(y=a[v])),g=e;p<h;++p)(g=V3(y>0?f[p]+" "+m:Xe(m,/&\f/g,f[p])))&&(l[b++]=g);return _p(e,t,n,o===0?D1:s,l,u,c)}function IT(e,t,n){return _p(e,t,n,W3,Sp(CT()),Ou(e,2,-2),0)}function U2(e,t,n,r){return _p(e,t,n,B1,Ou(e,0,r),Ou(e,r+1,-1),r)}function Ja(e,t){for(var n="",r=z1(e),o=0;o<r;o++)n+=t(e[o],o,e,t)||"";return n}function NT(e,t,n,r){switch(e.type){case bT:if(e.children.length)break;case yT:case B1:return e.return=e.return||e.value;case W3:return"";case H3:return e.return=e.value+"{"+Ja(e.children,r)+"}";case D1:e.value=e.props.join(",")}return Dr(n=Ja(e.children,r))?e.return=e.value+"{"+n+"}":""}function AT(e){var t=z1(e);return function(n,r,o,i){for(var a="",s=0;s<t;s++)a+=e[s](n,r,o,i)||"";return a}}function MT(e){return function(t){t.root||(t=t.return)&&e(t)}}var LT=function(t,n,r){for(var o=0,i=0;o=i,i=Kr(),o===38&&i===12&&(n[r]=1),!Iu(i);)jn();return qu(t,On)},FT=function(t,n){var r=-1,o=44;do switch(Iu(o)){case 0:o===38&&Kr()===12&&(n[r]=1),t[r]+=LT(On-1,n,r);break;case 2:t[r]+=Ud(o);break;case 4:if(o===44){t[++r]=Kr()===58?"&\f":"",n[r]=t[r].length;break}default:t[r]+=Sp(o)}while(o=jn());return t},DT=function(t,n){return X3(FT(K3(t),n))},W2=new WeakMap,BT=function(t){if(!(t.type!=="rule"||!t.parent||t.length<1)){for(var n=t.value,r=t.parent,o=t.column===r.column&&t.line===r.line;r.type!=="rule";)if(r=r.parent,!r)return;if(!(t.props.length===1&&n.charCodeAt(0)!==58&&!W2.get(r))&&!o){W2.set(t,!0);for(var i=[],a=DT(n,i),s=r.props,l=0,u=0;l<a.length;l++)for(var c=0;c<s.length;c++,u++)t.props[u]=i[l]?a[l].replace(/&\f/g,s[c]):s[c]+" "+a[l]}}},zT=function(t){if(t.type==="decl"){var n=t.value;n.charCodeAt(0)===108&&n.charCodeAt(2)===98&&(t.return="",t.value="")}};function Y3(e,t){switch(wT(e,t)){case 5103:return Ke+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return Ke+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return Ke+e+Pf+e+on+e+e;case 6828:case 4268:return Ke+e+on+e+e;case 6165:return Ke+e+on+"flex-"+e+e;case 5187:return Ke+e+Xe(e,/(\w+).+(:[^]+)/,Ke+"box-$1$2"+on+"flex-$1$2")+e;case 5443:return Ke+e+on+"flex-item-"+Xe(e,/flex-|-self/,"")+e;case 4675:return Ke+e+on+"flex-line-pack"+Xe(e,/align-content|flex-|-self/,"")+e;case 5548:return Ke+e+on+Xe(e,"shrink","negative")+e;case 5292:return Ke+e+on+Xe(e,"basis","preferred-size")+e;case 6060:return Ke+"box-"+Xe(e,"-grow","")+Ke+e+on+Xe(e,"grow","positive")+e;case 4554:return Ke+Xe(e,/([^-])(transform)/g,"$1"+Ke+"$2")+e;case 6187:return Xe(Xe(Xe(e,/(zoom-|grab)/,Ke+"$1"),/(image-set)/,Ke+"$1"),e,"")+e;case 5495:case 3959:return Xe(e,/(image-set\([^]*)/,Ke+"$1$`$1");case 4968:return Xe(Xe(e,/(.+:)(flex-)?(.*)/,Ke+"box-pack:$3"+on+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+Ke+e+e;case 4095:case 3583:case 4068:case 2532:return Xe(e,/(.+)-inline(.+)/,Ke+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(Dr(e)-1-t>6)switch(Jt(e,t+1)){case 109:if(Jt(e,t+4)!==45)break;case 102:return Xe(e,/(.+:)(.+)-([^]+)/,"$1"+Ke+"$2-$3$1"+Pf+(Jt(e,t+3)==108?"$3":"$2-$3"))+e;case 115:return~vv(e,"stretch")?Y3(Xe(e,"stretch","fill-available"),t)+e:e}break;case 4949:if(Jt(e,t+1)!==115)break;case 6444:switch(Jt(e,Dr(e)-3-(~vv(e,"!important")&&10))){case 107:return Xe(e,":",":"+Ke)+e;case 101:return Xe(e,/(.+:)([^;!]+)(;|!.+)?/,"$1"+Ke+(Jt(e,14)===45?"inline-":"")+"box$3$1"+Ke+"$2$3$1"+on+"$2box$3")+e}break;case 5936:switch(Jt(e,t+11)){case 114:return Ke+e+on+Xe(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return Ke+e+on+Xe(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return Ke+e+on+Xe(e,/[svh]\w+-[tblr]{2}/,"lr")+e}return Ke+e+on+e+e}return e}var jT=function(t,n,r,o){if(t.length>-1&&!t.return)switch(t.type){case B1:t.return=Y3(t.value,t.length);break;case H3:return Ja([hl(t,{value:Xe(t.value,"@","@"+Ke)})],o);case D1:if(t.length)return ET(t.props,function(i){switch(_T(i,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return Ja([hl(t,{props:[Xe(i,/:(read-\w+)/,":"+Pf+"$1")]})],o);case"::placeholder":return Ja([hl(t,{props:[Xe(i,/:(plac\w+)/,":"+Ke+"input-$1")]}),hl(t,{props:[Xe(i,/:(plac\w+)/,":"+Pf+"$1")]}),hl(t,{props:[Xe(i,/:(plac\w+)/,on+"input-$1")]})],o)}return""})}},UT=[jT],q3=function(t){var n=t.key;if(n==="css"){var r=document.querySelectorAll("style[data-emotion]:not([data-s])");Array.prototype.forEach.call(r,function(y){var b=y.getAttribute("data-emotion");b.indexOf(" ")!==-1&&(document.head.appendChild(y),y.setAttribute("data-s",""))})}var o=t.stylisPlugins||UT,i={},a,s=[];a=t.container||document.head,Array.prototype.forEach.call(document.querySelectorAll('style[data-emotion^="'+n+' "]'),function(y){for(var b=y.getAttribute("data-emotion").split(" "),p=1;p<b.length;p++)i[b[p]]=!0;s.push(y)});var l,u=[BT,zT];{var c,d=[NT,MT(function(y){c.insert(y)})],f=AT(u.concat(o,d)),h=function(b){return Ja(OT(b),f)};l=function(b,p,m,g){c=m,h(b?b+"{"+p.styles+"}":p.styles),g&&(v.inserted[p.name]=!0)}}var v={key:n,sheet:new gT({key:n,container:a,nonce:t.nonce,speedy:t.speedy,prepend:t.prepend,insertionPoint:t.insertionPoint}),nonce:t.nonce,inserted:i,registered:{},insert:l};return v.sheet.hydrate(s),v},Q3={exports:{}},tt={};/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Xt=typeof Symbol=="function"&&Symbol.for,j1=Xt?Symbol.for("react.element"):60103,U1=Xt?Symbol.for("react.portal"):60106,Ep=Xt?Symbol.for("react.fragment"):60107,Cp=Xt?Symbol.for("react.strict_mode"):60108,$p=Xt?Symbol.for("react.profiler"):60114,Rp=Xt?Symbol.for("react.provider"):60109,kp=Xt?Symbol.for("react.context"):60110,W1=Xt?Symbol.for("react.async_mode"):60111,Pp=Xt?Symbol.for("react.concurrent_mode"):60111,Tp=Xt?Symbol.for("react.forward_ref"):60112,Op=Xt?Symbol.for("react.suspense"):60113,WT=Xt?Symbol.for("react.suspense_list"):60120,Ip=Xt?Symbol.for("react.memo"):60115,Np=Xt?Symbol.for("react.lazy"):60116,HT=Xt?Symbol.for("react.block"):60121,VT=Xt?Symbol.for("react.fundamental"):60117,GT=Xt?Symbol.for("react.responder"):60118,KT=Xt?Symbol.for("react.scope"):60119;function Xn(e){if(typeof e=="object"&&e!==null){var t=e.$$typeof;switch(t){case j1:switch(e=e.type,e){case W1:case Pp:case Ep:case $p:case Cp:case Op:return e;default:switch(e=e&&e.$$typeof,e){case kp:case Tp:case Np:case Ip:case Rp:return e;default:return t}}case U1:return t}}}function J3(e){return Xn(e)===Pp}tt.AsyncMode=W1;tt.ConcurrentMode=Pp;tt.ContextConsumer=kp;tt.ContextProvider=Rp;tt.Element=j1;tt.ForwardRef=Tp;tt.Fragment=Ep;tt.Lazy=Np;tt.Memo=Ip;tt.Portal=U1;tt.Profiler=$p;tt.StrictMode=Cp;tt.Suspense=Op;tt.isAsyncMode=function(e){return J3(e)||Xn(e)===W1};tt.isConcurrentMode=J3;tt.isContextConsumer=function(e){return Xn(e)===kp};tt.isContextProvider=function(e){return Xn(e)===Rp};tt.isElement=function(e){return typeof e=="object"&&e!==null&&e.$$typeof===j1};tt.isForwardRef=function(e){return Xn(e)===Tp};tt.isFragment=function(e){return Xn(e)===Ep};tt.isLazy=function(e){return Xn(e)===Np};tt.isMemo=function(e){return Xn(e)===Ip};tt.isPortal=function(e){return Xn(e)===U1};tt.isProfiler=function(e){return Xn(e)===$p};tt.isStrictMode=function(e){return Xn(e)===Cp};tt.isSuspense=function(e){return Xn(e)===Op};tt.isValidElementType=function(e){return typeof e=="string"||typeof e=="function"||e===Ep||e===Pp||e===$p||e===Cp||e===Op||e===WT||typeof e=="object"&&e!==null&&(e.$$typeof===Np||e.$$typeof===Ip||e.$$typeof===Rp||e.$$typeof===kp||e.$$typeof===Tp||e.$$typeof===VT||e.$$typeof===GT||e.$$typeof===KT||e.$$typeof===HT)};tt.typeOf=Xn;Q3.exports=tt;var XT=Q3.exports,Z3=XT,YT={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},qT={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},e$={};e$[Z3.ForwardRef]=YT;e$[Z3.Memo]=qT;var QT=!0;function JT(e,t,n){var r="";return n.split(" ").forEach(function(o){e[o]!==void 0?t.push(e[o]+";"):o&&(r+=o+" ")}),r}var t$=function(t,n,r){var o=t.key+"-"+n.name;(r===!1||QT===!1)&&t.registered[o]===void 0&&(t.registered[o]=n.styles)},n$=function(t,n,r){t$(t,n,r);var o=t.key+"-"+n.name;if(t.inserted[n.name]===void 0){var i=n;do t.insert(n===i?"."+o:"",i,t.sheet,!0),i=i.next;while(i!==void 0)}};function ZT(e){for(var t=0,n,r=0,o=e.length;o>=4;++r,o-=4)n=e.charCodeAt(r)&255|(e.charCodeAt(++r)&255)<<8|(e.charCodeAt(++r)&255)<<16|(e.charCodeAt(++r)&255)<<24,n=(n&65535)*1540483477+((n>>>16)*59797<<16),n^=n>>>24,t=(n&65535)*1540483477+((n>>>16)*59797<<16)^(t&65535)*1540483477+((t>>>16)*59797<<16);switch(o){case 3:t^=(e.charCodeAt(r+2)&255)<<16;case 2:t^=(e.charCodeAt(r+1)&255)<<8;case 1:t^=e.charCodeAt(r)&255,t=(t&65535)*1540483477+((t>>>16)*59797<<16)}return t^=t>>>13,t=(t&65535)*1540483477+((t>>>16)*59797<<16),((t^t>>>15)>>>0).toString(36)}var eO={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,scale:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1},tO=!1,nO=/[A-Z]|^ms/g,rO=/_EMO_([^_]+?)_([^]*?)_EMO_/g,r$=function(t){return t.charCodeAt(1)===45},H2=function(t){return t!=null&&typeof t!="boolean"},bm=U3(function(e){return r$(e)?e:e.replace(nO,"-$&").toLowerCase()}),V2=function(t,n){switch(t){case"animation":case"animationName":if(typeof n=="string")return n.replace(rO,function(r,o,i){return Br={name:o,styles:i,next:Br},o})}return eO[t]!==1&&!r$(t)&&typeof n=="number"&&n!==0?n+"px":n},oO="Component selectors can only be used in conjunction with @emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware compiler transform.";function Nu(e,t,n){if(n==null)return"";var r=n;if(r.__emotion_styles!==void 0)return r;switch(typeof n){case"boolean":return"";case"object":{var o=n;if(o.anim===1)return Br={name:o.name,styles:o.styles,next:Br},o.name;var i=n;if(i.styles!==void 0){var a=i.next;if(a!==void 0)for(;a!==void 0;)Br={name:a.name,styles:a.styles,next:Br},a=a.next;var s=i.styles+";";return s}return iO(e,t,n)}case"function":{if(e!==void 0){var l=Br,u=n(e);return Br=l,Nu(e,t,u)}break}}var c=n;if(t==null)return c;var d=t[c];return d!==void 0?d:c}function iO(e,t,n){var r="";if(Array.isArray(n))for(var o=0;o<n.length;o++)r+=Nu(e,t,n[o])+";";else for(var i in n){var a=n[i];if(typeof a!="object"){var s=a;t!=null&&t[s]!==void 0?r+=i+"{"+t[s]+"}":H2(s)&&(r+=bm(i)+":"+V2(i,s)+";")}else{if(i==="NO_COMPONENT_SELECTOR"&&tO)throw new Error(oO);if(Array.isArray(a)&&typeof a[0]=="string"&&(t==null||t[a[0]]===void 0))for(var l=0;l<a.length;l++)H2(a[l])&&(r+=bm(i)+":"+V2(i,a[l])+";");else{var u=Nu(e,t,a);switch(i){case"animation":case"animationName":{r+=bm(i)+":"+u+";";break}default:r+=i+"{"+u+"}"}}}}return r}var G2=/label:\s*([^\s;{]+)\s*(;|$)/g,Br;function H1(e,t,n){if(e.length===1&&typeof e[0]=="object"&&e[0]!==null&&e[0].styles!==void 0)return e[0];var r=!0,o="";Br=void 0;var i=e[0];if(i==null||i.raw===void 0)r=!1,o+=Nu(n,t,i);else{var a=i;o+=a[0]}for(var s=1;s<e.length;s++)if(o+=Nu(n,t,e[s]),r){var l=i;o+=l[s]}G2.lastIndex=0;for(var u="",c;(c=G2.exec(o))!==null;)u+="-"+c[1];var d=ZT(o)+u;return{name:d,styles:o,next:Br}}var aO=function(t){return t()},o$=rf["useInsertionEffect"]?rf["useInsertionEffect"]:!1,sO=o$||aO,K2=o$||x.useLayoutEffect,i$=x.createContext(typeof HTMLElement<"u"?q3({key:"css"}):null),lO=i$.Provider,a$=function(t){return x.forwardRef(function(n,r){var o=x.useContext(i$);return t(n,o,r)})},Qu=x.createContext({}),xm={exports:{}},X2;function s$(){return X2||(X2=1,function(e){function t(){return e.exports=t=Object.assign?Object.assign.bind():function(n){for(var r=1;r<arguments.length;r++){var o=arguments[r];for(var i in o)({}).hasOwnProperty.call(o,i)&&(n[i]=o[i])}return n},e.exports.__esModule=!0,e.exports.default=e.exports,t.apply(null,arguments)}e.exports=t,e.exports.__esModule=!0,e.exports.default=e.exports}(xm)),xm.exports}s$();var uO=a$(function(e,t){var n=e.styles,r=H1([n],void 0,x.useContext(Qu)),o=x.useRef();return K2(function(){var i=t.key+"-global",a=new t.sheet.constructor({key:i,nonce:t.sheet.nonce,container:t.sheet.container,speedy:t.sheet.isSpeedy}),s=!1,l=document.querySelector('style[data-emotion="'+i+" "+r.name+'"]');return t.sheet.tags.length&&(a.before=t.sheet.tags[0]),l!==null&&(s=!0,l.setAttribute("data-emotion",i),a.hydrate([l])),o.current=[a,s],function(){a.flush()}},[t]),K2(function(){var i=o.current,a=i[0],s=i[1];if(s){i[1]=!1;return}if(r.next!==void 0&&n$(t,r.next,!0),a.tags.length){var l=a.tags[a.tags.length-1].nextElementSibling;a.before=l,a.flush()}t.insert("",r,a,!1)},[t,r.name]),null});function l$(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return H1(t)}var Ap=function(){var t=l$.apply(void 0,arguments),n="animation-"+t.name;return{name:n,styles:"@keyframes "+n+"{"+t.styles+"}",anim:1,toString:function(){return"_EMO_"+this.name+"_"+this.styles+"_EMO_"}}},cO=pT,dO=function(t){return t!=="theme"},Y2=function(t){return typeof t=="string"&&t.charCodeAt(0)>96?cO:dO},q2=function(t,n,r){var o;if(n){var i=n.shouldForwardProp;o=t.__emotion_forwardProp&&i?function(a){return t.__emotion_forwardProp(a)&&i(a)}:i}return typeof o!="function"&&r&&(o=t.__emotion_forwardProp),o},fO=!1,pO=function(t){var n=t.cache,r=t.serialized,o=t.isStringTag;return t$(n,r,o),sO(function(){return n$(n,r,o)}),null},hO=function e(t,n){var r=t.__emotion_real===t,o=r&&t.__emotion_base||t,i,a;n!==void 0&&(i=n.label,a=n.target);var s=q2(t,n,r),l=s||Y2(o),u=!l("as");return function(){var c=arguments,d=r&&t.__emotion_styles!==void 0?t.__emotion_styles.slice(0):[];if(i!==void 0&&d.push("label:"+i+";"),c[0]==null||c[0].raw===void 0)d.push.apply(d,c);else{d.push(c[0][0]);for(var f=c.length,h=1;h<f;h++)d.push(c[h],c[0][h])}var v=a$(function(y,b,p){var m=u&&y.as||o,g="",w=[],C=y;if(y.theme==null){C={};for(var S in y)C[S]=y[S];C.theme=x.useContext(Qu)}typeof y.className=="string"?g=JT(b.registered,w,y.className):y.className!=null&&(g=y.className+" ");var $=H1(d.concat(w),b.registered,C);g+=b.key+"-"+$.name,a!==void 0&&(g+=" "+a);var R=u&&s===void 0?Y2(m):l,k={};for(var P in y)u&&P==="as"||R(P)&&(k[P]=y[P]);return k.className=g,p&&(k.ref=p),x.createElement(x.Fragment,null,x.createElement(pO,{cache:b,serialized:$,isStringTag:typeof m=="string"}),x.createElement(m,k))});return v.displayName=i!==void 0?i:"Styled("+(typeof o=="string"?o:o.displayName||o.name||"Component")+")",v.defaultProps=t.defaultProps,v.__emotion_real=v,v.__emotion_base=o,v.__emotion_styles=d,v.__emotion_forwardProp=s,Object.defineProperty(v,"toString",{value:function(){return a===void 0&&fO?"NO_COMPONENT_SELECTOR":"."+a}}),v.withComponent=function(y,b){return e(y,E({},n,b,{shouldForwardProp:q2(v,b,!0)})).apply(void 0,d)},v}},mO=["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","marquee","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"],yv=hO.bind();mO.forEach(function(e){yv[e]=yv(e)});let bv;typeof document=="object"&&(bv=q3({key:"css",prepend:!0}));function vO(e){const{injectFirst:t,children:n}=e;return t&&bv?_(lO,{value:bv,children:n}):n}function gO(e){return e==null||Object.keys(e).length===0}function u$(e){const{styles:t,defaultTheme:n={}}=e;return _(uO,{styles:typeof t=="function"?o=>t(gO(o)?n:o):t})}/**
 * @mui/styled-engine v5.16.6
 *
 * @license MIT
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function V1(e,t){return yv(e,t)}const c$=(e,t)=>{Array.isArray(e.__emotion_styles)&&(e.__emotion_styles=t(e.__emotion_styles))},yO=Object.freeze(Object.defineProperty({__proto__:null,GlobalStyles:u$,StyledEngineProvider:vO,ThemeContext:Qu,css:l$,default:V1,internal_processStyles:c$,keyframes:Ap},Symbol.toStringTag,{value:"Module"}));function Y(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.includes(r))continue;n[r]=e[r]}return n}function lo(e){if(typeof e!="object"||e===null)return!1;const t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype||Object.getPrototypeOf(t)===null)&&!(Symbol.toStringTag in e)&&!(Symbol.iterator in e)}function d$(e){if(!lo(e))return e;const t={};return Object.keys(e).forEach(n=>{t[n]=d$(e[n])}),t}function gn(e,t,n={clone:!0}){const r=n.clone?E({},e):e;return lo(e)&&lo(t)&&Object.keys(t).forEach(o=>{lo(t[o])&&Object.prototype.hasOwnProperty.call(e,o)&&lo(e[o])?r[o]=gn(e[o],t[o],n):n.clone?r[o]=lo(t[o])?d$(t[o]):t[o]:r[o]=t[o]}),r}const bO=Object.freeze(Object.defineProperty({__proto__:null,default:gn,isPlainObject:lo},Symbol.toStringTag,{value:"Module"})),xO=["values","unit","step"],SO=e=>{const t=Object.keys(e).map(n=>({key:n,val:e[n]}))||[];return t.sort((n,r)=>n.val-r.val),t.reduce((n,r)=>E({},n,{[r.key]:r.val}),{})};function f$(e){const{values:t={xs:0,sm:600,md:900,lg:1200,xl:1536},unit:n="px",step:r=5}=e,o=Y(e,xO),i=SO(t),a=Object.keys(i);function s(f){return`@media (min-width:${typeof t[f]=="number"?t[f]:f}${n})`}function l(f){return`@media (max-width:${(typeof t[f]=="number"?t[f]:f)-r/100}${n})`}function u(f,h){const v=a.indexOf(h);return`@media (min-width:${typeof t[f]=="number"?t[f]:f}${n}) and (max-width:${(v!==-1&&typeof t[a[v]]=="number"?t[a[v]]:h)-r/100}${n})`}function c(f){return a.indexOf(f)+1<a.length?u(f,a[a.indexOf(f)+1]):s(f)}function d(f){const h=a.indexOf(f);return h===0?s(a[1]):h===a.length-1?l(a[h]):u(f,a[a.indexOf(f)+1]).replace("@media","@media not all and")}return E({keys:a,values:i,up:s,down:l,between:u,only:c,not:d,unit:n},o)}const wO={borderRadius:4},_O=wO;function iu(e,t){return t?gn(e,t,{clone:!1}):e}const G1={xs:0,sm:600,md:900,lg:1200,xl:1536},Q2={keys:["xs","sm","md","lg","xl"],up:e=>`@media (min-width:${G1[e]}px)`};function In(e,t,n){const r=e.theme||{};if(Array.isArray(t)){const i=r.breakpoints||Q2;return t.reduce((a,s,l)=>(a[i.up(i.keys[l])]=n(t[l]),a),{})}if(typeof t=="object"){const i=r.breakpoints||Q2;return Object.keys(t).reduce((a,s)=>{if(Object.keys(i.values||G1).indexOf(s)!==-1){const l=i.up(s);a[l]=n(t[s],s)}else{const l=s;a[l]=t[l]}return a},{})}return n(t)}function p$(e={}){var t;return((t=e.keys)==null?void 0:t.reduce((r,o)=>{const i=e.up(o);return r[i]={},r},{}))||{}}function h$(e,t){return e.reduce((n,r)=>{const o=n[r];return(!o||Object.keys(o).length===0)&&delete n[r],n},t)}function EO(e,...t){const n=p$(e),r=[n,...t].reduce((o,i)=>gn(o,i),{});return h$(Object.keys(n),r)}function CO(e,t){if(typeof e!="object")return{};const n={},r=Object.keys(t);return Array.isArray(e)?r.forEach((o,i)=>{i<e.length&&(n[o]=!0)}):r.forEach(o=>{e[o]!=null&&(n[o]=!0)}),n}function Bi({values:e,breakpoints:t,base:n}){const r=n||CO(e,t),o=Object.keys(r);if(o.length===0)return e;let i;return o.reduce((a,s,l)=>(Array.isArray(e)?(a[s]=e[l]!=null?e[l]:e[i],i=l):typeof e=="object"?(a[s]=e[s]!=null?e[s]:e[i],i=s):a[s]=e,a),{})}function K(e){if(typeof e!="string")throw new Error(So(7));return e.charAt(0).toUpperCase()+e.slice(1)}const $O=Object.freeze(Object.defineProperty({__proto__:null,default:K},Symbol.toStringTag,{value:"Module"}));function ms(e,t,n=!0){if(!t||typeof t!="string")return null;if(e&&e.vars&&n){const r=`vars.${t}`.split(".").reduce((o,i)=>o&&o[i]?o[i]:null,e);if(r!=null)return r}return t.split(".").reduce((r,o)=>r&&r[o]!=null?r[o]:null,e)}function Tf(e,t,n,r=n){let o;return typeof e=="function"?o=e(n):Array.isArray(e)?o=e[n]||r:o=ms(e,n)||r,t&&(o=t(o,r,e)),o}function At(e){const{prop:t,cssProperty:n=e.prop,themeKey:r,transform:o}=e,i=a=>{if(a[t]==null)return null;const s=a[t],l=a.theme,u=ms(l,r)||{};return In(a,s,d=>{let f=Tf(u,o,d);return d===f&&typeof d=="string"&&(f=Tf(u,o,`${t}${d==="default"?"":K(d)}`,d)),n===!1?f:{[n]:f}})};return i.propTypes={},i.filterProps=[t],i}function RO(e){const t={};return n=>(t[n]===void 0&&(t[n]=e(n)),t[n])}const kO={m:"margin",p:"padding"},PO={t:"Top",r:"Right",b:"Bottom",l:"Left",x:["Left","Right"],y:["Top","Bottom"]},J2={marginX:"mx",marginY:"my",paddingX:"px",paddingY:"py"},TO=RO(e=>{if(e.length>2)if(J2[e])e=J2[e];else return[e];const[t,n]=e.split(""),r=kO[t],o=PO[n]||"";return Array.isArray(o)?o.map(i=>r+i):[r+o]}),K1=["m","mt","mr","mb","ml","mx","my","margin","marginTop","marginRight","marginBottom","marginLeft","marginX","marginY","marginInline","marginInlineStart","marginInlineEnd","marginBlock","marginBlockStart","marginBlockEnd"],X1=["p","pt","pr","pb","pl","px","py","padding","paddingTop","paddingRight","paddingBottom","paddingLeft","paddingX","paddingY","paddingInline","paddingInlineStart","paddingInlineEnd","paddingBlock","paddingBlockStart","paddingBlockEnd"];[...K1,...X1];function Ju(e,t,n,r){var o;const i=(o=ms(e,t,!1))!=null?o:n;return typeof i=="number"?a=>typeof a=="string"?a:i*a:Array.isArray(i)?a=>typeof a=="string"?a:i[a]:typeof i=="function"?i:()=>{}}function Y1(e){return Ju(e,"spacing",8)}function Yi(e,t){if(typeof t=="string"||t==null)return t;const n=Math.abs(t),r=e(n);return t>=0?r:typeof r=="number"?-r:`-${r}`}function OO(e,t){return n=>e.reduce((r,o)=>(r[o]=Yi(t,n),r),{})}function IO(e,t,n,r){if(t.indexOf(n)===-1)return null;const o=TO(n),i=OO(o,r),a=e[n];return In(e,a,i)}function m$(e,t){const n=Y1(e.theme);return Object.keys(e).map(r=>IO(e,t,r,n)).reduce(iu,{})}function Rt(e){return m$(e,K1)}Rt.propTypes={};Rt.filterProps=K1;function kt(e){return m$(e,X1)}kt.propTypes={};kt.filterProps=X1;function NO(e=8){if(e.mui)return e;const t=Y1({spacing:e}),n=(...r)=>(r.length===0?[1]:r).map(i=>{const a=t(i);return typeof a=="number"?`${a}px`:a}).join(" ");return n.mui=!0,n}function Mp(...e){const t=e.reduce((r,o)=>(o.filterProps.forEach(i=>{r[i]=o}),r),{}),n=r=>Object.keys(r).reduce((o,i)=>t[i]?iu(o,t[i](r)):o,{});return n.propTypes={},n.filterProps=e.reduce((r,o)=>r.concat(o.filterProps),[]),n}function or(e){return typeof e!="number"?e:`${e}px solid`}function br(e,t){return At({prop:e,themeKey:"borders",transform:t})}const AO=br("border",or),MO=br("borderTop",or),LO=br("borderRight",or),FO=br("borderBottom",or),DO=br("borderLeft",or),BO=br("borderColor"),zO=br("borderTopColor"),jO=br("borderRightColor"),UO=br("borderBottomColor"),WO=br("borderLeftColor"),HO=br("outline",or),VO=br("outlineColor"),Lp=e=>{if(e.borderRadius!==void 0&&e.borderRadius!==null){const t=Ju(e.theme,"shape.borderRadius",4),n=r=>({borderRadius:Yi(t,r)});return In(e,e.borderRadius,n)}return null};Lp.propTypes={};Lp.filterProps=["borderRadius"];Mp(AO,MO,LO,FO,DO,BO,zO,jO,UO,WO,Lp,HO,VO);const Fp=e=>{if(e.gap!==void 0&&e.gap!==null){const t=Ju(e.theme,"spacing",8),n=r=>({gap:Yi(t,r)});return In(e,e.gap,n)}return null};Fp.propTypes={};Fp.filterProps=["gap"];const Dp=e=>{if(e.columnGap!==void 0&&e.columnGap!==null){const t=Ju(e.theme,"spacing",8),n=r=>({columnGap:Yi(t,r)});return In(e,e.columnGap,n)}return null};Dp.propTypes={};Dp.filterProps=["columnGap"];const Bp=e=>{if(e.rowGap!==void 0&&e.rowGap!==null){const t=Ju(e.theme,"spacing",8),n=r=>({rowGap:Yi(t,r)});return In(e,e.rowGap,n)}return null};Bp.propTypes={};Bp.filterProps=["rowGap"];const GO=At({prop:"gridColumn"}),KO=At({prop:"gridRow"}),XO=At({prop:"gridAutoFlow"}),YO=At({prop:"gridAutoColumns"}),qO=At({prop:"gridAutoRows"}),QO=At({prop:"gridTemplateColumns"}),JO=At({prop:"gridTemplateRows"}),ZO=At({prop:"gridTemplateAreas"}),eI=At({prop:"gridArea"});Mp(Fp,Dp,Bp,GO,KO,XO,YO,qO,QO,JO,ZO,eI);function Za(e,t){return t==="grey"?t:e}const tI=At({prop:"color",themeKey:"palette",transform:Za}),nI=At({prop:"bgcolor",cssProperty:"backgroundColor",themeKey:"palette",transform:Za}),rI=At({prop:"backgroundColor",themeKey:"palette",transform:Za});Mp(tI,nI,rI);function Fn(e){return e<=1&&e!==0?`${e*100}%`:e}const oI=At({prop:"width",transform:Fn}),q1=e=>{if(e.maxWidth!==void 0&&e.maxWidth!==null){const t=n=>{var r,o;const i=((r=e.theme)==null||(r=r.breakpoints)==null||(r=r.values)==null?void 0:r[n])||G1[n];return i?((o=e.theme)==null||(o=o.breakpoints)==null?void 0:o.unit)!=="px"?{maxWidth:`${i}${e.theme.breakpoints.unit}`}:{maxWidth:i}:{maxWidth:Fn(n)}};return In(e,e.maxWidth,t)}return null};q1.filterProps=["maxWidth"];const iI=At({prop:"minWidth",transform:Fn}),aI=At({prop:"height",transform:Fn}),sI=At({prop:"maxHeight",transform:Fn}),lI=At({prop:"minHeight",transform:Fn});At({prop:"size",cssProperty:"width",transform:Fn});At({prop:"size",cssProperty:"height",transform:Fn});const uI=At({prop:"boxSizing"});Mp(oI,q1,iI,aI,sI,lI,uI);const cI={border:{themeKey:"borders",transform:or},borderTop:{themeKey:"borders",transform:or},borderRight:{themeKey:"borders",transform:or},borderBottom:{themeKey:"borders",transform:or},borderLeft:{themeKey:"borders",transform:or},borderColor:{themeKey:"palette"},borderTopColor:{themeKey:"palette"},borderRightColor:{themeKey:"palette"},borderBottomColor:{themeKey:"palette"},borderLeftColor:{themeKey:"palette"},outline:{themeKey:"borders",transform:or},outlineColor:{themeKey:"palette"},borderRadius:{themeKey:"shape.borderRadius",style:Lp},color:{themeKey:"palette",transform:Za},bgcolor:{themeKey:"palette",cssProperty:"backgroundColor",transform:Za},backgroundColor:{themeKey:"palette",transform:Za},p:{style:kt},pt:{style:kt},pr:{style:kt},pb:{style:kt},pl:{style:kt},px:{style:kt},py:{style:kt},padding:{style:kt},paddingTop:{style:kt},paddingRight:{style:kt},paddingBottom:{style:kt},paddingLeft:{style:kt},paddingX:{style:kt},paddingY:{style:kt},paddingInline:{style:kt},paddingInlineStart:{style:kt},paddingInlineEnd:{style:kt},paddingBlock:{style:kt},paddingBlockStart:{style:kt},paddingBlockEnd:{style:kt},m:{style:Rt},mt:{style:Rt},mr:{style:Rt},mb:{style:Rt},ml:{style:Rt},mx:{style:Rt},my:{style:Rt},margin:{style:Rt},marginTop:{style:Rt},marginRight:{style:Rt},marginBottom:{style:Rt},marginLeft:{style:Rt},marginX:{style:Rt},marginY:{style:Rt},marginInline:{style:Rt},marginInlineStart:{style:Rt},marginInlineEnd:{style:Rt},marginBlock:{style:Rt},marginBlockStart:{style:Rt},marginBlockEnd:{style:Rt},displayPrint:{cssProperty:!1,transform:e=>({"@media print":{display:e}})},display:{},overflow:{},textOverflow:{},visibility:{},whiteSpace:{},flexBasis:{},flexDirection:{},flexWrap:{},justifyContent:{},alignItems:{},alignContent:{},order:{},flex:{},flexGrow:{},flexShrink:{},alignSelf:{},justifyItems:{},justifySelf:{},gap:{style:Fp},rowGap:{style:Bp},columnGap:{style:Dp},gridColumn:{},gridRow:{},gridAutoFlow:{},gridAutoColumns:{},gridAutoRows:{},gridTemplateColumns:{},gridTemplateRows:{},gridTemplateAreas:{},gridArea:{},position:{},zIndex:{themeKey:"zIndex"},top:{},right:{},bottom:{},left:{},boxShadow:{themeKey:"shadows"},width:{transform:Fn},maxWidth:{style:q1},minWidth:{transform:Fn},height:{transform:Fn},maxHeight:{transform:Fn},minHeight:{transform:Fn},boxSizing:{},fontFamily:{themeKey:"typography"},fontSize:{themeKey:"typography"},fontStyle:{themeKey:"typography"},fontWeight:{themeKey:"typography"},letterSpacing:{},textTransform:{},lineHeight:{},textAlign:{},typography:{cssProperty:!1,themeKey:"typography"}},Zu=cI;function dI(...e){const t=e.reduce((r,o)=>r.concat(Object.keys(o)),[]),n=new Set(t);return e.every(r=>n.size===Object.keys(r).length)}function fI(e,t){return typeof e=="function"?e(t):e}function v$(){function e(n,r,o,i){const a={[n]:r,theme:o},s=i[n];if(!s)return{[n]:r};const{cssProperty:l=n,themeKey:u,transform:c,style:d}=s;if(r==null)return null;if(u==="typography"&&r==="inherit")return{[n]:r};const f=ms(o,u)||{};return d?d(a):In(a,r,v=>{let y=Tf(f,c,v);return v===y&&typeof v=="string"&&(y=Tf(f,c,`${n}${v==="default"?"":K(v)}`,v)),l===!1?y:{[l]:y}})}function t(n){var r;const{sx:o,theme:i={}}=n||{};if(!o)return null;const a=(r=i.unstable_sxConfig)!=null?r:Zu;function s(l){let u=l;if(typeof l=="function")u=l(i);else if(typeof l!="object")return l;if(!u)return null;const c=p$(i.breakpoints),d=Object.keys(c);let f=c;return Object.keys(u).forEach(h=>{const v=fI(u[h],i);if(v!=null)if(typeof v=="object")if(a[h])f=iu(f,e(h,v,i,a));else{const y=In({theme:i},v,b=>({[h]:b}));dI(y,v)?f[h]=t({sx:v,theme:i}):f=iu(f,y)}else f=iu(f,e(h,v,i,a))}),h$(d,f)}return Array.isArray(o)?o.map(s):s(o)}return t}const g$=v$();g$.filterProps=["sx"];const ec=g$;function y$(e,t){const n=this;return n.vars&&typeof n.getColorSchemeSelector=="function"?{[n.getColorSchemeSelector(e).replace(/(\[[^\]]+\])/,"*:where($1)")]:t}:n.palette.mode===e?t:{}}const pI=["breakpoints","palette","spacing","shape"];function zs(e={},...t){const{breakpoints:n={},palette:r={},spacing:o,shape:i={}}=e,a=Y(e,pI),s=f$(n),l=NO(o);let u=gn({breakpoints:s,direction:"ltr",components:{},palette:E({mode:"light"},r),spacing:l,shape:E({},_O,i)},a);return u.applyStyles=y$,u=t.reduce((c,d)=>gn(c,d),u),u.unstable_sxConfig=E({},Zu,a==null?void 0:a.unstable_sxConfig),u.unstable_sx=function(d){return ec({sx:d,theme:this})},u}const hI=Object.freeze(Object.defineProperty({__proto__:null,default:zs,private_createBreakpoints:f$,unstable_applyStyles:y$},Symbol.toStringTag,{value:"Module"}));function mI(e){return Object.keys(e).length===0}function b$(e=null){const t=x.useContext(Qu);return!t||mI(t)?e:t}const vI=zs();function zp(e=vI){return b$(e)}function gI({styles:e,themeId:t,defaultTheme:n={}}){const r=zp(n),o=typeof e=="function"?e(t&&r[t]||r):e;return _(u$,{styles:o})}const yI=["sx"],bI=e=>{var t,n;const r={systemProps:{},otherProps:{}},o=(t=e==null||(n=e.theme)==null?void 0:n.unstable_sxConfig)!=null?t:Zu;return Object.keys(e).forEach(i=>{o[i]?r.systemProps[i]=e[i]:r.otherProps[i]=e[i]}),r};function tc(e){const{sx:t}=e,n=Y(e,yI),{systemProps:r,otherProps:o}=bI(n);let i;return Array.isArray(t)?i=[r,...t]:typeof t=="function"?i=(...a)=>{const s=t(...a);return lo(s)?E({},r,s):r}:i=E({},r,t),E({},o,{sx:i})}const xI=Object.freeze(Object.defineProperty({__proto__:null,default:ec,extendSxProp:tc,unstable_createStyleFunctionSx:v$,unstable_defaultSxConfig:Zu},Symbol.toStringTag,{value:"Module"})),Z2=e=>e,SI=()=>{let e=Z2;return{configure(t){e=t},generate(t){return e(t)},reset(){e=Z2}}},wI=SI(),Q1=wI;function x$(e){var t,n,r="";if(typeof e=="string"||typeof e=="number")r+=e;else if(typeof e=="object")if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(n=x$(e[t]))&&(r&&(r+=" "),r+=n)}else for(n in e)e[n]&&(r&&(r+=" "),r+=n);return r}function te(){for(var e,t,n=0,r="",o=arguments.length;n<o;n++)(e=arguments[n])&&(t=x$(e))&&(r&&(r+=" "),r+=t);return r}const _I=["className","component"];function EI(e={}){const{themeId:t,defaultTheme:n,defaultClassName:r="MuiBox-root",generateClassName:o}=e,i=V1("div",{shouldForwardProp:s=>s!=="theme"&&s!=="sx"&&s!=="as"})(ec);return x.forwardRef(function(l,u){const c=zp(n),d=tc(l),{className:f,component:h="div"}=d,v=Y(d,_I);return _(i,E({as:h,ref:u,className:te(f,o?o(r):r),theme:t&&c[t]||c},v))})}const CI={active:"active",checked:"checked",completed:"completed",disabled:"disabled",error:"error",expanded:"expanded",focused:"focused",focusVisible:"focusVisible",open:"open",readOnly:"readOnly",required:"required",selected:"selected"};function _e(e,t,n="Mui"){const r=CI[t];return r?`${n}-${r}`:`${Q1.generate(e)}-${t}`}function xe(e,t,n="Mui"){const r={};return t.forEach(o=>{r[o]=_e(e,o,n)}),r}var S$={exports:{}},nt={};/**
 * @license React
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var J1=Symbol.for("react.element"),Z1=Symbol.for("react.portal"),jp=Symbol.for("react.fragment"),Up=Symbol.for("react.strict_mode"),Wp=Symbol.for("react.profiler"),Hp=Symbol.for("react.provider"),Vp=Symbol.for("react.context"),$I=Symbol.for("react.server_context"),Gp=Symbol.for("react.forward_ref"),Kp=Symbol.for("react.suspense"),Xp=Symbol.for("react.suspense_list"),Yp=Symbol.for("react.memo"),qp=Symbol.for("react.lazy"),RI=Symbol.for("react.offscreen"),w$;w$=Symbol.for("react.module.reference");function xr(e){if(typeof e=="object"&&e!==null){var t=e.$$typeof;switch(t){case J1:switch(e=e.type,e){case jp:case Wp:case Up:case Kp:case Xp:return e;default:switch(e=e&&e.$$typeof,e){case $I:case Vp:case Gp:case qp:case Yp:case Hp:return e;default:return t}}case Z1:return t}}}nt.ContextConsumer=Vp;nt.ContextProvider=Hp;nt.Element=J1;nt.ForwardRef=Gp;nt.Fragment=jp;nt.Lazy=qp;nt.Memo=Yp;nt.Portal=Z1;nt.Profiler=Wp;nt.StrictMode=Up;nt.Suspense=Kp;nt.SuspenseList=Xp;nt.isAsyncMode=function(){return!1};nt.isConcurrentMode=function(){return!1};nt.isContextConsumer=function(e){return xr(e)===Vp};nt.isContextProvider=function(e){return xr(e)===Hp};nt.isElement=function(e){return typeof e=="object"&&e!==null&&e.$$typeof===J1};nt.isForwardRef=function(e){return xr(e)===Gp};nt.isFragment=function(e){return xr(e)===jp};nt.isLazy=function(e){return xr(e)===qp};nt.isMemo=function(e){return xr(e)===Yp};nt.isPortal=function(e){return xr(e)===Z1};nt.isProfiler=function(e){return xr(e)===Wp};nt.isStrictMode=function(e){return xr(e)===Up};nt.isSuspense=function(e){return xr(e)===Kp};nt.isSuspenseList=function(e){return xr(e)===Xp};nt.isValidElementType=function(e){return typeof e=="string"||typeof e=="function"||e===jp||e===Wp||e===Up||e===Kp||e===Xp||e===RI||typeof e=="object"&&e!==null&&(e.$$typeof===qp||e.$$typeof===Yp||e.$$typeof===Hp||e.$$typeof===Vp||e.$$typeof===Gp||e.$$typeof===w$||e.getModuleId!==void 0)};nt.typeOf=xr;S$.exports=nt;var ex=S$.exports;const kI=/^\s*function(?:\s|\s*\/\*.*\*\/\s*)+([^(\s/]*)\s*/;function _$(e){const t=`${e}`.match(kI);return t&&t[1]||""}function E$(e,t=""){return e.displayName||e.name||_$(e)||t}function tx(e,t,n){const r=E$(t);return e.displayName||(r!==""?`${n}(${r})`:n)}function PI(e){if(e!=null){if(typeof e=="string")return e;if(typeof e=="function")return E$(e,"Component");if(typeof e=="object")switch(e.$$typeof){case ex.ForwardRef:return tx(e,e.render,"ForwardRef");case ex.Memo:return tx(e,e.type,"memo");default:return}}}const TI=Object.freeze(Object.defineProperty({__proto__:null,default:PI,getFunctionName:_$},Symbol.toStringTag,{value:"Module"})),OI=["ownerState"],II=["variants"],NI=["name","slot","skipVariantsResolver","skipSx","overridesResolver"];function AI(e){return Object.keys(e).length===0}function MI(e){return typeof e=="string"&&e.charCodeAt(0)>96}function Sm(e){return e!=="ownerState"&&e!=="theme"&&e!=="sx"&&e!=="as"}const LI=zs(),FI=e=>e&&e.charAt(0).toLowerCase()+e.slice(1);function Gc({defaultTheme:e,theme:t,themeId:n}){return AI(t)?e:t[n]||t}function DI(e){return e?(t,n)=>n[e]:null}function Hd(e,t){let{ownerState:n}=t,r=Y(t,OI);const o=typeof e=="function"?e(E({ownerState:n},r)):e;if(Array.isArray(o))return o.flatMap(i=>Hd(i,E({ownerState:n},r)));if(o&&typeof o=="object"&&Array.isArray(o.variants)){const{variants:i=[]}=o;let s=Y(o,II);return i.forEach(l=>{let u=!0;typeof l.props=="function"?u=l.props(E({ownerState:n},r,n)):Object.keys(l.props).forEach(c=>{(n==null?void 0:n[c])!==l.props[c]&&r[c]!==l.props[c]&&(u=!1)}),u&&(Array.isArray(s)||(s=[s]),s.push(typeof l.style=="function"?l.style(E({ownerState:n},r,n)):l.style))}),s}return o}function BI(e={}){const{themeId:t,defaultTheme:n=LI,rootShouldForwardProp:r=Sm,slotShouldForwardProp:o=Sm}=e,i=a=>ec(E({},a,{theme:Gc(E({},a,{defaultTheme:n,themeId:t}))}));return i.__mui_systemSx=!0,(a,s={})=>{c$(a,C=>C.filter(S=>!(S!=null&&S.__mui_systemSx)));const{name:l,slot:u,skipVariantsResolver:c,skipSx:d,overridesResolver:f=DI(FI(u))}=s,h=Y(s,NI),v=c!==void 0?c:u&&u!=="Root"&&u!=="root"||!1,y=d||!1;let b,p=Sm;u==="Root"||u==="root"?p=r:u?p=o:MI(a)&&(p=void 0);const m=V1(a,E({shouldForwardProp:p,label:b},h)),g=C=>typeof C=="function"&&C.__emotion_real!==C||lo(C)?S=>Hd(C,E({},S,{theme:Gc({theme:S.theme,defaultTheme:n,themeId:t})})):C,w=(C,...S)=>{let $=g(C);const R=S?S.map(g):[];l&&f&&R.push(N=>{const F=Gc(E({},N,{defaultTheme:n,themeId:t}));if(!F.components||!F.components[l]||!F.components[l].styleOverrides)return null;const L=F.components[l].styleOverrides,D={};return Object.entries(L).forEach(([M,j])=>{D[M]=Hd(j,E({},N,{theme:F}))}),f(N,D)}),l&&!v&&R.push(N=>{var F;const L=Gc(E({},N,{defaultTheme:n,themeId:t})),D=L==null||(F=L.components)==null||(F=F[l])==null?void 0:F.variants;return Hd({variants:D},E({},N,{theme:L}))}),y||R.push(i);const k=R.length-S.length;if(Array.isArray(C)&&k>0){const N=new Array(k).fill("");$=[...C,...N],$.raw=[...C.raw,...N]}const P=m($,...R);return a.muiName&&(P.muiName=a.muiName),P};return m.withConfig&&(w.withConfig=m.withConfig),w}}const zI=BI(),C$=zI;function jI(e){const{theme:t,name:n,props:r}=e;return!t||!t.components||!t.components[n]||!t.components[n].defaultProps?r:ps(t.components[n].defaultProps,r)}function $$({props:e,name:t,defaultTheme:n,themeId:r}){let o=zp(n);return r&&(o=o[r]||o),jI({theme:o,name:t,props:e})}const UI=typeof window<"u"?x.useLayoutEffect:x.useEffect,Ir=UI;function ey(e,t=Number.MIN_SAFE_INTEGER,n=Number.MAX_SAFE_INTEGER){return Math.max(t,Math.min(e,n))}const WI=Object.freeze(Object.defineProperty({__proto__:null,default:ey},Symbol.toStringTag,{value:"Module"}));function HI(e,t=0,n=1){return ey(e,t,n)}function VI(e){e=e.slice(1);const t=new RegExp(`.{1,${e.length>=6?2:1}}`,"g");let n=e.match(t);return n&&n[0].length===1&&(n=n.map(r=>r+r)),n?`rgb${n.length===4?"a":""}(${n.map((r,o)=>o<3?parseInt(r,16):Math.round(parseInt(r,16)/255*1e3)/1e3).join(", ")})`:""}function R$(e){if(e.type)return e;if(e.charAt(0)==="#")return R$(VI(e));const t=e.indexOf("("),n=e.substring(0,t);if(["rgb","rgba","hsl","hsla","color"].indexOf(n)===-1)throw new Error(So(9,e));let r=e.substring(t+1,e.length-1),o;if(n==="color"){if(r=r.split(" "),o=r.shift(),r.length===4&&r[3].charAt(0)==="/"&&(r[3]=r[3].slice(1)),["srgb","display-p3","a98-rgb","prophoto-rgb","rec-2020"].indexOf(o)===-1)throw new Error(So(10,o))}else r=r.split(",");return r=r.map(i=>parseFloat(i)),{type:n,values:r,colorSpace:o}}function GI(e){const{type:t,colorSpace:n}=e;let{values:r}=e;return t.indexOf("rgb")!==-1?r=r.map((o,i)=>i<3?parseInt(o,10):o):t.indexOf("hsl")!==-1&&(r[1]=`${r[1]}%`,r[2]=`${r[2]}%`),t.indexOf("color")!==-1?r=`${n} ${r.join(" ")}`:r=`${r.join(", ")}`,`${t}(${r})`}function Kc(e,t){return e=R$(e),t=HI(t),(e.type==="rgb"||e.type==="hsl")&&(e.type+="a"),e.type==="color"?e.values[3]=`/${t}`:e.values[3]=t,GI(e)}function xv(...e){return e.reduce((t,n)=>n==null?t:function(...o){t.apply(this,o),n.apply(this,o)},()=>{})}function ty(e,t=166){let n;function r(...o){const i=()=>{e.apply(this,o)};clearTimeout(n),n=setTimeout(i,t)}return r.clear=()=>{clearTimeout(n)},r}function KI(e,t){return()=>null}function Vd(e,t){var n,r;return x.isValidElement(e)&&t.indexOf((n=e.type.muiName)!=null?n:(r=e.type)==null||(r=r._payload)==null||(r=r.value)==null?void 0:r.muiName)!==-1}function ln(e){return e&&e.ownerDocument||document}function ai(e){return ln(e).defaultView||window}function XI(e,t){return()=>null}function Of(e,t){typeof e=="function"?e(t):e&&(e.current=t)}let nx=0;function YI(e){const[t,n]=x.useState(e),r=e||t;return x.useEffect(()=>{t==null&&(nx+=1,n(`mui-${nx}`))},[t]),r}const rx=rf["useId".toString()];function js(e){if(rx!==void 0){const t=rx();return e??t}return YI(e)}function qI(e,t,n,r,o){return null}function vs({controlled:e,default:t,name:n,state:r="value"}){const{current:o}=x.useRef(e!==void 0),[i,a]=x.useState(t),s=o?e:i,l=x.useCallback(u=>{o||a(u)},[]);return[s,l]}function fo(e){const t=x.useRef(e);return Ir(()=>{t.current=e}),x.useRef((...n)=>(0,t.current)(...n)).current}function Tt(...e){return x.useMemo(()=>e.every(t=>t==null)?null:t=>{e.forEach(n=>{Of(n,t)})},e)}const ox={};function QI(e,t){const n=x.useRef(ox);return n.current===ox&&(n.current=e(t)),n}const JI=[];function ZI(e){x.useEffect(e,JI)}class nc{constructor(){this.currentId=null,this.clear=()=>{this.currentId!==null&&(clearTimeout(this.currentId),this.currentId=null)},this.disposeEffect=()=>this.clear}static create(){return new nc}start(t,n){this.clear(),this.currentId=setTimeout(()=>{this.currentId=null,n()},t)}}function Ii(){const e=QI(nc.create).current;return ZI(e.disposeEffect),e}let Qp=!0,Sv=!1;const eN=new nc,tN={text:!0,search:!0,url:!0,tel:!0,email:!0,password:!0,number:!0,date:!0,month:!0,week:!0,time:!0,datetime:!0,"datetime-local":!0};function nN(e){const{type:t,tagName:n}=e;return!!(n==="INPUT"&&tN[t]&&!e.readOnly||n==="TEXTAREA"&&!e.readOnly||e.isContentEditable)}function rN(e){e.metaKey||e.altKey||e.ctrlKey||(Qp=!0)}function wm(){Qp=!1}function oN(){this.visibilityState==="hidden"&&Sv&&(Qp=!0)}function iN(e){e.addEventListener("keydown",rN,!0),e.addEventListener("mousedown",wm,!0),e.addEventListener("pointerdown",wm,!0),e.addEventListener("touchstart",wm,!0),e.addEventListener("visibilitychange",oN,!0)}function aN(e){const{target:t}=e;try{return t.matches(":focus-visible")}catch{}return Qp||nN(t)}function rc(){const e=x.useCallback(o=>{o!=null&&iN(o.ownerDocument)},[]),t=x.useRef(!1);function n(){return t.current?(Sv=!0,eN.start(100,()=>{Sv=!1}),t.current=!1,!0):!1}function r(o){return aN(o)?(t.current=!0,!0):!1}return{isFocusVisibleRef:t,onFocus:r,onBlur:n,ref:e}}function k$(e){const t=e.documentElement.clientWidth;return Math.abs(window.innerWidth-t)}function P$(e){return x.Children.toArray(e).filter(t=>x.isValidElement(t))}const sN={border:0,clip:"rect(0 0 0 0)",height:"1px",margin:"-1px",overflow:"hidden",padding:0,position:"absolute",whiteSpace:"nowrap",width:"1px"},lN=sN;function Ce(e,t,n=void 0){const r={};return Object.keys(e).forEach(o=>{r[o]=e[o].reduce((i,a)=>{if(a){const s=t(a);s!==""&&i.push(s),n&&n[a]&&i.push(n[a])}return i},[]).join(" ")}),r}function If(e){return typeof e=="string"}function Wl(e,t,n){return e===void 0||If(e)?t:E({},t,{ownerState:E({},t.ownerState,n)})}function T$(e,t=[]){if(e===void 0)return{};const n={};return Object.keys(e).filter(r=>r.match(/^on[A-Z]/)&&typeof e[r]=="function"&&!t.includes(r)).forEach(r=>{n[r]=e[r]}),n}function ix(e){if(e===void 0)return{};const t={};return Object.keys(e).filter(n=>!(n.match(/^on[A-Z]/)&&typeof e[n]=="function")).forEach(n=>{t[n]=e[n]}),t}function uN(e){const{getSlotProps:t,additionalProps:n,externalSlotProps:r,externalForwardedProps:o,className:i}=e;if(!t){const h=te(n==null?void 0:n.className,i,o==null?void 0:o.className,r==null?void 0:r.className),v=E({},n==null?void 0:n.style,o==null?void 0:o.style,r==null?void 0:r.style),y=E({},n,o,r);return h.length>0&&(y.className=h),Object.keys(v).length>0&&(y.style=v),{props:y,internalRef:void 0}}const a=T$(E({},o,r)),s=ix(r),l=ix(o),u=t(a),c=te(u==null?void 0:u.className,n==null?void 0:n.className,i,o==null?void 0:o.className,r==null?void 0:r.className),d=E({},u==null?void 0:u.style,n==null?void 0:n.style,o==null?void 0:o.style,r==null?void 0:r.style),f=E({},u,n,l,s);return c.length>0&&(f.className=c),Object.keys(d).length>0&&(f.style=d),{props:f,internalRef:u.ref}}function cN(e,t,n){return typeof e=="function"?e(t,n):e}const dN=["elementType","externalSlotProps","ownerState","skipResolvingSlotProps"];function qi(e){var t;const{elementType:n,externalSlotProps:r,ownerState:o,skipResolvingSlotProps:i=!1}=e,a=Y(e,dN),s=i?{}:cN(r,o),{props:l,internalRef:u}=uN(E({},a,{externalSlotProps:s})),c=Tt(u,s==null?void 0:s.ref,(t=e.additionalProps)==null?void 0:t.ref);return Wl(n,E({},l,{ref:c}),o)}const fN=x.createContext(null),O$=fN;function I$(){return x.useContext(O$)}const pN=typeof Symbol=="function"&&Symbol.for,hN=pN?Symbol.for("mui.nested"):"__THEME_NESTED__";function mN(e,t){return typeof t=="function"?t(e):E({},e,t)}function vN(e){const{children:t,theme:n}=e,r=I$(),o=x.useMemo(()=>{const i=r===null?n:mN(r,n);return i!=null&&(i[hN]=r!==null),i},[n,r]);return _(O$.Provider,{value:o,children:t})}const gN=["value"],N$=x.createContext();function yN(e){let{value:t}=e,n=Y(e,gN);return _(N$.Provider,E({value:t??!0},n))}const ny=()=>{const e=x.useContext(N$);return e??!1},ax={};function sx(e,t,n,r=!1){return x.useMemo(()=>{const o=e&&t[e]||t;if(typeof n=="function"){const i=n(o),a=e?E({},t,{[e]:i}):i;return r?()=>a:a}return e?E({},t,{[e]:n}):E({},t,n)},[e,t,n,r])}function bN(e){const{children:t,theme:n,themeId:r}=e,o=b$(ax),i=I$()||ax,a=sx(r,o,n),s=sx(r,i,n,!0),l=a.direction==="rtl";return _(vN,{theme:s,children:_(Qu.Provider,{value:a,children:_(yN,{value:l,children:_(lT,{value:a==null?void 0:a.components,children:t})})})})}const xN=["className","component","disableGutters","fixed","maxWidth","classes"],SN=zs(),wN=C$("div",{name:"MuiContainer",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[`maxWidth${K(String(n.maxWidth))}`],n.fixed&&t.fixed,n.disableGutters&&t.disableGutters]}}),_N=e=>$$({props:e,name:"MuiContainer",defaultTheme:SN}),EN=(e,t)=>{const n=l=>_e(t,l),{classes:r,fixed:o,disableGutters:i,maxWidth:a}=e,s={root:["root",a&&`maxWidth${K(String(a))}`,o&&"fixed",i&&"disableGutters"]};return Ce(s,n,r)};function CN(e={}){const{createStyledComponent:t=wN,useThemeProps:n=_N,componentName:r="MuiContainer"}=e,o=t(({theme:a,ownerState:s})=>E({width:"100%",marginLeft:"auto",boxSizing:"border-box",marginRight:"auto",display:"block"},!s.disableGutters&&{paddingLeft:a.spacing(2),paddingRight:a.spacing(2),[a.breakpoints.up("sm")]:{paddingLeft:a.spacing(3),paddingRight:a.spacing(3)}}),({theme:a,ownerState:s})=>s.fixed&&Object.keys(a.breakpoints.values).reduce((l,u)=>{const c=u,d=a.breakpoints.values[c];return d!==0&&(l[a.breakpoints.up(c)]={maxWidth:`${d}${a.breakpoints.unit}`}),l},{}),({theme:a,ownerState:s})=>E({},s.maxWidth==="xs"&&{[a.breakpoints.up("xs")]:{maxWidth:Math.max(a.breakpoints.values.xs,444)}},s.maxWidth&&s.maxWidth!=="xs"&&{[a.breakpoints.up(s.maxWidth)]:{maxWidth:`${a.breakpoints.values[s.maxWidth]}${a.breakpoints.unit}`}}));return x.forwardRef(function(s,l){const u=n(s),{className:c,component:d="div",disableGutters:f=!1,fixed:h=!1,maxWidth:v="lg"}=u,y=Y(u,xN),b=E({},u,{component:d,disableGutters:f,fixed:h,maxWidth:v}),p=EN(b,r);return _(o,E({as:d,ownerState:b,className:te(p.root,c),ref:l},y))})}const $N=["component","direction","spacing","divider","children","className","useFlexGap"],RN=zs(),kN=C$("div",{name:"MuiStack",slot:"Root",overridesResolver:(e,t)=>t.root});function PN(e){return $$({props:e,name:"MuiStack",defaultTheme:RN})}function TN(e,t){const n=x.Children.toArray(e).filter(Boolean);return n.reduce((r,o,i)=>(r.push(o),i<n.length-1&&r.push(x.cloneElement(t,{key:`separator-${i}`})),r),[])}const ON=e=>({row:"Left","row-reverse":"Right",column:"Top","column-reverse":"Bottom"})[e],IN=({ownerState:e,theme:t})=>{let n=E({display:"flex",flexDirection:"column"},In({theme:t},Bi({values:e.direction,breakpoints:t.breakpoints.values}),r=>({flexDirection:r})));if(e.spacing){const r=Y1(t),o=Object.keys(t.breakpoints.values).reduce((l,u)=>((typeof e.spacing=="object"&&e.spacing[u]!=null||typeof e.direction=="object"&&e.direction[u]!=null)&&(l[u]=!0),l),{}),i=Bi({values:e.direction,base:o}),a=Bi({values:e.spacing,base:o});typeof i=="object"&&Object.keys(i).forEach((l,u,c)=>{if(!i[l]){const f=u>0?i[c[u-1]]:"column";i[l]=f}}),n=gn(n,In({theme:t},a,(l,u)=>e.useFlexGap?{gap:Yi(r,l)}:{"& > :not(style):not(style)":{margin:0},"& > :not(style) ~ :not(style)":{[`margin${ON(u?i[u]:e.direction)}`]:Yi(r,l)}}))}return n=EO(t.breakpoints,n),n};function NN(e={}){const{createStyledComponent:t=kN,useThemeProps:n=PN,componentName:r="MuiStack"}=e,o=()=>Ce({root:["root"]},l=>_e(r,l),{}),i=t(IN);return x.forwardRef(function(l,u){const c=n(l),d=tc(c),{component:f="div",direction:h="column",spacing:v=0,divider:y,children:b,className:p,useFlexGap:m=!1}=d,g=Y(d,$N),w={direction:h,spacing:v,useFlexGap:m},C=o();return _(i,E({as:f,ownerState:w,ref:u,className:te(C.root,p)},g,{children:y?TN(b,y):b}))})}function AN(e,t){return E({toolbar:{minHeight:56,[e.up("xs")]:{"@media (orientation: landscape)":{minHeight:48}},[e.up("sm")]:{minHeight:64}}},t)}var Mt={},A$={exports:{}};(function(e){function t(n){return n&&n.__esModule?n:{default:n}}e.exports=t,e.exports.__esModule=!0,e.exports.default=e.exports})(A$);var xn=A$.exports;const MN=Jr(dT),LN=Jr(WI);var M$=xn;Object.defineProperty(Mt,"__esModule",{value:!0});var Nt=Mt.alpha=j$;Mt.blend=KN;Mt.colorChannel=void 0;var L$=Mt.darken=oy;Mt.decomposeColor=mr;Mt.emphasize=U$;var FN=Mt.getContrastRatio=UN;Mt.getLuminance=Nf;Mt.hexToRgb=D$;Mt.hslToRgb=z$;var F$=Mt.lighten=iy;Mt.private_safeAlpha=WN;Mt.private_safeColorChannel=void 0;Mt.private_safeDarken=HN;Mt.private_safeEmphasize=GN;Mt.private_safeLighten=VN;Mt.recomposeColor=Us;Mt.rgbToHex=jN;var lx=M$(MN),DN=M$(LN);function ry(e,t=0,n=1){return(0,DN.default)(e,t,n)}function D$(e){e=e.slice(1);const t=new RegExp(`.{1,${e.length>=6?2:1}}`,"g");let n=e.match(t);return n&&n[0].length===1&&(n=n.map(r=>r+r)),n?`rgb${n.length===4?"a":""}(${n.map((r,o)=>o<3?parseInt(r,16):Math.round(parseInt(r,16)/255*1e3)/1e3).join(", ")})`:""}function BN(e){const t=e.toString(16);return t.length===1?`0${t}`:t}function mr(e){if(e.type)return e;if(e.charAt(0)==="#")return mr(D$(e));const t=e.indexOf("("),n=e.substring(0,t);if(["rgb","rgba","hsl","hsla","color"].indexOf(n)===-1)throw new Error((0,lx.default)(9,e));let r=e.substring(t+1,e.length-1),o;if(n==="color"){if(r=r.split(" "),o=r.shift(),r.length===4&&r[3].charAt(0)==="/"&&(r[3]=r[3].slice(1)),["srgb","display-p3","a98-rgb","prophoto-rgb","rec-2020"].indexOf(o)===-1)throw new Error((0,lx.default)(10,o))}else r=r.split(",");return r=r.map(i=>parseFloat(i)),{type:n,values:r,colorSpace:o}}const B$=e=>{const t=mr(e);return t.values.slice(0,3).map((n,r)=>t.type.indexOf("hsl")!==-1&&r!==0?`${n}%`:n).join(" ")};Mt.colorChannel=B$;const zN=(e,t)=>{try{return B$(e)}catch{return e}};Mt.private_safeColorChannel=zN;function Us(e){const{type:t,colorSpace:n}=e;let{values:r}=e;return t.indexOf("rgb")!==-1?r=r.map((o,i)=>i<3?parseInt(o,10):o):t.indexOf("hsl")!==-1&&(r[1]=`${r[1]}%`,r[2]=`${r[2]}%`),t.indexOf("color")!==-1?r=`${n} ${r.join(" ")}`:r=`${r.join(", ")}`,`${t}(${r})`}function jN(e){if(e.indexOf("#")===0)return e;const{values:t}=mr(e);return`#${t.map((n,r)=>BN(r===3?Math.round(255*n):n)).join("")}`}function z$(e){e=mr(e);const{values:t}=e,n=t[0],r=t[1]/100,o=t[2]/100,i=r*Math.min(o,1-o),a=(u,c=(u+n/30)%12)=>o-i*Math.max(Math.min(c-3,9-c,1),-1);let s="rgb";const l=[Math.round(a(0)*255),Math.round(a(8)*255),Math.round(a(4)*255)];return e.type==="hsla"&&(s+="a",l.push(t[3])),Us({type:s,values:l})}function Nf(e){e=mr(e);let t=e.type==="hsl"||e.type==="hsla"?mr(z$(e)).values:e.values;return t=t.map(n=>(e.type!=="color"&&(n/=255),n<=.03928?n/12.92:((n+.055)/1.055)**2.4)),Number((.2126*t[0]+.7152*t[1]+.0722*t[2]).toFixed(3))}function UN(e,t){const n=Nf(e),r=Nf(t);return(Math.max(n,r)+.05)/(Math.min(n,r)+.05)}function j$(e,t){return e=mr(e),t=ry(t),(e.type==="rgb"||e.type==="hsl")&&(e.type+="a"),e.type==="color"?e.values[3]=`/${t}`:e.values[3]=t,Us(e)}function WN(e,t,n){try{return j$(e,t)}catch{return e}}function oy(e,t){if(e=mr(e),t=ry(t),e.type.indexOf("hsl")!==-1)e.values[2]*=1-t;else if(e.type.indexOf("rgb")!==-1||e.type.indexOf("color")!==-1)for(let n=0;n<3;n+=1)e.values[n]*=1-t;return Us(e)}function HN(e,t,n){try{return oy(e,t)}catch{return e}}function iy(e,t){if(e=mr(e),t=ry(t),e.type.indexOf("hsl")!==-1)e.values[2]+=(100-e.values[2])*t;else if(e.type.indexOf("rgb")!==-1)for(let n=0;n<3;n+=1)e.values[n]+=(255-e.values[n])*t;else if(e.type.indexOf("color")!==-1)for(let n=0;n<3;n+=1)e.values[n]+=(1-e.values[n])*t;return Us(e)}function VN(e,t,n){try{return iy(e,t)}catch{return e}}function U$(e,t=.15){return Nf(e)>.5?oy(e,t):iy(e,t)}function GN(e,t,n){try{return U$(e,t)}catch{return e}}function KN(e,t,n,r=1){const o=(l,u)=>Math.round((l**(1/r)*(1-n)+u**(1/r)*n)**r),i=mr(e),a=mr(t),s=[o(i.values[0],a.values[0]),o(i.values[1],a.values[1]),o(i.values[2],a.values[2])];return Us({type:"rgb",values:s})}const XN={black:"#000",white:"#fff"},Au=XN,YN={50:"#fafafa",100:"#f5f5f5",200:"#eeeeee",300:"#e0e0e0",400:"#bdbdbd",500:"#9e9e9e",600:"#757575",700:"#616161",800:"#424242",900:"#212121",A100:"#f5f5f5",A200:"#eeeeee",A400:"#bdbdbd",A700:"#616161"},Gd=YN,qN={50:"#f3e5f5",100:"#e1bee7",200:"#ce93d8",300:"#ba68c8",400:"#ab47bc",500:"#9c27b0",600:"#8e24aa",700:"#7b1fa2",800:"#6a1b9a",900:"#4a148c",A100:"#ea80fc",A200:"#e040fb",A400:"#d500f9",A700:"#aa00ff"},xa=qN,QN={50:"#ffebee",100:"#ffcdd2",200:"#ef9a9a",300:"#e57373",400:"#ef5350",500:"#f44336",600:"#e53935",700:"#d32f2f",800:"#c62828",900:"#b71c1c",A100:"#ff8a80",A200:"#ff5252",A400:"#ff1744",A700:"#d50000"},Sa=QN,JN={50:"#fff3e0",100:"#ffe0b2",200:"#ffcc80",300:"#ffb74d",400:"#ffa726",500:"#ff9800",600:"#fb8c00",700:"#f57c00",800:"#ef6c00",900:"#e65100",A100:"#ffd180",A200:"#ffab40",A400:"#ff9100",A700:"#ff6d00"},ml=JN,ZN={50:"#e3f2fd",100:"#bbdefb",200:"#90caf9",300:"#64b5f6",400:"#42a5f5",500:"#2196f3",600:"#1e88e5",700:"#1976d2",800:"#1565c0",900:"#0d47a1",A100:"#82b1ff",A200:"#448aff",A400:"#2979ff",A700:"#2962ff"},wa=ZN,eA={50:"#e1f5fe",100:"#b3e5fc",200:"#81d4fa",300:"#4fc3f7",400:"#29b6f6",500:"#03a9f4",600:"#039be5",700:"#0288d1",800:"#0277bd",900:"#01579b",A100:"#80d8ff",A200:"#40c4ff",A400:"#00b0ff",A700:"#0091ea"},_a=eA,tA={50:"#e8f5e9",100:"#c8e6c9",200:"#a5d6a7",300:"#81c784",400:"#66bb6a",500:"#4caf50",600:"#43a047",700:"#388e3c",800:"#2e7d32",900:"#1b5e20",A100:"#b9f6ca",A200:"#69f0ae",A400:"#00e676",A700:"#00c853"},Ea=tA,nA=["mode","contrastThreshold","tonalOffset"],ux={text:{primary:"rgba(0, 0, 0, 0.87)",secondary:"rgba(0, 0, 0, 0.6)",disabled:"rgba(0, 0, 0, 0.38)"},divider:"rgba(0, 0, 0, 0.12)",background:{paper:Au.white,default:Au.white},action:{active:"rgba(0, 0, 0, 0.54)",hover:"rgba(0, 0, 0, 0.04)",hoverOpacity:.04,selected:"rgba(0, 0, 0, 0.08)",selectedOpacity:.08,disabled:"rgba(0, 0, 0, 0.26)",disabledBackground:"rgba(0, 0, 0, 0.12)",disabledOpacity:.38,focus:"rgba(0, 0, 0, 0.12)",focusOpacity:.12,activatedOpacity:.12}},_m={text:{primary:Au.white,secondary:"rgba(255, 255, 255, 0.7)",disabled:"rgba(255, 255, 255, 0.5)",icon:"rgba(255, 255, 255, 0.5)"},divider:"rgba(255, 255, 255, 0.12)",background:{paper:"#121212",default:"#121212"},action:{active:Au.white,hover:"rgba(255, 255, 255, 0.08)",hoverOpacity:.08,selected:"rgba(255, 255, 255, 0.16)",selectedOpacity:.16,disabled:"rgba(255, 255, 255, 0.3)",disabledBackground:"rgba(255, 255, 255, 0.12)",disabledOpacity:.38,focus:"rgba(255, 255, 255, 0.12)",focusOpacity:.12,activatedOpacity:.24}};function cx(e,t,n,r){const o=r.light||r,i=r.dark||r*1.5;e[t]||(e.hasOwnProperty(n)?e[t]=e[n]:t==="light"?e.light=F$(e.main,o):t==="dark"&&(e.dark=L$(e.main,i)))}function rA(e="light"){return e==="dark"?{main:wa[200],light:wa[50],dark:wa[400]}:{main:wa[700],light:wa[400],dark:wa[800]}}function oA(e="light"){return e==="dark"?{main:xa[200],light:xa[50],dark:xa[400]}:{main:xa[500],light:xa[300],dark:xa[700]}}function iA(e="light"){return e==="dark"?{main:Sa[500],light:Sa[300],dark:Sa[700]}:{main:Sa[700],light:Sa[400],dark:Sa[800]}}function aA(e="light"){return e==="dark"?{main:_a[400],light:_a[300],dark:_a[700]}:{main:_a[700],light:_a[500],dark:_a[900]}}function sA(e="light"){return e==="dark"?{main:Ea[400],light:Ea[300],dark:Ea[700]}:{main:Ea[800],light:Ea[500],dark:Ea[900]}}function lA(e="light"){return e==="dark"?{main:ml[400],light:ml[300],dark:ml[700]}:{main:"#ed6c02",light:ml[500],dark:ml[900]}}function uA(e){const{mode:t="light",contrastThreshold:n=3,tonalOffset:r=.2}=e,o=Y(e,nA),i=e.primary||rA(t),a=e.secondary||oA(t),s=e.error||iA(t),l=e.info||aA(t),u=e.success||sA(t),c=e.warning||lA(t);function d(y){return FN(y,_m.text.primary)>=n?_m.text.primary:ux.text.primary}const f=({color:y,name:b,mainShade:p=500,lightShade:m=300,darkShade:g=700})=>{if(y=E({},y),!y.main&&y[p]&&(y.main=y[p]),!y.hasOwnProperty("main"))throw new Error(So(11,b?` (${b})`:"",p));if(typeof y.main!="string")throw new Error(So(12,b?` (${b})`:"",JSON.stringify(y.main)));return cx(y,"light",m,r),cx(y,"dark",g,r),y.contrastText||(y.contrastText=d(y.main)),y},h={dark:_m,light:ux};return gn(E({common:E({},Au),mode:t,primary:f({color:i,name:"primary"}),secondary:f({color:a,name:"secondary",mainShade:"A400",lightShade:"A200",darkShade:"A700"}),error:f({color:s,name:"error"}),warning:f({color:c,name:"warning"}),info:f({color:l,name:"info"}),success:f({color:u,name:"success"}),grey:Gd,contrastThreshold:n,getContrastText:d,augmentColor:f,tonalOffset:r},h[t]),o)}const cA=["fontFamily","fontSize","fontWeightLight","fontWeightRegular","fontWeightMedium","fontWeightBold","htmlFontSize","allVariants","pxToRem"];function dA(e){return Math.round(e*1e5)/1e5}const dx={textTransform:"uppercase"},fx='"Roboto", "Helvetica", "Arial", sans-serif';function fA(e,t){const n=typeof t=="function"?t(e):t,{fontFamily:r=fx,fontSize:o=14,fontWeightLight:i=300,fontWeightRegular:a=400,fontWeightMedium:s=500,fontWeightBold:l=700,htmlFontSize:u=16,allVariants:c,pxToRem:d}=n,f=Y(n,cA),h=o/14,v=d||(p=>`${p/u*h}rem`),y=(p,m,g,w,C)=>E({fontFamily:r,fontWeight:p,fontSize:v(m),lineHeight:g},r===fx?{letterSpacing:`${dA(w/m)}em`}:{},C,c),b={h1:y(i,96,1.167,-1.5),h2:y(i,60,1.2,-.5),h3:y(a,48,1.167,0),h4:y(a,34,1.235,.25),h5:y(a,24,1.334,0),h6:y(s,20,1.6,.15),subtitle1:y(a,16,1.75,.15),subtitle2:y(s,14,1.57,.1),body1:y(a,16,1.5,.15),body2:y(a,14,1.43,.15),button:y(s,14,1.75,.4,dx),caption:y(a,12,1.66,.4),overline:y(a,12,2.66,1,dx),inherit:{fontFamily:"inherit",fontWeight:"inherit",fontSize:"inherit",lineHeight:"inherit",letterSpacing:"inherit"}};return gn(E({htmlFontSize:u,pxToRem:v,fontFamily:r,fontSize:o,fontWeightLight:i,fontWeightRegular:a,fontWeightMedium:s,fontWeightBold:l},b),f,{clone:!1})}const pA=.2,hA=.14,mA=.12;function vt(...e){return[`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${pA})`,`${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${hA})`,`${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${mA})`].join(",")}const vA=["none",vt(0,2,1,-1,0,1,1,0,0,1,3,0),vt(0,3,1,-2,0,2,2,0,0,1,5,0),vt(0,3,3,-2,0,3,4,0,0,1,8,0),vt(0,2,4,-1,0,4,5,0,0,1,10,0),vt(0,3,5,-1,0,5,8,0,0,1,14,0),vt(0,3,5,-1,0,6,10,0,0,1,18,0),vt(0,4,5,-2,0,7,10,1,0,2,16,1),vt(0,5,5,-3,0,8,10,1,0,3,14,2),vt(0,5,6,-3,0,9,12,1,0,3,16,2),vt(0,6,6,-3,0,10,14,1,0,4,18,3),vt(0,6,7,-4,0,11,15,1,0,4,20,3),vt(0,7,8,-4,0,12,17,2,0,5,22,4),vt(0,7,8,-4,0,13,19,2,0,5,24,4),vt(0,7,9,-4,0,14,21,2,0,5,26,4),vt(0,8,9,-5,0,15,22,2,0,6,28,5),vt(0,8,10,-5,0,16,24,2,0,6,30,5),vt(0,8,11,-5,0,17,26,2,0,6,32,5),vt(0,9,11,-5,0,18,28,2,0,7,34,6),vt(0,9,12,-6,0,19,29,2,0,7,36,6),vt(0,10,13,-6,0,20,31,3,0,8,38,7),vt(0,10,13,-6,0,21,33,3,0,8,40,7),vt(0,10,14,-6,0,22,35,3,0,8,42,7),vt(0,11,14,-7,0,23,36,3,0,9,44,8),vt(0,11,15,-7,0,24,38,3,0,9,46,8)],gA=vA,yA=["duration","easing","delay"],bA={easeInOut:"cubic-bezier(0.4, 0, 0.2, 1)",easeOut:"cubic-bezier(0.0, 0, 0.2, 1)",easeIn:"cubic-bezier(0.4, 0, 1, 1)",sharp:"cubic-bezier(0.4, 0, 0.6, 1)"},W$={shortest:150,shorter:200,short:250,standard:300,complex:375,enteringScreen:225,leavingScreen:195};function px(e){return`${Math.round(e)}ms`}function xA(e){if(!e)return 0;const t=e/36;return Math.round((4+15*t**.25+t/5)*10)}function SA(e){const t=E({},bA,e.easing),n=E({},W$,e.duration);return E({getAutoHeightDuration:xA,create:(o=["all"],i={})=>{const{duration:a=n.standard,easing:s=t.easeInOut,delay:l=0}=i;return Y(i,yA),(Array.isArray(o)?o:[o]).map(u=>`${u} ${typeof a=="string"?a:px(a)} ${s} ${typeof l=="string"?l:px(l)}`).join(",")}},e,{easing:t,duration:n})}const wA={mobileStepper:1e3,fab:1050,speedDial:1050,appBar:1100,drawer:1200,modal:1300,snackbar:1400,tooltip:1500},_A=wA,EA=["breakpoints","mixins","spacing","palette","transitions","typography","shape"];function Af(e={},...t){const{mixins:n={},palette:r={},transitions:o={},typography:i={}}=e,a=Y(e,EA);if(e.vars)throw new Error(So(18));const s=uA(r),l=zs(e);let u=gn(l,{mixins:AN(l.breakpoints,n),palette:s,shadows:gA.slice(),typography:fA(s,i),transitions:SA(o),zIndex:E({},_A)});return u=gn(u,a),u=t.reduce((c,d)=>gn(c,d),u),u.unstable_sxConfig=E({},Zu,a==null?void 0:a.unstable_sxConfig),u.unstable_sx=function(d){return ec({sx:d,theme:this})},u}const CA=Af(),ay=CA,gs="$$material";function H$(e){return _(gI,E({},e,{defaultTheme:ay,themeId:gs}))}const $A=(e,t)=>E({WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale",boxSizing:"border-box",WebkitTextSizeAdjust:"100%"},t&&!e.vars&&{colorScheme:e.palette.mode}),RA=e=>E({color:(e.vars||e).palette.text.primary},e.typography.body1,{backgroundColor:(e.vars||e).palette.background.default,"@media print":{backgroundColor:(e.vars||e).palette.common.white}}),kA=(e,t=!1)=>{var n;const r={};t&&e.colorSchemes&&Object.entries(e.colorSchemes).forEach(([a,s])=>{var l;r[e.getColorSchemeSelector(a).replace(/\s*&/,"")]={colorScheme:(l=s.palette)==null?void 0:l.mode}});let o=E({html:$A(e,t),"*, *::before, *::after":{boxSizing:"inherit"},"strong, b":{fontWeight:e.typography.fontWeightBold},body:E({margin:0},RA(e),{"&::backdrop":{backgroundColor:(e.vars||e).palette.background.default}})},r);const i=(n=e.components)==null||(n=n.MuiCssBaseline)==null?void 0:n.styleOverrides;return i&&(o=[o,i]),o};function PA(e){const t=Ee({props:e,name:"MuiCssBaseline"}),{children:n,enableColorScheme:r=!1}=t;return G(x.Fragment,{children:[_(H$,{styles:o=>kA(o,r)}),n]})}const TA={"@@functional/placeholder":!0};function pt(e){return e!=null&&typeof e=="object"&&e["@@functional/placeholder"]===!0}function Wt(e){return function t(n){return arguments.length===0||pt(n)?t:e.apply(this,arguments)}}function wt(e){return function t(n,r){switch(arguments.length){case 0:return t;case 1:return pt(n)?t:Wt(function(o){return e(n,o)});default:return pt(n)&&pt(r)?t:pt(n)?Wt(function(o){return e(o,r)}):pt(r)?Wt(function(o){return e(n,o)}):e(n,r)}}}var OA=wt(function(t,n){return Number(t)+Number(n)});const IA=OA;function V$(e,t){e=e||[],t=t||[];var n,r=e.length,o=t.length,i=[];for(n=0;n<r;)i[i.length]=e[n],n+=1;for(n=0;n<o;)i[i.length]=t[n],n+=1;return i}function Jp(e,t){switch(e){case 0:return function(){return t.apply(this,arguments)};case 1:return function(n){return t.apply(this,arguments)};case 2:return function(n,r){return t.apply(this,arguments)};case 3:return function(n,r,o){return t.apply(this,arguments)};case 4:return function(n,r,o,i){return t.apply(this,arguments)};case 5:return function(n,r,o,i,a){return t.apply(this,arguments)};case 6:return function(n,r,o,i,a,s){return t.apply(this,arguments)};case 7:return function(n,r,o,i,a,s,l){return t.apply(this,arguments)};case 8:return function(n,r,o,i,a,s,l,u){return t.apply(this,arguments)};case 9:return function(n,r,o,i,a,s,l,u,c){return t.apply(this,arguments)};case 10:return function(n,r,o,i,a,s,l,u,c,d){return t.apply(this,arguments)};default:throw new Error("First argument to _arity must be a non-negative integer no greater than ten")}}function G$(e,t,n){return function(){for(var r=[],o=0,i=e,a=0,s=!1;a<t.length||o<arguments.length;){var l;a<t.length&&(!pt(t[a])||o>=arguments.length)?l=t[a]:(l=arguments[o],o+=1),r[a]=l,pt(l)?s=!0:i-=1,a+=1}return!s&&i<=0?n.apply(this,r):Jp(Math.max(0,i),G$(e,r,n))}}var NA=wt(function(t,n){return t===1?Wt(n):Jp(t,G$(t,[],n))});const sy=NA;function Sr(e){return function t(n,r,o){switch(arguments.length){case 0:return t;case 1:return pt(n)?t:wt(function(i,a){return e(n,i,a)});case 2:return pt(n)&&pt(r)?t:pt(n)?wt(function(i,a){return e(i,r,a)}):pt(r)?wt(function(i,a){return e(n,i,a)}):Wt(function(i){return e(n,r,i)});default:return pt(n)&&pt(r)&&pt(o)?t:pt(n)&&pt(r)?wt(function(i,a){return e(i,a,o)}):pt(n)&&pt(o)?wt(function(i,a){return e(i,r,a)}):pt(r)&&pt(o)?wt(function(i,a){return e(n,i,a)}):pt(n)?Wt(function(i){return e(i,r,o)}):pt(r)?Wt(function(i){return e(n,i,o)}):pt(o)?Wt(function(i){return e(n,r,i)}):e(n,r,o)}}}var AA=Sr(function(t,n,r){var o=r.length;if(t>=o||t<-o)return r;var i=(o+t)%o,a=V$(r);return a[i]=n(r[i]),a});const MA=AA,ys=Array.isArray||function(t){return t!=null&&t.length>=0&&Object.prototype.toString.call(t)==="[object Array]"};function LA(e){return e!=null&&typeof e["@@transducer/step"]=="function"}function Zp(e,t,n){return function(){if(arguments.length===0)return n();var r=arguments[arguments.length-1];if(!ys(r)){for(var o=0;o<e.length;){if(typeof r[e[o]]=="function")return r[e[o]].apply(r,Array.prototype.slice.call(arguments,0,-1));o+=1}if(LA(r)){var i=t.apply(null,Array.prototype.slice.call(arguments,0,-1));return i(r)}}return n.apply(this,arguments)}}function K$(e){return e&&e["@@transducer/reduced"]?e:{"@@transducer/value":e,"@@transducer/reduced":!0}}const bs={init:function(){return this.xf["@@transducer/init"]()},result:function(e){return this.xf["@@transducer/result"](e)}};function hx(e){for(var t=[],n;!(n=e.next()).done;)t.push(n.value);return t}function mx(e,t,n){for(var r=0,o=n.length;r<o;){if(e(t,n[r]))return!0;r+=1}return!1}function FA(e){var t=String(e).match(/^function (\w*)/);return t==null?"":t[1]}function Mu(e,t){return Object.prototype.hasOwnProperty.call(t,e)}function DA(e,t){return e===t?e!==0||1/e===1/t:e!==e&&t!==t}const Em=typeof Object.is=="function"?Object.is:DA;var vx=Object.prototype.toString,BA=function(){return vx.call(arguments)==="[object Arguments]"?function(t){return vx.call(t)==="[object Arguments]"}:function(t){return Mu("callee",t)}}();const zA=BA;var jA=!{toString:null}.propertyIsEnumerable("toString"),gx=["constructor","valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],yx=function(){return arguments.propertyIsEnumerable("length")}(),UA=function(t,n){for(var r=0;r<t.length;){if(t[r]===n)return!0;r+=1}return!1},WA=Wt(typeof Object.keys=="function"&&!yx?function(t){return Object(t)!==t?[]:Object.keys(t)}:function(t){if(Object(t)!==t)return[];var n,r,o=[],i=yx&&zA(t);for(n in t)Mu(n,t)&&(!i||n!=="length")&&(o[o.length]=n);if(jA)for(r=gx.length-1;r>=0;)n=gx[r],Mu(n,t)&&!UA(o,n)&&(o[o.length]=n),r-=1;return o});const xs=WA;var HA=Wt(function(t){return t===null?"Null":t===void 0?"Undefined":Object.prototype.toString.call(t).slice(8,-1)});const wv=HA;function bx(e,t,n,r){var o=hx(e),i=hx(t);function a(s,l){return ly(s,l,n.slice(),r.slice())}return!mx(function(s,l){return!mx(a,l,s)},i,o)}function ly(e,t,n,r){if(Em(e,t))return!0;var o=wv(e);if(o!==wv(t))return!1;if(typeof e["fantasy-land/equals"]=="function"||typeof t["fantasy-land/equals"]=="function")return typeof e["fantasy-land/equals"]=="function"&&e["fantasy-land/equals"](t)&&typeof t["fantasy-land/equals"]=="function"&&t["fantasy-land/equals"](e);if(typeof e.equals=="function"||typeof t.equals=="function")return typeof e.equals=="function"&&e.equals(t)&&typeof t.equals=="function"&&t.equals(e);switch(o){case"Arguments":case"Array":case"Object":if(typeof e.constructor=="function"&&FA(e.constructor)==="Promise")return e===t;break;case"Boolean":case"Number":case"String":if(!(typeof e==typeof t&&Em(e.valueOf(),t.valueOf())))return!1;break;case"Date":if(!Em(e.valueOf(),t.valueOf()))return!1;break;case"Error":return e.name===t.name&&e.message===t.message;case"RegExp":if(!(e.source===t.source&&e.global===t.global&&e.ignoreCase===t.ignoreCase&&e.multiline===t.multiline&&e.sticky===t.sticky&&e.unicode===t.unicode))return!1;break}for(var i=n.length-1;i>=0;){if(n[i]===e)return r[i]===t;i-=1}switch(o){case"Map":return e.size!==t.size?!1:bx(e.entries(),t.entries(),n.concat([e]),r.concat([t]));case"Set":return e.size!==t.size?!1:bx(e.values(),t.values(),n.concat([e]),r.concat([t]));case"Arguments":case"Array":case"Object":case"Boolean":case"Number":case"String":case"Date":case"Error":case"RegExp":case"Int8Array":case"Uint8Array":case"Uint8ClampedArray":case"Int16Array":case"Uint16Array":case"Int32Array":case"Uint32Array":case"Float32Array":case"Float64Array":case"ArrayBuffer":break;default:return!1}var a=xs(e);if(a.length!==xs(t).length)return!1;var s=n.concat([e]),l=r.concat([t]);for(i=a.length-1;i>=0;){var u=a[i];if(!(Mu(u,t)&&ly(t[u],e[u],s,l)))return!1;i-=1}return!0}var VA=wt(function(t,n){return ly(t,n,[],[])});const X$=VA;function GA(e,t,n){var r,o;if(typeof e.indexOf=="function")switch(typeof t){case"number":if(t===0){for(r=1/t;n<e.length;){if(o=e[n],o===0&&1/o===r)return n;n+=1}return-1}else if(t!==t){for(;n<e.length;){if(o=e[n],typeof o=="number"&&o!==o)return n;n+=1}return-1}return e.indexOf(t,n);case"string":case"boolean":case"function":case"undefined":return e.indexOf(t,n);case"object":if(t===null)return e.indexOf(t,n)}for(;n<e.length;){if(X$(e[n],t))return n;n+=1}return-1}function KA(e,t){return GA(t,e,0)>=0}function Kd(e,t){for(var n=0,r=t.length,o=Array(r);n<r;)o[n]=e(t[n]),n+=1;return o}function Cm(e){var t=e.replace(/\\/g,"\\\\").replace(/[\b]/g,"\\b").replace(/\f/g,"\\f").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t").replace(/\v/g,"\\v").replace(/\0/g,"\\0");return'"'+t.replace(/"/g,'\\"')+'"'}var vl=function(t){return(t<10?"0":"")+t},XA=typeof Date.prototype.toISOString=="function"?function(t){return t.toISOString()}:function(t){return t.getUTCFullYear()+"-"+vl(t.getUTCMonth()+1)+"-"+vl(t.getUTCDate())+"T"+vl(t.getUTCHours())+":"+vl(t.getUTCMinutes())+":"+vl(t.getUTCSeconds())+"."+(t.getUTCMilliseconds()/1e3).toFixed(3).slice(2,5)+"Z"};const YA=XA;function qA(e){return function(){return!e.apply(this,arguments)}}function Y$(e,t,n){for(var r=0,o=n.length;r<o;)t=e(t,n[r]),r+=1;return t}function QA(e,t){for(var n=0,r=t.length,o=[];n<r;)e(t[n])&&(o[o.length]=t[n]),n+=1;return o}function JA(e){return Object.prototype.toString.call(e)==="[object Object]"}var ZA=function(){function e(t,n){this.xf=n,this.f=t}return e.prototype["@@transducer/init"]=bs.init,e.prototype["@@transducer/result"]=bs.result,e.prototype["@@transducer/step"]=function(t,n){return this.f(n)?this.xf["@@transducer/step"](t,n):t},e}();function eM(e){return function(t){return new ZA(e,t)}}var tM=wt(Zp(["fantasy-land/filter","filter"],eM,function(e,t){return JA(t)?Y$(function(n,r){return e(t[r])&&(n[r]=t[r]),n},{},xs(t)):QA(e,t)}));const hn=tM;var nM=wt(function(t,n){return hn(qA(t),n)});const rM=nM;function q$(e,t){var n=function(a){var s=t.concat([e]);return KA(a,s)?"<Circular>":q$(a,s)},r=function(i,a){return Kd(function(s){return Cm(s)+": "+n(i[s])},a.slice().sort())};switch(Object.prototype.toString.call(e)){case"[object Arguments]":return"(function() { return arguments; }("+Kd(n,e).join(", ")+"))";case"[object Array]":return"["+Kd(n,e).concat(r(e,rM(function(i){return/^\d+$/.test(i)},xs(e)))).join(", ")+"]";case"[object Boolean]":return typeof e=="object"?"new Boolean("+n(e.valueOf())+")":e.toString();case"[object Date]":return"new Date("+(isNaN(e.valueOf())?n(NaN):Cm(YA(e)))+")";case"[object Map]":return"new Map("+n(Array.from(e))+")";case"[object Null]":return"null";case"[object Number]":return typeof e=="object"?"new Number("+n(e.valueOf())+")":1/e===-1/0?"-0":e.toString(10);case"[object Set]":return"new Set("+n(Array.from(e).sort())+")";case"[object String]":return typeof e=="object"?"new String("+n(e.valueOf())+")":Cm(e);case"[object Undefined]":return"undefined";default:if(typeof e.toString=="function"){var o=e.toString();if(o!=="[object Object]")return o}return"{"+r(e,xs(e)).join(", ")+"}"}}var oM=Wt(function(t){return q$(t,[])});const au=oM;var iM=wt(function(t,n){if(t===n)return n;function r(l,u){if(l>u!=u>l)return u>l?u:l}var o=r(t,n);if(o!==void 0)return o;var i=r(typeof t,typeof n);if(i!==void 0)return i===typeof t?t:n;var a=au(t),s=r(a,au(n));return s!==void 0&&s===a?t:n});const Q$=iM;var aM=function(){function e(t,n){this.xf=n,this.f=t}return e.prototype["@@transducer/init"]=bs.init,e.prototype["@@transducer/result"]=bs.result,e.prototype["@@transducer/step"]=function(t,n){return this.xf["@@transducer/step"](t,this.f(n))},e}(),sM=function(t){return function(n){return new aM(t,n)}};const lM=sM;var uM=wt(Zp(["fantasy-land/map","map"],lM,function(t,n){switch(Object.prototype.toString.call(n)){case"[object Function]":return sy(n.length,function(){return t.call(this,n.apply(this,arguments))});case"[object Object]":return Y$(function(r,o){return r[o]=t(n[o]),r},{},xs(n));default:return Kd(t,n)}}));const cM=uM,uy=Number.isInteger||function(t){return t<<0===t};function Mf(e){return Object.prototype.toString.call(e)==="[object String]"}var dM=wt(function(t,n){var r=t<0?n.length+t:t;return Mf(n)?n.charAt(r):n[r]});const fM=dM;var pM=wt(function(t,n){if(n!=null)return uy(t)?fM(t,n):n[t]});const oc=pM;var hM=wt(function(t,n){return cM(oc(t),n)});const eh=hM;var mM=Wt(function(t){return ys(t)?!0:!t||typeof t!="object"||Mf(t)?!1:t.length===0?!0:t.length>0?t.hasOwnProperty(0)&&t.hasOwnProperty(t.length-1):!1});const vM=mM;var xx=typeof Symbol<"u"?Symbol.iterator:"@@iterator";function gM(e,t,n){return function(o,i,a){if(vM(a))return e(o,i,a);if(a==null)return i;if(typeof a["fantasy-land/reduce"]=="function")return t(o,i,a,"fantasy-land/reduce");if(a[xx]!=null)return n(o,i,a[xx]());if(typeof a.next=="function")return n(o,i,a);if(typeof a.reduce=="function")return t(o,i,a,"reduce");throw new TypeError("reduce: list must be array or iterable")}}function yM(e,t,n){for(var r=0,o=n.length;r<o;){if(t=e["@@transducer/step"](t,n[r]),t&&t["@@transducer/reduced"]){t=t["@@transducer/value"];break}r+=1}return e["@@transducer/result"](t)}var bM=wt(function(t,n){return Jp(t.length,function(){return t.apply(n,arguments)})});const xM=bM;function SM(e,t,n){for(var r=n.next();!r.done;){if(t=e["@@transducer/step"](t,r.value),t&&t["@@transducer/reduced"]){t=t["@@transducer/value"];break}r=n.next()}return e["@@transducer/result"](t)}function wM(e,t,n,r){return e["@@transducer/result"](n[r](xM(e["@@transducer/step"],e),t))}var _M=gM(yM,wM,SM);const EM=_M;var CM=function(){function e(t){this.f=t}return e.prototype["@@transducer/init"]=function(){throw new Error("init not implemented on XWrap")},e.prototype["@@transducer/result"]=function(t){return t},e.prototype["@@transducer/step"]=function(t,n){return this.f(t,n)},e}();function $M(e){return new CM(e)}var RM=Sr(function(e,t,n){return EM(typeof e=="function"?$M(e):e,t,n)});const ic=RM;var kM=Wt(function(t){return sy(ic(Q$,0,eh("length",t)),function(){for(var n=0,r=t.length;n<r;){if(!t[n].apply(this,arguments))return!1;n+=1}return!0})});const th=kM;var PM=Wt(function(t){return function(){return t}});const TM=PM;var OM=function(){function e(t,n){this.xf=n,this.f=t,this.any=!1}return e.prototype["@@transducer/init"]=bs.init,e.prototype["@@transducer/result"]=function(t){return this.any||(t=this.xf["@@transducer/step"](t,!1)),this.xf["@@transducer/result"](t)},e.prototype["@@transducer/step"]=function(t,n){return this.f(n)&&(this.any=!0,t=K$(this.xf["@@transducer/step"](t,!0))),t},e}();function IM(e){return function(t){return new OM(e,t)}}var NM=wt(Zp(["any"],IM,function(t,n){for(var r=0;r<n.length;){if(t(n[r]))return!0;r+=1}return!1}));const AM=NM;var MM=Wt(function(t){return sy(ic(Q$,0,eh("length",t)),function(){for(var n=0,r=t.length;n<r;){if(t[n].apply(this,arguments))return!0;n+=1}return!1})});const LM=MM;var FM=wt(function(t,n){return V$(n,[t])});const Xc=FM;var DM=Sr(function(t,n,r){var o=t(n),i=t(r);return o<i?-1:o>i?1:0});const BM=DM;function zM(e,t,n){if(uy(e)&&ys(n)){var r=[].concat(n);return r[e]=t,r}var o={};for(var i in n)o[i]=n[i];return o[e]=t,o}var jM=Wt(function(t){return t==null});const UM=jM;var WM=Sr(function e(t,n,r){if(t.length===0)return n;var o=t[0];if(t.length>1){var i=!UM(r)&&Mu(o,r)&&typeof r[o]=="object"?r[o]:uy(t[1])?[]:{};n=e(Array.prototype.slice.call(t,1),n,i)}return zM(o,n,r)});const HM=WM;var VM=Sr(function(t,n,r){return HM([t],n,r)});const Sx=VM;function wx(e){var t=Object.prototype.toString.call(e);return t==="[object Function]"||t==="[object AsyncFunction]"||t==="[object GeneratorFunction]"||t==="[object AsyncGeneratorFunction]"}var GM=Sr(function(t,n,r){if(t>n)throw new Error("min must not be greater than max in clamp(min, max, value)");return r<t?t:r>n?n:r});const Vt=GM;function KM(e){return new RegExp(e.source,e.flags?e.flags:(e.global?"g":"")+(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.sticky?"y":"")+(e.unicode?"u":"")+(e.dotAll?"s":""))}function J$(e,t,n){if(n||(n=new YM),XM(e))return e;var r=function(i){var a=n.get(e);if(a)return a;n.set(e,i);for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&(i[s]=t?J$(e[s],!0,n):e[s]);return i};switch(wv(e)){case"Object":return r(Object.create(Object.getPrototypeOf(e)));case"Array":return r([]);case"Date":return new Date(e.valueOf());case"RegExp":return KM(e);case"Int8Array":case"Uint8Array":case"Uint8ClampedArray":case"Int16Array":case"Uint16Array":case"Int32Array":case"Uint32Array":case"Float32Array":case"Float64Array":case"BigInt64Array":case"BigUint64Array":return e.slice();default:return e}}function XM(e){var t=typeof e;return e==null||t!="object"&&t!="function"}var YM=function(){function e(){this.map={},this.length=0}return e.prototype.set=function(t,n){const r=this.hash(t);let o=this.map[r];o||(this.map[r]=o=[]),o.push([t,n]),this.length+=1},e.prototype.hash=function(t){let n=[];for(var r in t)n.push(Object.prototype.toString.call(t[r]));return n.join()},e.prototype.get=function(t){if(this.length<=180){for(const o in this.map){const i=this.map[o];for(let a=0;a<i.length;a+=1){const s=i[a];if(s[0]===t)return s[1]}}return}const n=this.hash(t),r=this.map[n];if(r)for(let o=0;o<r.length;o+=1){const i=r[o];if(i[0]===t)return i[1]}},e}(),qM=Wt(function(t){return t!=null&&typeof t.clone=="function"?t.clone():J$(t,!0)});const _x=qM;function QM(e,t){return function(){return t.call(this,e.apply(this,arguments))}}function Z$(e,t){return function(){var n=arguments.length;if(n===0)return t();var r=arguments[n-1];return ys(r)||typeof r[e]!="function"?t.apply(this,arguments):r[e].apply(r,Array.prototype.slice.call(arguments,0,n-1))}}var JM=Sr(Z$("slice",function(t,n,r){return Array.prototype.slice.call(r,t,n)}));const ZM=JM;var e9=Wt(Z$("tail",ZM(1,1/0)));const t9=e9;function cy(){if(arguments.length===0)throw new Error("pipe requires at least one argument");return Jp(arguments[0].length,ic(QM,arguments[0],t9(arguments)))}var n9=wt(function(t,n){if(ys(t)){if(ys(n))return t.concat(n);throw new TypeError(au(n)+" is not an array")}if(Mf(t)){if(Mf(n))return t+n;throw new TypeError(au(n)+" is not a string")}if(t!=null&&wx(t["fantasy-land/concat"]))return t["fantasy-land/concat"](n);if(t!=null&&wx(t.concat))return t.concat(n);throw new TypeError(au(t)+' does not have a method named "concat" or "fantasy-land/concat"')});const $m=n9;var r9=Sr(function(t,n,r){var o=t(n),i=t(r);return o>i?-1:o<i?1:0});const o9=r9;var i9=Sr(function(t,n,r){var o=Array.prototype.slice.call(r,0);return o.splice(t,n),o});const a9=i9;var s9=function(){function e(t,n){this.xf=n,this.f=t,this.idx=-1,this.found=!1}return e.prototype["@@transducer/init"]=bs.init,e.prototype["@@transducer/result"]=function(t){return this.found||(t=this.xf["@@transducer/step"](t,-1)),this.xf["@@transducer/result"](t)},e.prototype["@@transducer/step"]=function(t,n){return this.idx+=1,this.f(n)&&(this.found=!0,t=K$(this.xf["@@transducer/step"](t,this.idx))),t},e}();function l9(e){return function(t){return new s9(e,t)}}var u9=wt(Zp([],l9,function(t,n){for(var r=0,o=n.length;r<o;){if(t(n[r]))return r;r+=1}return-1}));const Ex=u9;var c9=Sr(function(t,n,r){return MA(t,TM(n),r)});const d9=c9;var f9=ic(IA,0);const e4=f9;var p9=wt(function(t,n){return t*n});const h9=p9;var m9=Sr(function(t,n,r){return X$(t,oc(n,r))});const es=m9;var v9=Sr(function(t,n,r){return t(oc(n,r))});const so=v9;var g9=wt(function(t,n){return Array.prototype.slice.call(n,0).sort(t)});const t4=g9;function Nr(){const e=zp(ay);return e[gs]||e}var ac={},Rm={exports:{}},Cx;function y9(){return Cx||(Cx=1,function(e){function t(n,r){if(n==null)return{};var o={};for(var i in n)if({}.hasOwnProperty.call(n,i)){if(r.includes(i))continue;o[i]=n[i]}return o}e.exports=t,e.exports.__esModule=!0,e.exports.default=e.exports}(Rm)),Rm.exports}const n4=Jr(yO),b9=Jr(bO),x9=Jr($O),S9=Jr(TI),w9=Jr(hI),_9=Jr(xI);var Ws=xn;Object.defineProperty(ac,"__esModule",{value:!0});var E9=ac.default=F9;ac.shouldForwardProp=Xd;ac.systemDefaultTheme=void 0;var er=Ws(s$()),_v=Ws(y9()),$x=O9(n4),C9=b9;Ws(x9);Ws(S9);var $9=Ws(w9),R9=Ws(_9);const k9=["ownerState"],P9=["variants"],T9=["name","slot","skipVariantsResolver","skipSx","overridesResolver"];function r4(e){if(typeof WeakMap!="function")return null;var t=new WeakMap,n=new WeakMap;return(r4=function(r){return r?n:t})(e)}function O9(e,t){if(!t&&e&&e.__esModule)return e;if(e===null||typeof e!="object"&&typeof e!="function")return{default:e};var n=r4(t);if(n&&n.has(e))return n.get(e);var r={__proto__:null},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if(i!=="default"&&Object.prototype.hasOwnProperty.call(e,i)){var a=o?Object.getOwnPropertyDescriptor(e,i):null;a&&(a.get||a.set)?Object.defineProperty(r,i,a):r[i]=e[i]}return r.default=e,n&&n.set(e,r),r}function I9(e){return Object.keys(e).length===0}function N9(e){return typeof e=="string"&&e.charCodeAt(0)>96}function Xd(e){return e!=="ownerState"&&e!=="theme"&&e!=="sx"&&e!=="as"}const A9=ac.systemDefaultTheme=(0,$9.default)(),M9=e=>e&&e.charAt(0).toLowerCase()+e.slice(1);function Yc({defaultTheme:e,theme:t,themeId:n}){return I9(t)?e:t[n]||t}function L9(e){return e?(t,n)=>n[e]:null}function Yd(e,t){let{ownerState:n}=t,r=(0,_v.default)(t,k9);const o=typeof e=="function"?e((0,er.default)({ownerState:n},r)):e;if(Array.isArray(o))return o.flatMap(i=>Yd(i,(0,er.default)({ownerState:n},r)));if(o&&typeof o=="object"&&Array.isArray(o.variants)){const{variants:i=[]}=o;let s=(0,_v.default)(o,P9);return i.forEach(l=>{let u=!0;typeof l.props=="function"?u=l.props((0,er.default)({ownerState:n},r,n)):Object.keys(l.props).forEach(c=>{(n==null?void 0:n[c])!==l.props[c]&&r[c]!==l.props[c]&&(u=!1)}),u&&(Array.isArray(s)||(s=[s]),s.push(typeof l.style=="function"?l.style((0,er.default)({ownerState:n},r,n)):l.style))}),s}return o}function F9(e={}){const{themeId:t,defaultTheme:n=A9,rootShouldForwardProp:r=Xd,slotShouldForwardProp:o=Xd}=e,i=a=>(0,R9.default)((0,er.default)({},a,{theme:Yc((0,er.default)({},a,{defaultTheme:n,themeId:t}))}));return i.__mui_systemSx=!0,(a,s={})=>{(0,$x.internal_processStyles)(a,C=>C.filter(S=>!(S!=null&&S.__mui_systemSx)));const{name:l,slot:u,skipVariantsResolver:c,skipSx:d,overridesResolver:f=L9(M9(u))}=s,h=(0,_v.default)(s,T9),v=c!==void 0?c:u&&u!=="Root"&&u!=="root"||!1,y=d||!1;let b,p=Xd;u==="Root"||u==="root"?p=r:u?p=o:N9(a)&&(p=void 0);const m=(0,$x.default)(a,(0,er.default)({shouldForwardProp:p,label:b},h)),g=C=>typeof C=="function"&&C.__emotion_real!==C||(0,C9.isPlainObject)(C)?S=>Yd(C,(0,er.default)({},S,{theme:Yc({theme:S.theme,defaultTheme:n,themeId:t})})):C,w=(C,...S)=>{let $=g(C);const R=S?S.map(g):[];l&&f&&R.push(N=>{const F=Yc((0,er.default)({},N,{defaultTheme:n,themeId:t}));if(!F.components||!F.components[l]||!F.components[l].styleOverrides)return null;const L=F.components[l].styleOverrides,D={};return Object.entries(L).forEach(([M,j])=>{D[M]=Yd(j,(0,er.default)({},N,{theme:F}))}),f(N,D)}),l&&!v&&R.push(N=>{var F;const L=Yc((0,er.default)({},N,{defaultTheme:n,themeId:t})),D=L==null||(F=L.components)==null||(F=F[l])==null?void 0:F.variants;return Yd({variants:D},(0,er.default)({},N,{theme:L}))}),y||R.push(i);const k=R.length-S.length;if(Array.isArray(C)&&k>0){const N=new Array(k).fill("");$=[...C,...N],$.raw=[...C.raw,...N]}const P=m($,...R);return a.muiName&&(P.muiName=a.muiName),P};return m.withConfig&&(w.withConfig=m.withConfig),w}}function dy(e){return e!=="ownerState"&&e!=="theme"&&e!=="sx"&&e!=="as"}const D9=e=>dy(e)&&e!=="classes",Nn=D9,B9=E9({themeId:gs,defaultTheme:ay,rootShouldForwardProp:Nn}),X=B9,z9=["theme"];function j9(e){let{theme:t}=e,n=Y(e,z9);const r=t[gs];return _(bN,E({},n,{themeId:r?gs:void 0,theme:r||t}))}const U9=e=>{let t;return e<1?t=5.11916*e**2:t=4.5*Math.log(e+1)+2,(t/100).toFixed(2)},Rx=U9;function W9(e){return _e("MuiSvgIcon",e)}xe("MuiSvgIcon",["root","colorPrimary","colorSecondary","colorAction","colorError","colorDisabled","fontSizeInherit","fontSizeSmall","fontSizeMedium","fontSizeLarge"]);const H9=["children","className","color","component","fontSize","htmlColor","inheritViewBox","titleAccess","viewBox"],V9=e=>{const{color:t,fontSize:n,classes:r}=e,o={root:["root",t!=="inherit"&&`color${K(t)}`,`fontSize${K(n)}`]};return Ce(o,W9,r)},G9=X("svg",{name:"MuiSvgIcon",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,n.color!=="inherit"&&t[`color${K(n.color)}`],t[`fontSize${K(n.fontSize)}`]]}})(({theme:e,ownerState:t})=>{var n,r,o,i,a,s,l,u,c,d,f,h,v;return{userSelect:"none",width:"1em",height:"1em",display:"inline-block",fill:t.hasSvgAsChild?void 0:"currentColor",flexShrink:0,transition:(n=e.transitions)==null||(r=n.create)==null?void 0:r.call(n,"fill",{duration:(o=e.transitions)==null||(o=o.duration)==null?void 0:o.shorter}),fontSize:{inherit:"inherit",small:((i=e.typography)==null||(a=i.pxToRem)==null?void 0:a.call(i,20))||"1.25rem",medium:((s=e.typography)==null||(l=s.pxToRem)==null?void 0:l.call(s,24))||"1.5rem",large:((u=e.typography)==null||(c=u.pxToRem)==null?void 0:c.call(u,35))||"2.1875rem"}[t.fontSize],color:(d=(f=(e.vars||e).palette)==null||(f=f[t.color])==null?void 0:f.main)!=null?d:{action:(h=(e.vars||e).palette)==null||(h=h.action)==null?void 0:h.active,disabled:(v=(e.vars||e).palette)==null||(v=v.action)==null?void 0:v.disabled,inherit:void 0}[t.color]}}),o4=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiSvgIcon"}),{children:o,className:i,color:a="inherit",component:s="svg",fontSize:l="medium",htmlColor:u,inheritViewBox:c=!1,titleAccess:d,viewBox:f="0 0 24 24"}=r,h=Y(r,H9),v=x.isValidElement(o)&&o.type==="svg",y=E({},r,{color:a,component:s,fontSize:l,instanceFontSize:t.fontSize,inheritViewBox:c,viewBox:f,hasSvgAsChild:v}),b={};c||(b.viewBox=f);const p=V9(y);return G(G9,E({as:s,className:te(p.root,i),focusable:"false",color:u,"aria-hidden":d?void 0:!0,role:d?"img":void 0,ref:n},b,h,v&&o.props,{ownerState:y,children:[v?o.props.children:o,d?_("title",{children:d}):null]}))});o4.muiName="SvgIcon";const Ev=o4;function la(e,t){function n(r,o){return _(Ev,E({"data-testid":`${t}Icon`,ref:o},r,{children:e}))}return n.muiName=Ev.muiName,x.memo(x.forwardRef(n))}const K9={configure:e=>{Q1.configure(e)}},X9=Object.freeze(Object.defineProperty({__proto__:null,capitalize:K,createChainedFunction:xv,createSvgIcon:la,debounce:ty,deprecatedPropType:KI,isMuiElement:Vd,ownerDocument:ln,ownerWindow:ai,requirePropFactory:XI,setRef:Of,unstable_ClassNameGenerator:K9,unstable_useEnhancedEffect:Ir,unstable_useId:js,unsupportedProp:qI,useControlled:vs,useEventCallback:fo,useForkRef:Tt,useIsFocusVisible:rc},Symbol.toStringTag,{value:"Module"}));var it={};/**
 * @license React
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var fy=Symbol.for("react.element"),py=Symbol.for("react.portal"),nh=Symbol.for("react.fragment"),rh=Symbol.for("react.strict_mode"),oh=Symbol.for("react.profiler"),ih=Symbol.for("react.provider"),ah=Symbol.for("react.context"),Y9=Symbol.for("react.server_context"),sh=Symbol.for("react.forward_ref"),lh=Symbol.for("react.suspense"),uh=Symbol.for("react.suspense_list"),ch=Symbol.for("react.memo"),dh=Symbol.for("react.lazy"),q9=Symbol.for("react.offscreen"),i4;i4=Symbol.for("react.module.reference");function wr(e){if(typeof e=="object"&&e!==null){var t=e.$$typeof;switch(t){case fy:switch(e=e.type,e){case nh:case oh:case rh:case lh:case uh:return e;default:switch(e=e&&e.$$typeof,e){case Y9:case ah:case sh:case dh:case ch:case ih:return e;default:return t}}case py:return t}}}it.ContextConsumer=ah;it.ContextProvider=ih;it.Element=fy;it.ForwardRef=sh;it.Fragment=nh;it.Lazy=dh;it.Memo=ch;it.Portal=py;it.Profiler=oh;it.StrictMode=rh;it.Suspense=lh;it.SuspenseList=uh;it.isAsyncMode=function(){return!1};it.isConcurrentMode=function(){return!1};it.isContextConsumer=function(e){return wr(e)===ah};it.isContextProvider=function(e){return wr(e)===ih};it.isElement=function(e){return typeof e=="object"&&e!==null&&e.$$typeof===fy};it.isForwardRef=function(e){return wr(e)===sh};it.isFragment=function(e){return wr(e)===nh};it.isLazy=function(e){return wr(e)===dh};it.isMemo=function(e){return wr(e)===ch};it.isPortal=function(e){return wr(e)===py};it.isProfiler=function(e){return wr(e)===oh};it.isStrictMode=function(e){return wr(e)===rh};it.isSuspense=function(e){return wr(e)===lh};it.isSuspenseList=function(e){return wr(e)===uh};it.isValidElementType=function(e){return typeof e=="string"||typeof e=="function"||e===nh||e===oh||e===rh||e===lh||e===uh||e===q9||typeof e=="object"&&e!==null&&(e.$$typeof===dh||e.$$typeof===ch||e.$$typeof===ih||e.$$typeof===ah||e.$$typeof===sh||e.$$typeof===i4||e.getModuleId!==void 0)};it.typeOf=wr;function Cv(e,t){return Cv=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,r){return n.__proto__=r,n},Cv(e,t)}function a4(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,Cv(e,t)}const kx={disabled:!1},Lf=En.createContext(null);var Q9=function(t){return t.scrollTop},Hl="unmounted",Ei="exited",Ci="entering",Pa="entered",$v="exiting",Ro=function(e){a4(t,e);function t(r,o){var i;i=e.call(this,r,o)||this;var a=o,s=a&&!a.isMounting?r.enter:r.appear,l;return i.appearStatus=null,r.in?s?(l=Ei,i.appearStatus=Ci):l=Pa:r.unmountOnExit||r.mountOnEnter?l=Hl:l=Ei,i.state={status:l},i.nextCallback=null,i}t.getDerivedStateFromProps=function(o,i){var a=o.in;return a&&i.status===Hl?{status:Ei}:null};var n=t.prototype;return n.componentDidMount=function(){this.updateStatus(!0,this.appearStatus)},n.componentDidUpdate=function(o){var i=null;if(o!==this.props){var a=this.state.status;this.props.in?a!==Ci&&a!==Pa&&(i=Ci):(a===Ci||a===Pa)&&(i=$v)}this.updateStatus(!1,i)},n.componentWillUnmount=function(){this.cancelNextCallback()},n.getTimeouts=function(){var o=this.props.timeout,i,a,s;return i=a=s=o,o!=null&&typeof o!="number"&&(i=o.exit,a=o.enter,s=o.appear!==void 0?o.appear:a),{exit:i,enter:a,appear:s}},n.updateStatus=function(o,i){if(o===void 0&&(o=!1),i!==null)if(this.cancelNextCallback(),i===Ci){if(this.props.unmountOnExit||this.props.mountOnEnter){var a=this.props.nodeRef?this.props.nodeRef.current:Ul.findDOMNode(this);a&&Q9(a)}this.performEnter(o)}else this.performExit();else this.props.unmountOnExit&&this.state.status===Ei&&this.setState({status:Hl})},n.performEnter=function(o){var i=this,a=this.props.enter,s=this.context?this.context.isMounting:o,l=this.props.nodeRef?[s]:[Ul.findDOMNode(this),s],u=l[0],c=l[1],d=this.getTimeouts(),f=s?d.appear:d.enter;if(!o&&!a||kx.disabled){this.safeSetState({status:Pa},function(){i.props.onEntered(u)});return}this.props.onEnter(u,c),this.safeSetState({status:Ci},function(){i.props.onEntering(u,c),i.onTransitionEnd(f,function(){i.safeSetState({status:Pa},function(){i.props.onEntered(u,c)})})})},n.performExit=function(){var o=this,i=this.props.exit,a=this.getTimeouts(),s=this.props.nodeRef?void 0:Ul.findDOMNode(this);if(!i||kx.disabled){this.safeSetState({status:Ei},function(){o.props.onExited(s)});return}this.props.onExit(s),this.safeSetState({status:$v},function(){o.props.onExiting(s),o.onTransitionEnd(a.exit,function(){o.safeSetState({status:Ei},function(){o.props.onExited(s)})})})},n.cancelNextCallback=function(){this.nextCallback!==null&&(this.nextCallback.cancel(),this.nextCallback=null)},n.safeSetState=function(o,i){i=this.setNextCallback(i),this.setState(o,i)},n.setNextCallback=function(o){var i=this,a=!0;return this.nextCallback=function(s){a&&(a=!1,i.nextCallback=null,o(s))},this.nextCallback.cancel=function(){a=!1},this.nextCallback},n.onTransitionEnd=function(o,i){this.setNextCallback(i);var a=this.props.nodeRef?this.props.nodeRef.current:Ul.findDOMNode(this),s=o==null&&!this.props.addEndListener;if(!a||s){setTimeout(this.nextCallback,0);return}if(this.props.addEndListener){var l=this.props.nodeRef?[this.nextCallback]:[a,this.nextCallback],u=l[0],c=l[1];this.props.addEndListener(u,c)}o!=null&&setTimeout(this.nextCallback,o)},n.render=function(){var o=this.state.status;if(o===Hl)return null;var i=this.props,a=i.children;i.in,i.mountOnEnter,i.unmountOnExit,i.appear,i.enter,i.exit,i.timeout,i.addEndListener,i.onEnter,i.onEntering,i.onEntered,i.onExit,i.onExiting,i.onExited,i.nodeRef;var s=Y(i,["children","in","mountOnEnter","unmountOnExit","appear","enter","exit","timeout","addEndListener","onEnter","onEntering","onEntered","onExit","onExiting","onExited","nodeRef"]);return En.createElement(Lf.Provider,{value:null},typeof a=="function"?a(o,s):En.cloneElement(En.Children.only(a),s))},t}(En.Component);Ro.contextType=Lf;Ro.propTypes={};function Ca(){}Ro.defaultProps={in:!1,mountOnEnter:!1,unmountOnExit:!1,appear:!1,enter:!0,exit:!0,onEnter:Ca,onEntering:Ca,onEntered:Ca,onExit:Ca,onExiting:Ca,onExited:Ca};Ro.UNMOUNTED=Hl;Ro.EXITED=Ei;Ro.ENTERING=Ci;Ro.ENTERED=Pa;Ro.EXITING=$v;const hy=Ro;function J9(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function my(e,t){var n=function(i){return t&&x.isValidElement(i)?t(i):i},r=Object.create(null);return e&&x.Children.map(e,function(o){return o}).forEach(function(o){r[o.key]=n(o)}),r}function Z9(e,t){e=e||{},t=t||{};function n(c){return c in t?t[c]:e[c]}var r=Object.create(null),o=[];for(var i in e)i in t?o.length&&(r[i]=o,o=[]):o.push(i);var a,s={};for(var l in t){if(r[l])for(a=0;a<r[l].length;a++){var u=r[l][a];s[r[l][a]]=n(u)}s[l]=n(l)}for(a=0;a<o.length;a++)s[o[a]]=n(o[a]);return s}function Ni(e,t,n){return n[t]!=null?n[t]:e.props[t]}function e7(e,t){return my(e.children,function(n){return x.cloneElement(n,{onExited:t.bind(null,n),in:!0,appear:Ni(n,"appear",e),enter:Ni(n,"enter",e),exit:Ni(n,"exit",e)})})}function t7(e,t,n){var r=my(e.children),o=Z9(t,r);return Object.keys(o).forEach(function(i){var a=o[i];if(x.isValidElement(a)){var s=i in t,l=i in r,u=t[i],c=x.isValidElement(u)&&!u.props.in;l&&(!s||c)?o[i]=x.cloneElement(a,{onExited:n.bind(null,a),in:!0,exit:Ni(a,"exit",e),enter:Ni(a,"enter",e)}):!l&&s&&!c?o[i]=x.cloneElement(a,{in:!1}):l&&s&&x.isValidElement(u)&&(o[i]=x.cloneElement(a,{onExited:n.bind(null,a),in:u.props.in,exit:Ni(a,"exit",e),enter:Ni(a,"enter",e)}))}}),o}var n7=Object.values||function(e){return Object.keys(e).map(function(t){return e[t]})},r7={component:"div",childFactory:function(t){return t}},vy=function(e){a4(t,e);function t(r,o){var i;i=e.call(this,r,o)||this;var a=i.handleExited.bind(J9(i));return i.state={contextValue:{isMounting:!0},handleExited:a,firstRender:!0},i}var n=t.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},t.getDerivedStateFromProps=function(o,i){var a=i.children,s=i.handleExited,l=i.firstRender;return{children:l?e7(o,s):t7(o,a,s),firstRender:!1}},n.handleExited=function(o,i){var a=my(this.props.children);o.key in a||(o.props.onExited&&o.props.onExited(i),this.mounted&&this.setState(function(s){var l=E({},s.children);return delete l[o.key],{children:l}}))},n.render=function(){var o=this.props,i=o.component,a=o.childFactory,s=Y(o,["component","childFactory"]),l=this.state.contextValue,u=n7(this.state.children).map(a);return delete s.appear,delete s.enter,delete s.exit,i===null?En.createElement(Lf.Provider,{value:l},u):En.createElement(Lf.Provider,{value:l},En.createElement(i,s,u))},t}(En.Component);vy.propTypes={};vy.defaultProps=r7;const o7=vy,s4=e=>e.scrollTop;function Ss(e,t){var n,r;const{timeout:o,easing:i,style:a={}}=e;return{duration:(n=a.transitionDuration)!=null?n:typeof o=="number"?o:o[t.mode]||0,easing:(r=a.transitionTimingFunction)!=null?r:typeof i=="object"?i[t.mode]:i,delay:a.transitionDelay}}function i7(e){return _e("MuiCollapse",e)}xe("MuiCollapse",["root","horizontal","vertical","entered","hidden","wrapper","wrapperInner"]);const a7=["addEndListener","children","className","collapsedSize","component","easing","in","onEnter","onEntered","onEntering","onExit","onExited","onExiting","orientation","style","timeout","TransitionComponent"],s7=e=>{const{orientation:t,classes:n}=e,r={root:["root",`${t}`],entered:["entered"],hidden:["hidden"],wrapper:["wrapper",`${t}`],wrapperInner:["wrapperInner",`${t}`]};return Ce(r,i7,n)},l7=X("div",{name:"MuiCollapse",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[n.orientation],n.state==="entered"&&t.entered,n.state==="exited"&&!n.in&&n.collapsedSize==="0px"&&t.hidden]}})(({theme:e,ownerState:t})=>E({height:0,overflow:"hidden",transition:e.transitions.create("height")},t.orientation==="horizontal"&&{height:"auto",width:0,transition:e.transitions.create("width")},t.state==="entered"&&E({height:"auto",overflow:"visible"},t.orientation==="horizontal"&&{width:"auto"}),t.state==="exited"&&!t.in&&t.collapsedSize==="0px"&&{visibility:"hidden"})),u7=X("div",{name:"MuiCollapse",slot:"Wrapper",overridesResolver:(e,t)=>t.wrapper})(({ownerState:e})=>E({display:"flex",width:"100%"},e.orientation==="horizontal"&&{width:"auto",height:"100%"})),c7=X("div",{name:"MuiCollapse",slot:"WrapperInner",overridesResolver:(e,t)=>t.wrapperInner})(({ownerState:e})=>E({width:"100%"},e.orientation==="horizontal"&&{width:"auto",height:"100%"})),l4=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiCollapse"}),{addEndListener:o,children:i,className:a,collapsedSize:s="0px",component:l,easing:u,in:c,onEnter:d,onEntered:f,onEntering:h,onExit:v,onExited:y,onExiting:b,orientation:p="vertical",style:m,timeout:g=W$.standard,TransitionComponent:w=hy}=r,C=Y(r,a7),S=E({},r,{orientation:p,collapsedSize:s}),$=s7(S),R=Nr(),k=Ii(),P=x.useRef(null),N=x.useRef(),F=typeof s=="number"?`${s}px`:s,L=p==="horizontal",D=L?"width":"height",M=x.useRef(null),j=Tt(n,M),B=V=>me=>{if(V){const we=M.current;me===void 0?V(we):V(we,me)}},I=()=>P.current?P.current[L?"clientWidth":"clientHeight"]:0,z=B((V,me)=>{P.current&&L&&(P.current.style.position="absolute"),V.style[D]=F,d&&d(V,me)}),H=B((V,me)=>{const we=I();P.current&&L&&(P.current.style.position="");const{duration:Se,easing:Fe}=Ss({style:m,timeout:g,easing:u},{mode:"enter"});if(g==="auto"){const ie=R.transitions.getAutoHeightDuration(we);V.style.transitionDuration=`${ie}ms`,N.current=ie}else V.style.transitionDuration=typeof Se=="string"?Se:`${Se}ms`;V.style[D]=`${we}px`,V.style.transitionTimingFunction=Fe,h&&h(V,me)}),le=B((V,me)=>{V.style[D]="auto",f&&f(V,me)}),ae=B(V=>{V.style[D]=`${I()}px`,v&&v(V)}),ye=B(y),J=B(V=>{const me=I(),{duration:we,easing:Se}=Ss({style:m,timeout:g,easing:u},{mode:"exit"});if(g==="auto"){const Fe=R.transitions.getAutoHeightDuration(me);V.style.transitionDuration=`${Fe}ms`,N.current=Fe}else V.style.transitionDuration=typeof we=="string"?we:`${we}ms`;V.style[D]=F,V.style.transitionTimingFunction=Se,b&&b(V)});return _(w,E({in:c,onEnter:z,onEntered:le,onEntering:H,onExit:ae,onExited:ye,onExiting:J,addEndListener:V=>{g==="auto"&&k.start(N.current||0,V),o&&o(M.current,V)},nodeRef:M,timeout:g==="auto"?null:g},C,{children:(V,me)=>_(l7,E({as:l,className:te($.root,a,{entered:$.entered,exited:!c&&F==="0px"&&$.hidden}[V]),style:E({[L?"minWidth":"minHeight"]:F},m),ref:j},me,{ownerState:E({},S,{state:V}),children:_(u7,{ownerState:E({},S,{state:V}),className:$.wrapper,ref:P,children:_(c7,{ownerState:E({},S,{state:V}),className:$.wrapperInner,children:i})})}))}))});l4.muiSupportAuto=!0;const qc=l4;function d7(e){return _e("MuiPaper",e)}xe("MuiPaper",["root","rounded","outlined","elevation","elevation0","elevation1","elevation2","elevation3","elevation4","elevation5","elevation6","elevation7","elevation8","elevation9","elevation10","elevation11","elevation12","elevation13","elevation14","elevation15","elevation16","elevation17","elevation18","elevation19","elevation20","elevation21","elevation22","elevation23","elevation24"]);const f7=["className","component","elevation","square","variant"],p7=e=>{const{square:t,elevation:n,variant:r,classes:o}=e,i={root:["root",r,!t&&"rounded",r==="elevation"&&`elevation${n}`]};return Ce(i,d7,o)},h7=X("div",{name:"MuiPaper",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[n.variant],!n.square&&t.rounded,n.variant==="elevation"&&t[`elevation${n.elevation}`]]}})(({theme:e,ownerState:t})=>{var n;return E({backgroundColor:(e.vars||e).palette.background.paper,color:(e.vars||e).palette.text.primary,transition:e.transitions.create("box-shadow")},!t.square&&{borderRadius:e.shape.borderRadius},t.variant==="outlined"&&{border:`1px solid ${(e.vars||e).palette.divider}`},t.variant==="elevation"&&E({boxShadow:(e.vars||e).shadows[t.elevation]},!e.vars&&e.palette.mode==="dark"&&{backgroundImage:`linear-gradient(${Nt("#fff",Rx(t.elevation))}, ${Nt("#fff",Rx(t.elevation))})`},e.vars&&{backgroundImage:(n=e.vars.overlays)==null?void 0:n[t.elevation]}))}),m7=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiPaper"}),{className:o,component:i="div",elevation:a=1,square:s=!1,variant:l="elevation"}=r,u=Y(r,f7),c=E({},r,{component:i,elevation:a,square:s,variant:l}),d=p7(c);return _(h7,E({as:i,ownerState:c,className:te(d.root,o),ref:n},u))}),gy=m7;function v7(e){const{className:t,classes:n,pulsate:r=!1,rippleX:o,rippleY:i,rippleSize:a,in:s,onExited:l,timeout:u}=e,[c,d]=x.useState(!1),f=te(t,n.ripple,n.rippleVisible,r&&n.ripplePulsate),h={width:a,height:a,top:-(a/2)+i,left:-(a/2)+o},v=te(n.child,c&&n.childLeaving,r&&n.childPulsate);return!s&&!c&&d(!0),x.useEffect(()=>{if(!s&&l!=null){const y=setTimeout(l,u);return()=>{clearTimeout(y)}}},[l,s,u]),_("span",{className:f,style:h,children:_("span",{className:v})})}const g7=xe("MuiTouchRipple",["root","ripple","rippleVisible","ripplePulsate","child","childLeaving","childPulsate"]),tr=g7,y7=["center","classes","className"];let fh=e=>e,Px,Tx,Ox,Ix;const Rv=550,b7=80,x7=Ap(Px||(Px=fh`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`)),S7=Ap(Tx||(Tx=fh`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`)),w7=Ap(Ox||(Ox=fh`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
`)),_7=X("span",{name:"MuiTouchRipple",slot:"Root"})({overflow:"hidden",pointerEvents:"none",position:"absolute",zIndex:0,top:0,right:0,bottom:0,left:0,borderRadius:"inherit"}),E7=X(v7,{name:"MuiTouchRipple",slot:"Ripple"})(Ix||(Ix=fh`
  opacity: 0;
  position: absolute;

  &.${0} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${0};
    animation-duration: ${0}ms;
    animation-timing-function: ${0};
  }

  &.${0} {
    animation-duration: ${0}ms;
  }

  & .${0} {
    opacity: 1;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;
  }

  & .${0} {
    opacity: 0;
    animation-name: ${0};
    animation-duration: ${0}ms;
    animation-timing-function: ${0};
  }

  & .${0} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${0};
    animation-duration: 2500ms;
    animation-timing-function: ${0};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`),tr.rippleVisible,x7,Rv,({theme:e})=>e.transitions.easing.easeInOut,tr.ripplePulsate,({theme:e})=>e.transitions.duration.shorter,tr.child,tr.childLeaving,S7,Rv,({theme:e})=>e.transitions.easing.easeInOut,tr.childPulsate,w7,({theme:e})=>e.transitions.easing.easeInOut),C7=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiTouchRipple"}),{center:o=!1,classes:i={},className:a}=r,s=Y(r,y7),[l,u]=x.useState([]),c=x.useRef(0),d=x.useRef(null);x.useEffect(()=>{d.current&&(d.current(),d.current=null)},[l]);const f=x.useRef(!1),h=Ii(),v=x.useRef(null),y=x.useRef(null),b=x.useCallback(w=>{const{pulsate:C,rippleX:S,rippleY:$,rippleSize:R,cb:k}=w;u(P=>[...P,_(E7,{classes:{ripple:te(i.ripple,tr.ripple),rippleVisible:te(i.rippleVisible,tr.rippleVisible),ripplePulsate:te(i.ripplePulsate,tr.ripplePulsate),child:te(i.child,tr.child),childLeaving:te(i.childLeaving,tr.childLeaving),childPulsate:te(i.childPulsate,tr.childPulsate)},timeout:Rv,pulsate:C,rippleX:S,rippleY:$,rippleSize:R},c.current)]),c.current+=1,d.current=k},[i]),p=x.useCallback((w={},C={},S=()=>{})=>{const{pulsate:$=!1,center:R=o||C.pulsate,fakeElement:k=!1}=C;if((w==null?void 0:w.type)==="mousedown"&&f.current){f.current=!1;return}(w==null?void 0:w.type)==="touchstart"&&(f.current=!0);const P=k?null:y.current,N=P?P.getBoundingClientRect():{width:0,height:0,left:0,top:0};let F,L,D;if(R||w===void 0||w.clientX===0&&w.clientY===0||!w.clientX&&!w.touches)F=Math.round(N.width/2),L=Math.round(N.height/2);else{const{clientX:M,clientY:j}=w.touches&&w.touches.length>0?w.touches[0]:w;F=Math.round(M-N.left),L=Math.round(j-N.top)}if(R)D=Math.sqrt((2*N.width**2+N.height**2)/3),D%2===0&&(D+=1);else{const M=Math.max(Math.abs((P?P.clientWidth:0)-F),F)*2+2,j=Math.max(Math.abs((P?P.clientHeight:0)-L),L)*2+2;D=Math.sqrt(M**2+j**2)}w!=null&&w.touches?v.current===null&&(v.current=()=>{b({pulsate:$,rippleX:F,rippleY:L,rippleSize:D,cb:S})},h.start(b7,()=>{v.current&&(v.current(),v.current=null)})):b({pulsate:$,rippleX:F,rippleY:L,rippleSize:D,cb:S})},[o,b,h]),m=x.useCallback(()=>{p({},{pulsate:!0})},[p]),g=x.useCallback((w,C)=>{if(h.clear(),(w==null?void 0:w.type)==="touchend"&&v.current){v.current(),v.current=null,h.start(0,()=>{g(w,C)});return}v.current=null,u(S=>S.length>0?S.slice(1):S),d.current=C},[h]);return x.useImperativeHandle(n,()=>({pulsate:m,start:p,stop:g}),[m,p,g]),_(_7,E({className:te(tr.root,i.root,a),ref:y},s,{children:_(o7,{component:null,exit:!0,children:l})}))}),$7=C7;function R7(e){return _e("MuiButtonBase",e)}const k7=xe("MuiButtonBase",["root","disabled","focusVisible"]),P7=k7,T7=["action","centerRipple","children","className","component","disabled","disableRipple","disableTouchRipple","focusRipple","focusVisibleClassName","LinkComponent","onBlur","onClick","onContextMenu","onDragLeave","onFocus","onFocusVisible","onKeyDown","onKeyUp","onMouseDown","onMouseLeave","onMouseUp","onTouchEnd","onTouchMove","onTouchStart","tabIndex","TouchRippleProps","touchRippleRef","type"],O7=e=>{const{disabled:t,focusVisible:n,focusVisibleClassName:r,classes:o}=e,a=Ce({root:["root",t&&"disabled",n&&"focusVisible"]},R7,o);return n&&r&&(a.root+=` ${r}`),a},I7=X("button",{name:"MuiButtonBase",slot:"Root",overridesResolver:(e,t)=>t.root})({display:"inline-flex",alignItems:"center",justifyContent:"center",position:"relative",boxSizing:"border-box",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none",textDecoration:"none",color:"inherit","&::-moz-focus-inner":{borderStyle:"none"},[`&.${P7.disabled}`]:{pointerEvents:"none",cursor:"default"},"@media print":{colorAdjust:"exact"}}),N7=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiButtonBase"}),{action:o,centerRipple:i=!1,children:a,className:s,component:l="button",disabled:u=!1,disableRipple:c=!1,disableTouchRipple:d=!1,focusRipple:f=!1,LinkComponent:h="a",onBlur:v,onClick:y,onContextMenu:b,onDragLeave:p,onFocus:m,onFocusVisible:g,onKeyDown:w,onKeyUp:C,onMouseDown:S,onMouseLeave:$,onMouseUp:R,onTouchEnd:k,onTouchMove:P,onTouchStart:N,tabIndex:F=0,TouchRippleProps:L,touchRippleRef:D,type:M}=r,j=Y(r,T7),B=x.useRef(null),I=x.useRef(null),z=Tt(I,D),{isFocusVisibleRef:H,onFocus:le,onBlur:ae,ref:ye}=rc(),[J,he]=x.useState(!1);u&&J&&he(!1),x.useImperativeHandle(o,()=>({focusVisible:()=>{he(!0),B.current.focus()}}),[]);const[V,me]=x.useState(!1);x.useEffect(()=>{me(!0)},[]);const we=V&&!c&&!u;x.useEffect(()=>{J&&f&&!c&&V&&I.current.pulsate()},[c,f,J,V]);function Se(pe,Je,An=d){return fo(Ct=>(Je&&Je(Ct),!An&&I.current&&I.current[pe](Ct),!0))}const Fe=Se("start",S),ie=Se("stop",b),Oe=Se("stop",p),ge=Se("stop",R),$e=Se("stop",pe=>{J&&pe.preventDefault(),$&&$(pe)}),Z=Se("start",N),Le=Se("stop",k),Ue=Se("stop",P),qe=Se("stop",pe=>{ae(pe),H.current===!1&&he(!1),v&&v(pe)},!1),ut=fo(pe=>{B.current||(B.current=pe.currentTarget),le(pe),H.current===!0&&(he(!0),g&&g(pe)),m&&m(pe)}),De=()=>{const pe=B.current;return l&&l!=="button"&&!(pe.tagName==="A"&&pe.href)},Pe=x.useRef(!1),Ze=fo(pe=>{f&&!Pe.current&&J&&I.current&&pe.key===" "&&(Pe.current=!0,I.current.stop(pe,()=>{I.current.start(pe)})),pe.target===pe.currentTarget&&De()&&pe.key===" "&&pe.preventDefault(),w&&w(pe),pe.target===pe.currentTarget&&De()&&pe.key==="Enter"&&!u&&(pe.preventDefault(),y&&y(pe))}),Be=fo(pe=>{f&&pe.key===" "&&I.current&&J&&!pe.defaultPrevented&&(Pe.current=!1,I.current.stop(pe,()=>{I.current.pulsate(pe)})),C&&C(pe),y&&pe.target===pe.currentTarget&&De()&&pe.key===" "&&!pe.defaultPrevented&&y(pe)});let q=l;q==="button"&&(j.href||j.to)&&(q=h);const Ie={};q==="button"?(Ie.type=M===void 0?"button":M,Ie.disabled=u):(!j.href&&!j.to&&(Ie.role="button"),u&&(Ie["aria-disabled"]=u));const je=Tt(n,ye,B),Qe=E({},r,{centerRipple:i,component:l,disabled:u,disableRipple:c,disableTouchRipple:d,focusRipple:f,tabIndex:F,focusVisible:J}),Re=O7(Qe);return G(I7,E({as:q,className:te(Re.root,s),ownerState:Qe,onBlur:qe,onClick:y,onContextMenu:ie,onFocus:ut,onKeyDown:Ze,onKeyUp:Be,onMouseDown:Fe,onMouseLeave:$e,onMouseUp:ge,onDragLeave:Oe,onTouchEnd:Le,onTouchMove:Ue,onTouchStart:Z,ref:je,tabIndex:u?-1:F,type:M},Ie,j,{children:[a,we?_($7,E({ref:z,center:i},L)):null]}))}),sc=N7;function A7(e){return _e("MuiIconButton",e)}const M7=xe("MuiIconButton",["root","disabled","colorInherit","colorPrimary","colorSecondary","colorError","colorInfo","colorSuccess","colorWarning","edgeStart","edgeEnd","sizeSmall","sizeMedium","sizeLarge"]),L7=M7,F7=["edge","children","className","color","disabled","disableFocusRipple","size"],D7=e=>{const{classes:t,disabled:n,color:r,edge:o,size:i}=e,a={root:["root",n&&"disabled",r!=="default"&&`color${K(r)}`,o&&`edge${K(o)}`,`size${K(i)}`]};return Ce(a,A7,t)},B7=X(sc,{name:"MuiIconButton",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,n.color!=="default"&&t[`color${K(n.color)}`],n.edge&&t[`edge${K(n.edge)}`],t[`size${K(n.size)}`]]}})(({theme:e,ownerState:t})=>E({textAlign:"center",flex:"0 0 auto",fontSize:e.typography.pxToRem(24),padding:8,borderRadius:"50%",overflow:"visible",color:(e.vars||e).palette.action.active,transition:e.transitions.create("background-color",{duration:e.transitions.duration.shortest})},!t.disableRipple&&{"&:hover":{backgroundColor:e.vars?`rgba(${e.vars.palette.action.activeChannel} / ${e.vars.palette.action.hoverOpacity})`:Nt(e.palette.action.active,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},t.edge==="start"&&{marginLeft:t.size==="small"?-3:-12},t.edge==="end"&&{marginRight:t.size==="small"?-3:-12}),({theme:e,ownerState:t})=>{var n;const r=(n=(e.vars||e).palette)==null?void 0:n[t.color];return E({},t.color==="inherit"&&{color:"inherit"},t.color!=="inherit"&&t.color!=="default"&&E({color:r==null?void 0:r.main},!t.disableRipple&&{"&:hover":E({},r&&{backgroundColor:e.vars?`rgba(${r.mainChannel} / ${e.vars.palette.action.hoverOpacity})`:Nt(r.main,e.palette.action.hoverOpacity)},{"@media (hover: none)":{backgroundColor:"transparent"}})}),t.size==="small"&&{padding:5,fontSize:e.typography.pxToRem(18)},t.size==="large"&&{padding:12,fontSize:e.typography.pxToRem(28)},{[`&.${L7.disabled}`]:{backgroundColor:"transparent",color:(e.vars||e).palette.action.disabled}})}),z7=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiIconButton"}),{edge:o=!1,children:i,className:a,color:s="default",disabled:l=!1,disableFocusRipple:u=!1,size:c="medium"}=r,d=Y(r,F7),f=E({},r,{edge:o,color:s,disabled:l,disableFocusRipple:u,size:c}),h=D7(f);return _(B7,E({className:te(h.root,a),centerRipple:!0,focusRipple:!u,disabled:l,ref:n},d,{ownerState:f,children:i}))}),ar=z7;function j7(e){return _e("MuiTypography",e)}xe("MuiTypography",["root","h1","h2","h3","h4","h5","h6","subtitle1","subtitle2","body1","body2","inherit","button","caption","overline","alignLeft","alignRight","alignCenter","alignJustify","noWrap","gutterBottom","paragraph"]);const U7=["align","className","component","gutterBottom","noWrap","paragraph","variant","variantMapping"],W7=e=>{const{align:t,gutterBottom:n,noWrap:r,paragraph:o,variant:i,classes:a}=e,s={root:["root",i,e.align!=="inherit"&&`align${K(t)}`,n&&"gutterBottom",r&&"noWrap",o&&"paragraph"]};return Ce(s,j7,a)},H7=X("span",{name:"MuiTypography",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,n.variant&&t[n.variant],n.align!=="inherit"&&t[`align${K(n.align)}`],n.noWrap&&t.noWrap,n.gutterBottom&&t.gutterBottom,n.paragraph&&t.paragraph]}})(({theme:e,ownerState:t})=>E({margin:0},t.variant==="inherit"&&{font:"inherit"},t.variant!=="inherit"&&e.typography[t.variant],t.align!=="inherit"&&{textAlign:t.align},t.noWrap&&{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},t.gutterBottom&&{marginBottom:"0.35em"},t.paragraph&&{marginBottom:16})),Nx={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6",subtitle1:"h6",subtitle2:"h6",body1:"p",body2:"p",inherit:"p"},V7={primary:"primary.main",textPrimary:"text.primary",secondary:"secondary.main",textSecondary:"text.secondary",error:"error.main"},G7=e=>V7[e]||e,K7=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiTypography"}),o=G7(r.color),i=tc(E({},r,{color:o})),{align:a="inherit",className:s,component:l,gutterBottom:u=!1,noWrap:c=!1,paragraph:d=!1,variant:f="body1",variantMapping:h=Nx}=i,v=Y(i,U7),y=E({},i,{align:a,color:o,className:s,component:l,gutterBottom:u,noWrap:c,paragraph:d,variant:f,variantMapping:h}),b=l||(d?"p":h[f]||Nx[f])||"span",p=W7(y);return _(H7,E({as:b,ref:n,ownerState:y,className:te(p.root,s)},v))}),st=K7;function X7(e){return _e("MuiAppBar",e)}xe("MuiAppBar",["root","positionFixed","positionAbsolute","positionSticky","positionStatic","positionRelative","colorDefault","colorPrimary","colorSecondary","colorInherit","colorTransparent","colorError","colorInfo","colorSuccess","colorWarning"]);const Y7=["className","color","enableColorOnDark","position"],q7=e=>{const{color:t,position:n,classes:r}=e,o={root:["root",`color${K(t)}`,`position${K(n)}`]};return Ce(o,X7,r)},Qc=(e,t)=>e?`${e==null?void 0:e.replace(")","")}, ${t})`:t,Q7=X(gy,{name:"MuiAppBar",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[`position${K(n.position)}`],t[`color${K(n.color)}`]]}})(({theme:e,ownerState:t})=>{const n=e.palette.mode==="light"?e.palette.grey[100]:e.palette.grey[900];return E({display:"flex",flexDirection:"column",width:"100%",boxSizing:"border-box",flexShrink:0},t.position==="fixed"&&{position:"fixed",zIndex:(e.vars||e).zIndex.appBar,top:0,left:"auto",right:0,"@media print":{position:"absolute"}},t.position==="absolute"&&{position:"absolute",zIndex:(e.vars||e).zIndex.appBar,top:0,left:"auto",right:0},t.position==="sticky"&&{position:"sticky",zIndex:(e.vars||e).zIndex.appBar,top:0,left:"auto",right:0},t.position==="static"&&{position:"static"},t.position==="relative"&&{position:"relative"},!e.vars&&E({},t.color==="default"&&{backgroundColor:n,color:e.palette.getContrastText(n)},t.color&&t.color!=="default"&&t.color!=="inherit"&&t.color!=="transparent"&&{backgroundColor:e.palette[t.color].main,color:e.palette[t.color].contrastText},t.color==="inherit"&&{color:"inherit"},e.palette.mode==="dark"&&!t.enableColorOnDark&&{backgroundColor:null,color:null},t.color==="transparent"&&E({backgroundColor:"transparent",color:"inherit"},e.palette.mode==="dark"&&{backgroundImage:"none"})),e.vars&&E({},t.color==="default"&&{"--AppBar-background":t.enableColorOnDark?e.vars.palette.AppBar.defaultBg:Qc(e.vars.palette.AppBar.darkBg,e.vars.palette.AppBar.defaultBg),"--AppBar-color":t.enableColorOnDark?e.vars.palette.text.primary:Qc(e.vars.palette.AppBar.darkColor,e.vars.palette.text.primary)},t.color&&!t.color.match(/^(default|inherit|transparent)$/)&&{"--AppBar-background":t.enableColorOnDark?e.vars.palette[t.color].main:Qc(e.vars.palette.AppBar.darkBg,e.vars.palette[t.color].main),"--AppBar-color":t.enableColorOnDark?e.vars.palette[t.color].contrastText:Qc(e.vars.palette.AppBar.darkColor,e.vars.palette[t.color].contrastText)},!["inherit","transparent"].includes(t.color)&&{backgroundColor:"var(--AppBar-background)"},{color:t.color==="inherit"?"inherit":"var(--AppBar-color)"},t.color==="transparent"&&{backgroundImage:"none",backgroundColor:"transparent",color:"inherit"}))}),J7=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiAppBar"}),{className:o,color:i="primary",enableColorOnDark:a=!1,position:s="fixed"}=r,l=Y(r,Y7),u=E({},r,{color:i,position:s,enableColorOnDark:a}),c=q7(u);return _(Q7,E({square:!0,component:"header",ownerState:u,elevation:4,className:te(c.root,o,s==="fixed"&&"mui-fixed"),ref:n},l))}),Z7=J7;var yy={};Object.defineProperty(yy,"__esModule",{value:!0});var u4=yy.default=void 0,e8=n8(x),t8=n4;function c4(e){if(typeof WeakMap!="function")return null;var t=new WeakMap,n=new WeakMap;return(c4=function(r){return r?n:t})(e)}function n8(e,t){if(!t&&e&&e.__esModule)return e;if(e===null||typeof e!="object"&&typeof e!="function")return{default:e};var n=c4(t);if(n&&n.has(e))return n.get(e);var r={__proto__:null},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if(i!=="default"&&Object.prototype.hasOwnProperty.call(e,i)){var a=o?Object.getOwnPropertyDescriptor(e,i):null;a&&(a.get||a.set)?Object.defineProperty(r,i,a):r[i]=e[i]}return r.default=e,n&&n.set(e,r),r}function r8(e){return Object.keys(e).length===0}function o8(e=null){const t=e8.useContext(t8.ThemeContext);return!t||r8(t)?e:t}u4=yy.default=o8;var Pn="top",vr="bottom",gr="right",Tn="left",by="auto",lc=[Pn,vr,gr,Tn],ws="start",Lu="end",i8="clippingParents",d4="viewport",gl="popper",a8="reference",Ax=lc.reduce(function(e,t){return e.concat([t+"-"+ws,t+"-"+Lu])},[]),f4=[].concat(lc,[by]).reduce(function(e,t){return e.concat([t,t+"-"+ws,t+"-"+Lu])},[]),s8="beforeRead",l8="read",u8="afterRead",c8="beforeMain",d8="main",f8="afterMain",p8="beforeWrite",h8="write",m8="afterWrite",v8=[s8,l8,u8,c8,d8,f8,p8,h8,m8];function Yr(e){return e?(e.nodeName||"").toLowerCase():null}function Vn(e){if(e==null)return window;if(e.toString()!=="[object Window]"){var t=e.ownerDocument;return t&&t.defaultView||window}return e}function Qi(e){var t=Vn(e).Element;return e instanceof t||e instanceof Element}function dr(e){var t=Vn(e).HTMLElement;return e instanceof t||e instanceof HTMLElement}function xy(e){if(typeof ShadowRoot>"u")return!1;var t=Vn(e).ShadowRoot;return e instanceof t||e instanceof ShadowRoot}function g8(e){var t=e.state;Object.keys(t.elements).forEach(function(n){var r=t.styles[n]||{},o=t.attributes[n]||{},i=t.elements[n];!dr(i)||!Yr(i)||(Object.assign(i.style,r),Object.keys(o).forEach(function(a){var s=o[a];s===!1?i.removeAttribute(a):i.setAttribute(a,s===!0?"":s)}))})}function y8(e){var t=e.state,n={popper:{position:t.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(t.elements.popper.style,n.popper),t.styles=n,t.elements.arrow&&Object.assign(t.elements.arrow.style,n.arrow),function(){Object.keys(t.elements).forEach(function(r){var o=t.elements[r],i=t.attributes[r]||{},a=Object.keys(t.styles.hasOwnProperty(r)?t.styles[r]:n[r]),s=a.reduce(function(l,u){return l[u]="",l},{});!dr(o)||!Yr(o)||(Object.assign(o.style,s),Object.keys(i).forEach(function(l){o.removeAttribute(l)}))})}}const b8={name:"applyStyles",enabled:!0,phase:"write",fn:g8,effect:y8,requires:["computeStyles"]};function Xr(e){return e.split("-")[0]}var zi=Math.max,Ff=Math.min,_s=Math.round;function kv(){var e=navigator.userAgentData;return e!=null&&e.brands&&Array.isArray(e.brands)?e.brands.map(function(t){return t.brand+"/"+t.version}).join(" "):navigator.userAgent}function p4(){return!/^((?!chrome|android).)*safari/i.test(kv())}function Es(e,t,n){t===void 0&&(t=!1),n===void 0&&(n=!1);var r=e.getBoundingClientRect(),o=1,i=1;t&&dr(e)&&(o=e.offsetWidth>0&&_s(r.width)/e.offsetWidth||1,i=e.offsetHeight>0&&_s(r.height)/e.offsetHeight||1);var a=Qi(e)?Vn(e):window,s=a.visualViewport,l=!p4()&&n,u=(r.left+(l&&s?s.offsetLeft:0))/o,c=(r.top+(l&&s?s.offsetTop:0))/i,d=r.width/o,f=r.height/i;return{width:d,height:f,top:c,right:u+d,bottom:c+f,left:u,x:u,y:c}}function Sy(e){var t=Es(e),n=e.offsetWidth,r=e.offsetHeight;return Math.abs(t.width-n)<=1&&(n=t.width),Math.abs(t.height-r)<=1&&(r=t.height),{x:e.offsetLeft,y:e.offsetTop,width:n,height:r}}function h4(e,t){var n=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(n&&xy(n)){var r=t;do{if(r&&e.isSameNode(r))return!0;r=r.parentNode||r.host}while(r)}return!1}function wo(e){return Vn(e).getComputedStyle(e)}function x8(e){return["table","td","th"].indexOf(Yr(e))>=0}function vi(e){return((Qi(e)?e.ownerDocument:e.document)||window.document).documentElement}function ph(e){return Yr(e)==="html"?e:e.assignedSlot||e.parentNode||(xy(e)?e.host:null)||vi(e)}function Mx(e){return!dr(e)||wo(e).position==="fixed"?null:e.offsetParent}function S8(e){var t=/firefox/i.test(kv()),n=/Trident/i.test(kv());if(n&&dr(e)){var r=wo(e);if(r.position==="fixed")return null}var o=ph(e);for(xy(o)&&(o=o.host);dr(o)&&["html","body"].indexOf(Yr(o))<0;){var i=wo(o);if(i.transform!=="none"||i.perspective!=="none"||i.contain==="paint"||["transform","perspective"].indexOf(i.willChange)!==-1||t&&i.willChange==="filter"||t&&i.filter&&i.filter!=="none")return o;o=o.parentNode}return null}function uc(e){for(var t=Vn(e),n=Mx(e);n&&x8(n)&&wo(n).position==="static";)n=Mx(n);return n&&(Yr(n)==="html"||Yr(n)==="body"&&wo(n).position==="static")?t:n||S8(e)||t}function wy(e){return["top","bottom"].indexOf(e)>=0?"x":"y"}function su(e,t,n){return zi(e,Ff(t,n))}function w8(e,t,n){var r=su(e,t,n);return r>n?n:r}function m4(){return{top:0,right:0,bottom:0,left:0}}function v4(e){return Object.assign({},m4(),e)}function g4(e,t){return t.reduce(function(n,r){return n[r]=e,n},{})}var _8=function(t,n){return t=typeof t=="function"?t(Object.assign({},n.rects,{placement:n.placement})):t,v4(typeof t!="number"?t:g4(t,lc))};function E8(e){var t,n=e.state,r=e.name,o=e.options,i=n.elements.arrow,a=n.modifiersData.popperOffsets,s=Xr(n.placement),l=wy(s),u=[Tn,gr].indexOf(s)>=0,c=u?"height":"width";if(!(!i||!a)){var d=_8(o.padding,n),f=Sy(i),h=l==="y"?Pn:Tn,v=l==="y"?vr:gr,y=n.rects.reference[c]+n.rects.reference[l]-a[l]-n.rects.popper[c],b=a[l]-n.rects.reference[l],p=uc(i),m=p?l==="y"?p.clientHeight||0:p.clientWidth||0:0,g=y/2-b/2,w=d[h],C=m-f[c]-d[v],S=m/2-f[c]/2+g,$=su(w,S,C),R=l;n.modifiersData[r]=(t={},t[R]=$,t.centerOffset=$-S,t)}}function C8(e){var t=e.state,n=e.options,r=n.element,o=r===void 0?"[data-popper-arrow]":r;o!=null&&(typeof o=="string"&&(o=t.elements.popper.querySelector(o),!o)||h4(t.elements.popper,o)&&(t.elements.arrow=o))}const $8={name:"arrow",enabled:!0,phase:"main",fn:E8,effect:C8,requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function Cs(e){return e.split("-")[1]}var R8={top:"auto",right:"auto",bottom:"auto",left:"auto"};function k8(e,t){var n=e.x,r=e.y,o=t.devicePixelRatio||1;return{x:_s(n*o)/o||0,y:_s(r*o)/o||0}}function Lx(e){var t,n=e.popper,r=e.popperRect,o=e.placement,i=e.variation,a=e.offsets,s=e.position,l=e.gpuAcceleration,u=e.adaptive,c=e.roundOffsets,d=e.isFixed,f=a.x,h=f===void 0?0:f,v=a.y,y=v===void 0?0:v,b=typeof c=="function"?c({x:h,y}):{x:h,y};h=b.x,y=b.y;var p=a.hasOwnProperty("x"),m=a.hasOwnProperty("y"),g=Tn,w=Pn,C=window;if(u){var S=uc(n),$="clientHeight",R="clientWidth";if(S===Vn(n)&&(S=vi(n),wo(S).position!=="static"&&s==="absolute"&&($="scrollHeight",R="scrollWidth")),S=S,o===Pn||(o===Tn||o===gr)&&i===Lu){w=vr;var k=d&&S===C&&C.visualViewport?C.visualViewport.height:S[$];y-=k-r.height,y*=l?1:-1}if(o===Tn||(o===Pn||o===vr)&&i===Lu){g=gr;var P=d&&S===C&&C.visualViewport?C.visualViewport.width:S[R];h-=P-r.width,h*=l?1:-1}}var N=Object.assign({position:s},u&&R8),F=c===!0?k8({x:h,y},Vn(n)):{x:h,y};if(h=F.x,y=F.y,l){var L;return Object.assign({},N,(L={},L[w]=m?"0":"",L[g]=p?"0":"",L.transform=(C.devicePixelRatio||1)<=1?"translate("+h+"px, "+y+"px)":"translate3d("+h+"px, "+y+"px, 0)",L))}return Object.assign({},N,(t={},t[w]=m?y+"px":"",t[g]=p?h+"px":"",t.transform="",t))}function P8(e){var t=e.state,n=e.options,r=n.gpuAcceleration,o=r===void 0?!0:r,i=n.adaptive,a=i===void 0?!0:i,s=n.roundOffsets,l=s===void 0?!0:s,u={placement:Xr(t.placement),variation:Cs(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:o,isFixed:t.options.strategy==="fixed"};t.modifiersData.popperOffsets!=null&&(t.styles.popper=Object.assign({},t.styles.popper,Lx(Object.assign({},u,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:a,roundOffsets:l})))),t.modifiersData.arrow!=null&&(t.styles.arrow=Object.assign({},t.styles.arrow,Lx(Object.assign({},u,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:l})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})}const T8={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:P8,data:{}};var Jc={passive:!0};function O8(e){var t=e.state,n=e.instance,r=e.options,o=r.scroll,i=o===void 0?!0:o,a=r.resize,s=a===void 0?!0:a,l=Vn(t.elements.popper),u=[].concat(t.scrollParents.reference,t.scrollParents.popper);return i&&u.forEach(function(c){c.addEventListener("scroll",n.update,Jc)}),s&&l.addEventListener("resize",n.update,Jc),function(){i&&u.forEach(function(c){c.removeEventListener("scroll",n.update,Jc)}),s&&l.removeEventListener("resize",n.update,Jc)}}const I8={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:O8,data:{}};var N8={left:"right",right:"left",bottom:"top",top:"bottom"};function qd(e){return e.replace(/left|right|bottom|top/g,function(t){return N8[t]})}var A8={start:"end",end:"start"};function Fx(e){return e.replace(/start|end/g,function(t){return A8[t]})}function _y(e){var t=Vn(e),n=t.pageXOffset,r=t.pageYOffset;return{scrollLeft:n,scrollTop:r}}function Ey(e){return Es(vi(e)).left+_y(e).scrollLeft}function M8(e,t){var n=Vn(e),r=vi(e),o=n.visualViewport,i=r.clientWidth,a=r.clientHeight,s=0,l=0;if(o){i=o.width,a=o.height;var u=p4();(u||!u&&t==="fixed")&&(s=o.offsetLeft,l=o.offsetTop)}return{width:i,height:a,x:s+Ey(e),y:l}}function L8(e){var t,n=vi(e),r=_y(e),o=(t=e.ownerDocument)==null?void 0:t.body,i=zi(n.scrollWidth,n.clientWidth,o?o.scrollWidth:0,o?o.clientWidth:0),a=zi(n.scrollHeight,n.clientHeight,o?o.scrollHeight:0,o?o.clientHeight:0),s=-r.scrollLeft+Ey(e),l=-r.scrollTop;return wo(o||n).direction==="rtl"&&(s+=zi(n.clientWidth,o?o.clientWidth:0)-i),{width:i,height:a,x:s,y:l}}function Cy(e){var t=wo(e),n=t.overflow,r=t.overflowX,o=t.overflowY;return/auto|scroll|overlay|hidden/.test(n+o+r)}function y4(e){return["html","body","#document"].indexOf(Yr(e))>=0?e.ownerDocument.body:dr(e)&&Cy(e)?e:y4(ph(e))}function lu(e,t){var n;t===void 0&&(t=[]);var r=y4(e),o=r===((n=e.ownerDocument)==null?void 0:n.body),i=Vn(r),a=o?[i].concat(i.visualViewport||[],Cy(r)?r:[]):r,s=t.concat(a);return o?s:s.concat(lu(ph(a)))}function Pv(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function F8(e,t){var n=Es(e,!1,t==="fixed");return n.top=n.top+e.clientTop,n.left=n.left+e.clientLeft,n.bottom=n.top+e.clientHeight,n.right=n.left+e.clientWidth,n.width=e.clientWidth,n.height=e.clientHeight,n.x=n.left,n.y=n.top,n}function Dx(e,t,n){return t===d4?Pv(M8(e,n)):Qi(t)?F8(t,n):Pv(L8(vi(e)))}function D8(e){var t=lu(ph(e)),n=["absolute","fixed"].indexOf(wo(e).position)>=0,r=n&&dr(e)?uc(e):e;return Qi(r)?t.filter(function(o){return Qi(o)&&h4(o,r)&&Yr(o)!=="body"}):[]}function B8(e,t,n,r){var o=t==="clippingParents"?D8(e):[].concat(t),i=[].concat(o,[n]),a=i[0],s=i.reduce(function(l,u){var c=Dx(e,u,r);return l.top=zi(c.top,l.top),l.right=Ff(c.right,l.right),l.bottom=Ff(c.bottom,l.bottom),l.left=zi(c.left,l.left),l},Dx(e,a,r));return s.width=s.right-s.left,s.height=s.bottom-s.top,s.x=s.left,s.y=s.top,s}function b4(e){var t=e.reference,n=e.element,r=e.placement,o=r?Xr(r):null,i=r?Cs(r):null,a=t.x+t.width/2-n.width/2,s=t.y+t.height/2-n.height/2,l;switch(o){case Pn:l={x:a,y:t.y-n.height};break;case vr:l={x:a,y:t.y+t.height};break;case gr:l={x:t.x+t.width,y:s};break;case Tn:l={x:t.x-n.width,y:s};break;default:l={x:t.x,y:t.y}}var u=o?wy(o):null;if(u!=null){var c=u==="y"?"height":"width";switch(i){case ws:l[u]=l[u]-(t[c]/2-n[c]/2);break;case Lu:l[u]=l[u]+(t[c]/2-n[c]/2);break}}return l}function Fu(e,t){t===void 0&&(t={});var n=t,r=n.placement,o=r===void 0?e.placement:r,i=n.strategy,a=i===void 0?e.strategy:i,s=n.boundary,l=s===void 0?i8:s,u=n.rootBoundary,c=u===void 0?d4:u,d=n.elementContext,f=d===void 0?gl:d,h=n.altBoundary,v=h===void 0?!1:h,y=n.padding,b=y===void 0?0:y,p=v4(typeof b!="number"?b:g4(b,lc)),m=f===gl?a8:gl,g=e.rects.popper,w=e.elements[v?m:f],C=B8(Qi(w)?w:w.contextElement||vi(e.elements.popper),l,c,a),S=Es(e.elements.reference),$=b4({reference:S,element:g,strategy:"absolute",placement:o}),R=Pv(Object.assign({},g,$)),k=f===gl?R:S,P={top:C.top-k.top+p.top,bottom:k.bottom-C.bottom+p.bottom,left:C.left-k.left+p.left,right:k.right-C.right+p.right},N=e.modifiersData.offset;if(f===gl&&N){var F=N[o];Object.keys(P).forEach(function(L){var D=[gr,vr].indexOf(L)>=0?1:-1,M=[Pn,vr].indexOf(L)>=0?"y":"x";P[L]+=F[M]*D})}return P}function z8(e,t){t===void 0&&(t={});var n=t,r=n.placement,o=n.boundary,i=n.rootBoundary,a=n.padding,s=n.flipVariations,l=n.allowedAutoPlacements,u=l===void 0?f4:l,c=Cs(r),d=c?s?Ax:Ax.filter(function(v){return Cs(v)===c}):lc,f=d.filter(function(v){return u.indexOf(v)>=0});f.length===0&&(f=d);var h=f.reduce(function(v,y){return v[y]=Fu(e,{placement:y,boundary:o,rootBoundary:i,padding:a})[Xr(y)],v},{});return Object.keys(h).sort(function(v,y){return h[v]-h[y]})}function j8(e){if(Xr(e)===by)return[];var t=qd(e);return[Fx(e),t,Fx(t)]}function U8(e){var t=e.state,n=e.options,r=e.name;if(!t.modifiersData[r]._skip){for(var o=n.mainAxis,i=o===void 0?!0:o,a=n.altAxis,s=a===void 0?!0:a,l=n.fallbackPlacements,u=n.padding,c=n.boundary,d=n.rootBoundary,f=n.altBoundary,h=n.flipVariations,v=h===void 0?!0:h,y=n.allowedAutoPlacements,b=t.options.placement,p=Xr(b),m=p===b,g=l||(m||!v?[qd(b)]:j8(b)),w=[b].concat(g).reduce(function(J,he){return J.concat(Xr(he)===by?z8(t,{placement:he,boundary:c,rootBoundary:d,padding:u,flipVariations:v,allowedAutoPlacements:y}):he)},[]),C=t.rects.reference,S=t.rects.popper,$=new Map,R=!0,k=w[0],P=0;P<w.length;P++){var N=w[P],F=Xr(N),L=Cs(N)===ws,D=[Pn,vr].indexOf(F)>=0,M=D?"width":"height",j=Fu(t,{placement:N,boundary:c,rootBoundary:d,altBoundary:f,padding:u}),B=D?L?gr:Tn:L?vr:Pn;C[M]>S[M]&&(B=qd(B));var I=qd(B),z=[];if(i&&z.push(j[F]<=0),s&&z.push(j[B]<=0,j[I]<=0),z.every(function(J){return J})){k=N,R=!1;break}$.set(N,z)}if(R)for(var H=v?3:1,le=function(he){var V=w.find(function(me){var we=$.get(me);if(we)return we.slice(0,he).every(function(Se){return Se})});if(V)return k=V,"break"},ae=H;ae>0;ae--){var ye=le(ae);if(ye==="break")break}t.placement!==k&&(t.modifiersData[r]._skip=!0,t.placement=k,t.reset=!0)}}const W8={name:"flip",enabled:!0,phase:"main",fn:U8,requiresIfExists:["offset"],data:{_skip:!1}};function Bx(e,t,n){return n===void 0&&(n={x:0,y:0}),{top:e.top-t.height-n.y,right:e.right-t.width+n.x,bottom:e.bottom-t.height+n.y,left:e.left-t.width-n.x}}function zx(e){return[Pn,gr,vr,Tn].some(function(t){return e[t]>=0})}function H8(e){var t=e.state,n=e.name,r=t.rects.reference,o=t.rects.popper,i=t.modifiersData.preventOverflow,a=Fu(t,{elementContext:"reference"}),s=Fu(t,{altBoundary:!0}),l=Bx(a,r),u=Bx(s,o,i),c=zx(l),d=zx(u);t.modifiersData[n]={referenceClippingOffsets:l,popperEscapeOffsets:u,isReferenceHidden:c,hasPopperEscaped:d},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":c,"data-popper-escaped":d})}const V8={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:H8};function G8(e,t,n){var r=Xr(e),o=[Tn,Pn].indexOf(r)>=0?-1:1,i=typeof n=="function"?n(Object.assign({},t,{placement:e})):n,a=i[0],s=i[1];return a=a||0,s=(s||0)*o,[Tn,gr].indexOf(r)>=0?{x:s,y:a}:{x:a,y:s}}function K8(e){var t=e.state,n=e.options,r=e.name,o=n.offset,i=o===void 0?[0,0]:o,a=f4.reduce(function(c,d){return c[d]=G8(d,t.rects,i),c},{}),s=a[t.placement],l=s.x,u=s.y;t.modifiersData.popperOffsets!=null&&(t.modifiersData.popperOffsets.x+=l,t.modifiersData.popperOffsets.y+=u),t.modifiersData[r]=a}const X8={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:K8};function Y8(e){var t=e.state,n=e.name;t.modifiersData[n]=b4({reference:t.rects.reference,element:t.rects.popper,strategy:"absolute",placement:t.placement})}const q8={name:"popperOffsets",enabled:!0,phase:"read",fn:Y8,data:{}};function Q8(e){return e==="x"?"y":"x"}function J8(e){var t=e.state,n=e.options,r=e.name,o=n.mainAxis,i=o===void 0?!0:o,a=n.altAxis,s=a===void 0?!1:a,l=n.boundary,u=n.rootBoundary,c=n.altBoundary,d=n.padding,f=n.tether,h=f===void 0?!0:f,v=n.tetherOffset,y=v===void 0?0:v,b=Fu(t,{boundary:l,rootBoundary:u,padding:d,altBoundary:c}),p=Xr(t.placement),m=Cs(t.placement),g=!m,w=wy(p),C=Q8(w),S=t.modifiersData.popperOffsets,$=t.rects.reference,R=t.rects.popper,k=typeof y=="function"?y(Object.assign({},t.rects,{placement:t.placement})):y,P=typeof k=="number"?{mainAxis:k,altAxis:k}:Object.assign({mainAxis:0,altAxis:0},k),N=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,F={x:0,y:0};if(S){if(i){var L,D=w==="y"?Pn:Tn,M=w==="y"?vr:gr,j=w==="y"?"height":"width",B=S[w],I=B+b[D],z=B-b[M],H=h?-R[j]/2:0,le=m===ws?$[j]:R[j],ae=m===ws?-R[j]:-$[j],ye=t.elements.arrow,J=h&&ye?Sy(ye):{width:0,height:0},he=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:m4(),V=he[D],me=he[M],we=su(0,$[j],J[j]),Se=g?$[j]/2-H-we-V-P.mainAxis:le-we-V-P.mainAxis,Fe=g?-$[j]/2+H+we+me+P.mainAxis:ae+we+me+P.mainAxis,ie=t.elements.arrow&&uc(t.elements.arrow),Oe=ie?w==="y"?ie.clientTop||0:ie.clientLeft||0:0,ge=(L=N==null?void 0:N[w])!=null?L:0,$e=B+Se-ge-Oe,Z=B+Fe-ge,Le=su(h?Ff(I,$e):I,B,h?zi(z,Z):z);S[w]=Le,F[w]=Le-B}if(s){var Ue,qe=w==="x"?Pn:Tn,ut=w==="x"?vr:gr,De=S[C],Pe=C==="y"?"height":"width",Ze=De+b[qe],Be=De-b[ut],q=[Pn,Tn].indexOf(p)!==-1,Ie=(Ue=N==null?void 0:N[C])!=null?Ue:0,je=q?Ze:De-$[Pe]-R[Pe]-Ie+P.altAxis,Qe=q?De+$[Pe]+R[Pe]-Ie-P.altAxis:Be,Re=h&&q?w8(je,De,Qe):su(h?je:Ze,De,h?Qe:Be);S[C]=Re,F[C]=Re-De}t.modifiersData[r]=F}}const Z8={name:"preventOverflow",enabled:!0,phase:"main",fn:J8,requiresIfExists:["offset"]};function eL(e){return{scrollLeft:e.scrollLeft,scrollTop:e.scrollTop}}function tL(e){return e===Vn(e)||!dr(e)?_y(e):eL(e)}function nL(e){var t=e.getBoundingClientRect(),n=_s(t.width)/e.offsetWidth||1,r=_s(t.height)/e.offsetHeight||1;return n!==1||r!==1}function rL(e,t,n){n===void 0&&(n=!1);var r=dr(t),o=dr(t)&&nL(t),i=vi(t),a=Es(e,o,n),s={scrollLeft:0,scrollTop:0},l={x:0,y:0};return(r||!r&&!n)&&((Yr(t)!=="body"||Cy(i))&&(s=tL(t)),dr(t)?(l=Es(t,!0),l.x+=t.clientLeft,l.y+=t.clientTop):i&&(l.x=Ey(i))),{x:a.left+s.scrollLeft-l.x,y:a.top+s.scrollTop-l.y,width:a.width,height:a.height}}function oL(e){var t=new Map,n=new Set,r=[];e.forEach(function(i){t.set(i.name,i)});function o(i){n.add(i.name);var a=[].concat(i.requires||[],i.requiresIfExists||[]);a.forEach(function(s){if(!n.has(s)){var l=t.get(s);l&&o(l)}}),r.push(i)}return e.forEach(function(i){n.has(i.name)||o(i)}),r}function iL(e){var t=oL(e);return v8.reduce(function(n,r){return n.concat(t.filter(function(o){return o.phase===r}))},[])}function aL(e){var t;return function(){return t||(t=new Promise(function(n){Promise.resolve().then(function(){t=void 0,n(e())})})),t}}function sL(e){var t=e.reduce(function(n,r){var o=n[r.name];return n[r.name]=o?Object.assign({},o,r,{options:Object.assign({},o.options,r.options),data:Object.assign({},o.data,r.data)}):r,n},{});return Object.keys(t).map(function(n){return t[n]})}var jx={placement:"bottom",modifiers:[],strategy:"absolute"};function Ux(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return!t.some(function(r){return!(r&&typeof r.getBoundingClientRect=="function")})}function lL(e){e===void 0&&(e={});var t=e,n=t.defaultModifiers,r=n===void 0?[]:n,o=t.defaultOptions,i=o===void 0?jx:o;return function(s,l,u){u===void 0&&(u=i);var c={placement:"bottom",orderedModifiers:[],options:Object.assign({},jx,i),modifiersData:{},elements:{reference:s,popper:l},attributes:{},styles:{}},d=[],f=!1,h={state:c,setOptions:function(p){var m=typeof p=="function"?p(c.options):p;y(),c.options=Object.assign({},i,c.options,m),c.scrollParents={reference:Qi(s)?lu(s):s.contextElement?lu(s.contextElement):[],popper:lu(l)};var g=iL(sL([].concat(r,c.options.modifiers)));return c.orderedModifiers=g.filter(function(w){return w.enabled}),v(),h.update()},forceUpdate:function(){if(!f){var p=c.elements,m=p.reference,g=p.popper;if(Ux(m,g)){c.rects={reference:rL(m,uc(g),c.options.strategy==="fixed"),popper:Sy(g)},c.reset=!1,c.placement=c.options.placement,c.orderedModifiers.forEach(function(P){return c.modifiersData[P.name]=Object.assign({},P.data)});for(var w=0;w<c.orderedModifiers.length;w++){if(c.reset===!0){c.reset=!1,w=-1;continue}var C=c.orderedModifiers[w],S=C.fn,$=C.options,R=$===void 0?{}:$,k=C.name;typeof S=="function"&&(c=S({state:c,options:R,name:k,instance:h})||c)}}}},update:aL(function(){return new Promise(function(b){h.forceUpdate(),b(c)})}),destroy:function(){y(),f=!0}};if(!Ux(s,l))return h;h.setOptions(u).then(function(b){!f&&u.onFirstUpdate&&u.onFirstUpdate(b)});function v(){c.orderedModifiers.forEach(function(b){var p=b.name,m=b.options,g=m===void 0?{}:m,w=b.effect;if(typeof w=="function"){var C=w({state:c,name:p,instance:h,options:g}),S=function(){};d.push(C||S)}})}function y(){d.forEach(function(b){return b()}),d=[]}return h}}var uL=[I8,q8,T8,b8,X8,W8,Z8,$8,V8],cL=lL({defaultModifiers:uL});function dL(e){return typeof e=="function"?e():e}const fL=x.forwardRef(function(t,n){const{children:r,container:o,disablePortal:i=!1}=t,[a,s]=x.useState(null),l=Tt(x.isValidElement(r)?r.ref:null,n);if(Ir(()=>{i||s(dL(o)||document.body)},[o,i]),Ir(()=>{if(a&&!i)return Of(n,a),()=>{Of(n,null)}},[n,a,i]),i){if(x.isValidElement(r)){const u={ref:l};return x.cloneElement(r,u)}return _(x.Fragment,{children:r})}return _(x.Fragment,{children:a&&xp.createPortal(r,a)})}),x4=fL;function pL(e){return _e("MuiPopper",e)}xe("MuiPopper",["root"]);const hL=["anchorEl","children","direction","disablePortal","modifiers","open","placement","popperOptions","popperRef","slotProps","slots","TransitionProps","ownerState"],mL=["anchorEl","children","container","direction","disablePortal","keepMounted","modifiers","open","placement","popperOptions","popperRef","style","transition","slotProps","slots"];function vL(e,t){if(t==="ltr")return e;switch(e){case"bottom-end":return"bottom-start";case"bottom-start":return"bottom-end";case"top-end":return"top-start";case"top-start":return"top-end";default:return e}}function Tv(e){return typeof e=="function"?e():e}function gL(e){return e.nodeType!==void 0}const yL=e=>{const{classes:t}=e;return Ce({root:["root"]},pL,t)},bL={},xL=x.forwardRef(function(t,n){var r;const{anchorEl:o,children:i,direction:a,disablePortal:s,modifiers:l,open:u,placement:c,popperOptions:d,popperRef:f,slotProps:h={},slots:v={},TransitionProps:y}=t,b=Y(t,hL),p=x.useRef(null),m=Tt(p,n),g=x.useRef(null),w=Tt(g,f),C=x.useRef(w);Ir(()=>{C.current=w},[w]),x.useImperativeHandle(f,()=>g.current,[]);const S=vL(c,a),[$,R]=x.useState(S),[k,P]=x.useState(Tv(o));x.useEffect(()=>{g.current&&g.current.forceUpdate()}),x.useEffect(()=>{o&&P(Tv(o))},[o]),Ir(()=>{if(!k||!u)return;const M=I=>{R(I.placement)};let j=[{name:"preventOverflow",options:{altBoundary:s}},{name:"flip",options:{altBoundary:s}},{name:"onUpdate",enabled:!0,phase:"afterWrite",fn:({state:I})=>{M(I)}}];l!=null&&(j=j.concat(l)),d&&d.modifiers!=null&&(j=j.concat(d.modifiers));const B=cL(k,p.current,E({placement:S},d,{modifiers:j}));return C.current(B),()=>{B.destroy(),C.current(null)}},[k,s,l,u,d,S]);const N={placement:$};y!==null&&(N.TransitionProps=y);const F=yL(t),L=(r=v.root)!=null?r:"div",D=qi({elementType:L,externalSlotProps:h.root,externalForwardedProps:b,additionalProps:{role:"tooltip",ref:m},ownerState:t,className:F.root});return _(L,E({},D,{children:typeof i=="function"?i(N):i}))}),SL=x.forwardRef(function(t,n){const{anchorEl:r,children:o,container:i,direction:a="ltr",disablePortal:s=!1,keepMounted:l=!1,modifiers:u,open:c,placement:d="bottom",popperOptions:f=bL,popperRef:h,style:v,transition:y=!1,slotProps:b={},slots:p={}}=t,m=Y(t,mL),[g,w]=x.useState(!0),C=()=>{w(!1)},S=()=>{w(!0)};if(!l&&!c&&(!y||g))return null;let $;if(i)$=i;else if(r){const P=Tv(r);$=P&&gL(P)?ln(P).body:ln(null).body}const R=!c&&l&&(!y||g)?"none":void 0,k=y?{in:c,onEnter:C,onExited:S}:void 0;return _(x4,{disablePortal:s,container:$,children:_(xL,E({anchorEl:r,direction:a,disablePortal:s,modifiers:u,ref:n,open:y?!g:c,placement:d,popperOptions:f,popperRef:h,slotProps:b,slots:p},m,{style:E({position:"fixed",top:0,left:0,display:R},v),TransitionProps:k,children:o}))})}),wL=SL,_L=["anchorEl","component","components","componentsProps","container","disablePortal","keepMounted","modifiers","open","placement","popperOptions","popperRef","transition","slots","slotProps"],EL=X(wL,{name:"MuiPopper",slot:"Root",overridesResolver:(e,t)=>t.root})({}),CL=x.forwardRef(function(t,n){var r;const o=u4(),i=Ee({props:t,name:"MuiPopper"}),{anchorEl:a,component:s,components:l,componentsProps:u,container:c,disablePortal:d,keepMounted:f,modifiers:h,open:v,placement:y,popperOptions:b,popperRef:p,transition:m,slots:g,slotProps:w}=i,C=Y(i,_L),S=(r=g==null?void 0:g.root)!=null?r:l==null?void 0:l.Root,$=E({anchorEl:a,container:c,disablePortal:d,keepMounted:f,modifiers:h,open:v,placement:y,popperOptions:b,popperRef:p,transition:m},C);return _(EL,E({as:s,direction:o==null?void 0:o.direction,slots:{root:S},slotProps:w??u},$,{ref:n}))}),S4=CL,$L=["onChange","maxRows","minRows","style","value"];function Zc(e){return parseInt(e,10)||0}const RL={shadow:{visibility:"hidden",position:"absolute",overflow:"hidden",height:0,top:0,left:0,transform:"translateZ(0)"}};function kL(e){return e==null||Object.keys(e).length===0||e.outerHeightStyle===0&&!e.overflowing}const PL=x.forwardRef(function(t,n){const{onChange:r,maxRows:o,minRows:i=1,style:a,value:s}=t,l=Y(t,$L),{current:u}=x.useRef(s!=null),c=x.useRef(null),d=Tt(n,c),f=x.useRef(null),h=x.useRef(null),v=x.useCallback(()=>{const p=c.current,g=ai(p).getComputedStyle(p);if(g.width==="0px")return{outerHeightStyle:0,overflowing:!1};const w=h.current;w.style.width=g.width,w.value=p.value||t.placeholder||"x",w.value.slice(-1)===`
`&&(w.value+=" ");const C=g.boxSizing,S=Zc(g.paddingBottom)+Zc(g.paddingTop),$=Zc(g.borderBottomWidth)+Zc(g.borderTopWidth),R=w.scrollHeight;w.value="x";const k=w.scrollHeight;let P=R;i&&(P=Math.max(Number(i)*k,P)),o&&(P=Math.min(Number(o)*k,P)),P=Math.max(P,k);const N=P+(C==="border-box"?S+$:0),F=Math.abs(P-R)<=1;return{outerHeightStyle:N,overflowing:F}},[o,i,t.placeholder]),y=x.useCallback(()=>{const p=v();if(kL(p))return;const m=p.outerHeightStyle,g=c.current;f.current!==m&&(f.current=m,g.style.height=`${m}px`),g.style.overflow=p.overflowing?"hidden":""},[v]);Ir(()=>{const p=()=>{y()};let m;const g=ty(p),w=c.current,C=ai(w);C.addEventListener("resize",g);let S;return typeof ResizeObserver<"u"&&(S=new ResizeObserver(p),S.observe(w)),()=>{g.clear(),cancelAnimationFrame(m),C.removeEventListener("resize",g),S&&S.disconnect()}},[v,y]),Ir(()=>{y()});const b=p=>{u||y(),r&&r(p)};return G(x.Fragment,{children:[_("textarea",E({value:s,onChange:b,ref:d,rows:i,style:a},l)),_("textarea",{"aria-hidden":!0,className:t.className,readOnly:!0,ref:h,tabIndex:-1,style:E({},RL.shadow,a,{paddingTop:0,paddingBottom:0})})]})}),TL=PL;function ua({props:e,states:t,muiFormControl:n}){return t.reduce((r,o)=>(r[o]=e[o],n&&typeof e[o]>"u"&&(r[o]=n[o]),r),{})}const OL=x.createContext(void 0),$y=OL;function gi(){return x.useContext($y)}function Wx(e){return e!=null&&!(Array.isArray(e)&&e.length===0)}function Df(e,t=!1){return e&&(Wx(e.value)&&e.value!==""||t&&Wx(e.defaultValue)&&e.defaultValue!=="")}function IL(e){return e.startAdornment}function NL(e){return _e("MuiInputBase",e)}const AL=xe("MuiInputBase",["root","formControl","focused","disabled","adornedStart","adornedEnd","error","sizeSmall","multiline","colorSecondary","fullWidth","hiddenLabel","readOnly","input","inputSizeSmall","inputMultiline","inputTypeSearch","inputAdornedStart","inputAdornedEnd","inputHiddenLabel"]),$s=AL,ML=["aria-describedby","autoComplete","autoFocus","className","color","components","componentsProps","defaultValue","disabled","disableInjectingGlobalStyles","endAdornment","error","fullWidth","id","inputComponent","inputProps","inputRef","margin","maxRows","minRows","multiline","name","onBlur","onChange","onClick","onFocus","onKeyDown","onKeyUp","placeholder","readOnly","renderSuffix","rows","size","slotProps","slots","startAdornment","type","value"],hh=(e,t)=>{const{ownerState:n}=e;return[t.root,n.formControl&&t.formControl,n.startAdornment&&t.adornedStart,n.endAdornment&&t.adornedEnd,n.error&&t.error,n.size==="small"&&t.sizeSmall,n.multiline&&t.multiline,n.color&&t[`color${K(n.color)}`],n.fullWidth&&t.fullWidth,n.hiddenLabel&&t.hiddenLabel]},mh=(e,t)=>{const{ownerState:n}=e;return[t.input,n.size==="small"&&t.inputSizeSmall,n.multiline&&t.inputMultiline,n.type==="search"&&t.inputTypeSearch,n.startAdornment&&t.inputAdornedStart,n.endAdornment&&t.inputAdornedEnd,n.hiddenLabel&&t.inputHiddenLabel]},LL=e=>{const{classes:t,color:n,disabled:r,error:o,endAdornment:i,focused:a,formControl:s,fullWidth:l,hiddenLabel:u,multiline:c,readOnly:d,size:f,startAdornment:h,type:v}=e,y={root:["root",`color${K(n)}`,r&&"disabled",o&&"error",l&&"fullWidth",a&&"focused",s&&"formControl",f&&f!=="medium"&&`size${K(f)}`,c&&"multiline",h&&"adornedStart",i&&"adornedEnd",u&&"hiddenLabel",d&&"readOnly"],input:["input",r&&"disabled",v==="search"&&"inputTypeSearch",c&&"inputMultiline",f==="small"&&"inputSizeSmall",u&&"inputHiddenLabel",h&&"inputAdornedStart",i&&"inputAdornedEnd",d&&"readOnly"]};return Ce(y,NL,t)},vh=X("div",{name:"MuiInputBase",slot:"Root",overridesResolver:hh})(({theme:e,ownerState:t})=>E({},e.typography.body1,{color:(e.vars||e).palette.text.primary,lineHeight:"1.4375em",boxSizing:"border-box",position:"relative",cursor:"text",display:"inline-flex",alignItems:"center",[`&.${$s.disabled}`]:{color:(e.vars||e).palette.text.disabled,cursor:"default"}},t.multiline&&E({padding:"4px 0 5px"},t.size==="small"&&{paddingTop:1}),t.fullWidth&&{width:"100%"})),gh=X("input",{name:"MuiInputBase",slot:"Input",overridesResolver:mh})(({theme:e,ownerState:t})=>{const n=e.palette.mode==="light",r=E({color:"currentColor"},e.vars?{opacity:e.vars.opacity.inputPlaceholder}:{opacity:n?.42:.5},{transition:e.transitions.create("opacity",{duration:e.transitions.duration.shorter})}),o={opacity:"0 !important"},i=e.vars?{opacity:e.vars.opacity.inputPlaceholder}:{opacity:n?.42:.5};return E({font:"inherit",letterSpacing:"inherit",color:"currentColor",padding:"4px 0 5px",border:0,boxSizing:"content-box",background:"none",height:"1.4375em",margin:0,WebkitTapHighlightColor:"transparent",display:"block",minWidth:0,width:"100%",animationName:"mui-auto-fill-cancel",animationDuration:"10ms","&::-webkit-input-placeholder":r,"&::-moz-placeholder":r,"&:-ms-input-placeholder":r,"&::-ms-input-placeholder":r,"&:focus":{outline:0},"&:invalid":{boxShadow:"none"},"&::-webkit-search-decoration":{WebkitAppearance:"none"},[`label[data-shrink=false] + .${$s.formControl} &`]:{"&::-webkit-input-placeholder":o,"&::-moz-placeholder":o,"&:-ms-input-placeholder":o,"&::-ms-input-placeholder":o,"&:focus::-webkit-input-placeholder":i,"&:focus::-moz-placeholder":i,"&:focus:-ms-input-placeholder":i,"&:focus::-ms-input-placeholder":i},[`&.${$s.disabled}`]:{opacity:1,WebkitTextFillColor:(e.vars||e).palette.text.disabled},"&:-webkit-autofill":{animationDuration:"5000s",animationName:"mui-auto-fill"}},t.size==="small"&&{paddingTop:1},t.multiline&&{height:"auto",resize:"none",padding:0,paddingTop:0},t.type==="search"&&{MozAppearance:"textfield"})}),FL=_(H$,{styles:{"@keyframes mui-auto-fill":{from:{display:"block"}},"@keyframes mui-auto-fill-cancel":{from:{display:"block"}}}}),DL=x.forwardRef(function(t,n){var r;const o=Ee({props:t,name:"MuiInputBase"}),{"aria-describedby":i,autoComplete:a,autoFocus:s,className:l,components:u={},componentsProps:c={},defaultValue:d,disabled:f,disableInjectingGlobalStyles:h,endAdornment:v,fullWidth:y=!1,id:b,inputComponent:p="input",inputProps:m={},inputRef:g,maxRows:w,minRows:C,multiline:S=!1,name:$,onBlur:R,onChange:k,onClick:P,onFocus:N,onKeyDown:F,onKeyUp:L,placeholder:D,readOnly:M,renderSuffix:j,rows:B,slotProps:I={},slots:z={},startAdornment:H,type:le="text",value:ae}=o,ye=Y(o,ML),J=m.value!=null?m.value:ae,{current:he}=x.useRef(J!=null),V=x.useRef(),me=x.useCallback(Re=>{},[]),we=Tt(V,g,m.ref,me),[Se,Fe]=x.useState(!1),ie=gi(),Oe=ua({props:o,muiFormControl:ie,states:["color","disabled","error","hiddenLabel","size","required","filled"]});Oe.focused=ie?ie.focused:Se,x.useEffect(()=>{!ie&&f&&Se&&(Fe(!1),R&&R())},[ie,f,Se,R]);const ge=ie&&ie.onFilled,$e=ie&&ie.onEmpty,Z=x.useCallback(Re=>{Df(Re)?ge&&ge():$e&&$e()},[ge,$e]);Ir(()=>{he&&Z({value:J})},[J,Z,he]);const Le=Re=>{if(Oe.disabled){Re.stopPropagation();return}N&&N(Re),m.onFocus&&m.onFocus(Re),ie&&ie.onFocus?ie.onFocus(Re):Fe(!0)},Ue=Re=>{R&&R(Re),m.onBlur&&m.onBlur(Re),ie&&ie.onBlur?ie.onBlur(Re):Fe(!1)},qe=(Re,...pe)=>{if(!he){const Je=Re.target||V.current;if(Je==null)throw new Error(So(1));Z({value:Je.value})}m.onChange&&m.onChange(Re,...pe),k&&k(Re,...pe)};x.useEffect(()=>{Z(V.current)},[]);const ut=Re=>{V.current&&Re.currentTarget===Re.target&&V.current.focus(),P&&P(Re)};let De=p,Pe=m;S&&De==="input"&&(B?Pe=E({type:void 0,minRows:B,maxRows:B},Pe):Pe=E({type:void 0,maxRows:w,minRows:C},Pe),De=TL);const Ze=Re=>{Z(Re.animationName==="mui-auto-fill-cancel"?V.current:{value:"x"})};x.useEffect(()=>{ie&&ie.setAdornedStart(!!H)},[ie,H]);const Be=E({},o,{color:Oe.color||"primary",disabled:Oe.disabled,endAdornment:v,error:Oe.error,focused:Oe.focused,formControl:ie,fullWidth:y,hiddenLabel:Oe.hiddenLabel,multiline:S,size:Oe.size,startAdornment:H,type:le}),q=LL(Be),Ie=z.root||u.Root||vh,je=I.root||c.root||{},Qe=z.input||u.Input||gh;return Pe=E({},Pe,(r=I.input)!=null?r:c.input),G(x.Fragment,{children:[!h&&FL,G(Ie,E({},je,!If(Ie)&&{ownerState:E({},Be,je.ownerState)},{ref:n,onClick:ut},ye,{className:te(q.root,je.className,l,M&&"MuiInputBase-readOnly"),children:[H,_($y.Provider,{value:null,children:_(Qe,E({ownerState:Be,"aria-invalid":Oe.error,"aria-describedby":i,autoComplete:a,autoFocus:s,defaultValue:d,disabled:Oe.disabled,id:b,onAnimationStart:Ze,name:$,placeholder:D,readOnly:M,required:Oe.required,rows:B,value:J,onKeyDown:F,onKeyUp:L,type:le},Pe,!If(Qe)&&{as:De,ownerState:E({},Be,Pe.ownerState)},{ref:we,className:te(q.input,Pe.className,M&&"MuiInputBase-readOnly"),onBlur:Ue,onChange:qe,onFocus:Le}))}),v,j?j(E({},Oe,{startAdornment:H})):null]}))]})}),yh=DL;function BL(e){return _e("MuiInput",e)}const zL=E({},$s,xe("MuiInput",["root","underline","input"])),yl=zL;function jL(e){return _e("MuiOutlinedInput",e)}const UL=E({},$s,xe("MuiOutlinedInput",["root","notchedOutline","input"])),Io=UL;function WL(e){return _e("MuiFilledInput",e)}const HL=E({},$s,xe("MuiFilledInput",["root","underline","input"])),Si=HL,VL=la(_("path",{d:"M7 10l5 5 5-5z"}),"ArrowDropDown"),GL=["addEndListener","appear","children","easing","in","onEnter","onEntered","onEntering","onExit","onExited","onExiting","style","timeout","TransitionComponent"],KL={entering:{opacity:1},entered:{opacity:1}},XL=x.forwardRef(function(t,n){const r=Nr(),o={enter:r.transitions.duration.enteringScreen,exit:r.transitions.duration.leavingScreen},{addEndListener:i,appear:a=!0,children:s,easing:l,in:u,onEnter:c,onEntered:d,onEntering:f,onExit:h,onExited:v,onExiting:y,style:b,timeout:p=o,TransitionComponent:m=hy}=t,g=Y(t,GL),w=x.useRef(null),C=Tt(w,s.ref,n),S=D=>M=>{if(D){const j=w.current;M===void 0?D(j):D(j,M)}},$=S(f),R=S((D,M)=>{s4(D);const j=Ss({style:b,timeout:p,easing:l},{mode:"enter"});D.style.webkitTransition=r.transitions.create("opacity",j),D.style.transition=r.transitions.create("opacity",j),c&&c(D,M)}),k=S(d),P=S(y),N=S(D=>{const M=Ss({style:b,timeout:p,easing:l},{mode:"exit"});D.style.webkitTransition=r.transitions.create("opacity",M),D.style.transition=r.transitions.create("opacity",M),h&&h(D)}),F=S(v);return _(m,E({appear:a,in:u,nodeRef:w,onEnter:R,onEntered:k,onEntering:$,onExit:N,onExited:F,onExiting:P,addEndListener:D=>{i&&i(w.current,D)},timeout:p},g,{children:(D,M)=>x.cloneElement(s,E({style:E({opacity:0,visibility:D==="exited"&&!u?"hidden":void 0},KL[D],b,s.props.style),ref:C},M))}))}),YL=XL;function qL(e){return _e("MuiBackdrop",e)}xe("MuiBackdrop",["root","invisible"]);const QL=["children","className","component","components","componentsProps","invisible","open","slotProps","slots","TransitionComponent","transitionDuration"],JL=e=>{const{classes:t,invisible:n}=e;return Ce({root:["root",n&&"invisible"]},qL,t)},ZL=X("div",{name:"MuiBackdrop",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,n.invisible&&t.invisible]}})(({ownerState:e})=>E({position:"fixed",display:"flex",alignItems:"center",justifyContent:"center",right:0,bottom:0,top:0,left:0,backgroundColor:"rgba(0, 0, 0, 0.5)",WebkitTapHighlightColor:"transparent"},e.invisible&&{backgroundColor:"transparent"})),eF=x.forwardRef(function(t,n){var r,o,i;const a=Ee({props:t,name:"MuiBackdrop"}),{children:s,className:l,component:u="div",components:c={},componentsProps:d={},invisible:f=!1,open:h,slotProps:v={},slots:y={},TransitionComponent:b=YL,transitionDuration:p}=a,m=Y(a,QL),g=E({},a,{component:u,invisible:f}),w=JL(g),C=(r=v.root)!=null?r:d.root;return _(b,E({in:h,timeout:p},m,{children:_(ZL,E({"aria-hidden":!0},C,{as:(o=(i=y.root)!=null?i:c.Root)!=null?o:u,className:te(w.root,l,C==null?void 0:C.className),ownerState:E({},g,C==null?void 0:C.ownerState),classes:w,ref:n,children:s}))}))}),tF=eF,nF=xe("MuiBox",["root"]),rF=nF,oF=Af(),iF=EI({themeId:gs,defaultTheme:oF,defaultClassName:rF.root,generateClassName:Q1.generate}),mn=iF;function aF(e){return _e("MuiButton",e)}const sF=xe("MuiButton",["root","text","textInherit","textPrimary","textSecondary","textSuccess","textError","textInfo","textWarning","outlined","outlinedInherit","outlinedPrimary","outlinedSecondary","outlinedSuccess","outlinedError","outlinedInfo","outlinedWarning","contained","containedInherit","containedPrimary","containedSecondary","containedSuccess","containedError","containedInfo","containedWarning","disableElevation","focusVisible","disabled","colorInherit","colorPrimary","colorSecondary","colorSuccess","colorError","colorInfo","colorWarning","textSizeSmall","textSizeMedium","textSizeLarge","outlinedSizeSmall","outlinedSizeMedium","outlinedSizeLarge","containedSizeSmall","containedSizeMedium","containedSizeLarge","sizeMedium","sizeSmall","sizeLarge","fullWidth","startIcon","endIcon","icon","iconSizeSmall","iconSizeMedium","iconSizeLarge"]),ed=sF,lF=x.createContext({}),w4=lF,uF=x.createContext(void 0),_4=uF,cF=["children","color","component","className","disabled","disableElevation","disableFocusRipple","endIcon","focusVisibleClassName","fullWidth","size","startIcon","type","variant"],dF=e=>{const{color:t,disableElevation:n,fullWidth:r,size:o,variant:i,classes:a}=e,s={root:["root",i,`${i}${K(t)}`,`size${K(o)}`,`${i}Size${K(o)}`,`color${K(t)}`,n&&"disableElevation",r&&"fullWidth"],label:["label"],startIcon:["icon","startIcon",`iconSize${K(o)}`],endIcon:["icon","endIcon",`iconSize${K(o)}`]},l=Ce(s,aF,a);return E({},a,l)},E4=e=>E({},e.size==="small"&&{"& > *:nth-of-type(1)":{fontSize:18}},e.size==="medium"&&{"& > *:nth-of-type(1)":{fontSize:20}},e.size==="large"&&{"& > *:nth-of-type(1)":{fontSize:22}}),fF=X(sc,{shouldForwardProp:e=>Nn(e)||e==="classes",name:"MuiButton",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[n.variant],t[`${n.variant}${K(n.color)}`],t[`size${K(n.size)}`],t[`${n.variant}Size${K(n.size)}`],n.color==="inherit"&&t.colorInherit,n.disableElevation&&t.disableElevation,n.fullWidth&&t.fullWidth]}})(({theme:e,ownerState:t})=>{var n,r;const o=e.palette.mode==="light"?e.palette.grey[300]:e.palette.grey[800],i=e.palette.mode==="light"?e.palette.grey.A100:e.palette.grey[700];return E({},e.typography.button,{minWidth:64,padding:"6px 16px",borderRadius:(e.vars||e).shape.borderRadius,transition:e.transitions.create(["background-color","box-shadow","border-color","color"],{duration:e.transitions.duration.short}),"&:hover":E({textDecoration:"none",backgroundColor:e.vars?`rgba(${e.vars.palette.text.primaryChannel} / ${e.vars.palette.action.hoverOpacity})`:Nt(e.palette.text.primary,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},t.variant==="text"&&t.color!=="inherit"&&{backgroundColor:e.vars?`rgba(${e.vars.palette[t.color].mainChannel} / ${e.vars.palette.action.hoverOpacity})`:Nt(e.palette[t.color].main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},t.variant==="outlined"&&t.color!=="inherit"&&{border:`1px solid ${(e.vars||e).palette[t.color].main}`,backgroundColor:e.vars?`rgba(${e.vars.palette[t.color].mainChannel} / ${e.vars.palette.action.hoverOpacity})`:Nt(e.palette[t.color].main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},t.variant==="contained"&&{backgroundColor:e.vars?e.vars.palette.Button.inheritContainedHoverBg:i,boxShadow:(e.vars||e).shadows[4],"@media (hover: none)":{boxShadow:(e.vars||e).shadows[2],backgroundColor:(e.vars||e).palette.grey[300]}},t.variant==="contained"&&t.color!=="inherit"&&{backgroundColor:(e.vars||e).palette[t.color].dark,"@media (hover: none)":{backgroundColor:(e.vars||e).palette[t.color].main}}),"&:active":E({},t.variant==="contained"&&{boxShadow:(e.vars||e).shadows[8]}),[`&.${ed.focusVisible}`]:E({},t.variant==="contained"&&{boxShadow:(e.vars||e).shadows[6]}),[`&.${ed.disabled}`]:E({color:(e.vars||e).palette.action.disabled},t.variant==="outlined"&&{border:`1px solid ${(e.vars||e).palette.action.disabledBackground}`},t.variant==="contained"&&{color:(e.vars||e).palette.action.disabled,boxShadow:(e.vars||e).shadows[0],backgroundColor:(e.vars||e).palette.action.disabledBackground})},t.variant==="text"&&{padding:"6px 8px"},t.variant==="text"&&t.color!=="inherit"&&{color:(e.vars||e).palette[t.color].main},t.variant==="outlined"&&{padding:"5px 15px",border:"1px solid currentColor"},t.variant==="outlined"&&t.color!=="inherit"&&{color:(e.vars||e).palette[t.color].main,border:e.vars?`1px solid rgba(${e.vars.palette[t.color].mainChannel} / 0.5)`:`1px solid ${Nt(e.palette[t.color].main,.5)}`},t.variant==="contained"&&{color:e.vars?e.vars.palette.text.primary:(n=(r=e.palette).getContrastText)==null?void 0:n.call(r,e.palette.grey[300]),backgroundColor:e.vars?e.vars.palette.Button.inheritContainedBg:o,boxShadow:(e.vars||e).shadows[2]},t.variant==="contained"&&t.color!=="inherit"&&{color:(e.vars||e).palette[t.color].contrastText,backgroundColor:(e.vars||e).palette[t.color].main},t.color==="inherit"&&{color:"inherit",borderColor:"currentColor"},t.size==="small"&&t.variant==="text"&&{padding:"4px 5px",fontSize:e.typography.pxToRem(13)},t.size==="large"&&t.variant==="text"&&{padding:"8px 11px",fontSize:e.typography.pxToRem(15)},t.size==="small"&&t.variant==="outlined"&&{padding:"3px 9px",fontSize:e.typography.pxToRem(13)},t.size==="large"&&t.variant==="outlined"&&{padding:"7px 21px",fontSize:e.typography.pxToRem(15)},t.size==="small"&&t.variant==="contained"&&{padding:"4px 10px",fontSize:e.typography.pxToRem(13)},t.size==="large"&&t.variant==="contained"&&{padding:"8px 22px",fontSize:e.typography.pxToRem(15)},t.fullWidth&&{width:"100%"})},({ownerState:e})=>e.disableElevation&&{boxShadow:"none","&:hover":{boxShadow:"none"},[`&.${ed.focusVisible}`]:{boxShadow:"none"},"&:active":{boxShadow:"none"},[`&.${ed.disabled}`]:{boxShadow:"none"}}),pF=X("span",{name:"MuiButton",slot:"StartIcon",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.startIcon,t[`iconSize${K(n.size)}`]]}})(({ownerState:e})=>E({display:"inherit",marginRight:8,marginLeft:-4},e.size==="small"&&{marginLeft:-2},E4(e))),hF=X("span",{name:"MuiButton",slot:"EndIcon",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.endIcon,t[`iconSize${K(n.size)}`]]}})(({ownerState:e})=>E({display:"inherit",marginRight:-4,marginLeft:8},e.size==="small"&&{marginRight:-2},E4(e))),mF=x.forwardRef(function(t,n){const r=x.useContext(w4),o=x.useContext(_4),i=ps(r,t),a=Ee({props:i,name:"MuiButton"}),{children:s,color:l="primary",component:u="button",className:c,disabled:d=!1,disableElevation:f=!1,disableFocusRipple:h=!1,endIcon:v,focusVisibleClassName:y,fullWidth:b=!1,size:p="medium",startIcon:m,type:g,variant:w="text"}=a,C=Y(a,cF),S=E({},a,{color:l,component:u,disabled:d,disableElevation:f,disableFocusRipple:h,fullWidth:b,size:p,type:g,variant:w}),$=dF(S),R=m&&_(pF,{className:$.startIcon,ownerState:S,children:m}),k=v&&_(hF,{className:$.endIcon,ownerState:S,children:v}),P=o||"";return G(fF,E({ownerState:S,className:te(r.className,$.root,c,P),component:u,disabled:d,focusRipple:!h,focusVisibleClassName:te($.focusVisible,y),ref:n,type:g},C,{classes:$,children:[R,s,k]}))}),Go=mF;function vF(e){return _e("MuiButtonGroup",e)}const gF=xe("MuiButtonGroup",["root","contained","outlined","text","disableElevation","disabled","firstButton","fullWidth","vertical","grouped","groupedHorizontal","groupedVertical","groupedText","groupedTextHorizontal","groupedTextVertical","groupedTextPrimary","groupedTextSecondary","groupedOutlined","groupedOutlinedHorizontal","groupedOutlinedVertical","groupedOutlinedPrimary","groupedOutlinedSecondary","groupedContained","groupedContainedHorizontal","groupedContainedVertical","groupedContainedPrimary","groupedContainedSecondary","lastButton","middleButton"]),Qt=gF,yF=["children","className","color","component","disabled","disableElevation","disableFocusRipple","disableRipple","fullWidth","orientation","size","variant"],bF=(e,t)=>{const{ownerState:n}=e;return[{[`& .${Qt.grouped}`]:t.grouped},{[`& .${Qt.grouped}`]:t[`grouped${K(n.orientation)}`]},{[`& .${Qt.grouped}`]:t[`grouped${K(n.variant)}`]},{[`& .${Qt.grouped}`]:t[`grouped${K(n.variant)}${K(n.orientation)}`]},{[`& .${Qt.grouped}`]:t[`grouped${K(n.variant)}${K(n.color)}`]},{[`& .${Qt.firstButton}`]:t.firstButton},{[`& .${Qt.lastButton}`]:t.lastButton},{[`& .${Qt.middleButton}`]:t.middleButton},t.root,t[n.variant],n.disableElevation===!0&&t.disableElevation,n.fullWidth&&t.fullWidth,n.orientation==="vertical"&&t.vertical]},xF=e=>{const{classes:t,color:n,disabled:r,disableElevation:o,fullWidth:i,orientation:a,variant:s}=e,l={root:["root",s,a==="vertical"&&"vertical",i&&"fullWidth",o&&"disableElevation"],grouped:["grouped",`grouped${K(a)}`,`grouped${K(s)}`,`grouped${K(s)}${K(a)}`,`grouped${K(s)}${K(n)}`,r&&"disabled"],firstButton:["firstButton"],lastButton:["lastButton"],middleButton:["middleButton"]};return Ce(l,vF,t)},SF=X("div",{name:"MuiButtonGroup",slot:"Root",overridesResolver:bF})(({theme:e,ownerState:t})=>E({display:"inline-flex",borderRadius:(e.vars||e).shape.borderRadius},t.variant==="contained"&&{boxShadow:(e.vars||e).shadows[2]},t.disableElevation&&{boxShadow:"none"},t.fullWidth&&{width:"100%"},t.orientation==="vertical"&&{flexDirection:"column"},{[`& .${Qt.grouped}`]:E({minWidth:40,"&:hover":E({},t.variant==="contained"&&{boxShadow:"none"})},t.variant==="contained"&&{boxShadow:"none"}),[`& .${Qt.firstButton},& .${Qt.middleButton}`]:E({},t.orientation==="horizontal"&&{borderTopRightRadius:0,borderBottomRightRadius:0},t.orientation==="vertical"&&{borderBottomRightRadius:0,borderBottomLeftRadius:0},t.variant==="text"&&t.orientation==="horizontal"&&{borderRight:e.vars?`1px solid rgba(${e.vars.palette.common.onBackgroundChannel} / 0.23)`:`1px solid ${e.palette.mode==="light"?"rgba(0, 0, 0, 0.23)":"rgba(255, 255, 255, 0.23)"}`,[`&.${Qt.disabled}`]:{borderRight:`1px solid ${(e.vars||e).palette.action.disabled}`}},t.variant==="text"&&t.orientation==="vertical"&&{borderBottom:e.vars?`1px solid rgba(${e.vars.palette.common.onBackgroundChannel} / 0.23)`:`1px solid ${e.palette.mode==="light"?"rgba(0, 0, 0, 0.23)":"rgba(255, 255, 255, 0.23)"}`,[`&.${Qt.disabled}`]:{borderBottom:`1px solid ${(e.vars||e).palette.action.disabled}`}},t.variant==="text"&&t.color!=="inherit"&&{borderColor:e.vars?`rgba(${e.vars.palette[t.color].mainChannel} / 0.5)`:Nt(e.palette[t.color].main,.5)},t.variant==="outlined"&&t.orientation==="horizontal"&&{borderRightColor:"transparent"},t.variant==="outlined"&&t.orientation==="vertical"&&{borderBottomColor:"transparent"},t.variant==="contained"&&t.orientation==="horizontal"&&{borderRight:`1px solid ${(e.vars||e).palette.grey[400]}`,[`&.${Qt.disabled}`]:{borderRight:`1px solid ${(e.vars||e).palette.action.disabled}`}},t.variant==="contained"&&t.orientation==="vertical"&&{borderBottom:`1px solid ${(e.vars||e).palette.grey[400]}`,[`&.${Qt.disabled}`]:{borderBottom:`1px solid ${(e.vars||e).palette.action.disabled}`}},t.variant==="contained"&&t.color!=="inherit"&&{borderColor:(e.vars||e).palette[t.color].dark},{"&:hover":E({},t.variant==="outlined"&&t.orientation==="horizontal"&&{borderRightColor:"currentColor"},t.variant==="outlined"&&t.orientation==="vertical"&&{borderBottomColor:"currentColor"})}),[`& .${Qt.lastButton},& .${Qt.middleButton}`]:E({},t.orientation==="horizontal"&&{borderTopLeftRadius:0,borderBottomLeftRadius:0},t.orientation==="vertical"&&{borderTopRightRadius:0,borderTopLeftRadius:0},t.variant==="outlined"&&t.orientation==="horizontal"&&{marginLeft:-1},t.variant==="outlined"&&t.orientation==="vertical"&&{marginTop:-1})})),wF=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiButtonGroup"}),{children:o,className:i,color:a="primary",component:s="div",disabled:l=!1,disableElevation:u=!1,disableFocusRipple:c=!1,disableRipple:d=!1,fullWidth:f=!1,orientation:h="horizontal",size:v="medium",variant:y="outlined"}=r,b=Y(r,yF),p=E({},r,{color:a,component:s,disabled:l,disableElevation:u,disableFocusRipple:c,disableRipple:d,fullWidth:f,orientation:h,size:v,variant:y}),m=xF(p),g=x.useMemo(()=>({className:m.grouped,color:a,disabled:l,disableElevation:u,disableFocusRipple:c,disableRipple:d,fullWidth:f,size:v,variant:y}),[a,l,u,c,d,f,v,y,m.grouped]),w=P$(o),C=w.length,S=$=>{const R=$===0,k=$===C-1;return R&&k?"":R?m.firstButton:k?m.lastButton:m.middleButton};return _(SF,E({as:s,role:"group",className:te(m.root,i),ref:n,ownerState:p},b,{children:_(w4.Provider,{value:g,children:w.map(($,R)=>_(_4.Provider,{value:S(R),children:$},R))})}))}),Hx=wF;function _F(e){return _e("MuiCard",e)}xe("MuiCard",["root"]);const EF=["className","raised"],CF=e=>{const{classes:t}=e;return Ce({root:["root"]},_F,t)},$F=X(gy,{name:"MuiCard",slot:"Root",overridesResolver:(e,t)=>t.root})(()=>({overflow:"hidden"})),RF=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiCard"}),{className:o,raised:i=!1}=r,a=Y(r,EF),s=E({},r,{raised:i}),l=CF(s);return _($F,E({className:te(l.root,o),elevation:i?8:void 0,ref:n,ownerState:s},a))}),Ov=RF;function kF(e){return _e("MuiCardActions",e)}xe("MuiCardActions",["root","spacing"]);const PF=["disableSpacing","className"],TF=e=>{const{classes:t,disableSpacing:n}=e;return Ce({root:["root",!n&&"spacing"]},kF,t)},OF=X("div",{name:"MuiCardActions",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,!n.disableSpacing&&t.spacing]}})(({ownerState:e})=>E({display:"flex",alignItems:"center",padding:8},!e.disableSpacing&&{"& > :not(style) ~ :not(style)":{marginLeft:8}})),IF=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiCardActions"}),{disableSpacing:o=!1,className:i}=r,a=Y(r,PF),s=E({},r,{disableSpacing:o}),l=TF(s);return _(OF,E({className:te(l.root,i),ownerState:s,ref:n},a))}),NF=IF;function AF(e){return _e("MuiCardContent",e)}xe("MuiCardContent",["root"]);const MF=["className","component"],LF=e=>{const{classes:t}=e;return Ce({root:["root"]},AF,t)},FF=X("div",{name:"MuiCardContent",slot:"Root",overridesResolver:(e,t)=>t.root})(()=>({padding:16,"&:last-child":{paddingBottom:24}})),DF=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiCardContent"}),{className:o,component:i="div"}=r,a=Y(r,MF),s=E({},r,{component:i}),l=LF(s);return _(FF,E({as:i,className:te(l.root,o),ownerState:s,ref:n},a))}),Ua=DF;function BF(e){return _e("MuiCardMedia",e)}xe("MuiCardMedia",["root","media","img"]);const zF=["children","className","component","image","src","style"],jF=e=>{const{classes:t,isMediaComponent:n,isImageComponent:r}=e;return Ce({root:["root",n&&"media",r&&"img"]},BF,t)},UF=X("div",{name:"MuiCardMedia",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e,{isMediaComponent:r,isImageComponent:o}=n;return[t.root,r&&t.media,o&&t.img]}})(({ownerState:e})=>E({display:"block",backgroundSize:"cover",backgroundRepeat:"no-repeat",backgroundPosition:"center"},e.isMediaComponent&&{width:"100%"},e.isImageComponent&&{objectFit:"cover"})),WF=["video","audio","picture","iframe","img"],HF=["picture","img"],VF=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiCardMedia"}),{children:o,className:i,component:a="div",image:s,src:l,style:u}=r,c=Y(r,zF),d=WF.indexOf(a)!==-1,f=!d&&s?E({backgroundImage:`url("${s}")`},u):u,h=E({},r,{component:a,isMediaComponent:d,isImageComponent:HF.indexOf(a)!==-1}),v=jF(h);return _(UF,E({className:te(v.root,i),as:a,role:!d&&s?"img":void 0,ref:n,style:f,ownerState:h,src:d?s||l:void 0},c,{children:o}))}),GF=VF;function KF(e){return _e("PrivateSwitchBase",e)}xe("PrivateSwitchBase",["root","checked","disabled","input","edgeStart","edgeEnd"]);const XF=["autoFocus","checked","checkedIcon","className","defaultChecked","disabled","disableFocusRipple","edge","icon","id","inputProps","inputRef","name","onBlur","onChange","onFocus","readOnly","required","tabIndex","type","value"],YF=e=>{const{classes:t,checked:n,disabled:r,edge:o}=e,i={root:["root",n&&"checked",r&&"disabled",o&&`edge${K(o)}`],input:["input"]};return Ce(i,KF,t)},qF=X(sc)(({ownerState:e})=>E({padding:9,borderRadius:"50%"},e.edge==="start"&&{marginLeft:e.size==="small"?-3:-12},e.edge==="end"&&{marginRight:e.size==="small"?-3:-12})),QF=X("input",{shouldForwardProp:Nn})({cursor:"inherit",position:"absolute",opacity:0,width:"100%",height:"100%",top:0,left:0,margin:0,padding:0,zIndex:1}),JF=x.forwardRef(function(t,n){const{autoFocus:r,checked:o,checkedIcon:i,className:a,defaultChecked:s,disabled:l,disableFocusRipple:u=!1,edge:c=!1,icon:d,id:f,inputProps:h,inputRef:v,name:y,onBlur:b,onChange:p,onFocus:m,readOnly:g,required:w=!1,tabIndex:C,type:S,value:$}=t,R=Y(t,XF),[k,P]=vs({controlled:o,default:!!s,name:"SwitchBase",state:"checked"}),N=gi(),F=z=>{m&&m(z),N&&N.onFocus&&N.onFocus(z)},L=z=>{b&&b(z),N&&N.onBlur&&N.onBlur(z)},D=z=>{if(z.nativeEvent.defaultPrevented)return;const H=z.target.checked;P(H),p&&p(z,H)};let M=l;N&&typeof M>"u"&&(M=N.disabled);const j=S==="checkbox"||S==="radio",B=E({},t,{checked:k,disabled:M,disableFocusRipple:u,edge:c}),I=YF(B);return G(qF,E({component:"span",className:te(I.root,a),centerRipple:!0,focusRipple:!u,disabled:M,tabIndex:null,role:void 0,onFocus:F,onBlur:L,ownerState:B,ref:n},R,{children:[_(QF,E({autoFocus:r,checked:o,defaultChecked:s,className:I.input,disabled:M,id:j?f:void 0,name:y,onChange:D,readOnly:g,ref:v,required:w,ownerState:B,tabIndex:C,type:S},S==="checkbox"&&$===void 0?{}:{value:$},h)),k?i:d]}))}),ZF=JF,eD=la(_("path",{d:"M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"}),"CheckBoxOutlineBlank"),tD=la(_("path",{d:"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"}),"CheckBox"),nD=la(_("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"}),"IndeterminateCheckBox");function rD(e){return _e("MuiCheckbox",e)}const oD=xe("MuiCheckbox",["root","checked","disabled","indeterminate","colorPrimary","colorSecondary","sizeSmall","sizeMedium"]),km=oD,iD=["checkedIcon","color","icon","indeterminate","indeterminateIcon","inputProps","size","className"],aD=e=>{const{classes:t,indeterminate:n,color:r,size:o}=e,i={root:["root",n&&"indeterminate",`color${K(r)}`,`size${K(o)}`]},a=Ce(i,rD,t);return E({},t,a)},sD=X(ZF,{shouldForwardProp:e=>Nn(e)||e==="classes",name:"MuiCheckbox",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,n.indeterminate&&t.indeterminate,t[`size${K(n.size)}`],n.color!=="default"&&t[`color${K(n.color)}`]]}})(({theme:e,ownerState:t})=>E({color:(e.vars||e).palette.text.secondary},!t.disableRipple&&{"&:hover":{backgroundColor:e.vars?`rgba(${t.color==="default"?e.vars.palette.action.activeChannel:e.vars.palette[t.color].mainChannel} / ${e.vars.palette.action.hoverOpacity})`:Nt(t.color==="default"?e.palette.action.active:e.palette[t.color].main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},t.color!=="default"&&{[`&.${km.checked}, &.${km.indeterminate}`]:{color:(e.vars||e).palette[t.color].main},[`&.${km.disabled}`]:{color:(e.vars||e).palette.action.disabled}})),lD=_(tD,{}),uD=_(eD,{}),cD=_(nD,{}),dD=x.forwardRef(function(t,n){var r,o;const i=Ee({props:t,name:"MuiCheckbox"}),{checkedIcon:a=lD,color:s="primary",icon:l=uD,indeterminate:u=!1,indeterminateIcon:c=cD,inputProps:d,size:f="medium",className:h}=i,v=Y(i,iD),y=u?c:l,b=u?c:a,p=E({},i,{color:s,indeterminate:u,size:f}),m=aD(p);return _(sD,E({type:"checkbox",inputProps:E({"data-indeterminate":u},d),icon:x.cloneElement(y,{fontSize:(r=y.props.fontSize)!=null?r:f}),checkedIcon:x.cloneElement(b,{fontSize:(o=b.props.fontSize)!=null?o:f}),ownerState:p,ref:n,className:te(m.root,h)},v,{classes:m}))}),Pm=dD,fD=CN({createStyledComponent:X("div",{name:"MuiContainer",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[`maxWidth${K(String(n.maxWidth))}`],n.fixed&&t.fixed,n.disableGutters&&t.disableGutters]}}),useThemeProps:e=>Ee({props:e,name:"MuiContainer"})}),pD=fD;function hD(e){const t=ln(e);return t.body===e?ai(e).innerWidth>t.documentElement.clientWidth:e.scrollHeight>e.clientHeight}function uu(e,t){t?e.setAttribute("aria-hidden","true"):e.removeAttribute("aria-hidden")}function Vx(e){return parseInt(ai(e).getComputedStyle(e).paddingRight,10)||0}function mD(e){const n=["TEMPLATE","SCRIPT","STYLE","LINK","MAP","META","NOSCRIPT","PICTURE","COL","COLGROUP","PARAM","SLOT","SOURCE","TRACK"].indexOf(e.tagName)!==-1,r=e.tagName==="INPUT"&&e.getAttribute("type")==="hidden";return n||r}function Gx(e,t,n,r,o){const i=[t,n,...r];[].forEach.call(e.children,a=>{const s=i.indexOf(a)===-1,l=!mD(a);s&&l&&uu(a,o)})}function Tm(e,t){let n=-1;return e.some((r,o)=>t(r)?(n=o,!0):!1),n}function vD(e,t){const n=[],r=e.container;if(!t.disableScrollLock){if(hD(r)){const a=k$(ln(r));n.push({value:r.style.paddingRight,property:"padding-right",el:r}),r.style.paddingRight=`${Vx(r)+a}px`;const s=ln(r).querySelectorAll(".mui-fixed");[].forEach.call(s,l=>{n.push({value:l.style.paddingRight,property:"padding-right",el:l}),l.style.paddingRight=`${Vx(l)+a}px`})}let i;if(r.parentNode instanceof DocumentFragment)i=ln(r).body;else{const a=r.parentElement,s=ai(r);i=(a==null?void 0:a.nodeName)==="HTML"&&s.getComputedStyle(a).overflowY==="scroll"?a:r}n.push({value:i.style.overflow,property:"overflow",el:i},{value:i.style.overflowX,property:"overflow-x",el:i},{value:i.style.overflowY,property:"overflow-y",el:i}),i.style.overflow="hidden"}return()=>{n.forEach(({value:i,el:a,property:s})=>{i?a.style.setProperty(s,i):a.style.removeProperty(s)})}}function gD(e){const t=[];return[].forEach.call(e.children,n=>{n.getAttribute("aria-hidden")==="true"&&t.push(n)}),t}class yD{constructor(){this.containers=void 0,this.modals=void 0,this.modals=[],this.containers=[]}add(t,n){let r=this.modals.indexOf(t);if(r!==-1)return r;r=this.modals.length,this.modals.push(t),t.modalRef&&uu(t.modalRef,!1);const o=gD(n);Gx(n,t.mount,t.modalRef,o,!0);const i=Tm(this.containers,a=>a.container===n);return i!==-1?(this.containers[i].modals.push(t),r):(this.containers.push({modals:[t],container:n,restore:null,hiddenSiblings:o}),r)}mount(t,n){const r=Tm(this.containers,i=>i.modals.indexOf(t)!==-1),o=this.containers[r];o.restore||(o.restore=vD(o,n))}remove(t,n=!0){const r=this.modals.indexOf(t);if(r===-1)return r;const o=Tm(this.containers,a=>a.modals.indexOf(t)!==-1),i=this.containers[o];if(i.modals.splice(i.modals.indexOf(t),1),this.modals.splice(r,1),i.modals.length===0)i.restore&&i.restore(),t.modalRef&&uu(t.modalRef,n),Gx(i.container,t.mount,t.modalRef,i.hiddenSiblings,!1),this.containers.splice(o,1);else{const a=i.modals[i.modals.length-1];a.modalRef&&uu(a.modalRef,!1)}return r}isTopModal(t){return this.modals.length>0&&this.modals[this.modals.length-1]===t}}const bD=["input","select","textarea","a[href]","button","[tabindex]","audio[controls]","video[controls]",'[contenteditable]:not([contenteditable="false"])'].join(",");function xD(e){const t=parseInt(e.getAttribute("tabindex")||"",10);return Number.isNaN(t)?e.contentEditable==="true"||(e.nodeName==="AUDIO"||e.nodeName==="VIDEO"||e.nodeName==="DETAILS")&&e.getAttribute("tabindex")===null?0:e.tabIndex:t}function SD(e){if(e.tagName!=="INPUT"||e.type!=="radio"||!e.name)return!1;const t=r=>e.ownerDocument.querySelector(`input[type="radio"]${r}`);let n=t(`[name="${e.name}"]:checked`);return n||(n=t(`[name="${e.name}"]`)),n!==e}function wD(e){return!(e.disabled||e.tagName==="INPUT"&&e.type==="hidden"||SD(e))}function _D(e){const t=[],n=[];return Array.from(e.querySelectorAll(bD)).forEach((r,o)=>{const i=xD(r);i===-1||!wD(r)||(i===0?t.push(r):n.push({documentOrder:o,tabIndex:i,node:r}))}),n.sort((r,o)=>r.tabIndex===o.tabIndex?r.documentOrder-o.documentOrder:r.tabIndex-o.tabIndex).map(r=>r.node).concat(t)}function ED(){return!0}function CD(e){const{children:t,disableAutoFocus:n=!1,disableEnforceFocus:r=!1,disableRestoreFocus:o=!1,getTabbable:i=_D,isEnabled:a=ED,open:s}=e,l=x.useRef(!1),u=x.useRef(null),c=x.useRef(null),d=x.useRef(null),f=x.useRef(null),h=x.useRef(!1),v=x.useRef(null),y=Tt(t.ref,v),b=x.useRef(null);x.useEffect(()=>{!s||!v.current||(h.current=!n)},[n,s]),x.useEffect(()=>{if(!s||!v.current)return;const g=ln(v.current);return v.current.contains(g.activeElement)||(v.current.hasAttribute("tabIndex")||v.current.setAttribute("tabIndex","-1"),h.current&&v.current.focus()),()=>{o||(d.current&&d.current.focus&&(l.current=!0,d.current.focus()),d.current=null)}},[s]),x.useEffect(()=>{if(!s||!v.current)return;const g=ln(v.current),w=$=>{b.current=$,!(r||!a()||$.key!=="Tab")&&g.activeElement===v.current&&$.shiftKey&&(l.current=!0,c.current&&c.current.focus())},C=()=>{const $=v.current;if($===null)return;if(!g.hasFocus()||!a()||l.current){l.current=!1;return}if($.contains(g.activeElement)||r&&g.activeElement!==u.current&&g.activeElement!==c.current)return;if(g.activeElement!==f.current)f.current=null;else if(f.current!==null)return;if(!h.current)return;let R=[];if((g.activeElement===u.current||g.activeElement===c.current)&&(R=i(v.current)),R.length>0){var k,P;const N=!!((k=b.current)!=null&&k.shiftKey&&((P=b.current)==null?void 0:P.key)==="Tab"),F=R[0],L=R[R.length-1];typeof F!="string"&&typeof L!="string"&&(N?L.focus():F.focus())}else $.focus()};g.addEventListener("focusin",C),g.addEventListener("keydown",w,!0);const S=setInterval(()=>{g.activeElement&&g.activeElement.tagName==="BODY"&&C()},50);return()=>{clearInterval(S),g.removeEventListener("focusin",C),g.removeEventListener("keydown",w,!0)}},[n,r,o,a,s,i]);const p=g=>{d.current===null&&(d.current=g.relatedTarget),h.current=!0,f.current=g.target;const w=t.props.onFocus;w&&w(g)},m=g=>{d.current===null&&(d.current=g.relatedTarget),h.current=!0};return G(x.Fragment,{children:[_("div",{tabIndex:s?0:-1,onFocus:m,ref:u,"data-testid":"sentinelStart"}),x.cloneElement(t,{ref:y,onFocus:p}),_("div",{tabIndex:s?0:-1,onFocus:m,ref:c,"data-testid":"sentinelEnd"})]})}function $D(e){return typeof e=="function"?e():e}function RD(e){return e?e.props.hasOwnProperty("in"):!1}const kD=new yD;function PD(e){const{container:t,disableEscapeKeyDown:n=!1,disableScrollLock:r=!1,manager:o=kD,closeAfterTransition:i=!1,onTransitionEnter:a,onTransitionExited:s,children:l,onClose:u,open:c,rootRef:d}=e,f=x.useRef({}),h=x.useRef(null),v=x.useRef(null),y=Tt(v,d),[b,p]=x.useState(!c),m=RD(l);let g=!0;(e["aria-hidden"]==="false"||e["aria-hidden"]===!1)&&(g=!1);const w=()=>ln(h.current),C=()=>(f.current.modalRef=v.current,f.current.mount=h.current,f.current),S=()=>{o.mount(C(),{disableScrollLock:r}),v.current&&(v.current.scrollTop=0)},$=fo(()=>{const j=$D(t)||w().body;o.add(C(),j),v.current&&S()}),R=x.useCallback(()=>o.isTopModal(C()),[o]),k=fo(j=>{h.current=j,j&&(c&&R()?S():v.current&&uu(v.current,g))}),P=x.useCallback(()=>{o.remove(C(),g)},[g,o]);x.useEffect(()=>()=>{P()},[P]),x.useEffect(()=>{c?$():(!m||!i)&&P()},[c,P,m,i,$]);const N=j=>B=>{var I;(I=j.onKeyDown)==null||I.call(j,B),!(B.key!=="Escape"||B.which===229||!R())&&(n||(B.stopPropagation(),u&&u(B,"escapeKeyDown")))},F=j=>B=>{var I;(I=j.onClick)==null||I.call(j,B),B.target===B.currentTarget&&u&&u(B,"backdropClick")};return{getRootProps:(j={})=>{const B=T$(e);delete B.onTransitionEnter,delete B.onTransitionExited;const I=E({},B,j);return E({role:"presentation"},I,{onKeyDown:N(I),ref:y})},getBackdropProps:(j={})=>{const B=j;return E({"aria-hidden":!0},B,{onClick:F(B),open:c})},getTransitionProps:()=>{const j=()=>{p(!1),a&&a()},B=()=>{p(!0),s&&s(),i&&P()};return{onEnter:xv(j,l==null?void 0:l.props.onEnter),onExited:xv(B,l==null?void 0:l.props.onExited)}},rootRef:y,portalRef:k,isTopModal:R,exited:b,hasTransition:m}}function TD(e){return _e("MuiModal",e)}xe("MuiModal",["root","hidden","backdrop"]);const OD=["BackdropComponent","BackdropProps","classes","className","closeAfterTransition","children","container","component","components","componentsProps","disableAutoFocus","disableEnforceFocus","disableEscapeKeyDown","disablePortal","disableRestoreFocus","disableScrollLock","hideBackdrop","keepMounted","onBackdropClick","onClose","onTransitionEnter","onTransitionExited","open","slotProps","slots","theme"],ID=e=>{const{open:t,exited:n,classes:r}=e;return Ce({root:["root",!t&&n&&"hidden"],backdrop:["backdrop"]},TD,r)},ND=X("div",{name:"MuiModal",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,!n.open&&n.exited&&t.hidden]}})(({theme:e,ownerState:t})=>E({position:"fixed",zIndex:(e.vars||e).zIndex.modal,right:0,bottom:0,top:0,left:0},!t.open&&t.exited&&{visibility:"hidden"})),AD=X(tF,{name:"MuiModal",slot:"Backdrop",overridesResolver:(e,t)=>t.backdrop})({zIndex:-1}),MD=x.forwardRef(function(t,n){var r,o,i,a,s,l;const u=Ee({name:"MuiModal",props:t}),{BackdropComponent:c=AD,BackdropProps:d,className:f,closeAfterTransition:h=!1,children:v,container:y,component:b,components:p={},componentsProps:m={},disableAutoFocus:g=!1,disableEnforceFocus:w=!1,disableEscapeKeyDown:C=!1,disablePortal:S=!1,disableRestoreFocus:$=!1,disableScrollLock:R=!1,hideBackdrop:k=!1,keepMounted:P=!1,onBackdropClick:N,open:F,slotProps:L,slots:D}=u,M=Y(u,OD),j=E({},u,{closeAfterTransition:h,disableAutoFocus:g,disableEnforceFocus:w,disableEscapeKeyDown:C,disablePortal:S,disableRestoreFocus:$,disableScrollLock:R,hideBackdrop:k,keepMounted:P}),{getRootProps:B,getBackdropProps:I,getTransitionProps:z,portalRef:H,isTopModal:le,exited:ae,hasTransition:ye}=PD(E({},j,{rootRef:n})),J=E({},j,{exited:ae}),he=ID(J),V={};if(v.props.tabIndex===void 0&&(V.tabIndex="-1"),ye){const{onEnter:ge,onExited:$e}=z();V.onEnter=ge,V.onExited=$e}const me=(r=(o=D==null?void 0:D.root)!=null?o:p.Root)!=null?r:ND,we=(i=(a=D==null?void 0:D.backdrop)!=null?a:p.Backdrop)!=null?i:c,Se=(s=L==null?void 0:L.root)!=null?s:m.root,Fe=(l=L==null?void 0:L.backdrop)!=null?l:m.backdrop,ie=qi({elementType:me,externalSlotProps:Se,externalForwardedProps:M,getSlotProps:B,additionalProps:{ref:n,as:b},ownerState:J,className:te(f,Se==null?void 0:Se.className,he==null?void 0:he.root,!J.open&&J.exited&&(he==null?void 0:he.hidden))}),Oe=qi({elementType:we,externalSlotProps:Fe,additionalProps:d,getSlotProps:ge=>I(E({},ge,{onClick:$e=>{N&&N($e),ge!=null&&ge.onClick&&ge.onClick($e)}})),className:te(Fe==null?void 0:Fe.className,d==null?void 0:d.className,he==null?void 0:he.backdrop),ownerState:J});return!P&&!F&&(!ye||ae)?null:_(x4,{ref:H,container:y,disablePortal:S,children:G(me,E({},ie,{children:[!k&&c?_(we,E({},Oe)):null,_(CD,{disableEnforceFocus:w,disableAutoFocus:g,disableRestoreFocus:$,isEnabled:le,open:F,children:x.cloneElement(v,V)})]}))})}),C4=MD,LD=xe("MuiDivider",["root","absolute","fullWidth","inset","middle","flexItem","light","vertical","withChildren","withChildrenVertical","textAlignRight","textAlignLeft","wrapper","wrapperVertical"]),Kx=LD,FD=["disableUnderline","components","componentsProps","fullWidth","hiddenLabel","inputComponent","multiline","slotProps","slots","type"],DD=e=>{const{classes:t,disableUnderline:n}=e,o=Ce({root:["root",!n&&"underline"],input:["input"]},WL,t);return E({},t,o)},BD=X(vh,{shouldForwardProp:e=>Nn(e)||e==="classes",name:"MuiFilledInput",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[...hh(e,t),!n.disableUnderline&&t.underline]}})(({theme:e,ownerState:t})=>{var n;const r=e.palette.mode==="light",o=r?"rgba(0, 0, 0, 0.42)":"rgba(255, 255, 255, 0.7)",i=r?"rgba(0, 0, 0, 0.06)":"rgba(255, 255, 255, 0.09)",a=r?"rgba(0, 0, 0, 0.09)":"rgba(255, 255, 255, 0.13)",s=r?"rgba(0, 0, 0, 0.12)":"rgba(255, 255, 255, 0.12)";return E({position:"relative",backgroundColor:e.vars?e.vars.palette.FilledInput.bg:i,borderTopLeftRadius:(e.vars||e).shape.borderRadius,borderTopRightRadius:(e.vars||e).shape.borderRadius,transition:e.transitions.create("background-color",{duration:e.transitions.duration.shorter,easing:e.transitions.easing.easeOut}),"&:hover":{backgroundColor:e.vars?e.vars.palette.FilledInput.hoverBg:a,"@media (hover: none)":{backgroundColor:e.vars?e.vars.palette.FilledInput.bg:i}},[`&.${Si.focused}`]:{backgroundColor:e.vars?e.vars.palette.FilledInput.bg:i},[`&.${Si.disabled}`]:{backgroundColor:e.vars?e.vars.palette.FilledInput.disabledBg:s}},!t.disableUnderline&&{"&::after":{borderBottom:`2px solid ${(n=(e.vars||e).palette[t.color||"primary"])==null?void 0:n.main}`,left:0,bottom:0,content:'""',position:"absolute",right:0,transform:"scaleX(0)",transition:e.transitions.create("transform",{duration:e.transitions.duration.shorter,easing:e.transitions.easing.easeOut}),pointerEvents:"none"},[`&.${Si.focused}:after`]:{transform:"scaleX(1) translateX(0)"},[`&.${Si.error}`]:{"&::before, &::after":{borderBottomColor:(e.vars||e).palette.error.main}},"&::before":{borderBottom:`1px solid ${e.vars?`rgba(${e.vars.palette.common.onBackgroundChannel} / ${e.vars.opacity.inputUnderline})`:o}`,left:0,bottom:0,content:'"\\00a0"',position:"absolute",right:0,transition:e.transitions.create("border-bottom-color",{duration:e.transitions.duration.shorter}),pointerEvents:"none"},[`&:hover:not(.${Si.disabled}, .${Si.error}):before`]:{borderBottom:`1px solid ${(e.vars||e).palette.text.primary}`},[`&.${Si.disabled}:before`]:{borderBottomStyle:"dotted"}},t.startAdornment&&{paddingLeft:12},t.endAdornment&&{paddingRight:12},t.multiline&&E({padding:"25px 12px 8px"},t.size==="small"&&{paddingTop:21,paddingBottom:4},t.hiddenLabel&&{paddingTop:16,paddingBottom:17},t.hiddenLabel&&t.size==="small"&&{paddingTop:8,paddingBottom:9}))}),zD=X(gh,{name:"MuiFilledInput",slot:"Input",overridesResolver:mh})(({theme:e,ownerState:t})=>E({paddingTop:25,paddingRight:12,paddingBottom:8,paddingLeft:12},!e.vars&&{"&:-webkit-autofill":{WebkitBoxShadow:e.palette.mode==="light"?null:"0 0 0 100px #266798 inset",WebkitTextFillColor:e.palette.mode==="light"?null:"#fff",caretColor:e.palette.mode==="light"?null:"#fff",borderTopLeftRadius:"inherit",borderTopRightRadius:"inherit"}},e.vars&&{"&:-webkit-autofill":{borderTopLeftRadius:"inherit",borderTopRightRadius:"inherit"},[e.getColorSchemeSelector("dark")]:{"&:-webkit-autofill":{WebkitBoxShadow:"0 0 0 100px #266798 inset",WebkitTextFillColor:"#fff",caretColor:"#fff"}}},t.size==="small"&&{paddingTop:21,paddingBottom:4},t.hiddenLabel&&{paddingTop:16,paddingBottom:17},t.startAdornment&&{paddingLeft:0},t.endAdornment&&{paddingRight:0},t.hiddenLabel&&t.size==="small"&&{paddingTop:8,paddingBottom:9},t.multiline&&{paddingTop:0,paddingBottom:0,paddingLeft:0,paddingRight:0})),$4=x.forwardRef(function(t,n){var r,o,i,a;const s=Ee({props:t,name:"MuiFilledInput"}),{components:l={},componentsProps:u,fullWidth:c=!1,inputComponent:d="input",multiline:f=!1,slotProps:h,slots:v={},type:y="text"}=s,b=Y(s,FD),p=E({},s,{fullWidth:c,inputComponent:d,multiline:f,type:y}),m=DD(s),g={root:{ownerState:p},input:{ownerState:p}},w=h??u?gn(g,h??u):g,C=(r=(o=v.root)!=null?o:l.Root)!=null?r:BD,S=(i=(a=v.input)!=null?a:l.Input)!=null?i:zD;return _(yh,E({slots:{root:C,input:S},componentsProps:w,fullWidth:c,inputComponent:d,multiline:f,ref:n,type:y},b,{classes:m}))});$4.muiName="Input";const R4=$4;function jD(e){return _e("MuiFormControl",e)}xe("MuiFormControl",["root","marginNone","marginNormal","marginDense","fullWidth","disabled"]);const UD=["children","className","color","component","disabled","error","focused","fullWidth","hiddenLabel","margin","required","size","variant"],WD=e=>{const{classes:t,margin:n,fullWidth:r}=e,o={root:["root",n!=="none"&&`margin${K(n)}`,r&&"fullWidth"]};return Ce(o,jD,t)},HD=X("div",{name:"MuiFormControl",slot:"Root",overridesResolver:({ownerState:e},t)=>E({},t.root,t[`margin${K(e.margin)}`],e.fullWidth&&t.fullWidth)})(({ownerState:e})=>E({display:"inline-flex",flexDirection:"column",position:"relative",minWidth:0,padding:0,margin:0,border:0,verticalAlign:"top"},e.margin==="normal"&&{marginTop:16,marginBottom:8},e.margin==="dense"&&{marginTop:8,marginBottom:4},e.fullWidth&&{width:"100%"})),VD=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiFormControl"}),{children:o,className:i,color:a="primary",component:s="div",disabled:l=!1,error:u=!1,focused:c,fullWidth:d=!1,hiddenLabel:f=!1,margin:h="none",required:v=!1,size:y="medium",variant:b="outlined"}=r,p=Y(r,UD),m=E({},r,{color:a,component:s,disabled:l,error:u,fullWidth:d,hiddenLabel:f,margin:h,required:v,size:y,variant:b}),g=WD(m),[w,C]=x.useState(()=>{let L=!1;return o&&x.Children.forEach(o,D=>{if(!Vd(D,["Input","Select"]))return;const M=Vd(D,["Select"])?D.props.input:D;M&&IL(M.props)&&(L=!0)}),L}),[S,$]=x.useState(()=>{let L=!1;return o&&x.Children.forEach(o,D=>{Vd(D,["Input","Select"])&&(Df(D.props,!0)||Df(D.props.inputProps,!0))&&(L=!0)}),L}),[R,k]=x.useState(!1);l&&R&&k(!1);const P=c!==void 0&&!l?c:R;let N;const F=x.useMemo(()=>({adornedStart:w,setAdornedStart:C,color:a,disabled:l,error:u,filled:S,focused:P,fullWidth:d,hiddenLabel:f,size:y,onBlur:()=>{k(!1)},onEmpty:()=>{$(!1)},onFilled:()=>{$(!0)},onFocus:()=>{k(!0)},registerEffect:N,required:v,variant:b}),[w,a,l,u,S,P,d,f,N,v,y,b]);return _($y.Provider,{value:F,children:_(HD,E({as:s,ownerState:m,className:te(g.root,i),ref:n},p,{children:o}))})}),Iv=VD,GD=NN({createStyledComponent:X("div",{name:"MuiStack",slot:"Root",overridesResolver:(e,t)=>t.root}),useThemeProps:e=>Ee({props:e,name:"MuiStack"})}),Ai=GD;function KD(e){return _e("MuiFormControlLabel",e)}const XD=xe("MuiFormControlLabel",["root","labelPlacementStart","labelPlacementTop","labelPlacementBottom","disabled","label","error","required","asterisk"]),Vl=XD,YD=["checked","className","componentsProps","control","disabled","disableTypography","inputRef","label","labelPlacement","name","onChange","required","slotProps","value"],qD=e=>{const{classes:t,disabled:n,labelPlacement:r,error:o,required:i}=e,a={root:["root",n&&"disabled",`labelPlacement${K(r)}`,o&&"error",i&&"required"],label:["label",n&&"disabled"],asterisk:["asterisk",o&&"error"]};return Ce(a,KD,t)},QD=X("label",{name:"MuiFormControlLabel",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[{[`& .${Vl.label}`]:t.label},t.root,t[`labelPlacement${K(n.labelPlacement)}`]]}})(({theme:e,ownerState:t})=>E({display:"inline-flex",alignItems:"center",cursor:"pointer",verticalAlign:"middle",WebkitTapHighlightColor:"transparent",marginLeft:-11,marginRight:16,[`&.${Vl.disabled}`]:{cursor:"default"}},t.labelPlacement==="start"&&{flexDirection:"row-reverse",marginLeft:16,marginRight:-11},t.labelPlacement==="top"&&{flexDirection:"column-reverse",marginLeft:16},t.labelPlacement==="bottom"&&{flexDirection:"column",marginLeft:16},{[`& .${Vl.label}`]:{[`&.${Vl.disabled}`]:{color:(e.vars||e).palette.text.disabled}}})),JD=X("span",{name:"MuiFormControlLabel",slot:"Asterisk",overridesResolver:(e,t)=>t.asterisk})(({theme:e})=>({[`&.${Vl.error}`]:{color:(e.vars||e).palette.error.main}})),ZD=x.forwardRef(function(t,n){var r,o;const i=Ee({props:t,name:"MuiFormControlLabel"}),{className:a,componentsProps:s={},control:l,disabled:u,disableTypography:c,label:d,labelPlacement:f="end",required:h,slotProps:v={}}=i,y=Y(i,YD),b=gi(),p=(r=u??l.props.disabled)!=null?r:b==null?void 0:b.disabled,m=h??l.props.required,g={disabled:p,required:m};["checked","name","onChange","value","inputRef"].forEach(k=>{typeof l.props[k]>"u"&&typeof i[k]<"u"&&(g[k]=i[k])});const w=ua({props:i,muiFormControl:b,states:["error"]}),C=E({},i,{disabled:p,labelPlacement:f,required:m,error:w.error}),S=qD(C),$=(o=v.typography)!=null?o:s.typography;let R=d;return R!=null&&R.type!==st&&!c&&(R=_(st,E({component:"span"},$,{className:te(S.label,$==null?void 0:$.className),children:R}))),G(QD,E({className:te(S.root,a),ownerState:C,ref:n},y,{children:[x.cloneElement(l,g),m?G(Ai,{display:"block",children:[R,G(JD,{ownerState:C,"aria-hidden":!0,className:S.asterisk,children:[" ","*"]})]}):R]}))}),Om=ZD;function eB(e){return _e("MuiFormHelperText",e)}const tB=xe("MuiFormHelperText",["root","error","disabled","sizeSmall","sizeMedium","contained","focused","filled","required"]),Xx=tB;var Yx;const nB=["children","className","component","disabled","error","filled","focused","margin","required","variant"],rB=e=>{const{classes:t,contained:n,size:r,disabled:o,error:i,filled:a,focused:s,required:l}=e,u={root:["root",o&&"disabled",i&&"error",r&&`size${K(r)}`,n&&"contained",s&&"focused",a&&"filled",l&&"required"]};return Ce(u,eB,t)},oB=X("p",{name:"MuiFormHelperText",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,n.size&&t[`size${K(n.size)}`],n.contained&&t.contained,n.filled&&t.filled]}})(({theme:e,ownerState:t})=>E({color:(e.vars||e).palette.text.secondary},e.typography.caption,{textAlign:"left",marginTop:3,marginRight:0,marginBottom:0,marginLeft:0,[`&.${Xx.disabled}`]:{color:(e.vars||e).palette.text.disabled},[`&.${Xx.error}`]:{color:(e.vars||e).palette.error.main}},t.size==="small"&&{marginTop:4},t.contained&&{marginLeft:14,marginRight:14})),iB=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiFormHelperText"}),{children:o,className:i,component:a="p"}=r,s=Y(r,nB),l=gi(),u=ua({props:r,muiFormControl:l,states:["variant","size","disabled","error","filled","focused","required"]}),c=E({},r,{component:a,contained:u.variant==="filled"||u.variant==="outlined",variant:u.variant,size:u.size,disabled:u.disabled,error:u.error,filled:u.filled,focused:u.focused,required:u.required}),d=rB(c);return _(oB,E({as:a,ownerState:c,className:te(d.root,i),ref:n},s,{children:o===" "?Yx||(Yx=_("span",{className:"notranslate",children:"​"})):o}))}),aB=iB;function sB(e){return _e("MuiFormLabel",e)}const lB=xe("MuiFormLabel",["root","colorSecondary","focused","disabled","error","filled","required","asterisk"]),cu=lB,uB=["children","className","color","component","disabled","error","filled","focused","required"],cB=e=>{const{classes:t,color:n,focused:r,disabled:o,error:i,filled:a,required:s}=e,l={root:["root",`color${K(n)}`,o&&"disabled",i&&"error",a&&"filled",r&&"focused",s&&"required"],asterisk:["asterisk",i&&"error"]};return Ce(l,sB,t)},dB=X("label",{name:"MuiFormLabel",slot:"Root",overridesResolver:({ownerState:e},t)=>E({},t.root,e.color==="secondary"&&t.colorSecondary,e.filled&&t.filled)})(({theme:e,ownerState:t})=>E({color:(e.vars||e).palette.text.secondary},e.typography.body1,{lineHeight:"1.4375em",padding:0,position:"relative",[`&.${cu.focused}`]:{color:(e.vars||e).palette[t.color].main},[`&.${cu.disabled}`]:{color:(e.vars||e).palette.text.disabled},[`&.${cu.error}`]:{color:(e.vars||e).palette.error.main}})),fB=X("span",{name:"MuiFormLabel",slot:"Asterisk",overridesResolver:(e,t)=>t.asterisk})(({theme:e})=>({[`&.${cu.error}`]:{color:(e.vars||e).palette.error.main}})),pB=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiFormLabel"}),{children:o,className:i,component:a="label"}=r,s=Y(r,uB),l=gi(),u=ua({props:r,muiFormControl:l,states:["color","required","focused","disabled","error","filled"]}),c=E({},r,{color:u.color||"primary",component:a,disabled:u.disabled,error:u.error,filled:u.filled,focused:u.focused,required:u.required}),d=cB(c);return G(dB,E({as:a,ownerState:c,className:te(d.root,i),ref:n},s,{children:[o,u.required&&G(fB,{ownerState:c,"aria-hidden":!0,className:d.asterisk,children:[" ","*"]})]}))}),hB=pB,mB=x.createContext(),qx=mB;function vB(e){return _e("MuiGrid",e)}const gB=[0,1,2,3,4,5,6,7,8,9,10],yB=["column-reverse","column","row-reverse","row"],bB=["nowrap","wrap-reverse","wrap"],bl=["auto",!0,1,2,3,4,5,6,7,8,9,10,11,12],Du=xe("MuiGrid",["root","container","item","zeroMinWidth",...gB.map(e=>`spacing-xs-${e}`),...yB.map(e=>`direction-xs-${e}`),...bB.map(e=>`wrap-xs-${e}`),...bl.map(e=>`grid-xs-${e}`),...bl.map(e=>`grid-sm-${e}`),...bl.map(e=>`grid-md-${e}`),...bl.map(e=>`grid-lg-${e}`),...bl.map(e=>`grid-xl-${e}`)]),xB=["className","columns","columnSpacing","component","container","direction","item","rowSpacing","spacing","wrap","zeroMinWidth"];function ts(e){const t=parseFloat(e);return`${t}${String(e).replace(String(t),"")||"px"}`}function SB({theme:e,ownerState:t}){let n;return e.breakpoints.keys.reduce((r,o)=>{let i={};if(t[o]&&(n=t[o]),!n)return r;if(n===!0)i={flexBasis:0,flexGrow:1,maxWidth:"100%"};else if(n==="auto")i={flexBasis:"auto",flexGrow:0,flexShrink:0,maxWidth:"none",width:"auto"};else{const a=Bi({values:t.columns,breakpoints:e.breakpoints.values}),s=typeof a=="object"?a[o]:a;if(s==null)return r;const l=`${Math.round(n/s*1e8)/1e6}%`;let u={};if(t.container&&t.item&&t.columnSpacing!==0){const c=e.spacing(t.columnSpacing);if(c!=="0px"){const d=`calc(${l} + ${ts(c)})`;u={flexBasis:d,maxWidth:d}}}i=E({flexBasis:l,flexGrow:0,maxWidth:l},u)}return e.breakpoints.values[o]===0?Object.assign(r,i):r[e.breakpoints.up(o)]=i,r},{})}function wB({theme:e,ownerState:t}){const n=Bi({values:t.direction,breakpoints:e.breakpoints.values});return In({theme:e},n,r=>{const o={flexDirection:r};return r.indexOf("column")===0&&(o[`& > .${Du.item}`]={maxWidth:"none"}),o})}function k4({breakpoints:e,values:t}){let n="";Object.keys(t).forEach(o=>{n===""&&t[o]!==0&&(n=o)});const r=Object.keys(e).sort((o,i)=>e[o]-e[i]);return r.slice(0,r.indexOf(n))}function _B({theme:e,ownerState:t}){const{container:n,rowSpacing:r}=t;let o={};if(n&&r!==0){const i=Bi({values:r,breakpoints:e.breakpoints.values});let a;typeof i=="object"&&(a=k4({breakpoints:e.breakpoints.values,values:i})),o=In({theme:e},i,(s,l)=>{var u;const c=e.spacing(s);return c!=="0px"?{marginTop:`-${ts(c)}`,[`& > .${Du.item}`]:{paddingTop:ts(c)}}:(u=a)!=null&&u.includes(l)?{}:{marginTop:0,[`& > .${Du.item}`]:{paddingTop:0}}})}return o}function EB({theme:e,ownerState:t}){const{container:n,columnSpacing:r}=t;let o={};if(n&&r!==0){const i=Bi({values:r,breakpoints:e.breakpoints.values});let a;typeof i=="object"&&(a=k4({breakpoints:e.breakpoints.values,values:i})),o=In({theme:e},i,(s,l)=>{var u;const c=e.spacing(s);return c!=="0px"?{width:`calc(100% + ${ts(c)})`,marginLeft:`-${ts(c)}`,[`& > .${Du.item}`]:{paddingLeft:ts(c)}}:(u=a)!=null&&u.includes(l)?{}:{width:"100%",marginLeft:0,[`& > .${Du.item}`]:{paddingLeft:0}}})}return o}function CB(e,t,n={}){if(!e||e<=0)return[];if(typeof e=="string"&&!Number.isNaN(Number(e))||typeof e=="number")return[n[`spacing-xs-${String(e)}`]];const r=[];return t.forEach(o=>{const i=e[o];Number(i)>0&&r.push(n[`spacing-${o}-${String(i)}`])}),r}const $B=X("div",{name:"MuiGrid",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e,{container:r,direction:o,item:i,spacing:a,wrap:s,zeroMinWidth:l,breakpoints:u}=n;let c=[];r&&(c=CB(a,u,t));const d=[];return u.forEach(f=>{const h=n[f];h&&d.push(t[`grid-${f}-${String(h)}`])}),[t.root,r&&t.container,i&&t.item,l&&t.zeroMinWidth,...c,o!=="row"&&t[`direction-xs-${String(o)}`],s!=="wrap"&&t[`wrap-xs-${String(s)}`],...d]}})(({ownerState:e})=>E({boxSizing:"border-box"},e.container&&{display:"flex",flexWrap:"wrap",width:"100%"},e.item&&{margin:0},e.zeroMinWidth&&{minWidth:0},e.wrap!=="wrap"&&{flexWrap:e.wrap}),wB,_B,EB,SB);function RB(e,t){if(!e||e<=0)return[];if(typeof e=="string"&&!Number.isNaN(Number(e))||typeof e=="number")return[`spacing-xs-${String(e)}`];const n=[];return t.forEach(r=>{const o=e[r];if(Number(o)>0){const i=`spacing-${r}-${String(o)}`;n.push(i)}}),n}const kB=e=>{const{classes:t,container:n,direction:r,item:o,spacing:i,wrap:a,zeroMinWidth:s,breakpoints:l}=e;let u=[];n&&(u=RB(i,l));const c=[];l.forEach(f=>{const h=e[f];h&&c.push(`grid-${f}-${String(h)}`)});const d={root:["root",n&&"container",o&&"item",s&&"zeroMinWidth",...u,r!=="row"&&`direction-xs-${String(r)}`,a!=="wrap"&&`wrap-xs-${String(a)}`,...c]};return Ce(d,vB,t)},PB=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiGrid"}),{breakpoints:o}=Nr(),i=tc(r),{className:a,columns:s,columnSpacing:l,component:u="div",container:c=!1,direction:d="row",item:f=!1,rowSpacing:h,spacing:v=0,wrap:y="wrap",zeroMinWidth:b=!1}=i,p=Y(i,xB),m=h||v,g=l||v,w=x.useContext(qx),C=c?s||12:w,S={},$=E({},p);o.keys.forEach(P=>{p[P]!=null&&(S[P]=p[P],delete $[P])});const R=E({},i,{columns:C,container:c,direction:d,item:f,rowSpacing:m,columnSpacing:g,wrap:y,zeroMinWidth:b,spacing:v},S,{breakpoints:o.keys}),k=kB(R);return _(qx.Provider,{value:C,children:_($B,E({ownerState:R,className:te(k.root,a),as:u,ref:n},$))})}),Te=PB,TB=["addEndListener","appear","children","easing","in","onEnter","onEntered","onEntering","onExit","onExited","onExiting","style","timeout","TransitionComponent"];function Nv(e){return`scale(${e}, ${e**2})`}const OB={entering:{opacity:1,transform:Nv(1)},entered:{opacity:1,transform:"none"}},Im=typeof navigator<"u"&&/^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent)&&/(os |version\/)15(.|_)4/i.test(navigator.userAgent),P4=x.forwardRef(function(t,n){const{addEndListener:r,appear:o=!0,children:i,easing:a,in:s,onEnter:l,onEntered:u,onEntering:c,onExit:d,onExited:f,onExiting:h,style:v,timeout:y="auto",TransitionComponent:b=hy}=t,p=Y(t,TB),m=Ii(),g=x.useRef(),w=Nr(),C=x.useRef(null),S=Tt(C,i.ref,n),$=M=>j=>{if(M){const B=C.current;j===void 0?M(B):M(B,j)}},R=$(c),k=$((M,j)=>{s4(M);const{duration:B,delay:I,easing:z}=Ss({style:v,timeout:y,easing:a},{mode:"enter"});let H;y==="auto"?(H=w.transitions.getAutoHeightDuration(M.clientHeight),g.current=H):H=B,M.style.transition=[w.transitions.create("opacity",{duration:H,delay:I}),w.transitions.create("transform",{duration:Im?H:H*.666,delay:I,easing:z})].join(","),l&&l(M,j)}),P=$(u),N=$(h),F=$(M=>{const{duration:j,delay:B,easing:I}=Ss({style:v,timeout:y,easing:a},{mode:"exit"});let z;y==="auto"?(z=w.transitions.getAutoHeightDuration(M.clientHeight),g.current=z):z=j,M.style.transition=[w.transitions.create("opacity",{duration:z,delay:B}),w.transitions.create("transform",{duration:Im?z:z*.666,delay:Im?B:B||z*.333,easing:I})].join(","),M.style.opacity=0,M.style.transform=Nv(.75),d&&d(M)}),L=$(f);return _(b,E({appear:o,in:s,nodeRef:C,onEnter:k,onEntered:P,onEntering:R,onExit:F,onExited:L,onExiting:N,addEndListener:M=>{y==="auto"&&m.start(g.current||0,M),r&&r(C.current,M)},timeout:y==="auto"?null:y},p,{children:(M,j)=>x.cloneElement(i,E({style:E({opacity:0,transform:Nv(.75),visibility:M==="exited"&&!s?"hidden":void 0},OB[M],v,i.props.style),ref:S},j))}))});P4.muiSupportAuto=!0;const Av=P4,IB=["disableUnderline","components","componentsProps","fullWidth","inputComponent","multiline","slotProps","slots","type"],NB=e=>{const{classes:t,disableUnderline:n}=e,o=Ce({root:["root",!n&&"underline"],input:["input"]},BL,t);return E({},t,o)},AB=X(vh,{shouldForwardProp:e=>Nn(e)||e==="classes",name:"MuiInput",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[...hh(e,t),!n.disableUnderline&&t.underline]}})(({theme:e,ownerState:t})=>{let r=e.palette.mode==="light"?"rgba(0, 0, 0, 0.42)":"rgba(255, 255, 255, 0.7)";return e.vars&&(r=`rgba(${e.vars.palette.common.onBackgroundChannel} / ${e.vars.opacity.inputUnderline})`),E({position:"relative"},t.formControl&&{"label + &":{marginTop:16}},!t.disableUnderline&&{"&::after":{borderBottom:`2px solid ${(e.vars||e).palette[t.color].main}`,left:0,bottom:0,content:'""',position:"absolute",right:0,transform:"scaleX(0)",transition:e.transitions.create("transform",{duration:e.transitions.duration.shorter,easing:e.transitions.easing.easeOut}),pointerEvents:"none"},[`&.${yl.focused}:after`]:{transform:"scaleX(1) translateX(0)"},[`&.${yl.error}`]:{"&::before, &::after":{borderBottomColor:(e.vars||e).palette.error.main}},"&::before":{borderBottom:`1px solid ${r}`,left:0,bottom:0,content:'"\\00a0"',position:"absolute",right:0,transition:e.transitions.create("border-bottom-color",{duration:e.transitions.duration.shorter}),pointerEvents:"none"},[`&:hover:not(.${yl.disabled}, .${yl.error}):before`]:{borderBottom:`2px solid ${(e.vars||e).palette.text.primary}`,"@media (hover: none)":{borderBottom:`1px solid ${r}`}},[`&.${yl.disabled}:before`]:{borderBottomStyle:"dotted"}})}),MB=X(gh,{name:"MuiInput",slot:"Input",overridesResolver:mh})({}),T4=x.forwardRef(function(t,n){var r,o,i,a;const s=Ee({props:t,name:"MuiInput"}),{disableUnderline:l,components:u={},componentsProps:c,fullWidth:d=!1,inputComponent:f="input",multiline:h=!1,slotProps:v,slots:y={},type:b="text"}=s,p=Y(s,IB),m=NB(s),w={root:{ownerState:{disableUnderline:l}}},C=v??c?gn(v??c,w):w,S=(r=(o=y.root)!=null?o:u.Root)!=null?r:AB,$=(i=(a=y.input)!=null?a:u.Input)!=null?i:MB;return _(yh,E({slots:{root:S,input:$},slotProps:C,fullWidth:d,inputComponent:f,multiline:h,ref:n,type:b},p,{classes:m}))});T4.muiName="Input";const O4=T4;function LB(e){return _e("MuiInputLabel",e)}xe("MuiInputLabel",["root","focused","disabled","error","required","asterisk","formControl","sizeSmall","shrink","animated","standard","filled","outlined"]);const FB=["disableAnimation","margin","shrink","variant","className"],DB=e=>{const{classes:t,formControl:n,size:r,shrink:o,disableAnimation:i,variant:a,required:s}=e,l={root:["root",n&&"formControl",!i&&"animated",o&&"shrink",r&&r!=="normal"&&`size${K(r)}`,a],asterisk:[s&&"asterisk"]},u=Ce(l,LB,t);return E({},t,u)},BB=X(hB,{shouldForwardProp:e=>Nn(e)||e==="classes",name:"MuiInputLabel",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[{[`& .${cu.asterisk}`]:t.asterisk},t.root,n.formControl&&t.formControl,n.size==="small"&&t.sizeSmall,n.shrink&&t.shrink,!n.disableAnimation&&t.animated,n.focused&&t.focused,t[n.variant]]}})(({theme:e,ownerState:t})=>E({display:"block",transformOrigin:"top left",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"},t.formControl&&{position:"absolute",left:0,top:0,transform:"translate(0, 20px) scale(1)"},t.size==="small"&&{transform:"translate(0, 17px) scale(1)"},t.shrink&&{transform:"translate(0, -1.5px) scale(0.75)",transformOrigin:"top left",maxWidth:"133%"},!t.disableAnimation&&{transition:e.transitions.create(["color","transform","max-width"],{duration:e.transitions.duration.shorter,easing:e.transitions.easing.easeOut})},t.variant==="filled"&&E({zIndex:1,pointerEvents:"none",transform:"translate(12px, 16px) scale(1)",maxWidth:"calc(100% - 24px)"},t.size==="small"&&{transform:"translate(12px, 13px) scale(1)"},t.shrink&&E({userSelect:"none",pointerEvents:"auto",transform:"translate(12px, 7px) scale(0.75)",maxWidth:"calc(133% - 24px)"},t.size==="small"&&{transform:"translate(12px, 4px) scale(0.75)"})),t.variant==="outlined"&&E({zIndex:1,pointerEvents:"none",transform:"translate(14px, 16px) scale(1)",maxWidth:"calc(100% - 24px)"},t.size==="small"&&{transform:"translate(14px, 9px) scale(1)"},t.shrink&&{userSelect:"none",pointerEvents:"auto",maxWidth:"calc(133% - 32px)",transform:"translate(14px, -9px) scale(0.75)"}))),zB=x.forwardRef(function(t,n){const r=Ee({name:"MuiInputLabel",props:t}),{disableAnimation:o=!1,shrink:i,className:a}=r,s=Y(r,FB),l=gi();let u=i;typeof u>"u"&&l&&(u=l.filled||l.focused||l.adornedStart);const c=ua({props:r,muiFormControl:l,states:["size","variant","required","focused"]}),d=E({},r,{disableAnimation:o,formControl:l,shrink:u,size:c.size,variant:c.variant,required:c.required,focused:c.focused}),f=DB(d);return _(BB,E({"data-shrink":u,ownerState:d,ref:n,className:te(f.root,a)},s,{classes:f}))}),qr=zB;function jB(e){return _e("MuiLink",e)}const UB=xe("MuiLink",["root","underlineNone","underlineHover","underlineAlways","button","focusVisible"]),WB=UB,I4={primary:"primary.main",textPrimary:"text.primary",secondary:"secondary.main",textSecondary:"text.secondary",error:"error.main"},HB=e=>I4[e]||e,VB=({theme:e,ownerState:t})=>{const n=HB(t.color),r=ms(e,`palette.${n}`,!1)||t.color,o=ms(e,`palette.${n}Channel`);return"vars"in e&&o?`rgba(${o} / 0.4)`:Nt(r,.4)},GB=VB,KB=["className","color","component","onBlur","onFocus","TypographyClasses","underline","variant","sx"],XB=e=>{const{classes:t,component:n,focusVisible:r,underline:o}=e,i={root:["root",`underline${K(o)}`,n==="button"&&"button",r&&"focusVisible"]};return Ce(i,jB,t)},YB=X(st,{name:"MuiLink",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[`underline${K(n.underline)}`],n.component==="button"&&t.button]}})(({theme:e,ownerState:t})=>E({},t.underline==="none"&&{textDecoration:"none"},t.underline==="hover"&&{textDecoration:"none","&:hover":{textDecoration:"underline"}},t.underline==="always"&&E({textDecoration:"underline"},t.color!=="inherit"&&{textDecorationColor:GB({theme:e,ownerState:t})},{"&:hover":{textDecorationColor:"inherit"}}),t.component==="button"&&{position:"relative",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none","&::-moz-focus-inner":{borderStyle:"none"},[`&.${WB.focusVisible}`]:{outline:"auto"}})),qB=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiLink"}),{className:o,color:i="primary",component:a="a",onBlur:s,onFocus:l,TypographyClasses:u,underline:c="always",variant:d="inherit",sx:f}=r,h=Y(r,KB),{isFocusVisibleRef:v,onBlur:y,onFocus:b,ref:p}=rc(),[m,g]=x.useState(!1),w=Tt(n,p),C=k=>{y(k),v.current===!1&&g(!1),s&&s(k)},S=k=>{b(k),v.current===!0&&g(!0),l&&l(k)},$=E({},r,{color:i,component:a,focusVisible:m,underline:c,variant:d}),R=XB($);return _(YB,E({color:i,className:te(R.root,o),classes:u,component:a,onBlur:C,onFocus:S,ref:w,ownerState:$,variant:d,sx:[...Object.keys(I4).includes(i)?[]:[{color:i}],...Array.isArray(f)?f:[f]]},h))}),Qx=qB,QB=x.createContext({}),Mv=QB;function JB(e){return _e("MuiList",e)}xe("MuiList",["root","padding","dense","subheader"]);const ZB=["children","className","component","dense","disablePadding","subheader"],ez=e=>{const{classes:t,disablePadding:n,dense:r,subheader:o}=e;return Ce({root:["root",!n&&"padding",r&&"dense",o&&"subheader"]},JB,t)},tz=X("ul",{name:"MuiList",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,!n.disablePadding&&t.padding,n.dense&&t.dense,n.subheader&&t.subheader]}})(({ownerState:e})=>E({listStyle:"none",margin:0,padding:0,position:"relative"},!e.disablePadding&&{paddingTop:8,paddingBottom:8},e.subheader&&{paddingTop:0})),nz=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiList"}),{children:o,className:i,component:a="ul",dense:s=!1,disablePadding:l=!1,subheader:u}=r,c=Y(r,ZB),d=x.useMemo(()=>({dense:s}),[s]),f=E({},r,{component:a,dense:s,disablePadding:l}),h=ez(f);return _(Mv.Provider,{value:d,children:G(tz,E({as:a,className:te(h.root,i),ref:n,ownerState:f},c,{children:[u,o]}))})}),rz=nz,oz=xe("MuiListItemIcon",["root","alignItemsFlexStart"]),Jx=oz,iz=xe("MuiListItemText",["root","multiline","dense","inset","primary","secondary"]),Zx=iz,az=["actions","autoFocus","autoFocusItem","children","className","disabledItemsFocusable","disableListWrap","onKeyDown","variant"];function Nm(e,t,n){return e===t?e.firstChild:t&&t.nextElementSibling?t.nextElementSibling:n?null:e.firstChild}function eS(e,t,n){return e===t?n?e.firstChild:e.lastChild:t&&t.previousElementSibling?t.previousElementSibling:n?null:e.lastChild}function N4(e,t){if(t===void 0)return!0;let n=e.innerText;return n===void 0&&(n=e.textContent),n=n.trim().toLowerCase(),n.length===0?!1:t.repeating?n[0]===t.keys[0]:n.indexOf(t.keys.join(""))===0}function xl(e,t,n,r,o,i){let a=!1,s=o(e,t,t?n:!1);for(;s;){if(s===e.firstChild){if(a)return!1;a=!0}const l=r?!1:s.disabled||s.getAttribute("aria-disabled")==="true";if(!s.hasAttribute("tabindex")||!N4(s,i)||l)s=o(e,s,n);else return s.focus(),!0}return!1}const sz=x.forwardRef(function(t,n){const{actions:r,autoFocus:o=!1,autoFocusItem:i=!1,children:a,className:s,disabledItemsFocusable:l=!1,disableListWrap:u=!1,onKeyDown:c,variant:d="selectedMenu"}=t,f=Y(t,az),h=x.useRef(null),v=x.useRef({keys:[],repeating:!0,previousKeyMatched:!0,lastTime:null});Ir(()=>{o&&h.current.focus()},[o]),x.useImperativeHandle(r,()=>({adjustStyleForScrollbar:(g,{direction:w})=>{const C=!h.current.style.width;if(g.clientHeight<h.current.clientHeight&&C){const S=`${k$(ln(g))}px`;h.current.style[w==="rtl"?"paddingLeft":"paddingRight"]=S,h.current.style.width=`calc(100% + ${S})`}return h.current}}),[]);const y=g=>{const w=h.current,C=g.key,S=ln(w).activeElement;if(C==="ArrowDown")g.preventDefault(),xl(w,S,u,l,Nm);else if(C==="ArrowUp")g.preventDefault(),xl(w,S,u,l,eS);else if(C==="Home")g.preventDefault(),xl(w,null,u,l,Nm);else if(C==="End")g.preventDefault(),xl(w,null,u,l,eS);else if(C.length===1){const $=v.current,R=C.toLowerCase(),k=performance.now();$.keys.length>0&&(k-$.lastTime>500?($.keys=[],$.repeating=!0,$.previousKeyMatched=!0):$.repeating&&R!==$.keys[0]&&($.repeating=!1)),$.lastTime=k,$.keys.push(R);const P=S&&!$.repeating&&N4(S,$);$.previousKeyMatched&&(P||xl(w,S,!1,l,Nm,$))?g.preventDefault():$.previousKeyMatched=!1}c&&c(g)},b=Tt(h,n);let p=-1;x.Children.forEach(a,(g,w)=>{if(!x.isValidElement(g)){p===w&&(p+=1,p>=a.length&&(p=-1));return}g.props.disabled||(d==="selectedMenu"&&g.props.selected||p===-1)&&(p=w),p===w&&(g.props.disabled||g.props.muiSkipListHighlight||g.type.muiSkipListHighlight)&&(p+=1,p>=a.length&&(p=-1))});const m=x.Children.map(a,(g,w)=>{if(w===p){const C={};return i&&(C.autoFocus=!0),g.props.tabIndex===void 0&&d==="selectedMenu"&&(C.tabIndex=0),x.cloneElement(g,C)}return g});return _(rz,E({role:"menu",ref:b,className:s,onKeyDown:y,tabIndex:o?0:-1},f,{children:m}))}),lz=sz;function uz(e){return _e("MuiPopover",e)}xe("MuiPopover",["root","paper"]);const cz=["onEntering"],dz=["action","anchorEl","anchorOrigin","anchorPosition","anchorReference","children","className","container","elevation","marginThreshold","open","PaperProps","slots","slotProps","transformOrigin","TransitionComponent","transitionDuration","TransitionProps","disableScrollLock"],fz=["slotProps"];function tS(e,t){let n=0;return typeof t=="number"?n=t:t==="center"?n=e.height/2:t==="bottom"&&(n=e.height),n}function nS(e,t){let n=0;return typeof t=="number"?n=t:t==="center"?n=e.width/2:t==="right"&&(n=e.width),n}function rS(e){return[e.horizontal,e.vertical].map(t=>typeof t=="number"?`${t}px`:t).join(" ")}function Am(e){return typeof e=="function"?e():e}const pz=e=>{const{classes:t}=e;return Ce({root:["root"],paper:["paper"]},uz,t)},hz=X(C4,{name:"MuiPopover",slot:"Root",overridesResolver:(e,t)=>t.root})({}),A4=X(gy,{name:"MuiPopover",slot:"Paper",overridesResolver:(e,t)=>t.paper})({position:"absolute",overflowY:"auto",overflowX:"hidden",minWidth:16,minHeight:16,maxWidth:"calc(100% - 32px)",maxHeight:"calc(100% - 32px)",outline:0}),mz=x.forwardRef(function(t,n){var r,o,i;const a=Ee({props:t,name:"MuiPopover"}),{action:s,anchorEl:l,anchorOrigin:u={vertical:"top",horizontal:"left"},anchorPosition:c,anchorReference:d="anchorEl",children:f,className:h,container:v,elevation:y=8,marginThreshold:b=16,open:p,PaperProps:m={},slots:g,slotProps:w,transformOrigin:C={vertical:"top",horizontal:"left"},TransitionComponent:S=Av,transitionDuration:$="auto",TransitionProps:{onEntering:R}={},disableScrollLock:k=!1}=a,P=Y(a.TransitionProps,cz),N=Y(a,dz),F=(r=w==null?void 0:w.paper)!=null?r:m,L=x.useRef(),D=Tt(L,F.ref),M=E({},a,{anchorOrigin:u,anchorReference:d,elevation:y,marginThreshold:b,externalPaperSlotProps:F,transformOrigin:C,TransitionComponent:S,transitionDuration:$,TransitionProps:P}),j=pz(M),B=x.useCallback(()=>{if(d==="anchorPosition")return c;const ge=Am(l),Z=(ge&&ge.nodeType===1?ge:ln(L.current).body).getBoundingClientRect();return{top:Z.top+tS(Z,u.vertical),left:Z.left+nS(Z,u.horizontal)}},[l,u.horizontal,u.vertical,c,d]),I=x.useCallback(ge=>({vertical:tS(ge,C.vertical),horizontal:nS(ge,C.horizontal)}),[C.horizontal,C.vertical]),z=x.useCallback(ge=>{const $e={width:ge.offsetWidth,height:ge.offsetHeight},Z=I($e);if(d==="none")return{top:null,left:null,transformOrigin:rS(Z)};const Le=B();let Ue=Le.top-Z.vertical,qe=Le.left-Z.horizontal;const ut=Ue+$e.height,De=qe+$e.width,Pe=ai(Am(l)),Ze=Pe.innerHeight-b,Be=Pe.innerWidth-b;if(b!==null&&Ue<b){const q=Ue-b;Ue-=q,Z.vertical+=q}else if(b!==null&&ut>Ze){const q=ut-Ze;Ue-=q,Z.vertical+=q}if(b!==null&&qe<b){const q=qe-b;qe-=q,Z.horizontal+=q}else if(De>Be){const q=De-Be;qe-=q,Z.horizontal+=q}return{top:`${Math.round(Ue)}px`,left:`${Math.round(qe)}px`,transformOrigin:rS(Z)}},[l,d,B,I,b]),[H,le]=x.useState(p),ae=x.useCallback(()=>{const ge=L.current;if(!ge)return;const $e=z(ge);$e.top!==null&&(ge.style.top=$e.top),$e.left!==null&&(ge.style.left=$e.left),ge.style.transformOrigin=$e.transformOrigin,le(!0)},[z]);x.useEffect(()=>(k&&window.addEventListener("scroll",ae),()=>window.removeEventListener("scroll",ae)),[l,k,ae]);const ye=(ge,$e)=>{R&&R(ge,$e),ae()},J=()=>{le(!1)};x.useEffect(()=>{p&&ae()}),x.useImperativeHandle(s,()=>p?{updatePosition:()=>{ae()}}:null,[p,ae]),x.useEffect(()=>{if(!p)return;const ge=ty(()=>{ae()}),$e=ai(l);return $e.addEventListener("resize",ge),()=>{ge.clear(),$e.removeEventListener("resize",ge)}},[l,p,ae]);let he=$;$==="auto"&&!S.muiSupportAuto&&(he=void 0);const V=v||(l?ln(Am(l)).body:void 0),me=(o=g==null?void 0:g.root)!=null?o:hz,we=(i=g==null?void 0:g.paper)!=null?i:A4,Se=qi({elementType:we,externalSlotProps:E({},F,{style:H?F.style:E({},F.style,{opacity:0})}),additionalProps:{elevation:y,ref:D},ownerState:M,className:te(j.paper,F==null?void 0:F.className)}),Fe=qi({elementType:me,externalSlotProps:(w==null?void 0:w.root)||{},externalForwardedProps:N,additionalProps:{ref:n,slotProps:{backdrop:{invisible:!0}},container:V,open:p},ownerState:M,className:te(j.root,h)}),{slotProps:ie}=Fe,Oe=Y(Fe,fz);return _(me,E({},Oe,!If(me)&&{slotProps:ie,disableScrollLock:k},{children:_(S,E({appear:!0,in:p,onEntering:ye,onExited:J,timeout:he},P,{children:_(we,E({},Se,{children:f}))}))}))}),vz=mz;function gz(e){return _e("MuiMenu",e)}xe("MuiMenu",["root","paper","list"]);const yz=["onEntering"],bz=["autoFocus","children","className","disableAutoFocusItem","MenuListProps","onClose","open","PaperProps","PopoverClasses","transitionDuration","TransitionProps","variant","slots","slotProps"],xz={vertical:"top",horizontal:"right"},Sz={vertical:"top",horizontal:"left"},wz=e=>{const{classes:t}=e;return Ce({root:["root"],paper:["paper"],list:["list"]},gz,t)},_z=X(vz,{shouldForwardProp:e=>Nn(e)||e==="classes",name:"MuiMenu",slot:"Root",overridesResolver:(e,t)=>t.root})({}),Ez=X(A4,{name:"MuiMenu",slot:"Paper",overridesResolver:(e,t)=>t.paper})({maxHeight:"calc(100% - 96px)",WebkitOverflowScrolling:"touch"}),Cz=X(lz,{name:"MuiMenu",slot:"List",overridesResolver:(e,t)=>t.list})({outline:0}),$z=x.forwardRef(function(t,n){var r,o;const i=Ee({props:t,name:"MuiMenu"}),{autoFocus:a=!0,children:s,className:l,disableAutoFocusItem:u=!1,MenuListProps:c={},onClose:d,open:f,PaperProps:h={},PopoverClasses:v,transitionDuration:y="auto",TransitionProps:{onEntering:b}={},variant:p="selectedMenu",slots:m={},slotProps:g={}}=i,w=Y(i.TransitionProps,yz),C=Y(i,bz),S=ny(),$=E({},i,{autoFocus:a,disableAutoFocusItem:u,MenuListProps:c,onEntering:b,PaperProps:h,transitionDuration:y,TransitionProps:w,variant:p}),R=wz($),k=a&&!u&&f,P=x.useRef(null),N=(I,z)=>{P.current&&P.current.adjustStyleForScrollbar(I,{direction:S?"rtl":"ltr"}),b&&b(I,z)},F=I=>{I.key==="Tab"&&(I.preventDefault(),d&&d(I,"tabKeyDown"))};let L=-1;x.Children.map(s,(I,z)=>{x.isValidElement(I)&&(I.props.disabled||(p==="selectedMenu"&&I.props.selected||L===-1)&&(L=z))});const D=(r=m.paper)!=null?r:Ez,M=(o=g.paper)!=null?o:h,j=qi({elementType:m.root,externalSlotProps:g.root,ownerState:$,className:[R.root,l]}),B=qi({elementType:D,externalSlotProps:M,ownerState:$,className:R.paper});return _(_z,E({onClose:d,anchorOrigin:{vertical:"bottom",horizontal:S?"right":"left"},transformOrigin:S?xz:Sz,slots:{paper:D,root:m.root},slotProps:{root:j,paper:B},open:f,ref:n,transitionDuration:y,TransitionProps:E({onEntering:N},w),ownerState:$},C,{classes:v,children:_(Cz,E({onKeyDown:F,actions:P,autoFocus:a&&(L===-1||u),autoFocusItem:k,variant:p},c,{className:te(R.list,c.className),children:s}))}))}),Rz=$z;function kz(e){return _e("MuiMenuItem",e)}const Pz=xe("MuiMenuItem",["root","focusVisible","dense","disabled","divider","gutters","selected"]),Sl=Pz,Tz=["autoFocus","component","dense","divider","disableGutters","focusVisibleClassName","role","tabIndex","className"],Oz=(e,t)=>{const{ownerState:n}=e;return[t.root,n.dense&&t.dense,n.divider&&t.divider,!n.disableGutters&&t.gutters]},Iz=e=>{const{disabled:t,dense:n,divider:r,disableGutters:o,selected:i,classes:a}=e,l=Ce({root:["root",n&&"dense",t&&"disabled",!o&&"gutters",r&&"divider",i&&"selected"]},kz,a);return E({},a,l)},Nz=X(sc,{shouldForwardProp:e=>Nn(e)||e==="classes",name:"MuiMenuItem",slot:"Root",overridesResolver:Oz})(({theme:e,ownerState:t})=>E({},e.typography.body1,{display:"flex",justifyContent:"flex-start",alignItems:"center",position:"relative",textDecoration:"none",minHeight:48,paddingTop:6,paddingBottom:6,boxSizing:"border-box",whiteSpace:"nowrap"},!t.disableGutters&&{paddingLeft:16,paddingRight:16},t.divider&&{borderBottom:`1px solid ${(e.vars||e).palette.divider}`,backgroundClip:"padding-box"},{"&:hover":{textDecoration:"none",backgroundColor:(e.vars||e).palette.action.hover,"@media (hover: none)":{backgroundColor:"transparent"}},[`&.${Sl.selected}`]:{backgroundColor:e.vars?`rgba(${e.vars.palette.primary.mainChannel} / ${e.vars.palette.action.selectedOpacity})`:Nt(e.palette.primary.main,e.palette.action.selectedOpacity),[`&.${Sl.focusVisible}`]:{backgroundColor:e.vars?`rgba(${e.vars.palette.primary.mainChannel} / calc(${e.vars.palette.action.selectedOpacity} + ${e.vars.palette.action.focusOpacity}))`:Nt(e.palette.primary.main,e.palette.action.selectedOpacity+e.palette.action.focusOpacity)}},[`&.${Sl.selected}:hover`]:{backgroundColor:e.vars?`rgba(${e.vars.palette.primary.mainChannel} / calc(${e.vars.palette.action.selectedOpacity} + ${e.vars.palette.action.hoverOpacity}))`:Nt(e.palette.primary.main,e.palette.action.selectedOpacity+e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:e.vars?`rgba(${e.vars.palette.primary.mainChannel} / ${e.vars.palette.action.selectedOpacity})`:Nt(e.palette.primary.main,e.palette.action.selectedOpacity)}},[`&.${Sl.focusVisible}`]:{backgroundColor:(e.vars||e).palette.action.focus},[`&.${Sl.disabled}`]:{opacity:(e.vars||e).palette.action.disabledOpacity},[`& + .${Kx.root}`]:{marginTop:e.spacing(1),marginBottom:e.spacing(1)},[`& + .${Kx.inset}`]:{marginLeft:52},[`& .${Zx.root}`]:{marginTop:0,marginBottom:0},[`& .${Zx.inset}`]:{paddingLeft:36},[`& .${Jx.root}`]:{minWidth:36}},!t.dense&&{[e.breakpoints.up("sm")]:{minHeight:"auto"}},t.dense&&E({minHeight:32,paddingTop:4,paddingBottom:4},e.typography.body2,{[`& .${Jx.root} svg`]:{fontSize:"1.25rem"}}))),Az=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiMenuItem"}),{autoFocus:o=!1,component:i="li",dense:a=!1,divider:s=!1,disableGutters:l=!1,focusVisibleClassName:u,role:c="menuitem",tabIndex:d,className:f}=r,h=Y(r,Tz),v=x.useContext(Mv),y=x.useMemo(()=>({dense:a||v.dense||!1,disableGutters:l}),[v.dense,a,l]),b=x.useRef(null);Ir(()=>{o&&b.current&&b.current.focus()},[o]);const p=E({},r,{dense:y.dense,divider:s,disableGutters:l}),m=Iz(r),g=Tt(b,n);let w;return r.disabled||(w=d!==void 0?d:-1),_(Mv.Provider,{value:y,children:_(Nz,E({ref:g,role:c,tabIndex:w,component:i,focusVisibleClassName:te(m.focusVisible,u),className:te(m.root,f)},h,{ownerState:p,classes:m}))})}),Zn=Az;function Mz(e){return _e("MuiNativeSelect",e)}const Lz=xe("MuiNativeSelect",["root","select","multiple","filled","outlined","standard","disabled","icon","iconOpen","iconFilled","iconOutlined","iconStandard","nativeInput","error"]),Ry=Lz,Fz=["className","disabled","error","IconComponent","inputRef","variant"],Dz=e=>{const{classes:t,variant:n,disabled:r,multiple:o,open:i,error:a}=e,s={select:["select",n,r&&"disabled",o&&"multiple",a&&"error"],icon:["icon",`icon${K(n)}`,i&&"iconOpen",r&&"disabled"]};return Ce(s,Mz,t)},M4=({ownerState:e,theme:t})=>E({MozAppearance:"none",WebkitAppearance:"none",userSelect:"none",borderRadius:0,cursor:"pointer","&:focus":E({},t.vars?{backgroundColor:`rgba(${t.vars.palette.common.onBackgroundChannel} / 0.05)`}:{backgroundColor:t.palette.mode==="light"?"rgba(0, 0, 0, 0.05)":"rgba(255, 255, 255, 0.05)"},{borderRadius:0}),"&::-ms-expand":{display:"none"},[`&.${Ry.disabled}`]:{cursor:"default"},"&[multiple]":{height:"auto"},"&:not([multiple]) option, &:not([multiple]) optgroup":{backgroundColor:(t.vars||t).palette.background.paper},"&&&":{paddingRight:24,minWidth:16}},e.variant==="filled"&&{"&&&":{paddingRight:32}},e.variant==="outlined"&&{borderRadius:(t.vars||t).shape.borderRadius,"&:focus":{borderRadius:(t.vars||t).shape.borderRadius},"&&&":{paddingRight:32}}),Bz=X("select",{name:"MuiNativeSelect",slot:"Select",shouldForwardProp:Nn,overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.select,t[n.variant],n.error&&t.error,{[`&.${Ry.multiple}`]:t.multiple}]}})(M4),L4=({ownerState:e,theme:t})=>E({position:"absolute",right:0,top:"calc(50% - .5em)",pointerEvents:"none",color:(t.vars||t).palette.action.active,[`&.${Ry.disabled}`]:{color:(t.vars||t).palette.action.disabled}},e.open&&{transform:"rotate(180deg)"},e.variant==="filled"&&{right:7},e.variant==="outlined"&&{right:7}),zz=X("svg",{name:"MuiNativeSelect",slot:"Icon",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.icon,n.variant&&t[`icon${K(n.variant)}`],n.open&&t.iconOpen]}})(L4),jz=x.forwardRef(function(t,n){const{className:r,disabled:o,error:i,IconComponent:a,inputRef:s,variant:l="standard"}=t,u=Y(t,Fz),c=E({},t,{disabled:o,variant:l,error:i}),d=Dz(c);return G(x.Fragment,{children:[_(Bz,E({ownerState:c,className:te(d.select,r),disabled:o,ref:s||n},u)),t.multiple?null:_(zz,{as:a,ownerState:c,className:d.icon})]})}),Uz=jz;var oS;const Wz=["children","classes","className","label","notched"],Hz=X("fieldset",{shouldForwardProp:Nn})({textAlign:"left",position:"absolute",bottom:0,right:0,top:-5,left:0,margin:0,padding:"0 8px",pointerEvents:"none",borderRadius:"inherit",borderStyle:"solid",borderWidth:1,overflow:"hidden",minWidth:"0%"}),Vz=X("legend",{shouldForwardProp:Nn})(({ownerState:e,theme:t})=>E({float:"unset",width:"auto",overflow:"hidden"},!e.withLabel&&{padding:0,lineHeight:"11px",transition:t.transitions.create("width",{duration:150,easing:t.transitions.easing.easeOut})},e.withLabel&&E({display:"block",padding:0,height:11,fontSize:"0.75em",visibility:"hidden",maxWidth:.01,transition:t.transitions.create("max-width",{duration:50,easing:t.transitions.easing.easeOut}),whiteSpace:"nowrap","& > span":{paddingLeft:5,paddingRight:5,display:"inline-block",opacity:0,visibility:"visible"}},e.notched&&{maxWidth:"100%",transition:t.transitions.create("max-width",{duration:100,easing:t.transitions.easing.easeOut,delay:50})})));function Gz(e){const{className:t,label:n,notched:r}=e,o=Y(e,Wz),i=n!=null&&n!=="",a=E({},e,{notched:r,withLabel:i});return _(Hz,E({"aria-hidden":!0,className:t,ownerState:a},o,{children:_(Vz,{ownerState:a,children:i?_("span",{children:n}):oS||(oS=_("span",{className:"notranslate",children:"​"}))})}))}const Kz=["components","fullWidth","inputComponent","label","multiline","notched","slots","type"],Xz=e=>{const{classes:t}=e,r=Ce({root:["root"],notchedOutline:["notchedOutline"],input:["input"]},jL,t);return E({},t,r)},Yz=X(vh,{shouldForwardProp:e=>Nn(e)||e==="classes",name:"MuiOutlinedInput",slot:"Root",overridesResolver:hh})(({theme:e,ownerState:t})=>{const n=e.palette.mode==="light"?"rgba(0, 0, 0, 0.23)":"rgba(255, 255, 255, 0.23)";return E({position:"relative",borderRadius:(e.vars||e).shape.borderRadius,[`&:hover .${Io.notchedOutline}`]:{borderColor:(e.vars||e).palette.text.primary},"@media (hover: none)":{[`&:hover .${Io.notchedOutline}`]:{borderColor:e.vars?`rgba(${e.vars.palette.common.onBackgroundChannel} / 0.23)`:n}},[`&.${Io.focused} .${Io.notchedOutline}`]:{borderColor:(e.vars||e).palette[t.color].main,borderWidth:2},[`&.${Io.error} .${Io.notchedOutline}`]:{borderColor:(e.vars||e).palette.error.main},[`&.${Io.disabled} .${Io.notchedOutline}`]:{borderColor:(e.vars||e).palette.action.disabled}},t.startAdornment&&{paddingLeft:14},t.endAdornment&&{paddingRight:14},t.multiline&&E({padding:"16.5px 14px"},t.size==="small"&&{padding:"8.5px 14px"}))}),qz=X(Gz,{name:"MuiOutlinedInput",slot:"NotchedOutline",overridesResolver:(e,t)=>t.notchedOutline})(({theme:e})=>{const t=e.palette.mode==="light"?"rgba(0, 0, 0, 0.23)":"rgba(255, 255, 255, 0.23)";return{borderColor:e.vars?`rgba(${e.vars.palette.common.onBackgroundChannel} / 0.23)`:t}}),Qz=X(gh,{name:"MuiOutlinedInput",slot:"Input",overridesResolver:mh})(({theme:e,ownerState:t})=>E({padding:"16.5px 14px"},!e.vars&&{"&:-webkit-autofill":{WebkitBoxShadow:e.palette.mode==="light"?null:"0 0 0 100px #266798 inset",WebkitTextFillColor:e.palette.mode==="light"?null:"#fff",caretColor:e.palette.mode==="light"?null:"#fff",borderRadius:"inherit"}},e.vars&&{"&:-webkit-autofill":{borderRadius:"inherit"},[e.getColorSchemeSelector("dark")]:{"&:-webkit-autofill":{WebkitBoxShadow:"0 0 0 100px #266798 inset",WebkitTextFillColor:"#fff",caretColor:"#fff"}}},t.size==="small"&&{padding:"8.5px 14px"},t.multiline&&{padding:0},t.startAdornment&&{paddingLeft:0},t.endAdornment&&{paddingRight:0})),F4=x.forwardRef(function(t,n){var r,o,i,a,s;const l=Ee({props:t,name:"MuiOutlinedInput"}),{components:u={},fullWidth:c=!1,inputComponent:d="input",label:f,multiline:h=!1,notched:v,slots:y={},type:b="text"}=l,p=Y(l,Kz),m=Xz(l),g=gi(),w=ua({props:l,muiFormControl:g,states:["color","disabled","error","focused","hiddenLabel","size","required"]}),C=E({},l,{color:w.color||"primary",disabled:w.disabled,error:w.error,focused:w.focused,formControl:g,fullWidth:c,hiddenLabel:w.hiddenLabel,multiline:h,size:w.size,type:b}),S=(r=(o=y.root)!=null?o:u.Root)!=null?r:Yz,$=(i=(a=y.input)!=null?a:u.Input)!=null?i:Qz;return _(yh,E({slots:{root:S,input:$},renderSuffix:R=>_(qz,{ownerState:C,className:m.notchedOutline,label:f!=null&&f!==""&&w.required?s||(s=G(x.Fragment,{children:[f," ","*"]})):f,notched:typeof v<"u"?v:!!(R.startAdornment||R.filled||R.focused)}),fullWidth:c,inputComponent:d,multiline:h,ref:n,type:b},p,{classes:E({},m,{notchedOutline:null})}))});F4.muiName="Input";const D4=F4,Jz=la(_("path",{d:"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"}),"Star"),Zz=la(_("path",{d:"M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"}),"StarBorder");function ej(e){return _e("MuiRating",e)}const tj=xe("MuiRating",["root","sizeSmall","sizeMedium","sizeLarge","readOnly","disabled","focusVisible","visuallyHidden","pristine","label","labelEmptyValueActive","icon","iconEmpty","iconFilled","iconHover","iconFocus","iconActive","decimal"]),wl=tj,nj=["value"],rj=["className","defaultValue","disabled","emptyIcon","emptyLabelText","getLabelText","highlightSelectedOnly","icon","IconContainerComponent","max","name","onChange","onChangeActive","onMouseLeave","onMouseMove","precision","readOnly","size","value"];function oj(e){const t=e.toString().split(".")[1];return t?t.length:0}function Mm(e,t){if(e==null)return e;const n=Math.round(e/t)*t;return Number(n.toFixed(oj(t)))}const ij=e=>{const{classes:t,size:n,readOnly:r,disabled:o,emptyValueFocused:i,focusVisible:a}=e,s={root:["root",`size${K(n)}`,o&&"disabled",a&&"focusVisible",r&&"readOnly"],label:["label","pristine"],labelEmptyValue:[i&&"labelEmptyValueActive"],icon:["icon"],iconEmpty:["iconEmpty"],iconFilled:["iconFilled"],iconHover:["iconHover"],iconFocus:["iconFocus"],iconActive:["iconActive"],decimal:["decimal"],visuallyHidden:["visuallyHidden"]};return Ce(s,ej,t)},aj=X("span",{name:"MuiRating",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[{[`& .${wl.visuallyHidden}`]:t.visuallyHidden},t.root,t[`size${K(n.size)}`],n.readOnly&&t.readOnly]}})(({theme:e,ownerState:t})=>E({display:"inline-flex",position:"relative",fontSize:e.typography.pxToRem(24),color:"#faaf00",cursor:"pointer",textAlign:"left",width:"min-content",WebkitTapHighlightColor:"transparent",[`&.${wl.disabled}`]:{opacity:(e.vars||e).palette.action.disabledOpacity,pointerEvents:"none"},[`&.${wl.focusVisible} .${wl.iconActive}`]:{outline:"1px solid #999"},[`& .${wl.visuallyHidden}`]:lN},t.size==="small"&&{fontSize:e.typography.pxToRem(18)},t.size==="large"&&{fontSize:e.typography.pxToRem(30)},t.readOnly&&{pointerEvents:"none"})),B4=X("label",{name:"MuiRating",slot:"Label",overridesResolver:({ownerState:e},t)=>[t.label,e.emptyValueFocused&&t.labelEmptyValueActive]})(({ownerState:e})=>E({cursor:"inherit"},e.emptyValueFocused&&{top:0,bottom:0,position:"absolute",outline:"1px solid #999",width:"100%"})),sj=X("span",{name:"MuiRating",slot:"Icon",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.icon,n.iconEmpty&&t.iconEmpty,n.iconFilled&&t.iconFilled,n.iconHover&&t.iconHover,n.iconFocus&&t.iconFocus,n.iconActive&&t.iconActive]}})(({theme:e,ownerState:t})=>E({display:"flex",transition:e.transitions.create("transform",{duration:e.transitions.duration.shortest}),pointerEvents:"none"},t.iconActive&&{transform:"scale(1.2)"},t.iconEmpty&&{color:(e.vars||e).palette.action.disabled})),lj=X("span",{name:"MuiRating",slot:"Decimal",shouldForwardProp:e=>dy(e)&&e!=="iconActive",overridesResolver:(e,t)=>{const{iconActive:n}=e;return[t.decimal,n&&t.iconActive]}})(({iconActive:e})=>E({position:"relative"},e&&{transform:"scale(1.2)"}));function uj(e){const t=Y(e,nj);return _("span",E({},t))}function iS(e){const{classes:t,disabled:n,emptyIcon:r,focus:o,getLabelText:i,highlightSelectedOnly:a,hover:s,icon:l,IconContainerComponent:u,isActive:c,itemValue:d,labelProps:f,name:h,onBlur:v,onChange:y,onClick:b,onFocus:p,readOnly:m,ownerState:g,ratingValue:w,ratingValueRounded:C}=e,S=a?d===w:d<=w,$=d<=s,R=d<=o,k=d===C,P=js(),N=_(sj,{as:u,value:d,className:te(t.icon,S?t.iconFilled:t.iconEmpty,$&&t.iconHover,R&&t.iconFocus,c&&t.iconActive),ownerState:E({},g,{iconEmpty:!S,iconFilled:S,iconHover:$,iconFocus:R,iconActive:c}),children:r&&!S?r:l});return m?_("span",E({},f,{children:N})):G(x.Fragment,{children:[G(B4,E({ownerState:E({},g,{emptyValueFocused:void 0}),htmlFor:P},f,{children:[N,_("span",{className:t.visuallyHidden,children:i(d)})]})),_("input",{className:t.visuallyHidden,onFocus:p,onBlur:v,onChange:y,onClick:b,disabled:n,value:d,id:P,type:"radio",name:h,checked:k})]})}const cj=_(Jz,{fontSize:"inherit"}),dj=_(Zz,{fontSize:"inherit"});function fj(e){return`${e} Star${e!==1?"s":""}`}const pj=x.forwardRef(function(t,n){const r=Ee({name:"MuiRating",props:t}),{className:o,defaultValue:i=null,disabled:a=!1,emptyIcon:s=dj,emptyLabelText:l="Empty",getLabelText:u=fj,highlightSelectedOnly:c=!1,icon:d=cj,IconContainerComponent:f=uj,max:h=5,name:v,onChange:y,onChangeActive:b,onMouseLeave:p,onMouseMove:m,precision:g=1,readOnly:w=!1,size:C="medium",value:S}=r,$=Y(r,rj),R=js(v),[k,P]=vs({controlled:S,default:i,name:"Rating"}),N=Mm(k,g),F=ny(),[{hover:L,focus:D},M]=x.useState({hover:-1,focus:-1});let j=N;L!==-1&&(j=L),D!==-1&&(j=D);const{isFocusVisibleRef:B,onBlur:I,onFocus:z,ref:H}=rc(),[le,ae]=x.useState(!1),ye=x.useRef(),J=Tt(H,ye,n),he=Z=>{m&&m(Z);const Le=ye.current,{right:Ue,left:qe,width:ut}=Le.getBoundingClientRect();let De;F?De=(Ue-Z.clientX)/ut:De=(Z.clientX-qe)/ut;let Pe=Mm(h*De+g/2,g);Pe=ey(Pe,g,h),M(Ze=>Ze.hover===Pe&&Ze.focus===Pe?Ze:{hover:Pe,focus:Pe}),ae(!1),b&&L!==Pe&&b(Z,Pe)},V=Z=>{p&&p(Z);const Le=-1;M({hover:Le,focus:Le}),b&&L!==Le&&b(Z,Le)},me=Z=>{let Le=Z.target.value===""?null:parseFloat(Z.target.value);L!==-1&&(Le=L),P(Le),y&&y(Z,Le)},we=Z=>{Z.clientX===0&&Z.clientY===0||(M({hover:-1,focus:-1}),P(null),y&&parseFloat(Z.target.value)===N&&y(Z,null))},Se=Z=>{z(Z),B.current===!0&&ae(!0);const Le=parseFloat(Z.target.value);M(Ue=>({hover:Ue.hover,focus:Le}))},Fe=Z=>{if(L!==-1)return;I(Z),B.current===!1&&ae(!1);const Le=-1;M(Ue=>({hover:Ue.hover,focus:Le}))},[ie,Oe]=x.useState(!1),ge=E({},r,{defaultValue:i,disabled:a,emptyIcon:s,emptyLabelText:l,emptyValueFocused:ie,focusVisible:le,getLabelText:u,icon:d,IconContainerComponent:f,max:h,precision:g,readOnly:w,size:C}),$e=ij(ge);return G(aj,E({ref:J,onMouseMove:he,onMouseLeave:V,className:te($e.root,o,w&&"MuiRating-readOnly"),ownerState:ge,role:w?"img":null,"aria-label":w?u(j):null},$,{children:[Array.from(new Array(h)).map((Z,Le)=>{const Ue=Le+1,qe={classes:$e,disabled:a,emptyIcon:s,focus:D,getLabelText:u,highlightSelectedOnly:c,hover:L,icon:d,IconContainerComponent:f,name:R,onBlur:Fe,onChange:me,onClick:we,onFocus:Se,ratingValue:j,ratingValueRounded:N,readOnly:w,ownerState:ge},ut=Ue===Math.ceil(j)&&(L!==-1||D!==-1);if(g<1){const De=Array.from(new Array(1/g));return _(lj,{className:te($e.decimal,ut&&$e.iconActive),ownerState:ge,iconActive:ut,children:De.map((Pe,Ze)=>{const Be=Mm(Ue-1+(Ze+1)*g,g);return _(iS,E({},qe,{isActive:!1,itemValue:Be,labelProps:{style:De.length-1===Ze?{}:{width:Be===j?`${(Ze+1)*g*100}%`:"0%",overflow:"hidden",position:"absolute"}}}),Be)})},Ue)}return _(iS,E({},qe,{isActive:ut,itemValue:Ue}),Ue)}),!w&&!a&&G(B4,{className:te($e.label,$e.labelEmptyValue),ownerState:ge,children:[_("input",{className:$e.visuallyHidden,value:"",id:`${R}-empty`,type:"radio",name:R,checked:N==null,onFocus:()=>Oe(!0),onBlur:()=>Oe(!1),onChange:me}),_("span",{className:$e.visuallyHidden,children:l})]})]}))}),hj=pj;function mj(e){return _e("MuiSelect",e)}const vj=xe("MuiSelect",["root","select","multiple","filled","outlined","standard","disabled","focused","icon","iconOpen","iconFilled","iconOutlined","iconStandard","nativeInput","error"]),_l=vj;var aS;const gj=["aria-describedby","aria-label","autoFocus","autoWidth","children","className","defaultOpen","defaultValue","disabled","displayEmpty","error","IconComponent","inputRef","labelId","MenuProps","multiple","name","onBlur","onChange","onClose","onFocus","onOpen","open","readOnly","renderValue","SelectDisplayProps","tabIndex","type","value","variant"],yj=X("div",{name:"MuiSelect",slot:"Select",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[{[`&.${_l.select}`]:t.select},{[`&.${_l.select}`]:t[n.variant]},{[`&.${_l.error}`]:t.error},{[`&.${_l.multiple}`]:t.multiple}]}})(M4,{[`&.${_l.select}`]:{height:"auto",minHeight:"1.4375em",textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}),bj=X("svg",{name:"MuiSelect",slot:"Icon",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.icon,n.variant&&t[`icon${K(n.variant)}`],n.open&&t.iconOpen]}})(L4),xj=X("input",{shouldForwardProp:e=>dy(e)&&e!=="classes",name:"MuiSelect",slot:"NativeInput",overridesResolver:(e,t)=>t.nativeInput})({bottom:0,left:0,position:"absolute",opacity:0,pointerEvents:"none",width:"100%",boxSizing:"border-box"});function sS(e,t){return typeof t=="object"&&t!==null?e===t:String(e)===String(t)}function Sj(e){return e==null||typeof e=="string"&&!e.trim()}const wj=e=>{const{classes:t,variant:n,disabled:r,multiple:o,open:i,error:a}=e,s={select:["select",n,r&&"disabled",o&&"multiple",a&&"error"],icon:["icon",`icon${K(n)}`,i&&"iconOpen",r&&"disabled"],nativeInput:["nativeInput"]};return Ce(s,mj,t)},_j=x.forwardRef(function(t,n){var r;const{"aria-describedby":o,"aria-label":i,autoFocus:a,autoWidth:s,children:l,className:u,defaultOpen:c,defaultValue:d,disabled:f,displayEmpty:h,error:v=!1,IconComponent:y,inputRef:b,labelId:p,MenuProps:m={},multiple:g,name:w,onBlur:C,onChange:S,onClose:$,onFocus:R,onOpen:k,open:P,readOnly:N,renderValue:F,SelectDisplayProps:L={},tabIndex:D,value:M,variant:j="standard"}=t,B=Y(t,gj),[I,z]=vs({controlled:M,default:d,name:"Select"}),[H,le]=vs({controlled:P,default:c,name:"Select"}),ae=x.useRef(null),ye=x.useRef(null),[J,he]=x.useState(null),{current:V}=x.useRef(P!=null),[me,we]=x.useState(),Se=Tt(n,b),Fe=x.useCallback(ue=>{ye.current=ue,ue&&he(ue)},[]),ie=J==null?void 0:J.parentNode;x.useImperativeHandle(Se,()=>({focus:()=>{ye.current.focus()},node:ae.current,value:I}),[I]),x.useEffect(()=>{c&&H&&J&&!V&&(we(s?null:ie.clientWidth),ye.current.focus())},[J,s]),x.useEffect(()=>{a&&ye.current.focus()},[a]),x.useEffect(()=>{if(!p)return;const ue=ln(ye.current).getElementById(p);if(ue){const We=()=>{getSelection().isCollapsed&&ye.current.focus()};return ue.addEventListener("click",We),()=>{ue.removeEventListener("click",We)}}},[p]);const Oe=(ue,We)=>{ue?k&&k(We):$&&$(We),V||(we(s?null:ie.clientWidth),le(ue))},ge=ue=>{ue.button===0&&(ue.preventDefault(),ye.current.focus(),Oe(!0,ue))},$e=ue=>{Oe(!1,ue)},Z=x.Children.toArray(l),Le=ue=>{const We=Z.find(ct=>ct.props.value===ue.target.value);We!==void 0&&(z(We.props.value),S&&S(ue,We))},Ue=ue=>We=>{let ct;if(We.currentTarget.hasAttribute("tabindex")){if(g){ct=Array.isArray(I)?I.slice():[];const dn=I.indexOf(ue.props.value);dn===-1?ct.push(ue.props.value):ct.splice(dn,1)}else ct=ue.props.value;if(ue.props.onClick&&ue.props.onClick(We),I!==ct&&(z(ct),S)){const dn=We.nativeEvent||We,Zr=new dn.constructor(dn.type,dn);Object.defineProperty(Zr,"target",{writable:!0,value:{value:ct,name:w}}),S(Zr,ue)}g||Oe(!1,We)}},qe=ue=>{N||[" ","ArrowUp","ArrowDown","Enter"].indexOf(ue.key)!==-1&&(ue.preventDefault(),Oe(!0,ue))},ut=J!==null&&H,De=ue=>{!ut&&C&&(Object.defineProperty(ue,"target",{writable:!0,value:{value:I,name:w}}),C(ue))};delete B["aria-invalid"];let Pe,Ze;const Be=[];let q=!1;(Df({value:I})||h)&&(F?Pe=F(I):q=!0);const Ie=Z.map(ue=>{if(!x.isValidElement(ue))return null;let We;if(g){if(!Array.isArray(I))throw new Error(So(2));We=I.some(ct=>sS(ct,ue.props.value)),We&&q&&Be.push(ue.props.children)}else We=sS(I,ue.props.value),We&&q&&(Ze=ue.props.children);return x.cloneElement(ue,{"aria-selected":We?"true":"false",onClick:Ue(ue),onKeyUp:ct=>{ct.key===" "&&ct.preventDefault(),ue.props.onKeyUp&&ue.props.onKeyUp(ct)},role:"option",selected:We,value:void 0,"data-value":ue.props.value})});q&&(g?Be.length===0?Pe=null:Pe=Be.reduce((ue,We,ct)=>(ue.push(We),ct<Be.length-1&&ue.push(", "),ue),[]):Pe=Ze);let je=me;!s&&V&&J&&(je=ie.clientWidth);let Qe;typeof D<"u"?Qe=D:Qe=f?null:0;const Re=L.id||(w?`mui-component-select-${w}`:void 0),pe=E({},t,{variant:j,value:I,open:ut,error:v}),Je=wj(pe),An=E({},m.PaperProps,(r=m.slotProps)==null?void 0:r.paper),Ct=js();return G(x.Fragment,{children:[_(yj,E({ref:Fe,tabIndex:Qe,role:"combobox","aria-controls":Ct,"aria-disabled":f?"true":void 0,"aria-expanded":ut?"true":"false","aria-haspopup":"listbox","aria-label":i,"aria-labelledby":[p,Re].filter(Boolean).join(" ")||void 0,"aria-describedby":o,onKeyDown:qe,onMouseDown:f||N?null:ge,onBlur:De,onFocus:R},L,{ownerState:pe,className:te(L.className,Je.select,u),id:Re,children:Sj(Pe)?aS||(aS=_("span",{className:"notranslate",children:"​"})):Pe})),_(xj,E({"aria-invalid":v,value:Array.isArray(I)?I.join(","):I,name:w,ref:ae,"aria-hidden":!0,onChange:Le,tabIndex:-1,disabled:f,className:Je.nativeInput,autoFocus:a,ownerState:pe},B)),_(bj,{as:y,className:Je.icon,ownerState:pe}),_(Rz,E({id:`menu-${w||""}`,anchorEl:ie,open:ut,onClose:$e,anchorOrigin:{vertical:"bottom",horizontal:"center"},transformOrigin:{vertical:"top",horizontal:"center"}},m,{MenuListProps:E({"aria-labelledby":p,role:"listbox","aria-multiselectable":g?"true":void 0,disableListWrap:!0,id:Ct},m.MenuListProps),slotProps:E({},m.slotProps,{paper:E({},An,{style:E({minWidth:je},An!=null?An.style:null)})}),children:Ie}))]})}),Ej=_j,Cj=["autoWidth","children","classes","className","defaultOpen","displayEmpty","IconComponent","id","input","inputProps","label","labelId","MenuProps","multiple","native","onClose","onOpen","open","renderValue","SelectDisplayProps","variant"],$j=["root"],Rj=e=>{const{classes:t}=e;return t},ky={name:"MuiSelect",overridesResolver:(e,t)=>t.root,shouldForwardProp:e=>Nn(e)&&e!=="variant",slot:"Root"},kj=X(O4,ky)(""),Pj=X(D4,ky)(""),Tj=X(R4,ky)(""),z4=x.forwardRef(function(t,n){const r=Ee({name:"MuiSelect",props:t}),{autoWidth:o=!1,children:i,classes:a={},className:s,defaultOpen:l=!1,displayEmpty:u=!1,IconComponent:c=VL,id:d,input:f,inputProps:h,label:v,labelId:y,MenuProps:b,multiple:p=!1,native:m=!1,onClose:g,onOpen:w,open:C,renderValue:S,SelectDisplayProps:$,variant:R="outlined"}=r,k=Y(r,Cj),P=m?Uz:Ej,N=gi(),F=ua({props:r,muiFormControl:N,states:["variant","error"]}),L=F.variant||R,D=E({},r,{variant:L,classes:a}),M=Rj(D),j=Y(M,$j),B=f||{standard:_(kj,{ownerState:D}),outlined:_(Pj,{label:v,ownerState:D}),filled:_(Tj,{ownerState:D})}[L],I=Tt(n,B.ref);return _(x.Fragment,{children:x.cloneElement(B,E({inputComponent:P,inputProps:E({children:i,error:F.error,IconComponent:c,variant:L,type:void 0,multiple:p},m?{id:d}:{autoWidth:o,defaultOpen:l,displayEmpty:u,labelId:y,MenuProps:b,onClose:g,onOpen:w,open:C,renderValue:S,SelectDisplayProps:E({id:d},$)},h,{classes:h?gn(j,h.classes):j},f?f.props.inputProps:{})},(p&&m||u)&&L==="outlined"?{notched:!0}:{},{ref:I,className:te(B.props.className,s,M.root)},!f&&{variant:L},k))})});z4.muiName="Select";const Lv=z4;function Oj(e){return _e("MuiTooltip",e)}const Ij=xe("MuiTooltip",["popper","popperInteractive","popperArrow","popperClose","tooltip","tooltipArrow","touch","tooltipPlacementLeft","tooltipPlacementRight","tooltipPlacementTop","tooltipPlacementBottom","arrow"]),Ko=Ij,Nj=["arrow","children","classes","components","componentsProps","describeChild","disableFocusListener","disableHoverListener","disableInteractive","disableTouchListener","enterDelay","enterNextDelay","enterTouchDelay","followCursor","id","leaveDelay","leaveTouchDelay","onClose","onOpen","open","placement","PopperComponent","PopperProps","slotProps","slots","title","TransitionComponent","TransitionProps"];function Aj(e){return Math.round(e*1e5)/1e5}const Mj=e=>{const{classes:t,disableInteractive:n,arrow:r,touch:o,placement:i}=e,a={popper:["popper",!n&&"popperInteractive",r&&"popperArrow"],tooltip:["tooltip",r&&"tooltipArrow",o&&"touch",`tooltipPlacement${K(i.split("-")[0])}`],arrow:["arrow"]};return Ce(a,Oj,t)},Lj=X(S4,{name:"MuiTooltip",slot:"Popper",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.popper,!n.disableInteractive&&t.popperInteractive,n.arrow&&t.popperArrow,!n.open&&t.popperClose]}})(({theme:e,ownerState:t,open:n})=>E({zIndex:(e.vars||e).zIndex.tooltip,pointerEvents:"none"},!t.disableInteractive&&{pointerEvents:"auto"},!n&&{pointerEvents:"none"},t.arrow&&{[`&[data-popper-placement*="bottom"] .${Ko.arrow}`]:{top:0,marginTop:"-0.71em","&::before":{transformOrigin:"0 100%"}},[`&[data-popper-placement*="top"] .${Ko.arrow}`]:{bottom:0,marginBottom:"-0.71em","&::before":{transformOrigin:"100% 0"}},[`&[data-popper-placement*="right"] .${Ko.arrow}`]:E({},t.isRtl?{right:0,marginRight:"-0.71em"}:{left:0,marginLeft:"-0.71em"},{height:"1em",width:"0.71em","&::before":{transformOrigin:"100% 100%"}}),[`&[data-popper-placement*="left"] .${Ko.arrow}`]:E({},t.isRtl?{left:0,marginLeft:"-0.71em"}:{right:0,marginRight:"-0.71em"},{height:"1em",width:"0.71em","&::before":{transformOrigin:"0 0"}})})),Fj=X("div",{name:"MuiTooltip",slot:"Tooltip",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.tooltip,n.touch&&t.touch,n.arrow&&t.tooltipArrow,t[`tooltipPlacement${K(n.placement.split("-")[0])}`]]}})(({theme:e,ownerState:t})=>E({backgroundColor:e.vars?e.vars.palette.Tooltip.bg:Nt(e.palette.grey[700],.92),borderRadius:(e.vars||e).shape.borderRadius,color:(e.vars||e).palette.common.white,fontFamily:e.typography.fontFamily,padding:"4px 8px",fontSize:e.typography.pxToRem(11),maxWidth:300,margin:2,wordWrap:"break-word",fontWeight:e.typography.fontWeightMedium},t.arrow&&{position:"relative",margin:0},t.touch&&{padding:"8px 16px",fontSize:e.typography.pxToRem(14),lineHeight:`${Aj(16/14)}em`,fontWeight:e.typography.fontWeightRegular},{[`.${Ko.popper}[data-popper-placement*="left"] &`]:E({transformOrigin:"right center"},t.isRtl?E({marginLeft:"14px"},t.touch&&{marginLeft:"24px"}):E({marginRight:"14px"},t.touch&&{marginRight:"24px"})),[`.${Ko.popper}[data-popper-placement*="right"] &`]:E({transformOrigin:"left center"},t.isRtl?E({marginRight:"14px"},t.touch&&{marginRight:"24px"}):E({marginLeft:"14px"},t.touch&&{marginLeft:"24px"})),[`.${Ko.popper}[data-popper-placement*="top"] &`]:E({transformOrigin:"center bottom",marginBottom:"14px"},t.touch&&{marginBottom:"24px"}),[`.${Ko.popper}[data-popper-placement*="bottom"] &`]:E({transformOrigin:"center top",marginTop:"14px"},t.touch&&{marginTop:"24px"})})),Dj=X("span",{name:"MuiTooltip",slot:"Arrow",overridesResolver:(e,t)=>t.arrow})(({theme:e})=>({overflow:"hidden",position:"absolute",width:"1em",height:"0.71em",boxSizing:"border-box",color:e.vars?e.vars.palette.Tooltip.bg:Nt(e.palette.grey[700],.9),"&::before":{content:'""',margin:"auto",display:"block",width:"100%",height:"100%",backgroundColor:"currentColor",transform:"rotate(45deg)"}}));let td=!1;const lS=new nc;let El={x:0,y:0};function nd(e,t){return(n,...r)=>{t&&t(n,...r),e(n,...r)}}const Bj=x.forwardRef(function(t,n){var r,o,i,a,s,l,u,c,d,f,h,v,y,b,p,m,g,w,C;const S=Ee({props:t,name:"MuiTooltip"}),{arrow:$=!1,children:R,components:k={},componentsProps:P={},describeChild:N=!1,disableFocusListener:F=!1,disableHoverListener:L=!1,disableInteractive:D=!1,disableTouchListener:M=!1,enterDelay:j=100,enterNextDelay:B=0,enterTouchDelay:I=700,followCursor:z=!1,id:H,leaveDelay:le=0,leaveTouchDelay:ae=1500,onClose:ye,onOpen:J,open:he,placement:V="bottom",PopperComponent:me,PopperProps:we={},slotProps:Se={},slots:Fe={},title:ie,TransitionComponent:Oe=Av,TransitionProps:ge}=S,$e=Y(S,Nj),Z=x.isValidElement(R)?R:_("span",{children:R}),Le=Nr(),Ue=ny(),[qe,ut]=x.useState(),[De,Pe]=x.useState(null),Ze=x.useRef(!1),Be=D||z,q=Ii(),Ie=Ii(),je=Ii(),Qe=Ii(),[Re,pe]=vs({controlled:he,default:!1,name:"Tooltip",state:"open"});let Je=Re;const An=js(H),Ct=x.useRef(),ue=fo(()=>{Ct.current!==void 0&&(document.body.style.WebkitUserSelect=Ct.current,Ct.current=void 0),Qe.clear()});x.useEffect(()=>ue,[ue]);const We=ce=>{lS.clear(),td=!0,pe(!0),J&&!Je&&J(ce)},ct=fo(ce=>{lS.start(800+le,()=>{td=!1}),pe(!1),ye&&Je&&ye(ce),q.start(Le.transitions.duration.shortest,()=>{Ze.current=!1})}),dn=ce=>{Ze.current&&ce.type!=="touchstart"||(qe&&qe.removeAttribute("title"),Ie.clear(),je.clear(),j||td&&B?Ie.start(td?B:j,()=>{We(ce)}):We(ce))},Zr=ce=>{Ie.clear(),je.start(le,()=>{ct(ce)})},{isFocusVisibleRef:bi,onBlur:_c,onFocus:Js,ref:Zs}=rc(),[,Ec]=x.useState(!1),el=ce=>{_c(ce),bi.current===!1&&(Ec(!1),Zr(ce))},Cc=ce=>{qe||ut(ce.currentTarget),Js(ce),bi.current===!0&&(Ec(!0),dn(ce))},tl=ce=>{Ze.current=!0;const Lt=Z.props;Lt.onTouchStart&&Lt.onTouchStart(ce)},ma=ce=>{tl(ce),je.clear(),q.clear(),ue(),Ct.current=document.body.style.WebkitUserSelect,document.body.style.WebkitUserSelect="none",Qe.start(I,()=>{document.body.style.WebkitUserSelect=Ct.current,dn(ce)})},va=ce=>{Z.props.onTouchEnd&&Z.props.onTouchEnd(ce),ue(),je.start(ae,()=>{ct(ce)})};x.useEffect(()=>{if(!Je)return;function ce(Lt){(Lt.key==="Escape"||Lt.key==="Esc")&&ct(Lt)}return document.addEventListener("keydown",ce),()=>{document.removeEventListener("keydown",ce)}},[ct,Je]);const Vh=Tt(Z.ref,Zs,ut,n);!ie&&ie!==0&&(Je=!1);const nl=x.useRef(),T=ce=>{const Lt=Z.props;Lt.onMouseMove&&Lt.onMouseMove(ce),El={x:ce.clientX,y:ce.clientY},nl.current&&nl.current.update()},O={},A=typeof ie=="string";N?(O.title=!Je&&A&&!L?ie:null,O["aria-describedby"]=Je?An:null):(O["aria-label"]=A?ie:null,O["aria-labelledby"]=Je&&!A?An:null);const U=E({},O,$e,Z.props,{className:te($e.className,Z.props.className),onTouchStart:tl,ref:Vh},z?{onMouseMove:T}:{}),Q={};M||(U.onTouchStart=ma,U.onTouchEnd=va),L||(U.onMouseOver=nd(dn,U.onMouseOver),U.onMouseLeave=nd(Zr,U.onMouseLeave),Be||(Q.onMouseOver=dn,Q.onMouseLeave=Zr)),F||(U.onFocus=nd(Cc,U.onFocus),U.onBlur=nd(el,U.onBlur),Be||(Q.onFocus=Cc,Q.onBlur=el));const fe=x.useMemo(()=>{var ce;let Lt=[{name:"arrow",enabled:!!De,options:{element:De,padding:4}}];return(ce=we.popperOptions)!=null&&ce.modifiers&&(Lt=Lt.concat(we.popperOptions.modifiers)),E({},we.popperOptions,{modifiers:Lt})},[De,we]),be=E({},S,{isRtl:Ue,arrow:$,disableInteractive:Be,placement:V,PopperComponentProp:me,touch:Ze.current}),ne=Mj(be),oe=(r=(o=Fe.popper)!=null?o:k.Popper)!=null?r:Lj,ee=(i=(a=(s=Fe.transition)!=null?s:k.Transition)!=null?a:Oe)!=null?i:Av,de=(l=(u=Fe.tooltip)!=null?u:k.Tooltip)!=null?l:Fj,Ae=(c=(d=Fe.arrow)!=null?d:k.Arrow)!=null?c:Dj,ze=Wl(oe,E({},we,(f=Se.popper)!=null?f:P.popper,{className:te(ne.popper,we==null?void 0:we.className,(h=(v=Se.popper)!=null?v:P.popper)==null?void 0:h.className)}),be),zt=Wl(ee,E({},ge,(y=Se.transition)!=null?y:P.transition),be),rt=Wl(de,E({},(b=Se.tooltip)!=null?b:P.tooltip,{className:te(ne.tooltip,(p=(m=Se.tooltip)!=null?m:P.tooltip)==null?void 0:p.className)}),be),He=Wl(Ae,E({},(g=Se.arrow)!=null?g:P.arrow,{className:te(ne.arrow,(w=(C=Se.arrow)!=null?C:P.arrow)==null?void 0:w.className)}),be);return G(x.Fragment,{children:[x.cloneElement(Z,U),_(oe,E({as:me??S4,placement:V,anchorEl:z?{getBoundingClientRect:()=>({top:El.y,left:El.x,right:El.x,bottom:El.y,width:0,height:0})}:qe,popperRef:nl,open:qe?Je:!1,id:An,transition:!0},Q,ze,{popperOptions:fe,children:({TransitionProps:ce})=>_(ee,E({timeout:Le.transitions.duration.shorter},ce,zt,{children:G(de,E({},rt,{children:[ie,$?_(Ae,E({},He,{ref:Pe})):null]}))}))}))]})}),pn=Bj,zj=x.createContext(),j4=zj;function jj(e){return _e("MuiTable",e)}xe("MuiTable",["root","stickyHeader"]);const Uj=["className","component","padding","size","stickyHeader"],Wj=e=>{const{classes:t,stickyHeader:n}=e;return Ce({root:["root",n&&"stickyHeader"]},jj,t)},Hj=X("table",{name:"MuiTable",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,n.stickyHeader&&t.stickyHeader]}})(({theme:e,ownerState:t})=>E({display:"table",width:"100%",borderCollapse:"collapse",borderSpacing:0,"& caption":E({},e.typography.body2,{padding:e.spacing(2),color:(e.vars||e).palette.text.secondary,textAlign:"left",captionSide:"bottom"})},t.stickyHeader&&{borderCollapse:"separate"})),uS="table",Vj=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiTable"}),{className:o,component:i=uS,padding:a="normal",size:s="medium",stickyHeader:l=!1}=r,u=Y(r,Uj),c=E({},r,{component:i,padding:a,size:s,stickyHeader:l}),d=Wj(c),f=x.useMemo(()=>({padding:a,size:s,stickyHeader:l}),[a,s,l]);return _(j4.Provider,{value:f,children:_(Hj,E({as:i,role:i===uS?null:"table",ref:n,className:te(d.root,o),ownerState:c},u))})}),U4=Vj,Gj=x.createContext(),Py=Gj;function Kj(e){return _e("MuiTableBody",e)}xe("MuiTableBody",["root"]);const Xj=["className","component"],Yj=e=>{const{classes:t}=e;return Ce({root:["root"]},Kj,t)},qj=X("tbody",{name:"MuiTableBody",slot:"Root",overridesResolver:(e,t)=>t.root})({display:"table-row-group"}),Qj={variant:"body"},cS="tbody",Jj=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiTableBody"}),{className:o,component:i=cS}=r,a=Y(r,Xj),s=E({},r,{component:i}),l=Yj(s);return _(Py.Provider,{value:Qj,children:_(qj,E({className:te(l.root,o),as:i,ref:n,role:i===cS?null:"rowgroup",ownerState:s},a))})}),W4=Jj;function Zj(e){return _e("MuiTableCell",e)}const eU=xe("MuiTableCell",["root","head","body","footer","sizeSmall","sizeMedium","paddingCheckbox","paddingNone","alignLeft","alignCenter","alignRight","alignJustify","stickyHeader"]),tU=eU,nU=["align","className","component","padding","scope","size","sortDirection","variant"],rU=e=>{const{classes:t,variant:n,align:r,padding:o,size:i,stickyHeader:a}=e,s={root:["root",n,a&&"stickyHeader",r!=="inherit"&&`align${K(r)}`,o!=="normal"&&`padding${K(o)}`,`size${K(i)}`]};return Ce(s,Zj,t)},oU=X("td",{name:"MuiTableCell",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[n.variant],t[`size${K(n.size)}`],n.padding!=="normal"&&t[`padding${K(n.padding)}`],n.align!=="inherit"&&t[`align${K(n.align)}`],n.stickyHeader&&t.stickyHeader]}})(({theme:e,ownerState:t})=>E({},e.typography.body2,{display:"table-cell",verticalAlign:"inherit",borderBottom:e.vars?`1px solid ${e.vars.palette.TableCell.border}`:`1px solid
    ${e.palette.mode==="light"?F$(Nt(e.palette.divider,1),.88):L$(Nt(e.palette.divider,1),.68)}`,textAlign:"left",padding:16},t.variant==="head"&&{color:(e.vars||e).palette.text.primary,lineHeight:e.typography.pxToRem(24),fontWeight:e.typography.fontWeightMedium},t.variant==="body"&&{color:(e.vars||e).palette.text.primary},t.variant==="footer"&&{color:(e.vars||e).palette.text.secondary,lineHeight:e.typography.pxToRem(21),fontSize:e.typography.pxToRem(12)},t.size==="small"&&{padding:"6px 16px",[`&.${tU.paddingCheckbox}`]:{width:24,padding:"0 12px 0 16px","& > *":{padding:0}}},t.padding==="checkbox"&&{width:48,padding:"0 0 0 4px"},t.padding==="none"&&{padding:0},t.align==="left"&&{textAlign:"left"},t.align==="center"&&{textAlign:"center"},t.align==="right"&&{textAlign:"right",flexDirection:"row-reverse"},t.align==="justify"&&{textAlign:"justify"},t.stickyHeader&&{position:"sticky",top:0,zIndex:2,backgroundColor:(e.vars||e).palette.background.default})),iU=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiTableCell"}),{align:o="inherit",className:i,component:a,padding:s,scope:l,size:u,sortDirection:c,variant:d}=r,f=Y(r,nU),h=x.useContext(j4),v=x.useContext(Py),y=v&&v.variant==="head";let b;a?b=a:b=y?"th":"td";let p=l;b==="td"?p=void 0:!p&&y&&(p="col");const m=d||v&&v.variant,g=E({},r,{align:o,component:b,padding:s||(h&&h.padding?h.padding:"normal"),size:u||(h&&h.size?h.size:"medium"),sortDirection:c,stickyHeader:m==="head"&&h&&h.stickyHeader,variant:m}),w=rU(g);let C=null;return c&&(C=c==="asc"?"ascending":"descending"),_(oU,E({as:b,ref:n,className:te(w.root,i),"aria-sort":C,scope:p,ownerState:g},f))}),H4=iU;function aU(e){return _e("MuiToolbar",e)}xe("MuiToolbar",["root","gutters","regular","dense"]);const sU=["className","component","disableGutters","variant"],lU=e=>{const{classes:t,disableGutters:n,variant:r}=e;return Ce({root:["root",!n&&"gutters",r]},aU,t)},uU=X("div",{name:"MuiToolbar",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,!n.disableGutters&&t.gutters,t[n.variant]]}})(({theme:e,ownerState:t})=>E({position:"relative",display:"flex",alignItems:"center"},!t.disableGutters&&{paddingLeft:e.spacing(2),paddingRight:e.spacing(2),[e.breakpoints.up("sm")]:{paddingLeft:e.spacing(3),paddingRight:e.spacing(3)}},t.variant==="dense"&&{minHeight:48}),({theme:e,ownerState:t})=>t.variant==="regular"&&e.mixins.toolbar),cU=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiToolbar"}),{className:o,component:i="div",disableGutters:a=!1,variant:s="regular"}=r,l=Y(r,sU),u=E({},r,{component:i,disableGutters:a,variant:s}),c=lU(u);return _(uU,E({as:i,className:te(c.root,o),ref:n,ownerState:u},l))}),dU=cU;function fU(e){return _e("MuiTableRow",e)}const pU=xe("MuiTableRow",["root","selected","hover","head","footer"]),dS=pU,hU=["className","component","hover","selected"],mU=e=>{const{classes:t,selected:n,hover:r,head:o,footer:i}=e;return Ce({root:["root",n&&"selected",r&&"hover",o&&"head",i&&"footer"]},fU,t)},vU=X("tr",{name:"MuiTableRow",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,n.head&&t.head,n.footer&&t.footer]}})(({theme:e})=>({color:"inherit",display:"table-row",verticalAlign:"middle",outline:0,[`&.${dS.hover}:hover`]:{backgroundColor:(e.vars||e).palette.action.hover},[`&.${dS.selected}`]:{backgroundColor:e.vars?`rgba(${e.vars.palette.primary.mainChannel} / ${e.vars.palette.action.selectedOpacity})`:Nt(e.palette.primary.main,e.palette.action.selectedOpacity),"&:hover":{backgroundColor:e.vars?`rgba(${e.vars.palette.primary.mainChannel} / calc(${e.vars.palette.action.selectedOpacity} + ${e.vars.palette.action.hoverOpacity}))`:Nt(e.palette.primary.main,e.palette.action.selectedOpacity+e.palette.action.hoverOpacity)}}})),fS="tr",gU=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiTableRow"}),{className:o,component:i=fS,hover:a=!1,selected:s=!1}=r,l=Y(r,hU),u=x.useContext(Py),c=E({},r,{component:i,hover:a,selected:s,head:u&&u.variant==="head",footer:u&&u.variant==="footer"}),d=mU(c);return _(vU,E({as:i,ref:n,className:te(d.root,o),role:i===fS?null:"row",ownerState:c},l))}),V4=gU;function yU(e){return _e("MuiTextField",e)}xe("MuiTextField",["root"]);const bU=["autoComplete","autoFocus","children","className","color","defaultValue","disabled","error","FormHelperTextProps","fullWidth","helperText","id","InputLabelProps","inputProps","InputProps","inputRef","label","maxRows","minRows","multiline","name","onBlur","onChange","onFocus","placeholder","required","rows","select","SelectProps","type","value","variant"],xU={standard:O4,filled:R4,outlined:D4},SU=e=>{const{classes:t}=e;return Ce({root:["root"]},yU,t)},wU=X(Iv,{name:"MuiTextField",slot:"Root",overridesResolver:(e,t)=>t.root})({}),_U=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiTextField"}),{autoComplete:o,autoFocus:i=!1,children:a,className:s,color:l="primary",defaultValue:u,disabled:c=!1,error:d=!1,FormHelperTextProps:f,fullWidth:h=!1,helperText:v,id:y,InputLabelProps:b,inputProps:p,InputProps:m,inputRef:g,label:w,maxRows:C,minRows:S,multiline:$=!1,name:R,onBlur:k,onChange:P,onFocus:N,placeholder:F,required:L=!1,rows:D,select:M=!1,SelectProps:j,type:B,value:I,variant:z="outlined"}=r,H=Y(r,bU),le=E({},r,{autoFocus:i,color:l,disabled:c,error:d,fullWidth:h,multiline:$,required:L,select:M,variant:z}),ae=SU(le),ye={};z==="outlined"&&(b&&typeof b.shrink<"u"&&(ye.notched=b.shrink),ye.label=w),M&&((!j||!j.native)&&(ye.id=void 0),ye["aria-describedby"]=void 0);const J=js(y),he=v&&J?`${J}-helper-text`:void 0,V=w&&J?`${J}-label`:void 0,me=xU[z],we=_(me,E({"aria-describedby":he,autoComplete:o,autoFocus:i,defaultValue:u,fullWidth:h,multiline:$,name:R,rows:D,maxRows:C,minRows:S,type:B,value:I,id:J,inputRef:g,onBlur:k,onChange:P,onFocus:N,placeholder:F,inputProps:p},ye,m));return G(wU,E({className:te(ae.root,s),disabled:c,error:d,fullWidth:h,ref:n,required:L,color:l,variant:z,ownerState:le},H,{children:[w!=null&&w!==""&&_(qr,E({htmlFor:J,id:V},b,{children:w})),M?_(Lv,E({"aria-describedby":he,id:J,labelId:V,value:I,input:we},j,{children:a})):we,v&&_(aB,E({id:he},f,{children:v}))]}))}),Qd=_U;function EU(e){return _e("MuiToggleButton",e)}const CU=xe("MuiToggleButton",["root","disabled","selected","standard","primary","secondary","sizeSmall","sizeMedium","sizeLarge","fullWidth"]),Wa=CU,$U=x.createContext({}),G4=$U,RU=x.createContext(void 0),K4=RU;function kU(e,t){return t===void 0||e===void 0?!1:Array.isArray(t)?t.indexOf(e)>=0:e===t}const PU=["value"],TU=["children","className","color","disabled","disableFocusRipple","fullWidth","onChange","onClick","selected","size","value"],OU=e=>{const{classes:t,fullWidth:n,selected:r,disabled:o,size:i,color:a}=e,s={root:["root",r&&"selected",o&&"disabled",n&&"fullWidth",`size${K(i)}`,a]};return Ce(s,EU,t)},IU=X(sc,{name:"MuiToggleButton",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[`size${K(n.size)}`]]}})(({theme:e,ownerState:t})=>{let n=t.color==="standard"?e.palette.text.primary:e.palette[t.color].main,r;return e.vars&&(n=t.color==="standard"?e.vars.palette.text.primary:e.vars.palette[t.color].main,r=t.color==="standard"?e.vars.palette.text.primaryChannel:e.vars.palette[t.color].mainChannel),E({},e.typography.button,{borderRadius:(e.vars||e).shape.borderRadius,padding:11,border:`1px solid ${(e.vars||e).palette.divider}`,color:(e.vars||e).palette.action.active},t.fullWidth&&{width:"100%"},{[`&.${Wa.disabled}`]:{color:(e.vars||e).palette.action.disabled,border:`1px solid ${(e.vars||e).palette.action.disabledBackground}`},"&:hover":{textDecoration:"none",backgroundColor:e.vars?`rgba(${e.vars.palette.text.primaryChannel} / ${e.vars.palette.action.hoverOpacity})`:Kc(e.palette.text.primary,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},[`&.${Wa.selected}`]:{color:n,backgroundColor:e.vars?`rgba(${r} / ${e.vars.palette.action.selectedOpacity})`:Kc(n,e.palette.action.selectedOpacity),"&:hover":{backgroundColor:e.vars?`rgba(${r} / calc(${e.vars.palette.action.selectedOpacity} + ${e.vars.palette.action.hoverOpacity}))`:Kc(n,e.palette.action.selectedOpacity+e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:e.vars?`rgba(${r} / ${e.vars.palette.action.selectedOpacity})`:Kc(n,e.palette.action.selectedOpacity)}}}},t.size==="small"&&{padding:7,fontSize:e.typography.pxToRem(13)},t.size==="large"&&{padding:15,fontSize:e.typography.pxToRem(15)})}),NU=x.forwardRef(function(t,n){const r=x.useContext(G4),{value:o}=r,i=Y(r,PU),a=x.useContext(K4),s=ps(E({},i,{selected:kU(t.value,o)}),t),l=Ee({props:s,name:"MuiToggleButton"}),{children:u,className:c,color:d="standard",disabled:f=!1,disableFocusRipple:h=!1,fullWidth:v=!1,onChange:y,onClick:b,selected:p,size:m="medium",value:g}=l,w=Y(l,TU),C=E({},l,{color:d,disabled:f,disableFocusRipple:h,fullWidth:v,size:m}),S=OU(C),$=k=>{b&&(b(k,g),k.defaultPrevented)||y&&y(k,g)},R=a||"";return _(IU,E({className:te(i.className,S.root,c,R),disabled:f,focusRipple:!h,ref:n,onClick:$,onChange:y,value:g,ownerState:C,"aria-pressed":p},w,{children:u}))}),AU=NU;function MU(e){return _e("MuiToggleButtonGroup",e)}const LU=xe("MuiToggleButtonGroup",["root","selected","horizontal","vertical","disabled","grouped","groupedHorizontal","groupedVertical","fullWidth","firstButton","lastButton","middleButton"]),gt=LU,FU=["children","className","color","disabled","exclusive","fullWidth","onChange","orientation","size","value"],DU=e=>{const{classes:t,orientation:n,fullWidth:r,disabled:o}=e,i={root:["root",n==="vertical"&&"vertical",r&&"fullWidth"],grouped:["grouped",`grouped${K(n)}`,o&&"disabled"],firstButton:["firstButton"],lastButton:["lastButton"],middleButton:["middleButton"]};return Ce(i,MU,t)},BU=X("div",{name:"MuiToggleButtonGroup",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[{[`& .${gt.grouped}`]:t.grouped},{[`& .${gt.grouped}`]:t[`grouped${K(n.orientation)}`]},{[`& .${gt.firstButton}`]:t.firstButton},{[`& .${gt.lastButton}`]:t.lastButton},{[`& .${gt.middleButton}`]:t.middleButton},t.root,n.orientation==="vertical"&&t.vertical,n.fullWidth&&t.fullWidth]}})(({ownerState:e,theme:t})=>E({display:"inline-flex",borderRadius:(t.vars||t).shape.borderRadius},e.orientation==="vertical"&&{flexDirection:"column"},e.fullWidth&&{width:"100%"},{[`& .${gt.grouped}`]:E({},e.orientation==="horizontal"?{[`&.${gt.selected} + .${gt.grouped}.${gt.selected}`]:{borderLeft:0,marginLeft:0}}:{[`&.${gt.selected} + .${gt.grouped}.${gt.selected}`]:{borderTop:0,marginTop:0}})},e.orientation==="horizontal"?{[`& .${gt.firstButton},& .${gt.middleButton}`]:{borderTopRightRadius:0,borderBottomRightRadius:0},[`& .${gt.lastButton},& .${gt.middleButton}`]:{marginLeft:-1,borderLeft:"1px solid transparent",borderTopLeftRadius:0,borderBottomLeftRadius:0}}:{[`& .${gt.firstButton},& .${gt.middleButton}`]:{borderBottomLeftRadius:0,borderBottomRightRadius:0},[`& .${gt.lastButton},& .${gt.middleButton}`]:{marginTop:-1,borderTop:"1px solid transparent",borderTopLeftRadius:0,borderTopRightRadius:0}},e.orientation==="horizontal"?{[`& .${gt.lastButton}.${Wa.disabled},& .${gt.middleButton}.${Wa.disabled}`]:{borderLeft:"1px solid transparent"}}:{[`& .${gt.lastButton}.${Wa.disabled},& .${gt.middleButton}.${Wa.disabled}`]:{borderTop:"1px solid transparent"}})),zU=x.forwardRef(function(t,n){const r=Ee({props:t,name:"MuiToggleButtonGroup"}),{children:o,className:i,color:a="standard",disabled:s=!1,exclusive:l=!1,fullWidth:u=!1,onChange:c,orientation:d="horizontal",size:f="medium",value:h}=r,v=Y(r,FU),y=E({},r,{disabled:s,fullWidth:u,orientation:d,size:f}),b=DU(y),p=x.useCallback(($,R)=>{if(!c)return;const k=h&&h.indexOf(R);let P;h&&k>=0?(P=h.slice(),P.splice(k,1)):P=h?h.concat(R):[R],c($,P)},[c,h]),m=x.useCallback(($,R)=>{c&&c($,h===R?null:R)},[c,h]),g=x.useMemo(()=>({className:b.grouped,onChange:l?m:p,value:h,size:f,fullWidth:u,color:a,disabled:s}),[b.grouped,l,m,p,h,f,u,a,s]),w=P$(o),C=w.length,S=$=>{const R=$===0,k=$===C-1;return R&&k?"":R?b.firstButton:k?b.lastButton:b.middleButton};return _(BU,E({role:"group",className:te(b.root,i),ref:n,ownerState:y},v,{children:_(G4.Provider,{value:g,children:w.map(($,R)=>_(K4.Provider,{value:S(R),children:$},R))})}))}),jU=zU;let UU=0;function pS(e,t){const n=`atom${++UU}`,r={toString(){return n}};return typeof e=="function"?r.read=e:(r.init=e,r.read=WU,r.write=HU),t&&(r.write=t),r}function WU(e){return e(this)}function HU(e,t,n){return t(this,typeof n=="function"?n(e(this)):n)}const hS=(e,t)=>e.unstable_is?e.unstable_is(t):t===e,mS=e=>"init"in e,vS=e=>!!e.write,Bf=new WeakMap,Fv=e=>{var t;return Dv(e)&&!((t=Bf.get(e))!=null&&t[1])},VU=(e,t)=>{const n=Bf.get(e);n&&(n[1]=!0,n[0].forEach(r=>r(t)))},GU=e=>{if(Bf.has(e))return;const t=[new Set,!1];Bf.set(e,t);const n=()=>{t[1]=!0};e.then(n,n),e.onCancel=r=>{t[0].add(r)}},Dv=e=>typeof(e==null?void 0:e.then)=="function",gS=e=>"v"in e||"e"in e,rd=e=>{if("e"in e)throw e.e;return e.v},X4=(e,t,n)=>{n.p.has(e)||(n.p.add(e),t.then(()=>{n.p.delete(e)},()=>{n.p.delete(e)}))},yS=(e,t,n,r,o)=>{var i;n.d.set(r,o.n),Fv(n.v)&&X4(t,n.v,o),(i=o.m)==null||i.t.add(t),e&&KU(e,r,t)},Cl=()=>[new Map,new Map,new Set],bS=(e,t,n)=>{e[0].has(t)||e[0].set(t,new Set),e[1].set(t,n)},KU=(e,t,n)=>{const r=e[0].get(t);r&&r.add(n)},XU=(e,t)=>e[0].get(t),xS=(e,t)=>{e[2].add(t)},$a=e=>{for(;e[1].size||e[2].size;){e[0].clear();const t=new Set(e[1].values());e[1].clear();const n=new Set(e[2]);e[2].clear(),t.forEach(r=>{var o;return(o=r.m)==null?void 0:o.l.forEach(i=>i())}),n.forEach(r=>r())}},Y4=e=>{let t;const n=(y,b,p)=>{const m="v"in b,g=b.v,w=Fv(b.v)?b.v:null;if(Dv(p)){GU(p);for(const C of b.d.keys())X4(y,p,e(C,b));b.v=p,delete b.e}else b.v=p,delete b.e;(!m||!Object.is(g,b.v))&&(++b.n,w&&VU(w,p))},r=(y,b,p,m)=>{var g;if(gS(p)&&(p.m&&!(m!=null&&m.has(b))||Array.from(p.d).every(([k,P])=>r(y,k,e(k,p),m).n===P)))return p;p.d.clear();let w=!0;const C=k=>{if(hS(b,k)){const N=e(k,p);if(!gS(N))if(mS(k))n(k,N,k.init);else throw new Error("no atom init");return rd(N)}const P=r(y,k,e(k,p),m);if(w)yS(y,b,p,k,P);else{const N=Cl();yS(N,b,p,k,P),u(N,b,p),$a(N)}return rd(P)};let S,$;const R={get signal(){return S||(S=new AbortController),S.signal},get setSelf(){return!$&&vS(b)&&($=(...k)=>{if(!w)return l(b,...k)}),$}};try{const k=b.read(C,R);if(n(b,p,k),Dv(k)){(g=k.onCancel)==null||g.call(k,()=>S==null?void 0:S.abort());const P=()=>{if(p.m){const N=Cl();u(N,b,p),$a(N)}};k.then(P,P)}return p}catch(k){return delete p.v,p.e=k,++p.n,p}finally{w=!1}},o=y=>rd(r(void 0,y,e(y))),i=(y,b,p)=>{var m,g;const w=new Map;for(const C of((m=p.m)==null?void 0:m.t)||[])w.set(C,e(C,p));for(const C of p.p)w.set(C,e(C,p));return(g=XU(y,b))==null||g.forEach(C=>{w.set(C,e(C,p))}),w},a=(y,b,p)=>{const m=[],g=new Set,w=(S,$)=>{if(!g.has(S)){g.add(S);for(const[R,k]of i(y,S,$))S!==R&&w(R,k);m.push([S,$,$.n])}};w(b,p);const C=new Set([b]);for(let S=m.length-1;S>=0;--S){const[$,R,k]=m[S];let P=!1;for(const N of R.d.keys())if(N!==$&&C.has(N)){P=!0;break}P&&(r(y,$,R,g),u(y,$,R),k!==R.n&&(bS(y,$,R),C.add($))),g.delete($)}},s=(y,b,p,...m)=>{const g=S=>rd(r(y,S,e(S,p))),w=(S,...$)=>{const R=e(S,p);let k;if(hS(b,S)){if(!mS(S))throw new Error("atom not writable");const P="v"in R,N=R.v,F=$[0];n(S,R,F),u(y,S,R),(!P||!Object.is(N,R.v))&&(bS(y,S,R),a(y,S,R))}else k=s(y,S,R,...$);return $a(y),k};return b.write(g,w,...m)},l=(y,...b)=>{const p=Cl(),m=s(p,y,e(y),...b);return $a(p),m},u=(y,b,p)=>{if(p.m&&!Fv(p.v)){for(const m of p.d.keys())p.m.d.has(m)||(c(y,m,e(m,p)).t.add(b),p.m.d.add(m));for(const m of p.m.d||[])if(!p.d.has(m)){p.m.d.delete(m);const g=d(y,m,e(m,p));g==null||g.t.delete(b)}}},c=(y,b,p)=>{if(!p.m){r(y,b,p);for(const m of p.d.keys())c(y,m,e(m,p)).t.add(b);if(p.m={l:new Set,d:new Set(p.d.keys()),t:new Set},vS(b)&&b.onMount){const m=p.m,{onMount:g}=b;xS(y,()=>{const w=g((...C)=>s(y,b,p,...C));w&&(m.u=w)})}}return p.m},d=(y,b,p)=>{if(p.m&&!p.m.l.size&&!Array.from(p.m.t).some(m=>{var g;return(g=e(m,p).m)==null?void 0:g.d.has(b)})){const m=p.m.u;m&&xS(y,m),delete p.m;for(const g of p.d.keys()){const w=d(y,g,e(g,p));w==null||w.t.delete(b)}return}return p.m};return{get:o,set:l,sub:(y,b)=>{const p=Cl(),m=e(y),g=c(p,y,m);$a(p);const w=g.l;return w.add(b),()=>{w.delete(b);const C=Cl();d(C,y,m),$a(C)}},unstable_derive:y=>Y4(...y(e))}},YU=()=>{const e=new WeakMap;return Y4(n=>{let r=e.get(n);return r||(r={d:new Map,p:new Set,n:0},e.set(n,r)),r})};let Lm;const qU=()=>(Lm||(Lm=YU()),Lm),QU=x.createContext(void 0),q4=e=>{const t=x.useContext(QU);return(e==null?void 0:e.store)||t||qU()},Bv=e=>typeof(e==null?void 0:e.then)=="function",Q4=e=>{e.status="pending",e.then(t=>{e.status="fulfilled",e.value=t},t=>{e.status="rejected",e.reason=t})},JU=En.use||(e=>{if(e.status==="pending")throw e;if(e.status==="fulfilled")return e.value;throw e.status==="rejected"?e.reason:(Q4(e),e)}),Fm=new WeakMap,SS=e=>{let t=Fm.get(e);return t||(t=new Promise((n,r)=>{let o=e;const i=l=>u=>{o===l&&n(u)},a=l=>u=>{o===l&&r(u)},s=l=>{"onCancel"in l&&typeof l.onCancel=="function"&&l.onCancel(u=>{Bv(u)?(Fm.set(u,t),o=u,u.then(i(u),a(u)),s(u)):n(u)})};e.then(i(e),a(e)),s(e)}),Fm.set(e,t)),t};function ZU(e,t){const n=q4(t),[[r,o,i],a]=x.useReducer(u=>{const c=n.get(e);return Object.is(u[0],c)&&u[1]===n&&u[2]===e?u:[c,n,e]},void 0,()=>[n.get(e),n,e]);let s=r;(o!==n||i!==e)&&(a(),s=n.get(e));const l=t==null?void 0:t.delay;if(x.useEffect(()=>{const u=n.sub(e,()=>{if(typeof l=="number"){const c=n.get(e);Bv(c)&&Q4(SS(c)),setTimeout(a,l);return}a()});return a(),u},[n,e,l]),x.useDebugValue(s),Bv(s)){const u=SS(s);return JU(u)}return s}function eW(e,t){const n=q4(t);return x.useCallback((...o)=>n.set(e,...o),[n,e])}function J4(e,t){return[ZU(e,t),eW(e,t)]}const tW=Symbol(""),nW=e=>typeof(e==null?void 0:e.then)=="function";function rW(e=()=>{try{return window.localStorage}catch{return}},t){var n;let r,o;const i={getItem:(l,u)=>{var c,d;const f=v=>{if(v=v||"",r!==v){try{o=JSON.parse(v,t==null?void 0:t.reviver)}catch{return u}r=v}return o},h=(d=(c=e())==null?void 0:c.getItem(l))!=null?d:null;return nW(h)?h.then(f):f(h)},setItem:(l,u)=>{var c;return(c=e())==null?void 0:c.setItem(l,JSON.stringify(u,t==null?void 0:t.replacer))},removeItem:l=>{var u;return(u=e())==null?void 0:u.removeItem(l)}},a=l=>(u,c,d)=>l(u,f=>{let h;try{h=JSON.parse(f||"")}catch{h=d}c(h)});let s;try{s=(n=e())==null?void 0:n.subscribe}catch{}return!s&&typeof window<"u"&&typeof window.addEventListener=="function"&&window.Storage&&(s=(l,u)=>{if(!(e()instanceof window.Storage))return()=>{};const c=d=>{d.storageArea===e()&&d.key===l&&u(d.newValue)};return window.addEventListener("storage",c),()=>{window.removeEventListener("storage",c)}}),s&&(i.subscribe=a(s)),i}const oW=rW();function iW(e,t,n=oW,r){const o=r==null?void 0:r.getOnInit,i=pS(o?n.getItem(e,t):t);return i.onMount=s=>{s(n.getItem(e,t));let l;return n.subscribe&&(l=n.subscribe(e,s,t)),l},pS(s=>s(i),(s,l,u)=>{const c=typeof u=="function"?u(s(i)):u;return c===tW?(l(i,t),n.removeItem(e)):c instanceof Promise?c.then(d=>(l(i,d),n.setItem(e,d))):(l(i,c),n.setItem(e,c))})}var Ty={},Dm={};const aW=Jr(X9);var wS;function Yn(){return wS||(wS=1,function(e){"use client";Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t.createSvgIcon}});var t=aW}(Dm)),Dm}const qn=Jr(Qk);var sW=xn;Object.defineProperty(Ty,"__esModule",{value:!0});var Z4=Ty.default=void 0,lW=sW(Yn()),uW=qn;Z4=Ty.default=(0,lW.default)((0,uW.jsx)("path",{d:"M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3zM14 5h-3l-1-1H6L5 5H2v2h12z"}),"DeleteSweep");var Oy={},cW=xn;Object.defineProperty(Oy,"__esModule",{value:!0});var e6=Oy.default=void 0,dW=cW(Yn()),fW=qn;e6=Oy.default=(0,dW.default)((0,fW.jsx)("path",{d:"M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"}),"FileDownload");const _S=()=>{};let Iy={},t6={},n6=null,r6={mark:_S,measure:_S};try{typeof window<"u"&&(Iy=window),typeof document<"u"&&(t6=document),typeof MutationObserver<"u"&&(n6=MutationObserver),typeof performance<"u"&&(r6=performance)}catch{}const{userAgent:ES=""}=Iy.navigator||{},si=Iy,mt=t6,CS=n6,od=r6;si.document;const ko=!!mt.documentElement&&!!mt.head&&typeof mt.addEventListener=="function"&&typeof mt.createElement=="function",o6=~ES.indexOf("MSIE")||~ES.indexOf("Trident/");var xt="classic",i6="duotone",Un="sharp",Wn="sharp-duotone",pW=[xt,i6,Un,Wn],hW={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds"}},$S={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},mW=["kit"],vW=/fa(s|r|l|t|d|b|k|kd|ss|sr|sl|st|sds)?[\-\ ]/,gW=/Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit)?.*/i,yW={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},bW={"Font Awesome 6 Free":{900:"fas",400:"far"},"Font Awesome 6 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 6 Brands":{400:"fab",normal:"fab"},"Font Awesome 6 Duotone":{900:"fad"},"Font Awesome 6 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 6 Sharp Duotone":{900:"fasds"}},xW={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds"}},SW={classic:["fas","far","fal","fat"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds"]},wW={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid"}},_W={classic:{solid:"fas",regular:"far",light:"fal",thin:"fat",duotone:"fad",brands:"fab"},sharp:{solid:"fass",regular:"fasr",light:"fasl",thin:"fast"},"sharp-duotone":{solid:"fasds"}},a6={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fad:"duotone","fa-duotone":"duotone",fab:"brands","fa-brands":"brands"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid"}},EW=["solid","regular","light","thin","duotone","brands"],s6=[1,2,3,4,5,6,7,8,9,10],CW=s6.concat([11,12,13,14,15,16,17,18,19,20]),Gl={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},$W=[...Object.keys(SW),...EW,"2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","fw","inverse","layers-counter","layers-text","layers","li","pull-left","pull-right","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul",Gl.GROUP,Gl.SWAP_OPACITY,Gl.PRIMARY,Gl.SECONDARY].concat(s6.map(e=>"".concat(e,"x"))).concat(CW.map(e=>"w-".concat(e))),RW={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},kW={kit:{"fa-kit":"fak"},"kit-duotone":{"fa-kit-duotone":"fakd"}},PW={kit:{fak:"fa-kit"},"kit-duotone":{fakd:"fa-kit-duotone"}},RS={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}};const _o="___FONT_AWESOME___",zv=16,l6="fa",u6="svg-inline--fa",Ji="data-fa-i2svg",jv="data-fa-pseudo-element",TW="data-fa-pseudo-element-pending",Ny="data-prefix",Ay="data-icon",kS="fontawesome-i2svg",OW="async",IW=["HTML","HEAD","STYLE","SCRIPT"],c6=(()=>{try{return!0}catch{return!1}})(),d6=[xt,Un,Wn];function cc(e){return new Proxy(e,{get(t,n){return n in t?t[n]:t[xt]}})}const f6={...a6};f6[xt]={...a6[xt],...$S.kit,...$S["kit-duotone"]};const ji=cc(f6),Uv={..._W};Uv[xt]={...Uv[xt],...RS.kit,...RS["kit-duotone"]};const Bu=cc(Uv),Wv={...wW};Wv[xt]={...Wv[xt],...PW.kit};const Ui=cc(Wv),Hv={...xW};Hv[xt]={...Hv[xt],...kW.kit};const NW=cc(Hv),AW=vW,p6="fa-layers-text",MW=gW,LW={...hW};cc(LW);const FW=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],Bm=Gl,Rs=new Set;Object.keys(Bu[xt]).map(Rs.add.bind(Rs));Object.keys(Bu[Un]).map(Rs.add.bind(Rs));Object.keys(Bu[Wn]).map(Rs.add.bind(Rs));const DW=[...mW,...$W],du=si.FontAwesomeConfig||{};function BW(e){var t=mt.querySelector("script["+e+"]");if(t)return t.getAttribute(e)}function zW(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}mt&&typeof mt.querySelector=="function"&&[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-auto-a11y","autoA11y"],["data-search-pseudo-elements","searchPseudoElements"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]].forEach(t=>{let[n,r]=t;const o=zW(BW(n));o!=null&&(du[r]=o)});const h6={styleDefault:"solid",familyDefault:"classic",cssPrefix:l6,replacementClass:u6,autoReplaceSvg:!0,autoAddCss:!0,autoA11y:!0,searchPseudoElements:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};du.familyPrefix&&(du.cssPrefix=du.familyPrefix);const ks={...h6,...du};ks.autoReplaceSvg||(ks.observeMutations=!1);const se={};Object.keys(h6).forEach(e=>{Object.defineProperty(se,e,{enumerable:!0,set:function(t){ks[e]=t,fu.forEach(n=>n(se))},get:function(){return ks[e]}})});Object.defineProperty(se,"familyPrefix",{enumerable:!0,set:function(e){ks.cssPrefix=e,fu.forEach(t=>t(se))},get:function(){return ks.cssPrefix}});si.FontAwesomeConfig=se;const fu=[];function jW(e){return fu.push(e),()=>{fu.splice(fu.indexOf(e),1)}}const No=zv,Wr={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function UW(e){if(!e||!ko)return;const t=mt.createElement("style");t.setAttribute("type","text/css"),t.innerHTML=e;const n=mt.head.childNodes;let r=null;for(let o=n.length-1;o>-1;o--){const i=n[o],a=(i.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(a)>-1&&(r=i)}return mt.head.insertBefore(t,r),e}const WW="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function zu(){let e=12,t="";for(;e-- >0;)t+=WW[Math.random()*62|0];return t}function Hs(e){const t=[];for(let n=(e||[]).length>>>0;n--;)t[n]=e[n];return t}function My(e){return e.classList?Hs(e.classList):(e.getAttribute("class")||"").split(" ").filter(t=>t)}function m6(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function HW(e){return Object.keys(e||{}).reduce((t,n)=>t+"".concat(n,'="').concat(m6(e[n]),'" '),"").trim()}function bh(e){return Object.keys(e||{}).reduce((t,n)=>t+"".concat(n,": ").concat(e[n].trim(),";"),"")}function Ly(e){return e.size!==Wr.size||e.x!==Wr.x||e.y!==Wr.y||e.rotate!==Wr.rotate||e.flipX||e.flipY}function VW(e){let{transform:t,containerWidth:n,iconWidth:r}=e;const o={transform:"translate(".concat(n/2," 256)")},i="translate(".concat(t.x*32,", ").concat(t.y*32,") "),a="scale(".concat(t.size/16*(t.flipX?-1:1),", ").concat(t.size/16*(t.flipY?-1:1),") "),s="rotate(".concat(t.rotate," 0 0)"),l={transform:"".concat(i," ").concat(a," ").concat(s)},u={transform:"translate(".concat(r/2*-1," -256)")};return{outer:o,inner:l,path:u}}function GW(e){let{transform:t,width:n=zv,height:r=zv,startCentered:o=!1}=e,i="";return o&&o6?i+="translate(".concat(t.x/No-n/2,"em, ").concat(t.y/No-r/2,"em) "):o?i+="translate(calc(-50% + ".concat(t.x/No,"em), calc(-50% + ").concat(t.y/No,"em)) "):i+="translate(".concat(t.x/No,"em, ").concat(t.y/No,"em) "),i+="scale(".concat(t.size/No*(t.flipX?-1:1),", ").concat(t.size/No*(t.flipY?-1:1),") "),i+="rotate(".concat(t.rotate,"deg) "),i}var KW=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Free";
  --fa-font-light: normal 300 1em/1 "Font Awesome 6 Pro";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 6 Pro";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 6 Duotone";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 6 Sharp Duotone";
}

svg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {
  overflow: visible;
  box-sizing: content-box;
}

.svg-inline--fa {
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285705em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left {
  margin-right: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-pull-right {
  margin-left: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  top: 0.25em;
}
.svg-inline--fa.fa-fw {
  width: var(--fa-fw-width, 1.25em);
}

.fa-layers svg.svg-inline--fa {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: 1em;
}
.fa-layers svg.svg-inline--fa {
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: 0.625em;
  line-height: 0.1em;
  vertical-align: 0.225em;
}

.fa-xs {
  font-size: 0.75em;
  line-height: 0.0833333337em;
  vertical-align: 0.125em;
}

.fa-sm {
  font-size: 0.875em;
  line-height: 0.0714285718em;
  vertical-align: 0.0535714295em;
}

.fa-lg {
  font-size: 1.25em;
  line-height: 0.05em;
  vertical-align: -0.075em;
}

.fa-xl {
  font-size: 1.5em;
  line-height: 0.0416666682em;
  vertical-align: -0.125em;
}

.fa-2xl {
  font-size: 2em;
  line-height: 0.03125em;
  vertical-align: -0.1875em;
}

.fa-fw {
  text-align: center;
  width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-left: var(--fa-li-margin, 2.5em);
  padding-left: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  left: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.08em);
  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);
}

.fa-pull-left {
  float: left;
  margin-right: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right {
  float: right;
  margin-left: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
.fa-bounce,
.fa-fade,
.fa-beat-fade,
.fa-flip,
.fa-pulse,
.fa-shake,
.fa-spin,
.fa-spin-pulse {
    animation-delay: -1ms;
    animation-duration: 1ms;
    animation-iteration-count: 1;
    transition-delay: 0s;
    transition-duration: 0s;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.fa-stack {
  display: inline-block;
  vertical-align: middle;
  height: 2em;
  position: relative;
  width: 2.5em;
}

.fa-stack-1x,
.fa-stack-2x {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  z-index: var(--fa-stack-z-index, auto);
}

.svg-inline--fa.fa-stack-1x {
  height: 1em;
  width: 1.25em;
}
.svg-inline--fa.fa-stack-2x {
  height: 2em;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.sr-only,
.fa-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:not(:focus),
.fa-sr-only-focusable:not(:focus) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.fad.fa-inverse,
.fa-duotone.fa-inverse {
  color: var(--fa-inverse, #fff);
}`;function v6(){const e=l6,t=u6,n=se.cssPrefix,r=se.replacementClass;let o=KW;if(n!==e||r!==t){const i=new RegExp("\\.".concat(e,"\\-"),"g"),a=new RegExp("\\--".concat(e,"\\-"),"g"),s=new RegExp("\\.".concat(t),"g");o=o.replace(i,".".concat(n,"-")).replace(a,"--".concat(n,"-")).replace(s,".".concat(r))}return o}let PS=!1;function zm(){se.autoAddCss&&!PS&&(UW(v6()),PS=!0)}var XW={mixout(){return{dom:{css:v6,insertCss:zm}}},hooks(){return{beforeDOMElementCreation(){zm()},beforeI2svg(){zm()}}}};const Eo=si||{};Eo[_o]||(Eo[_o]={});Eo[_o].styles||(Eo[_o].styles={});Eo[_o].hooks||(Eo[_o].hooks={});Eo[_o].shims||(Eo[_o].shims=[]);var Hr=Eo[_o];const g6=[],y6=function(){mt.removeEventListener("DOMContentLoaded",y6),zf=1,g6.map(e=>e())};let zf=!1;ko&&(zf=(mt.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(mt.readyState),zf||mt.addEventListener("DOMContentLoaded",y6));function YW(e){ko&&(zf?setTimeout(e,0):g6.push(e))}function dc(e){const{tag:t,attributes:n={},children:r=[]}=e;return typeof e=="string"?m6(e):"<".concat(t," ").concat(HW(n),">").concat(r.map(dc).join(""),"</").concat(t,">")}function TS(e,t,n){if(e&&e[t]&&e[t][n])return{prefix:t,iconName:n,icon:e[t][n]}}var qW=function(t,n){return function(r,o,i,a){return t.call(n,r,o,i,a)}},jm=function(t,n,r,o){var i=Object.keys(t),a=i.length,s=o!==void 0?qW(n,o):n,l,u,c;for(r===void 0?(l=1,c=t[i[0]]):(l=0,c=r);l<a;l++)u=i[l],c=s(c,t[u],u,t);return c};function QW(e){const t=[];let n=0;const r=e.length;for(;n<r;){const o=e.charCodeAt(n++);if(o>=55296&&o<=56319&&n<r){const i=e.charCodeAt(n++);(i&64512)==56320?t.push(((o&1023)<<10)+(i&1023)+65536):(t.push(o),n--)}else t.push(o)}return t}function Vv(e){const t=QW(e);return t.length===1?t[0].toString(16):null}function JW(e,t){const n=e.length;let r=e.charCodeAt(t),o;return r>=55296&&r<=56319&&n>t+1&&(o=e.charCodeAt(t+1),o>=56320&&o<=57343)?(r-55296)*1024+o-56320+65536:r}function OS(e){return Object.keys(e).reduce((t,n)=>{const r=e[n];return!!r.icon?t[r.iconName]=r.icon:t[n]=r,t},{})}function Gv(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};const{skipHooks:r=!1}=n,o=OS(t);typeof Hr.hooks.addPack=="function"&&!r?Hr.hooks.addPack(e,OS(t)):Hr.styles[e]={...Hr.styles[e]||{},...o},e==="fas"&&Gv("fa",t)}const{styles:$i,shims:ZW}=Hr,eH={[xt]:Object.values(Ui[xt]),[Un]:Object.values(Ui[Un]),[Wn]:Object.values(Ui[Wn])};let Fy=null,b6={},x6={},S6={},w6={},_6={};const tH={[xt]:Object.keys(ji[xt]),[Un]:Object.keys(ji[Un]),[Wn]:Object.keys(ji[Wn])};function nH(e){return~DW.indexOf(e)}function rH(e,t){const n=t.split("-"),r=n[0],o=n.slice(1).join("-");return r===e&&o!==""&&!nH(o)?o:null}const E6=()=>{const e=r=>jm($i,(o,i,a)=>(o[a]=jm(i,r,{}),o),{});b6=e((r,o,i)=>(o[3]&&(r[o[3]]=i),o[2]&&o[2].filter(s=>typeof s=="number").forEach(s=>{r[s.toString(16)]=i}),r)),x6=e((r,o,i)=>(r[i]=i,o[2]&&o[2].filter(s=>typeof s=="string").forEach(s=>{r[s]=i}),r)),_6=e((r,o,i)=>{const a=o[2];return r[i]=i,a.forEach(s=>{r[s]=i}),r});const t="far"in $i||se.autoFetchSvg,n=jm(ZW,(r,o)=>{const i=o[0];let a=o[1];const s=o[2];return a==="far"&&!t&&(a="fas"),typeof i=="string"&&(r.names[i]={prefix:a,iconName:s}),typeof i=="number"&&(r.unicodes[i.toString(16)]={prefix:a,iconName:s}),r},{names:{},unicodes:{}});S6=n.names,w6=n.unicodes,Fy=xh(se.styleDefault,{family:se.familyDefault})};jW(e=>{Fy=xh(e.styleDefault,{family:se.familyDefault})});E6();function Dy(e,t){return(b6[e]||{})[t]}function oH(e,t){return(x6[e]||{})[t]}function Xo(e,t){return(_6[e]||{})[t]}function C6(e){return S6[e]||{prefix:null,iconName:null}}function iH(e){const t=w6[e],n=Dy("fas",e);return t||(n?{prefix:"fas",iconName:n}:null)||{prefix:null,iconName:null}}function li(){return Fy}const By=()=>({prefix:null,iconName:null,rest:[]});function xh(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{family:n=xt}=t,r=ji[n][e],o=Bu[n][e]||Bu[n][r],i=e in Hr.styles?e:null;return o||i||null}const aH={[xt]:Object.keys(Ui[xt]),[Un]:Object.keys(Ui[Un]),[Wn]:Object.keys(Ui[Wn])};function Sh(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{skipLookups:n=!1}=t,r={[xt]:"".concat(se.cssPrefix,"-").concat(xt),[Un]:"".concat(se.cssPrefix,"-").concat(Un),[Wn]:"".concat(se.cssPrefix,"-").concat(Wn)};let o=null,i=xt;const a=pW.filter(l=>l!==i6);a.forEach(l=>{(e.includes(r[l])||e.some(u=>aH[l].includes(u)))&&(i=l)});const s=e.reduce((l,u)=>{const c=rH(se.cssPrefix,u);if($i[u]?(u=eH[i].includes(u)?NW[i][u]:u,o=u,l.prefix=u):tH[i].indexOf(u)>-1?(o=u,l.prefix=xh(u,{family:i})):c?l.iconName=c:u!==se.replacementClass&&!a.some(d=>u===r[d])&&l.rest.push(u),!n&&l.prefix&&l.iconName){const d=o==="fa"?C6(l.iconName):{},f=Xo(l.prefix,l.iconName);d.prefix&&(o=null),l.iconName=d.iconName||f||l.iconName,l.prefix=d.prefix||l.prefix,l.prefix==="far"&&!$i.far&&$i.fas&&!se.autoFetchSvg&&(l.prefix="fas")}return l},By());return(e.includes("fa-brands")||e.includes("fab"))&&(s.prefix="fab"),(e.includes("fa-duotone")||e.includes("fad"))&&(s.prefix="fad"),!s.prefix&&i===Un&&($i.fass||se.autoFetchSvg)&&(s.prefix="fass",s.iconName=Xo(s.prefix,s.iconName)||s.iconName),!s.prefix&&i===Wn&&($i.fasds||se.autoFetchSvg)&&(s.prefix="fasds",s.iconName=Xo(s.prefix,s.iconName)||s.iconName),(s.prefix==="fa"||o==="fa")&&(s.prefix=li()||"fas"),s}class sH{constructor(){this.definitions={}}add(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];const o=n.reduce(this._pullDefinitions,{});Object.keys(o).forEach(i=>{this.definitions[i]={...this.definitions[i]||{},...o[i]},Gv(i,o[i]);const a=Ui[xt][i];a&&Gv(a,o[i]),E6()})}reset(){this.definitions={}}_pullDefinitions(t,n){const r=n.prefix&&n.iconName&&n.icon?{0:n}:n;return Object.keys(r).map(o=>{const{prefix:i,iconName:a,icon:s}=r[o],l=s[2];t[i]||(t[i]={}),l.length>0&&l.forEach(u=>{typeof u=="string"&&(t[i][u]=s)}),t[i][a]=s}),t}}let IS=[],Ha={};const ns={},lH=Object.keys(ns);function uH(e,t){let{mixoutsTo:n}=t;return IS=e,Ha={},Object.keys(ns).forEach(r=>{lH.indexOf(r)===-1&&delete ns[r]}),IS.forEach(r=>{const o=r.mixout?r.mixout():{};if(Object.keys(o).forEach(i=>{typeof o[i]=="function"&&(n[i]=o[i]),typeof o[i]=="object"&&Object.keys(o[i]).forEach(a=>{n[i]||(n[i]={}),n[i][a]=o[i][a]})}),r.hooks){const i=r.hooks();Object.keys(i).forEach(a=>{Ha[a]||(Ha[a]=[]),Ha[a].push(i[a])})}r.provides&&r.provides(ns)}),n}function Kv(e,t){for(var n=arguments.length,r=new Array(n>2?n-2:0),o=2;o<n;o++)r[o-2]=arguments[o];return(Ha[e]||[]).forEach(a=>{t=a.apply(null,[t,...r])}),t}function Zi(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];(Ha[e]||[]).forEach(i=>{i.apply(null,n)})}function ui(){const e=arguments[0],t=Array.prototype.slice.call(arguments,1);return ns[e]?ns[e].apply(null,t):void 0}function Xv(e){e.prefix==="fa"&&(e.prefix="fas");let{iconName:t}=e;const n=e.prefix||li();if(t)return t=Xo(n,t)||t,TS($6.definitions,n,t)||TS(Hr.styles,n,t)}const $6=new sH,cH=()=>{se.autoReplaceSvg=!1,se.observeMutations=!1,Zi("noAuto")},dH={i2svg:function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return ko?(Zi("beforeI2svg",e),ui("pseudoElements2svg",e),ui("i2svg",e)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};const{autoReplaceSvgRoot:t}=e;se.autoReplaceSvg===!1&&(se.autoReplaceSvg=!0),se.observeMutations=!0,YW(()=>{pH({autoReplaceSvgRoot:t}),Zi("watch",e)})}},fH={icon:e=>{if(e===null)return null;if(typeof e=="object"&&e.prefix&&e.iconName)return{prefix:e.prefix,iconName:Xo(e.prefix,e.iconName)||e.iconName};if(Array.isArray(e)&&e.length===2){const t=e[1].indexOf("fa-")===0?e[1].slice(3):e[1],n=xh(e[0]);return{prefix:n,iconName:Xo(n,t)||t}}if(typeof e=="string"&&(e.indexOf("".concat(se.cssPrefix,"-"))>-1||e.match(AW))){const t=Sh(e.split(" "),{skipLookups:!0});return{prefix:t.prefix||li(),iconName:Xo(t.prefix,t.iconName)||t.iconName}}if(typeof e=="string"){const t=li();return{prefix:t,iconName:Xo(t,e)||e}}}},Qn={noAuto:cH,config:se,dom:dH,parse:fH,library:$6,findIconDefinition:Xv,toHtml:dc},pH=function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};const{autoReplaceSvgRoot:t=mt}=e;(Object.keys(Hr.styles).length>0||se.autoFetchSvg)&&ko&&se.autoReplaceSvg&&Qn.dom.i2svg({node:t})};function wh(e,t){return Object.defineProperty(e,"abstract",{get:t}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(n=>dc(n))}}),Object.defineProperty(e,"node",{get:function(){if(!ko)return;const n=mt.createElement("div");return n.innerHTML=e.html,n.children}}),e}function hH(e){let{children:t,main:n,mask:r,attributes:o,styles:i,transform:a}=e;if(Ly(a)&&n.found&&!r.found){const{width:s,height:l}=n,u={x:s/l/2,y:.5};o.style=bh({...i,"transform-origin":"".concat(u.x+a.x/16,"em ").concat(u.y+a.y/16,"em")})}return[{tag:"svg",attributes:o,children:t}]}function mH(e){let{prefix:t,iconName:n,children:r,attributes:o,symbol:i}=e;const a=i===!0?"".concat(t,"-").concat(se.cssPrefix,"-").concat(n):i;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:{...o,id:a},children:r}]}]}function zy(e){const{icons:{main:t,mask:n},prefix:r,iconName:o,transform:i,symbol:a,title:s,maskId:l,titleId:u,extra:c,watchable:d=!1}=e,{width:f,height:h}=n.found?n:t,v=r==="fak",y=[se.replacementClass,o?"".concat(se.cssPrefix,"-").concat(o):""].filter(C=>c.classes.indexOf(C)===-1).filter(C=>C!==""||!!C).concat(c.classes).join(" ");let b={children:[],attributes:{...c.attributes,"data-prefix":r,"data-icon":o,class:y,role:c.attributes.role||"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 ".concat(f," ").concat(h)}};const p=v&&!~c.classes.indexOf("fa-fw")?{width:"".concat(f/h*16*.0625,"em")}:{};d&&(b.attributes[Ji]=""),s&&(b.children.push({tag:"title",attributes:{id:b.attributes["aria-labelledby"]||"title-".concat(u||zu())},children:[s]}),delete b.attributes.title);const m={...b,prefix:r,iconName:o,main:t,mask:n,maskId:l,transform:i,symbol:a,styles:{...p,...c.styles}},{children:g,attributes:w}=n.found&&t.found?ui("generateAbstractMask",m)||{children:[],attributes:{}}:ui("generateAbstractIcon",m)||{children:[],attributes:{}};return m.children=g,m.attributes=w,a?mH(m):hH(m)}function NS(e){const{content:t,width:n,height:r,transform:o,title:i,extra:a,watchable:s=!1}=e,l={...a.attributes,...i?{title:i}:{},class:a.classes.join(" ")};s&&(l[Ji]="");const u={...a.styles};Ly(o)&&(u.transform=GW({transform:o,startCentered:!0,width:n,height:r}),u["-webkit-transform"]=u.transform);const c=bh(u);c.length>0&&(l.style=c);const d=[];return d.push({tag:"span",attributes:l,children:[t]}),i&&d.push({tag:"span",attributes:{class:"sr-only"},children:[i]}),d}function vH(e){const{content:t,title:n,extra:r}=e,o={...r.attributes,...n?{title:n}:{},class:r.classes.join(" ")},i=bh(r.styles);i.length>0&&(o.style=i);const a=[];return a.push({tag:"span",attributes:o,children:[t]}),n&&a.push({tag:"span",attributes:{class:"sr-only"},children:[n]}),a}const{styles:Um}=Hr;function Yv(e){const t=e[0],n=e[1],[r]=e.slice(4);let o=null;return Array.isArray(r)?o={tag:"g",attributes:{class:"".concat(se.cssPrefix,"-").concat(Bm.GROUP)},children:[{tag:"path",attributes:{class:"".concat(se.cssPrefix,"-").concat(Bm.SECONDARY),fill:"currentColor",d:r[0]}},{tag:"path",attributes:{class:"".concat(se.cssPrefix,"-").concat(Bm.PRIMARY),fill:"currentColor",d:r[1]}}]}:o={tag:"path",attributes:{fill:"currentColor",d:r}},{found:!0,width:t,height:n,icon:o}}const gH={found:!1,width:512,height:512};function yH(e,t){!c6&&!se.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(t,'" is missing.'))}function qv(e,t){let n=t;return t==="fa"&&se.styleDefault!==null&&(t=li()),new Promise((r,o)=>{if(n==="fa"){const i=C6(e)||{};e=i.iconName||e,t=i.prefix||t}if(e&&t&&Um[t]&&Um[t][e]){const i=Um[t][e];return r(Yv(i))}yH(e,t),r({...gH,icon:se.showMissingIcons&&e?ui("missingIconAbstract")||{}:{}})})}const AS=()=>{},Qv=se.measurePerformance&&od&&od.mark&&od.measure?od:{mark:AS,measure:AS},Kl='FA "6.6.0"',bH=e=>(Qv.mark("".concat(Kl," ").concat(e," begins")),()=>R6(e)),R6=e=>{Qv.mark("".concat(Kl," ").concat(e," ends")),Qv.measure("".concat(Kl," ").concat(e),"".concat(Kl," ").concat(e," begins"),"".concat(Kl," ").concat(e," ends"))};var jy={begin:bH,end:R6};const Jd=()=>{};function MS(e){return typeof(e.getAttribute?e.getAttribute(Ji):null)=="string"}function xH(e){const t=e.getAttribute?e.getAttribute(Ny):null,n=e.getAttribute?e.getAttribute(Ay):null;return t&&n}function SH(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(se.replacementClass)}function wH(){return se.autoReplaceSvg===!0?Zd.replace:Zd[se.autoReplaceSvg]||Zd.replace}function _H(e){return mt.createElementNS("http://www.w3.org/2000/svg",e)}function EH(e){return mt.createElement(e)}function k6(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{ceFn:n=e.tag==="svg"?_H:EH}=t;if(typeof e=="string")return mt.createTextNode(e);const r=n(e.tag);return Object.keys(e.attributes||[]).forEach(function(i){r.setAttribute(i,e.attributes[i])}),(e.children||[]).forEach(function(i){r.appendChild(k6(i,{ceFn:n}))}),r}function CH(e){let t=" ".concat(e.outerHTML," ");return t="".concat(t,"Font Awesome fontawesome.com "),t}const Zd={replace:function(e){const t=e[0];if(t.parentNode)if(e[1].forEach(n=>{t.parentNode.insertBefore(k6(n),t)}),t.getAttribute(Ji)===null&&se.keepOriginalSource){let n=mt.createComment(CH(t));t.parentNode.replaceChild(n,t)}else t.remove()},nest:function(e){const t=e[0],n=e[1];if(~My(t).indexOf(se.replacementClass))return Zd.replace(e);const r=new RegExp("".concat(se.cssPrefix,"-.*"));if(delete n[0].attributes.id,n[0].attributes.class){const i=n[0].attributes.class.split(" ").reduce((a,s)=>(s===se.replacementClass||s.match(r)?a.toSvg.push(s):a.toNode.push(s),a),{toNode:[],toSvg:[]});n[0].attributes.class=i.toSvg.join(" "),i.toNode.length===0?t.removeAttribute("class"):t.setAttribute("class",i.toNode.join(" "))}const o=n.map(i=>dc(i)).join(`
`);t.setAttribute(Ji,""),t.innerHTML=o}};function LS(e){e()}function P6(e,t){const n=typeof t=="function"?t:Jd;if(e.length===0)n();else{let r=LS;se.mutateApproach===OW&&(r=si.requestAnimationFrame||LS),r(()=>{const o=wH(),i=jy.begin("mutate");e.map(o),i(),n()})}}let Uy=!1;function T6(){Uy=!0}function Jv(){Uy=!1}let jf=null;function FS(e){if(!CS||!se.observeMutations)return;const{treeCallback:t=Jd,nodeCallback:n=Jd,pseudoElementsCallback:r=Jd,observeMutationsRoot:o=mt}=e;jf=new CS(i=>{if(Uy)return;const a=li();Hs(i).forEach(s=>{if(s.type==="childList"&&s.addedNodes.length>0&&!MS(s.addedNodes[0])&&(se.searchPseudoElements&&r(s.target),t(s.target)),s.type==="attributes"&&s.target.parentNode&&se.searchPseudoElements&&r(s.target.parentNode),s.type==="attributes"&&MS(s.target)&&~FW.indexOf(s.attributeName))if(s.attributeName==="class"&&xH(s.target)){const{prefix:l,iconName:u}=Sh(My(s.target));s.target.setAttribute(Ny,l||a),u&&s.target.setAttribute(Ay,u)}else SH(s.target)&&n(s.target)})}),ko&&jf.observe(o,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}function $H(){jf&&jf.disconnect()}function RH(e){const t=e.getAttribute("style");let n=[];return t&&(n=t.split(";").reduce((r,o)=>{const i=o.split(":"),a=i[0],s=i.slice(1);return a&&s.length>0&&(r[a]=s.join(":").trim()),r},{})),n}function kH(e){const t=e.getAttribute("data-prefix"),n=e.getAttribute("data-icon"),r=e.innerText!==void 0?e.innerText.trim():"";let o=Sh(My(e));return o.prefix||(o.prefix=li()),t&&n&&(o.prefix=t,o.iconName=n),o.iconName&&o.prefix||(o.prefix&&r.length>0&&(o.iconName=oH(o.prefix,e.innerText)||Dy(o.prefix,Vv(e.innerText))),!o.iconName&&se.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(o.iconName=e.firstChild.data)),o}function PH(e){const t=Hs(e.attributes).reduce((o,i)=>(o.name!=="class"&&o.name!=="style"&&(o[i.name]=i.value),o),{}),n=e.getAttribute("title"),r=e.getAttribute("data-fa-title-id");return se.autoA11y&&(n?t["aria-labelledby"]="".concat(se.replacementClass,"-title-").concat(r||zu()):(t["aria-hidden"]="true",t.focusable="false")),t}function TH(){return{iconName:null,title:null,titleId:null,prefix:null,transform:Wr,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function DS(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0};const{iconName:n,prefix:r,rest:o}=kH(e),i=PH(e),a=Kv("parseNodeAttributes",{},e);let s=t.styleParser?RH(e):[];return{iconName:n,title:e.getAttribute("title"),titleId:e.getAttribute("data-fa-title-id"),prefix:r,transform:Wr,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:o,styles:s,attributes:i},...a}}const{styles:OH}=Hr;function O6(e){const t=se.autoReplaceSvg==="nest"?DS(e,{styleParser:!1}):DS(e);return~t.extra.classes.indexOf(p6)?ui("generateLayersText",e,t):ui("generateSvgReplacementMutation",e,t)}let Qr=new Set;d6.map(e=>{Qr.add("fa-".concat(e))});Object.keys(ji[xt]).map(Qr.add.bind(Qr));Object.keys(ji[Un]).map(Qr.add.bind(Qr));Object.keys(ji[Wn]).map(Qr.add.bind(Qr));Qr=[...Qr];function BS(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!ko)return Promise.resolve();const n=mt.documentElement.classList,r=c=>n.add("".concat(kS,"-").concat(c)),o=c=>n.remove("".concat(kS,"-").concat(c)),i=se.autoFetchSvg?Qr:d6.map(c=>"fa-".concat(c)).concat(Object.keys(OH));i.includes("fa")||i.push("fa");const a=[".".concat(p6,":not([").concat(Ji,"])")].concat(i.map(c=>".".concat(c,":not([").concat(Ji,"])"))).join(", ");if(a.length===0)return Promise.resolve();let s=[];try{s=Hs(e.querySelectorAll(a))}catch{}if(s.length>0)r("pending"),o("complete");else return Promise.resolve();const l=jy.begin("onTree"),u=s.reduce((c,d)=>{try{const f=O6(d);f&&c.push(f)}catch(f){c6||f.name==="MissingIcon"&&console.error(f)}return c},[]);return new Promise((c,d)=>{Promise.all(u).then(f=>{P6(f,()=>{r("active"),r("complete"),o("pending"),typeof t=="function"&&t(),l(),c()})}).catch(f=>{l(),d(f)})})}function IH(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;O6(e).then(n=>{n&&P6([n],t)})}function NH(e){return function(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const r=(t||{}).icon?t:Xv(t||{});let{mask:o}=n;return o&&(o=(o||{}).icon?o:Xv(o||{})),e(r,{...n,mask:o})}}const AH=function(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{transform:n=Wr,symbol:r=!1,mask:o=null,maskId:i=null,title:a=null,titleId:s=null,classes:l=[],attributes:u={},styles:c={}}=t;if(!e)return;const{prefix:d,iconName:f,icon:h}=e;return wh({type:"icon",...e},()=>(Zi("beforeDOMElementCreation",{iconDefinition:e,params:t}),se.autoA11y&&(a?u["aria-labelledby"]="".concat(se.replacementClass,"-title-").concat(s||zu()):(u["aria-hidden"]="true",u.focusable="false")),zy({icons:{main:Yv(h),mask:o?Yv(o.icon):{found:!1,width:null,height:null,icon:{}}},prefix:d,iconName:f,transform:{...Wr,...n},symbol:r,title:a,maskId:i,titleId:s,extra:{attributes:u,styles:c,classes:l}})))};var MH={mixout(){return{icon:NH(AH)}},hooks(){return{mutationObserverCallbacks(e){return e.treeCallback=BS,e.nodeCallback=IH,e}}},provides(e){e.i2svg=function(t){const{node:n=mt,callback:r=()=>{}}=t;return BS(n,r)},e.generateSvgReplacementMutation=function(t,n){const{iconName:r,title:o,titleId:i,prefix:a,transform:s,symbol:l,mask:u,maskId:c,extra:d}=n;return new Promise((f,h)=>{Promise.all([qv(r,a),u.iconName?qv(u.iconName,u.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(v=>{let[y,b]=v;f([t,zy({icons:{main:y,mask:b},prefix:a,iconName:r,transform:s,symbol:l,maskId:c,title:o,titleId:i,extra:d,watchable:!0})])}).catch(h)})},e.generateAbstractIcon=function(t){let{children:n,attributes:r,main:o,transform:i,styles:a}=t;const s=bh(a);s.length>0&&(r.style=s);let l;return Ly(i)&&(l=ui("generateAbstractTransformGrouping",{main:o,transform:i,containerWidth:o.width,iconWidth:o.width})),n.push(l||o.icon),{children:n,attributes:r}}}},LH={mixout(){return{layer(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{classes:n=[]}=t;return wh({type:"layer"},()=>{Zi("beforeDOMElementCreation",{assembler:e,params:t});let r=[];return e(o=>{Array.isArray(o)?o.map(i=>{r=r.concat(i.abstract)}):r=r.concat(o.abstract)}),[{tag:"span",attributes:{class:["".concat(se.cssPrefix,"-layers"),...n].join(" ")},children:r}]})}}}},FH={mixout(){return{counter(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{title:n=null,classes:r=[],attributes:o={},styles:i={}}=t;return wh({type:"counter",content:e},()=>(Zi("beforeDOMElementCreation",{content:e,params:t}),vH({content:e.toString(),title:n,extra:{attributes:o,styles:i,classes:["".concat(se.cssPrefix,"-layers-counter"),...r]}})))}}}},DH={mixout(){return{text(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{transform:n=Wr,title:r=null,classes:o=[],attributes:i={},styles:a={}}=t;return wh({type:"text",content:e},()=>(Zi("beforeDOMElementCreation",{content:e,params:t}),NS({content:e,transform:{...Wr,...n},title:r,extra:{attributes:i,styles:a,classes:["".concat(se.cssPrefix,"-layers-text"),...o]}})))}}},provides(e){e.generateLayersText=function(t,n){const{title:r,transform:o,extra:i}=n;let a=null,s=null;if(o6){const l=parseInt(getComputedStyle(t).fontSize,10),u=t.getBoundingClientRect();a=u.width/l,s=u.height/l}return se.autoA11y&&!r&&(i.attributes["aria-hidden"]="true"),Promise.resolve([t,NS({content:t.innerHTML,width:a,height:s,transform:o,title:r,extra:i,watchable:!0})])}}};const BH=new RegExp('"',"ug"),zS=[1105920,1112319],jS={FontAwesome:{normal:"fas",400:"fas"},...bW,...yW,...RW},Zv=Object.keys(jS).reduce((e,t)=>(e[t.toLowerCase()]=jS[t],e),{}),zH=Object.keys(Zv).reduce((e,t)=>{const n=Zv[t];return e[t]=n[900]||[...Object.entries(n)][0][1],e},{});function jH(e){const t=e.replace(BH,""),n=JW(t,0),r=n>=zS[0]&&n<=zS[1],o=t.length===2?t[0]===t[1]:!1;return{value:Vv(o?t[0]:t),isSecondary:r||o}}function UH(e,t){const n=e.replace(/^['"]|['"]$/g,"").toLowerCase(),r=parseInt(t),o=isNaN(r)?"normal":r;return(Zv[n]||{})[o]||zH[n]}function US(e,t){const n="".concat(TW).concat(t.replace(":","-"));return new Promise((r,o)=>{if(e.getAttribute(n)!==null)return r();const a=Hs(e.children).filter(f=>f.getAttribute(jv)===t)[0],s=si.getComputedStyle(e,t),l=s.getPropertyValue("font-family"),u=l.match(MW),c=s.getPropertyValue("font-weight"),d=s.getPropertyValue("content");if(a&&!u)return e.removeChild(a),r();if(u&&d!=="none"&&d!==""){const f=s.getPropertyValue("content");let h=UH(l,c);const{value:v,isSecondary:y}=jH(f),b=u[0].startsWith("FontAwesome");let p=Dy(h,v),m=p;if(b){const g=iH(v);g.iconName&&g.prefix&&(p=g.iconName,h=g.prefix)}if(p&&!y&&(!a||a.getAttribute(Ny)!==h||a.getAttribute(Ay)!==m)){e.setAttribute(n,m),a&&e.removeChild(a);const g=TH(),{extra:w}=g;w.attributes[jv]=t,qv(p,h).then(C=>{const S=zy({...g,icons:{main:C,mask:By()},prefix:h,iconName:m,extra:w,watchable:!0}),$=mt.createElementNS("http://www.w3.org/2000/svg","svg");t==="::before"?e.insertBefore($,e.firstChild):e.appendChild($),$.outerHTML=S.map(R=>dc(R)).join(`
`),e.removeAttribute(n),r()}).catch(o)}else r()}else r()})}function WH(e){return Promise.all([US(e,"::before"),US(e,"::after")])}function HH(e){return e.parentNode!==document.head&&!~IW.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(jv)&&(!e.parentNode||e.parentNode.tagName!=="svg")}function WS(e){if(ko)return new Promise((t,n)=>{const r=Hs(e.querySelectorAll("*")).filter(HH).map(WH),o=jy.begin("searchPseudoElements");T6(),Promise.all(r).then(()=>{o(),Jv(),t()}).catch(()=>{o(),Jv(),n()})})}var VH={hooks(){return{mutationObserverCallbacks(e){return e.pseudoElementsCallback=WS,e}}},provides(e){e.pseudoElements2svg=function(t){const{node:n=mt}=t;se.searchPseudoElements&&WS(n)}}};let HS=!1;var GH={mixout(){return{dom:{unwatch(){T6(),HS=!0}}}},hooks(){return{bootstrap(){FS(Kv("mutationObserverCallbacks",{}))},noAuto(){$H()},watch(e){const{observeMutationsRoot:t}=e;HS?Jv():FS(Kv("mutationObserverCallbacks",{observeMutationsRoot:t}))}}}};const VS=e=>{let t={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return e.toLowerCase().split(" ").reduce((n,r)=>{const o=r.toLowerCase().split("-"),i=o[0];let a=o.slice(1).join("-");if(i&&a==="h")return n.flipX=!0,n;if(i&&a==="v")return n.flipY=!0,n;if(a=parseFloat(a),isNaN(a))return n;switch(i){case"grow":n.size=n.size+a;break;case"shrink":n.size=n.size-a;break;case"left":n.x=n.x-a;break;case"right":n.x=n.x+a;break;case"up":n.y=n.y-a;break;case"down":n.y=n.y+a;break;case"rotate":n.rotate=n.rotate+a;break}return n},t)};var KH={mixout(){return{parse:{transform:e=>VS(e)}}},hooks(){return{parseNodeAttributes(e,t){const n=t.getAttribute("data-fa-transform");return n&&(e.transform=VS(n)),e}}},provides(e){e.generateAbstractTransformGrouping=function(t){let{main:n,transform:r,containerWidth:o,iconWidth:i}=t;const a={transform:"translate(".concat(o/2," 256)")},s="translate(".concat(r.x*32,", ").concat(r.y*32,") "),l="scale(".concat(r.size/16*(r.flipX?-1:1),", ").concat(r.size/16*(r.flipY?-1:1),") "),u="rotate(".concat(r.rotate," 0 0)"),c={transform:"".concat(s," ").concat(l," ").concat(u)},d={transform:"translate(".concat(i/2*-1," -256)")},f={outer:a,inner:c,path:d};return{tag:"g",attributes:{...f.outer},children:[{tag:"g",attributes:{...f.inner},children:[{tag:n.icon.tag,children:n.icon.children,attributes:{...n.icon.attributes,...f.path}}]}]}}}};const Wm={x:0,y:0,width:"100%",height:"100%"};function GS(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||t)&&(e.attributes.fill="black"),e}function XH(e){return e.tag==="g"?e.children:[e]}var YH={hooks(){return{parseNodeAttributes(e,t){const n=t.getAttribute("data-fa-mask"),r=n?Sh(n.split(" ").map(o=>o.trim())):By();return r.prefix||(r.prefix=li()),e.mask=r,e.maskId=t.getAttribute("data-fa-mask-id"),e}}},provides(e){e.generateAbstractMask=function(t){let{children:n,attributes:r,main:o,mask:i,maskId:a,transform:s}=t;const{width:l,icon:u}=o,{width:c,icon:d}=i,f=VW({transform:s,containerWidth:c,iconWidth:l}),h={tag:"rect",attributes:{...Wm,fill:"white"}},v=u.children?{children:u.children.map(GS)}:{},y={tag:"g",attributes:{...f.inner},children:[GS({tag:u.tag,attributes:{...u.attributes,...f.path},...v})]},b={tag:"g",attributes:{...f.outer},children:[y]},p="mask-".concat(a||zu()),m="clip-".concat(a||zu()),g={tag:"mask",attributes:{...Wm,id:p,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"},children:[h,b]},w={tag:"defs",children:[{tag:"clipPath",attributes:{id:m},children:XH(d)},g]};return n.push(w,{tag:"rect",attributes:{fill:"currentColor","clip-path":"url(#".concat(m,")"),mask:"url(#".concat(p,")"),...Wm}}),{children:n,attributes:r}}}},qH={provides(e){let t=!1;si.matchMedia&&(t=si.matchMedia("(prefers-reduced-motion: reduce)").matches),e.missingIconAbstract=function(){const n=[],r={fill:"currentColor"},o={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};n.push({tag:"path",attributes:{...r,d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"}});const i={...o,attributeName:"opacity"},a={tag:"circle",attributes:{...r,cx:"256",cy:"364",r:"28"},children:[]};return t||a.children.push({tag:"animate",attributes:{...o,attributeName:"r",values:"28;14;28;28;14;28;"}},{tag:"animate",attributes:{...i,values:"1;0;1;1;0;1;"}}),n.push(a),n.push({tag:"path",attributes:{...r,opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"},children:t?[]:[{tag:"animate",attributes:{...i,values:"1;0;0;0;0;1;"}}]}),t||n.push({tag:"path",attributes:{...r,opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"},children:[{tag:"animate",attributes:{...i,values:"0;0;1;1;0;0;"}}]}),{tag:"g",attributes:{class:"missing"},children:n}}}},QH={hooks(){return{parseNodeAttributes(e,t){const n=t.getAttribute("data-fa-symbol"),r=n===null?!1:n===""?!0:n;return e.symbol=r,e}}}},JH=[XW,MH,LH,FH,DH,VH,GH,KH,YH,qH,QH];uH(JH,{mixoutsTo:Qn});Qn.noAuto;Qn.config;Qn.library;Qn.dom;const eg=Qn.parse;Qn.findIconDefinition;Qn.toHtml;const ZH=Qn.icon;Qn.layer;Qn.text;Qn.counter;function KS(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable})),n.push.apply(n,r)}return n}function zr(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?KS(Object(n),!0).forEach(function(r){Va(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):KS(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function Uf(e){"@babel/helpers - typeof";return Uf=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Uf(e)}function Va(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function eV(e,t){if(e==null)return{};var n={},r=Object.keys(e),o,i;for(i=0;i<r.length;i++)o=r[i],!(t.indexOf(o)>=0)&&(n[o]=e[o]);return n}function tV(e,t){if(e==null)return{};var n=eV(e,t),r,o;if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)r=i[o],!(t.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}function tg(e){return nV(e)||rV(e)||oV(e)||iV()}function nV(e){if(Array.isArray(e))return ng(e)}function rV(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function oV(e,t){if(e){if(typeof e=="string")return ng(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);if(n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set")return Array.from(e);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return ng(e,t)}}function ng(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function iV(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function aV(e){var t,n=e.beat,r=e.fade,o=e.beatFade,i=e.bounce,a=e.shake,s=e.flash,l=e.spin,u=e.spinPulse,c=e.spinReverse,d=e.pulse,f=e.fixedWidth,h=e.inverse,v=e.border,y=e.listItem,b=e.flip,p=e.size,m=e.rotation,g=e.pull,w=(t={"fa-beat":n,"fa-fade":r,"fa-beat-fade":o,"fa-bounce":i,"fa-shake":a,"fa-flash":s,"fa-spin":l,"fa-spin-reverse":c,"fa-spin-pulse":u,"fa-pulse":d,"fa-fw":f,"fa-inverse":h,"fa-border":v,"fa-li":y,"fa-flip":b===!0,"fa-flip-horizontal":b==="horizontal"||b==="both","fa-flip-vertical":b==="vertical"||b==="both"},Va(t,"fa-".concat(p),typeof p<"u"&&p!==null),Va(t,"fa-rotate-".concat(m),typeof m<"u"&&m!==null&&m!==0),Va(t,"fa-pull-".concat(g),typeof g<"u"&&g!==null),Va(t,"fa-swap-opacity",e.swapOpacity),t);return Object.keys(w).map(function(C){return w[C]?C:null}).filter(function(C){return C})}function sV(e){return e=e-0,e===e}function I6(e){return sV(e)?e:(e=e.replace(/[\-_\s]+(.)?/g,function(t,n){return n?n.toUpperCase():""}),e.substr(0,1).toLowerCase()+e.substr(1))}var lV=["style"];function uV(e){return e.charAt(0).toUpperCase()+e.slice(1)}function cV(e){return e.split(";").map(function(t){return t.trim()}).filter(function(t){return t}).reduce(function(t,n){var r=n.indexOf(":"),o=I6(n.slice(0,r)),i=n.slice(r+1).trim();return o.startsWith("webkit")?t[uV(o)]=i:t[o]=i,t},{})}function N6(e,t){var n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof t=="string")return t;var r=(t.children||[]).map(function(l){return N6(e,l)}),o=Object.keys(t.attributes||{}).reduce(function(l,u){var c=t.attributes[u];switch(u){case"class":l.attrs.className=c,delete t.attributes.class;break;case"style":l.attrs.style=cV(c);break;default:u.indexOf("aria-")===0||u.indexOf("data-")===0?l.attrs[u.toLowerCase()]=c:l.attrs[I6(u)]=c}return l},{attrs:{}}),i=n.style,a=i===void 0?{}:i,s=tV(n,lV);return o.attrs.style=zr(zr({},o.attrs.style),a),e.apply(void 0,[t.tag,zr(zr({},o.attrs),s)].concat(tg(r)))}var A6=!1;try{A6=!0}catch{}function dV(){if(!A6&&console&&typeof console.error=="function"){var e;(e=console).error.apply(e,arguments)}}function XS(e){if(e&&Uf(e)==="object"&&e.prefix&&e.iconName&&e.icon)return e;if(eg.icon)return eg.icon(e);if(e===null)return null;if(e&&Uf(e)==="object"&&e.prefix&&e.iconName)return e;if(Array.isArray(e)&&e.length===2)return{prefix:e[0],iconName:e[1]};if(typeof e=="string")return{prefix:"fas",iconName:e}}function Hm(e,t){return Array.isArray(t)&&t.length>0||!Array.isArray(t)&&t?Va({},e,t):{}}var YS={border:!1,className:"",mask:null,maskId:null,fixedWidth:!1,inverse:!1,flip:!1,icon:null,listItem:!1,pull:null,pulse:!1,rotation:null,size:null,spin:!1,spinPulse:!1,spinReverse:!1,beat:!1,fade:!1,beatFade:!1,bounce:!1,shake:!1,symbol:!1,title:"",titleId:null,transform:null,swapOpacity:!1},ci=En.forwardRef(function(e,t){var n=zr(zr({},YS),e),r=n.icon,o=n.mask,i=n.symbol,a=n.className,s=n.title,l=n.titleId,u=n.maskId,c=XS(r),d=Hm("classes",[].concat(tg(aV(n)),tg((a||"").split(" ")))),f=Hm("transform",typeof n.transform=="string"?eg.transform(n.transform):n.transform),h=Hm("mask",XS(o)),v=ZH(c,zr(zr(zr(zr({},d),f),h),{},{symbol:i,title:s,titleId:l,maskId:u}));if(!v)return dV("Could not find icon",c),null;var y=v.abstract,b={ref:t};return Object.keys(n).forEach(function(p){YS.hasOwnProperty(p)||(b[p]=n[p])}),fV(y[0],b)});ci.displayName="FontAwesomeIcon";ci.propTypes={beat:ve.bool,border:ve.bool,beatFade:ve.bool,bounce:ve.bool,className:ve.string,fade:ve.bool,flash:ve.bool,mask:ve.oneOfType([ve.object,ve.array,ve.string]),maskId:ve.string,fixedWidth:ve.bool,inverse:ve.bool,flip:ve.oneOf([!0,!1,"horizontal","vertical","both"]),icon:ve.oneOfType([ve.object,ve.array,ve.string]),listItem:ve.bool,pull:ve.oneOf(["right","left"]),pulse:ve.bool,rotation:ve.oneOf([0,90,180,270]),shake:ve.bool,size:ve.oneOf(["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"]),spin:ve.bool,spinPulse:ve.bool,spinReverse:ve.bool,symbol:ve.oneOfType([ve.bool,ve.string]),title:ve.string,titleId:ve.string,transform:ve.oneOfType([ve.string,ve.object]),swapOpacity:ve.bool};var fV=N6.bind(null,En.createElement);const pV={prefix:"fas",iconName:"burst",icon:[512,512,[],"e4dc","M37.6 4.2C28-2.3 15.2-1.1 7 7s-9.4 21-2.8 30.5l112 163.3L16.6 233.2C6.7 236.4 0 245.6 0 256s6.7 19.6 16.6 22.8l103.1 33.4L66.8 412.8c-4.9 9.3-3.2 20.7 4.3 28.1s18.8 9.2 28.1 4.3l100.6-52.9 33.4 103.1c3.2 9.9 12.4 16.6 22.8 16.6s19.6-6.7 22.8-16.6l33.4-103.1 100.6 52.9c9.3 4.9 20.7 3.2 28.1-4.3s9.2-18.8 4.3-28.1L392.3 312.2l103.1-33.4c9.9-3.2 16.6-12.4 16.6-22.8s-6.7-19.6-16.6-22.8L388.9 198.7l25.7-70.4c3.2-8.8 1-18.6-5.6-25.2s-16.4-8.8-25.2-5.6l-70.4 25.7L278.8 16.6C275.6 6.7 266.4 0 256 0s-19.6 6.7-22.8 16.6l-32.3 99.6L37.6 4.2z"]},hV={prefix:"fas",iconName:"shield-halved",icon:[512,512,["shield-alt"],"f3ed","M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8s0 0 0 0z"]},mV={prefix:"fas",iconName:"shield-virus",icon:[512,512,[],"e06c","M269.4 2.9C265.2 1 260.7 0 256 0s-9.2 1-13.4 2.9L54.3 82.8c-22 9.3-38.4 31-38.3 57.2c.5 99.2 41.3 280.7 213.6 363.2c16.7 8 36.1 8 52.8 0C454.7 420.7 495.5 239.2 496 140c.1-26.2-16.3-47.9-38.3-57.2L269.4 2.9zM256 112c8.8 0 16 7.2 16 16c0 33 39.9 49.5 63.2 26.2c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6C334.5 200.1 351 240 384 240c8.8 0 16 7.2 16 16s-7.2 16-16 16c-33 0-49.5 39.9-26.2 63.2c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0C311.9 334.5 272 351 272 384c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-33-39.9-49.5-63.2-26.2c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6C177.5 311.9 161 272 128 272c-8.8 0-16-7.2-16-16s7.2-16 16-16c33 0 49.5-39.9 26.2-63.2c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0C200.1 177.5 240 161 240 128c0-8.8 7.2-16 16-16zM232 256a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm72 32a16 16 0 1 0 -32 0 16 16 0 1 0 32 0z"]},vV={prefix:"fas",iconName:"crosshairs",icon:[512,512,[],"f05b","M256 0c17.7 0 32 14.3 32 32l0 10.4c93.7 13.9 167.7 88 181.6 181.6l10.4 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-10.4 0c-13.9 93.7-88 167.7-181.6 181.6l0 10.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-10.4C130.3 455.7 56.3 381.7 42.4 288L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l10.4 0C56.3 130.3 130.3 56.3 224 42.4L224 32c0-17.7 14.3-32 32-32zM107.4 288c12.5 58.3 58.4 104.1 116.6 116.6l0-20.6c0-17.7 14.3-32 32-32s32 14.3 32 32l0 20.6c58.3-12.5 104.1-58.4 116.6-116.6L384 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l20.6 0C392.1 165.7 346.3 119.9 288 107.4l0 20.6c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-20.6C165.7 119.9 119.9 165.7 107.4 224l20.6 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-20.6 0zM256 224a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"]},qS={prefix:"fas",iconName:"dice-d20",icon:[512,512,[],"f6cf","M48.7 125.8l53.2 31.9c7.8 4.7 17.8 2 22.2-5.9L201.6 12.1c3-5.4-.9-12.1-7.1-12.1c-1.6 0-3.2 .5-4.6 1.4L47.9 98.8c-9.6 6.6-9.2 20.9 .8 26.9zM16 171.7l0 123.5c0 8 10.4 11 14.7 4.4l60-92c5-7.6 2.6-17.8-5.2-22.5L40.2 158C29.6 151.6 16 159.3 16 171.7zM310.4 12.1l77.6 139.6c4.4 7.9 14.5 10.6 22.2 5.9l53.2-31.9c10-6 10.4-20.3 .8-26.9L322.1 1.4c-1.4-.9-3-1.4-4.6-1.4c-6.2 0-10.1 6.7-7.1 12.1zM496 171.7c0-12.4-13.6-20.1-24.2-13.7l-45.3 27.2c-7.8 4.7-10.1 14.9-5.2 22.5l60 92c4.3 6.7 14.7 3.6 14.7-4.4l0-123.5zm-49.3 246L286.1 436.6c-8.1 .9-14.1 7.8-14.1 15.9l0 52.8c0 3.7 3 6.8 6.8 6.8c.8 0 1.6-.1 2.4-.4l172.7-64c6.1-2.2 10.1-8 10.1-14.5c0-9.3-8.1-16.5-17.3-15.4zM233.2 512c3.7 0 6.8-3 6.8-6.8l0-52.6c0-8.1-6.1-14.9-14.1-15.9l-160.6-19c-9.2-1.1-17.3 6.1-17.3 15.4c0 6.5 4 12.3 10.1 14.5l172.7 64c.8 .3 1.6 .4 2.4 .4zM41.7 382.9l170.9 20.2c7.8 .9 13.4-7.5 9.5-14.3l-85.7-150c-5.9-10.4-20.7-10.8-27.3-.8L30.2 358.2c-6.5 9.9-.3 23.3 11.5 24.7zm439.6-24.8L402.9 238.1c-6.5-10-21.4-9.6-27.3 .8L290.2 388.5c-3.9 6.8 1.6 15.2 9.5 14.3l170.1-20c11.8-1.4 18-14.7 11.5-24.6zm-216.9 11l78.4-137.2c6.1-10.7-1.6-23.9-13.9-23.9l-145.7 0c-12.3 0-20 13.3-13.9 23.9l78.4 137.2c3.7 6.4 13 6.4 16.7 0zM174.4 176l163.2 0c12.2 0 19.9-13.1 14-23.8l-80-144c-2.8-5.1-8.2-8.2-14-8.2l-3.2 0c-5.8 0-11.2 3.2-14 8.2l-80 144c-5.9 10.7 1.8 23.8 14 23.8z"]};function fc({successValue:e,value:t,onBlur:n,variant:r}){const[o,i]=x.useState(t),a=c=>c.target.select(),s=c=>{i(c.replace(/\D/g,""))},u=Nr().palette[r][700];return _(yh,{sx:{fontFamily:"conthrax",color:u,input:{textAlign:"center",paddingTop:0,paddingBottom:0}},autoComplete:"False",value:o,onBlur:n,onChange:c=>s(c.target.value),onFocus:a,inputProps:{inputMode:"numeric",pattern:"[0-9]*"}},e)}function _h(e){const t=e.value,n=e.update,r=e.icon,o=e.min,i=e.max,s=(e.variant||"active")==="active"?"primary":"secondary",l=u=>{n(Vt(o,i,u+t))};return G(ur,{children:[G(Hx,{color:s,children:[_(Go,{sx:{fontFamily:"conthrax"},variant:"outlined",onClick:()=>l(-3),tabIndex:-1,disabled:t===o,children:"-3"}),_(Go,{sx:{fontFamily:"conthrax"},variant:"outlined",onClick:()=>l(-1),tabIndex:-1,disabled:t===o,children:"-1"})]}),r,G(Hx,{color:s,children:[_(Go,{sx:{fontFamily:"conthrax"},variant:"outlined",onClick:()=>l(1),tabIndex:-1,disabled:t===i,children:"+1"}),_(Go,{sx:{fontFamily:"conthrax"},variant:"outlined",onClick:()=>l(3),tabIndex:-1,disabled:t===i,children:"+3"})]})]})}function Wf({successValue:e,update:t,variant:n}){const i=s=>{let l=Number(s);isNaN(l)||(l=Vt(1,30,l),t(l))};return G(ur,{children:[_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(pn,{title:`Target Success Value for player after all positive and negative mods
          (fireteam, mimetism, range, cover, etc) have been applied to the BS or CC attribute. Success values over 20
          will be added to the roll. Rolls equal or over 20 will cause critical hits. Remember mods cap out at +/-12.`,children:_(qr,{sx:{mt:1},children:"Success Value"})})}),_(Te,{item:!0,xs:2,sx:{display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"8px 8px 8px 8px",p:1},children:_(fc,{value:e,onBlur:s=>i(s.target.value),variant:n},e)}),_(Te,{item:!0,xs:1}),_(Te,{item:!0,xs:9,sx:{display:"flex",justifyContent:"left"},children:_(_h,{value:e,update:t,min:1,max:30,variant:n,icon:_(ci,{icon:vV,style:{paddingLeft:4,paddingRight:4,alignSelf:"center"},className:"fa-xl"})})})]})}Wf.propTypes={successValue:ve.number,update:ve.func,variant:ve.string};Wf.defaultProps={variant:"active"};function Hf({damage:e,update:t,variant:n}){const i=s=>{let l=Number(s);isNaN(l)||(l=Vt(0,30,l),t(l))};return G(ur,{children:[_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(pn,{title:`Final damage value of weapon being used. You must include all damage mods.
          You can also subtract cover from here instead of adding it to ARM.`,children:_(qr,{sx:{mt:1},children:"Damage"})})}),_(Te,{item:!0,xs:2,sx:{display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"8px 8px 8px 8px",p:1},children:_(fc,{value:e,onBlur:s=>i(s.target.value),variant:n},e)}),_(Te,{item:!0,xs:1}),_(Te,{item:!0,xs:9,sx:{display:"flex",justifyContent:"left"},children:_(_h,{value:e,update:t,min:0,max:30,variant:n,icon:_(ci,{icon:pV,style:{paddingLeft:4,paddingRight:4,alignSelf:"center"},className:"fa-xl"})})})]})}Hf.propTypes={damage:ve.number,update:ve.func,variant:ve.string};Hf.defaultProps={variant:"active"};function Vf({armor:e,update:t,variant:n,hideBTS:r}){const a=l=>{let u=Number(l);isNaN(u)||(u=Vt(0,13,u),t(u))};return G(ur,{children:[_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(pn,{title:`Final computed armor value, after all modifiers. You must halve and round up
          if opposing player uses AP ammo. If a weapon only targets BTS (like breaker), use BTS value here`,children:G(qr,{sx:{mt:1},children:["Armor ",!r&&_("span",{children:"/ BTS"})]})})}),_(Te,{item:!0,xs:2,sx:{display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"8px 8px 8px 8px",p:1},children:_(fc,{value:e,onBlur:l=>a(l.target.value),variant:n},e)}),_(Te,{item:!0,xs:1}),_(Te,{item:!0,xs:9,sx:{display:"flex",justifyContent:"left"},children:_(_h,{value:e,update:t,min:0,max:13,variant:n,icon:_(ci,{icon:hV,style:{paddingLeft:4,paddingRight:4,alignSelf:"center"},className:"fa-xl"})})})]})}Vf.propTypes={armor:ve.number,update:ve.func,variant:ve.string,hideBTS:ve.bool};Vf.defaultProps={variant:"active",hideBTS:!1};function QS(e){const t=e.ammo,n=e.update,r=e.cont,o=e.updateCont,i=e.variant??"active",a=e.dtw,s=i==="active"?"primary":"secondary",l=a?"DODGE":t,u=X(AU)({fontWeight:"bold",minWidth:"3em"});return G(ur,{children:[_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(pn,{title:`Calculate AP ammo by halving opposing ARM/BTS manually. Dodge will use the burst value, so smoke
       dodges in fire teams can be calculated.`,children:_(qr,{sx:{mt:1},children:"Ammunition"})})}),G(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left",alignItems:"center",flexWrap:"wrap"},children:[G(jU,{color:s,exclusive:!0,value:l,size:"small",onChange:(c,d)=>{d!==null&&n(d)},children:[_(u,{value:"N",children:"N"}),_(u,{value:"DA",children:"DA"}),_(u,{value:"EXP",children:"EXP"}),_(u,{value:"T2",children:"T2"}),_(u,{value:"PLASMA",children:"PLASMA"}),_(u,{value:"DODGE",children:"Dodge"})]}),_(u,{sx:{fontWeight:"bold",minWidth:"3em"},color:s,value:"CONT",size:"small",selected:r,onChange:()=>{o(!r)},children:"CONT"})]})]})}function gV(e){return G(Ev,{...e,viewBox:"0 0 512 512",version:"1.1",xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",xmlSpace:"preserve",xmlnsserif:"http://www.serif.com/",children:[_("path",{d:"M336.377,124.799L271.6,8.2C268.8,3.1 263.4,-0 257.6,-0L254.4,-0C248.6,-0 243.2,3.2 240.4,8.2L160.4,152.2C154.5,162.9 162.2,176 174.4,176L285.176,176L336.377,124.799Z"}),_("path",{d:"M229.643,337.675L247.6,369.1C251.3,375.5 260.6,375.5 264.3,369.1L264.4,369.1L342.8,231.9C344.548,228.835 345.163,225.564 344.861,222.457L229.643,337.675Z"}),_("path",{d:"M403.786,57.39L322.1,1.4C320.7,0.5 319.1,0 317.5,0C311.3,0 307.4,6.7 310.4,12.1L359.945,101.23L403.786,57.39Z"}),_("path",{d:"M103.058,464.261L230.8,511.6C231.6,511.9 232.4,512 233.2,512C236.9,512 240,509 240,505.2L240,452.6C240,444.5 233.9,437.7 225.9,436.7L140.698,426.62L103.058,464.261Z"}),_("path",{d:"M409.11,158.209C409.478,158.022 409.842,157.819 410.2,157.6L463.4,125.7C472.498,120.241 473.65,107.913 466.555,100.763L409.11,158.209Z"}),_("path",{d:"M167.661,293.515L136.4,238.8C130.5,228.4 115.7,228 109.1,238L30.2,358.2C23.7,368.1 29.9,381.5 41.7,382.9L74.41,386.766L167.661,293.515Z"}),_("path",{d:"M253.176,208L183.1,208C170.8,208 163.1,221.3 169.2,231.9L191.046,270.13L253.176,208Z"}),_("path",{d:"M169.332,397.986L212.6,403.1C220.4,404 226,395.6 222.1,388.8L206.254,361.065L169.332,397.986Z"}),_("path",{d:"M48.7,125.8L101.9,157.7C109.7,162.4 119.7,159.7 124.1,151.8L201.6,12.1C204.6,6.7 200.7,0 194.5,0C192.9,0 191.3,0.5 189.9,1.4L47.9,98.8C38.3,105.4 38.7,119.7 48.7,125.7L48.7,125.8Z"}),_("path",{d:"M16,171.7L16,295.3C16,303.3 26.4,306.3 30.7,299.7L90.7,207.7C95.7,200.1 93.3,189.9 85.5,185.2L40.2,158C29.6,151.6 16,159.3 16,171.7Z"}),_("path",{d:"M496,171.7C496,159.3 482.4,151.6 471.8,158L426.5,185.2C418.7,189.9 416.4,200.1 421.3,207.7L481.3,299.7C485.6,306.4 496,303.3 496,295.3L496,171.7Z"}),_("path",{d:"M446.7,417.7L286.1,436.6C278,437.5 272,444.4 272,452.5L272,505.3C272,509 275,512.1 278.8,512.1C279.6,512.1 280.4,512 281.2,511.7L453.9,447.7C460,445.5 464,439.7 464,433.2C464,423.9 455.9,416.7 446.7,417.8L446.7,417.7Z"}),_("path",{d:"M481.3,358.1L402.9,238.1C396.4,228.1 381.5,228.5 375.6,238.9L290.2,388.5C286.3,395.3 291.8,403.7 299.7,402.8L469.8,382.8C481.6,381.4 487.8,368.1 481.3,358.2L481.3,358.1Z"}),_("g",{transform:"matrix(0.906183,-0.906183,1.57301,1.57301,-164.767,293.032)",children:_("path",{d:"M498.908,122.419C498.908,116.212 490.161,111.173 479.386,111.173L27.351,111.173C16.576,111.173 7.829,116.212 7.829,122.419C7.829,128.626 16.576,133.665 27.351,133.665L479.386,133.665C490.161,133.665 498.908,128.626 498.908,122.419Z"})})]})}function Gf({burst:e,update:t,variant:n}){const o=Nr().palette[n][500],i=n==="active"?6:5,a=e===0?o:"grey",s=u=>{let c=Number(u);isNaN(c)||(c=Vt(0,6,c),t(c))};return G(ur,{children:[_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(pn,{title:`Final burst after bonuses (fire team, multiple combatants in CC, etc). You can
        set Reactive burst to 0 to calculate unopposed shots by double clicking on the die or typing 0 in the value box.`,children:_(qr,{children:"Burst"})})}),_(Te,{item:!0,xs:2,sx:{display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"8px 8px 8px 8px",p:1},children:_(fc,{value:e,onBlur:u=>s(u.target.value),variant:n},e)}),_(Te,{item:!0,xs:1}),G(Te,{item:!0,xs:9,sx:{display:"flex",justifyContent:"left",alignItems:"center"},children:[_(hj,{value:e,min:1,max:i,size:"large",onChange:(u,c)=>{c!==null?t(c):n==="reactive"&&t(0)},icon:_(ci,{fontSize:"inherit",style:{padding:2,color:o},icon:qS}),emptyIcon:_(ci,{fontSize:"inherit",style:{padding:2,opacity:.55},icon:qS})}),n==="reactive"&&_(ar,{onClick:()=>t(0),children:_(gV,{sx:{height:30,width:30},htmlColor:a})})]})]})}Gf.propTypes={burst:ve.number,update:ve.func,variant:ve.string};Gf.defaultProps={variant:"active"};const Wy=es("active","player"),Hy=es("reactive","player"),M6=es("fail","player"),yV=so(e=>e===0,"wounds"),L6=so(e=>e>=1,"wounds"),F6=so(e=>e===1,"wounds"),bV=(e,t=1)=>e.toFixed(t),Kf=(e,t=2)=>e.toFixed(t),Ht=cy(h9(100),bV),rs=hn(Wy),os=hn(Hy),xV=hn(M6),rg=t4(BM(oc("wounds"))),SV=t4(o9(oc("wounds"))),Eh=hn(th([Wy,L6])),Ch=hn(th([Hy,L6])),$h=hn(LM([M6,yV])),wV=hn(th([Wy,F6])),_V=hn(th([Hy,F6])),pu=cy(eh("chance"),e4),Vm=cy(eh("raw_chance"),e4),EV=(e,t)=>e+t.wounds*t.chance,Xf=ic(EV,0,TA),Vy=(e,t,n)=>{let r=Vm(e),o=Eh(e),i=Ch(e),a=hn(so(y=>y>t,"wounds"),o),s=hn(so(y=>y===t,"wounds"),o),l=hn(so(y=>y<t,"wounds"),o),u=Vm(a),c=hn(so(y=>y>n,"wounds"),i),d=hn(so(y=>y===n,"wounds"),i),f=hn(so(y=>y<n,"wounds"),i),h=Vm(c),v=[];if(v=$m(v,l),s.length>0)if(u>0){let b=s[0].raw_chance+u;v=Xc({id:0,player:"active",wounds:t,raw_chance:b,chance:b/r,cumulative_chance:b/r},v)}else v=Xc(s[0],v);if(v=$m(v,$h(e)),v=$m(v,f),d.length>0)if(h>0){let b=d[0].raw_chance+h;v=Xc({id:0,player:"reactive",wounds:n,raw_chance:b,chance:b/r,cumulative_chance:b/r},v)}else v=Xc(d[0],v);return v=v.map((y,b)=>(y.id=b,y)),v};function Gm(e){const t=Nr(),n={1:t.palette.active[300],2:t.palette.active[400],3:t.palette.active[500],4:t.palette.active[600],5:t.palette.active[700]},r={1:t.palette.reactive[300],2:t.palette.reactive[400],3:t.palette.reactive[500],4:t.palette.reactive[600],5:t.palette.reactive[700]},o=e.player,i=e.chance,a=e.wounds,s=(i*100).toFixed(1)+"%";let l;return o==="active"&&a>0?l=n[a]:o==="reactive"&&a>0?l=r[a]:l=t.palette.failure[100],_(H4,{sx:{bgcolor:l,width:s,padding:0,height:"30px",textAlign:"center"},children:i>=.1&&_("div",{children:a})})}function CV(e){const t=e.rows;if(!t)return null;const n=Vt(1,5,e.activeMaxWounds?e.activeMaxWounds:3),r=Vt(1,5,e.reactiveMaxWounds?e.reactiveMaxWounds:3),o=Vy(t,n,r);let i=pu($h(o));return _(U4,{sx:{width:"100%"},children:_(W4,{children:G(V4,{children:[SV(Eh(o)).map(a=>_(Gm,{wounds:a.wounds,chance:a.chance,player:a.player},a.id)),i>0&&_(Gm,{wounds:0,chance:i,player:"fail"},-1),rg(Ch(o)).map(a=>_(Gm,{wounds:a.wounds,chance:a.chance,player:a.player},a.id))]},"1")})})}function $V(e){const t=e.color,n=e.text;return G(Ai,{direction:"row",sx:{alignItems:"center"},children:[_(mn,{sx:{width:25,height:25,display:"flex",justifyContent:"center",alignContent:"center",backgroundColor:t},children:_("div",{style:{display:"flex",verticalAlign:"middle",justifyContent:"center",alignContent:"center"}})}),_(st,{ml:1,mr:1,lineHeight:1,variant:"body2",children:n})]})}function RV(e){const t=e.rows,n=e.activeMaxWounds?e.activeMaxWounds:3,r=e.reactiveMaxWounds?e.reactiveMaxWounds:3;if(t===null)return null;const o=Nr(),i={1:o.palette.active[300],2:o.palette.active[400],3:o.palette.active[500],4:o.palette.active[600],5:o.palette.active[700]},a={1:o.palette.reactive[300],2:o.palette.reactive[400],3:o.palette.reactive[500],4:o.palette.reactive[600],5:o.palette.reactive[700]},s=Vy(t,n,r),l=Eh(s),u=Ch(s),c=$h(s),d=pu(c),f=rs(c),h=os(c);return G(Te,{container:!0,spacing:2,children:[G(Te,{item:!0,xs:12,sm:4,lg:12,sx:{textAlign:"left"},children:[G(st,{children:["Active (",Kf(Xf(rs(t)))," wounds / order)"]}),rg(l).map(v=>_($V,{color:i[v.wounds],text:Ht(v.cumulative_chance)+"% chance "+v.wounds+" or more wounds."},v.id))]}),G(Te,{item:!0,xs:12,sm:4,lg:12,sx:{textAlign:"left"},children:[_(st,{children:"Failure"}),G(Ai,{direction:"row",sx:{alignItems:"center"},children:[_(mn,{sx:{width:25,height:25,display:"flex",justifyContent:"center",alignContent:"center",backgroundColor:"lightgrey"},children:_("div",{style:{display:"flex",verticalAlign:"middle",justifyContent:"center",alignContent:"center"}})}),G(st,{ml:1,mr:1,lineHeight:1,variant:"body2",children:[Ht(d),"% chance neither player causes wounds."]})]},1),f.map(v=>G(Ai,{direction:"row",sx:{alignItems:"center"},children:[_(mn,{sx:{width:25,height:25,display:"flex",justifyContent:"center",alignContent:"center",backgroundColor:"none"},children:_("div",{style:{display:"flex",verticalAlign:"middle",justifyContent:"center",alignContent:"center"}})}),G(st,{ml:1,mr:1,lineHeight:1,variant:"body2",children:["(",Ht(v.chance),"% active player causes no wounds.)"]})]},2)),h.map(v=>G(Ai,{direction:"row",sx:{alignItems:"center"},children:[_(mn,{sx:{width:25,height:25,display:"flex",justifyContent:"center",alignContent:"center",backgroundColor:"none"},children:_("div",{style:{display:"flex",verticalAlign:"middle",justifyContent:"center",alignContent:"center"}})}),G(st,{ml:1,mr:1,lineHeight:1,variant:"body2",children:["(",Ht(v.chance),"% reactive player causes no wounds.)"]})]},3))]}),G(Te,{item:!0,xs:12,sm:4,lg:12,sx:{textAlign:"left"},children:[G(st,{children:["Reactive (",Kf(Xf(os(t)))," wounds / order)"]}),rg(u).map(v=>G(Ai,{direction:"row",sx:{alignItems:"center"},children:[_(mn,{sx:{width:25,height:25,display:"flex",justifyContent:"center",alignContent:"center",backgroundColor:a[v.wounds]},children:_("div",{style:{display:"flex",verticalAlign:"middle",justifyContent:"center",alignContent:"center"}})}),G(st,{ml:1,mr:1,lineHeight:1,variant:"body2",children:[Ht(v.cumulative_chance),"% chance ",v.wounds," or more wounds."]})]},v.id))]})]})}function Km(e){const t=Nr(),n=e.row,r=(n.chance*100).toFixed(1)+"%";let o;return n.player==="active"?o=t.palette.active[400]:n.player==="reactive"?o=t.palette.reactive[400]:o=t.palette.failure[100],_(H4,{sx:{bgcolor:o,width:r,padding:0,height:"30px",textAlign:"center"},children:n.chance>=.1&&_("div",{children:r})})}function kV(e){const t=e.rows;if(!t)return _("div",{});let n=rs(t),r=xV(t),o=os(t);return _(U4,{sx:{width:"100%"},children:_(W4,{children:G(V4,{children:[n.map(i=>_(Km,{row:i},i.id)),r.map(i=>_(Km,{row:i},i.id)),o.map(i=>_(Km,{row:i},i.id))]},"1")})})}/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var PV=typeof Object.defineProperty=="function"?Object.defineProperty:null,TV=PV;/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var OV=TV;function IV(){try{return OV({},"x",{}),!0}catch{return!1}}var NV=IV;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var AV=Object.defineProperty,MV=AV;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Vs=Object.prototype,JS=Vs.toString,ZS=Vs.__defineGetter__,ew=Vs.__defineSetter__,LV=Vs.__lookupGetter__,FV=Vs.__lookupSetter__;function DV(e,t,n){var r,o,i,a;if(typeof e!="object"||e===null||JS.call(e)==="[object Array]")throw new TypeError("invalid argument. First argument must be an object. Value: `"+e+"`.");if(typeof n!="object"||n===null||JS.call(n)==="[object Array]")throw new TypeError("invalid argument. Property descriptor must be an object. Value: `"+n+"`.");if(o="value"in n,o&&(LV.call(e,t)||FV.call(e,t)?(r=e.__proto__,e.__proto__=Vs,delete e[t],e[t]=n.value,e.__proto__=r):e[t]=n.value),i="get"in n,a="set"in n,o&&(i||a))throw new Error("invalid argument. Cannot specify one or more accessors and a value or writable attribute in the property descriptor.");return i&&ZS&&ZS.call(e,t,n.get),a&&ew&&ew.call(e,t,n.set),e}var BV=DV;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zV=NV,jV=MV,UV=BV,og;zV()?og=jV:og=UV;var WV=og;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var HV=WV;function VV(e,t,n){HV(e,t,{configurable:!1,enumerable:!1,writable:!1,value:n})}var GV=VV;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var KV=GV,Rh=KV;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var XV=Math.floor,YV=XV;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qV=YV,pc=qV;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var QV=pc;function JV(e){return QV(e)===e&&e>=0}var ZV=JV;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eG=ZV,D6=eG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tG=pc;function nG(e){return tG(e)===e}var rG=nG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oG=rG,kh=oG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function iG(e){return e!==e}var aG=iG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var sG=aG,cn=sG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lG=Number.POSITIVE_INFINITY,Sn=lG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uG=Number;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cG=uG,dG=cG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fG=dG,pG=fG.NEGATIVE_INFINITY,Jn=pG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hG=Sn,mG=Jn;function vG(e){return e===hG||e===mG}var gG=vG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yG=gG,hc=yG;/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function bG(e){return Math.abs(e)}var xG=bG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var SG=xG,ca=SG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function wG(){return typeof Symbol=="function"&&typeof Symbol("foo")=="symbol"}var _G=wG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var EG=_G,CG=EG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $G=CG,RG=$G();function kG(){return RG&&typeof Symbol.toStringTag=="symbol"}var PG=kG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var TG=PG,OG=TG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var IG=Object.prototype.toString,B6=IG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var NG=B6;function AG(e){return NG.call(e)}var MG=AG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var LG=Object.prototype.hasOwnProperty;function FG(e,t){return e==null?!1:LG.call(e,t)}var DG=FG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var BG=DG,zG=BG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jG=typeof Symbol=="function"?Symbol.toStringTag:"",UG=jG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var WG=zG,$l=UG,Xm=B6;function HG(e){var t,n,r;if(e==null)return Xm.call(e);n=e[$l],t=WG(e,$l);try{e[$l]=void 0}catch{return Xm.call(e)}return r=Xm.call(e),t?e[$l]=n:delete e[$l],r}var VG=HG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var GG=OG,KG=MG,XG=VG,ig;GG()?ig=XG:ig=KG;var Ph=ig;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var YG=Ph,qG=typeof Uint32Array=="function";function QG(e){return qG&&e instanceof Uint32Array||YG(e)==="[object Uint32Array]"}var JG=QG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ZG=JG,eK=ZG;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tK=4294967295,nK=tK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rK=typeof Uint32Array=="function"?Uint32Array:null,oK=rK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iK=eK,Ym=nK,tw=oK;function aK(){var e,t;if(typeof tw!="function")return!1;try{t=[1,3.14,-3.14,Ym+1,Ym+2],t=new tw(t),e=iK(t)&&t[0]===1&&t[1]===3&&t[2]===Ym-2&&t[3]===0&&t[4]===1}catch{e=!1}return e}var sK=aK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lK=sK,uK=lK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cK=typeof Uint32Array=="function"?Uint32Array:void 0,dK=cK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function fK(){throw new Error("not implemented")}var pK=fK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hK=uK,mK=dK,vK=pK,ag;hK()?ag=mK:ag=vK;var Gs=ag;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var gK=Ph,yK=typeof Float64Array=="function";function bK(e){return yK&&e instanceof Float64Array||gK(e)==="[object Float64Array]"}var xK=bK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var SK=xK,wK=SK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _K=typeof Float64Array=="function"?Float64Array:null,EK=_K;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var CK=wK,nw=EK;function $K(){var e,t;if(typeof nw!="function")return!1;try{t=new nw([1,3.14,-3.14,NaN]),e=CK(t)&&t[0]===1&&t[1]===3.14&&t[2]===-3.14&&t[3]!==t[3]}catch{e=!1}return e}var RK=$K;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kK=RK,PK=kK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var TK=typeof Float64Array=="function"?Float64Array:void 0,OK=TK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function IK(){throw new Error("not implemented")}var NK=IK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var AK=PK,MK=OK,LK=NK,sg;AK()?sg=MK:sg=LK;var Ks=sg;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var FK=Ph,DK=typeof Uint8Array=="function";function BK(e){return DK&&e instanceof Uint8Array||FK(e)==="[object Uint8Array]"}var zK=BK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jK=zK,UK=jK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var WK=255,HK=WK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var VK=typeof Uint8Array=="function"?Uint8Array:null,GK=VK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var KK=UK,qm=HK,rw=GK;function XK(){var e,t;if(typeof rw!="function")return!1;try{t=[1,3.14,-3.14,qm+1,qm+2],t=new rw(t),e=KK(t)&&t[0]===1&&t[1]===3&&t[2]===qm-2&&t[3]===0&&t[4]===1}catch{e=!1}return e}var YK=XK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qK=YK,QK=qK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var JK=typeof Uint8Array=="function"?Uint8Array:void 0,ZK=JK;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function eX(){throw new Error("not implemented")}var tX=eX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nX=QK,rX=ZK,oX=tX,lg;nX()?lg=rX:lg=oX;var iX=lg;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var aX=Ph,sX=typeof Uint16Array=="function";function lX(e){return sX&&e instanceof Uint16Array||aX(e)==="[object Uint16Array]"}var uX=lX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cX=uX,dX=cX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fX=65535,pX=fX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hX=typeof Uint16Array=="function"?Uint16Array:null,mX=hX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vX=dX,Qm=pX,ow=mX;function gX(){var e,t;if(typeof ow!="function")return!1;try{t=[1,3.14,-3.14,Qm+1,Qm+2],t=new ow(t),e=vX(t)&&t[0]===1&&t[1]===3&&t[2]===Qm-2&&t[3]===0&&t[4]===1}catch{e=!1}return e}var yX=gX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bX=yX,xX=bX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var SX=typeof Uint16Array=="function"?Uint16Array:void 0,wX=SX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function _X(){throw new Error("not implemented")}var EX=_X;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var CX=xX,$X=wX,RX=EX,ug;CX()?ug=$X:ug=RX;var kX=ug;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var PX=iX,TX=kX,OX={uint16:TX,uint8:PX},IX=OX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iw=IX,z6;function NX(){var e,t;return e=new iw.uint16(1),e[0]=4660,t=new iw.uint8(e.buffer),t[0]===52}z6=NX();var AX=z6;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var MX=AX,Xs=MX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var LX=Xs,cg;LX===!0?cg=1:cg=0;var FX=cg;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var DX=Gs,BX=Ks,zX=FX,j6=new BX(1),jX=new DX(j6.buffer);function UX(e){return j6[0]=e,jX[zX]}var WX=UX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var HX=WX,Ar=HX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var VX=Xs,dg;VX===!0?dg=1:dg=0;var GX=dg;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var KX=Gs,XX=Ks,YX=GX,fg=new XX(1),qX=new KX(fg.buffer);function QX(e,t){return fg[0]=e,qX[YX]=t>>>0,fg[0]}var JX=QX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ZX=JX,Th=ZX;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eY=1023,Ys=eY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function tY(e){return e===0?.3999999999940942:.3999999999940942+e*(.22222198432149784+e*.15313837699209373)}var nY=tY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function rY(e){return e===0?.6666666666666735:.6666666666666735+e*(.2857142874366239+e*(.1818357216161805+e*.14798198605116586))}var oY=rY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_log.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var aw=Ar,iY=Th,aY=cn,sY=Ys,lY=Jn,uY=nY,cY=oY,id=.6931471803691238,ad=19082149292705877e-26,dY=0x40000000000000,fY=.3333333333333333,sw=1048575,pY=2146435072,hY=1048576,mY=1072693248;function vY(e){var t,n,r,o,i,a,s,l,u,c,d,f;return e===0?lY:aY(e)||e<0?NaN:(n=aw(e),i=0,n<hY&&(i-=54,e*=dY,n=aw(e)),n>=pY?e+e:(i+=(n>>20)-sY|0,n&=sw,l=n+614244&1048576|0,e=iY(e,n|l^mY),i+=l>>20|0,s=e-1,(sw&2+n)<3?s===0?i===0?0:i*id+i*ad:(a=s*s*(.5-fY*s),i===0?s-a:i*id-(a-i*ad-s)):(c=s/(2+s),f=c*c,l=n-398458|0,d=f*f,u=440401-n|0,o=d*uY(d),r=f*cY(d),l|=u,a=r+o,l>0?(t=.5*s*s,i===0?s-(t-c*(t+a)):i*id-(t-(c*(t+a)+i*ad)-s)):i===0?s-c*(s-a):i*id-(c*(s-a)-i*ad-s))))}var gY=vY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yY=gY,mc=yY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bY=Math.ceil,xY=bY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var SY=xY,wY=SY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _Y=pc,EY=wY;function CY(e){return e<0?EY(e):_Y(e)}var $Y=CY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var RY=$Y,U6=RY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function kY(e){return e===0?.0416666666666666:.0416666666666666+e*(-.001388888888887411+e*2480158728947673e-20)}var PY=kY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function TY(e){return e===0?-27557314351390663e-23:-27557314351390663e-23+e*(2087572321298175e-24+e*-11359647557788195e-27)}var OY=TY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_cos.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var IY=PY,NY=OY;function AY(e,t){var n,r,o,i;return i=e*e,o=i*i,r=i*IY(i),r+=o*o*NY(i),n=.5*i,o=1-n,o+(1-o-n+(i*r-e*t))}var MY=AY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var LY=MY,W6=LY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_sin.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var lw=-.16666666666666632,FY=.00833333333332249,DY=-.0001984126982985795,BY=27557313707070068e-22,zY=-25050760253406863e-24,jY=158969099521155e-24;function UY(e,t){var n,r,o,i;return i=e*e,o=i*i,n=FY+i*(DY+i*BY)+i*o*(zY+i*jY),r=i*e,t===0?e+r*(lw+i*n):e-(i*(.5*t-r*n)-t-r*lw)}var WY=UY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var HY=WY,H6=HY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var VY=Xs,pg;VY===!0?pg=0:pg=1;var GY=pg;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var KY=Gs,XY=Ks,YY=GY,V6=new XY(1),qY=new KY(V6.buffer);function QY(e){return V6[0]=e,qY[YY]}var JY=QY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ZY=JY,eq=ZY;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tq=Xs,G6,hg,mg;tq===!0?(hg=1,mg=0):(hg=0,mg=1);G6={HIGH:hg,LOW:mg};var nq=G6;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rq=Gs,oq=Ks,K6=nq,X6=new oq(1),uw=new rq(X6.buffer),iq=K6.HIGH,aq=K6.LOW;function sq(e,t){return uw[iq]=e,uw[aq]=t,X6[0]}var lq=sq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uq=lq,Gy=uq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cq=1023,dq=cq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fq=-1023,pq=fq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hq=-1074,mq=hq;/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vq=2147483648,gq=vq;/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yq=2147483647,Oh=yq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bq=Xs,Y6,vg,gg;bq===!0?(vg=1,gg=0):(vg=0,gg=1);Y6={HIGH:vg,LOW:gg};var xq=Y6;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Sq=Gs,wq=Ks,q6=xq,Q6=new wq(1),cw=new Sq(Q6.buffer),_q=q6.HIGH,Eq=q6.LOW;function Cq(e,t,n,r){return Q6[0]=e,t[r]=cw[_q],t[r+n]=cw[Eq],t}var J6=Cq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $q=J6;function Rq(e){return $q(e,[0,0],1,0)}var kq=Rq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pq=Rh,Z6=kq,Tq=J6;Pq(Z6,"assign",Tq);var Ky=Z6;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Oq=gq,Iq=Oh,Nq=Ky,Aq=Ar,Mq=Gy,Jm=[0,0];function Lq(e,t){var n,r;return Nq.assign(e,Jm,1,0),n=Jm[0],n&=Iq,r=Aq(t),r&=Oq,n|=r,Mq(n,Jm[1])}var Fq=Lq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Dq=Fq,Xy=Dq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Bq=22250738585072014e-324,zq=Bq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jq=zq,Uq=hc,Wq=cn,Hq=ca,Vq=4503599627370496;function Gq(e,t,n,r){return Wq(e)||Uq(e)?(t[r]=e,t[r+n]=0,t):e!==0&&Hq(e)<jq?(t[r]=e*Vq,t[r+n]=-52,t):(t[r]=e,t[r+n]=0,t)}var eR=Gq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Kq=eR;function Xq(e){return Kq(e,[0,0],1,0)}var Yq=Xq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qq=Rh,tR=Yq,Qq=eR;qq(tR,"assign",Qq);var Jq=tR;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Zq=2146435072,eQ=Zq;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tQ=Ar,nQ=eQ,rQ=Ys;function oQ(e){var t=tQ(e);return t=(t&nQ)>>>20,t-rQ|0}var iQ=oQ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var aQ=iQ,sQ=aQ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lQ=Sn,uQ=Jn,cQ=Ys,dQ=dq,fQ=pq,pQ=mq,hQ=cn,mQ=hc,vQ=Xy,gQ=Jq.assign,yQ=sQ,bQ=Ky,xQ=Gy,SQ=2220446049250313e-31,wQ=2148532223,Zm=[0,0],e0=[0,0];function _Q(e,t){var n,r;return t===0||e===0||hQ(e)||mQ(e)?e:(gQ(e,Zm,1,0),e=Zm[0],t+=Zm[1],t+=yQ(e),t<pQ?vQ(0,e):t>dQ?e<0?uQ:lQ:(t<=fQ?(t+=52,r=SQ):r=1,bQ.assign(e,e0,1,0),n=e0[0],n&=wQ,n|=t+cQ<<20,r*xQ(n,e0[1])))}var EQ=_Q;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var CQ=EQ,Yy=CQ;/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function $Q(e,t){var n,r;for(n=[],r=0;r<t;r++)n.push(e);return n}var RQ=$Q;/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kQ=RQ,PQ=kQ;/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var TQ=PQ;function OQ(e){return TQ(0,e)}var IQ=OQ;/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var NQ=IQ,AQ=NQ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var MQ=pc,sd=Yy,Ih=AQ,nR=[10680707,7228996,1387004,2578385,16069853,12639074,9804092,4427841,16666979,11263675,12935607,2387514,4345298,14681673,3074569,13734428,16653803,1880361,10960616,8533493,3062596,8710556,7349940,6258241,3772886,3769171,3798172,8675211,12450088,3874808,9961438,366607,15675153,9132554,7151469,3571407,2607881,12013382,4155038,6285869,7677882,13102053,15825725,473591,9065106,15363067,6271263,9264392,5636912,4652155,7056368,13614112,10155062,1944035,9527646,15080200,6658437,6231200,6832269,16767104,5075751,3212806,1398474,7579849,6349435,12618859],LQ=[1.570796251296997,7549789415861596e-23,5390302529957765e-30,3282003415807913e-37,1270655753080676e-44,12293330898111133e-52,27337005381646456e-60,21674168387780482e-67],t0=16777216,n0=5960464477539063e-23,ld=Ih(20),dw=Ih(20),ud=Ih(20),Yt=Ih(20);function rR(e,t,n,r,o,i,a,s,l){var u,c,d,f,h,v,y,b,p;for(f=i,p=r[n],b=n,h=0;b>0;h++)c=n0*p|0,Yt[h]=p-t0*c|0,p=r[b-1]+c,b-=1;if(p=sd(p,o),p-=8*MQ(p*.125),y=p|0,p-=y,d=0,o>0?(h=Yt[n-1]>>24-o,y+=h,Yt[n-1]-=h<<24-o,d=Yt[n-1]>>23-o):o===0?d=Yt[n-1]>>23:p>=.5&&(d=2),d>0){for(y+=1,u=0,h=0;h<n;h++)b=Yt[h],u===0?b!==0&&(u=1,Yt[h]=16777216-b):Yt[h]=16777215-b;if(o>0)switch(o){case 1:Yt[n-1]&=8388607;break;case 2:Yt[n-1]&=4194303;break}d===2&&(p=1-p,u!==0&&(p-=sd(1,o)))}if(p===0){for(b=0,h=n-1;h>=i;h--)b|=Yt[h];if(b===0){for(v=1;Yt[i-v]===0;v++);for(h=n+1;h<=n+v;h++){for(l[s+h]=nR[a+h],c=0,b=0;b<=s;b++)c+=e[b]*l[s+(h-b)];r[h]=c}return n+=v,rR(e,t,n,r,o,i,a,s,l)}}if(p===0)for(n-=1,o-=24;Yt[n]===0;)n-=1,o-=24;else p=sd(p,-o),p>=t0?(c=n0*p|0,Yt[n]=p-t0*c|0,n+=1,o+=24,Yt[n]=c):Yt[n]=p|0;for(c=sd(1,o),h=n;h>=0;h--)r[h]=c*Yt[h],c*=n0;for(h=n;h>=0;h--){for(c=0,v=0;v<=f&&v<=n-h;v++)c+=LQ[v]*r[h+v];ud[n-h]=c}for(c=0,h=n;h>=0;h--)c+=ud[h];for(d===0?t[0]=c:t[0]=-c,c=ud[0]-c,h=1;h<=n;h++)c+=ud[h];return d===0?t[1]=c:t[1]=-c,y&7}function FQ(e,t,n,r){var o,i,a,s,l,u,c,d,f;for(i=4,s=r-1,a=(n-3)/24|0,a<0&&(a=0),u=n-24*(a+1),d=a-s,f=s+i,c=0;c<=f;c++)d<0?ld[c]=0:ld[c]=nR[d],d+=1;for(c=0;c<=i;c++){for(o=0,d=0;d<=s;d++)o+=e[d]*ld[s+(c-d)];dw[c]=o}return l=i,rR(e,t,l,dw,u,i,a,s,ld)}var DQ=FQ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var BQ=Math.round,zQ=BQ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jQ=zQ,UQ=jQ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var WQ=UQ,fw=Ar,HQ=.6366197723675814,VQ=1.5707963267341256,GQ=6077100506506192e-26,KQ=6077100506303966e-26,XQ=20222662487959506e-37,YQ=20222662487111665e-37,qQ=84784276603689e-45,pw=2047;function QQ(e,t,n){var r,o,i,a,s,l,u;return o=WQ(e*HQ),a=e-o*VQ,s=o*GQ,u=t>>20|0,n[0]=a-s,r=fw(n[0]),l=u-(r>>20&pw),l>16&&(i=a,s=o*KQ,a=i-s,s=o*XQ-(i-a-s),n[0]=a-s,r=fw(n[0]),l=u-(r>>20&pw),l>49&&(i=a,s=o*YQ,a=i-s,s=o*qQ-(i-a-s),n[0]=a-s)),n[1]=a-n[0]-s,o}var JQ=QQ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
*
* Optimized by Bruce D. Evans.
* ```
*/var ZQ=Ar,eJ=eq,tJ=Gy,nJ=DQ,cd=JQ,rJ=0,oJ=16777216,Ao=1.5707963267341256,Mi=6077100506506192e-26,dd=2*Mi,fd=3*Mi,pd=4*Mi,iJ=2147483647,aJ=2146435072,sJ=1048575,lJ=598523,uJ=1072243195,cJ=1073928572,dJ=1074752122,fJ=1074977148,pJ=1075183036,hJ=1075388923,mJ=1075594811,vJ=1094263291,Rl=[0,0,0],kl=[0,0];function gJ(e,t){var n,r,o,i,a,s,l,u;if(o=ZQ(e),i=o&iJ|0,i<=uJ)return t[0]=e,t[1]=0,0;if(i<=dJ)return(i&sJ)===lJ?cd(e,i,t):i<=cJ?e>0?(u=e-Ao,t[0]=u-Mi,t[1]=u-t[0]-Mi,1):(u=e+Ao,t[0]=u+Mi,t[1]=u-t[0]+Mi,-1):e>0?(u=e-2*Ao,t[0]=u-dd,t[1]=u-t[0]-dd,2):(u=e+2*Ao,t[0]=u+dd,t[1]=u-t[0]+dd,-2);if(i<=mJ)return i<=pJ?i===fJ?cd(e,i,t):e>0?(u=e-3*Ao,t[0]=u-fd,t[1]=u-t[0]-fd,3):(u=e+3*Ao,t[0]=u+fd,t[1]=u-t[0]+fd,-3):i===hJ?cd(e,i,t):e>0?(u=e-4*Ao,t[0]=u-pd,t[1]=u-t[0]-pd,4):(u=e+4*Ao,t[0]=u+pd,t[1]=u-t[0]+pd,-4);if(i<vJ)return cd(e,i,t);if(i>=aJ)return t[0]=NaN,t[1]=NaN,0;for(n=eJ(e),r=(i>>20)-1046,u=tJ(i-(r<<20|0),n),s=0;s<2;s++)Rl[s]=u|0,u=(u-Rl[s])*oJ;for(Rl[2]=u,a=3;Rl[a-1]===rJ;)a-=1;return l=nJ(Rl,kl,r,a),e<0?(t[0]=-kl[0],t[1]=-kl[1],-l):(t[0]=kl[0],t[1]=kl[1],l)}var yJ=gJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bJ=yJ,oR=bJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_cos.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var xJ=Ar,r0=W6,hw=H6,SJ=oR,to=[0,0],wJ=2147483647,_J=1072243195,EJ=1044381696,CJ=2146435072;function $J(e){var t,n;if(t=xJ(e),t&=wJ,t<=_J)return t<EJ?1:r0(e,0);if(t>=CJ)return NaN;switch(n=SJ(e,to),n&3){case 0:return r0(to[0],to[1]);case 1:return-hw(to[0],to[1]);case 2:return-r0(to[0],to[1]);default:return hw(to[0],to[1])}}var RJ=$J;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kJ=RJ,PJ=kJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_sin.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var TJ=Ar,mw=W6,o0=H6,OJ=oR,IJ=2147483647,NJ=2146435072,AJ=1072243195,MJ=1045430272,no=[0,0];function LJ(e){var t,n;if(t=TJ(e),t&=IJ,t<=AJ)return t<MJ?e:o0(e,0);if(t>=NJ)return NaN;switch(n=OJ(e,no),n&3){case 0:return o0(no[0],no[1]);case 1:return mw(no[0],no[1]);case 2:return-o0(no[0],no[1]);default:return-mw(no[0],no[1])}}var FJ=LJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var DJ=FJ,iR=DJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var BJ=3.141592653589793,qy=BJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zJ=cn,jJ=hc,vw=PJ,i0=iR,UJ=ca,Pl=Xy,Tl=qy;function WJ(e){var t,n;return zJ(e)?NaN:jJ(e)?NaN:(n=e%2,t=UJ(n),t===0||t===1?Pl(0,n):t<.25?i0(Tl*n):t<.75?(t=.5-t,Pl(vw(Tl*t),n)):t<1.25?(n=Pl(1,n)-n,i0(Tl*n)):t<1.75?(t-=1.5,-Pl(vw(Tl*t),n)):(n-=Pl(2,n),i0(Tl*n)))}var HJ=WJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var VJ=HJ,GJ=VJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function KJ(e){return e===0?.06735230105312927:.06735230105312927+e*(.007385550860814029+e*(.0011927076318336207+e*(.00022086279071390839+e*25214456545125733e-21)))}var XJ=KJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function YJ(e){return e===0?.020580808432516733:.020580808432516733+e*(.0028905138367341563+e*(.0005100697921535113+e*(.00010801156724758394+e*44864094961891516e-21)))}var qJ=YJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function QJ(e){return e===0?1.3920053346762105:1.3920053346762105+e*(.7219355475671381+e*(.17193386563280308+e*(.01864591917156529+e*(.0007779424963818936+e*7326684307446256e-21))))}var JJ=QJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function ZJ(e){return e===0?.21498241596060885:.21498241596060885+e*(.325778796408931+e*(.14635047265246445+e*(.02664227030336386+e*(.0018402845140733772+e*3194753265841009e-20))))}var eZ=ZJ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function tZ(e){return e===0?-.032788541075985965:-.032788541075985965+e*(.006100538702462913+e*(-.0014034646998923284+e*.00031563207090362595))}var nZ=tZ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function rZ(e){return e===0?.01797067508118204:.01797067508118204+e*(-.0036845201678113826+e*(.000881081882437654+e*-.00031275416837512086))}var oZ=rZ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function iZ(e){return e===0?-.010314224129834144:-.010314224129834144+e*(.0022596478090061247+e*(-.0005385953053567405+e*.0003355291926355191))}var aZ=iZ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function sZ(e){return e===0?.6328270640250934:.6328270640250934+e*(1.4549225013723477+e*(.9777175279633727+e*(.22896372806469245+e*.013381091853678766)))}var lZ=sZ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function uZ(e){return e===0?2.4559779371304113:2.4559779371304113+e*(2.128489763798934+e*(.7692851504566728+e*(.10422264559336913+e*.003217092422824239)))}var cZ=uZ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function dZ(e){return e===0?.08333333333333297:.08333333333333297+e*(-.0027777777772877554+e*(.0007936505586430196+e*(-.00059518755745034+e*(.0008363399189962821+e*-.0016309293409657527))))}var fZ=dZ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_lgamma_r.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var pZ=cn,hZ=hc,mZ=ca,Ra=mc,vZ=U6,gZ=GJ,yZ=qy,a0=Sn,bZ=XJ,xZ=qJ,SZ=JJ,wZ=eZ,_Z=nZ,EZ=oZ,CZ=aZ,$Z=lZ,RZ=cZ,kZ=fZ,PZ=.07721566490153287,TZ=.3224670334241136,OZ=1,IZ=-.07721566490153287,NZ=.48383612272381005,AZ=-.1475877229945939,MZ=.06462494023913339,LZ=-.07721566490153287,FZ=1,DZ=.4189385332046727,hd=1.4616321449683622,BZ=4503599627370496,zZ=0x400000000000000,jZ=8470329472543003e-37,gw=1.4616321449683622,UZ=-.12148629053584961,WZ=-3638676997039505e-33;function HZ(e){var t,n,r,o,i,a,s,l,u,c,d,f,h;if(pZ(e)||hZ(e))return e;if(e===0)return a0;if(e<0?(t=!0,e=-e):t=!1,e<jZ)return-Ra(e);if(t){if(e>=BZ||(u=gZ(e),u===0))return a0;n=Ra(yZ/mZ(u*e))}if(e===1||e===2)return 0;if(e<2)switch(e<=.9?(h=-Ra(e),e>=hd-1+.27?(d=1-e,r=0):e>=hd-1-.27?(d=e-(gw-1),r=1):(d=e,r=2)):(h=0,e>=hd+.27?(d=2-e,r=0):e>=hd-.27?(d=e-gw,r=1):(d=e-1,r=2)),r){case 0:f=d*d,a=PZ+f*bZ(f),i=f*(TZ+f*xZ(f)),s=d*a+i,h+=s-.5*d;break;case 1:f=d*d,c=f*d,a=NZ+c*_Z(c),i=AZ+c*EZ(c),o=MZ+c*CZ(c),s=f*a-(WZ-c*(i+d*o)),h+=UZ+s;break;case 2:a=d*(LZ+d*$Z(d)),i=FZ+d*RZ(d),h+=-.5*d+a/i;break}else if(e<8)switch(r=vZ(e),d=e-r,s=d*(IZ+d*wZ(d)),l=OZ+d*SZ(d),h=.5*d+s/l,f=1,r){case 7:f*=d+6;case 6:f*=d+5;case 5:f*=d+4;case 4:f*=d+3;case 3:f*=d+2,h+=Ra(f)}else e<zZ?(u=Ra(e),f=1/e,d=f*f,c=DZ+f*kZ(d),h=(e-.5)*(u-1)+c):h=e*(Ra(e)-1);return t&&(h=n-h),h}var VZ=HZ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var GZ=VZ,KZ=GZ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function XZ(e){return e===0?.6666666666666735:.6666666666666735+e*(.3999999999940942+e*(.2857142874366239+e*(.22222198432149784+e*(.1818357216161805+e*(.15313837699209373+e*.14798198605116586)))))}var YZ=XZ;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FDLIBM]{@link http://www.netlib.org/fdlibm/s_log1p.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var qZ=cn,yw=Ar,bw=Th,QZ=Sn,JZ=Jn,xw=Ys,ZZ=YZ,s0=.6931471803691238,l0=19082149292705877e-26,eee=.41421356237309503,tee=-.2928932188134525,nee=1862645149230957e-24,ree=5551115123125783e-32,oee=9007199254740992,iee=.6666666666666666;function aee(e){var t,n,r,o,i,a,s,l,u,c;if(e<-1||qZ(e))return NaN;if(e===-1)return JZ;if(e===QZ||e===0)return e;if(e<0?r=-e:r=e,c=1,r<eee){if(r<nee)return r<ree?e:e-e*e*.5;e>tee&&(c=0,o=e,n=1)}return c!==0&&(r<oee?(u=1+e,n=yw(u),c=(n>>20)-xw,c>0?i=1-(u-e):i=e-(u-1),i/=u):(u=e,n=yw(u),c=(n>>20)-xw,i=0),n&=1048575,n<434334?u=bw(u,n|1072693248):(c+=1,u=bw(u,n|1071644672),n=1048576-n>>2),o=u-1),t=.5*o*o,n===0?o===0?(i+=c*l0,c*s0+i):(l=t*(1-iee*o),c*s0-(l-(c*l0+i)-o)):(a=o/(2+o),s=a*a,l=s*ZZ(s),c===0?o-(t-a*(t+l)):c*s0-(t-(a*(t+l)+(c*l0+i))-o))}var see=aee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lee=see,Qy=lee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uee=Jn;function cee(e){return e===0&&1/e===uee}var dee=cee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fee=dee,aR=fee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pee=2.5066282746310007,hee=pee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var mee=kh;function vee(e){return mee(e/2)}var gee=vee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yee=gee,bee=yee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Sw=bee;function xee(e){return e>0?Sw(e-1):Sw(e+1)}var See=xee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wee=See,sR=wee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _ee=Math.sqrt,Eee=_ee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Cee=Eee,$ee=Cee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ree=Xs,yg;Ree===!0?yg=0:yg=1;var kee=yg;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pee=Gs,Tee=Ks,Oee=kee,bg=new Tee(1),Iee=new Pee(bg.buffer);function Nee(e,t){return bg[0]=e,Iee[Oee]=t>>>0,bg[0]}var Aee=Nee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Mee=Aee,Nh=Mee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Lee(e){return e|0}var Fee=Lee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Dee=Fee,lR=Dee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var ww=sR,Bee=Xy,zee=Jn,md=Sn;function jee(e,t){return t===zee?md:t===md?0:t>0?ww(t)?e:0:ww(t)?Bee(md,e):md}var Uee=jee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Wee=Oh,Hee=Ar,Vee=1072693247,vd=1e300,gd=1e-300;function Gee(e,t){var n,r;return r=Hee(e),n=r&Wee,n<=Vee?t<0?vd*vd:gd*gd:t>0?vd*vd:gd*gd}var Kee=Gee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xee=ca,_w=Sn;function Yee(e,t){return e===-1?(e-e)/(e-e):e===1?1:Xee(e)<1==(t===_w)?0:_w}var qee=Yee;/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Qee(e){return e===0?.5999999999999946:.5999999999999946+e*(.4285714285785502+e*(.33333332981837743+e*(.272728123808534+e*(.23066074577556175+e*.20697501780033842))))}var Jee=Qee;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Zee=Ar,yd=Nh,Ew=Th,ete=Ys,tte=Jee,nte=1048575,Cw=1048576,rte=1072693248,ote=536870912,ite=524288,ate=20,ste=9007199254740992,lte=.9617966939259756,ute=.9617967009544373,cte=-7028461650952758e-24,dte=[1,1.5],fte=[0,.5849624872207642],pte=[0,1350039202129749e-23];function hte(e,t,n){var r,o,i,a,s,l,u,c,d,f,h,v,y,b,p,m,g,w,C,S,$,R;return S=0,n<Cw&&(t*=ste,S-=53,n=Zee(t)),S+=(n>>ate)-ete|0,$=n&nte|0,n=$|rte|0,$<=235662?R=0:$<767610?R=1:(R=0,S+=1,n-=Cw),t=Ew(t,n),c=dte[R],w=t-c,C=1/(t+c),o=w*C,a=yd(o,0),r=(n>>1|ote)+ite,r+=R<<18,l=Ew(0,r),u=t-(l-c),s=C*(w-a*l-a*u),i=o*o,g=i*i*tte(i),g+=s*(a+o),i=a*a,l=3+i+g,l=yd(l,0),u=g-(l-3-i),w=a*l,C=s*l+u*o,f=w+C,f=yd(f,0),h=C-(f-w),v=ute*f,y=cte*f+h*lte+pte[R],d=fte[R],m=S,b=v+y+d+m,b=yd(b,0),p=y-(b-m-d-v),e[0]=b,e[1]=p,e}var mte=hte;/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function vte(e){return e===0?.5:.5+e*(-.3333333333333333+e*.25)}var gte=vte;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var yte=Nh,bte=gte,xte=1.4426950408889634,Ste=1.4426950216293335,wte=19259629911266175e-24;function _te(e,t){var n,r,o,i,a,s;return o=t-1,i=o*o*bte(o),a=Ste*o,s=o*wte-i*xte,r=a+s,r=yte(r,0),n=s-(r-a),e[0]=r,e[1]=n,e}var Ete=_te;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Cte=.6931471805599453,$te=Cte;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Rte=1048575,kte=Rte;/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Pte(e){return e===0?.16666666666666602:.16666666666666602+e*(-.0027777777777015593+e*(6613756321437934e-20+e*(-16533902205465252e-22+e*41381367970572385e-24)))}var Tte=Pte;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Ote=Ar,$w=Th,Ite=Nh,Nte=lR,Ate=Yy,Mte=$te,Rw=Ys,kw=Oh,Pw=kte,Lte=Tte,Tw=1048576,Fte=1071644672,Ol=20,Dte=.6931471824645996,Bte=-1904654299957768e-24;function zte(e,t,n){var r,o,i,a,s,l,u,c,d,f,h;return f=e&kw|0,h=(f>>Ol)-Rw|0,d=0,f>Fte&&(d=e+(Tw>>h+1)>>>0,h=((d&kw)>>Ol)-Rw|0,r=(d&~(Pw>>h))>>>0,i=$w(0,r),d=(d&Pw|Tw)>>Ol-h>>>0,e<0&&(d=-d),t-=i),i=n+t,i=Ite(i,0),s=i*Dte,l=(n-(i-t))*Mte+i*Bte,c=s+l,u=l-(c-s),i=c*c,o=c-i*Lte(i),a=c*o/(o-2)-(u+c*u),c=1-(a-c),e=Ote(c),e=Nte(e),e+=d<<Ol>>>0,e>>Ol<=0?c=Ate(c,d):c=$w(c,e),c}var jte=zte;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Ow=cn,Iw=sR,Nw=hc,Ute=kh,Aw=$ee,Wte=ca,u0=Ky,Hte=Nh,Mw=lR,Vte=Jn,Gte=Sn,c0=Oh,Kte=Uee,Xte=Kee,Yte=qee,qte=mte,Qte=Ete,Jte=jte,Zte=1072693247,ene=1105199104,tne=1139802112,Lw=1083179008,nne=1072693248,rne=1083231232,one=3230714880,Fw=31,Mo=1e300,Lo=1e-300,ine=8008566259537294e-32,ro=[0,0],Dw=[0,0];function uR(e,t){var n,r,o,i,a,s,l,u,c,d,f,h,v,y,b,p;if(Ow(e)||Ow(t))return NaN;if(u0.assign(t,ro,1,0),s=ro[0],l=ro[1],l===0){if(t===0)return 1;if(t===1)return e;if(t===-1)return 1/e;if(t===.5)return Aw(e);if(t===-.5)return 1/Aw(e);if(t===2)return e*e;if(t===3)return e*e*e;if(t===4)return e*=e,e*e;if(Nw(t))return Yte(e,t)}if(u0.assign(e,ro,1,0),i=ro[0],a=ro[1],a===0){if(i===0)return Kte(e,t);if(e===1)return 1;if(e===-1&&Iw(t))return-1;if(Nw(e))return e===Vte?uR(-0,-t):t<0?0:Gte}if(e<0&&Ute(t)===!1)return(e-e)/(e-e);if(o=Wte(e),n=i&c0|0,r=s&c0|0,u=i>>>Fw|0,c=s>>>Fw|0,u&&Iw(t)?u=-1:u=1,r>ene){if(r>tne)return Xte(e,t);if(n<Zte)return c===1?u*Mo*Mo:u*Lo*Lo;if(n>nne)return c===0?u*Mo*Mo:u*Lo*Lo;v=Qte(Dw,o)}else v=qte(Dw,o,n);if(d=Hte(t,0),h=(t-d)*v[0]+t*v[1],f=d*v[0],y=h+f,u0.assign(y,ro,1,0),b=Mw(ro[0]),p=Mw(ro[1]),b>=Lw){if(b-Lw|p||h+ine>y-f)return u*Mo*Mo}else if((b&c0)>=rne&&(b-one|p||h<=y-f))return u*Lo*Lo;return y=Jte(b,f,h),u*y}var ane=uR;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var sne=ane,cR=sne;/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function lne(e){return e===0?.16666666666666602:.16666666666666602+e*(-.0027777777777015593+e*(6613756321437934e-20+e*(-16533902205465252e-22+e*41381367970572385e-24)))}var une=lne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_exp.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var cne=Yy,dne=une;function fne(e,t,n){var r,o,i,a;return r=e-t,o=r*r,i=r-o*dne(o),a=1-(t-r*i/(2-i)-e),cne(a,n)}var pne=fne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_exp.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var hne=cn,Bw=U6,mne=Jn,zw=Sn,vne=pne,gne=.6931471803691238,yne=19082149292705877e-26,jw=1.4426950408889634,bne=709.782712893384,xne=-745.1332191019411,dR=1/(1<<28),Sne=-dR;function wne(e){var t,n,r;return hne(e)||e===zw?e:e===mne?0:e>bne?zw:e<xne?0:e>Sne&&e<dR?1+e:(e<0?r=Bw(jw*e-.5):r=Bw(jw*e+.5),t=e-r*gne,n=r*yne,vne(t,n,r))}var _ne=wne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ene=_ne,Jy=Ene;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Cne(e){return e===0?.08333333333334822:.08333333333334822+e*(.0034722222160545866+e*(-.0026813261780578124+e*(-.00022954996161337813+e*.0007873113957930937)))}var $ne=Cne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1987, 1989, 1992, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var Rne=hee,Uw=cR,kne=Jy,Pne=$ne,Tne=143.01608;function One(e){var t,n,r;return t=1/e,t=1+t*Pne(t),n=kne(e),e>Tne?(r=Uw(e,.5*e-.25),n=r*(r/n)):n=Uw(e,e-.5)/n,Rne*n*t}var Ine=One;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Nne=.5772156649015329,Ane=Nne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1987, 1989, 1992, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var Mne=Ane;function Lne(e,t){return t/((1+Mne*e)*e)}var Fne=Lne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Dne(e){var t,n,r;return e===0?1:(e<0?t=-e:t=e,t<=1?(n=1+e*(.4942148268014971+e*(.20744822764843598+e*(.04763678004571372+e*(.010421379756176158+e*(.0011913514700658638+e*(.00016011952247675185+e*0)))))),r=1+e*(.0714304917030273+e*(-.23459179571824335+e*(.035823639860549865+e*(.011813978522206043+e*(-.004456419138517973+e*(.0005396055804933034+e*-23158187332412014e-21))))))):(e=1/e,n=0+e*(.00016011952247675185+e*(.0011913514700658638+e*(.010421379756176158+e*(.04763678004571372+e*(.20744822764843598+e*(.4942148268014971+e*1)))))),r=-23158187332412014e-21+e*(.0005396055804933034+e*(-.004456419138517973+e*(.011813978522206043+e*(.035823639860549865+e*(-.23459179571824335+e*(.0714304917030273+e*1))))))),n/r)}var Bne=Dne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, long comment, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1987, 1989, 1992, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var zne=cn,jne=kh,Une=aR,Ww=ca,Wne=pc,Hne=iR,Hw=Sn,Vw=Jn,Gw=qy,Kw=Ine,Xw=Fne,Vne=Bne;function Gne(e){var t,n,r,o;if(jne(e)&&e<0||e===Vw||zne(e))return NaN;if(e===0)return Une(e)?Vw:Hw;if(e>171.61447887182297)return Hw;if(e<-170.5674972726612)return 0;if(n=Ww(e),n>33)return e>=0?Kw(e):(r=Wne(n),r&1?t=1:t=-1,o=n-r,o>.5&&(r+=1,o=n-r),o=n*Hne(Gw*o),t*Gw/(Ww(o)*Kw(n)));for(o=1;e>=3;)e-=1,o*=e;for(;e<0;){if(e>-1e-9)return Xw(e,o);o/=e,e+=1}for(;e<2;){if(e<1e-9)return Xw(e,o);o/=e,e+=1}return e===2?o:(e-=2,o*Vne(e))}var Kne=Gne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xne=Kne,Yne=Xne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qne=Sn;function Qne(e){return e===0&&1/e===qne}var Jne=Qne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Zne=Jne,ere=Zne;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Yw=ere,d0=cn,tre=Jn,bd=Sn;function nre(e,t){var n,r,o,i;if(n=arguments.length,n===2)return d0(e)||d0(t)?NaN:e===bd||t===bd?bd:e===t&&e===0?Yw(e)?e:t:e>t?e:t;for(r=tre,i=0;i<n;i++){if(o=arguments[i],d0(o)||o===bd)return o;(o>r||o===r&&o===0&&Yw(o))&&(r=o)}return r}var rre=nre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ore=rre,ire=ore;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qw=aR,f0=cn,xd=Jn,are=Sn;function sre(e,t){var n,r,o,i;if(n=arguments.length,n===2)return f0(e)||f0(t)?NaN:e===xd||t===xd?xd:e===t&&e===0?qw(e)?e:t:e<t?e:t;for(r=are,i=0;i<n;i++){if(o=arguments[i],f0(o)||o===xd)return o;(o<r||o===r&&o===0&&qw(o))&&(r=o)}return r}var lre=sre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ure=lre,cre=ure;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var dre=.9189385332046728,fre=dre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The code is adapted from the Fortran routine from the FNLIB library of the [SLATEC Common Mathematical Library]{@link http://www.netlib.no/netlib/slatec/fnlib/}.
*
* The original code was developed by W. Fullerton of Los Alamos Scientific Laboratory, a governmental institution, and is therefore public domain.
*/var fR=[1276642195630063e-46,-3401102254316749e-45,1025680058010471e-43,-35475981581010704e-43,14292273559424982e-41,-6831888753985767e-39,39628370610464347e-38,-2868042435334643e-35,2683181998482699e-33,-3399615005417722e-31,6221098041892606e-29,-1809129475572494e-26,981082564692473e-23,-1384948176067564e-20,.16663894804518634],pre=fR.length;function hre(e){var t,n,r,o,i;if(e<-1.1||e>1.1)return NaN;for(r=0,o=0,t=2*e,i=0;i<pre;i++)n=r,r=o,o=t*r-n+fR[i];return(o-n)*.5}var mre=hre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The code is adapted from the Fortran routine from the FNLIB library of the [SLATEC Common Mathematical Library]{@link http://www.netlib.no/netlib/fn/d9lgmc.f}.
*
* The original code was developed by W. Fullerton of Los Alamos Scientific Laboratory, a governmental institution, and is therefore public domain.
*/var vre=cR,gre=mre,yre=9490626562425156e-8,bre=3745194030963158e291;function xre(e){return e<10?NaN:e>=bre?0:e<yre?gre(2*vre(10/e,2)-1)/e:1/(e*12)}var Sre=xre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The code is adapted from the Fortran routine from the FNLIB library of the [SLATEC Common Mathematical Library]{@link http://www.netlib.no/netlib/slatec/fnlib/albeta.f}.
*
* The original code was developed by W. Fullerton of Los Alamos Scientific Laboratory, a governmental institution, and is therefore public domain.
*/var wre=KZ,Qw=Qy,p0=Yne,_re=ire,Ere=cre,Sd=mc,Cre=fre,$re=Jn,Jw=Sn,Il=Sre;function Rre(e,t){var n,r,o;return r=Ere(e,t),o=_re(e,t),r<0?NaN:r===0?Jw:o===Jw?$re:r>=10?(n=Il(r)+Il(o)-Il(r+o),-.5*Sd(o)+Cre+n+(r-.5)*Sd(r/(r+o))+o*Qw(-r/(r+o))):o>=10?(n=Il(o)-Il(r+o),wre(r)+n+r-r*Sd(r+o)+(o-.5)*Qw(-r/(r+o))):Sd(p0(r)*(p0(o)/p0(r+o)))}var kre=Rre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pre=kre,Tre=Pre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Zw=kh,e_=cn,Ore=Tre,Ire=ca,t_=mc,n_=Jn;function xg(e,t){return e_(e)||e_(t)?NaN:!Zw(e)||!Zw(t)?NaN:e<0?xg(-e+t-1,t):t<0?n_:t===0?0:t===1?t_(Ire(e)):e<t?n_:e-t<2?xg(e,e-t):-t_(e+1)-Ore(e-t+1,t+1)}var Nre=xg;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Are=Nre,pR=Are;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var r_=D6,Mre=pR,h0=cn,Lre=Qy,Fre=Jy,Dre=mc,Bre=Sn;function zre(e,t,n){var r;return h0(e)||h0(t)||h0(n)||n<0||n>1||!r_(t)||t===Bre?NaN:r_(e)?e>t?0:n===0?e===0?1:0:n===1?e===t?1:0:(r=Mre(t,e),r+=e*Dre(n)+(t-e)*Lre(-n),Fre(r)):0}var jre=zre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Ure(e){return t;function t(){return e}}var Wre=Ure;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hre=Wre,hR=Hre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var o_=cn;function Vre(e,t){return o_(e)||o_(t)?NaN:e===t?1:0}var Gre=Vre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Kre=hR,i_=cn;function Xre(e){if(i_(e))return Kre(NaN);return t;function t(n){return i_(n)?NaN:n===e?1:0}}var Yre=Xre;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qre=Rh,mR=Gre,Qre=Yre;qre(mR,"factory",Qre);var Jre=mR;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var a_=D6,Zre=hR,eoe=pR,s_=Jre.factory,m0=cn,toe=Qy,noe=Jy,roe=mc,ooe=Sn;function ioe(e,t){if(m0(e)||m0(t)||!a_(e)||e===ooe||t<0||t>1)return Zre(NaN);if(t===0||e===0)return s_(0);if(t===1)return s_(e);return n;function n(r){var o;return m0(r)?NaN:a_(r)?r>e?0:(o=eoe(e,r),o+=r*roe(t)+(e-r)*toe(-t),noe(o)):0}}var aoe=ioe;/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var soe=Rh,vR=jre,loe=aoe;soe(vR,"factory",loe);var uoe=vR;const l_=Hu(uoe);function coe(e){var s,l;const t=e.expectedWounds;if(!t)return null;console.log();const n=wV(t),r=_V(t),o=((s=n[0])==null?void 0:s.cumulative_chance)??0,i=((l=r[0])==null?void 0:l.cumulative_chance)??0;let a=[];for(let u=2;u<6;u++)a.push({active:1-l_(0,u,o),reactive:1-l_(0,u,i),retry:u});return G(mn,{sx:{textAlign:"left"},children:[_(st,{variant:"h6",sx:{flexGrow:1},children:"Retries"}),_(st,{variant:"body2",children:"Chance causing at least one wound after:"}),a.map((u,c)=>{let d=Ht(u.active),f=Ht(u.reactive);return G(st,{variant:"body2",children:[" ",u.retry," tries: Active ",d,"% / Reactive ",f,"%"]},c)})]})}var Zy={},doe=xn;Object.defineProperty(Zy,"__esModule",{value:!0});var gR=Zy.default=void 0,foe=doe(Yn()),poe=qn;gR=Zy.default=(0,foe.default)((0,poe.jsx)("path",{d:"M4 6H2v14c0 1.1.9 2 2 2h14v-2H4zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-1 9h-4v4h-2v-4H9V9h4V5h2v4h4z"}),"LibraryAdd");var eb={},hoe=xn;Object.defineProperty(eb,"__esModule",{value:!0});var yR=eb.default=void 0,moe=hoe(Yn()),voe=qn;yR=eb.default=(0,moe.default)((0,voe.jsx)("path",{d:"M21 8H3V4h18zm0 2H3v4h18zm0 6H3v4h18z"}),"TableRows");var tb={},goe=xn;Object.defineProperty(tb,"__esModule",{value:!0});var bR=tb.default=void 0,yoe=goe(Yn()),boe=qn;bR=tb.default=(0,yoe.default)((0,boe.jsx)("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M9 17H7v-7h2zm4 0h-2V7h2zm4 0h-2v-4h2z"}),"Assessment");var nb={},xoe=xn;Object.defineProperty(nb,"__esModule",{value:!0});var xR=nb.default=void 0,Soe=xoe(Yn()),woe=qn;xR=nb.default=(0,Soe.default)((0,woe.jsx)("path",{d:"M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92"}),"Share");var rb={},_oe=xn;Object.defineProperty(rb,"__esModule",{value:!0});var SR=rb.default=void 0,Eoe=_oe(Yn()),Coe=qn;SR=rb.default=(0,Eoe.default)((0,Coe.jsx)("path",{d:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"}),"Delete");var ob={},$oe=xn;Object.defineProperty(ob,"__esModule",{value:!0});var wR=ob.default=void 0,Roe=$oe(Yn()),koe=qn;wR=ob.default=(0,Roe.default)((0,koe.jsx)("path",{d:"M16.5 3c-.96 0-1.9.25-2.73.69L12 9h3l-3 10 1-9h-3l1.54-5.39C10.47 3.61 9.01 3 7.5 3 4.42 3 2 5.42 2 8.5c0 4.13 4.16 7.18 10 12.5 5.47-4.94 10-8.26 10-12.5C22 5.42 19.58 3 16.5 3"}),"HeartBroken");var ib={},Poe=xn;Object.defineProperty(ib,"__esModule",{value:!0});var _R=ib.default=void 0,Toe=Poe(Yn()),Ooe=qn;_R=ib.default=(0,Toe.default)((0,Ooe.jsx)("path",{d:"m19 8-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4z"}),"Cached");function Ioe(e){const t=[];for(let n in e)t.push(encodeURIComponent(n)+"="+encodeURIComponent(e[n]));return t.join("&")}const Noe={position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",minWidth:400,bgcolor:"background.paper",boxShadow:24,p:4};function Aoe(e){var D;const[t,n]=x.useState(!1),[r,o]=x.useState(!1),[i,a]=x.useState(!1),s=e.activeMaxWounds?e.activeMaxWounds:3,l=e.reactiveMaxWounds?e.reactiveMaxWounds:3,u=e.open,c=e.setClose,d=e.results.expected_wounds,f=e.results.parameters,h=((D=e.results)==null?void 0:D.title)??"Result",v=Kf(Xf(rs(d))),y=Kf(Xf(os(d))),b=Vy(d,s,l),p=Eh(b),m=Ch(b),g=$h(b),w=Ht(pu(g)),C=rs(g),S=os(g),$=Ht(pu(rs(b))),R=Ht(pu(os(b))),k=`https://infinitythecalculator.com/?${Ioe(f)}`,P=`Active (${v} wounds / order):
  Wins F2F: ${$}%${p.map(M=>`
  Causes ${M.wounds}+ wounds: ${Ht(M.cumulative_chance)}%`)}
Failure:
  No wounds caused: ${w}%${C.map(M=>`
  (${Ht(M.chance)}% chance active player causes no wounds)`)}${S.map(M=>`
  (${Ht(M.chance)}% chance reactive player causes no wounds)`)}
Reactive (${y} wounds / order):
  Wins F2F: ${R}%${m.map(M=>`
  Causes ${M.wounds}+ wounds: ${Ht(M.cumulative_chance)}%`)}`,N=[`# ${h}
`,`### Active (${v} wounds / order)
`,p.map(M=>`- ${Ht(M.cumulative_chance)}% chance ${M.wounds} or more wounds.
`).join(""),`### Failure
`,`- ${w}% chance neither player causes wounds.
`,C.map(M=>`(${Ht(M.chance)}% chance active player causes no wounds).
`),S.map(M=>`(${Ht(M.chance)}% chance reactive player causes no wounds).
`),`### Reactive (${y} wounds / order)
`,m.map(M=>`- ${Ht(M.cumulative_chance)}% chance ${M.wounds} or more wounds.
`).join(""),`[Edit this result](${k})`].join("");async function F(M){return"clipboard"in navigator?await navigator.clipboard.writeText(M):document.execCommand("copy",!0,M)}const L=(M,j)=>{F(M).then(()=>{j(!0),setTimeout(()=>{j(!1),c()},1e3)}).catch(B=>{console.log(B)})};return _("div",{children:_(C4,{open:u,onClose:c,"aria-labelledby":"modal-modal-title","aria-describedby":"modal-modal-description",children:G(mn,{sx:Noe,children:[_(st,{id:"modal-modal-title",variant:"h4",component:"h3",sx:{mb:2},children:"Share results"}),_(Qd,{fullWidth:!0,readOnly:!0,label:"Share URL",variant:"filled",value:k}),_(Go,{onClick:()=>L(k,n),children:t?"Copied!":"Copy URL"}),_(mn,{sx:{height:16}}),_(Qd,{fullWidth:!0,multiline:!0,readOnly:!0,label:"Discord optimized text",variant:"filled",maxRows:5,value:N}),_(Go,{onClick:()=>L(N,o),children:r?"Copied!":"Copy Discord text"}),_(mn,{sx:{height:16}}),_(Qd,{fullWidth:!0,multiline:!0,readOnly:!0,label:"Plain text",variant:"filled",maxRows:5,value:P}),_(Go,{onClick:()=>L(P,a),children:i?"Copied!":"Copy plain text"}),_(mn,{sx:{height:16,flexGrow:1}}),_(Go,{onClick:()=>c(),children:"Close share sheet"})]})})})}var ab={},Moe=xn;Object.defineProperty(ab,"__esModule",{value:!0});var ER=ab.default=void 0,Loe=Moe(Yn()),Foe=qn;ER=ab.default=(0,Loe.default)((0,Foe.jsx)("path",{d:"M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7zm-6 .67 2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"}),"SaveAlt");var sb={},Doe=xn;Object.defineProperty(sb,"__esModule",{value:!0});var CR=sb.default=void 0,Boe=Doe(Yn()),zoe=qn;CR=sb.default=(0,Boe.default)((0,zoe.jsx)("path",{d:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"}),"Edit");function joe(e){const t=e.value,n=e.variant,r=e.update,[o,i]=x.useState(!1),[a,s]=x.useState(t),l=f=>{(f.key==="Enter"||f.key==="Escape")&&(i(!1),f.target.blur(),r(a))},u=()=>{r(a),i(!1)},c=()=>{i(!0),s("")},d=f=>f.target.select();return o?G(mn,{style:{display:"flex",flexGrow:1,alignItems:"flex-start"},children:[_(Qd,{sx:{flexGrow:1,textAlign:"left"},fullWidth:!0,className:"MuiTypography-root MuiTypography-h6 MuiTypography-displayInline",value:a,onChange:f=>s(f.target.value),onKeyDown:l,onFocus:d}),_(st,{variant:n,style:{display:"none"}}),_(ar,{color:"inherit",size:"small",onClick:u,children:_(ER,{})})]}):G("div",{style:{display:"flex",alignItems:"flex-start",flexGrow:1},children:[_(st,{variant:n,display:"inline",sx:{flexGrow:1,textAlign:"left"},children:t}),_(ar,{size:"small",onClick:c,children:_(CR,{})})]})}const u_=X(e=>{const{expand:t,...n}=e;return _(ar,{...n})})(({theme:e,expand:t})=>({transform:t?"rotate(90deg)":"rotate(0deg)",marginLeft:"auto",transition:e.transitions.create("transform",{duration:e.transitions.duration.shortest})}));function c_(e){var I;if(!e.f2fResults)return null;const t=e.f2fResults.expected_wounds,n=e.f2fResults.face_to_face,r=e.f2fResults.parameters,o=e.addToCompare,i=e.variant??"result",a=e.index??"",s=e.changeName?e.changeName:()=>{},l=e.remove?e.remove:()=>{};let u;(I=e.f2fResults)!=null&&I.title?u=e.f2fResults.title:i!=="result"&&a!==""?u=`Saved result ${a+1}`:u="Result";const[c,d]=x.useState(!0),[f,h]=x.useState(i==="result"),[v,y]=x.useState(!1),[b,p]=x.useState(!1),m=()=>{d(!c)},g=()=>{h(!f)},w=()=>{y(!v)},C=()=>{p(!b)},[S,$]=x.useState(3),[R,k]=x.useState(3),P=z=>{$(z.target.value)},N=z=>{k(z.target.value)},[F,L]=x.useState(!1),D=()=>L(!0),M=()=>L(!1);let j=`B${r.burstA} ${r.dtwVsDodge?"DTW":"SV"+r.successValueA} ${r.ammoA!=="DODGE"?"DAM"+r.damageA:""} ${r.ammoA!=="N"?r.ammoA:""}  ${r.contA?"CONT":""} ARM${r.armA} ${r.critImmuneA?"CRIT_IMMUNE":""}`,B=`B${r.burstB} ${r.burstB!==0?"SV"+r.successValueB:""} ${r.ammoB!=="DODGE"&&r.burstB!==0?"DAM"+r.damageB:""} ${r.ammoB!=="N"?r.ammoB:""} ${r.contB?"CONT":""} ARM${r.armB} ${r.critImmuneB?"CRIT_IMMUNE":""}`;return G(Ov,{children:[_(Ua,{children:_(mn,{sx:{display:"flex",flexDirection:"row",flexGrow:1},children:_(joe,{sx:{flexGrow:1},variant:"h6",value:u,update:s})})}),G(GF,{sx:{pl:2,pr:2},children:[G(mn,{sx:{display:"flex",flexDirection:"row",justifyContent:"space-between",flexWrap:"wrap"},children:[_(st,{sx:{whiteSpace:"nowrap"},variant:"overline",children:j}),_(st,{sx:{whiteSpace:"nowrap",alignSelf:"end"},variant:"overline",children:B})]}),G(qc,{in:c,timeout:"auto",children:[_(st,{sx:{textAlign:"left"},children:"Face to face"}),_(kV,{rows:n}),_(st,{sx:{mt:1,textAlign:"left"},children:"Expected wounds"}),_(CV,{rows:t,activeMaxWounds:S,reactiveMaxWounds:R})]})]}),_(qc,{in:f,timeout:"auto",children:_(Ua,{children:_(RV,{rows:t,activeMaxWounds:S,reactiveMaxWounds:R})})}),_(qc,{in:b,children:_(Ua,{children:_(coe,{expectedWounds:t})})}),_(qc,{in:v,timeout:"auto",children:G(Ua,{children:[G(Iv,{sx:{m:1,minWidth:135},size:"small",children:[_(qr,{id:"active-max-wounds",children:"Active Max Wounds"}),G(Lv,{labelId:"demo-select-small-label",id:"demo-select-small",value:S,label:"Active max wounds",onChange:P,children:[_(Zn,{value:1,children:"1"}),_(Zn,{value:2,children:"2"}),_(Zn,{value:3,children:"3"}),_(Zn,{value:4,children:"4"}),_(Zn,{value:5,children:"5"}),_(Zn,{value:100,children:"No limit"})]})]}),G(Iv,{sx:{m:1,minWidth:135},size:"small",children:[_(qr,{id:"demo-select-small-label",children:"Reactive Max Wounds"}),G(Lv,{labelId:"demo-select-small-label",id:"demo-select-small",value:R,label:"Active max wounds",onChange:N,children:[_(Zn,{value:1,children:"1"}),_(Zn,{value:2,children:"2"}),_(Zn,{value:3,children:"3"}),_(Zn,{value:4,children:"4"}),_(Zn,{value:5,children:"5"}),_(Zn,{value:100,children:"No limit"})]})]})]})}),G(NF,{children:[_(ar,{onClick:D,size:"small",children:_(pn,{title:"Share results",children:_(xR,{})})}),i==="result"&&_(pn,{title:"Add result to comparison list",children:_(ar,{onClick:o,size:"small",children:_(gR,{})})}),i==="list"&&_(pn,{title:"Delete from comparison list",children:_(ar,{onClick:()=>l(e.f2fResults.id),children:_(SR,{})})}),_(ar,{onClick:w,children:_(pn,{title:"Set maximum wounds",children:_(wR,{})})}),_(ar,{onClick:C,children:_(pn,{title:"Retry face to face",children:_(_R,{})})}),_(mn,{sx:{flexGrow:1}}),_(u_,{expand:c,onClick:m,"aria-expanded":f,"aria-label":"show more",children:_(pn,{title:"Show / hide face to face result graph",children:_(bR,{})})}),_(u_,{expand:f,onClick:g,"aria-expanded":f,"aria-label":"show more",children:_(pn,{title:"Show / hide face to face result table",children:_(yR,{})})})]}),_(Aoe,{open:F,setClose:M,results:e.f2fResults,activeMaxWounds:S,reactiveMaxWounds:R})]})}function d_(e){const t=e.variant??"active",n=t==="active"?"primary":"secondary",r=e.critImmune,o=e.dtwVsDodge,i=e.update,a=e.updateDtw,s=e.fixedFaceToFace,l=e.updateFixedFaceToFace;return G(ur,{children:[_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(qr,{sx:{mt:1},children:"Other"})}),_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(Om,{label:"Immunity (Critical)",control:_(Pm,{color:n,checked:r,onChange:f=>{i(f.target.checked)}})})}),t==="active"?_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(Om,{label:"Direct Template Weapon",control:_(Pm,{color:n,checked:o,onChange:f=>{a(f.target.checked)}})})}):_(ur,{}),t==="reactive"?_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(Om,{label:"Fixed value die (AC2)",control:_(Pm,{color:n,checked:s,onChange:f=>{l(f.target.checked)}})})}):_(ur,{})]})}function Yf({bts:e,update:t,variant:n}){const i=s=>{let l=Number(s);isNaN(l)||(l=Vt(0,12,l),t(l))};return G(ur,{children:[_(Te,{item:!0,xs:12,sx:{display:"flex",justifyContent:"left"},children:_(pn,{title:"BTS value. This box only shows if plasma ammo is used.",children:_(qr,{sx:{mt:1},children:"BTS"})})}),_(Te,{item:!0,xs:2,sx:{display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"8px 8px 8px 8px",p:1},children:_(fc,{value:e,onBlur:s=>i(s.target.value),variant:n},e)}),_(Te,{item:!0,xs:1}),_(Te,{item:!0,xs:9,sx:{display:"flex",justifyContent:"left"},children:_(_h,{value:e,update:t,min:0,max:12,variant:n,icon:_(ci,{icon:mV,style:{paddingLeft:4,paddingRight:4,alignSelf:"center"},className:"fa-xl"})})})]})}Yf.propTypes={bts:ve.number,update:ve.func,variant:ve.string};Yf.defaultProps={variant:"active"};/**
 * @remix-run/router v1.20.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function yt(){return yt=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},yt.apply(this,arguments)}var Ot;(function(e){e.Pop="POP",e.Push="PUSH",e.Replace="REPLACE"})(Ot||(Ot={}));const f_="popstate";function Uoe(e){e===void 0&&(e={});function t(r,o){let{pathname:i,search:a,hash:s}=r.location;return ju("",{pathname:i,search:a,hash:s},o.state&&o.state.usr||null,o.state&&o.state.key||"default")}function n(r,o){return typeof o=="string"?o:ea(o)}return Hoe(t,n,null,e)}function Ne(e,t){if(e===!1||e===null||typeof e>"u")throw new Error(t)}function Ps(e,t){if(!e){typeof console<"u"&&console.warn(t);try{throw new Error(t)}catch{}}}function Woe(){return Math.random().toString(36).substr(2,8)}function p_(e,t){return{usr:e.state,key:e.key,idx:t}}function ju(e,t,n,r){return n===void 0&&(n=null),yt({pathname:typeof e=="string"?e:e.pathname,search:"",hash:""},typeof t=="string"?Po(t):t,{state:n,key:t&&t.key||r||Woe()})}function ea(e){let{pathname:t="/",search:n="",hash:r=""}=e;return n&&n!=="?"&&(t+=n.charAt(0)==="?"?n:"?"+n),r&&r!=="#"&&(t+=r.charAt(0)==="#"?r:"#"+r),t}function Po(e){let t={};if(e){let n=e.indexOf("#");n>=0&&(t.hash=e.substr(n),e=e.substr(0,n));let r=e.indexOf("?");r>=0&&(t.search=e.substr(r),e=e.substr(0,r)),e&&(t.pathname=e)}return t}function Hoe(e,t,n,r){r===void 0&&(r={});let{window:o=document.defaultView,v5Compat:i=!1}=r,a=o.history,s=Ot.Pop,l=null,u=c();u==null&&(u=0,a.replaceState(yt({},a.state,{idx:u}),""));function c(){return(a.state||{idx:null}).idx}function d(){s=Ot.Pop;let b=c(),p=b==null?null:b-u;u=b,l&&l({action:s,location:y.location,delta:p})}function f(b,p){s=Ot.Push;let m=ju(y.location,b,p);n&&n(m,b),u=c()+1;let g=p_(m,u),w=y.createHref(m);try{a.pushState(g,"",w)}catch(C){if(C instanceof DOMException&&C.name==="DataCloneError")throw C;o.location.assign(w)}i&&l&&l({action:s,location:y.location,delta:1})}function h(b,p){s=Ot.Replace;let m=ju(y.location,b,p);n&&n(m,b),u=c();let g=p_(m,u),w=y.createHref(m);a.replaceState(g,"",w),i&&l&&l({action:s,location:y.location,delta:0})}function v(b){let p=o.location.origin!=="null"?o.location.origin:o.location.href,m=typeof b=="string"?b:ea(b);return m=m.replace(/ $/,"%20"),Ne(p,"No window.location.(origin|href) available to create URL for href: "+m),new URL(m,p)}let y={get action(){return s},get location(){return e(o,a)},listen(b){if(l)throw new Error("A history only accepts one active listener");return o.addEventListener(f_,d),l=b,()=>{o.removeEventListener(f_,d),l=null}},createHref(b){return t(o,b)},createURL:v,encodeLocation(b){let p=v(b);return{pathname:p.pathname,search:p.search,hash:p.hash}},push:f,replace:h,go(b){return a.go(b)}};return y}var ot;(function(e){e.data="data",e.deferred="deferred",e.redirect="redirect",e.error="error"})(ot||(ot={}));const Voe=new Set(["lazy","caseSensitive","path","id","index","children"]);function Goe(e){return e.index===!0}function qf(e,t,n,r){return n===void 0&&(n=[]),r===void 0&&(r={}),e.map((o,i)=>{let a=[...n,String(i)],s=typeof o.id=="string"?o.id:a.join("-");if(Ne(o.index!==!0||!o.children,"Cannot specify children on an index route"),Ne(!r[s],'Found a route id collision on id "'+s+`".  Route id's must be globally unique within Data Router usages`),Goe(o)){let l=yt({},o,t(o),{id:s});return r[s]=l,l}else{let l=yt({},o,t(o),{id:s,children:void 0});return r[s]=l,o.children&&(l.children=qf(o.children,t,a,r)),l}})}function Ri(e,t,n){return n===void 0&&(n="/"),ef(e,t,n,!1)}function ef(e,t,n,r){let o=typeof t=="string"?Po(t):t,i=Co(o.pathname||"/",n);if(i==null)return null;let a=$R(e);Xoe(a);let s=null;for(let l=0;s==null&&l<a.length;++l){let u=iie(i);s=rie(a[l],u,r)}return s}function Koe(e,t){let{route:n,pathname:r,params:o}=e;return{id:n.id,pathname:r,params:o,data:t[n.id],handle:n.handle}}function $R(e,t,n,r){t===void 0&&(t=[]),n===void 0&&(n=[]),r===void 0&&(r="");let o=(i,a,s)=>{let l={relativePath:s===void 0?i.path||"":s,caseSensitive:i.caseSensitive===!0,childrenIndex:a,route:i};l.relativePath.startsWith("/")&&(Ne(l.relativePath.startsWith(r),'Absolute route path "'+l.relativePath+'" nested under path '+('"'+r+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),l.relativePath=l.relativePath.slice(r.length));let u=ho([r,l.relativePath]),c=n.concat(l);i.children&&i.children.length>0&&(Ne(i.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+u+'".')),$R(i.children,t,c,u)),!(i.path==null&&!i.index)&&t.push({path:u,score:tie(u,i.index),routesMeta:c})};return e.forEach((i,a)=>{var s;if(i.path===""||!((s=i.path)!=null&&s.includes("?")))o(i,a);else for(let l of RR(i.path))o(i,a,l)}),t}function RR(e){let t=e.split("/");if(t.length===0)return[];let[n,...r]=t,o=n.endsWith("?"),i=n.replace(/\?$/,"");if(r.length===0)return o?[i,""]:[i];let a=RR(r.join("/")),s=[];return s.push(...a.map(l=>l===""?i:[i,l].join("/"))),o&&s.push(...a),s.map(l=>e.startsWith("/")&&l===""?"/":l)}function Xoe(e){e.sort((t,n)=>t.score!==n.score?n.score-t.score:nie(t.routesMeta.map(r=>r.childrenIndex),n.routesMeta.map(r=>r.childrenIndex)))}const Yoe=/^:[\w-]+$/,qoe=3,Qoe=2,Joe=1,Zoe=10,eie=-2,h_=e=>e==="*";function tie(e,t){let n=e.split("/"),r=n.length;return n.some(h_)&&(r+=eie),t&&(r+=Qoe),n.filter(o=>!h_(o)).reduce((o,i)=>o+(Yoe.test(i)?qoe:i===""?Joe:Zoe),r)}function nie(e,t){return e.length===t.length&&e.slice(0,-1).every((r,o)=>r===t[o])?e[e.length-1]-t[t.length-1]:0}function rie(e,t,n){n===void 0&&(n=!1);let{routesMeta:r}=e,o={},i="/",a=[];for(let s=0;s<r.length;++s){let l=r[s],u=s===r.length-1,c=i==="/"?t:t.slice(i.length)||"/",d=Qf({path:l.relativePath,caseSensitive:l.caseSensitive,end:u},c),f=l.route;if(!d&&u&&n&&!r[r.length-1].route.index&&(d=Qf({path:l.relativePath,caseSensitive:l.caseSensitive,end:!1},c)),!d)return null;Object.assign(o,d.params),a.push({params:o,pathname:ho([i,d.pathname]),pathnameBase:lie(ho([i,d.pathnameBase])),route:f}),d.pathnameBase!=="/"&&(i=ho([i,d.pathnameBase]))}return a}function Qf(e,t){typeof e=="string"&&(e={path:e,caseSensitive:!1,end:!0});let[n,r]=oie(e.path,e.caseSensitive,e.end),o=t.match(n);if(!o)return null;let i=o[0],a=i.replace(/(.)\/+$/,"$1"),s=o.slice(1);return{params:r.reduce((u,c,d)=>{let{paramName:f,isOptional:h}=c;if(f==="*"){let y=s[d]||"";a=i.slice(0,i.length-y.length).replace(/(.)\/+$/,"$1")}const v=s[d];return h&&!v?u[f]=void 0:u[f]=(v||"").replace(/%2F/g,"/"),u},{}),pathname:i,pathnameBase:a,pattern:e}}function oie(e,t,n){t===void 0&&(t=!1),n===void 0&&(n=!0),Ps(e==="*"||!e.endsWith("*")||e.endsWith("/*"),'Route path "'+e+'" will be treated as if it were '+('"'+e.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+e.replace(/\*$/,"/*")+'".'));let r=[],o="^"+e.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(a,s,l)=>(r.push({paramName:s,isOptional:l!=null}),l?"/?([^\\/]+)?":"/([^\\/]+)"));return e.endsWith("*")?(r.push({paramName:"*"}),o+=e==="*"||e==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):n?o+="\\/*$":e!==""&&e!=="/"&&(o+="(?:(?=\\/|$))"),[new RegExp(o,t?void 0:"i"),r]}function iie(e){try{return e.split("/").map(t=>decodeURIComponent(t).replace(/\//g,"%2F")).join("/")}catch(t){return Ps(!1,'The URL path "'+e+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+t+").")),e}}function Co(e,t){if(t==="/")return e;if(!e.toLowerCase().startsWith(t.toLowerCase()))return null;let n=t.endsWith("/")?t.length-1:t.length,r=e.charAt(n);return r&&r!=="/"?null:e.slice(n)||"/"}function aie(e,t){t===void 0&&(t="/");let{pathname:n,search:r="",hash:o=""}=typeof e=="string"?Po(e):e;return{pathname:n?n.startsWith("/")?n:sie(n,t):t,search:uie(r),hash:cie(o)}}function sie(e,t){let n=t.replace(/\/+$/,"").split("/");return e.split("/").forEach(o=>{o===".."?n.length>1&&n.pop():o!=="."&&n.push(o)}),n.length>1?n.join("/"):"/"}function v0(e,t,n,r){return"Cannot include a '"+e+"' character in a manually specified "+("`to."+t+"` field ["+JSON.stringify(r)+"].  Please separate it out to the ")+("`to."+n+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function kR(e){return e.filter((t,n)=>n===0||t.route.path&&t.route.path.length>0)}function Ah(e,t){let n=kR(e);return t?n.map((r,o)=>o===n.length-1?r.pathname:r.pathnameBase):n.map(r=>r.pathnameBase)}function Mh(e,t,n,r){r===void 0&&(r=!1);let o;typeof e=="string"?o=Po(e):(o=yt({},e),Ne(!o.pathname||!o.pathname.includes("?"),v0("?","pathname","search",o)),Ne(!o.pathname||!o.pathname.includes("#"),v0("#","pathname","hash",o)),Ne(!o.search||!o.search.includes("#"),v0("#","search","hash",o)));let i=e===""||o.pathname==="",a=i?"/":o.pathname,s;if(a==null)s=n;else{let d=t.length-1;if(!r&&a.startsWith("..")){let f=a.split("/");for(;f[0]==="..";)f.shift(),d-=1;o.pathname=f.join("/")}s=d>=0?t[d]:"/"}let l=aie(o,s),u=a&&a!=="/"&&a.endsWith("/"),c=(i||a===".")&&n.endsWith("/");return!l.pathname.endsWith("/")&&(u||c)&&(l.pathname+="/"),l}const ho=e=>e.join("/").replace(/\/\/+/g,"/"),lie=e=>e.replace(/\/+$/,"").replace(/^\/*/,"/"),uie=e=>!e||e==="?"?"":e.startsWith("?")?e:"?"+e,cie=e=>!e||e==="#"?"":e.startsWith("#")?e:"#"+e;class Jf{constructor(t,n,r,o){o===void 0&&(o=!1),this.status=t,this.statusText=n||"",this.internal=o,r instanceof Error?(this.data=r.toString(),this.error=r):this.data=r}}function Lh(e){return e!=null&&typeof e.status=="number"&&typeof e.statusText=="string"&&typeof e.internal=="boolean"&&"data"in e}const PR=["post","put","patch","delete"],die=new Set(PR),fie=["get",...PR],pie=new Set(fie),hie=new Set([301,302,303,307,308]),mie=new Set([307,308]),g0={state:"idle",location:void 0,formMethod:void 0,formAction:void 0,formEncType:void 0,formData:void 0,json:void 0,text:void 0},vie={state:"idle",data:void 0,formMethod:void 0,formAction:void 0,formEncType:void 0,formData:void 0,json:void 0,text:void 0},Nl={state:"unblocked",proceed:void 0,reset:void 0,location:void 0},lb=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,gie=e=>({hasErrorBoundary:!!e.hasErrorBoundary}),TR="remix-router-transitions";function yie(e){const t=e.window?e.window:typeof window<"u"?window:void 0,n=typeof t<"u"&&typeof t.document<"u"&&typeof t.document.createElement<"u",r=!n;Ne(e.routes.length>0,"You must provide a non-empty routes array to createRouter");let o;if(e.mapRouteProperties)o=e.mapRouteProperties;else if(e.detectErrorBoundary){let T=e.detectErrorBoundary;o=O=>({hasErrorBoundary:T(O)})}else o=gie;let i={},a=qf(e.routes,o,void 0,i),s,l=e.basename||"/",u=e.dataStrategy||wie,c=e.patchRoutesOnNavigation,d=yt({v7_fetcherPersist:!1,v7_normalizeFormMethod:!1,v7_partialHydration:!1,v7_prependBasename:!1,v7_relativeSplatPath:!1,v7_skipActionErrorRevalidation:!1},e.future),f=null,h=new Set,v=null,y=null,b=null,p=e.hydrationData!=null,m=Ri(a,e.history.location,l),g=null;if(m==null&&!c){let T=wn(404,{pathname:e.history.location.pathname}),{matches:O,route:A}=C_(a);m=O,g={[A.id]:T}}m&&!e.hydrationData&&ma(m,a,e.history.location.pathname).active&&(m=null);let w;if(m)if(m.some(T=>T.route.lazy))w=!1;else if(!m.some(T=>T.route.loader))w=!0;else if(d.v7_partialHydration){let T=e.hydrationData?e.hydrationData.loaderData:null,O=e.hydrationData?e.hydrationData.errors:null;if(O){let A=m.findIndex(U=>O[U.route.id]!==void 0);w=m.slice(0,A+1).every(U=>!wg(U.route,T,O))}else w=m.every(A=>!wg(A.route,T,O))}else w=e.hydrationData!=null;else if(w=!1,m=[],d.v7_partialHydration){let T=ma(null,a,e.history.location.pathname);T.active&&T.matches&&(m=T.matches)}let C,S={historyAction:e.history.action,location:e.history.location,matches:m,initialized:w,navigation:g0,restoreScrollPosition:e.hydrationData!=null?!1:null,preventScrollReset:!1,revalidation:"idle",loaderData:e.hydrationData&&e.hydrationData.loaderData||{},actionData:e.hydrationData&&e.hydrationData.actionData||null,errors:e.hydrationData&&e.hydrationData.errors||g,fetchers:new Map,blockers:new Map},$=Ot.Pop,R=!1,k,P=!1,N=new Map,F=null,L=!1,D=!1,M=[],j=new Set,B=new Map,I=0,z=-1,H=new Map,le=new Set,ae=new Map,ye=new Map,J=new Set,he=new Map,V=new Map,me;function we(){if(f=e.history.listen(T=>{let{action:O,location:A,delta:U}=T;if(me){me(),me=void 0;return}Ps(V.size===0||U!=null,"You are trying to use a blocker on a POP navigation to a location that was not created by @remix-run/router. This will fail silently in production. This can happen if you are navigating outside the router via `window.history.pushState`/`window.location.hash` instead of using router navigation APIs.  This can also happen if you are using createHashRouter and the user manually changes the URL.");let Q=_c({currentLocation:S.location,nextLocation:A,historyAction:O});if(Q&&U!=null){let fe=new Promise(be=>{me=be});e.history.go(U*-1),bi(Q,{state:"blocked",location:A,proceed(){bi(Q,{state:"proceeding",proceed:void 0,reset:void 0,location:A}),fe.then(()=>e.history.go(U))},reset(){let be=new Map(S.blockers);be.set(Q,Nl),ie({blockers:be})}});return}return Z(O,A)}),n){Lie(t,N);let T=()=>Fie(t,N);t.addEventListener("pagehide",T),F=()=>t.removeEventListener("pagehide",T)}return S.initialized||Z(Ot.Pop,S.location,{initialHydration:!0}),C}function Se(){f&&f(),F&&F(),h.clear(),k&&k.abort(),S.fetchers.forEach((T,O)=>Je(O)),S.blockers.forEach((T,O)=>Zr(O))}function Fe(T){return h.add(T),()=>h.delete(T)}function ie(T,O){O===void 0&&(O={}),S=yt({},S,T);let A=[],U=[];d.v7_fetcherPersist&&S.fetchers.forEach((Q,fe)=>{Q.state==="idle"&&(J.has(fe)?U.push(fe):A.push(fe))}),[...h].forEach(Q=>Q(S,{deletedFetchers:U,viewTransitionOpts:O.viewTransitionOpts,flushSync:O.flushSync===!0})),d.v7_fetcherPersist&&(A.forEach(Q=>S.fetchers.delete(Q)),U.forEach(Q=>Je(Q)))}function Oe(T,O,A){var U,Q;let{flushSync:fe}=A===void 0?{}:A,be=S.actionData!=null&&S.navigation.formMethod!=null&&$r(S.navigation.formMethod)&&S.navigation.state==="loading"&&((U=T.state)==null?void 0:U._isRedirect)!==!0,ne;O.actionData?Object.keys(O.actionData).length>0?ne=O.actionData:ne=null:be?ne=S.actionData:ne=null;let oe=O.loaderData?__(S.loaderData,O.loaderData,O.matches||[],O.errors):S.loaderData,ee=S.blockers;ee.size>0&&(ee=new Map(ee),ee.forEach((ze,zt)=>ee.set(zt,Nl)));let de=R===!0||S.navigation.formMethod!=null&&$r(S.navigation.formMethod)&&((Q=T.state)==null?void 0:Q._isRedirect)!==!0;s&&(a=s,s=void 0),L||$===Ot.Pop||($===Ot.Push?e.history.push(T,T.state):$===Ot.Replace&&e.history.replace(T,T.state));let Ae;if($===Ot.Pop){let ze=N.get(S.location.pathname);ze&&ze.has(T.pathname)?Ae={currentLocation:S.location,nextLocation:T}:N.has(T.pathname)&&(Ae={currentLocation:T,nextLocation:S.location})}else if(P){let ze=N.get(S.location.pathname);ze?ze.add(T.pathname):(ze=new Set([T.pathname]),N.set(S.location.pathname,ze)),Ae={currentLocation:S.location,nextLocation:T}}ie(yt({},O,{actionData:ne,loaderData:oe,historyAction:$,location:T,initialized:!0,navigation:g0,revalidation:"idle",restoreScrollPosition:tl(T,O.matches||S.matches),preventScrollReset:de,blockers:ee}),{viewTransitionOpts:Ae,flushSync:fe===!0}),$=Ot.Pop,R=!1,P=!1,L=!1,D=!1,M=[]}async function ge(T,O){if(typeof T=="number"){e.history.go(T);return}let A=Sg(S.location,S.matches,l,d.v7_prependBasename,T,d.v7_relativeSplatPath,O==null?void 0:O.fromRouteId,O==null?void 0:O.relative),{path:U,submission:Q,error:fe}=m_(d.v7_normalizeFormMethod,!1,A,O),be=S.location,ne=ju(S.location,U,O&&O.state);ne=yt({},ne,e.history.encodeLocation(ne));let oe=O&&O.replace!=null?O.replace:void 0,ee=Ot.Push;oe===!0?ee=Ot.Replace:oe===!1||Q!=null&&$r(Q.formMethod)&&Q.formAction===S.location.pathname+S.location.search&&(ee=Ot.Replace);let de=O&&"preventScrollReset"in O?O.preventScrollReset===!0:void 0,Ae=(O&&O.flushSync)===!0,ze=_c({currentLocation:be,nextLocation:ne,historyAction:ee});if(ze){bi(ze,{state:"blocked",location:ne,proceed(){bi(ze,{state:"proceeding",proceed:void 0,reset:void 0,location:ne}),ge(T,O)},reset(){let zt=new Map(S.blockers);zt.set(ze,Nl),ie({blockers:zt})}});return}return await Z(ee,ne,{submission:Q,pendingError:fe,preventScrollReset:de,replace:O&&O.replace,enableViewTransition:O&&O.viewTransition,flushSync:Ae})}function $e(){if(je(),ie({revalidation:"loading"}),S.navigation.state!=="submitting"){if(S.navigation.state==="idle"){Z(S.historyAction,S.location,{startUninterruptedRevalidation:!0});return}Z($||S.historyAction,S.navigation.location,{overrideNavigation:S.navigation,enableViewTransition:P===!0})}}async function Z(T,O,A){k&&k.abort(),k=null,$=T,L=(A&&A.startUninterruptedRevalidation)===!0,Cc(S.location,S.matches),R=(A&&A.preventScrollReset)===!0,P=(A&&A.enableViewTransition)===!0;let U=s||a,Q=A&&A.overrideNavigation,fe=Ri(U,O,l),be=(A&&A.flushSync)===!0,ne=ma(fe,U,O.pathname);if(ne.active&&ne.matches&&(fe=ne.matches),!fe){let{error:rt,notFoundMatches:He,route:ce}=Js(O.pathname);Oe(O,{matches:He,loaderData:{},errors:{[ce.id]:rt}},{flushSync:be});return}if(S.initialized&&!D&&kie(S.location,O)&&!(A&&A.submission&&$r(A.submission.formMethod))){Oe(O,{matches:fe},{flushSync:be});return}k=new AbortController;let oe=ka(e.history,O,k.signal,A&&A.submission),ee;if(A&&A.pendingError)ee=[ki(fe).route.id,{type:ot.error,error:A.pendingError}];else if(A&&A.submission&&$r(A.submission.formMethod)){let rt=await Le(oe,O,A.submission,fe,ne.active,{replace:A.replace,flushSync:be});if(rt.shortCircuited)return;if(rt.pendingActionResult){let[He,ce]=rt.pendingActionResult;if(Ln(ce)&&Lh(ce.error)&&ce.error.status===404){k=null,Oe(O,{matches:rt.matches,loaderData:{},errors:{[He]:ce.error}});return}}fe=rt.matches||fe,ee=rt.pendingActionResult,Q=y0(O,A.submission),be=!1,ne.active=!1,oe=ka(e.history,oe.url,oe.signal)}let{shortCircuited:de,matches:Ae,loaderData:ze,errors:zt}=await Ue(oe,O,fe,ne.active,Q,A&&A.submission,A&&A.fetcherSubmission,A&&A.replace,A&&A.initialHydration===!0,be,ee);de||(k=null,Oe(O,yt({matches:Ae||fe},E_(ee),{loaderData:ze,errors:zt})))}async function Le(T,O,A,U,Q,fe){fe===void 0&&(fe={}),je();let be=Aie(O,A);if(ie({navigation:be},{flushSync:fe.flushSync===!0}),Q){let ee=await va(U,O.pathname,T.signal);if(ee.type==="aborted")return{shortCircuited:!0};if(ee.type==="error"){let de=ki(ee.partialMatches).route.id;return{matches:ee.partialMatches,pendingActionResult:[de,{type:ot.error,error:ee.error}]}}else if(ee.matches)U=ee.matches;else{let{notFoundMatches:de,error:Ae,route:ze}=Js(O.pathname);return{matches:de,pendingActionResult:[ze.id,{type:ot.error,error:Ae}]}}}let ne,oe=Xl(U,O);if(!oe.route.action&&!oe.route.lazy)ne={type:ot.error,error:wn(405,{method:T.method,pathname:O.pathname,routeId:oe.route.id})};else if(ne=(await q("action",S,T,[oe],U,null))[oe.route.id],T.signal.aborted)return{shortCircuited:!0};if(Li(ne)){let ee;return fe&&fe.replace!=null?ee=fe.replace:ee=x_(ne.response.headers.get("Location"),new URL(T.url),l)===S.location.pathname+S.location.search,await Be(T,ne,!0,{submission:A,replace:ee}),{shortCircuited:!0}}if(Yo(ne))throw wn(400,{type:"defer-action"});if(Ln(ne)){let ee=ki(U,oe.route.id);return(fe&&fe.replace)!==!0&&($=Ot.Push),{matches:U,pendingActionResult:[ee.route.id,ne]}}return{matches:U,pendingActionResult:[oe.route.id,ne]}}async function Ue(T,O,A,U,Q,fe,be,ne,oe,ee,de){let Ae=Q||y0(O,fe),ze=fe||be||R_(Ae),zt=!L&&(!d.v7_partialHydration||!oe);if(U){if(zt){let $t=qe(de);ie(yt({navigation:Ae},$t!==void 0?{actionData:$t}:{}),{flushSync:ee})}let Ge=await va(A,O.pathname,T.signal);if(Ge.type==="aborted")return{shortCircuited:!0};if(Ge.type==="error"){let $t=ki(Ge.partialMatches).route.id;return{matches:Ge.partialMatches,loaderData:{},errors:{[$t]:Ge.error}}}else if(Ge.matches)A=Ge.matches;else{let{error:$t,notFoundMatches:ga,route:il}=Js(O.pathname);return{matches:ga,loaderData:{},errors:{[il.id]:$t}}}}let rt=s||a,[He,ce]=g_(e.history,S,A,ze,O,d.v7_partialHydration&&oe===!0,d.v7_skipActionErrorRevalidation,D,M,j,J,ae,le,rt,l,de);if(Zs(Ge=>!(A&&A.some($t=>$t.route.id===Ge))||He&&He.some($t=>$t.route.id===Ge)),z=++I,He.length===0&&ce.length===0){let Ge=We();return Oe(O,yt({matches:A,loaderData:{},errors:de&&Ln(de[1])?{[de[0]]:de[1].error}:null},E_(de),Ge?{fetchers:new Map(S.fetchers)}:{}),{flushSync:ee}),{shortCircuited:!0}}if(zt){let Ge={};if(!U){Ge.navigation=Ae;let $t=qe(de);$t!==void 0&&(Ge.actionData=$t)}ce.length>0&&(Ge.fetchers=ut(ce)),ie(Ge,{flushSync:ee})}ce.forEach(Ge=>{Ct(Ge.key),Ge.controller&&B.set(Ge.key,Ge.controller)});let Lt=()=>ce.forEach(Ge=>Ct(Ge.key));k&&k.signal.addEventListener("abort",Lt);let{loaderResults:rl,fetcherResults:eo}=await Ie(S,A,He,ce,T);if(T.signal.aborted)return{shortCircuited:!0};k&&k.signal.removeEventListener("abort",Lt),ce.forEach(Ge=>B.delete(Ge.key));let Mr=wd(rl);if(Mr)return await Be(T,Mr.result,!0,{replace:ne}),{shortCircuited:!0};if(Mr=wd(eo),Mr)return le.add(Mr.key),await Be(T,Mr.result,!0,{replace:ne}),{shortCircuited:!0};let{loaderData:Gh,errors:ol}=w_(S,A,rl,de,ce,eo,he);he.forEach((Ge,$t)=>{Ge.subscribe(ga=>{(ga||Ge.done)&&he.delete($t)})}),d.v7_partialHydration&&oe&&S.errors&&(ol=yt({},S.errors,ol));let xi=We(),$c=ct(z),Rc=xi||$c||ce.length>0;return yt({matches:A,loaderData:Gh,errors:ol},Rc?{fetchers:new Map(S.fetchers)}:{})}function qe(T){if(T&&!Ln(T[1]))return{[T[0]]:T[1].data};if(S.actionData)return Object.keys(S.actionData).length===0?null:S.actionData}function ut(T){return T.forEach(O=>{let A=S.fetchers.get(O.key),U=Al(void 0,A?A.data:void 0);S.fetchers.set(O.key,U)}),new Map(S.fetchers)}function De(T,O,A,U){if(r)throw new Error("router.fetch() was called during the server render, but it shouldn't be. You are likely calling a useFetcher() method in the body of your component. Try moving it to a useEffect or a callback.");Ct(T);let Q=(U&&U.flushSync)===!0,fe=s||a,be=Sg(S.location,S.matches,l,d.v7_prependBasename,A,d.v7_relativeSplatPath,O,U==null?void 0:U.relative),ne=Ri(fe,be,l),oe=ma(ne,fe,be);if(oe.active&&oe.matches&&(ne=oe.matches),!ne){Re(T,O,wn(404,{pathname:be}),{flushSync:Q});return}let{path:ee,submission:de,error:Ae}=m_(d.v7_normalizeFormMethod,!0,be,U);if(Ae){Re(T,O,Ae,{flushSync:Q});return}let ze=Xl(ne,ee),zt=(U&&U.preventScrollReset)===!0;if(de&&$r(de.formMethod)){Pe(T,O,ee,ze,ne,oe.active,Q,zt,de);return}ae.set(T,{routeId:O,path:ee}),Ze(T,O,ee,ze,ne,oe.active,Q,zt,de)}async function Pe(T,O,A,U,Q,fe,be,ne,oe){je(),ae.delete(T);function ee(Ft){if(!Ft.route.action&&!Ft.route.lazy){let ya=wn(405,{method:oe.formMethod,pathname:A,routeId:O});return Re(T,O,ya,{flushSync:be}),!0}return!1}if(!fe&&ee(U))return;let de=S.fetchers.get(T);Qe(T,Mie(oe,de),{flushSync:be});let Ae=new AbortController,ze=ka(e.history,A,Ae.signal,oe);if(fe){let Ft=await va(Q,A,ze.signal);if(Ft.type==="aborted")return;if(Ft.type==="error"){Re(T,O,Ft.error,{flushSync:be});return}else if(Ft.matches){if(Q=Ft.matches,U=Xl(Q,A),ee(U))return}else{Re(T,O,wn(404,{pathname:A}),{flushSync:be});return}}B.set(T,Ae);let zt=I,He=(await q("action",S,ze,[U],Q,T))[U.route.id];if(ze.signal.aborted){B.get(T)===Ae&&B.delete(T);return}if(d.v7_fetcherPersist&&J.has(T)){if(Li(He)||Ln(He)){Qe(T,Fo(void 0));return}}else{if(Li(He))if(B.delete(T),z>zt){Qe(T,Fo(void 0));return}else return le.add(T),Qe(T,Al(oe)),Be(ze,He,!1,{fetcherSubmission:oe,preventScrollReset:ne});if(Ln(He)){Re(T,O,He.error);return}}if(Yo(He))throw wn(400,{type:"defer-action"});let ce=S.navigation.location||S.location,Lt=ka(e.history,ce,Ae.signal),rl=s||a,eo=S.navigation.state!=="idle"?Ri(rl,S.navigation.location,l):S.matches;Ne(eo,"Didn't find any matches after fetcher action");let Mr=++I;H.set(T,Mr);let Gh=Al(oe,He.data);S.fetchers.set(T,Gh);let[ol,xi]=g_(e.history,S,eo,oe,ce,!1,d.v7_skipActionErrorRevalidation,D,M,j,J,ae,le,rl,l,[U.route.id,He]);xi.filter(Ft=>Ft.key!==T).forEach(Ft=>{let ya=Ft.key,Ob=S.fetchers.get(ya),Pk=Al(void 0,Ob?Ob.data:void 0);S.fetchers.set(ya,Pk),Ct(ya),Ft.controller&&B.set(ya,Ft.controller)}),ie({fetchers:new Map(S.fetchers)});let $c=()=>xi.forEach(Ft=>Ct(Ft.key));Ae.signal.addEventListener("abort",$c);let{loaderResults:Rc,fetcherResults:Ge}=await Ie(S,eo,ol,xi,Lt);if(Ae.signal.aborted)return;Ae.signal.removeEventListener("abort",$c),H.delete(T),B.delete(T),xi.forEach(Ft=>B.delete(Ft.key));let $t=wd(Rc);if($t)return Be(Lt,$t.result,!1,{preventScrollReset:ne});if($t=wd(Ge),$t)return le.add($t.key),Be(Lt,$t.result,!1,{preventScrollReset:ne});let{loaderData:ga,errors:il}=w_(S,eo,Rc,void 0,xi,Ge,he);if(S.fetchers.has(T)){let Ft=Fo(He.data);S.fetchers.set(T,Ft)}ct(Mr),S.navigation.state==="loading"&&Mr>z?(Ne($,"Expected pending action"),k&&k.abort(),Oe(S.navigation.location,{matches:eo,loaderData:ga,errors:il,fetchers:new Map(S.fetchers)})):(ie({errors:il,loaderData:__(S.loaderData,ga,eo,il),fetchers:new Map(S.fetchers)}),D=!1)}async function Ze(T,O,A,U,Q,fe,be,ne,oe){let ee=S.fetchers.get(T);Qe(T,Al(oe,ee?ee.data:void 0),{flushSync:be});let de=new AbortController,Ae=ka(e.history,A,de.signal);if(fe){let He=await va(Q,A,Ae.signal);if(He.type==="aborted")return;if(He.type==="error"){Re(T,O,He.error,{flushSync:be});return}else if(He.matches)Q=He.matches,U=Xl(Q,A);else{Re(T,O,wn(404,{pathname:A}),{flushSync:be});return}}B.set(T,de);let ze=I,rt=(await q("loader",S,Ae,[U],Q,T))[U.route.id];if(Yo(rt)&&(rt=await ub(rt,Ae.signal,!0)||rt),B.get(T)===de&&B.delete(T),!Ae.signal.aborted){if(J.has(T)){Qe(T,Fo(void 0));return}if(Li(rt))if(z>ze){Qe(T,Fo(void 0));return}else{le.add(T),await Be(Ae,rt,!1,{preventScrollReset:ne});return}if(Ln(rt)){Re(T,O,rt.error);return}Ne(!Yo(rt),"Unhandled fetcher deferred data"),Qe(T,Fo(rt.data))}}async function Be(T,O,A,U){let{submission:Q,fetcherSubmission:fe,preventScrollReset:be,replace:ne}=U===void 0?{}:U;O.response.headers.has("X-Remix-Revalidate")&&(D=!0);let oe=O.response.headers.get("Location");Ne(oe,"Expected a Location header on the redirect Response"),oe=x_(oe,new URL(T.url),l);let ee=ju(S.location,oe,{_isRedirect:!0});if(n){let He=!1;if(O.response.headers.has("X-Remix-Reload-Document"))He=!0;else if(lb.test(oe)){const ce=e.history.createURL(oe);He=ce.origin!==t.location.origin||Co(ce.pathname,l)==null}if(He){ne?t.location.replace(oe):t.location.assign(oe);return}}k=null;let de=ne===!0||O.response.headers.has("X-Remix-Replace")?Ot.Replace:Ot.Push,{formMethod:Ae,formAction:ze,formEncType:zt}=S.navigation;!Q&&!fe&&Ae&&ze&&zt&&(Q=R_(S.navigation));let rt=Q||fe;if(mie.has(O.response.status)&&rt&&$r(rt.formMethod))await Z(de,ee,{submission:yt({},rt,{formAction:oe}),preventScrollReset:be||R,enableViewTransition:A?P:void 0});else{let He=y0(ee,Q);await Z(de,ee,{overrideNavigation:He,fetcherSubmission:fe,preventScrollReset:be||R,enableViewTransition:A?P:void 0})}}async function q(T,O,A,U,Q,fe){let be,ne={};try{be=await _ie(u,T,O,A,U,Q,fe,i,o)}catch(oe){return U.forEach(ee=>{ne[ee.route.id]={type:ot.error,error:oe}}),ne}for(let[oe,ee]of Object.entries(be))if(Pie(ee)){let de=ee.result;ne[oe]={type:ot.redirect,response:$ie(de,A,oe,Q,l,d.v7_relativeSplatPath)}}else ne[oe]=await Cie(ee);return ne}async function Ie(T,O,A,U,Q){let fe=T.matches,be=q("loader",T,Q,A,O,null),ne=Promise.all(U.map(async de=>{if(de.matches&&de.match&&de.controller){let ze=(await q("loader",T,ka(e.history,de.path,de.controller.signal),[de.match],de.matches,de.key))[de.match.route.id];return{[de.key]:ze}}else return Promise.resolve({[de.key]:{type:ot.error,error:wn(404,{pathname:de.path})}})})),oe=await be,ee=(await ne).reduce((de,Ae)=>Object.assign(de,Ae),{});return await Promise.all([Iie(O,oe,Q.signal,fe,T.loaderData),Nie(O,ee,U)]),{loaderResults:oe,fetcherResults:ee}}function je(){D=!0,M.push(...Zs()),ae.forEach((T,O)=>{B.has(O)&&j.add(O),Ct(O)})}function Qe(T,O,A){A===void 0&&(A={}),S.fetchers.set(T,O),ie({fetchers:new Map(S.fetchers)},{flushSync:(A&&A.flushSync)===!0})}function Re(T,O,A,U){U===void 0&&(U={});let Q=ki(S.matches,O);Je(T),ie({errors:{[Q.route.id]:A},fetchers:new Map(S.fetchers)},{flushSync:(U&&U.flushSync)===!0})}function pe(T){return d.v7_fetcherPersist&&(ye.set(T,(ye.get(T)||0)+1),J.has(T)&&J.delete(T)),S.fetchers.get(T)||vie}function Je(T){let O=S.fetchers.get(T);B.has(T)&&!(O&&O.state==="loading"&&H.has(T))&&Ct(T),ae.delete(T),H.delete(T),le.delete(T),J.delete(T),j.delete(T),S.fetchers.delete(T)}function An(T){if(d.v7_fetcherPersist){let O=(ye.get(T)||0)-1;O<=0?(ye.delete(T),J.add(T)):ye.set(T,O)}else Je(T);ie({fetchers:new Map(S.fetchers)})}function Ct(T){let O=B.get(T);O&&(O.abort(),B.delete(T))}function ue(T){for(let O of T){let A=pe(O),U=Fo(A.data);S.fetchers.set(O,U)}}function We(){let T=[],O=!1;for(let A of le){let U=S.fetchers.get(A);Ne(U,"Expected fetcher: "+A),U.state==="loading"&&(le.delete(A),T.push(A),O=!0)}return ue(T),O}function ct(T){let O=[];for(let[A,U]of H)if(U<T){let Q=S.fetchers.get(A);Ne(Q,"Expected fetcher: "+A),Q.state==="loading"&&(Ct(A),H.delete(A),O.push(A))}return ue(O),O.length>0}function dn(T,O){let A=S.blockers.get(T)||Nl;return V.get(T)!==O&&V.set(T,O),A}function Zr(T){S.blockers.delete(T),V.delete(T)}function bi(T,O){let A=S.blockers.get(T)||Nl;Ne(A.state==="unblocked"&&O.state==="blocked"||A.state==="blocked"&&O.state==="blocked"||A.state==="blocked"&&O.state==="proceeding"||A.state==="blocked"&&O.state==="unblocked"||A.state==="proceeding"&&O.state==="unblocked","Invalid blocker state transition: "+A.state+" -> "+O.state);let U=new Map(S.blockers);U.set(T,O),ie({blockers:U})}function _c(T){let{currentLocation:O,nextLocation:A,historyAction:U}=T;if(V.size===0)return;V.size>1&&Ps(!1,"A router only supports one blocker at a time");let Q=Array.from(V.entries()),[fe,be]=Q[Q.length-1],ne=S.blockers.get(fe);if(!(ne&&ne.state==="proceeding")&&be({currentLocation:O,nextLocation:A,historyAction:U}))return fe}function Js(T){let O=wn(404,{pathname:T}),A=s||a,{matches:U,route:Q}=C_(A);return Zs(),{notFoundMatches:U,route:Q,error:O}}function Zs(T){let O=[];return he.forEach((A,U)=>{(!T||T(U))&&(A.cancel(),O.push(U),he.delete(U))}),O}function Ec(T,O,A){if(v=T,b=O,y=A||null,!p&&S.navigation===g0){p=!0;let U=tl(S.location,S.matches);U!=null&&ie({restoreScrollPosition:U})}return()=>{v=null,b=null,y=null}}function el(T,O){return y&&y(T,O.map(U=>Koe(U,S.loaderData)))||T.key}function Cc(T,O){if(v&&b){let A=el(T,O);v[A]=b()}}function tl(T,O){if(v){let A=el(T,O),U=v[A];if(typeof U=="number")return U}return null}function ma(T,O,A){if(c)if(T){if(Object.keys(T[0].params).length>0)return{active:!0,matches:ef(O,A,l,!0)}}else return{active:!0,matches:ef(O,A,l,!0)||[]};return{active:!1,matches:null}}async function va(T,O,A){if(!c)return{type:"success",matches:T};let U=T;for(;;){let Q=s==null,fe=s||a,be=i;try{await c({path:O,matches:U,patch:(ee,de)=>{A.aborted||b_(ee,de,fe,be,o)}})}catch(ee){return{type:"error",error:ee,partialMatches:U}}finally{Q&&!A.aborted&&(a=[...a])}if(A.aborted)return{type:"aborted"};let ne=Ri(fe,O,l);if(ne)return{type:"success",matches:ne};let oe=ef(fe,O,l,!0);if(!oe||U.length===oe.length&&U.every((ee,de)=>ee.route.id===oe[de].route.id))return{type:"success",matches:null};U=oe}}function Vh(T){i={},s=qf(T,o,void 0,i)}function nl(T,O){let A=s==null;b_(T,O,s||a,i,o),A&&(a=[...a],ie({}))}return C={get basename(){return l},get future(){return d},get state(){return S},get routes(){return a},get window(){return t},initialize:we,subscribe:Fe,enableScrollRestoration:Ec,navigate:ge,fetch:De,revalidate:$e,createHref:T=>e.history.createHref(T),encodeLocation:T=>e.history.encodeLocation(T),getFetcher:pe,deleteFetcher:An,dispose:Se,getBlocker:dn,deleteBlocker:Zr,patchRoutes:nl,_internalFetchControllers:B,_internalActiveDeferreds:he,_internalSetRoutes:Vh},C}function bie(e){return e!=null&&("formData"in e&&e.formData!=null||"body"in e&&e.body!==void 0)}function Sg(e,t,n,r,o,i,a,s){let l,u;if(a){l=[];for(let d of t)if(l.push(d),d.route.id===a){u=d;break}}else l=t,u=t[t.length-1];let c=Mh(o||".",Ah(l,i),Co(e.pathname,n)||e.pathname,s==="path");if(o==null&&(c.search=e.search,c.hash=e.hash),(o==null||o===""||o===".")&&u){let d=cb(c.search);if(u.route.index&&!d)c.search=c.search?c.search.replace(/^\?/,"?index&"):"?index";else if(!u.route.index&&d){let f=new URLSearchParams(c.search),h=f.getAll("index");f.delete("index"),h.filter(y=>y).forEach(y=>f.append("index",y));let v=f.toString();c.search=v?"?"+v:""}}return r&&n!=="/"&&(c.pathname=c.pathname==="/"?n:ho([n,c.pathname])),ea(c)}function m_(e,t,n,r){if(!r||!bie(r))return{path:n};if(r.formMethod&&!Oie(r.formMethod))return{path:n,error:wn(405,{method:r.formMethod})};let o=()=>({path:n,error:wn(400,{type:"invalid-body"})}),i=r.formMethod||"get",a=e?i.toUpperCase():i.toLowerCase(),s=NR(n);if(r.body!==void 0){if(r.formEncType==="text/plain"){if(!$r(a))return o();let f=typeof r.body=="string"?r.body:r.body instanceof FormData||r.body instanceof URLSearchParams?Array.from(r.body.entries()).reduce((h,v)=>{let[y,b]=v;return""+h+y+"="+b+`
`},""):String(r.body);return{path:n,submission:{formMethod:a,formAction:s,formEncType:r.formEncType,formData:void 0,json:void 0,text:f}}}else if(r.formEncType==="application/json"){if(!$r(a))return o();try{let f=typeof r.body=="string"?JSON.parse(r.body):r.body;return{path:n,submission:{formMethod:a,formAction:s,formEncType:r.formEncType,formData:void 0,json:f,text:void 0}}}catch{return o()}}}Ne(typeof FormData=="function","FormData is not available in this environment");let l,u;if(r.formData)l=_g(r.formData),u=r.formData;else if(r.body instanceof FormData)l=_g(r.body),u=r.body;else if(r.body instanceof URLSearchParams)l=r.body,u=S_(l);else if(r.body==null)l=new URLSearchParams,u=new FormData;else try{l=new URLSearchParams(r.body),u=S_(l)}catch{return o()}let c={formMethod:a,formAction:s,formEncType:r&&r.formEncType||"application/x-www-form-urlencoded",formData:u,json:void 0,text:void 0};if($r(c.formMethod))return{path:n,submission:c};let d=Po(n);return t&&d.search&&cb(d.search)&&l.append("index",""),d.search="?"+l,{path:ea(d),submission:c}}function v_(e,t,n){n===void 0&&(n=!1);let r=e.findIndex(o=>o.route.id===t);return r>=0?e.slice(0,n?r+1:r):e}function g_(e,t,n,r,o,i,a,s,l,u,c,d,f,h,v,y){let b=y?Ln(y[1])?y[1].error:y[1].data:void 0,p=e.createURL(t.location),m=e.createURL(o),g=n;i&&t.errors?g=v_(n,Object.keys(t.errors)[0],!0):y&&Ln(y[1])&&(g=v_(n,y[0]));let w=y?y[1].statusCode:void 0,C=a&&w&&w>=400,S=g.filter((R,k)=>{let{route:P}=R;if(P.lazy)return!0;if(P.loader==null)return!1;if(i)return wg(P,t.loaderData,t.errors);if(xie(t.loaderData,t.matches[k],R)||l.some(L=>L===R.route.id))return!0;let N=t.matches[k],F=R;return y_(R,yt({currentUrl:p,currentParams:N.params,nextUrl:m,nextParams:F.params},r,{actionResult:b,actionStatus:w,defaultShouldRevalidate:C?!1:s||p.pathname+p.search===m.pathname+m.search||p.search!==m.search||OR(N,F)}))}),$=[];return d.forEach((R,k)=>{if(i||!n.some(D=>D.route.id===R.routeId)||c.has(k))return;let P=Ri(h,R.path,v);if(!P){$.push({key:k,routeId:R.routeId,path:R.path,matches:null,match:null,controller:null});return}let N=t.fetchers.get(k),F=Xl(P,R.path),L=!1;f.has(k)?L=!1:u.has(k)?(u.delete(k),L=!0):N&&N.state!=="idle"&&N.data===void 0?L=s:L=y_(F,yt({currentUrl:p,currentParams:t.matches[t.matches.length-1].params,nextUrl:m,nextParams:n[n.length-1].params},r,{actionResult:b,actionStatus:w,defaultShouldRevalidate:C?!1:s})),L&&$.push({key:k,routeId:R.routeId,path:R.path,matches:P,match:F,controller:new AbortController})}),[S,$]}function wg(e,t,n){if(e.lazy)return!0;if(!e.loader)return!1;let r=t!=null&&t[e.id]!==void 0,o=n!=null&&n[e.id]!==void 0;return!r&&o?!1:typeof e.loader=="function"&&e.loader.hydrate===!0?!0:!r&&!o}function xie(e,t,n){let r=!t||n.route.id!==t.route.id,o=e[n.route.id]===void 0;return r||o}function OR(e,t){let n=e.route.path;return e.pathname!==t.pathname||n!=null&&n.endsWith("*")&&e.params["*"]!==t.params["*"]}function y_(e,t){if(e.route.shouldRevalidate){let n=e.route.shouldRevalidate(t);if(typeof n=="boolean")return n}return t.defaultShouldRevalidate}function b_(e,t,n,r,o){var i;let a;if(e){let u=r[e];Ne(u,"No route found to patch children into: routeId = "+e),u.children||(u.children=[]),a=u.children}else a=n;let s=t.filter(u=>!a.some(c=>IR(u,c))),l=qf(s,o,[e||"_","patch",String(((i=a)==null?void 0:i.length)||"0")],r);a.push(...l)}function IR(e,t){return"id"in e&&"id"in t&&e.id===t.id?!0:e.index===t.index&&e.path===t.path&&e.caseSensitive===t.caseSensitive?(!e.children||e.children.length===0)&&(!t.children||t.children.length===0)?!0:e.children.every((n,r)=>{var o;return(o=t.children)==null?void 0:o.some(i=>IR(n,i))}):!1}async function Sie(e,t,n){if(!e.lazy)return;let r=await e.lazy();if(!e.lazy)return;let o=n[e.id];Ne(o,"No route found in manifest");let i={};for(let a in r){let l=o[a]!==void 0&&a!=="hasErrorBoundary";Ps(!l,'Route "'+o.id+'" has a static property "'+a+'" defined but its lazy function is also returning a value for this property. '+('The lazy route property "'+a+'" will be ignored.')),!l&&!Voe.has(a)&&(i[a]=r[a])}Object.assign(o,i),Object.assign(o,yt({},t(o),{lazy:void 0}))}async function wie(e){let{matches:t}=e,n=t.filter(o=>o.shouldLoad);return(await Promise.all(n.map(o=>o.resolve()))).reduce((o,i,a)=>Object.assign(o,{[n[a].route.id]:i}),{})}async function _ie(e,t,n,r,o,i,a,s,l,u){let c=i.map(h=>h.route.lazy?Sie(h.route,l,s):void 0),d=i.map((h,v)=>{let y=c[v],b=o.some(m=>m.route.id===h.route.id);return yt({},h,{shouldLoad:b,resolve:async m=>(m&&r.method==="GET"&&(h.route.lazy||h.route.loader)&&(b=!0),b?Eie(t,r,h,y,m,u):Promise.resolve({type:ot.data,result:void 0}))})}),f=await e({matches:d,request:r,params:i[0].params,fetcherKey:a,context:u});try{await Promise.all(c)}catch{}return f}async function Eie(e,t,n,r,o,i){let a,s,l=u=>{let c,d=new Promise((v,y)=>c=y);s=()=>c(),t.signal.addEventListener("abort",s);let f=v=>typeof u!="function"?Promise.reject(new Error("You cannot call the handler for a route which defines a boolean "+('"'+e+'" [routeId: '+n.route.id+"]"))):u({request:t,params:n.params,context:i},...v!==void 0?[v]:[]),h=(async()=>{try{return{type:"data",result:await(o?o(y=>f(y)):f())}}catch(v){return{type:"error",result:v}}})();return Promise.race([h,d])};try{let u=n.route[e];if(r)if(u){let c,[d]=await Promise.all([l(u).catch(f=>{c=f}),r]);if(c!==void 0)throw c;a=d}else if(await r,u=n.route[e],u)a=await l(u);else if(e==="action"){let c=new URL(t.url),d=c.pathname+c.search;throw wn(405,{method:t.method,pathname:d,routeId:n.route.id})}else return{type:ot.data,result:void 0};else if(u)a=await l(u);else{let c=new URL(t.url),d=c.pathname+c.search;throw wn(404,{pathname:d})}Ne(a.result!==void 0,"You defined "+(e==="action"?"an action":"a loader")+" for route "+('"'+n.route.id+"\" but didn't return anything from your `"+e+"` ")+"function. Please return a value or `null`.")}catch(u){return{type:ot.error,result:u}}finally{s&&t.signal.removeEventListener("abort",s)}return a}async function Cie(e){let{result:t,type:n}=e;if(AR(t)){let u;try{let c=t.headers.get("Content-Type");c&&/\bapplication\/json\b/.test(c)?t.body==null?u=null:u=await t.json():u=await t.text()}catch(c){return{type:ot.error,error:c}}return n===ot.error?{type:ot.error,error:new Jf(t.status,t.statusText,u),statusCode:t.status,headers:t.headers}:{type:ot.data,data:u,statusCode:t.status,headers:t.headers}}if(n===ot.error){if($_(t)){var r;if(t.data instanceof Error){var o;return{type:ot.error,error:t.data,statusCode:(o=t.init)==null?void 0:o.status}}t=new Jf(((r=t.init)==null?void 0:r.status)||500,void 0,t.data)}return{type:ot.error,error:t,statusCode:Lh(t)?t.status:void 0}}if(Tie(t)){var i,a;return{type:ot.deferred,deferredData:t,statusCode:(i=t.init)==null?void 0:i.status,headers:((a=t.init)==null?void 0:a.headers)&&new Headers(t.init.headers)}}if($_(t)){var s,l;return{type:ot.data,data:t.data,statusCode:(s=t.init)==null?void 0:s.status,headers:(l=t.init)!=null&&l.headers?new Headers(t.init.headers):void 0}}return{type:ot.data,data:t}}function $ie(e,t,n,r,o,i){let a=e.headers.get("Location");if(Ne(a,"Redirects returned/thrown from loaders/actions must have a Location header"),!lb.test(a)){let s=r.slice(0,r.findIndex(l=>l.route.id===n)+1);a=Sg(new URL(t.url),s,o,!0,a,i),e.headers.set("Location",a)}return e}function x_(e,t,n){if(lb.test(e)){let r=e,o=r.startsWith("//")?new URL(t.protocol+r):new URL(r),i=Co(o.pathname,n)!=null;if(o.origin===t.origin&&i)return o.pathname+o.search+o.hash}return e}function ka(e,t,n,r){let o=e.createURL(NR(t)).toString(),i={signal:n};if(r&&$r(r.formMethod)){let{formMethod:a,formEncType:s}=r;i.method=a.toUpperCase(),s==="application/json"?(i.headers=new Headers({"Content-Type":s}),i.body=JSON.stringify(r.json)):s==="text/plain"?i.body=r.text:s==="application/x-www-form-urlencoded"&&r.formData?i.body=_g(r.formData):i.body=r.formData}return new Request(o,i)}function _g(e){let t=new URLSearchParams;for(let[n,r]of e.entries())t.append(n,typeof r=="string"?r:r.name);return t}function S_(e){let t=new FormData;for(let[n,r]of e.entries())t.append(n,r);return t}function Rie(e,t,n,r,o){let i={},a=null,s,l=!1,u={},c=n&&Ln(n[1])?n[1].error:void 0;return e.forEach(d=>{if(!(d.route.id in t))return;let f=d.route.id,h=t[f];if(Ne(!Li(h),"Cannot handle redirect results in processLoaderData"),Ln(h)){let v=h.error;if(c!==void 0&&(v=c,c=void 0),a=a||{},o)a[f]=v;else{let y=ki(e,f);a[y.route.id]==null&&(a[y.route.id]=v)}i[f]=void 0,l||(l=!0,s=Lh(h.error)?h.error.status:500),h.headers&&(u[f]=h.headers)}else Yo(h)?(r.set(f,h.deferredData),i[f]=h.deferredData.data,h.statusCode!=null&&h.statusCode!==200&&!l&&(s=h.statusCode),h.headers&&(u[f]=h.headers)):(i[f]=h.data,h.statusCode&&h.statusCode!==200&&!l&&(s=h.statusCode),h.headers&&(u[f]=h.headers))}),c!==void 0&&n&&(a={[n[0]]:c},i[n[0]]=void 0),{loaderData:i,errors:a,statusCode:s||200,loaderHeaders:u}}function w_(e,t,n,r,o,i,a){let{loaderData:s,errors:l}=Rie(t,n,r,a,!1);return o.forEach(u=>{let{key:c,match:d,controller:f}=u,h=i[c];if(Ne(h,"Did not find corresponding fetcher result"),!(f&&f.signal.aborted))if(Ln(h)){let v=ki(e.matches,d==null?void 0:d.route.id);l&&l[v.route.id]||(l=yt({},l,{[v.route.id]:h.error})),e.fetchers.delete(c)}else if(Li(h))Ne(!1,"Unhandled fetcher revalidation redirect");else if(Yo(h))Ne(!1,"Unhandled fetcher deferred data");else{let v=Fo(h.data);e.fetchers.set(c,v)}}),{loaderData:s,errors:l}}function __(e,t,n,r){let o=yt({},t);for(let i of n){let a=i.route.id;if(t.hasOwnProperty(a)?t[a]!==void 0&&(o[a]=t[a]):e[a]!==void 0&&i.route.loader&&(o[a]=e[a]),r&&r.hasOwnProperty(a))break}return o}function E_(e){return e?Ln(e[1])?{actionData:{}}:{actionData:{[e[0]]:e[1].data}}:{}}function ki(e,t){return(t?e.slice(0,e.findIndex(r=>r.route.id===t)+1):[...e]).reverse().find(r=>r.route.hasErrorBoundary===!0)||e[0]}function C_(e){let t=e.length===1?e[0]:e.find(n=>n.index||!n.path||n.path==="/")||{id:"__shim-error-route__"};return{matches:[{params:{},pathname:"",pathnameBase:"",route:t}],route:t}}function wn(e,t){let{pathname:n,routeId:r,method:o,type:i,message:a}=t===void 0?{}:t,s="Unknown Server Error",l="Unknown @remix-run/router error";return e===400?(s="Bad Request",o&&n&&r?l="You made a "+o+' request to "'+n+'" but '+('did not provide a `loader` for route "'+r+'", ')+"so there is no way to handle the request.":i==="defer-action"?l="defer() is not supported in actions":i==="invalid-body"&&(l="Unable to encode submission body")):e===403?(s="Forbidden",l='Route "'+r+'" does not match URL "'+n+'"'):e===404?(s="Not Found",l='No route matches URL "'+n+'"'):e===405&&(s="Method Not Allowed",o&&n&&r?l="You made a "+o.toUpperCase()+' request to "'+n+'" but '+('did not provide an `action` for route "'+r+'", ')+"so there is no way to handle the request.":o&&(l='Invalid request method "'+o.toUpperCase()+'"')),new Jf(e||500,s,new Error(l),!0)}function wd(e){let t=Object.entries(e);for(let n=t.length-1;n>=0;n--){let[r,o]=t[n];if(Li(o))return{key:r,result:o}}}function NR(e){let t=typeof e=="string"?Po(e):e;return ea(yt({},t,{hash:""}))}function kie(e,t){return e.pathname!==t.pathname||e.search!==t.search?!1:e.hash===""?t.hash!=="":e.hash===t.hash?!0:t.hash!==""}function Pie(e){return AR(e.result)&&hie.has(e.result.status)}function Yo(e){return e.type===ot.deferred}function Ln(e){return e.type===ot.error}function Li(e){return(e&&e.type)===ot.redirect}function $_(e){return typeof e=="object"&&e!=null&&"type"in e&&"data"in e&&"init"in e&&e.type==="DataWithResponseInit"}function Tie(e){let t=e;return t&&typeof t=="object"&&typeof t.data=="object"&&typeof t.subscribe=="function"&&typeof t.cancel=="function"&&typeof t.resolveData=="function"}function AR(e){return e!=null&&typeof e.status=="number"&&typeof e.statusText=="string"&&typeof e.headers=="object"&&typeof e.body<"u"}function Oie(e){return pie.has(e.toLowerCase())}function $r(e){return die.has(e.toLowerCase())}async function Iie(e,t,n,r,o){let i=Object.entries(t);for(let a=0;a<i.length;a++){let[s,l]=i[a],u=e.find(f=>(f==null?void 0:f.route.id)===s);if(!u)continue;let c=r.find(f=>f.route.id===u.route.id),d=c!=null&&!OR(c,u)&&(o&&o[u.route.id])!==void 0;Yo(l)&&d&&await ub(l,n,!1).then(f=>{f&&(t[s]=f)})}}async function Nie(e,t,n){for(let r=0;r<n.length;r++){let{key:o,routeId:i,controller:a}=n[r],s=t[o];e.find(u=>(u==null?void 0:u.route.id)===i)&&Yo(s)&&(Ne(a,"Expected an AbortController for revalidating fetcher deferred result"),await ub(s,a.signal,!0).then(u=>{u&&(t[o]=u)}))}}async function ub(e,t,n){if(n===void 0&&(n=!1),!await e.deferredData.resolveData(t)){if(n)try{return{type:ot.data,data:e.deferredData.unwrappedData}}catch(o){return{type:ot.error,error:o}}return{type:ot.data,data:e.deferredData.data}}}function cb(e){return new URLSearchParams(e).getAll("index").some(t=>t==="")}function Xl(e,t){let n=typeof t=="string"?Po(t).search:t.search;if(e[e.length-1].route.index&&cb(n||""))return e[e.length-1];let r=kR(e);return r[r.length-1]}function R_(e){let{formMethod:t,formAction:n,formEncType:r,text:o,formData:i,json:a}=e;if(!(!t||!n||!r)){if(o!=null)return{formMethod:t,formAction:n,formEncType:r,formData:void 0,json:void 0,text:o};if(i!=null)return{formMethod:t,formAction:n,formEncType:r,formData:i,json:void 0,text:void 0};if(a!==void 0)return{formMethod:t,formAction:n,formEncType:r,formData:void 0,json:a,text:void 0}}}function y0(e,t){return t?{state:"loading",location:e,formMethod:t.formMethod,formAction:t.formAction,formEncType:t.formEncType,formData:t.formData,json:t.json,text:t.text}:{state:"loading",location:e,formMethod:void 0,formAction:void 0,formEncType:void 0,formData:void 0,json:void 0,text:void 0}}function Aie(e,t){return{state:"submitting",location:e,formMethod:t.formMethod,formAction:t.formAction,formEncType:t.formEncType,formData:t.formData,json:t.json,text:t.text}}function Al(e,t){return e?{state:"loading",formMethod:e.formMethod,formAction:e.formAction,formEncType:e.formEncType,formData:e.formData,json:e.json,text:e.text,data:t}:{state:"loading",formMethod:void 0,formAction:void 0,formEncType:void 0,formData:void 0,json:void 0,text:void 0,data:t}}function Mie(e,t){return{state:"submitting",formMethod:e.formMethod,formAction:e.formAction,formEncType:e.formEncType,formData:e.formData,json:e.json,text:e.text,data:t?t.data:void 0}}function Fo(e){return{state:"idle",formMethod:void 0,formAction:void 0,formEncType:void 0,formData:void 0,json:void 0,text:void 0,data:e}}function Lie(e,t){try{let n=e.sessionStorage.getItem(TR);if(n){let r=JSON.parse(n);for(let[o,i]of Object.entries(r||{}))i&&Array.isArray(i)&&t.set(o,new Set(i||[]))}}catch{}}function Fie(e,t){if(t.size>0){let n={};for(let[r,o]of t)n[r]=[...o];try{e.sessionStorage.setItem(TR,JSON.stringify(n))}catch(r){Ps(!1,"Failed to save applied view transitions in sessionStorage ("+r+").")}}}/**
 * React Router v6.27.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Uu(){return Uu=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},Uu.apply(this,arguments)}const vc=x.createContext(null),db=x.createContext(null),To=x.createContext(null),Fh=x.createContext(null),yi=x.createContext({outlet:null,matches:[],isDataRoute:!1}),MR=x.createContext(null);function Die(e,t){let{relative:n}=t===void 0?{}:t;qs()||Ne(!1);let{basename:r,navigator:o}=x.useContext(To),{hash:i,pathname:a,search:s}=Dh(e,{relative:n}),l=a;return r!=="/"&&(l=a==="/"?r:ho([r,a])),o.createHref({pathname:l,search:s,hash:i})}function qs(){return x.useContext(Fh)!=null}function da(){return qs()||Ne(!1),x.useContext(Fh).location}function LR(e){x.useContext(To).static||x.useLayoutEffect(e)}function fb(){let{isDataRoute:e}=x.useContext(yi);return e?qie():Bie()}function Bie(){qs()||Ne(!1);let e=x.useContext(vc),{basename:t,future:n,navigator:r}=x.useContext(To),{matches:o}=x.useContext(yi),{pathname:i}=da(),a=JSON.stringify(Ah(o,n.v7_relativeSplatPath)),s=x.useRef(!1);return LR(()=>{s.current=!0}),x.useCallback(function(u,c){if(c===void 0&&(c={}),!s.current)return;if(typeof u=="number"){r.go(u);return}let d=Mh(u,JSON.parse(a),i,c.relative==="path");e==null&&t!=="/"&&(d.pathname=d.pathname==="/"?t:ho([t,d.pathname])),(c.replace?r.replace:r.push)(d,c.state,c)},[t,r,a,i,e])}function Dh(e,t){let{relative:n}=t===void 0?{}:t,{future:r}=x.useContext(To),{matches:o}=x.useContext(yi),{pathname:i}=da(),a=JSON.stringify(Ah(o,r.v7_relativeSplatPath));return x.useMemo(()=>Mh(e,JSON.parse(a),i,n==="path"),[e,a,i,n])}function zie(e,t,n,r){qs()||Ne(!1);let{navigator:o}=x.useContext(To),{matches:i}=x.useContext(yi),a=i[i.length-1],s=a?a.params:{};a&&a.pathname;let l=a?a.pathnameBase:"/";a&&a.route;let u=da(),c;if(t){var d;let b=typeof t=="string"?Po(t):t;l==="/"||(d=b.pathname)!=null&&d.startsWith(l)||Ne(!1),c=b}else c=u;let f=c.pathname||"/",h=f;if(l!=="/"){let b=l.replace(/^\//,"").split("/");h="/"+f.replace(/^\//,"").split("/").slice(b.length).join("/")}let v=Ri(e,{pathname:h}),y=Vie(v&&v.map(b=>Object.assign({},b,{params:Object.assign({},s,b.params),pathname:ho([l,o.encodeLocation?o.encodeLocation(b.pathname).pathname:b.pathname]),pathnameBase:b.pathnameBase==="/"?l:ho([l,o.encodeLocation?o.encodeLocation(b.pathnameBase).pathname:b.pathnameBase])})),i,n,r);return t&&y?x.createElement(Fh.Provider,{value:{location:Uu({pathname:"/",search:"",hash:"",state:null,key:"default"},c),navigationType:Ot.Pop}},y):y}function jie(){let e=Yie(),t=Lh(e)?e.status+" "+e.statusText:e instanceof Error?e.message:JSON.stringify(e),n=e instanceof Error?e.stack:null,o={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"},i=null;return x.createElement(x.Fragment,null,x.createElement("h2",null,"Unexpected Application Error!"),x.createElement("h3",{style:{fontStyle:"italic"}},t),n?x.createElement("pre",{style:o},n):null,i)}const Uie=x.createElement(jie,null);class Wie extends x.Component{constructor(t){super(t),this.state={location:t.location,revalidation:t.revalidation,error:t.error}}static getDerivedStateFromError(t){return{error:t}}static getDerivedStateFromProps(t,n){return n.location!==t.location||n.revalidation!=="idle"&&t.revalidation==="idle"?{error:t.error,location:t.location,revalidation:t.revalidation}:{error:t.error!==void 0?t.error:n.error,location:n.location,revalidation:t.revalidation||n.revalidation}}componentDidCatch(t,n){console.error("React Router caught the following error during render",t,n)}render(){return this.state.error!==void 0?x.createElement(yi.Provider,{value:this.props.routeContext},x.createElement(MR.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function Hie(e){let{routeContext:t,match:n,children:r}=e,o=x.useContext(vc);return o&&o.static&&o.staticContext&&(n.route.errorElement||n.route.ErrorBoundary)&&(o.staticContext._deepestRenderedBoundaryId=n.route.id),x.createElement(yi.Provider,{value:t},r)}function Vie(e,t,n,r){var o;if(t===void 0&&(t=[]),n===void 0&&(n=null),r===void 0&&(r=null),e==null){var i;if(!n)return null;if(n.errors)e=n.matches;else if((i=r)!=null&&i.v7_partialHydration&&t.length===0&&!n.initialized&&n.matches.length>0)e=n.matches;else return null}let a=e,s=(o=n)==null?void 0:o.errors;if(s!=null){let c=a.findIndex(d=>d.route.id&&(s==null?void 0:s[d.route.id])!==void 0);c>=0||Ne(!1),a=a.slice(0,Math.min(a.length,c+1))}let l=!1,u=-1;if(n&&r&&r.v7_partialHydration)for(let c=0;c<a.length;c++){let d=a[c];if((d.route.HydrateFallback||d.route.hydrateFallbackElement)&&(u=c),d.route.id){let{loaderData:f,errors:h}=n,v=d.route.loader&&f[d.route.id]===void 0&&(!h||h[d.route.id]===void 0);if(d.route.lazy||v){l=!0,u>=0?a=a.slice(0,u+1):a=[a[0]];break}}}return a.reduceRight((c,d,f)=>{let h,v=!1,y=null,b=null;n&&(h=s&&d.route.id?s[d.route.id]:void 0,y=d.route.errorElement||Uie,l&&(u<0&&f===0?(Qie("route-fallback",!1),v=!0,b=null):u===f&&(v=!0,b=d.route.hydrateFallbackElement||null)));let p=t.concat(a.slice(0,f+1)),m=()=>{let g;return h?g=y:v?g=b:d.route.Component?g=x.createElement(d.route.Component,null):d.route.element?g=d.route.element:g=c,x.createElement(Hie,{match:d,routeContext:{outlet:c,matches:p,isDataRoute:n!=null},children:g})};return n&&(d.route.ErrorBoundary||d.route.errorElement||f===0)?x.createElement(Wie,{location:n.location,revalidation:n.revalidation,component:y,error:h,children:m(),routeContext:{outlet:null,matches:p,isDataRoute:!0}}):m()},null)}var FR=function(e){return e.UseBlocker="useBlocker",e.UseRevalidator="useRevalidator",e.UseNavigateStable="useNavigate",e}(FR||{}),Zf=function(e){return e.UseBlocker="useBlocker",e.UseLoaderData="useLoaderData",e.UseActionData="useActionData",e.UseRouteError="useRouteError",e.UseNavigation="useNavigation",e.UseRouteLoaderData="useRouteLoaderData",e.UseMatches="useMatches",e.UseRevalidator="useRevalidator",e.UseNavigateStable="useNavigate",e.UseRouteId="useRouteId",e}(Zf||{});function Gie(e){let t=x.useContext(vc);return t||Ne(!1),t}function Kie(e){let t=x.useContext(db);return t||Ne(!1),t}function Xie(e){let t=x.useContext(yi);return t||Ne(!1),t}function DR(e){let t=Xie(),n=t.matches[t.matches.length-1];return n.route.id||Ne(!1),n.route.id}function Yie(){var e;let t=x.useContext(MR),n=Kie(Zf.UseRouteError),r=DR(Zf.UseRouteError);return t!==void 0?t:(e=n.errors)==null?void 0:e[r]}function qie(){let{router:e}=Gie(FR.UseNavigateStable),t=DR(Zf.UseNavigateStable),n=x.useRef(!1);return LR(()=>{n.current=!0}),x.useCallback(function(o,i){i===void 0&&(i={}),n.current&&(typeof o=="number"?e.navigate(o):e.navigate(o,Uu({fromRouteId:t},i)))},[e,t])}const k_={};function Qie(e,t,n){!t&&!k_[e]&&(k_[e]=!0)}function Jie(e){let{to:t,replace:n,state:r,relative:o}=e;qs()||Ne(!1);let{future:i,static:a}=x.useContext(To),{matches:s}=x.useContext(yi),{pathname:l}=da(),u=fb(),c=Mh(t,Ah(s,i.v7_relativeSplatPath),l,o==="path"),d=JSON.stringify(c);return x.useEffect(()=>u(JSON.parse(d),{replace:n,state:r,relative:o}),[u,d,o,n,r]),null}function Zie(e){let{basename:t="/",children:n=null,location:r,navigationType:o=Ot.Pop,navigator:i,static:a=!1,future:s}=e;qs()&&Ne(!1);let l=t.replace(/^\/*/,"/"),u=x.useMemo(()=>({basename:l,navigator:i,static:a,future:Uu({v7_relativeSplatPath:!1},s)}),[l,s,i,a]);typeof r=="string"&&(r=Po(r));let{pathname:c="/",search:d="",hash:f="",state:h=null,key:v="default"}=r,y=x.useMemo(()=>{let b=Co(c,l);return b==null?null:{location:{pathname:b,search:d,hash:f,state:h,key:v},navigationType:o}},[l,c,d,f,h,v,o]);return y==null?null:x.createElement(To.Provider,{value:u},x.createElement(Fh.Provider,{children:n,value:y}))}new Promise(()=>{});function eae(e){let t={hasErrorBoundary:e.ErrorBoundary!=null||e.errorElement!=null};return e.Component&&Object.assign(t,{element:x.createElement(e.Component),Component:void 0}),e.HydrateFallback&&Object.assign(t,{hydrateFallbackElement:x.createElement(e.HydrateFallback),HydrateFallback:void 0}),e.ErrorBoundary&&Object.assign(t,{errorElement:x.createElement(e.ErrorBoundary),ErrorBoundary:void 0}),t}/**
 * React Router DOM v6.27.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Ts(){return Ts=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},Ts.apply(this,arguments)}function BR(e,t){if(e==null)return{};var n={},r=Object.keys(e),o,i;for(i=0;i<r.length;i++)o=r[i],!(t.indexOf(o)>=0)&&(n[o]=e[o]);return n}function tae(e){return!!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)}function nae(e,t){return e.button===0&&(!t||t==="_self")&&!tae(e)}function Eg(e){return e===void 0&&(e=""),new URLSearchParams(typeof e=="string"||Array.isArray(e)||e instanceof URLSearchParams?e:Object.keys(e).reduce((t,n)=>{let r=e[n];return t.concat(Array.isArray(r)?r.map(o=>[n,o]):[[n,r]])},[]))}function rae(e,t){let n=Eg(e);return t&&t.forEach((r,o)=>{n.has(o)||t.getAll(o).forEach(i=>{n.append(o,i)})}),n}const oae=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],iae=["aria-current","caseSensitive","className","end","style","to","viewTransition","children"],aae="6";try{window.__reactRouterVersion=aae}catch{}function sae(e,t){return yie({basename:t==null?void 0:t.basename,future:Ts({},t==null?void 0:t.future,{v7_prependBasename:!0}),history:Uoe({window:t==null?void 0:t.window}),hydrationData:(t==null?void 0:t.hydrationData)||lae(),routes:e,mapRouteProperties:eae,dataStrategy:t==null?void 0:t.dataStrategy,patchRoutesOnNavigation:t==null?void 0:t.patchRoutesOnNavigation,window:t==null?void 0:t.window}).initialize()}function lae(){var e;let t=(e=window)==null?void 0:e.__staticRouterHydrationData;return t&&t.errors&&(t=Ts({},t,{errors:uae(t.errors)})),t}function uae(e){if(!e)return null;let t=Object.entries(e),n={};for(let[r,o]of t)if(o&&o.__type==="RouteErrorResponse")n[r]=new Jf(o.status,o.statusText,o.data,o.internal===!0);else if(o&&o.__type==="Error"){if(o.__subType){let i=window[o.__subType];if(typeof i=="function")try{let a=new i(o.message);a.stack="",n[r]=a}catch{}}if(n[r]==null){let i=new Error(o.message);i.stack="",n[r]=i}}else n[r]=o;return n}const zR=x.createContext({isTransitioning:!1}),cae=x.createContext(new Map),dae="startTransition",P_=rf[dae],fae="flushSync",T_=nT[fae];function pae(e){P_?P_(e):e()}function Ml(e){T_?T_(e):e()}class hae{constructor(){this.status="pending",this.promise=new Promise((t,n)=>{this.resolve=r=>{this.status==="pending"&&(this.status="resolved",t(r))},this.reject=r=>{this.status==="pending"&&(this.status="rejected",n(r))}})}}function mae(e){let{fallbackElement:t,router:n,future:r}=e,[o,i]=x.useState(n.state),[a,s]=x.useState(),[l,u]=x.useState({isTransitioning:!1}),[c,d]=x.useState(),[f,h]=x.useState(),[v,y]=x.useState(),b=x.useRef(new Map),{v7_startTransition:p}=r||{},m=x.useCallback(R=>{p?pae(R):R()},[p]),g=x.useCallback((R,k)=>{let{deletedFetchers:P,flushSync:N,viewTransitionOpts:F}=k;P.forEach(D=>b.current.delete(D)),R.fetchers.forEach((D,M)=>{D.data!==void 0&&b.current.set(M,D.data)});let L=n.window==null||n.window.document==null||typeof n.window.document.startViewTransition!="function";if(!F||L){N?Ml(()=>i(R)):m(()=>i(R));return}if(N){Ml(()=>{f&&(c&&c.resolve(),f.skipTransition()),u({isTransitioning:!0,flushSync:!0,currentLocation:F.currentLocation,nextLocation:F.nextLocation})});let D=n.window.document.startViewTransition(()=>{Ml(()=>i(R))});D.finished.finally(()=>{Ml(()=>{d(void 0),h(void 0),s(void 0),u({isTransitioning:!1})})}),Ml(()=>h(D));return}f?(c&&c.resolve(),f.skipTransition(),y({state:R,currentLocation:F.currentLocation,nextLocation:F.nextLocation})):(s(R),u({isTransitioning:!0,flushSync:!1,currentLocation:F.currentLocation,nextLocation:F.nextLocation}))},[n.window,f,c,b,m]);x.useLayoutEffect(()=>n.subscribe(g),[n,g]),x.useEffect(()=>{l.isTransitioning&&!l.flushSync&&d(new hae)},[l]),x.useEffect(()=>{if(c&&a&&n.window){let R=a,k=c.promise,P=n.window.document.startViewTransition(async()=>{m(()=>i(R)),await k});P.finished.finally(()=>{d(void 0),h(void 0),s(void 0),u({isTransitioning:!1})}),h(P)}},[m,a,c,n.window]),x.useEffect(()=>{c&&a&&o.location.key===a.location.key&&c.resolve()},[c,f,o.location,a]),x.useEffect(()=>{!l.isTransitioning&&v&&(s(v.state),u({isTransitioning:!0,flushSync:!1,currentLocation:v.currentLocation,nextLocation:v.nextLocation}),y(void 0))},[l.isTransitioning,v]),x.useEffect(()=>{},[]);let w=x.useMemo(()=>({createHref:n.createHref,encodeLocation:n.encodeLocation,go:R=>n.navigate(R),push:(R,k,P)=>n.navigate(R,{state:k,preventScrollReset:P==null?void 0:P.preventScrollReset}),replace:(R,k,P)=>n.navigate(R,{replace:!0,state:k,preventScrollReset:P==null?void 0:P.preventScrollReset})}),[n]),C=n.basename||"/",S=x.useMemo(()=>({router:n,navigator:w,static:!1,basename:C}),[n,w,C]),$=x.useMemo(()=>({v7_relativeSplatPath:n.future.v7_relativeSplatPath}),[n.future.v7_relativeSplatPath]);return x.createElement(x.Fragment,null,x.createElement(vc.Provider,{value:S},x.createElement(db.Provider,{value:o},x.createElement(cae.Provider,{value:b.current},x.createElement(zR.Provider,{value:l},x.createElement(Zie,{basename:C,location:o.location,navigationType:o.historyAction,navigator:w,future:$},o.initialized||n.future.v7_partialHydration?x.createElement(vae,{routes:n.routes,future:n.future,state:o}):t))))),null)}const vae=x.memo(gae);function gae(e){let{routes:t,future:n,state:r}=e;return zie(t,void 0,r,n)}const yae=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",bae=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,xae=x.forwardRef(function(t,n){let{onClick:r,relative:o,reloadDocument:i,replace:a,state:s,target:l,to:u,preventScrollReset:c,viewTransition:d}=t,f=BR(t,oae),{basename:h}=x.useContext(To),v,y=!1;if(typeof u=="string"&&bae.test(u)&&(v=u,yae))try{let g=new URL(window.location.href),w=u.startsWith("//")?new URL(g.protocol+u):new URL(u),C=Co(w.pathname,h);w.origin===g.origin&&C!=null?u=C+w.search+w.hash:y=!0}catch{}let b=Die(u,{relative:o}),p=wae(u,{replace:a,state:s,target:l,preventScrollReset:c,relative:o,viewTransition:d});function m(g){r&&r(g),g.defaultPrevented||p(g)}return x.createElement("a",Ts({},f,{href:v||b,onClick:y||i?r:m,ref:n,target:l}))}),jR=x.forwardRef(function(t,n){let{"aria-current":r="page",caseSensitive:o=!1,className:i="",end:a=!1,style:s,to:l,viewTransition:u,children:c}=t,d=BR(t,iae),f=Dh(l,{relative:d.relative}),h=da(),v=x.useContext(db),{navigator:y,basename:b}=x.useContext(To),p=v!=null&&Eae(f)&&u===!0,m=y.encodeLocation?y.encodeLocation(f).pathname:f.pathname,g=h.pathname,w=v&&v.navigation&&v.navigation.location?v.navigation.location.pathname:null;o||(g=g.toLowerCase(),w=w?w.toLowerCase():null,m=m.toLowerCase()),w&&b&&(w=Co(w,b)||w);const C=m!=="/"&&m.endsWith("/")?m.length-1:m.length;let S=g===m||!a&&g.startsWith(m)&&g.charAt(C)==="/",$=w!=null&&(w===m||!a&&w.startsWith(m)&&w.charAt(m.length)==="/"),R={isActive:S,isPending:$,isTransitioning:p},k=S?r:void 0,P;typeof i=="function"?P=i(R):P=[i,S?"active":null,$?"pending":null,p?"transitioning":null].filter(Boolean).join(" ");let N=typeof s=="function"?s(R):s;return x.createElement(xae,Ts({},d,{"aria-current":k,className:P,ref:n,style:N,to:l,viewTransition:u}),typeof c=="function"?c(R):c)});var Cg;(function(e){e.UseScrollRestoration="useScrollRestoration",e.UseSubmit="useSubmit",e.UseSubmitFetcher="useSubmitFetcher",e.UseFetcher="useFetcher",e.useViewTransitionState="useViewTransitionState"})(Cg||(Cg={}));var O_;(function(e){e.UseFetcher="useFetcher",e.UseFetchers="useFetchers",e.UseScrollRestoration="useScrollRestoration"})(O_||(O_={}));function Sae(e){let t=x.useContext(vc);return t||Ne(!1),t}function wae(e,t){let{target:n,replace:r,state:o,preventScrollReset:i,relative:a,viewTransition:s}=t===void 0?{}:t,l=fb(),u=da(),c=Dh(e,{relative:a});return x.useCallback(d=>{if(nae(d,n)){d.preventDefault();let f=r!==void 0?r:ea(u)===ea(c);l(e,{replace:f,state:o,preventScrollReset:i,relative:a,viewTransition:s})}},[u,l,c,r,o,n,e,i,a,s])}function _ae(e){let t=x.useRef(Eg(e)),n=x.useRef(!1),r=da(),o=x.useMemo(()=>rae(r.search,n.current?null:t.current),[r.search]),i=fb(),a=x.useCallback((s,l)=>{const u=Eg(typeof s=="function"?s(o):s);n.current=!0,i("?"+u,l)},[i,o]);return[o,a]}function Eae(e,t){t===void 0&&(t={});let n=x.useContext(zR);n==null&&Ne(!1);let{basename:r}=Sae(Cg.useViewTransitionState),o=Dh(e,{relative:t.relative});if(!n.isTransitioning)return!1;let i=Co(n.currentLocation.pathname,r)||n.currentLocation.pathname,a=Co(n.nextLocation.pathname,r)||n.nextLocation.pathname;return Qf(o.pathname,a)!=null||Qf(o.pathname,i)!=null}const Cae=0,I_=6,N_=1,A_=30,M_=0,L_=30,F_=0,D_=13,B_=0,z_=12,j_=["N","DA","EXP","DODGE","T2","PLASMA"];function $ae(e){const t={burstA:3,successValueA:13,damageA:13,armA:0,btsA:0,ammoA:"N",contA:!1,critImmuneA:!1,dtwVsDodge:!1,burstB:1,successValueB:13,damageB:13,armB:0,btsB:0,ammoB:"N",contB:!1,critImmuneB:!1,fixedFaceToFace:!1};let n={},r=e.get("burstA");r!==null&&!isNaN(Number(r))&&(n.burstA=Vt(1,I_,Number(r)));let o=e.get("burstB");o!==null&&!isNaN(Number(o))&&(n.burstB=Vt(Cae,I_,Number(o)));let i=e.get("successValueA");i!==null&&!isNaN(Number(i))&&(n.successValueA=Vt(N_,A_,Number(i)));let a=e.get("successValueB");a!==null&&!isNaN(Number(a))&&(n.successValueB=Vt(N_,A_,Number(a)));let s=e.get("damageA");s!==null&&!isNaN(Number(s))&&(n.damageA=Vt(M_,L_,Number(s)));let l=e.get("damageB");l!==null&&!isNaN(Number(l))&&(n.damageB=Vt(M_,L_,Number(l)));let u=e.get("ammoA");u!==null&&j_.includes(u.toUpperCase())&&(n.ammoA=u.toUpperCase());let c=e.get("ammoB");c!==null&&j_.includes(c.toUpperCase())&&(n.ammoB=c.toUpperCase());let d=e.get("armA");d!==null&&!isNaN(Number(d))&&(n.armA=Vt(F_,D_,Number(d)));let f=e.get("armB");f!==null&&!isNaN(Number(f))&&(n.armB=Vt(F_,D_,Number(f)));let h=e.get("btsA");h!==null&&!isNaN(Number(h))&&(n.btsA=Vt(B_,z_,Number(h)));let v=e.get("btsB");v!==null&&!isNaN(Number(v))&&(n.btsB=Vt(B_,z_,Number(v)));let y=e.get("contA");y!==null&&(n.contA=y.toLowerCase()==="true");let b=e.get("contB");b!==null&&(n.contB=b.toLowerCase()==="true");let p=e.get("critImmuneA");p!==null&&(n.critImmuneA=p.toLowerCase()==="true");let m=e.get("critImmuneB");m!==null&&(n.critImmuneB=m.toLowerCase()==="true");let g=e.get("dtwVsDodge");g!==null&&(n.dtwVsDodge=g.toLowerCase()==="true");let w=e.get("fixedFaceToFace");return w!==null&&(n.fixedFaceToFace=w.toLowerCase()==="true"),Object.assign({},t,n)}function Rae(e){return e!=null&&typeof e=="object"&&e["@@functional/placeholder"]===!0}var pb=Rae,kae=pb;function Pae(e){return function t(n){return arguments.length===0||kae(n)?t:e.apply(this,arguments)}}var hb=Pae;function Tae(e,t){switch(e){case 0:return function(){return t.apply(this,arguments)};case 1:return function(n){return t.apply(this,arguments)};case 2:return function(n,r){return t.apply(this,arguments)};case 3:return function(n,r,o){return t.apply(this,arguments)};case 4:return function(n,r,o,i){return t.apply(this,arguments)};case 5:return function(n,r,o,i,a){return t.apply(this,arguments)};case 6:return function(n,r,o,i,a,s){return t.apply(this,arguments)};case 7:return function(n,r,o,i,a,s,l){return t.apply(this,arguments)};case 8:return function(n,r,o,i,a,s,l,u){return t.apply(this,arguments)};case 9:return function(n,r,o,i,a,s,l,u,c){return t.apply(this,arguments)};case 10:return function(n,r,o,i,a,s,l,u,c,d){return t.apply(this,arguments)};default:throw new Error("First argument to _arity must be a non-negative integer no greater than ten")}}var UR=Tae,b0=hb,Ll=pb;function Oae(e){return function t(n,r){switch(arguments.length){case 0:return t;case 1:return Ll(n)?t:b0(function(o){return e(n,o)});default:return Ll(n)&&Ll(r)?t:Ll(n)?b0(function(o){return e(o,r)}):Ll(r)?b0(function(o){return e(n,o)}):e(n,r)}}}var Iae=Oae,Nae=UR,U_=pb;function WR(e,t,n){return function(){for(var r=[],o=0,i=e,a=0,s=!1;a<t.length||o<arguments.length;){var l;a<t.length&&(!U_(t[a])||o>=arguments.length)?l=t[a]:(l=arguments[o],o+=1),r[a]=l,U_(l)?s=!0:i-=1,a+=1}return!s&&i<=0?n.apply(this,r):Nae(Math.max(0,i),WR(e,r,n))}}var Aae=WR,Mae=UR,Lae=hb,Fae=Iae,Dae=Aae,Bae=Fae(function(t,n){return t===1?Lae(n):Mae(t,Dae(t,[],n))}),zae=Bae,jae=hb,Uae=zae,Wae=jae(function(t){return Uae(t.length,t)}),Hae=Wae;const Vae=Hu(Hae);var mb={},Gae=xn;Object.defineProperty(mb,"__esModule",{value:!0});var HR=mb.default=void 0,Kae=Gae(Yn()),Xae=qn;HR=mb.default=(0,Kae.default)((0,Xae.jsx)("path",{d:"M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6"}),"Brightness4");var vb={},Yae=xn;Object.defineProperty(vb,"__esModule",{value:!0});var VR=vb.default=void 0,qae=Yae(Yn()),Qae=qn;VR=vb.default=(0,qae.default)((0,Qae.jsx)("path",{d:"M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6m0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4"}),"Brightness7");const GR=x.forwardRef((e,t)=>_(jR,{ref:t,...e,className:({isActive:n})=>n?e.className+" Mui-selected":e.className}));GR.displayName="NavLink";GR.propTypes=jR.propTypes;const Jae=X("div")(({theme:e})=>e.mixins.toolbar);function Zae(){const e=Nr(),[t,n]=J4(KR),r=()=>n(t==="dark"?"light":"dark");return G(ur,{children:[_(Z7,{sx:{backgroundColor:e.palette.appbar},children:G(dU,{children:[_(st,{sx:{fontFamily:"conthrax",flexGrow:1,color:e.palette.getContrastText(e.palette.appbar)},children:"Infinity the Calculator"}),_(mn,{sx:{display:{xs:"block",sm:"block"},ml:2},children:_(ar,{sx:{ml:1},onClick:r,children:e.palette.mode==="dark"?_(VR,{}):_(HR,{})})})]})}),_(Jae,{})]})}const KR=iW("selectedTheme","dark");function ese(){const[e,t]=x.useState("(loading...)"),n=x.useRef(null),[r]=J4(KR);let[o,i]=_ae(),a=$ae(o);const[s,l]=x.useState(a.burstA),[u,c]=x.useState(a.successValueA),[d,f]=x.useState(a.damageA),[h,v]=x.useState(a.armA),[y,b]=x.useState(a.btsA),[p,m]=x.useState(a.ammoA),[g,w]=x.useState(a.contA),[C,S]=x.useState(a.critImmuneA),[$,R]=x.useState(a.dtwVsDodge),[k,P]=x.useState(a.burstB),[N,F]=x.useState(a.successValueB),[L,D]=x.useState(a.damageB),[M,j]=x.useState(a.armB),[B,I]=x.useState(a.btsB),[z,H]=x.useState(a.ammoB),[le,ae]=x.useState(a.contB),[ye,J]=x.useState(a.critImmuneB),[he,V]=x.useState(a.fixedFaceToFace),[me,we]=x.useState(null),[Se,Fe]=x.useState([]),ie=q=>({palette:{mode:q,...q==="light"?{primary:{main:"#217a79"},background:{default:Gd[100]},reactive:{light:"#f3cbd3",main:"#b14d8e",dark:"#6c2167",100:"#f3cbd3",200:"#eaa9bd",300:"#dd88ac",400:"#ca699d",500:"#b14d8e",600:"#91357d",700:"#6c2167"},active:{light:"#d3f2a3",main:"#217a79",dark:"#074050",100:"#d3f2a3",200:"#97e196",300:"#6cc08b",400:"#4c9b82",500:"#217a79",600:"#105965",700:"#074050"},failure:{100:Gd[100]},appbar:Gd[100]}:{primary:{main:"#6cc08b"},reactive:{700:"#f3cbd3",600:"#eaa9bd",500:"#dd88ac",400:"#ca699d",300:"#b14d8e",200:"#91357d",100:"#6c2167"},active:{700:"#d3f2a3",600:"#97e196",500:"#6cc08b",400:"#4c9b82",300:"#217a79",200:"#105965",100:"#074050"},failure:{300:"#424242",200:"#212121",100:"#121212"},appbar:"#121212"}}});let Oe=r==="dark"?"dark":"light";const ge=Af(x.useMemo(()=>Af(ie(Oe)),[Oe])),$e=q=>{if(q.data.command==="result"){let Ie=q.data.value,je=_x(Ie);we(je),t(`Done! Took ${q.data.elapsed}ms to calculate all ${q.data.totalRolls.toLocaleString()} possible rolls.`)}else q.data.command==="status"&&q.data.value==="ready"&&Le()},Z=q=>{throw console.log(`Worker error: ${q.message} 
`),t(`Worker error: ${q.message}`),q};x.useEffect(()=>{t("Loading icepool engine"),(async()=>{n.current=new Worker(new URL("/assets/python.worker-45af3a68.js",self.location)),n.current.onmessage=$e,n.current.onerror=Z,n.current.postMessage({command:"init"})})()},[]),x.useEffect(()=>{Le(),i()},[s,u,d,h,y,p,g,C,k,N,L,M,B,z,le,ye,$,he]);const Le=async()=>{var Ie,je;let q={successValueA:u,burstA:s,damageA:d,armA:h,btsA:y,ammoA:p,contA:g,critImmuneA:C,successValueB:N,burstB:k,damageB:L,armB:M,btsB:B,ammoB:z,contB:le,critImmuneB:ye,dtwVsDodge:$,fixedFaceToFace:he};await((je=(Ie=n==null?void 0:n.current)==null?void 0:Ie.postMessage)==null?void 0:je.call(Ie,{command:"calculate",data:q}))},Ue=()=>{AM(es(me.id,"id"))(Se)?console.log("Not adding, duplicate key"):Fe(q=>_x([...q,me]))},qe=q=>{we(Ie=>(console.log(`Updating result title to "${q}"`),Sx("title",q,Ie)))},De=Vae((q,Ie)=>{console.log(`received request to change saved result name with id ${q} and title ${Ie}`),Fe(je=>{console.log("changeing saved results list. current value:"),console.log(je);let Qe=Ex(es(q,"id"))(je);console.log(`changing index ${Qe}`);let Re=d9(Qe,Sx("title",Ie,je[Qe]))(je);return console.log("New saved results"),console.log(Re),Re})}),Pe=q=>{let Ie=Ex(es(q,"id"))(Se);Ie>=0&&Fe(je=>a9(Ie,1,je))},Ze=()=>{Fe([])},Be=()=>{const q=["player","wounds","raw_chance","cumulative_chance","chance"],Ie=["burstA","successValueA","damageA","armA","btsA","ammoA","contA","critImmuneA","dtwVsDodge","burstB","successValueB","damageB","armB","btsB","ammoB","contB","critImmuneB"];let je="data:text/csv;charset=utf-8,",Qe="result id,title,"+Ie.join(",")+","+q.join(",")+`
`,Re=Se.map((Je,An)=>{let Ct=Ie.map(ue=>Je.parameters[ue]);return Je.expected_wounds.map(ue=>{let We=Je.title?Je.title:`Saved Result ${An+1}`;return`${Je.id},${We},`+Ct.join(",")+","+q.map(dn=>ue[dn]).join(",")}).join(`
`)}).join(`
`),pe=encodeURI(je+Qe+Re);window.open(pe)};return G(j9,{theme:ge,children:[_(PA,{}),_(Zae,{}),_(pD,{maxWidth:"xl",children:G(Te,{container:!0,spacing:2,children:[_(Te,{xs:12,sm:6,lg:4,xl:3,item:!0,children:_(Ov,{style:{alignItems:"center",justifyContent:"center"},children:_(Ua,{children:G(Te,{container:!0,children:[_(Te,{item:!0,xs:12,children:_(st,{variant:"h6",sx:{fontFamily:"conthrax"},gutterBottom:!0,children:"Active"})}),_(Gf,{burst:s,update:l}),$===!1&&_(Wf,{successValue:u,update:c}),p!=="DODGE"&&_(Hf,{damage:d,update:f}),_(Vf,{armor:h,update:v,hideBTS:z==="PLASMA"}),z==="PLASMA"&&_(Yf,{bts:y,update:b}),_(QS,{ammo:p,cont:g,update:m,updateCont:w}),_(d_,{critImmune:C,update:S,dtwVsDodge:$,updateDtw:R})]})})})}),_(Te,{xs:12,sm:6,lg:4,xl:3,item:!0,children:_(Ov,{style:{alignItems:"center",justifyContent:"center"},children:_(Ua,{children:G(Te,{container:!0,children:[_(Te,{item:!0,xs:12,children:_(st,{variant:"h6",sx:{fontFamily:"conthrax"},gutterBottom:!0,children:"Reactive"})}),_(Gf,{burst:k,update:P,variant:"reactive"}),k!==0&&_(Wf,{successValue:N,update:F,variant:"reactive"}),$===!1&&k!==0&&z!=="DODGE"&&_(Hf,{damage:L,update:D,variant:"reactive"}),_(Vf,{armor:M,update:j,hideBTS:p==="PLASMA",variant:"reactive"}),p==="PLASMA"&&_(Yf,{bts:B,update:I,variant:"reactive"}),_(QS,{ammo:z,cont:le,update:H,updateCont:ae,variant:"reactive",dtw:$}),_(d_,{critImmune:ye,update:J,variant:"reactive",fixedFaceToFace:he,updateFixedFaceToFace:V})]})})})}),G(Te,{xs:12,sm:12,lg:4,xl:6,item:!0,children:[_(c_,{f2fResults:me,addToCompare:Ue,changeName:qe}),_(st,{variant:"caption",color:"text.secondary",children:e})]}),Se.length>0&&_(Te,{item:!0,xs:12,children:G(Ai,{justifyContent:"center",direction:"row",children:[_(st,{variant:"h5",children:"Saved Results"}),_(ar,{onClick:Ze,children:_(pn,{title:"Delete all results",children:_(Z4,{})})}),_(ar,{onClick:Be,children:_(pn,{title:"Download CSV of results",children:_(e6,{})})})]})}),Se.map((q,Ie)=>_(Te,{xs:12,sm:12,lg:4,xl:6,item:!0,children:_(c_,{f2fResults:q,changeName:De(q.id),remove:Pe,index:Ie,variant:"list"})},q.id)),_(Te,{children:G(st,{color:"text.secondary",variant:"body2",sx:{marginTop:4,marginLeft:2,marginRight:2},children:["Made with ❤️ for the Infinity community by Khepri. Contact me with any bugs or suggestions on the ",_(Qx,{href:"https://www.infinitygloballeague.com/",children:"IGL Discord"})," or on the Corvus Belli forums. Source code ",_(Qx,{href:"https://github.com/alexrecarey/khepri-f2f",children:"available on github"}),"."]})})]})})]})}const XR=Object.prototype.toString;function gb(e){switch(XR.call(e)){case"[object Error]":case"[object Exception]":case"[object DOMException]":case"[object WebAssembly.Exception]":return!0;default:return ta(e,Error)}}function Qs(e,t){return XR.call(e)===`[object ${t}]`}function YR(e){return Qs(e,"ErrorEvent")}function W_(e){return Qs(e,"DOMError")}function tse(e){return Qs(e,"DOMException")}function mo(e){return Qs(e,"String")}function yb(e){return typeof e=="object"&&e!==null&&"__sentry_template_string__"in e&&"__sentry_template_values__"in e}function bb(e){return e===null||yb(e)||typeof e!="object"&&typeof e!="function"}function Os(e){return Qs(e,"Object")}function Bh(e){return typeof Event<"u"&&ta(e,Event)}function nse(e){return typeof Element<"u"&&ta(e,Element)}function rse(e){return Qs(e,"RegExp")}function zh(e){return!!(e&&e.then&&typeof e.then=="function")}function ose(e){return Os(e)&&"nativeEvent"in e&&"preventDefault"in e&&"stopPropagation"in e}function ta(e,t){try{return e instanceof t}catch{return!1}}function qR(e){return!!(typeof e=="object"&&e!==null&&(e.__isVue||e._isVue))}function is(e,t=0){return typeof e!="string"||t===0||e.length<=t?e:`${e.slice(0,t)}...`}function H_(e,t){if(!Array.isArray(e))return"";const n=[];for(let r=0;r<e.length;r++){const o=e[r];try{qR(o)?n.push("[VueViewModel]"):n.push(String(o))}catch{n.push("[value cannot be serialized]")}}return n.join(t)}function ise(e,t,n=!1){return mo(e)?rse(t)?t.test(e):mo(t)?n?e===t:e.includes(t):!1:!1}function jh(e,t=[],n=!1){return t.some(r=>ise(e,r,n))}function ase(e,t,n=250,r,o,i,a){if(!i.exception||!i.exception.values||!a||!ta(a.originalException,Error))return;const s=i.exception.values.length>0?i.exception.values[i.exception.values.length-1]:void 0;s&&(i.exception.values=sse($g(e,t,o,a.originalException,r,i.exception.values,s,0),n))}function $g(e,t,n,r,o,i,a,s){if(i.length>=n+1)return i;let l=[...i];if(ta(r[o],Error)){V_(a,s);const u=e(t,r[o]),c=l.length;G_(u,o,c,s),l=$g(e,t,n,r[o],o,[u,...l],u,c)}return Array.isArray(r.errors)&&r.errors.forEach((u,c)=>{if(ta(u,Error)){V_(a,s);const d=e(t,u),f=l.length;G_(d,`errors[${c}]`,f,s),l=$g(e,t,n,u,o,[d,...l],d,f)}}),l}function V_(e,t){e.mechanism=e.mechanism||{type:"generic",handled:!0},e.mechanism={...e.mechanism,...e.type==="AggregateError"&&{is_exception_group:!0},exception_id:t}}function G_(e,t,n,r){e.mechanism=e.mechanism||{type:"generic",handled:!0},e.mechanism={...e.mechanism,type:"chained",source:t,exception_id:n,parent_id:r}}function sse(e,t){return e.map(n=>(n.value&&(n.value=is(n.value,t)),n))}function QR(e){if(e!==void 0)return e>=400&&e<500?"warning":e>=500?"error":void 0}const Wi="8.36.0",Ye=globalThis;function Uh(e,t,n){const r=n||Ye,o=r.__SENTRY__=r.__SENTRY__||{},i=o[Wi]=o[Wi]||{};return i[e]||(i[e]=t())}const xb=Ye,lse=80;function JR(e,t={}){if(!e)return"<unknown>";try{let n=e;const r=5,o=[];let i=0,a=0;const s=" > ",l=s.length;let u;const c=Array.isArray(t)?t:t.keyAttrs,d=!Array.isArray(t)&&t.maxStringLength||lse;for(;n&&i++<r&&(u=use(n,c),!(u==="html"||i>1&&a+o.length*l+u.length>=d));)o.push(u),a+=u.length,n=n.parentNode;return o.reverse().join(s)}catch{return"<unknown>"}}function use(e,t){const n=e,r=[];if(!n||!n.tagName)return"";if(xb.HTMLElement&&n instanceof HTMLElement&&n.dataset){if(n.dataset.sentryComponent)return n.dataset.sentryComponent;if(n.dataset.sentryElement)return n.dataset.sentryElement}r.push(n.tagName.toLowerCase());const o=t&&t.length?t.filter(a=>n.getAttribute(a)).map(a=>[a,n.getAttribute(a)]):null;if(o&&o.length)o.forEach(a=>{r.push(`[${a[0]}="${a[1]}"]`)});else{n.id&&r.push(`#${n.id}`);const a=n.className;if(a&&mo(a)){const s=a.split(/\s+/);for(const l of s)r.push(`.${l}`)}}const i=["aria-label","type","name","title","alt"];for(const a of i){const s=n.getAttribute(a);s&&r.push(`[${a}="${s}"]`)}return r.join("")}function cse(){try{return xb.document.location.href}catch{return""}}function dse(e){if(!xb.HTMLElement)return null;let t=e;const n=5;for(let r=0;r<n;r++){if(!t)return null;if(t instanceof HTMLElement){if(t.dataset.sentryComponent)return t.dataset.sentryComponent;if(t.dataset.sentryElement)return t.dataset.sentryElement}t=t.parentNode}return null}const gc=typeof __SENTRY_DEBUG__>"u"||__SENTRY_DEBUG__,fse="Sentry Logger ",Rg=["debug","info","warn","error","log","assert","trace"],ep={};function yc(e){if(!("console"in Ye))return e();const t=Ye.console,n={},r=Object.keys(ep);r.forEach(o=>{const i=ep[o];n[o]=t[o],t[o]=i});try{return e()}finally{r.forEach(o=>{t[o]=n[o]})}}function pse(){let e=!1;const t={enable:()=>{e=!0},disable:()=>{e=!1},isEnabled:()=>e};return gc?Rg.forEach(n=>{t[n]=(...r)=>{e&&yc(()=>{Ye.console[n](`${fse}[${n}]:`,...r)})}}):Rg.forEach(n=>{t[n]=()=>{}}),t}const ke=Uh("logger",pse),hse=/^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;function mse(e){return e==="http"||e==="https"}function Wh(e,t=!1){const{host:n,path:r,pass:o,port:i,projectId:a,protocol:s,publicKey:l}=e;return`${s}://${l}${t&&o?`:${o}`:""}@${n}${i?`:${i}`:""}/${r&&`${r}/`}${a}`}function vse(e){const t=hse.exec(e);if(!t){yc(()=>{console.error(`Invalid Sentry Dsn: ${e}`)});return}const[n,r,o="",i="",a="",s=""]=t.slice(1);let l="",u=s;const c=u.split("/");if(c.length>1&&(l=c.slice(0,-1).join("/"),u=c.pop()),u){const d=u.match(/^\d+/);d&&(u=d[0])}return ZR({host:i,pass:o,path:l,projectId:u,port:a,protocol:n,publicKey:r})}function ZR(e){return{protocol:e.protocol,publicKey:e.publicKey||"",pass:e.pass||"",host:e.host,port:e.port||"",path:e.path||"",projectId:e.projectId}}function gse(e){if(!gc)return!0;const{port:t,projectId:n,protocol:r}=e;return["protocol","publicKey","host","projectId"].find(a=>e[a]?!1:(ke.error(`Invalid Sentry Dsn: ${a} missing`),!0))?!1:n.match(/^\d+$/)?mse(r)?t&&isNaN(parseInt(t,10))?(ke.error(`Invalid Sentry Dsn: Invalid port ${t}`),!1):!0:(ke.error(`Invalid Sentry Dsn: Invalid protocol ${r}`),!1):(ke.error(`Invalid Sentry Dsn: Invalid projectId ${n}`),!1)}function yse(e){const t=typeof e=="string"?vse(e):ZR(e);if(!(!t||!gse(t)))return t}class Ur extends Error{constructor(t,n="warn"){super(t),this.message=t,this.name=new.target.prototype.constructor.name,Object.setPrototypeOf(this,new.target.prototype),this.logLevel=n}}function Bn(e,t,n){if(!(t in e))return;const r=e[t],o=n(r);typeof o=="function"&&ek(o,r),e[t]=o}function na(e,t,n){try{Object.defineProperty(e,t,{value:n,writable:!0,configurable:!0})}catch{gc&&ke.log(`Failed to add non-enumerable property "${t}" to object`,e)}}function ek(e,t){try{const n=t.prototype||{};e.prototype=t.prototype=n,na(e,"__sentry_original__",t)}catch{}}function Sb(e){return e.__sentry_original__}function bse(e){return Object.keys(e).map(t=>`${encodeURIComponent(t)}=${encodeURIComponent(e[t])}`).join("&")}function tk(e){if(gb(e))return{message:e.message,name:e.name,stack:e.stack,...X_(e)};if(Bh(e)){const t={type:e.type,target:K_(e.target),currentTarget:K_(e.currentTarget),...X_(e)};return typeof CustomEvent<"u"&&ta(e,CustomEvent)&&(t.detail=e.detail),t}else return e}function K_(e){try{return nse(e)?JR(e):Object.prototype.toString.call(e)}catch{return"<unknown>"}}function X_(e){if(typeof e=="object"&&e!==null){const t={};for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t}else return{}}function xse(e,t=40){const n=Object.keys(tk(e));n.sort();const r=n[0];if(!r)return"[object has no keys]";if(r.length>=t)return is(r,t);for(let o=n.length;o>0;o--){const i=n.slice(0,o).join(", ");if(!(i.length>t))return o===n.length?i:is(i,t)}return""}function lr(e){return kg(e,new Map)}function kg(e,t){if(Sse(e)){const n=t.get(e);if(n!==void 0)return n;const r={};t.set(e,r);for(const o of Object.getOwnPropertyNames(e))typeof e[o]<"u"&&(r[o]=kg(e[o],t));return r}if(Array.isArray(e)){const n=t.get(e);if(n!==void 0)return n;const r=[];return t.set(e,r),e.forEach(o=>{r.push(kg(o,t))}),r}return e}function Sse(e){if(!Os(e))return!1;try{const t=Object.getPrototypeOf(e).constructor.name;return!t||t==="Object"}catch{return!0}}const nk=50,ra="?",Y_=/\(error: (.*)\)/,q_=/captureMessage|captureException/;function rk(...e){const t=e.sort((n,r)=>n[0]-r[0]).map(n=>n[1]);return(n,r=0,o=0)=>{const i=[],a=n.split(`
`);for(let s=r;s<a.length;s++){const l=a[s];if(l.length>1024)continue;const u=Y_.test(l)?l.replace(Y_,"$1"):l;if(!u.match(/\S*Error: /)){for(const c of t){const d=c(u);if(d){i.push(d);break}}if(i.length>=nk+o)break}}return _se(i.slice(o))}}function wse(e){return Array.isArray(e)?rk(...e):e}function _se(e){if(!e.length)return[];const t=Array.from(e);return/sentryWrapped/.test(_d(t).function||"")&&t.pop(),t.reverse(),q_.test(_d(t).function||"")&&(t.pop(),q_.test(_d(t).function||"")&&t.pop()),t.slice(0,nk).map(n=>({...n,filename:n.filename||_d(t).filename,function:n.function||ra}))}function _d(e){return e[e.length-1]||{}}const x0="<anonymous>";function di(e){try{return!e||typeof e!="function"?x0:e.name||x0}catch{return x0}}function Q_(e){const t=e.exception;if(t){const n=[];try{return t.values.forEach(r=>{r.stacktrace.frames&&n.push(...r.stacktrace.frames)}),n}catch{return}}}const tf={},J_={};function fa(e,t){tf[e]=tf[e]||[],tf[e].push(t)}function pa(e,t){J_[e]||(t(),J_[e]=!0)}function Tr(e,t){const n=e&&tf[e];if(n)for(const r of n)try{r(t)}catch(o){gc&&ke.error(`Error while triggering instrumentation handler.
Type: ${e}
Name: ${di(r)}
Error:`,o)}}function Ese(e){const t="console";fa(t,e),pa(t,Cse)}function Cse(){"console"in Ye&&Rg.forEach(function(e){e in Ye.console&&Bn(Ye.console,e,function(t){return ep[e]=t,function(...n){Tr("console",{args:n,level:e});const o=ep[e];o&&o.apply(Ye.console,n)}})})}const Pg=Ye;function ok(){if(!("fetch"in Pg))return!1;try{return new Headers,new Request("http://www.example.com"),new Response,!0}catch{return!1}}function Tg(e){return e&&/^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString())}function $se(){if(typeof EdgeRuntime=="string")return!0;if(!ok())return!1;if(Tg(Pg.fetch))return!0;let e=!1;const t=Pg.document;if(t&&typeof t.createElement=="function")try{const n=t.createElement("iframe");n.hidden=!0,t.head.appendChild(n),n.contentWindow&&n.contentWindow.fetch&&(e=Tg(n.contentWindow.fetch)),t.head.removeChild(n)}catch(n){gc&&ke.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ",n)}return e}const ik=1e3;function bc(){return Date.now()/ik}function Rse(){const{performance:e}=Ye;if(!e||!e.now)return bc;const t=Date.now()-e.now(),n=e.timeOrigin==null?t:e.timeOrigin;return()=>(n+e.now())/ik}const vo=Rse();(()=>{const{performance:e}=Ye;if(!e||!e.now)return;const t=3600*1e3,n=e.now(),r=Date.now(),o=e.timeOrigin?Math.abs(e.timeOrigin+n-r):t,i=o<t,a=e.timing&&e.timing.navigationStart,l=typeof a=="number"?Math.abs(a+n-r):t,u=l<t;return i||u?o<=l?e.timeOrigin:a:r})();function kse(e,t){const n="fetch";fa(n,e),pa(n,()=>Pse(void 0,t))}function Pse(e,t=!1){t&&!$se()||Bn(Ye,"fetch",function(n){return function(...r){const{method:o,url:i}=Tse(r),a={args:r,fetchData:{method:o,url:i},startTimestamp:vo()*1e3};e||Tr("fetch",{...a});const s=new Error().stack;return n.apply(Ye,r).then(async l=>(e?e(l):Tr("fetch",{...a,endTimestamp:vo()*1e3,response:l}),l),l=>{throw Tr("fetch",{...a,endTimestamp:vo()*1e3,error:l}),gb(l)&&l.stack===void 0&&(l.stack=s,na(l,"framesToPop",1)),l})}})}function Og(e,t){return!!e&&typeof e=="object"&&!!e[t]}function Z_(e){return typeof e=="string"?e:e?Og(e,"url")?e.url:e.toString?e.toString():"":""}function Tse(e){if(e.length===0)return{method:"GET",url:""};if(e.length===2){const[n,r]=e;return{url:Z_(n),method:Og(r,"method")?String(r.method).toUpperCase():"GET"}}const t=e[0];return{url:Z_(t),method:Og(t,"method")?String(t.method).toUpperCase():"GET"}}let Ed=null;function Ose(e){const t="error";fa(t,e),pa(t,Ise)}function Ise(){Ed=Ye.onerror,Ye.onerror=function(e,t,n,r,o){return Tr("error",{column:r,error:o,line:n,msg:e,url:t}),Ed&&!Ed.__SENTRY_LOADER__?Ed.apply(this,arguments):!1},Ye.onerror.__SENTRY_INSTRUMENTED__=!0}let Cd=null;function Nse(e){const t="unhandledrejection";fa(t,e),pa(t,Ase)}function Ase(){Cd=Ye.onunhandledrejection,Ye.onunhandledrejection=function(e){return Tr("unhandledrejection",e),Cd&&!Cd.__SENTRY_LOADER__?Cd.apply(this,arguments):!0},Ye.onunhandledrejection.__SENTRY_INSTRUMENTED__=!0}function Mse(){return"npm"}function Lse(){const e=typeof WeakSet=="function",t=e?new WeakSet:[];function n(o){if(e)return t.has(o)?!0:(t.add(o),!1);for(let i=0;i<t.length;i++)if(t[i]===o)return!0;return t.push(o),!1}function r(o){if(e)t.delete(o);else for(let i=0;i<t.length;i++)if(t[i]===o){t.splice(i,1);break}}return[n,r]}function fr(){const e=Ye,t=e.crypto||e.msCrypto;let n=()=>Math.random()*16;try{if(t&&t.randomUUID)return t.randomUUID().replace(/-/g,"");t&&t.getRandomValues&&(n=()=>{const r=new Uint8Array(1);return t.getRandomValues(r),r[0]})}catch{}return([1e7]+1e3+4e3+8e3+1e11).replace(/[018]/g,r=>(r^(n()&15)>>r/4).toString(16))}function ak(e){return e.exception&&e.exception.values?e.exception.values[0]:void 0}function zo(e){const{message:t,event_id:n}=e;if(t)return t;const r=ak(e);return r?r.type&&r.value?`${r.type}: ${r.value}`:r.type||r.value||n||"<unknown>":n||"<unknown>"}function Ig(e,t,n){const r=e.exception=e.exception||{},o=r.values=r.values||[],i=o[0]=o[0]||{};i.value||(i.value=t||""),i.type||(i.type=n||"Error")}function Wu(e,t){const n=ak(e);if(!n)return;const r={type:"generic",handled:!0},o=n.mechanism;if(n.mechanism={...r,...o,...t},t&&"data"in t){const i={...o&&o.data,...t.data};n.mechanism.data=i}}function eE(e){if(e&&e.__sentry_captured__)return!0;try{na(e,"__sentry_captured__",!0)}catch{}return!1}function sk(e){return Array.isArray(e)?e:[e]}function jo(e,t=100,n=1/0){try{return Ng("",e,t,n)}catch(r){return{ERROR:`**non-serializable** (${r})`}}}function lk(e,t=3,n=100*1024){const r=jo(e,t);return zse(r)>n?lk(e,t-1,n):r}function Ng(e,t,n=1/0,r=1/0,o=Lse()){const[i,a]=o;if(t==null||["boolean","string"].includes(typeof t)||typeof t=="number"&&Number.isFinite(t))return t;const s=Fse(e,t);if(!s.startsWith("[object "))return s;if(t.__sentry_skip_normalization__)return t;const l=typeof t.__sentry_override_normalization_depth__=="number"?t.__sentry_override_normalization_depth__:n;if(l===0)return s.replace("object ","");if(i(t))return"[Circular ~]";const u=t;if(u&&typeof u.toJSON=="function")try{const h=u.toJSON();return Ng("",h,l-1,r,o)}catch{}const c=Array.isArray(t)?[]:{};let d=0;const f=tk(t);for(const h in f){if(!Object.prototype.hasOwnProperty.call(f,h))continue;if(d>=r){c[h]="[MaxProperties ~]";break}const v=f[h];c[h]=Ng(h,v,l-1,r,o),d++}return a(t),c}function Fse(e,t){try{if(e==="domain"&&t&&typeof t=="object"&&t._events)return"[Domain]";if(e==="domainEmitter")return"[DomainEmitter]";if(typeof global<"u"&&t===global)return"[Global]";if(typeof window<"u"&&t===window)return"[Window]";if(typeof document<"u"&&t===document)return"[Document]";if(qR(t))return"[VueViewModel]";if(ose(t))return"[SyntheticEvent]";if(typeof t=="number"&&!Number.isFinite(t))return`[${t}]`;if(typeof t=="function")return`[Function: ${di(t)}]`;if(typeof t=="symbol")return`[${String(t)}]`;if(typeof t=="bigint")return`[BigInt: ${String(t)}]`;const n=Dse(t);return/^HTML(\w*)Element$/.test(n)?`[HTMLElement: ${n}]`:`[object ${n}]`}catch(n){return`**non-serializable** (${n})`}}function Dse(e){const t=Object.getPrototypeOf(e);return t?t.constructor.name:"null prototype"}function Bse(e){return~-encodeURI(e).split(/%..|./).length}function zse(e){return Bse(JSON.stringify(e))}var io;(function(e){e[e.PENDING=0]="PENDING";const n=1;e[e.RESOLVED=n]="RESOLVED";const r=2;e[e.REJECTED=r]="REJECTED"})(io||(io={}));function oa(e){return new ir(t=>{t(e)})}function tp(e){return new ir((t,n)=>{n(e)})}class ir{constructor(t){ir.prototype.__init.call(this),ir.prototype.__init2.call(this),ir.prototype.__init3.call(this),ir.prototype.__init4.call(this),this._state=io.PENDING,this._handlers=[];try{t(this._resolve,this._reject)}catch(n){this._reject(n)}}then(t,n){return new ir((r,o)=>{this._handlers.push([!1,i=>{if(!t)r(i);else try{r(t(i))}catch(a){o(a)}},i=>{if(!n)o(i);else try{r(n(i))}catch(a){o(a)}}]),this._executeHandlers()})}catch(t){return this.then(n=>n,t)}finally(t){return new ir((n,r)=>{let o,i;return this.then(a=>{i=!1,o=a,t&&t()},a=>{i=!0,o=a,t&&t()}).then(()=>{if(i){r(o);return}n(o)})})}__init(){this._resolve=t=>{this._setResult(io.RESOLVED,t)}}__init2(){this._reject=t=>{this._setResult(io.REJECTED,t)}}__init3(){this._setResult=(t,n)=>{if(this._state===io.PENDING){if(zh(n)){n.then(this._resolve,this._reject);return}this._state=t,this._value=n,this._executeHandlers()}}}__init4(){this._executeHandlers=()=>{if(this._state===io.PENDING)return;const t=this._handlers.slice();this._handlers=[],t.forEach(n=>{n[0]||(this._state===io.RESOLVED&&n[1](this._value),this._state===io.REJECTED&&n[2](this._value),n[0]=!0)})}}}function jse(e){const t=[];function n(){return e===void 0||t.length<e}function r(a){return t.splice(t.indexOf(a),1)[0]||Promise.resolve(void 0)}function o(a){if(!n())return tp(new Ur("Not adding Promise because buffer limit was reached."));const s=a();return t.indexOf(s)===-1&&t.push(s),s.then(()=>r(s)).then(null,()=>r(s).then(null,()=>{})),s}function i(a){return new ir((s,l)=>{let u=t.length;if(!u)return s(!0);const c=setTimeout(()=>{a&&a>0&&s(!1)},a);t.forEach(d=>{oa(d).then(()=>{--u||(clearTimeout(c),s(!0))},l)})})}return{$:t,add:o,drain:i}}function S0(e){if(!e)return{};const t=e.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);if(!t)return{};const n=t[6]||"",r=t[8]||"";return{host:t[4],path:t[5],protocol:t[2],search:n,hash:r,relative:t[5]+n+r}}function tE(e){return e.split(/\\?\//).filter(t=>t.length>0&&t!==",").length}const Use=["fatal","error","warning","log","info","debug"];function Wse(e){return e==="warn"?"warning":Use.includes(e)?e:"log"}const Hse="sentry-",Vse=/^sentry-/;function Gse(e){const t=Kse(e);if(!t)return;const n=Object.entries(t).reduce((r,[o,i])=>{if(o.match(Vse)){const a=o.slice(Hse.length);r[a]=i}return r},{});if(Object.keys(n).length>0)return n}function Kse(e){if(!(!e||!mo(e)&&!Array.isArray(e)))return Array.isArray(e)?e.reduce((t,n)=>{const r=nE(n);return Object.entries(r).forEach(([o,i])=>{t[o]=i}),t},{}):nE(e)}function nE(e){return e.split(",").map(t=>t.split("=").map(n=>decodeURIComponent(n.trim()))).reduce((t,[n,r])=>(n&&r&&(t[n]=r),t),{})}function xc(e,t=[]){return[e,t]}function Xse(e,t){const[n,r]=e;return[n,[...r,t]]}function rE(e,t){const n=e[1];for(const r of n){const o=r[0].type;if(t(r,o))return!0}return!1}function Ag(e){return Ye.__SENTRY__&&Ye.__SENTRY__.encodePolyfill?Ye.__SENTRY__.encodePolyfill(e):new TextEncoder().encode(e)}function Yse(e){const[t,n]=e;let r=JSON.stringify(t);function o(i){typeof r=="string"?r=typeof i=="string"?r+i:[Ag(r),i]:r.push(typeof i=="string"?Ag(i):i)}for(const i of n){const[a,s]=i;if(o(`
${JSON.stringify(a)}
`),typeof s=="string"||s instanceof Uint8Array)o(s);else{let l;try{l=JSON.stringify(s)}catch{l=JSON.stringify(jo(s))}o(l)}}return typeof r=="string"?r:qse(r)}function qse(e){const t=e.reduce((o,i)=>o+i.length,0),n=new Uint8Array(t);let r=0;for(const o of e)n.set(o,r),r+=o.length;return n}function Qse(e){const t=typeof e.data=="string"?Ag(e.data):e.data;return[lr({type:"attachment",length:t.length,filename:e.filename,content_type:e.contentType,attachment_type:e.attachmentType}),t]}const Jse={session:"session",sessions:"session",attachment:"attachment",transaction:"transaction",event:"error",client_report:"internal",user_report:"default",profile:"profile",profile_chunk:"profile",replay_event:"replay",replay_recording:"replay",check_in:"monitor",feedback:"feedback",span:"span",statsd:"metric_bucket"};function oE(e){return Jse[e]}function uk(e){if(!e||!e.sdk)return;const{name:t,version:n}=e.sdk;return{name:t,version:n}}function Zse(e,t,n,r){const o=e.sdkProcessingMetadata&&e.sdkProcessingMetadata.dynamicSamplingContext;return{event_id:e.event_id,sent_at:new Date().toISOString(),...t&&{sdk:t},...!!n&&r&&{dsn:Wh(r)},...o&&{trace:lr({...o})}}}function ele(e,t,n){const r=[{type:"client_report"},{timestamp:n||bc(),discarded_events:e}];return xc(t?{dsn:t}:{},[r])}const tle=60*1e3;function nle(e,t=Date.now()){const n=parseInt(`${e}`,10);if(!isNaN(n))return n*1e3;const r=Date.parse(`${e}`);return isNaN(r)?tle:r-t}function rle(e,t){return e[t]||e.all||0}function ole(e,t,n=Date.now()){return rle(e,t)>n}function ile(e,{statusCode:t,headers:n},r=Date.now()){const o={...e},i=n&&n["x-sentry-rate-limits"],a=n&&n["retry-after"];if(i)for(const s of i.trim().split(",")){const[l,u,,,c]=s.split(":",5),d=parseInt(l,10),f=(isNaN(d)?60:d)*1e3;if(!u)o.all=r+f;else for(const h of u.split(";"))h==="metric_bucket"?(!c||c.split(";").includes("custom"))&&(o[h]=r+f):o[h]=r+f}else a?o.all=r+nle(a,r):t===429&&(o.all=r+60*1e3);return o}function np(){return{traceId:fr(),spanId:fr().substring(16)}}const $d=Ye;function ale(){const e=$d.chrome,t=e&&e.app&&e.app.runtime,n="history"in $d&&!!$d.history.pushState&&!!$d.history.replaceState;return!t&&n}const at=typeof __SENTRY_DEBUG__>"u"||__SENTRY_DEBUG__;function Sc(){return wb(Ye),Ye}function wb(e){const t=e.__SENTRY__=e.__SENTRY__||{};return t.version=t.version||Wi,t[Wi]=t[Wi]||{}}function sle(e){const t=vo(),n={sid:fr(),init:!0,timestamp:t,started:t,duration:0,status:"ok",errors:0,ignoreDuration:!1,toJSON:()=>ule(n)};return e&&Is(n,e),n}function Is(e,t={}){if(t.user&&(!e.ipAddress&&t.user.ip_address&&(e.ipAddress=t.user.ip_address),!e.did&&!t.did&&(e.did=t.user.id||t.user.email||t.user.username)),e.timestamp=t.timestamp||vo(),t.abnormal_mechanism&&(e.abnormal_mechanism=t.abnormal_mechanism),t.ignoreDuration&&(e.ignoreDuration=t.ignoreDuration),t.sid&&(e.sid=t.sid.length===32?t.sid:fr()),t.init!==void 0&&(e.init=t.init),!e.did&&t.did&&(e.did=`${t.did}`),typeof t.started=="number"&&(e.started=t.started),e.ignoreDuration)e.duration=void 0;else if(typeof t.duration=="number")e.duration=t.duration;else{const n=e.timestamp-e.started;e.duration=n>=0?n:0}t.release&&(e.release=t.release),t.environment&&(e.environment=t.environment),!e.ipAddress&&t.ipAddress&&(e.ipAddress=t.ipAddress),!e.userAgent&&t.userAgent&&(e.userAgent=t.userAgent),typeof t.errors=="number"&&(e.errors=t.errors),t.status&&(e.status=t.status)}function lle(e,t){let n={};t?n={status:t}:e.status==="ok"&&(n={status:"exited"}),Is(e,n)}function ule(e){return lr({sid:`${e.sid}`,init:e.init,started:new Date(e.started*1e3).toISOString(),timestamp:new Date(e.timestamp*1e3).toISOString(),status:e.status,errors:e.errors,did:typeof e.did=="number"||typeof e.did=="string"?`${e.did}`:void 0,duration:e.duration,abnormal_mechanism:e.abnormal_mechanism,attrs:{release:e.release,environment:e.environment,ip_address:e.ipAddress,user_agent:e.userAgent}})}const Mg="_sentrySpan";function iE(e,t){t?na(e,Mg,t):delete e[Mg]}function Lg(e){return e[Mg]}const cle=100;class _b{constructor(){this._notifyingListeners=!1,this._scopeListeners=[],this._eventProcessors=[],this._breadcrumbs=[],this._attachments=[],this._user={},this._tags={},this._extra={},this._contexts={},this._sdkProcessingMetadata={},this._propagationContext=np()}clone(){const t=new _b;return t._breadcrumbs=[...this._breadcrumbs],t._tags={...this._tags},t._extra={...this._extra},t._contexts={...this._contexts},t._user=this._user,t._level=this._level,t._session=this._session,t._transactionName=this._transactionName,t._fingerprint=this._fingerprint,t._eventProcessors=[...this._eventProcessors],t._requestSession=this._requestSession,t._attachments=[...this._attachments],t._sdkProcessingMetadata={...this._sdkProcessingMetadata},t._propagationContext={...this._propagationContext},t._client=this._client,t._lastEventId=this._lastEventId,iE(t,Lg(this)),t}setClient(t){this._client=t}setLastEventId(t){this._lastEventId=t}getClient(){return this._client}lastEventId(){return this._lastEventId}addScopeListener(t){this._scopeListeners.push(t)}addEventProcessor(t){return this._eventProcessors.push(t),this}setUser(t){return this._user=t||{email:void 0,id:void 0,ip_address:void 0,username:void 0},this._session&&Is(this._session,{user:t}),this._notifyScopeListeners(),this}getUser(){return this._user}getRequestSession(){return this._requestSession}setRequestSession(t){return this._requestSession=t,this}setTags(t){return this._tags={...this._tags,...t},this._notifyScopeListeners(),this}setTag(t,n){return this._tags={...this._tags,[t]:n},this._notifyScopeListeners(),this}setExtras(t){return this._extra={...this._extra,...t},this._notifyScopeListeners(),this}setExtra(t,n){return this._extra={...this._extra,[t]:n},this._notifyScopeListeners(),this}setFingerprint(t){return this._fingerprint=t,this._notifyScopeListeners(),this}setLevel(t){return this._level=t,this._notifyScopeListeners(),this}setTransactionName(t){return this._transactionName=t,this._notifyScopeListeners(),this}setContext(t,n){return n===null?delete this._contexts[t]:this._contexts[t]=n,this._notifyScopeListeners(),this}setSession(t){return t?this._session=t:delete this._session,this._notifyScopeListeners(),this}getSession(){return this._session}update(t){if(!t)return this;const n=typeof t=="function"?t(this):t,[r,o]=n instanceof fi?[n.getScopeData(),n.getRequestSession()]:Os(n)?[t,t.requestSession]:[],{tags:i,extra:a,user:s,contexts:l,level:u,fingerprint:c=[],propagationContext:d}=r||{};return this._tags={...this._tags,...i},this._extra={...this._extra,...a},this._contexts={...this._contexts,...l},s&&Object.keys(s).length&&(this._user=s),u&&(this._level=u),c.length&&(this._fingerprint=c),d&&(this._propagationContext=d),o&&(this._requestSession=o),this}clear(){return this._breadcrumbs=[],this._tags={},this._extra={},this._user={},this._contexts={},this._level=void 0,this._transactionName=void 0,this._fingerprint=void 0,this._requestSession=void 0,this._session=void 0,iE(this,void 0),this._attachments=[],this._propagationContext=np(),this._notifyScopeListeners(),this}addBreadcrumb(t,n){const r=typeof n=="number"?n:cle;if(r<=0)return this;const o={timestamp:bc(),...t},i=this._breadcrumbs;return i.push(o),this._breadcrumbs=i.length>r?i.slice(-r):i,this._notifyScopeListeners(),this}getLastBreadcrumb(){return this._breadcrumbs[this._breadcrumbs.length-1]}clearBreadcrumbs(){return this._breadcrumbs=[],this._notifyScopeListeners(),this}addAttachment(t){return this._attachments.push(t),this}clearAttachments(){return this._attachments=[],this}getScopeData(){return{breadcrumbs:this._breadcrumbs,attachments:this._attachments,contexts:this._contexts,tags:this._tags,extra:this._extra,user:this._user,level:this._level,fingerprint:this._fingerprint||[],eventProcessors:this._eventProcessors,propagationContext:this._propagationContext,sdkProcessingMetadata:this._sdkProcessingMetadata,transactionName:this._transactionName,span:Lg(this)}}setSDKProcessingMetadata(t){return this._sdkProcessingMetadata={...this._sdkProcessingMetadata,...t},this}setPropagationContext(t){return this._propagationContext=t,this}getPropagationContext(){return this._propagationContext}captureException(t,n){const r=n&&n.event_id?n.event_id:fr();if(!this._client)return ke.warn("No client configured on scope - will not capture exception!"),r;const o=new Error("Sentry syntheticException");return this._client.captureException(t,{originalException:t,syntheticException:o,...n,event_id:r},this),r}captureMessage(t,n,r){const o=r&&r.event_id?r.event_id:fr();if(!this._client)return ke.warn("No client configured on scope - will not capture message!"),o;const i=new Error(t);return this._client.captureMessage(t,n,{originalException:t,syntheticException:i,...r,event_id:o},this),o}captureEvent(t,n){const r=n&&n.event_id?n.event_id:fr();return this._client?(this._client.captureEvent(t,{...n,event_id:r},this),r):(ke.warn("No client configured on scope - will not capture event!"),r)}_notifyScopeListeners(){this._notifyingListeners||(this._notifyingListeners=!0,this._scopeListeners.forEach(t=>{t(this)}),this._notifyingListeners=!1)}}const fi=_b;function dle(){return Uh("defaultCurrentScope",()=>new fi)}function fle(){return Uh("defaultIsolationScope",()=>new fi)}class ple{constructor(t,n){let r;t?r=t:r=new fi;let o;n?o=n:o=new fi,this._stack=[{scope:r}],this._isolationScope=o}withScope(t){const n=this._pushScope();let r;try{r=t(n)}catch(o){throw this._popScope(),o}return zh(r)?r.then(o=>(this._popScope(),o),o=>{throw this._popScope(),o}):(this._popScope(),r)}getClient(){return this.getStackTop().client}getScope(){return this.getStackTop().scope}getIsolationScope(){return this._isolationScope}getStackTop(){return this._stack[this._stack.length-1]}_pushScope(){const t=this.getScope().clone();return this._stack.push({client:this.getClient(),scope:t}),t}_popScope(){return this._stack.length<=1?!1:!!this._stack.pop()}}function Ns(){const e=Sc(),t=wb(e);return t.stack=t.stack||new ple(dle(),fle())}function hle(e){return Ns().withScope(e)}function mle(e,t){const n=Ns();return n.withScope(()=>(n.getStackTop().scope=e,t(e)))}function aE(e){return Ns().withScope(()=>e(Ns().getIsolationScope()))}function vle(){return{withIsolationScope:aE,withScope:hle,withSetScope:mle,withSetIsolationScope:(e,t)=>aE(t),getCurrentScope:()=>Ns().getScope(),getIsolationScope:()=>Ns().getIsolationScope()}}function Hh(e){const t=wb(e);return t.acs?t.acs:vle()}function yr(){const e=Sc();return Hh(e).getCurrentScope()}function ha(){const e=Sc();return Hh(e).getIsolationScope()}function gle(){return Uh("globalScope",()=>new fi)}function yle(...e){const t=Sc(),n=Hh(t);if(e.length===2){const[r,o]=e;return r?n.withSetScope(r,o):n.withScope(o)}return n.withScope(e[0])}function tn(){return yr().getClient()}const ble="_sentryMetrics";function xle(e){const t=e[ble];if(!t)return;const n={};for(const[,[r,o]]of t)(n[r]||(n[r]=[])).push(lr(o));return n}const Eb="sentry.source",Sle="sentry.sample_rate",ck="sentry.op",dk="sentry.origin",wle=0,_le=1,Ele=1;function Cle(e){const{spanId:t,traceId:n}=e.spanContext(),{parent_span_id:r}=As(e);return lr({parent_span_id:r,span_id:t,trace_id:n})}function sE(e){return typeof e=="number"?lE(e):Array.isArray(e)?e[0]+e[1]/1e9:e instanceof Date?lE(e.getTime()):vo()}function lE(e){return e>9999999999?e/1e3:e}function As(e){if(Rle(e))return e.getSpanJSON();try{const{spanId:t,traceId:n}=e.spanContext();if($le(e)){const{attributes:r,startTime:o,name:i,endTime:a,parentSpanId:s,status:l}=e;return lr({span_id:t,trace_id:n,data:r,description:i,parent_span_id:s,start_timestamp:sE(o),timestamp:sE(a)||void 0,status:Ple(l),op:r[ck],origin:r[dk],_metrics_summary:xle(e)})}return{span_id:t,trace_id:n}}catch{return{}}}function $le(e){const t=e;return!!t.attributes&&!!t.startTime&&!!t.name&&!!t.endTime&&!!t.status}function Rle(e){return typeof e.getSpanJSON=="function"}function kle(e){const{traceFlags:t}=e.spanContext();return t===Ele}function Ple(e){if(!(!e||e.code===wle))return e.code===_le?"ok":e.message||"unknown_error"}const Tle="_sentryRootSpan";function Cb(e){return e[Tle]||e}function fk(){const e=Sc(),t=Hh(e);return t.getActiveSpan?t.getActiveSpan():Lg(yr())}function Ole(e){if(typeof __SENTRY_TRACING__=="boolean"&&!__SENTRY_TRACING__)return!1;const t=tn(),n=e||t&&t.getOptions();return!!n&&(n.enableTracing||"tracesSampleRate"in n||"tracesSampler"in n)}const $b="production",Ile="_frozenDsc";function pk(e,t){const n=t.getOptions(),{publicKey:r}=t.getDsn()||{},o=lr({environment:n.environment||$b,release:n.release,public_key:r,trace_id:e});return t.emit("createDsc",o),o}function Nle(e){const t=tn();if(!t)return{};const n=pk(As(e).trace_id||"",t),r=Cb(e),o=r[Ile];if(o)return o;const i=r.spanContext().traceState,a=i&&i.get("sentry.dsc"),s=a&&Gse(a);if(s)return s;const l=As(r),u=l.data||{},c=u[Sle];c!=null&&(n.sample_rate=`${c}`);const d=u[Eb],f=l.description;return d!=="url"&&f&&(n.transaction=f),Ole()&&(n.sampled=String(kle(r))),t.emit("createDsc",n,r),n}function Ale(e){if(typeof e=="boolean")return Number(e);const t=typeof e=="string"?parseFloat(e):e;if(typeof t!="number"||isNaN(t)||t<0||t>1){at&&ke.warn(`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(e)} of type ${JSON.stringify(typeof e)}.`);return}return t}function Mle(e,t){return t&&(e.sdk=e.sdk||{},e.sdk.name=e.sdk.name||t.name,e.sdk.version=e.sdk.version||t.version,e.sdk.integrations=[...e.sdk.integrations||[],...t.integrations||[]],e.sdk.packages=[...e.sdk.packages||[],...t.packages||[]]),e}function Lle(e,t,n,r){const o=uk(n),i={sent_at:new Date().toISOString(),...o&&{sdk:o},...!!r&&t&&{dsn:Wh(t)}},a="aggregates"in e?[{type:"sessions"},e]:[{type:"session"},e.toJSON()];return xc(i,[a])}function Fle(e,t,n,r){const o=uk(n),i=e.type&&e.type!=="replay_event"?e.type:"event";Mle(e,n&&n.sdk);const a=Zse(e,o,r,t);return delete e.sdkProcessingMetadata,xc(a,[[{type:i},e]])}function Fg(e,t,n,r=0){return new ir((o,i)=>{const a=e[r];if(t===null||typeof a!="function")o(t);else{const s=a({...t},n);at&&a.id&&s===null&&ke.log(`Event processor "${a.id}" dropped event`),zh(s)?s.then(l=>Fg(e,l,n,r+1).then(o)).then(null,i):Fg(e,s,n,r+1).then(o).then(null,i)}})}function Dle(e,t){const{fingerprint:n,span:r,breadcrumbs:o,sdkProcessingMetadata:i}=t;Ble(e,t),r&&Ule(e,r),Wle(e,n),zle(e,o),jle(e,i)}function uE(e,t){const{extra:n,tags:r,user:o,contexts:i,level:a,sdkProcessingMetadata:s,breadcrumbs:l,fingerprint:u,eventProcessors:c,attachments:d,propagationContext:f,transactionName:h,span:v}=t;Fl(e,"extra",n),Fl(e,"tags",r),Fl(e,"user",o),Fl(e,"contexts",i),Fl(e,"sdkProcessingMetadata",s),a&&(e.level=a),h&&(e.transactionName=h),v&&(e.span=v),l.length&&(e.breadcrumbs=[...e.breadcrumbs,...l]),u.length&&(e.fingerprint=[...e.fingerprint,...u]),c.length&&(e.eventProcessors=[...e.eventProcessors,...c]),d.length&&(e.attachments=[...e.attachments,...d]),e.propagationContext={...e.propagationContext,...f}}function Fl(e,t,n){if(n&&Object.keys(n).length){e[t]={...e[t]};for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[t][r]=n[r])}}function Ble(e,t){const{extra:n,tags:r,user:o,contexts:i,level:a,transactionName:s}=t,l=lr(n);l&&Object.keys(l).length&&(e.extra={...l,...e.extra});const u=lr(r);u&&Object.keys(u).length&&(e.tags={...u,...e.tags});const c=lr(o);c&&Object.keys(c).length&&(e.user={...c,...e.user});const d=lr(i);d&&Object.keys(d).length&&(e.contexts={...d,...e.contexts}),a&&(e.level=a),s&&e.type!=="transaction"&&(e.transaction=s)}function zle(e,t){const n=[...e.breadcrumbs||[],...t];e.breadcrumbs=n.length?n:void 0}function jle(e,t){e.sdkProcessingMetadata={...e.sdkProcessingMetadata,...t}}function Ule(e,t){e.contexts={trace:Cle(t),...e.contexts},e.sdkProcessingMetadata={dynamicSamplingContext:Nle(t),...e.sdkProcessingMetadata};const n=Cb(t),r=As(n).description;r&&!e.transaction&&e.type==="transaction"&&(e.transaction=r)}function Wle(e,t){e.fingerprint=e.fingerprint?sk(e.fingerprint):[],t&&(e.fingerprint=e.fingerprint.concat(t)),e.fingerprint&&!e.fingerprint.length&&delete e.fingerprint}function Hle(e,t,n,r,o,i){const{normalizeDepth:a=3,normalizeMaxBreadth:s=1e3}=e,l={...t,event_id:t.event_id||n.event_id||fr(),timestamp:t.timestamp||bc()},u=n.integrations||e.integrations.map(b=>b.name);Vle(l,e),Xle(l,u),o&&o.emit("applyFrameMetadata",t),t.type===void 0&&Gle(l,e.stackParser);const c=qle(r,n.captureContext);n.mechanism&&Wu(l,n.mechanism);const d=o?o.getEventProcessors():[],f=gle().getScopeData();if(i){const b=i.getScopeData();uE(f,b)}if(c){const b=c.getScopeData();uE(f,b)}const h=[...n.attachments||[],...f.attachments];h.length&&(n.attachments=h),Dle(l,f);const v=[...d,...f.eventProcessors];return Fg(v,l,n).then(b=>(b&&Kle(b),typeof a=="number"&&a>0?Yle(b,a,s):b))}function Vle(e,t){const{environment:n,release:r,dist:o,maxValueLength:i=250}=t;"environment"in e||(e.environment="environment"in t?n:$b),e.release===void 0&&r!==void 0&&(e.release=r),e.dist===void 0&&o!==void 0&&(e.dist=o),e.message&&(e.message=is(e.message,i));const a=e.exception&&e.exception.values&&e.exception.values[0];a&&a.value&&(a.value=is(a.value,i));const s=e.request;s&&s.url&&(s.url=is(s.url,i))}const cE=new WeakMap;function Gle(e,t){const n=Ye._sentryDebugIds;if(!n)return;let r;const o=cE.get(t);o?r=o:(r=new Map,cE.set(t,r));const i=Object.entries(n).reduce((a,[s,l])=>{let u;const c=r.get(s);c?u=c:(u=t(s),r.set(s,u));for(let d=u.length-1;d>=0;d--){const f=u[d];if(f.filename){a[f.filename]=l;break}}return a},{});try{e.exception.values.forEach(a=>{a.stacktrace.frames.forEach(s=>{s.filename&&(s.debug_id=i[s.filename])})})}catch{}}function Kle(e){const t={};try{e.exception.values.forEach(r=>{r.stacktrace.frames.forEach(o=>{o.debug_id&&(o.abs_path?t[o.abs_path]=o.debug_id:o.filename&&(t[o.filename]=o.debug_id),delete o.debug_id)})})}catch{}if(Object.keys(t).length===0)return;e.debug_meta=e.debug_meta||{},e.debug_meta.images=e.debug_meta.images||[];const n=e.debug_meta.images;Object.entries(t).forEach(([r,o])=>{n.push({type:"sourcemap",code_file:r,debug_id:o})})}function Xle(e,t){t.length>0&&(e.sdk=e.sdk||{},e.sdk.integrations=[...e.sdk.integrations||[],...t])}function Yle(e,t,n){if(!e)return null;const r={...e,...e.breadcrumbs&&{breadcrumbs:e.breadcrumbs.map(o=>({...o,...o.data&&{data:jo(o.data,t,n)}}))},...e.user&&{user:jo(e.user,t,n)},...e.contexts&&{contexts:jo(e.contexts,t,n)},...e.extra&&{extra:jo(e.extra,t,n)}};return e.contexts&&e.contexts.trace&&r.contexts&&(r.contexts.trace=e.contexts.trace,e.contexts.trace.data&&(r.contexts.trace.data=jo(e.contexts.trace.data,t,n))),e.spans&&(r.spans=e.spans.map(o=>({...o,...o.data&&{data:jo(o.data,t,n)}}))),r}function qle(e,t){if(!t)return e;const n=e?e.clone():new fi;return n.update(t),n}function Qle(e){if(e)return Jle(e)?{captureContext:e}:eue(e)?{captureContext:e}:e}function Jle(e){return e instanceof fi||typeof e=="function"}const Zle=["user","level","extra","contexts","tags","fingerprint","requestSession","propagationContext"];function eue(e){return Object.keys(e).some(t=>Zle.includes(t))}function tue(e,t){return yr().captureException(e,Qle(t))}function hk(e,t){return yr().captureEvent(e,t)}function nue(e,t){ha().setContext(e,t)}function dE(e){const t=tn(),n=ha(),r=yr(),{release:o,environment:i=$b}=t&&t.getOptions()||{},{userAgent:a}=Ye.navigator||{},s=sle({release:o,environment:i,user:r.getUser()||n.getUser(),...a&&{userAgent:a},...e}),l=n.getSession();return l&&l.status==="ok"&&Is(l,{status:"exited"}),mk(),n.setSession(s),r.setSession(s),s}function mk(){const e=ha(),t=yr(),n=t.getSession()||e.getSession();n&&lle(n),vk(),e.setSession(),t.setSession()}function vk(){const e=ha(),t=yr(),n=tn(),r=t.getSession()||e.getSession();r&&n&&n.captureSession(r)}function fE(e=!1){if(e){mk();return}vk()}const rue="7";function oue(e){const t=e.protocol?`${e.protocol}:`:"",n=e.port?`:${e.port}`:"";return`${t}//${e.host}${n}${e.path?`/${e.path}`:""}/api/`}function iue(e){return`${oue(e)}${e.projectId}/envelope/`}function aue(e,t){return bse({sentry_key:e.publicKey,sentry_version:rue,...t&&{sentry_client:`${t.name}/${t.version}`}})}function sue(e,t,n){return t||`${iue(e)}?${aue(e,n)}`}const pE=[];function lue(e){const t={};return e.forEach(n=>{const{name:r}=n,o=t[r];o&&!o.isDefaultInstance&&n.isDefaultInstance||(t[r]=n)}),Object.values(t)}function uue(e){const t=e.defaultIntegrations||[],n=e.integrations;t.forEach(a=>{a.isDefaultInstance=!0});let r;Array.isArray(n)?r=[...t,...n]:typeof n=="function"?r=sk(n(t)):r=t;const o=lue(r),i=o.findIndex(a=>a.name==="Debug");if(i>-1){const[a]=o.splice(i,1);o.push(a)}return o}function cue(e,t){const n={};return t.forEach(r=>{r&&gk(e,r,n)}),n}function hE(e,t){for(const n of t)n&&n.afterAllSetup&&n.afterAllSetup(e)}function gk(e,t,n){if(n[t.name]){at&&ke.log(`Integration skipped because it was already installed: ${t.name}`);return}if(n[t.name]=t,pE.indexOf(t.name)===-1&&typeof t.setupOnce=="function"&&(t.setupOnce(),pE.push(t.name)),t.setup&&typeof t.setup=="function"&&t.setup(e),typeof t.preprocessEvent=="function"){const r=t.preprocessEvent.bind(t);e.on("preprocessEvent",(o,i)=>r(o,i,e))}if(typeof t.processEvent=="function"){const r=t.processEvent.bind(t),o=Object.assign((i,a)=>r(i,a,e),{id:t.name});e.addEventProcessor(o)}at&&ke.log(`Integration installed: ${t.name}`)}const mE="Not capturing exception because it's already been captured.";class due{constructor(t){if(this._options=t,this._integrations={},this._numProcessing=0,this._outcomes={},this._hooks={},this._eventProcessors=[],t.dsn?this._dsn=yse(t.dsn):at&&ke.warn("No DSN provided, client will not send events."),this._dsn){const n=sue(this._dsn,t.tunnel,t._metadata?t._metadata.sdk:void 0);this._transport=t.transport({tunnel:this._options.tunnel,recordDroppedEvent:this.recordDroppedEvent.bind(this),...t.transportOptions,url:n})}}captureException(t,n,r){const o=fr();if(eE(t))return at&&ke.log(mE),o;const i={event_id:o,...n};return this._process(this.eventFromException(t,i).then(a=>this._captureEvent(a,i,r))),i.event_id}captureMessage(t,n,r,o){const i={event_id:fr(),...r},a=yb(t)?t:String(t),s=bb(t)?this.eventFromMessage(a,n,i):this.eventFromException(t,i);return this._process(s.then(l=>this._captureEvent(l,i,o))),i.event_id}captureEvent(t,n,r){const o=fr();if(n&&n.originalException&&eE(n.originalException))return at&&ke.log(mE),o;const i={event_id:o,...n},s=(t.sdkProcessingMetadata||{}).capturedSpanScope;return this._process(this._captureEvent(t,i,s||r)),i.event_id}captureSession(t){typeof t.release!="string"?at&&ke.warn("Discarded session because of missing or non-string release"):(this.sendSession(t),Is(t,{init:!1}))}getDsn(){return this._dsn}getOptions(){return this._options}getSdkMetadata(){return this._options._metadata}getTransport(){return this._transport}flush(t){const n=this._transport;return n?(this.emit("flush"),this._isClientDoneProcessing(t).then(r=>n.flush(t).then(o=>r&&o))):oa(!0)}close(t){return this.flush(t).then(n=>(this.getOptions().enabled=!1,this.emit("close"),n))}getEventProcessors(){return this._eventProcessors}addEventProcessor(t){this._eventProcessors.push(t)}init(){(this._isEnabled()||this._options.integrations.some(({name:t})=>t.startsWith("Spotlight")))&&this._setupIntegrations()}getIntegrationByName(t){return this._integrations[t]}addIntegration(t){const n=this._integrations[t.name];gk(this,t,this._integrations),n||hE(this,[t])}sendEvent(t,n={}){this.emit("beforeSendEvent",t,n);let r=Fle(t,this._dsn,this._options._metadata,this._options.tunnel);for(const i of n.attachments||[])r=Xse(r,Qse(i));const o=this.sendEnvelope(r);o&&o.then(i=>this.emit("afterSendEvent",t,i),null)}sendSession(t){const n=Lle(t,this._dsn,this._options._metadata,this._options.tunnel);this.sendEnvelope(n)}recordDroppedEvent(t,n,r){if(this._options.sendClientReports){const o=typeof r=="number"?r:1,i=`${t}:${n}`;at&&ke.log(`Recording outcome: "${i}"${o>1?` (${o} times)`:""}`),this._outcomes[i]=(this._outcomes[i]||0)+o}}on(t,n){const r=this._hooks[t]=this._hooks[t]||[];return r.push(n),()=>{const o=r.indexOf(n);o>-1&&r.splice(o,1)}}emit(t,...n){const r=this._hooks[t];r&&r.forEach(o=>o(...n))}sendEnvelope(t){return this.emit("beforeEnvelope",t),this._isEnabled()&&this._transport?this._transport.send(t).then(null,n=>(at&&ke.error("Error while sending envelope:",n),n)):(at&&ke.error("Transport disabled"),oa({}))}_setupIntegrations(){const{integrations:t}=this._options;this._integrations=cue(this,t),hE(this,t)}_updateSessionFromEvent(t,n){let r=!1,o=!1;const i=n.exception&&n.exception.values;if(i){o=!0;for(const l of i){const u=l.mechanism;if(u&&u.handled===!1){r=!0;break}}}const a=t.status==="ok";(a&&t.errors===0||a&&r)&&(Is(t,{...r&&{status:"crashed"},errors:t.errors||Number(o||r)}),this.captureSession(t))}_isClientDoneProcessing(t){return new ir(n=>{let r=0;const o=1,i=setInterval(()=>{this._numProcessing==0?(clearInterval(i),n(!0)):(r+=o,t&&r>=t&&(clearInterval(i),n(!1)))},o)})}_isEnabled(){return this.getOptions().enabled!==!1&&this._transport!==void 0}_prepareEvent(t,n,r,o=ha()){const i=this.getOptions(),a=Object.keys(this._integrations);return!n.integrations&&a.length>0&&(n.integrations=a),this.emit("preprocessEvent",t,n),t.type||o.setLastEventId(t.event_id||n.event_id),Hle(i,t,n,r,this,o).then(s=>{if(s===null)return s;const l={...o.getPropagationContext(),...r?r.getPropagationContext():void 0};if(!(s.contexts&&s.contexts.trace)&&l){const{traceId:c,spanId:d,parentSpanId:f,dsc:h}=l;s.contexts={trace:lr({trace_id:c,span_id:d,parent_span_id:f}),...s.contexts};const v=h||pk(c,this);s.sdkProcessingMetadata={dynamicSamplingContext:v,...s.sdkProcessingMetadata}}return s})}_captureEvent(t,n={},r){return this._processEvent(t,n,r).then(o=>o.event_id,o=>{if(at){const i=o;i.logLevel==="log"?ke.log(i.message):ke.warn(i)}})}_processEvent(t,n,r){const o=this.getOptions(),{sampleRate:i}=o,a=bk(t),s=yk(t),l=t.type||"error",u=`before send for type \`${l}\``,c=typeof i>"u"?void 0:Ale(i);if(s&&typeof c=="number"&&Math.random()>c)return this.recordDroppedEvent("sample_rate","error",t),tp(new Ur(`Discarding event because it's not included in the random sample (sampling rate = ${i})`,"log"));const d=l==="replay_event"?"replay":l,h=(t.sdkProcessingMetadata||{}).capturedSpanIsolationScope;return this._prepareEvent(t,n,r,h).then(v=>{if(v===null)throw this.recordDroppedEvent("event_processor",d,t),new Ur("An event processor returned `null`, will not send event.","log");if(n.data&&n.data.__sentry__===!0)return v;const b=pue(this,o,v,n);return fue(b,u)}).then(v=>{if(v===null){if(this.recordDroppedEvent("before_send",d,t),a){const m=1+(t.spans||[]).length;this.recordDroppedEvent("before_send","span",m)}throw new Ur(`${u} returned \`null\`, will not send event.`,"log")}const y=r&&r.getSession();if(!a&&y&&this._updateSessionFromEvent(y,v),a){const p=v.sdkProcessingMetadata&&v.sdkProcessingMetadata.spanCountBeforeProcessing||0,m=v.spans?v.spans.length:0,g=p-m;g>0&&this.recordDroppedEvent("before_send","span",g)}const b=v.transaction_info;if(a&&b&&v.transaction!==t.transaction){const p="custom";v.transaction_info={...b,source:p}}return this.sendEvent(v,n),v}).then(null,v=>{throw v instanceof Ur?v:(this.captureException(v,{data:{__sentry__:!0},originalException:v}),new Ur(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${v}`))})}_process(t){this._numProcessing++,t.then(n=>(this._numProcessing--,n),n=>(this._numProcessing--,n))}_clearOutcomes(){const t=this._outcomes;return this._outcomes={},Object.entries(t).map(([n,r])=>{const[o,i]=n.split(":");return{reason:o,category:i,quantity:r}})}_flushOutcomes(){at&&ke.log("Flushing outcomes...");const t=this._clearOutcomes();if(t.length===0){at&&ke.log("No outcomes to send");return}if(!this._dsn){at&&ke.log("No dsn provided, will not send outcomes");return}at&&ke.log("Sending outcomes:",t);const n=ele(t,this._options.tunnel&&Wh(this._dsn));this.sendEnvelope(n)}}function fue(e,t){const n=`${t} must return \`null\` or a valid event.`;if(zh(e))return e.then(r=>{if(!Os(r)&&r!==null)throw new Ur(n);return r},r=>{throw new Ur(`${t} rejected with ${r}`)});if(!Os(e)&&e!==null)throw new Ur(n);return e}function pue(e,t,n,r){const{beforeSend:o,beforeSendTransaction:i,beforeSendSpan:a}=t;if(yk(n)&&o)return o(n,r);if(bk(n)){if(n.spans&&a){const s=[];for(const l of n.spans){const u=a(l);u?s.push(u):e.recordDroppedEvent("before_send","span")}n.spans=s}if(i){if(n.spans){const s=n.spans.length;n.sdkProcessingMetadata={...n.sdkProcessingMetadata,spanCountBeforeProcessing:s}}return i(n,r)}}return n}function yk(e){return e.type===void 0}function bk(e){return e.type==="transaction"}function hue(e,t){t.debug===!0&&(at?ke.enable():yc(()=>{console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.")})),yr().update(t.initialScope);const r=new e(t);return mue(r),r.init(),r}function mue(e){yr().setClient(e)}const vue=64;function gue(e,t,n=jse(e.bufferSize||vue)){let r={};const o=a=>n.drain(a);function i(a){const s=[];if(rE(a,(d,f)=>{const h=oE(f);if(ole(r,h)){const v=vE(d,f);e.recordDroppedEvent("ratelimit_backoff",h,v)}else s.push(d)}),s.length===0)return oa({});const l=xc(a[0],s),u=d=>{rE(l,(f,h)=>{const v=vE(f,h);e.recordDroppedEvent(d,oE(h),v)})},c=()=>t({body:Yse(l)}).then(d=>(d.statusCode!==void 0&&(d.statusCode<200||d.statusCode>=300)&&at&&ke.warn(`Sentry responded with status code ${d.statusCode} to sent event.`),r=ile(r,d),d),d=>{throw u("network_error"),d});return n.add(c).then(d=>d,d=>{if(d instanceof Ur)return at&&ke.error("Skipped sending event because buffer is full."),u("queue_overflow"),oa({});throw d})}return{send:i,flush:o}}function vE(e,t){if(!(t!=="event"&&t!=="transaction"))return Array.isArray(e)?e[1]:void 0}function xk(e,t,n=[t],r="npm"){const o=e._metadata||{};o.sdk||(o.sdk={name:`sentry.javascript.${t}`,packages:n.map(i=>({name:`${r}:@sentry/${i}`,version:Wi})),version:Wi}),e._metadata=o}const yue=100;function ia(e,t){const n=tn(),r=ha();if(!n)return;const{beforeBreadcrumb:o=null,maxBreadcrumbs:i=yue}=n.getOptions();if(i<=0)return;const s={timestamp:bc(),...e},l=o?yc(()=>o(s,t)):s;l!==null&&(n.emit&&n.emit("beforeAddBreadcrumb",l,t),r.addBreadcrumb(l,i))}let gE;const bue="FunctionToString",yE=new WeakMap,xue=()=>({name:bue,setupOnce(){gE=Function.prototype.toString;try{Function.prototype.toString=function(...e){const t=Sb(this),n=yE.has(tn())&&t!==void 0?t:this;return gE.apply(n,e)}}catch{}},setup(e){yE.set(e,!0)}}),Sue=xue,wue=[/^Script error\.?$/,/^Javascript error: Script error\.? on line 0$/,/^ResizeObserver loop completed with undelivered notifications.$/,/^Cannot redefine property: googletag$/,"undefined is not an object (evaluating 'a.L')",`can't redefine non-configurable property "solana"`,"vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)","Can't find variable: _AutofillCallbackHandler"],_ue="InboundFilters",Eue=(e={})=>({name:_ue,processEvent(t,n,r){const o=r.getOptions(),i=$ue(e,o);return Rue(t,i)?null:t}}),Cue=Eue;function $ue(e={},t={}){return{allowUrls:[...e.allowUrls||[],...t.allowUrls||[]],denyUrls:[...e.denyUrls||[],...t.denyUrls||[]],ignoreErrors:[...e.ignoreErrors||[],...t.ignoreErrors||[],...e.disableErrorDefaults?[]:wue],ignoreTransactions:[...e.ignoreTransactions||[],...t.ignoreTransactions||[]],ignoreInternal:e.ignoreInternal!==void 0?e.ignoreInternal:!0}}function Rue(e,t){return t.ignoreInternal&&Nue(e)?(at&&ke.warn(`Event dropped due to being internal Sentry Error.
Event: ${zo(e)}`),!0):kue(e,t.ignoreErrors)?(at&&ke.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${zo(e)}`),!0):Mue(e)?(at&&ke.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${zo(e)}`),!0):Pue(e,t.ignoreTransactions)?(at&&ke.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${zo(e)}`),!0):Tue(e,t.denyUrls)?(at&&ke.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${zo(e)}.
Url: ${rp(e)}`),!0):Oue(e,t.allowUrls)?!1:(at&&ke.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${zo(e)}.
Url: ${rp(e)}`),!0)}function kue(e,t){return e.type||!t||!t.length?!1:Iue(e).some(n=>jh(n,t))}function Pue(e,t){if(e.type!=="transaction"||!t||!t.length)return!1;const n=e.transaction;return n?jh(n,t):!1}function Tue(e,t){if(!t||!t.length)return!1;const n=rp(e);return n?jh(n,t):!1}function Oue(e,t){if(!t||!t.length)return!0;const n=rp(e);return n?jh(n,t):!0}function Iue(e){const t=[];e.message&&t.push(e.message);let n;try{n=e.exception.values[e.exception.values.length-1]}catch{}return n&&n.value&&(t.push(n.value),n.type&&t.push(`${n.type}: ${n.value}`)),t}function Nue(e){try{return e.exception.values[0].type==="SentryError"}catch{}return!1}function Aue(e=[]){for(let t=e.length-1;t>=0;t--){const n=e[t];if(n&&n.filename!=="<anonymous>"&&n.filename!=="[native code]")return n.filename||null}return null}function rp(e){try{let t;try{t=e.exception.values[0].stacktrace.frames}catch{}return t?Aue(t):null}catch{return at&&ke.error(`Cannot extract url for event ${zo(e)}`),null}}function Mue(e){return e.type||!e.exception||!e.exception.values||e.exception.values.length===0?!1:!e.message&&!e.exception.values.some(t=>t.stacktrace||t.type&&t.type!=="Error"||t.value)}const Lue="Dedupe",Fue=()=>{let e;return{name:Lue,processEvent(t){if(t.type)return t;try{if(Bue(t,e))return at&&ke.warn("Event dropped due to being a duplicate of previously captured event."),null}catch{}return e=t}}},Due=Fue;function Bue(e,t){return t?!!(zue(e,t)||jue(e,t)):!1}function zue(e,t){const n=e.message,r=t.message;return!(!n&&!r||n&&!r||!n&&r||n!==r||!wk(e,t)||!Sk(e,t))}function jue(e,t){const n=bE(t),r=bE(e);return!(!n||!r||n.type!==r.type||n.value!==r.value||!wk(e,t)||!Sk(e,t))}function Sk(e,t){let n=Q_(e),r=Q_(t);if(!n&&!r)return!0;if(n&&!r||!n&&r||(n=n,r=r,r.length!==n.length))return!1;for(let o=0;o<r.length;o++){const i=r[o],a=n[o];if(i.filename!==a.filename||i.lineno!==a.lineno||i.colno!==a.colno||i.function!==a.function)return!1}return!0}function wk(e,t){let n=e.fingerprint,r=t.fingerprint;if(!n&&!r)return!0;if(n&&!r||!n&&r)return!1;n=n,r=r;try{return n.join("")===r.join("")}catch{return!1}}function bE(e){return e.exception&&e.exception.values&&e.exception.values[0]}const lt=Ye;let Dg=0;function _k(){return Dg>0}function Uue(){Dg++,setTimeout(()=>{Dg--})}function Ms(e,t={},n){if(typeof e!="function")return e;try{const o=e.__sentry_wrapped__;if(o)return typeof o=="function"?o:e;if(Sb(e))return e}catch{return e}const r=function(){const o=Array.prototype.slice.call(arguments);try{const i=o.map(a=>Ms(a,t));return e.apply(this,i)}catch(i){throw Uue(),yle(a=>{a.addEventProcessor(s=>(t.mechanism&&(Ig(s,void 0,void 0),Wu(s,t.mechanism)),s.extra={...s.extra,arguments:o},s)),tue(i)}),i}};try{for(const o in e)Object.prototype.hasOwnProperty.call(e,o)&&(r[o]=e[o])}catch{}ek(r,e),na(e,"__sentry_wrapped__",r);try{Object.getOwnPropertyDescriptor(r,"name").configurable&&Object.defineProperty(r,"name",{get(){return e.name}})}catch{}return r}const wc=typeof __SENTRY_DEBUG__>"u"||__SENTRY_DEBUG__;function Rb(e,t){const n=kb(e,t),r={type:Kue(t),value:Xue(t)};return n.length&&(r.stacktrace={frames:n}),r.type===void 0&&r.value===""&&(r.value="Unrecoverable error caught"),r}function Wue(e,t,n,r){const o=tn(),i=o&&o.getOptions().normalizeDepth,a=Zue(t),s={__serialized__:lk(t,i)};if(a)return{exception:{values:[Rb(e,a)]},extra:s};const l={exception:{values:[{type:Bh(t)?t.constructor.name:r?"UnhandledRejection":"Error",value:Que(t,{isUnhandledRejection:r})}]},extra:s};if(n){const u=kb(e,n);u.length&&(l.exception.values[0].stacktrace={frames:u})}return l}function w0(e,t){return{exception:{values:[Rb(e,t)]}}}function kb(e,t){const n=t.stacktrace||t.stack||"",r=Vue(t),o=Gue(t);try{return e(n,r,o)}catch{}return[]}const Hue=/Minified React error #\d+;/i;function Vue(e){return e&&Hue.test(e.message)?1:0}function Gue(e){return typeof e.framesToPop=="number"?e.framesToPop:0}function Ek(e){return typeof WebAssembly<"u"&&typeof WebAssembly.Exception<"u"?e instanceof WebAssembly.Exception:!1}function Kue(e){const t=e&&e.name;return!t&&Ek(e)?e.message&&Array.isArray(e.message)&&e.message.length==2?e.message[0]:"WebAssembly.Exception":t}function Xue(e){const t=e&&e.message;return t?t.error&&typeof t.error.message=="string"?t.error.message:Ek(e)&&Array.isArray(e.message)&&e.message.length==2?e.message[1]:t:"No error message"}function Yue(e,t,n,r){const o=n&&n.syntheticException||void 0,i=Pb(e,t,o,r);return Wu(i),i.level="error",n&&n.event_id&&(i.event_id=n.event_id),oa(i)}function que(e,t,n="info",r,o){const i=r&&r.syntheticException||void 0,a=Bg(e,t,i,o);return a.level=n,r&&r.event_id&&(a.event_id=r.event_id),oa(a)}function Pb(e,t,n,r,o){let i;if(YR(t)&&t.error)return w0(e,t.error);if(W_(t)||tse(t)){const a=t;if("stack"in t)i=w0(e,t);else{const s=a.name||(W_(a)?"DOMError":"DOMException"),l=a.message?`${s}: ${a.message}`:s;i=Bg(e,l,n,r),Ig(i,l)}return"code"in a&&(i.tags={...i.tags,"DOMException.code":`${a.code}`}),i}return gb(t)?w0(e,t):Os(t)||Bh(t)?(i=Wue(e,t,n,o),Wu(i,{synthetic:!0}),i):(i=Bg(e,t,n,r),Ig(i,`${t}`,void 0),Wu(i,{synthetic:!0}),i)}function Bg(e,t,n,r){const o={};if(r&&n){const i=kb(e,n);i.length&&(o.exception={values:[{value:t,stacktrace:{frames:i}}]})}if(yb(t)){const{__sentry_template_string__:i,__sentry_template_values__:a}=t;return o.logentry={message:i,params:a},o}return o.message=t,o}function Que(e,{isUnhandledRejection:t}){const n=xse(e),r=t?"promise rejection":"exception";return YR(e)?`Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\``:Bh(e)?`Event \`${Jue(e)}\` (type=${e.type}) captured as ${r}`:`Object captured as ${r} with keys: ${n}`}function Jue(e){try{const t=Object.getPrototypeOf(e);return t?t.constructor.name:void 0}catch{}}function Zue(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t)){const n=e[t];if(n instanceof Error)return n}}function ece(e,{metadata:t,tunnel:n,dsn:r}){const o={event_id:e.event_id,sent_at:new Date().toISOString(),...t&&t.sdk&&{sdk:{name:t.sdk.name,version:t.sdk.version}},...!!n&&!!r&&{dsn:Wh(r)}},i=tce(e);return xc(o,[i])}function tce(e){return[{type:"user_report"},e]}class nce extends due{constructor(t){const n={parentSpanIsAlwaysRootSpan:!0,...t},r=lt.SENTRY_SDK_SOURCE||Mse();xk(n,"browser",["browser"],r),super(n),n.sendClientReports&&lt.document&&lt.document.addEventListener("visibilitychange",()=>{lt.document.visibilityState==="hidden"&&this._flushOutcomes()})}eventFromException(t,n){return Yue(this._options.stackParser,t,n,this._options.attachStacktrace)}eventFromMessage(t,n="info",r){return que(this._options.stackParser,t,n,r,this._options.attachStacktrace)}captureUserFeedback(t){if(!this._isEnabled()){wc&&ke.warn("SDK not enabled, will not capture user feedback.");return}const n=ece(t,{metadata:this.getSdkMetadata(),dsn:this.getDsn(),tunnel:this.getOptions().tunnel});this.sendEnvelope(n)}_prepareEvent(t,n,r){return t.platform=t.platform||"javascript",super._prepareEvent(t,n,r)}}const rce=typeof __SENTRY_DEBUG__>"u"||__SENTRY_DEBUG__,sn=Ye,oce=1e3;let xE,zg,jg;function ice(e){const t="dom";fa(t,e),pa(t,ace)}function ace(){if(!sn.document)return;const e=Tr.bind(null,"dom"),t=SE(e,!0);sn.document.addEventListener("click",t,!1),sn.document.addEventListener("keypress",t,!1),["EventTarget","Node"].forEach(n=>{const r=sn[n]&&sn[n].prototype;!r||!r.hasOwnProperty||!r.hasOwnProperty("addEventListener")||(Bn(r,"addEventListener",function(o){return function(i,a,s){if(i==="click"||i=="keypress")try{const l=this,u=l.__sentry_instrumentation_handlers__=l.__sentry_instrumentation_handlers__||{},c=u[i]=u[i]||{refCount:0};if(!c.handler){const d=SE(e);c.handler=d,o.call(this,i,d,s)}c.refCount++}catch{}return o.call(this,i,a,s)}}),Bn(r,"removeEventListener",function(o){return function(i,a,s){if(i==="click"||i=="keypress")try{const l=this,u=l.__sentry_instrumentation_handlers__||{},c=u[i];c&&(c.refCount--,c.refCount<=0&&(o.call(this,i,c.handler,s),c.handler=void 0,delete u[i]),Object.keys(u).length===0&&delete l.__sentry_instrumentation_handlers__)}catch{}return o.call(this,i,a,s)}}))})}function sce(e){if(e.type!==zg)return!1;try{if(!e.target||e.target._sentryId!==jg)return!1}catch{}return!0}function lce(e,t){return e!=="keypress"?!1:!t||!t.tagName?!0:!(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable)}function SE(e,t=!1){return n=>{if(!n||n._sentryCaptured)return;const r=uce(n);if(lce(n.type,r))return;na(n,"_sentryCaptured",!0),r&&!r._sentryId&&na(r,"_sentryId",fr());const o=n.type==="keypress"?"input":n.type;sce(n)||(e({event:n,name:o,global:t}),zg=n.type,jg=r?r._sentryId:void 0),clearTimeout(xE),xE=sn.setTimeout(()=>{jg=void 0,zg=void 0},oce)}}function uce(e){try{return e.target}catch{return null}}let Rd;function Ck(e){const t="history";fa(t,e),pa(t,cce)}function cce(){if(!ale())return;const e=sn.onpopstate;sn.onpopstate=function(...n){const r=sn.location.href,o=Rd;if(Rd=r,Tr("history",{from:o,to:r}),e)try{return e.apply(this,n)}catch{}};function t(n){return function(...r){const o=r.length>2?r[2]:void 0;if(o){const i=Rd,a=String(o);Rd=a,Tr("history",{from:i,to:a})}return n.apply(this,r)}}Bn(sn.history,"pushState",t),Bn(sn.history,"replaceState",t)}const nf={};function dce(e){const t=nf[e];if(t)return t;let n=sn[e];if(Tg(n))return nf[e]=n.bind(sn);const r=sn.document;if(r&&typeof r.createElement=="function")try{const o=r.createElement("iframe");o.hidden=!0,r.head.appendChild(o);const i=o.contentWindow;i&&i[e]&&(n=i[e]),r.head.removeChild(o)}catch(o){rce&&ke.warn(`Could not create sandbox iframe for ${e} check, bailing to window.${e}: `,o)}return n&&(nf[e]=n.bind(sn))}function wE(e){nf[e]=void 0}const Yl="__sentry_xhr_v3__";function fce(e){const t="xhr";fa(t,e),pa(t,pce)}function pce(){if(!sn.XMLHttpRequest)return;const e=XMLHttpRequest.prototype;e.open=new Proxy(e.open,{apply(t,n,r){const o=vo()*1e3,i=mo(r[0])?r[0].toUpperCase():void 0,a=hce(r[1]);if(!i||!a)return t.apply(n,r);n[Yl]={method:i,url:a,request_headers:{}},i==="POST"&&a.match(/sentry_key/)&&(n.__sentry_own_request__=!0);const s=()=>{const l=n[Yl];if(l&&n.readyState===4){try{l.status_code=n.status}catch{}const u={endTimestamp:vo()*1e3,startTimestamp:o,xhr:n};Tr("xhr",u)}};return"onreadystatechange"in n&&typeof n.onreadystatechange=="function"?n.onreadystatechange=new Proxy(n.onreadystatechange,{apply(l,u,c){return s(),l.apply(u,c)}}):n.addEventListener("readystatechange",s),n.setRequestHeader=new Proxy(n.setRequestHeader,{apply(l,u,c){const[d,f]=c,h=u[Yl];return h&&mo(d)&&mo(f)&&(h.request_headers[d.toLowerCase()]=f),l.apply(u,c)}}),t.apply(n,r)}}),e.send=new Proxy(e.send,{apply(t,n,r){const o=n[Yl];if(!o)return t.apply(n,r);r[0]!==void 0&&(o.body=r[0]);const i={startTimestamp:vo()*1e3,xhr:n};return Tr("xhr",i),t.apply(n,r)}})}function hce(e){if(mo(e))return e;try{return e.toString()}catch{}}function mce(e,t=dce("fetch")){let n=0,r=0;function o(i){const a=i.body.length;n+=a,r++;const s={body:i.body,method:"POST",referrerPolicy:"origin",headers:e.headers,keepalive:n<=6e4&&r<15,...e.fetchOptions};if(!t)return wE("fetch"),tp("No fetch implementation available");try{return t(e.url,s).then(l=>(n-=a,r--,{statusCode:l.status,headers:{"x-sentry-rate-limits":l.headers.get("X-Sentry-Rate-Limits"),"retry-after":l.headers.get("Retry-After")}}))}catch(l){return wE("fetch"),n-=a,r--,tp(l)}}return gue(e,o)}const vce=30,gce=50;function Ug(e,t,n,r){const o={filename:e,function:t==="<anonymous>"?ra:t,in_app:!0};return n!==void 0&&(o.lineno=n),r!==void 0&&(o.colno=r),o}const yce=/^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,bce=/^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,xce=/\((\S*)(?::(\d+))(?::(\d+))\)/,Sce=e=>{const t=yce.exec(e);if(t){const[,r,o,i]=t;return Ug(r,ra,+o,+i)}const n=bce.exec(e);if(n){if(n[2]&&n[2].indexOf("eval")===0){const a=xce.exec(n[2]);a&&(n[2]=a[1],n[3]=a[2],n[4]=a[3])}const[o,i]=$k(n[1]||ra,n[2]);return Ug(i,o,n[3]?+n[3]:void 0,n[4]?+n[4]:void 0)}},wce=[vce,Sce],_ce=/^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,Ece=/(\S+) line (\d+)(?: > eval line \d+)* > eval/i,Cce=e=>{const t=_ce.exec(e);if(t){if(t[3]&&t[3].indexOf(" > eval")>-1){const i=Ece.exec(t[3]);i&&(t[1]=t[1]||"eval",t[3]=i[1],t[4]=i[2],t[5]="")}let r=t[3],o=t[1]||ra;return[o,r]=$k(o,r),Ug(r,o,t[4]?+t[4]:void 0,t[5]?+t[5]:void 0)}},$ce=[gce,Cce],Rce=[wce,$ce],kce=rk(...Rce),$k=(e,t)=>{const n=e.indexOf("safari-extension")!==-1,r=e.indexOf("safari-web-extension")!==-1;return n||r?[e.indexOf("@")!==-1?e.split("@")[0]:ra,n?`safari-extension:${t}`:`safari-web-extension:${t}`]:[e,t]},kd=1024,Pce="Breadcrumbs",Tce=(e={})=>{const t={console:!0,dom:!0,fetch:!0,history:!0,sentry:!0,xhr:!0,...e};return{name:Pce,setup(n){t.console&&Ese(Ace(n)),t.dom&&ice(Nce(n,t.dom)),t.xhr&&fce(Mce(n)),t.fetch&&kse(Lce(n)),t.history&&Ck(Fce(n)),t.sentry&&n.on("beforeSendEvent",Ice(n))}}},Oce=Tce;function Ice(e){return function(n){tn()===e&&ia({category:`sentry.${n.type==="transaction"?"transaction":"event"}`,event_id:n.event_id,level:n.level,message:zo(n)},{event:n})}}function Nce(e,t){return function(r){if(tn()!==e)return;let o,i,a=typeof t=="object"?t.serializeAttribute:void 0,s=typeof t=="object"&&typeof t.maxStringLength=="number"?t.maxStringLength:void 0;s&&s>kd&&(wc&&ke.warn(`\`dom.maxStringLength\` cannot exceed ${kd}, but a value of ${s} was configured. Sentry will use ${kd} instead.`),s=kd),typeof a=="string"&&(a=[a]);try{const u=r.event,c=Dce(u)?u.target:u;o=JR(c,{keyAttrs:a,maxStringLength:s}),i=dse(c)}catch{o="<unknown>"}if(o.length===0)return;const l={category:`ui.${r.name}`,message:o};i&&(l.data={"ui.component_name":i}),ia(l,{event:r.event,name:r.name,global:r.global})}}function Ace(e){return function(n){if(tn()!==e)return;const r={category:"console",data:{arguments:n.args,logger:"console"},level:Wse(n.level),message:H_(n.args," ")};if(n.level==="assert")if(n.args[0]===!1)r.message=`Assertion failed: ${H_(n.args.slice(1)," ")||"console.assert"}`,r.data.arguments=n.args.slice(1);else return;ia(r,{input:n.args,level:n.level})}}function Mce(e){return function(n){if(tn()!==e)return;const{startTimestamp:r,endTimestamp:o}=n,i=n.xhr[Yl];if(!r||!o||!i)return;const{method:a,url:s,status_code:l,body:u}=i,c={method:a,url:s,status_code:l},d={xhr:n.xhr,input:u,startTimestamp:r,endTimestamp:o},f=QR(l);ia({category:"xhr",data:c,type:"http",level:f},d)}}function Lce(e){return function(n){if(tn()!==e)return;const{startTimestamp:r,endTimestamp:o}=n;if(o&&!(n.fetchData.url.match(/sentry_key/)&&n.fetchData.method==="POST"))if(n.error){const i=n.fetchData,a={data:n.error,input:n.args,startTimestamp:r,endTimestamp:o};ia({category:"fetch",data:i,level:"error",type:"http"},a)}else{const i=n.response,a={...n.fetchData,status_code:i&&i.status},s={input:n.args,response:i,startTimestamp:r,endTimestamp:o},l=QR(a.status_code);ia({category:"fetch",data:a,type:"http",level:l},s)}}}function Fce(e){return function(n){if(tn()!==e)return;let r=n.from,o=n.to;const i=S0(lt.location.href);let a=r?S0(r):void 0;const s=S0(o);(!a||!a.path)&&(a=i),i.protocol===s.protocol&&i.host===s.host&&(o=s.relative),i.protocol===a.protocol&&i.host===a.host&&(r=a.relative),ia({category:"navigation",data:{from:r,to:o}})}}function Dce(e){return!!e&&!!e.target}const Bce=["EventTarget","Window","Node","ApplicationCache","AudioTrackList","BroadcastChannel","ChannelMergerNode","CryptoOperation","EventSource","FileReader","HTMLUnknownElement","IDBDatabase","IDBRequest","IDBTransaction","KeyOperation","MediaController","MessagePort","ModalWindow","Notification","SVGElementInstance","Screen","SharedWorker","TextTrack","TextTrackCue","TextTrackList","WebSocket","WebSocketWorker","Worker","XMLHttpRequest","XMLHttpRequestEventTarget","XMLHttpRequestUpload"],zce="BrowserApiErrors",jce=(e={})=>{const t={XMLHttpRequest:!0,eventTarget:!0,requestAnimationFrame:!0,setInterval:!0,setTimeout:!0,...e};return{name:zce,setupOnce(){t.setTimeout&&Bn(lt,"setTimeout",_E),t.setInterval&&Bn(lt,"setInterval",_E),t.requestAnimationFrame&&Bn(lt,"requestAnimationFrame",Wce),t.XMLHttpRequest&&"XMLHttpRequest"in lt&&Bn(XMLHttpRequest.prototype,"send",Hce);const n=t.eventTarget;n&&(Array.isArray(n)?n:Bce).forEach(Vce)}}},Uce=jce;function _E(e){return function(...t){const n=t[0];return t[0]=Ms(n,{mechanism:{data:{function:di(e)},handled:!1,type:"instrument"}}),e.apply(this,t)}}function Wce(e){return function(t){return e.apply(this,[Ms(t,{mechanism:{data:{function:"requestAnimationFrame",handler:di(e)},handled:!1,type:"instrument"}})])}}function Hce(e){return function(...t){const n=this;return["onload","onerror","onprogress","onreadystatechange"].forEach(o=>{o in n&&typeof n[o]=="function"&&Bn(n,o,function(i){const a={mechanism:{data:{function:o,handler:di(i)},handled:!1,type:"instrument"}},s=Sb(i);return s&&(a.mechanism.data.handler=di(s)),Ms(i,a)})}),e.apply(this,t)}}function Vce(e){const t=lt,n=t[e]&&t[e].prototype;!n||!n.hasOwnProperty||!n.hasOwnProperty("addEventListener")||(Bn(n,"addEventListener",function(r){return function(o,i,a){try{typeof i.handleEvent=="function"&&(i.handleEvent=Ms(i.handleEvent,{mechanism:{data:{function:"handleEvent",handler:di(i),target:e},handled:!1,type:"instrument"}}))}catch{}return r.apply(this,[o,Ms(i,{mechanism:{data:{function:"addEventListener",handler:di(i),target:e},handled:!1,type:"instrument"}}),a])}}),Bn(n,"removeEventListener",function(r){return function(o,i,a){const s=i;try{const l=s&&s.__sentry_wrapped__;l&&r.call(this,o,l,a)}catch{}return r.call(this,o,s,a)}}))}const Gce="GlobalHandlers",Kce=(e={})=>{const t={onerror:!0,onunhandledrejection:!0,...e};return{name:Gce,setupOnce(){Error.stackTraceLimit=50},setup(n){t.onerror&&(Yce(n),EE("onerror")),t.onunhandledrejection&&(qce(n),EE("onunhandledrejection"))}}},Xce=Kce;function Yce(e){Ose(t=>{const{stackParser:n,attachStacktrace:r}=Rk();if(tn()!==e||_k())return;const{msg:o,url:i,line:a,column:s,error:l}=t,u=Zce(Pb(n,l||o,void 0,r,!1),i,a,s);u.level="error",hk(u,{originalException:l,mechanism:{handled:!1,type:"onerror"}})})}function qce(e){Nse(t=>{const{stackParser:n,attachStacktrace:r}=Rk();if(tn()!==e||_k())return;const o=Qce(t),i=bb(o)?Jce(o):Pb(n,o,void 0,r,!0);i.level="error",hk(i,{originalException:o,mechanism:{handled:!1,type:"onunhandledrejection"}})})}function Qce(e){if(bb(e))return e;try{if("reason"in e)return e.reason;if("detail"in e&&"reason"in e.detail)return e.detail.reason}catch{}return e}function Jce(e){return{exception:{values:[{type:"UnhandledRejection",value:`Non-Error promise rejection captured with value: ${String(e)}`}]}}}function Zce(e,t,n,r){const o=e.exception=e.exception||{},i=o.values=o.values||[],a=i[0]=i[0]||{},s=a.stacktrace=a.stacktrace||{},l=s.frames=s.frames||[],u=isNaN(parseInt(r,10))?void 0:r,c=isNaN(parseInt(n,10))?void 0:n,d=mo(t)&&t.length>0?t:cse();return l.length===0&&l.push({colno:u,filename:d,function:ra,in_app:!0,lineno:c}),e}function EE(e){wc&&ke.log(`Global Handler attached: ${e}`)}function Rk(){const e=tn();return e&&e.getOptions()||{stackParser:()=>[],attachStacktrace:!1}}const ede=()=>({name:"HttpContext",preprocessEvent(e){if(!lt.navigator&&!lt.location&&!lt.document)return;const t=e.request&&e.request.url||lt.location&&lt.location.href,{referrer:n}=lt.document||{},{userAgent:r}=lt.navigator||{},o={...e.request&&e.request.headers,...n&&{Referer:n},...r&&{"User-Agent":r}},i={...e.request,...t&&{url:t},headers:o};e.request=i}}),tde="cause",nde=5,rde="LinkedErrors",ode=(e={})=>{const t=e.limit||nde,n=e.key||tde;return{name:rde,preprocessEvent(r,o,i){const a=i.getOptions();ase(Rb,a.stackParser,a.maxValueLength,n,t,r,o)}}},ide=ode;function ade(e){return[Cue(),Sue(),Uce(),Oce(),Xce(),ide(),Due(),ede()]}function sde(e={}){const t={defaultIntegrations:ade(),release:typeof __SENTRY_RELEASE__=="string"?__SENTRY_RELEASE__:lt.SENTRY_RELEASE&&lt.SENTRY_RELEASE.id?lt.SENTRY_RELEASE.id:void 0,autoSessionTracking:!0,sendClientReports:!0};return e.defaultIntegrations==null&&delete e.defaultIntegrations,{...t,...e}}function lde(){const e=typeof lt.window<"u"&&lt;if(!e)return!1;const t=e.chrome?"chrome":"browser",n=e[t],r=n&&n.runtime&&n.runtime.id,o=lt.location&&lt.location.href||"",i=["chrome-extension:","moz-extension:","ms-browser-extension:","safari-web-extension:"],a=!!r&&lt===lt.top&&i.some(l=>o.startsWith(`${l}//`)),s=typeof e.nw<"u";return!!r&&!a&&!s}function ude(e={}){const t=sde(e);if(lde()){yc(()=>{console.error("[Sentry] You cannot run Sentry this way in a browser extension, check: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/")});return}wc&&(ok()||ke.warn("No Fetch API detected. The Sentry SDK requires a Fetch API compatible environment to send events. Please add a Fetch API polyfill."));const n={...t,stackParser:wse(t.stackParser||kce),integrations:uue(t),transport:t.transport||mce},r=hue(nce,n);return t.autoSessionTracking&&cde(),r}function cde(){if(typeof lt.document>"u"){wc&&ke.warn("Session tracking in non-browser environment with @sentry/browser is not supported.");return}dE({ignoreDuration:!0}),fE(),Ck(({from:e,to:t})=>{e!==void 0&&e!==t&&(dE({ignoreDuration:!0}),fE())})}function dde(e,t){ha().setPropagationContext(np()),yr().setPropagationContext(np()),e.emit("startNavigationSpan",t),yr().setTransactionName(t.name);const n=fk();return(n&&As(n).op)==="navigation"?n:void 0}function fde(e){const t={...e};return xk(t,"react"),nue("react",{version:x.version}),ude(t)}const pde=typeof __SENTRY_DEBUG__>"u"||__SENTRY_DEBUG__;let hde,mde,vde,Tb;const gde=new WeakSet;function kk(e,t,n,r=""){if(!e||e.length===0)return[t.pathname,"url"];let o="";if(n)for(const i of n){const a=i.route;if(a){if(a.index)return[i.pathname,"route"];const s=a.path;if(s){const l=s[0]==="/"||o[o.length-1]==="/"?s:`/${s}`;if(o+=l,r+i.pathname===t.pathname)return tE(o)!==tE(i.pathname)&&o.slice(-2)!=="/*"?[r+l,"route"]:[r+o,"route"]}}}return[t.pathname,"url"]}function yde(e,t,n,r,o){const i=Array.isArray(r)?r:Tb(n,t,o);if(i){const[a,s]=kk(n,t,i,o);yr().setTransactionName(a),e&&(e.updateName(a),e.setAttribute(Eb,s))}}function bde(e,t,n,r,o){const i=Array.isArray(r)?r:Tb(t,e,o),a=tn();if(!(!a||!gde.has(a))&&(n==="PUSH"||n==="POP")&&i){const[s,l]=kk(t,e,i,o);dde(a,{name:s,attributes:{[Eb]:l,[ck]:"navigation",[dk]:"auto.navigation.react.reactrouter_v6"}})}}function xde(e){return!hde||!mde||!vde||!Tb?(pde&&ke.warn("reactRouterV6Instrumentation was unable to wrap the `createRouter` function because of one or more missing parameters."),e):function(t,n){const r=e(t,n),o=n&&n.basename,i=Sde();return r.state.historyAction==="POP"&&i&&yde(i,r.state.location,t,void 0,o),r.subscribe(a=>{const s=a.location;(a.historyAction==="PUSH"||a.historyAction==="POP")&&bde(s,t,a.historyAction,void 0,o)}),r}}function Sde(){const e=fk(),t=e?Cb(e):void 0;if(!t)return;const n=As(t).op;return n==="navigation"||n==="pageload"?t:void 0}fde({dsn:"https://43af9393fc55104e36288fc1844716be@o4506078646239232.ingest.sentry.io/4506078647943168",integrations:[],replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1,enabled:!0});const wde=xde(sae),_de=wde([{path:"/",element:_(ese,{})},{path:"*",element:_(Jie,{to:"/"})}]);_0.createRoot(document.getElementById("root")).render(_(En.StrictMode,{children:_(mae,{router:_de})}));
//# sourceMappingURL=index-60aeb4ff.js.map
