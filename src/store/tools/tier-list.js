export default {
	namespaced: true,
	state: {
		currentCode: '',
	},
	mutations: {
		setCurrentCode (state, code = '') {
			state.currentCode = code;
		},
	},
};
