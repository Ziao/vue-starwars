# Vue-starwars

A vue component that scrolls images in a Star Wars-esque manner.  
(Ignore the framerate in the preview. The real thing runs at a smooth 60 fps.)

![preview](preview.gif "Preview")

## Installing
```
yarn add vue-starwars
# or
npm install --save vue-starwars
```

## Usage

Import the component either locally..

```js
import StarWars from "@ziao/vue-starwars";

export default {
    components: {
        StarWars
    }
}
```

.. or globally

``` js
import StarWars from "@ziao/vue-starwars";
Vue.use(StarWars);
```

You can now use the ```<star-wars />``` component. See the documentation for the supported options.

## Documentation

Option | Type | Default | Explanation
--- | --- | --- | ---
images **(required)** | array[string] | - | An array of images. The elements should be the URLs to the images you want to use.
background | string | #000000 | The background color of the component. Either a hexcode or "transparent"
placeholder | string | - | The location of the image to be used while the actual image is still loading
width | string | 100% | The width of the component. Valid options are things like 100%, 500px, 90vw, etc.
height | string | 100% | The height of the component. Valid options are things like 100%, 500px, 90vw, etc.
ratio | float | 1.4 | The ratio of the tiles. A value of 1 represents a perfect square. Higher values make the tiles taller, while lower values make them wider
row-min | integer | 3 | The minimum number of tiles on a row, for mobile screens
row-max | integer | 9 | The maximum number of tiles on a row, for massive screens
item-width | integer | 250 | The target width (in pixels) of every tile. This is used to calculate the number of tiles that will be displayed per row. 
speed | float | 1 | A modifier to the speed. A value of 2 makes the tiles scroll by twice as fast.
spacing | float | 0.05 | The spacing between tiles. Relative to the width of the items. You'll probably want to keep this lower than 0.1 

## Todo
- Keep track of the rows / columns so we don't recalculate everything when the element resizes.

## License
This project is licensed under the MIT License - see the [license.md](license.md) file for details