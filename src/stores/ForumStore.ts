import { defineStore } from 'pinia';
import { getToken, apiClient } from './BackendAPI';
import { AxiosError } from 'axios';
import { ref } from 'vue';

// Forum Interface with username
export interface Forum {
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

// Comment Interface with username (Work in progress)
interface Comment {
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
	comment: Comment;
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
		forums: <any>[],
		forumSelected: <Post>{} || <any>{},
		forumPagination: 0,
		postCommentPagination: 0,
		forumCurrentPgnt: 1,
		forumError: <SingleError>{} || <any>{},
		commentError: <SingleError>{} || <any>{},
	}),
	getters: {
		allForums: (state) => state.forums,
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

			return Object.keys(this.forumError).length !== 0
				? this.forumError
				: newForum.value;
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
		async getForumError() {
			await getToken();

			return this.errorList;
		},

		async getSpecificForum(id: any) {
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
					console.log(error);
					this.forumError = errorMessage;
				});

			this.forumSelected = res?.data;
			return res?.data;
		},

		// Work in progress
		// Get all comments of the selected forum
		async getAllComments(commentIndex: number) {
			await getToken();

			const user = ref<String[]>([]);
			const newComment = ref<Forum[]>([]);

			const body = {
				index: commentIndex ?? 0,
				// how to get get the forum_id?
				forum: this.forumSelected.forum.id,
			};

			const commentData = await apiClient
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
					console.log(error);
					this.commentError = errorMessage;
				});

			commentData?.data?.forEach((comment: FetchedComment, index: number) => {
				// The Comment is from the interface Comment defined above
				const tempComment: Comment = {
					...comment,
					username: user.value[index],
				};
				newComment.value.push(tempComment);
			});

			console.log(commentData);
			console.log(this.forumSelected.id);

			return Object.keys(this.commentError).length !== 0
				? this.commentError
				: newComment.value;
		},
	},
});
