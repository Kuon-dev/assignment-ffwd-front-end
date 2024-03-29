<template>
	<div
		id="target"
		class="border border-gray-200 px-16 text-black"
		@change="handleInputChange($event)"
	/>
	<v-btn color="#7e81ff" class="text-white" @click="handleSubmit($event)">
		{{ props.status === 'adding' ? 'Submit' : 'Edit' }}
	</v-btn>
	<BaseAlert
		v-if="showAlert"
		:type="showAlertType"
		:title="showAlertTitle"
		:text="showAlertText"
	/>
</template>

<script setup lang="ts">
// import Editor from '@tinymce/tinymce-vue';
import BaseAlert from 'base-components/BaseAlert.vue';
import EditorJS from '@editorjs/editorjs';
import Code from '@editorjs/code';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';

import { useForumStore } from 'stores/ForumStore';

import { handleInputChange } from 'compostables/EditorJsInjector';
import { ref, computed, PropType } from 'vue';
import { apiClient, getToken } from 'stores/BackendAPI';

const forumStore = useForumStore();
const props = defineProps({
	server: {
		type: String,
		default: null,
	},
	title: {
		type: String,
		default: '',
	},
	user: {
		type: Object,
		required: true,
	},
	status: {
		type: String as PropType<'viewing' | 'adding' | 'editing'>,
		default: 'adding',
	},
});

const emits = defineEmits(['text-value']);

const editor = new EditorJS({
	holder: 'target',
	tools: {
		header: Header,
		code: Code,
		paragraph: Paragraph,
		// ...
	},
	data: JSON.parse(
		props.status === 'adding' ? '[]' : forumStore.forum?.forum?.content,
	),
	async onChange(api: any, event: any) {
		const data = await api.saver.save();
		handleInputChange(data);
	},
});

const showAlert = ref<Boolean>(false);
const showAlertTitle = ref<string>('');
const showAlertText = ref<string>('');
const showAlertType = ref<'error' | 'success' | 'warning' | 'info'>('error');
const renderAlert = (
	type: 'error' | 'success' | 'warning' | 'info',
	title: string,
	text: string,
) => {
	showAlertType.value = type ?? 'error';
	showAlertTitle.value = title;
	showAlertText.value = text;
	showAlert.value = true;
	setTimeout(() => {
		showAlert.value = false;
	}, 8000);
};

const handleSubmit = async (e: Event) => {
	e.preventDefault();
	editor
		.save()
		.then(async (output) => {
			if (!props.server) return;
			const res = await apiClient.post(props.server, {
				user_id: props.user.id,
				forum: forumStore.forum?.forum?.id ?? -1,
				title: props.title ?? 'Test title',
				content: output,
			});
			renderAlert(
				'success',
				'Post success',
				'Post has been successfully created',
			);
		})
		.catch((err) => {
			console.log(err);
			renderAlert('error', 'An error occurred', err);
		});
};
</script>

<style lang="scss">
#target {
	h1 {
		font-size: 32px !important;
	}
	h2 {
		font-size: 24px !important;
	}
	h3 {
		font-size: 18.72 !important;
	}
	h4 {
		font-size: 16px !important;
	}
	h5 {
		font-size: 13.28px !important;
	}
	h6 {
		font-size: 12px !important;
	}
}
</style>
