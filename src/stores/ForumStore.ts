import { defineStore } from 'pinia';
import { getToken, apiClient } from './BackendAPI';
import { AxiosError } from 'axios';
import { ref } from 'vue';

// Forum Interface with username
interface Forum {
	id: number;
	title: string;
	content: string;
	created_at: string;
	updated_at: string;
	is_deleted_by_user: number;
	is_removed_by_admin: number;
	user_id: number;
	username: any;
	upVotes: number;
	downVotes: number;
}

// Forum Interface without username
interface FetchedForum {
	id: number;
	title: string;
	content: string;
	created_at: string;
	updated_at: string;
	is_deleted_by_user: number;
	is_removed_by_admin: number;
	user_id: number;
}

// Error Interface
interface SingleError {
	message: string;
	status: number | any;
}

export const useForumStore = defineStore('forumStore', {
	state: () => ({
		forums: <any>[],
		forumPagination: 0,
		forumCurrentPgnt: 1,
		forumError: null,
	}),
	getters: {
		allForums: (state) => state.forums,
		forumCurrentPagination: (state) => state.forumCurrentPgnt,
		errorList: (state) => state.forumError,
	},
	actions: {
		async getAllForums(forumIndex: number) {
			await getToken();

			const user = ref<String[]>([]);
			const vote = ref<any>({
				upVotes: [],
				downVotes: [],
			});
			const newForum = ref<Forum[]>([]);

			const forumData = await apiClient
				.post(`api/forums/get/${forumIndex ?? 0}`, {
					index: forumIndex ?? 0,
				})
				.then((res) => {
					user.value = res.data.users;
					vote.value.upVotes = res.data.upVotes;
					vote.value.downVotes = res.data.downVotes;
					return (res.data);
				})
				.catch((err: Error | AxiosError) => {
					const error = err as AxiosError;
					const errorMessage: SingleError | any = {
						message: (error?.response?.data as any).message,
						status: error?.response?.status,
					};
					console.log(error);
					this.forumError = errorMessage;
				});

			forumData?.data?.forEach((forum: FetchedForum, index: number) => {
				const tempForum: Forum = {
					...forum,
					username: user.value[index],
					upVotes: vote.value.upVotes[index],
					downVotes: vote.value.downVotes[index],
				};
				newForum.value.push(tempForum);
			});

			this.forumCurrentPgnt = forumIndex
				? forumIndex + 1
				: this.forumCurrentPgnt;

			return this.forumError ? this.forumError : newForum.value;
		},

		async getPaginationCount() {
			await getToken();

			const pagination = await apiClient
				.get('api/forums/pages/count')
				.then((res) => {
					this.forumPagination = res.data[0].paginationCount;
				});

			return this.forumPagination;
		},

		getForum(id: number) {
			getToken();

			this.forums.forEach((frm: Forum) => {
				if (frm.id === id) {
					return frm;
				}
				const errorMessage: SingleError = {
					message: 'Forum not found',
					status: 400,
				};
				this.forumErrors = errorMessage;
			});
		},
		async getForumError() {
			await getToken();

			return this.errorList;
		},
	},
});