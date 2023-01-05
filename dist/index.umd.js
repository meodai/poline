(function(root, factory) {
      if (typeof define === 'function' && define.amd) {
      	define([], factory);
      } else if (typeof module === 'object' && module.exports) {
      	module.exports = factory();
      } else {
      	root.fettepalette = factory();
      }
    }
    (typeof self !== 'undefined' ? self : this, function() {
"use strict";
var fettepalette = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  return __toCommonJS(src_exports);
})();
return fettepalette; }));
