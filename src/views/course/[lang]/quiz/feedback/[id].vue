<template>
	<!--The Whole Page-->
	<div class="h-full w-full bg-[url('/public/img1.png')] bg-cover p-1">
		<div
			class="bg-white flex justify-center border rounded-lg p-9 xl:w-3/5 md:w-5/6 sm:w-6/7 xl:mx-auto md:mx-16 sm:mx-2 grid grid-cols-1 my-15"
		>
			<h1 class="relative text-3xl font-bold text-center">
				Quiz Feedback Page
			</h1>
			<div class="mt-1 mb-5 text-center">
				Thank you for taking the time to provide feedback. We appreciate hearing
				from you and will review your comments carefully.
			</div>
			<hr />

			<main>
				<section class="mx-1 my-7">
					<!-- Star Rating -->
					<div
						class="place-content-start flex text-xl font-semibold leading-10"
					>
						<div>How many stars would you give this quiz?</div>
					</div>

					<div class="flex justify-center" data-te-input-wrapper-init>
						<button v-for="i in 5" :key="i" @click="selectRating(i)">
							<font-awesome-icon
								:icon="['fas', 'star']"
								size="2xl"
								:style="color(i)"
							/>
						</button>
					</div>
				</section>

				<section class="mx-1 mb-5">
					<!-- Feedback Question -->
					<div
						class="place-content-start flex text-xl font-semibold leading-10"
					>
						<div>Tell us your thoughts about the quiz. We love feedback!</div>
					</div>

					<div class="relative my-3 mx-1 feedback" data-te-input-wrapper-init>
						<v-textarea
							class="feedback"
							bg-color="#fffafa"
							label=""
							@input="getTextValue"
						></v-textarea>
					</div>
				</section>

				<div
					class="mx-1 flex items-center justify-center col-span-6 sm:flex sm:items-center sm:gap-4"
				>
					<button
						class="inline-block shrink-0 rounded-sm border border-brand bg-brand px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
						@click.stop="submitFeedback($event)"
					>
						Submit
					</button>
				</div>
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
import Card from 'course-components/CourseDescCard.vue';
import List from 'course-components/CourseList.vue';
import BaseEditor from 'base-components/BaseEditor.vue';
import { ref } from 'vue';
import { useUserStore } from 'stores/UserStore';
import { useQuizStore } from 'stores/QuizStore';
import { getToken, apiClient } from 'stores/BackendAPI';
import { AxiosError } from 'axios';

interface FeedbackDetails {
	rating: Number;
	feedback: String;
}

const store = useUserStore();
const quizStore = useQuizStore();

// Get Quiz ID
const url = window.location.href;
const quizId = url.substring(url.lastIndexOf('/') + 1);

const feedback = ref<String>('');
const errorMessage = ref('');

const stars = ref(0);
const user = store.getUser();

const color = (index: number) => {
	return {
		color: `${stars.value >= index ? '#FFDF00' : '#8d99a3'}`,
	};
};

const selectRating = (index: number) => {
	stars.value = index;
	// console.log(index);
};

// const getTextValue = (feedback: Event) => {
// 	console.log(feedback);
// };
const getTextValue = (event: Event) => {
	feedback.value = (event.target as HTMLTextAreaElement).value;
	// console.log(feedback);
};

const submitFeedback = async (e: Event) => {
	e.preventDefault();
	if (stars.value == 0) {
		errorMessage.value = 'Please select a star rating';
		return;
	}

	const body = {
		rating: stars.value,
		feedback: feedback.value,
		user: store.user.id,
		quiz: quizId,
	};
	await getToken();
	const res = await apiClient
		.post('/api/feedback/create', body)
		.catch((err: Error | AxiosError) => {
			const error = err as AxiosError;
			// this.authErrors = (error?.response?.data as any).errors;
			// console.log(error);
			return {
				status: error?.response?.status,
			};
		});
	// console.log(res);
};
</script>

<style lang="scss" scoped></style>
