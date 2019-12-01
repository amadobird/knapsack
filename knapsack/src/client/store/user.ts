import produce from 'immer';
import { KsUserRole, KS_USER_ROLES } from '@knapsack/core/dist/cloud';
import { User, getUserInfo } from '../../cloud/user-utils';
import { Action } from './types';

export interface UserState {
  role?: KsUserRole;
  canEdit?: boolean;
  isLocalDev?: boolean;
  user?: User;
}

const USER_UPDATE = 'knapsack/user/update';
interface UserUpdate extends Action {
  type: typeof USER_UPDATE;
  payload: UserState;
}
function updateUserState(userState: UserState): UserUpdate {
  return {
    type: USER_UPDATE,
    payload: userState,
  };
}

const initialState: UserState = {
  role: KS_USER_ROLES.anonymous,
  canEdit: false,
  isLocalDev: false,
};

export function updateUser() {
  return async dispatch => {
    const { user, canEdit, role } = await getUserInfo();
    // console.log('updateUser', { canEdit, user, role, groups, ksRepoAccess });
    dispatch(
      updateUserState({
        user,
        canEdit,
        role,
      }),
    );
  };
}

type Actions = UserUpdate;

export default function reducer(
  state = initialState,
  action: Actions,
): UserState {
  switch (action.type) {
    case USER_UPDATE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return {
        ...initialState,
        ...state,
      };
  }
}
