<template>
	<v-card class="mx-auto pt-2 px-2">
		<v-list
			lines="two"
			v-for="(sections, sectionIndex) in props.course"
			:key="sectionIndex"
		>
			<v-list-item-title class="px-3 py-1 text-brand">
				<h2 class="font-semibold text-lg">
					{{ sections.title }}
				</h2>
			</v-list-item-title>

			<router-link
				v-for="(item, itemIndex) in sections.lists"
				:key="itemIndex"
				:to="item?.path ?? '/'"
			>
				<v-list-item
					:title="item.topic"
					class="hover:bg-slate-300 hover:cursor-pointer"
				>
					<template v-slot:prepend>
						<v-avatar color="deep-purple-accent-2">
							<font-awesome-icon :icon="['fas', 'code']" />
						</v-avatar>
					</template>

					<template v-slot:append>
						<v-btn color="grey-lighten-1" icon="fa:fas fa-code" variant="text"
							>View</v-btn
						>
					</template>
				</v-list-item>
			</router-link>
			<v-divider
				v-if="sectionIndex + 1 === props.course?.length"
				inset
			></v-divider>
		</v-list>
	</v-card>
</template>

<script setup lang="ts">
import Card from 'course-components/CourseDescCard.vue';
import { PropType } from 'vue';

interface CourseList {
	topic: string;
	path: string;
}

interface CourseLang {
	title: string;
	lists: CourseList[];
}

const props = defineProps({
	course: {
		type: Array as PropType<CourseLang[] | null>,
		default: null,
	},
});
</script>

<style lang="scss" scoped></style>
