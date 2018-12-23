(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.StarWars = {}));
}(this, function (exports) { 'use strict';

    //
    //
    //
    //
    //
    //
    //
    //


    var script = {

        props: {
            background: {
                type: String,
                default: "#000000",
            },
            images: {
                type: Array,
                required: true
            },
            placeholder: {
                type: String,
            },
            width: {
                type: String,
                default: '100%',
            },
            height: {
                type: String,
                default: '100%',
            },
            ratio: {
                type: Number,
                default: 1.4,
            },
            rowMin: {
                type: Number,
                default: 3,
            },
            rowMax: {
                type: Number,
                default: 9,
            },
            itemWidth: {
                type: Number,
                default: 250,
            },
            speed: {
                type: Number,
                default: 1,
            },
            spacing: {
                type: Number,
                default: 0.05,
            }
        },

        data: function data() {
            return {
                canvas: null,
                context: null,
                recompute: 0,
                perspective: 0,
            }
        },

        computed: {
            rows: function rows(){
                var this$1 = this;


                // Using the recompute property so this method "relies" on it. Then we can arbitrarily
                // rerun this compute function.
                /* eslint-disable-next-line */
                var woop = this.recompute;

                if(!this.canvas || !this.context) { return []; }

                var tilesPerRow = Math.ceil(this.canvas.width / this.itemWidth);
                tilesPerRow = Math.max(this.rowMin, Math.min(this.rowMax, tilesPerRow));

                // Todo: make sure the tiles per row / number of rows are actually different.
                // If not, just return what we already had

                var itemWidth = this.canvas.width / tilesPerRow;
                var itemHeight = itemWidth * this.ratio;
                var rowCount = Math.ceil(this.canvas.height / itemHeight + 1);

                var imagesNeeded = rowCount * tilesPerRow;
                var images = this.images.slice(0, imagesNeeded);
                var rows = [];

                // Make sure we get enough images first
                for(var i = images.length; i < imagesNeeded; i++){
                    images.push(this.images[Math.floor(Math.random() * this.images.length)]);
                }

                // Shuffle the images (note: not truly random but close enough)
                images.sort(function () { return Math.random() - 0.5; });

                for(var rowID = 0; rowID < rowCount; rowID++){
                    var rowImages = images.slice(rowID * tilesPerRow, (rowID + 1) * tilesPerRow);
                    var row = {
                        offset: rowID,
                        tiles: [],
                    };

                    var loop = function () {
                        var src = list[i$1];

                        var tile = {
                            src: src,
                            loaded: false,
                            opacity: 0,
                            top: 0,
                            left:0,
                            width: 0,
                            height: 0,
                        };
                        row.tiles.push(tile);

                        tile.image = new Image;
                        tile.image.onload = function () {
                            // Calculate how to crop the image to fit the ratio
                            var childRatio = tile.image.height / tile.image.width;
                            if (childRatio < this$1.ratio) {
                                // The image is wider
                                tile.height = tile.image.height;
                                tile.width = tile.image.height / this$1.ratio;
                            } else {
                                // The image is taller
                                tile.height = tile.image.width * this$1.ratio;
                                tile.width = tile.image.width;
                            }
                            tile.top = (tile.image.height - tile.height) / 2;
                            tile.left = (tile.image.width - tile.width) / 2;

                            tile.loaded = true;

                        };
                        tile.image.src = tile.src;
                    };

                    for(var i$1 = 0, list = rowImages; i$1 < list.length; i$1 += 1)loop();

                    rows.push(row);
                }

                return rows;

            }
        },

        created: function created(){
            if(process.client && this.placeholder) {
                this.placeholderImage = new Image();
                this.placeholderImage.src = this.placeholder;
            }
        },

        mounted: function mounted() {
            this.setup();
            requestAnimationFrame(this.onFrame);

            window.addEventListener('resize', this.onResize);
        },

        destroy: function destroy(){
            this.destroyed = true;
            window.removeEventListener('resize', this.onResize);
        },

        methods: {

            onResize: function onResize(){
                var this$1 = this;

                this.$nextTick(function () {
                    var rect = this$1.canvas.getBoundingClientRect();
                    if(rect.width !== this$1.canvas.width || rect.height !== this$1.canvas.height){
                        this$1.setup();
                        this$1.recompute = Math.random();
                    }
                });
            },

            onFrame: function onFrame(time){

                if(this.destroyed) { return; }

                // this.delta = 1000 / 60
                var delta = (time - this.lastFrame || 0) / (1000 / 60);
                this.lastFrame = time;

                // Todo: delta

                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

                if(!this.rows.length) { return; }

                var itemsPerRow = this.rows[0].tiles.length;
                var itemWidth = this.canvas.width / itemsPerRow;
                var spacing = itemWidth * this.spacing / 2;
                itemWidth -= (spacing * (itemsPerRow - 1)) / itemsPerRow;
                var itemHeight = itemWidth * this.ratio;

                var speedMod = this.itemWidth / itemWidth;

                for(var rowIndex in this.rows){
                    var row = this.rows[rowIndex];
                    var offsetDelta = this.speed * 0.003 * speedMod * (1 / this.ratio) * delta;
                    row.offset = (row.offset + offsetDelta) % this.rows.length;


                    for(var tileIndex in row.tiles){
                        var tile = row.tiles[tileIndex];

                        if(tile.opacity < 1 && this.placeholder) {
                            this.context.globalAlpha = 1;
                            this.context.drawImage(
                                this.placeholderImage, 0, 0, this.placeholderImage.width, this.placeholderImage.height,
                                tileIndex * itemWidth + tileIndex * spacing,
                                (row.offset - 1) * (itemHeight + spacing),
                                itemWidth, itemHeight);
                        }

                        if(!tile.loaded) { continue; }

                        if(tile.opacity < 1){
                            tile.opacity = Math.min(1, tile.opacity + 0.025 * delta);
                        }

                        this.context.globalAlpha = tile.opacity;
                        this.context.drawImage(
                            tile.image, tile.left, tile.top, tile.width, tile.height,
                            tileIndex * itemWidth + tileIndex * spacing,
                            (row.offset - 1) * (itemHeight + spacing),
                            itemWidth, itemHeight);

                    }
                }

                requestAnimationFrame(this.onFrame);
            },

            setup: function setup(){

                this.canvas = this.$refs.canvas;
                var rect = this.$el.getBoundingClientRect();

                // Todo: handle DPI
                this.canvas.width = rect.width;
                this.canvas.height = rect.height * 1.5;
                this.context = this.canvas.getContext('2d');

                this.perspective = Math.max(this.canvas.height, this.canvas.width) * 1.2;

            },
        }

    };

    /* script */
                var __vue_script__ = script;
                
    /* template */
    var __vue_render__ = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "div",
        {
          staticClass: "vue-starwars",
          style: {
            perspective: _vm.perspective + "px",
            background: _vm.background,
            width: _vm.width,
            height: _vm.height
          }
        },
        [_c("canvas", { ref: "canvas" })]
      )
    };
    var __vue_staticRenderFns__ = [];
    __vue_render__._withStripped = true;

      /* style */
      var __vue_inject_styles__ = function (inject) {
        if (!inject) { return }
        inject("data-v-2bf146ae_0", { source: ".vue-starwars {\n  overflow: hidden;\n}\n.vue-starwars:after {\n    position: absolute;\n    content: '';\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.85) 0%, transparent 33%);\n}\n.vue-starwars canvas {\n    transform-origin: 50% 0;\n    transform: rotateX(50deg);\n    width: 100%;\n    height: 150%;\n}\n\n/*# sourceMappingURL=starwars.vue.map */", map: {"version":3,"sources":["/Users/nick/projects/vue-starwars/src/starwars.vue","starwars.vue"],"names":[],"mappings":"AAmQA;EAEA,iBAAA;CAmBA;AArBA;IAKA,mBAAA;IACA,YAAA;IACA,OAAA;IAAA,QAAA;IAAA,SAAA;IAAA,UAAA;IACA,gFAAA;CACA;AATA;IAaA,wBAAA;IACA,0BAAA;IAEA,YAAA;IACA,aAAA;CAEA;;ACtQA,wCAAwC","file":"starwars.vue","sourcesContent":[null,".vue-starwars {\n  overflow: hidden; }\n  .vue-starwars:after {\n    position: absolute;\n    content: '';\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.85) 0%, transparent 33%); }\n  .vue-starwars canvas {\n    transform-origin: 50% 0;\n    transform: rotateX(50deg);\n    width: 100%;\n    height: 150%; }\n\n/*# sourceMappingURL=starwars.vue.map */"]}, media: undefined });

      };
      /* scoped */
      var __vue_scope_id__ = undefined;
      /* module identifier */
      var __vue_module_identifier__ = undefined;
      /* functional template */
      var __vue_is_functional_template__ = false;
      /* component normalizer */
      function __vue_normalize__(
        template, style, script$$1,
        scope, functional, moduleIdentifier,
        createInjector, createInjectorSSR
      ) {
        var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

        // For security concerns, we use only base name in production mode.
        component.__file = "/Users/nick/projects/vue-starwars/src/starwars.vue";

        if (!component.render) {
          component.render = template.render;
          component.staticRenderFns = template.staticRenderFns;
          component._compiled = true;

          if (functional) { component.functional = true; }
        }

        component._scopeId = scope;

        {
          var hook;
          if (style) {
            hook = function(context) {
              style.call(this, createInjector(context));
            };
          }

          if (hook !== undefined) {
            if (component.functional) {
              // register for functional component in vue file
              var originalRender = component.render;
              component.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context)
              };
            } else {
              // inject component registration as beforeCreate hook
              var existing = component.beforeCreate;
              component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
            }
          }
        }

        return component
      }
      /* style inject */
      function __vue_create_injector__() {
        var head = document.head || document.getElementsByTagName('head')[0];
        var styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
        var isOldIE =
          typeof navigator !== 'undefined' &&
          /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

        return function addStyle(id, css) {
          if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

          var group = isOldIE ? css.media || 'default' : id;
          var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

          if (!style.ids.includes(id)) {
            var code = css.source;
            var index = style.ids.length;

            style.ids.push(id);

            if (isOldIE) {
              style.element = style.element || document.querySelector('style[data-group=' + group + ']');
            }

            if (!style.element) {
              var el = style.element = document.createElement('style');
              el.type = 'text/css';

              if (css.media) { el.setAttribute('media', css.media); }
              if (isOldIE) {
                el.setAttribute('data-group', group);
                el.setAttribute('data-next-index', '0');
              }

              head.appendChild(el);
            }

            if (isOldIE) {
              index = parseInt(style.element.getAttribute('data-next-index'));
              style.element.setAttribute('data-next-index', index + 1);
            }

            if (style.element.styleSheet) {
              style.parts.push(code);
              style.element.styleSheet.cssText = style.parts
                .filter(Boolean)
                .join('\n');
            } else {
              var textNode = document.createTextNode(code);
              var nodes = style.element.childNodes;
              if (nodes[index]) { style.element.removeChild(nodes[index]); }
              if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
              else { style.element.appendChild(textNode); }
            }
          }
        }
      }
      /* style inject SSR */
      

      
      var starwars = __vue_normalize__(
        { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
        __vue_inject_styles__,
        __vue_script__,
        __vue_scope_id__,
        __vue_is_functional_template__,
        __vue_module_identifier__,
        __vue_create_injector__,
        undefined
      );

    exports.default = starwars;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
