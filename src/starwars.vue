<template>
    <div
            :style="{width, height, background}"
            class="vue-starwars">
    </div>
</template>

<script>

    import p5 from 'p5/lib/p5.min';

    export default {

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
                default: null,
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
                default: 1.25,
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
                default: 180,
            },
            speed: {
                type: Number,
                default: 1,
            },
            spacing: {
                type: Number,
                default: 3,
            },
            angle: {
                type: Number,
                default: Math.PI * 0.2
            }
        },

        watch: {
            images(){
                this.loadTextures();
                this.computeTiles();
            }
        },

        created(){

            // By defining these here, they won't be observed, increasing performance
            this.sketch = null;
            this.textures = []; // A collection of HTMLImageElement's to be used as textures
            this.tiles = []; // [{ texture (from textures), opacity: (float 0-255) }]
            this.columns = 0;
            this.rows = 0;
            this.tileWidth = 0;
            this.tileHeight = 0;
            this.placeholderTexture = null; // A HTMLImageElement of the placeholder image, if any
            this.context = null; // WebGL context of the canvas
            this.backgroundColor = null; // P5 color instance of the passed color
            this.shader = null; // Transparency shader for 3d land
            // this.lastFrame = null;
        },

        mounted() {
            window.addEventListener('resize', this.onResize);
            this.setup();
        },

        destroyed(){
            window.removeEventListener('resize', this.onResize);
            if(this.sketch){
                this.sketch.remove();
            }
        },

        methods: {

            async setup(){

                let boundingRect = this.$el.getBoundingClientRect();

                new p5(sketch => {
                    this.sketch = sketch;

                    sketch.setup = () => {
                        this.sketch.createCanvas(boundingRect.width, boundingRect.height, this.sketch.WEBGL);

                        this.loadTextures();
                        this.computeTiles();
                        this.backgroundColor = this.sketch.color(this.background);

                        this.sketch.fill(0,0,0,0);
                    };

                    sketch.draw = () => {
                        this.onFrame();
                    };

                }, this.$el);

            },

            loadTextures() {

                if(this.placeholder) {
                    this.placeholderTexture = this.sketch.loadImage(this.placeholder);
                }

                this.textures.length = 0;
                for(let src of this.images){
                    this.textures.push(this.sketch.loadImage(src, im => im.complete = true));
                }

            },

            computeTiles() {

                const initialColumns = Math.ceil(this.sketch.width / this.itemWidth);
                const correctedColumns = Math.max(this.rowMin, Math.min(this.rowMax, initialColumns));
                const tileWidth = (this.sketch.width - (correctedColumns - 1) * this.spacing) / correctedColumns;
                const tileHeight = tileWidth * this.ratio;
                const initialRows = Math.ceil(this.sketch.height / (tileHeight + this.spacing)) + 2;

                if(correctedColumns === this.columns && initialRows === this.rows) return;

                this.tiles.length = 0;
                this.columns = correctedColumns;
                this.rows = initialRows;
                this.tileWidth = tileWidth;
                this.tileHeight = tileHeight;

                for(let i = 0; i < this.columns * this.rows; i++){
                    this.tiles.push({
                        opacity: 0,
                        texture: this.textures[Math.floor(Math.random() * this.textures.length)],
                    });
                }

            },

            onFrame() {

                const s = this.sketch;
                s.push();
                s.translate(0, -s.height / 2);

                s.background(this.background);

                for(let i in this.tiles){

                    const tile = this.tiles[i];
                    const x = i % this.columns - (this.columns - 1) / 2;
                    const y = ((Math.floor(i / this.columns) + s.millis() * this.speed * 0.00015) % this.rows) - 1;

                    s.push();
                    s.rotateX(this.angle);
                    s.translate(x * this.tileWidth + x * this.spacing, y * this.tileHeight + y * this.spacing);

                    // Fade in when loaded
                    if(tile.texture.complete && tile.opacity < 255){
                        tile.opacity = Math.min(255, tile.opacity + 5);
                    }

                    // Draw placeholder image
                    if(tile.opacity < 128 && this.placeholder) {
                        s.texture(this.placeholderTexture);
                        // s.fill(25);
                        s.plane(this.tileWidth, this.tileHeight);
                    }

                    if(tile.opacity >= 128) {
                        s.texture(tile.texture);
                        s.plane(this.tileWidth, this.tileHeight);
                    }

                    // Draw a mask over the image to simulate fading in
                    // Todo: give shaders a try, as right now, we have to fade out the placeholder
                    // because making textures transparent on the fly is killing for performance.

                    s.translate(0, 0, .05);
                    if(tile.opacity < 255){
                        s.ambientMaterial(
                            this.backgroundColor.levels[0],
                            this.backgroundColor.levels[1],
                            this.backgroundColor.levels[2],
                            255 - Math.abs(tile.opacity * 2 - 255)
                        );
                        s.plane(this.tileWidth + this.spacing, this.tileHeight + this.spacing);
                    }

                    s.pop();
                }

                s.pop();
            },

            onResize(){
                this.$nextTick(() => {

                    if(this.sketch){
                        let boundingRect = this.$el.getBoundingClientRect();
                        this.sketch.resizeCanvas(boundingRect.width, boundingRect.height);
                        this.computeTiles();
                    }
                });
            },

        }

    };

</script>

<style lang="scss">


    .vue-starwars {

        &:after {
            position: absolute;
            content: '';
            top:0; left:0; right: 0; bottom: 0;
            background: linear-gradient(to bottom, rgba(#000, 0.85) 0%, transparent 33%);
        }

        canvas {
            position:absolute;
            left:0;
            top:0;
            right:0;
            bottom:0;
        }

    }

</style>
