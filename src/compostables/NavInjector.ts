import $ from 'jquery';
import { ref, computed } from 'vue';
import router from '@/router';

/* -------------------
 * | This section contains the
 * | variable exports
 * |
 */
export const isChecked = ref(false);
export const isShowSidebar = ref(false);
export const isShowProfile = ref(false);
export const isAdminEditing = ref(false);

export const path = computed(() => {
	return router.currentRoute.value;
});

/* -------------------
 * | This section contains the
 * | functions exports
 * |
 */

export const toggleCheck = () => {
	if (isChecked.value) isChecked.value = false;
	else isChecked.value = true;
};

export const toggleShowSidebar = (value: boolean) => {
	if (value) {
		isShowSidebar.value = value;
		return;
	}
	if (isShowSidebar.value) isShowSidebar.value = false;
	else isShowSidebar.value = true;
};

export const toggleProfileOverlay = (value: boolean) => {
	if (value) {
		isShowProfile.value = value;
		return;
	}
	if (isShowProfile.value) isShowProfile.value = false;
	else isShowProfile.value = true;
};

export const injectRenderNav = () => {
	toggleCheck();
	const navbar = $('#nav');
	/*
	if (isChecked.value) {
	}
	else {
		//navbar.children().last().remove();
	}
  */
};
