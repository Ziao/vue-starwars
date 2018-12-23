<template>
  <div id="app">
    <star-wars :images="images" ratio="1.9"></star-wars>
  </div>
</template>

<script>
import StarWars from './components/starwars.vue'

export default {
  name: 'app',
  components: {
    StarWars
  },
  data() {
    const data = {
      images: []
    };

    for(let i = 0; i < 50; i++){
      data.images.push(`https://placeimg.com/300/400/any?${Math.random()}`)
    }

    return data;
  }
}
</script>

<style>
  body, html {
    padding:0;
    margin:0;
  }

  #app{
    width: 100vw;
    height: 100vh;
  }
</style>
