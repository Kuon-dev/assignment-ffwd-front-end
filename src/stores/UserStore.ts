import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { getToken, apiClient } from './BackendAPI';
// import { post } from 'jquery';

interface LoginCredentials {
	email: String;
	password: String;
	remember_me: Boolean;
}

interface RegisterCredentials {
	name: String;
	email: String;
	password: String;
	password_confirmation: String;
}

interface ResetPasswordCredentials {
	password: String;
	password_confirmation: String;
	email: any;
	token: any;
}

export interface User {
	id: string | any;
	created_at: string | any;
	email_verified_at: string | any;
	is_banned: string | any;
	updated_at: string | any;
	name: string;
	email: string;
	phone_number: string;
	password: string | any;
	bio: string;
}

interface SingleError {
	message: String;
	status: number | any;
}
export const useUserStore = defineStore('userStore', {
	state: () => ({
		authUser: <User | any>{} || (null as User | any) | (<any>{}),
		authUserAccessLevel: 0,
		authErrors: <any>[] || <any>Object,
	}),
	getters: {
		user: (state) => state.authUser,
		accessLevel: (state) => state.authUserAccessLevel,
		errorList: (state) => state.authErrors,
	},
	actions: {
		async permittedAccessLevel() {
			if (!this.user) this.getUser();
			const userPerms = await apiClient.post('api/user', this.user);
			this.authUserAccessLevel = userPerms?.data?.perm_level;
		},

		async getUser() {
			this.authErrors = [];
			await getToken();
			if (!this.user) return;
			const userData = await apiClient
				.get('api/user')
				.catch((err: AxiosError) => {
					if (err?.response?.status === 401) return;
					const error = err as AxiosError;
					const errorMessage: SingleError = {
						message: (error?.response?.data as any).message,
						status: error?.response?.status,
					};
					this.authErrors = errorMessage;
				});
			if (userData?.data) {
				const userPerms = await apiClient.post('api/user', userData?.data);
				this.authUserAccessLevel = await userPerms?.data?.perm_level;
				this.authUser = userData?.data;
				/*
        if (userPerms.data.perm_level < accessType) {
          (this as any).router.push('/404')
          return
        }

        */
				return userData?.data ?? null;
			}
		},
		async forceGetUser() {
			this.authErrors = [];
			await getToken();
			const userData = await apiClient
				.get('api/user')
				.catch((err: AxiosError) => {
					if (err?.response?.status === 401) return;
					const error = err as AxiosError;
					const errorMessage: SingleError = {
						message: (error?.response?.data as any).message,
						status: error?.response?.status,
					};
					this.authErrors = errorMessage;
				});
			if (userData?.data) {
				const userPerms = await apiClient.post('api/user', userData?.data);
				this.authUserAccessLevel = await userPerms?.data?.perm_level;
				this.authUser = userData?.data;
				/*
        if (userPerms.data.perm_level < accessType) {
          (this as any).router.push('/404')
          return
        }

        */
				return userData?.data ?? null;
			}
		},

		async setNullUser() {
			this.authUser = null;
		},

		async handleRegister(credentials: RegisterCredentials) {
			this.authErrors = [];
			await getToken();
			const res = await apiClient
				.post('/register', {
					name: credentials.name,
					email: credentials.email,
					password: credentials.password,
					password_confirmation: credentials.password_confirmation,
				})
				.then((response) => {
					if (response) return true;
				})
				.catch((err: Error | AxiosError) => {
					const error = err as AxiosError;
					this.authErrors = (error?.response?.data as any).errors;
					return false;
				});
			return res;
		},

		async handleLogin(credentials: LoginCredentials) {
			await getToken();
			this.authErrors = [];
			const res = await apiClient
				.post('/login', {
					email: credentials.email,
					password: credentials.password,
					remember: credentials.remember_me,
				})
				.catch((err: AxiosError) => {
					const error = err as AxiosError;
					console.log(error);
					this.authErrors = (error?.response?.data as any).errors;
					return {
						status: error?.response?.status,
					};
				});
			console.log(this.errorList);
			if (res.status === 204) {
				await this.loginRedirect();
			}

			return res;
		},

		async handleLogout() {
			getToken();
			await apiClient.post('/logout');
			this.authUser = null;
			(this as any).router.push('/');
		},

		async handleForgotPassword(email: String) {
			this.authErrors = [];
			await getToken();
			const res = await apiClient
				.post('/forgot-password', {
					email: email,
				})
				.catch((err: AxiosError) => {
					const error = err as AxiosError;
					this.authErrors = (error?.response?.data as any).errors;
					return {
						status: error?.response?.status,
					};
				});

			return res;
		},

		async handleResetPassword(credentials: ResetPasswordCredentials) {
			this.authErrors = [];
			const res = await apiClient
				.post('/reset-password', credentials)
				.catch((err: AxiosError) => {
					console.log(err);
					this.authErrors = (err?.response?.data as any)?.message;
				});
			return res;
		},

		async handleResendEmailVerification() {
			this.authErrors = [];
			const res = await apiClient.post('/verification-notification');
			return res;
		},

		async loginRedirect() {
			this.authErrors = [];
			await getToken();
			await this.forceGetUser();
			const res = await apiClient.get('/dashboard');
			const route = await (res?.data as any).route;
			if (route) (this as any).router.push(route);
			return true;
		},
		async editUser(newUser: User) {
			await getToken();

			const res = await apiClient
				.post('api/user/update', newUser)
				.catch((err: AxiosError) => {
					const error = err as AxiosError;
					this.authErrors = (error?.response?.data as any).errors;
					return {
						status: error?.response?.status,
					};
				});

			return res;
		},
	},
});
