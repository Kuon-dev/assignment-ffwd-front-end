<template>
	<v-card class="card">
		<div class="flex flex-row">
			<v-img
				class="align-end basis-1/2 bg-cover"
				height="300"
				max-width="700"
				:src="props.image"
				cover
			/>

			<div class="basis-1/2">
				<v-card-title class="text-brand font-bold text-2xl">
					<h2 class="text-3xl">
						{{ props.title }}
					</h2>
				</v-card-title>
				<v-card-text class="">
					<p class="text-black lg:text-lg text-sm">
						{{ props.cardText }}
					</p>
				</v-card-text>
			</div>
		</div>
	</v-card>
</template>

<script setup lang="ts">
const props = defineProps({
	image: {
		type: String,
		default: null,
	},
	title: {
		type: String,
		default: null,
	},
	cardText: {
		type: String,
		default: null,
	},
	route: {
		type: String,
		default: null,
	},
});
</script>

<style lang="scss" scoped></style>
