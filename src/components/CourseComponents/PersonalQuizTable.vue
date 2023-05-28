<template>
	<h2 class="mt-5 text-brand text-lg font-semibold py-2">
		Personal Scoreboard
	</h2>
	<!-- overflow-x-auto to enable horizontal scroll if not enough space -->
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200">
			<thead>
				<tr class="bg-gray-50">
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						Score
					</th>
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						Date of Attempt
					</th>
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						Time Taken
					</th>
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						QR Code
					</th>
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						Feedback
					</th>
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				<!-- personalQuizzes comes from the const prop variable-->
				<tr v-for="personalQuiz in personalQuizzes" :key="personalQuiz.id">
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="text-sm text-gray-900">{{ personalQuiz.score }}</div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="text-sm text-gray-900">
							{{ personalQuiz.attempted_date }}
						</div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="text-sm text-gray-900">
							{{
								new Date(
									new Date(personalQuiz.completed_time).getTime() -
										new Date(personalQuiz.attempted_date).getTime()
								)
									.toISOString()
									.substr(11, 8)
							}}
						</div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<!-- <router-link
							:to="`/course/${personalQuiz.title}/score/${personalQuiz.id}`"
							> -->
						<v-btn color="primary" text @click="openOverlay(personalQuiz)">
							QR
						</v-btn>

						<v-overlay
							:model-value="overlay"
							class="align-center justify-center"
							location-strategy="connected"
							scroll-strategy="block"
						>
							<BaseCard class="w-[50rem]">
								<img :src="image" />
							</BaseCard>
						</v-overlay>
						<!-- </router-link> -->
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<router-link
							:to="`/course/${personalQuiz.title}/quiz/feedback/${personalQuiz.id}`"
						>
							<v-btn color="primary"> Review </v-btn>
						</router-link>
					</td>
				</tr>
				<!-- Repeat for each personal quiz record -->
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode';
import { computed, watch, ref, PropType, onMounted } from 'vue';
import { useUserStore } from 'stores/UserStore';
import { useQuizStore, PersonalQuizRecord } from 'stores/QuizStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const quizStore = useQuizStore();

const props = defineProps({
	personalQuizzes: {
		type: Array as PropType<PersonalQuizRecord[]>,
		default: () => [],
	},
});
const overlay = ref(false);
const image = ref<string>('');

const openOverlay = async (quiz: any) => {
	if (overlay.value) {
		overlay.value = false;
		setTimeout(() => {
			overlay.value = true;
		}, 200);
	}
	else {
		overlay.value = true;
	}

	await QRCode.toDataURL(
		`${(import.meta as any).env.VITE_APP_FRONTEND_API}/course/${
			quiz.title
		}/score/${quiz.id}`,
	)
		.then((url) => {
			image.value = url;
		})
		.catch((err) => {
			console.error(err);
		});
};
</script>
