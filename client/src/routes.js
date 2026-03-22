import { ROUTES } from './utils/consts';
import AdminPage from './pages/Admin/Admin';
import Home from './pages/Home/Home';
import CarouselGame from './pages/CarouselGame/CarouselGame';
import InvadersGame from './pages/InvadersGame/InvadersGame';
import Lobby from './pages/Lobby/Lobby';
import SquareGame from './pages/SquareGame/SquareGame';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SingUp';
import Rating from './pages/Rating/Rating'

export const PUBLIC_ROUTES = [
	{
		path: ROUTES.HOME_ROUTE,
		Component: Home,
	},
	{
		path: ROUTES.SIGNUP_ROUTE,
		Component: SignUp,
	},
	{
		path: ROUTES.SIGNIN_ROUTE,
		Component: SignIn,
	},
];

export const AUTH_ROUTES = [
	{
		path: `${ROUTES.SQUARE_ROUTE}/:id`,
		Component: SquareGame,
	},
	{
		path: `${ROUTES.CAROUSEL_ROUTE}/:id`,
		Component: CarouselGame,
	},
	{
		path: `${ROUTES.INVADERS_ROUTE}/:id`,
		Component: InvadersGame,
	},
	{
		path: ROUTES.CAROUSEL_ROUTE,
		Component: Lobby,
		type: 'carousel',
	},
	{
		path: ROUTES.INVADERS_ROUTE,
		Component: Lobby,
		type: 'invaders',
	},
	{
		path: ROUTES.SQUARE_ROUTE,
		Component: Lobby,
		type: 'square',
	},
	{
		path: ROUTES.RATING_ROUTE,
		Component: Rating,
	}
];

export const ADMIN_ROUTES = [
	{
		path: ROUTES.ADMIN_ROUTE,
		Component: AdminPage,
	},
];
