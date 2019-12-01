import * as mtypes from './mutation-types';
import util from '../lib/util';
import webext from '../lib/webext';

export const changeProfile = ({ commit }, payload) => {
  commit(mtypes.CHANGE_PROFILE, payload);

  browser.runtime.sendMessage({
    action: 'updateProfile',
    data: payload,
  });
};

export const changeSetting = ({ commit, state }, payload) => {
  commit(mtypes.CHANGE_SETTING, payload);

  if (payload[0].name === 'whitelist.enabledContextMenu') {
    webext.enableContextMenu(payload[0].value);
  } else if (payload[0].name === 'profile.interval.option') {
    browser.runtime.sendMessage({
      action: 'reloadProfile',
      data: payload[0].value,
    });
  } else if (['headers.spoofIP.enabled', 'headers.spoofIP.option', 'headers.spoofIP.rangeFrom'].includes(payload[0].name)) {
    browser.runtime.sendMessage({
      action: 'reloadSpoofIP',
      data: payload,
    });
  } else if (
    [
      'options.cookiePolicy',
      'options.disableWebRTC',
      'options.firstPartyIsolate',
      'options.resistFingerprinting',
      'options.trackingProtectionMode',
      'options.webRTCPolicy',
    ].includes(payload[0].name)
  ) {
    webext.setBrowserConfig(payload[0].name, payload[0].value);
  }
};

export const excludeProfile = ({ commit, state }, payload) => {
  if (typeof payload === 'string') {
    let profileIndex: number = state.excluded.indexOf(payload);
    if (profileIndex > -1) {
      state.excluded.splice(profileIndex, 1);
    } else {
      state.excluded.push(payload);
    }
  } else {
    // check if every profile is in excluded list
    let indexes = payload.map(p => state.excluded.indexOf(p));
    indexes.sort((a, b) => b - a);

    for (let i = 0; i < indexes.length; i++) {
      if (indexes[i] > -1) state.excluded.splice(indexes[i], 1);
    }

    if (indexes.includes(-1)) {
      state.excluded = state.excluded.concat(payload);
    }
  }

  commit(mtypes.UPDATE_EXCLUSIONS, state.excluded);
};

export const initialize = async ({ commit }) => {
  let settings: any = await webext.getSettings(null);

  browser.runtime.sendMessage({
    action: 'tempStore',
  });

  commit(mtypes.INITIALIZE, settings);
};

export const toggleChameleon = ({ commit }, payload) => {
  commit(mtypes.TOGGLE_CHAMELEON, payload);
  webext.enableChameleon(payload);
};

export const toggleNotifications = ({ commit }, payload) => {
  commit(mtypes.TOGGLE_NOTIFICATIONS);
};

export const toggleTheme = ({ commit }, payload) => {
  commit(mtypes.TOGGLE_THEME);
};
