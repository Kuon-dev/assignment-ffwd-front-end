<template>
	<Carousel
		:items-to-show="2.5"
		:wrap-around="true"
		class="border-2 border-black"
	>
		<Slide v-for="slide in 10" :key="slide">
			<div class="carousel__item">{{ slide }}</div>
		</Slide>

		<template #addons>
			<Navigation />
		</template>
	</Carousel>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import { Carousel, Navigation, Slide } from 'vue3-carousel';

import 'vue3-carousel/dist/carousel.css';
</script>
