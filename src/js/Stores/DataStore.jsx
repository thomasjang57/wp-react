import AppDispatcher from '../AppDispatcher.jsx';
import AjaxDispatcher from '../AjaxDispatcher.jsx';
import { ActionTypes } from '../Constants.jsx';
import { EventEmitter } from 'events';

class DataStore extends EventEmitter {
	constructor(props){
		super(props);
		let _ = this;
		_.data = {
			wp_vars: [],
			current_page_id: '0',
			'menu_tree': [],
			'pages_cache': []
		};
		AppDispatcher.register(action => {
			switch(action.actionType){
				case ActionTypes.GET_WP_VARS:
					_.data.wp_vars = action.data;
					_.emit('change');
					break;
				case ActionTypes.SET_CURRENT_PAGE_ID:
					_.data.current_page_id = action.id;
					_.emit('onPageChange');
					break;
				case ActionTypes.SET_MENU_TREE:
					console.log('3. In Store -> SET_MENU_TREE');
					_.data.menu_tree = action.items;
					_.emit('onMenuTreeUpdate');
					break;
				default:
			}
		});
		AjaxDispatcher.register(action => {
			switch(action.actionType){
				case ActionTypes.SET_PAGE_IN_CACHE:
					Object.assign(_.data.pages_cache, action.id)
					_.emit('onGetPageByID');
					break;
				case ActionTypes.GET_PAGE_FROM_CACHE:
					_.emit('onGetPageByID');
					_.emit('onPageChange');
					break;
				default:
			}
		});
	}
	getWpVars(){
		return this.data.wp_vars;
	}
	getCurrentPageID(){
		return this.data.current_page_id;
	}
	getMenuTree(){
		return this.data.menu_tree;
	}
	getCachedPage(id){
		let _ = this;
		if(typeof _.data.pages_cache !== 'undefined' && typeof _.data.pages_cache[id] !== 'undefined'){
			return _.data.pages_cache[id];
		} else {
			console.log('pages_cache: ', _.data.pages_cache);
			return false;
		}
	}
}

export default new DataStore();