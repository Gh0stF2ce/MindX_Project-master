import { makeAutoObservable } from 'mobx';

export default class userStore {
	constructor() {
		this._isAuth = false;
		this._isAdmin = false;
		this._user = {};
		makeAutoObservable(this);
	}

	setIsAuth(value) {
		this._isAuth = value;
	}

	setIsAdmin(value) {
		this._isAdmin = value;
	}

	setUser(value) {
		this._user = value;
	}

	logout() {
		this._isAuth = false;
		this._isAdmin = false;
		this._user = {};
	}

	get isAuth() {
		return this._isAuth;
	}

	get isAdmin() {
		return this._isAdmin;
	}

	get user() {
		return this._user;
	}
}
