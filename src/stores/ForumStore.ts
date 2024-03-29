import { defineStore } from 'pinia';
import { getToken, apiClient } from './BackendAPI';
import { AxiosError } from 'axios';
import { ref } from 'vue';

// Forum Interface with username
export interface Forum {
	content: string;
	created_at: string;
	downVotes: number;
	id: number;
	is_deleted_by_user: number;
	is_removed_by_admin: number;
	title: string;
	upVotes: number;
	updated_at: string;
	user_id: number;
	username: any;
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

// Comment Interface with username (Work in progress)
export interface Comment {
	id: number;
	message: string;
	created_at: string;
	updated_at: string;
	is_deleted_by_user: number;
	is_removed_by_admin: number;
	forum_id: number;
	user_id: number;
	username: any;
}

interface FetchedComment {
	id: number;
	message: string;
	created_at: string;
	updated_at: string;
	is_deleted_by_user: number;
	is_removed_by_admin: number;
	forum_id: number;
	user_id: number;
}

export interface Post {
	comment: Comment[];
	forum: Forum;
	user: any;
	votes: number;
}

// Error Interface
interface SingleError {
	message: string;
	status: number | any;
}

export const useForumStore = defineStore('forumStore', {
	state: () => ({
		forums: [] as Forum[],
		forumSelected: <Post>{} || <any>{},
		forumPagination: 0,
		forumCurrentPgnt: 1,
		postComments: [] as Comment[],
		forumError: <SingleError>{} || <any>{},
		commentError: <SingleError>{} || <any>{},
		searchedForums: [] as Forum[],
	}),
	getters: {
		allForums: (state) => state.forums,
		allComments: (state) => state.postComments,
		forumCurrentPagination: (state) => state.forumCurrentPgnt,
		errorList: (state) => state.forumError,
		forum: (state) => state.forumSelected,
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
					return res.data;
				})
				.catch((err: Error | AxiosError) => {
					const error = err as AxiosError;
					const errorMessage: SingleError | any = {
						message: (error?.response?.data as any).message,
						status: error?.response?.status,
					};
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

			return Object.keys(this.forumError).length !== 0 ? [] : newForum.value;
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
				this.forumError = errorMessage;
			});
		},
		async searchForum(query: string) {
			getToken();

			const user = ref<String[]>([]);
			const vote = ref<any>({
				upVotes: [],
				downVotes: [],
			});
			const newForum = ref<Forum[]>([]);

			const forumData = await apiClient
				.post(`api/forums/search?q=${query}`)
				.then((res) => {
					user.value = res.data.users;
					vote.value.upVotes = res.data.upVotes;
					vote.value.downVotes = res.data.downVotes;
					return res.data;
				})
				.catch((err: Error | AxiosError) => {
					const error = err as AxiosError;
					const errorMessage: SingleError | any = {
						message: (error?.response?.data as any).message,
						status: error?.response?.status,
					};
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

			return Object.keys(this.forumError).length !== 0 ? [] : newForum.value;
		},
		async getSpecificForum(id: any) {
			await getToken();
			const res = await apiClient
				.post(`api/forums/get/specific/${id}`, {
					forum_id: id,
				})
				.catch((err: Error | AxiosError) => {
					const error = err as AxiosError;
					const errorMessage: SingleError | any = {
						message: (error?.response?.data as any).message,
						status: error?.response?.status,
					};
					this.forumError = errorMessage;
				});

			this.forumSelected = res?.data;
			return res?.data;
		},

		async getHotForums() {
			await getToken();
			const data = ref<Forum[]>([]);

			const res = await apiClient
				.get('api/forums/get/hot')
				.then((response) => {
					data.value = response.data.data;
				})
				.catch((err) => {
					console.log(err);
				});

			return data.value;
		},

		// Get all comments of the selected forum
		async getAllComments(commentIndex: number) {
			await getToken();

			const user = ref<String[]>([]);

			const body = {
				index: commentIndex ?? 0,
				forum: this.forum?.forum?.id,
			};

			const response = await apiClient
				.post(`api/comments/get/${commentIndex ?? 0}`, body)
				.then((res) => {
					user.value = res.data.users;
					return res.data;
				})
				.catch((err: Error | AxiosError) => {
					const error = err as AxiosError;
					const errorMessage: SingleError | any = {
						message: (error?.response?.data as any).message,
						status: error?.response?.status,
					};
					this.commentError = errorMessage;
				});

			const newComment = response?.data?.map(
				(comment: FetchedComment, index: number) => {
					// The FetchedComment is from the interface FetchedComment defined above
					return {
						...comment,
						username: user.value[index],
					};
				},
			);

			this.postComments = newComment;
			Object.keys(this.commentError).length !== 0
				? (this.postComments = newComment)
				: [];
		},
	},
});
