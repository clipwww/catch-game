export interface MyReBridge {
  /**
   * 取得裝置系統類別
   */
  getDevice: () => string;

  /**
   * 取得裝置Id
   */
  getDeviceID: () => string;

  /**
   * 取得裝置版本
   */
  getClient: () => string;

  /**
   * 取得App版本
   */
  getAppVersion: () => string;

  /**
   * 取得Member Token
   */
  getToken: () => string;

  /**
   * 取得裝置地區
   */
  getClientArea: () => string;

  /**
   * 取得裝置幣別
   */
  getClientCurrency: () => string;

  /**
   * 取得裝置語言
   */
  getClientLanguage: () => string;

  /**
   * 通知App執行動作
   * @param key ref. http://192.168.11.250:10080/RE-APP/devInfo/wikis/home
   * @param value 參數(JSON字串)
   */
  action: (key: number, value: string) => void;

  /**
   * 通知App執行處理（ex. 加密
   */
  notifyApp: (key: string, value: string) => void;

  /**
   * 來自App通知的事件
   */
  eventFromApp?: (key: string, value: string) => void;

}



export interface ResultVM {
  success: boolean;
  resultCode: string;
  resultException: string;
  resultMessage: string;
}


export interface ResultGenericVM<T> extends ResultVM {
  item: T;
}

export interface ResultListGenericVM<T> extends ResultVM {
  items: T[];
}
