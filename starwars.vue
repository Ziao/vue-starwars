<template>
    <div
            :style="{perspective: `${perspective}px`, background: background, width: width, height: height}"
            class="starwars">
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script>

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

        data() {
            return {
                canvas: null,
                context: null,
                recompute: 0,
                perspective: 0,
            }
        },

        computed: {
            rows(){

                // Just using the recompute property so this method "relies" on it. Then we can arbitrarily
                // rerun this compute function
                const woop = this.recompute;

                if(!this.canvas || !this.context) return [];

                let tilesPerRow = Math.ceil(this.canvas.width / this.itemWidth);
                tilesPerRow = Math.max(this.rowMin, Math.min(this.rowMax, tilesPerRow));

                // Todo: make sure the tiles per row / number of rows are actually different.
                // If not, just return what we already had

                const itemWidth = this.canvas.width / tilesPerRow;
                const itemHeight = itemWidth * this.ratio;
                const rowCount = Math.ceil(this.canvas.height / itemHeight + 1);

                const imagesNeeded = rowCount * tilesPerRow;
                const images = this.images.slice(0, imagesNeeded);
                const rows = [];

                // Make sure we get enough images first
                for(let i = images.length; i < imagesNeeded; i++){
                    images.push(this.images[Math.floor(Math.random() * this.images.length)]);
                }

                // Shuffle the images (note: not truly random but close enough)
                images.sort(() => Math.random() - 0.5);

                for(let rowID = 0; rowID < rowCount; rowID++){
                    let rowImages = images.slice(rowID * tilesPerRow, (rowID + 1) * tilesPerRow);
                    let row = {
                        offset: rowID,
                        tiles: [],
                    };

                    for(let src of rowImages){
                        const tile = {
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
                        tile.image.onload = () => {
                            // Calculate how to crop the image to fit the ratio
                            const childRatio = tile.image.height / tile.image.width;
                            if (childRatio < this.ratio) {
                                // The image is wider
                                tile.height = tile.image.height;
                                tile.width = tile.image.height / this.ratio;
                            } else {
                                // The image is taller
                                tile.height = tile.image.width * this.ratio;
                                tile.width = tile.image.width;
                            }
                            tile.top = (tile.image.height - tile.height) / 2;
                            tile.left = (tile.image.width - tile.width) / 2;

                            tile.loaded = true;

                        };
                        tile.image.src = tile.src;
                    }

                    rows.push(row);
                }

                return rows;

            }
        },

        created(){
            if(process.client && this.placeholder) {
                this.placeholderImage = new Image();
                this.placeholderImage.src = this.placeholder;
            }
        },

        mounted() {
            this.setup();
            requestAnimationFrame(this.onFrame);

            window.addEventListener('resize', this.onResize);
        },

        destroy(){
            this.destroyed = true;
            window.removeEventListener('resize', this.onResize);
        },

        methods: {

            onResize(){
                this.$nextTick(() => {
                    let rect = this.canvas.getBoundingClientRect();
                    if(rect.width !== this.canvas.width || rect.height !== this.canvas.height){
                        this.setup();
                        this.recompute = Math.random();
                    }
                });
            },

            onFrame(time){

                if(this.destroyed) return;

                // this.delta = 1000 / 60
                const delta = (time - this.lastFrame || 0) / (1000 / 60);
                this.lastFrame = time;

                // Todo: delta

                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

                if(!this.rows.length) return;

                const itemsPerRow = this.rows[0].tiles.length;
                let itemWidth = this.canvas.width / itemsPerRow;
                const spacing = itemWidth * this.spacing / 2;
                itemWidth -= (spacing * (itemsPerRow - 1)) / itemsPerRow;
                const itemHeight = itemWidth * this.ratio;

                const speedMod = this.itemWidth / itemWidth;

                for(let rowIndex in this.rows){
                    const row = this.rows[rowIndex];
                    const offsetDelta = this.speed * 0.003 * speedMod * (1 / this.ratio) * delta;
                    row.offset = (row.offset + offsetDelta) % this.rows.length;


                    for(let tileIndex in row.tiles){
                        const tile = row.tiles[tileIndex];

                        if(tile.opacity < 1 && this.placeholder) {
                            this.context.globalAlpha = 1;
                            this.context.drawImage(
                                this.placeholderImage, 0, 0, this.placeholderImage.width, this.placeholderImage.height,
                                tileIndex * itemWidth + tileIndex * spacing,
                                (row.offset - 1) * (itemHeight + spacing),
                                itemWidth, itemHeight);
                        }

                        if(!tile.loaded) continue;

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

            setup(){

                this.canvas = this.$refs.canvas;
                let rect = this.$el.getBoundingClientRect();

                // Todo: handle DPI
                this.canvas.width = rect.width;
                this.canvas.height = rect.height * 1.5;
                this.context = this.canvas.getContext('2d');

                this.perspective = Math.max(this.canvas.height, this.canvas.width) * 1.2;

            },
        }

    };

</script>

<style lang="scss" scoped>

    .starwars {

        overflow: hidden;

        &:after {
            position: absolute;
            content: '';
            top:0; left:0; right: 0; bottom: 0;
            background: linear-gradient(to bottom, rgba(#000, 0.85) 0%, transparent 33%);
        }

        canvas {

            transform-origin: 50% 0;
            transform: rotateX(50deg);

            width: 100%;
            height: 150%;

        }

    }

</style>
